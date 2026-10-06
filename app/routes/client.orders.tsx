import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import ClientLayout from "~/components/client/ClientLayout";
import OrderDetailsModal from "~/components/client/OrderDetailsModal";
import {
  Eye, Download, Package, AlertCircle,
  ChevronDown, ChevronUp, ShoppingBag, TrendingUp, CheckCircle, Clock
} from "lucide-react";
import { readToken } from "~/utils/session.server";
import { API_BASE } from "~/utils/auth.server";

export const meta: MetaFunction = () => [
  { title: "Mes Commandes - Adawi" },
  { name: "description", content: "Historique de vos commandes" },
];

interface OrderItem {
  product_id: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
  name: string;
}
interface Address {
  street: string;
  city: string;
  postal_code: string;
  country: string;
  phone: string;
}
interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  address: Address;
  total: number;
  status: string;
  payment_status: string;
  status_history: any[];
  payment_method: string;
  delivery_method: string;
  delivery_status: string;
  created_at: string;
  updated_at: string;
}
interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
}
interface LoaderData {
  orders: Order[];
  user: User | null;
  token: string | null;
  error?: string;
  debug?: any;
}

export const loader: LoaderFunction = async ({ request }) => {
  const tokenData = await readToken(request);
  if (!tokenData) throw new Response("Non autorisé", { status: 401 });

  try {
    let token: string;
    try {
      const parsedToken = typeof tokenData === "string" ? JSON.parse(tokenData) : tokenData;
      token = parsedToken?.access_token || tokenData;
    } catch {
      token = tokenData as string;
    }
    if (!token) return json<LoaderData>({ orders: [], user: null, token: null, error: "Token invalide" });

    const userRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    const user = userRes.ok ? await userRes.json() : null;

    const ordersRes = await fetch(`${API_BASE}/orders/`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });

    if (!ordersRes.ok) {
      let errorMessage = `Erreur ${ordersRes.status}`;
      try { const e = await ordersRes.json(); errorMessage = e.detail || e.message || errorMessage; } catch {}
      return json<LoaderData>({ orders: [], user, token: tokenData, error: errorMessage });
    }

    const orders = await ordersRes.json();
    return json<LoaderData>({ orders: orders || [], user, token: tokenData });
  } catch (error: any) {
    return json<LoaderData>({ orders: [], user: null, token: null, error: `Erreur: ${error.message}` });
  }
};

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[#FAFAF8] text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 transition";
const labelCls = "block text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide mb-1.5";

export default function ClientOrders() {
  const { orders, user, error, debug, token } = useLoaderData<LoaderData>();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const toggleOrderExpansion = (orderId: string) => {
    const s = new Set(expandedOrders);
    s.has(orderId) ? s.delete(orderId) : s.add(orderId);
    setExpandedOrders(s);
  };

  const handleViewDetails = (order: Order) => { setSelectedOrder(order); setIsModalOpen(true); };

  const generateInvoicePDF = (order: Order, user: User | null) => `
    <!DOCTYPE html><html><head><meta charset="utf-8"><title>Facture ${order.id}</title>
    <style>
      body{font-family:Arial,sans-serif;margin:0;padding:20px;color:#333;line-height:1.6}
      .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:30px;border-bottom:2px solid #C9A96E;padding-bottom:20px}
      .logo{font-size:24px;font-weight:bold;color:#8B5E3C}
      .invoice-number{font-size:18px;font-weight:bold;color:#C9A96E}
      .section{margin:20px 0}
      .section-title{font-size:16px;font-weight:bold;color:#8B5E3C;margin-bottom:10px;border-bottom:1px solid #eee;padding-bottom:5px}
      .info-box{background:#f9f9f9;padding:15px;border-radius:5px;margin:10px 0}
      table{width:100%;border-collapse:collapse;margin:20px 0}
      th,td{border:1px solid #ddd;padding:12px;text-align:left}
      th{background:#8B5E3C;color:white}
      tr:nth-child(even){background:#f9f9f9}
      .total{text-align:right;margin-top:20px;padding:15px;background:#f0f0f0;border-radius:5px}
      .total-amount{font-size:20px;font-weight:bold;color:#8B5E3C}
      footer{margin-top:40px;text-align:center;font-size:12px;color:#666;border-top:1px solid #eee;padding-top:20px}
    </style></head><body>
    <div class="header"><div class="logo">ADAWI</div>
    <div><div class="invoice-number">Facture #${order.id.slice(-8)}</div><div>Date: ${formatDate(order.created_at)}</div></div></div>
    <div class="section"><div class="section-title">Client</div>
    <div class="info-box"><strong>${user?.full_name || "Client"}</strong><br>${user?.email || ""}
    <br>${order.address.street}<br>${order.address.postal_code} ${order.address.city}
    <br>${order.address.country}${order.address.phone ? `<br>Tél: ${order.address.phone}` : ""}</div></div>
    <div class="section"><div class="section-title">Commande</div>
    <div class="info-box">
    <div><strong>N°:</strong> ${order.id}</div>
    <div><strong>Date:</strong> ${formatDate(order.created_at)}</div>
    <div><strong>Statut:</strong> ${getStatusLabel(order.status)}</div>
    <div><strong>Paiement:</strong> ${order.payment_status}</div>
    </div></div>
    <div class="section"><div class="section-title">Articles</div>
    <table><thead><tr><th>Article</th><th>Détails</th><th>Qté</th><th>Prix unit.</th><th>Total</th></tr></thead>
    <tbody>${order.items.map(i => `<tr><td>${i.name}</td><td>${i.size ? `Taille: ${i.size}` : ""}${i.size && i.color ? "<br>" : ""}${i.color ? `Couleur: ${i.color}` : ""}</td><td>${i.quantity}</td><td>${formatPrice(i.price / i.quantity)}</td><td>${formatPrice(i.price)}</td></tr>`).join("")}
    </tbody></table></div>
    <div class="total"><div class="total-amount">Total: ${formatPrice(order.total)}</div></div>
    <footer><p>Merci pour votre commande — ADAWI</p></footer>
    </body></html>`;

  const handleDownloadInvoice = async (order: Order) => {
    setDownloadingInvoice(order.id);
    try {
      const html = generateInvoicePDF(order, user);
      const blob = new Blob([html], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `facture-${order.id.slice(-8)}.html`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      const w = window.open("", "_blank");
      if (w) { w.document.write(html); w.document.close(); w.onload = () => setTimeout(() => w.print(), 500); }
    } catch { alert("Erreur lors de la génération."); } finally { setDownloadingInvoice(null); }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "livree": case "delivered": return "bg-[#6B8F71]/10 text-[#6B8F71] border-[#6B8F71]/20";
      case "en_cours": case "processing": return "bg-blue-50 text-blue-700 border-blue-200";
      case "en_preparation": case "preparing": return "bg-amber-50 text-amber-700 border-amber-200";
      case "annulee": case "cancelled": return "bg-red-50 text-[#C0392B] border-red-200";
      case "en_attente": case "pending": return "bg-orange-50 text-orange-700 border-orange-200";
      default: return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case "en_cours": return "En cours"; case "en_preparation": return "En préparation";
      case "en_attente": return "En attente"; case "delivered": case "livree": return "Livré";
      case "cancelled": case "annulee": return "Annulé"; case "processing": return "En traitement";
      case "preparing": return "En préparation"; case "pending": return "En attente";
      default: return status;
    }
  };

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit" }); }
    catch { return d; }
  };

  const formatPrice = (p: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(p);

  const delivered = orders.filter(o => o.status === "livree" || o.status === "delivered").length;
  const inProgress = orders.filter(o => o.status === "en_cours" || o.status === "processing").length;
  const totalAmount = orders.reduce((s, o) => s + o.total, 0);

  return (
    <ClientLayout userName={user?.full_name}>
      <div className="min-h-screen bg-[#FAFAF8] space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#8B5E3C]/10 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-[#8B5E3C]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1A1A1A] uppercase tracking-wide">Mes Commandes</h1>
              <p className="text-xs text-[#6B6B6B]">Historique et suivi de vos commandes</p>
            </div>
          </div>
          {orders.length > 0 && (
            <span className="rounded-full bg-[#8B5E3C]/10 text-[#8B5E3C] text-xs font-semibold px-3 py-1">
              {orders.length} commande{orders.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex gap-3 items-start bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4 text-[#C0392B] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[#C0392B] font-medium">{error}</p>
              {debug && (
                <details className="mt-1">
                  <summary className="text-red-500 text-xs cursor-pointer">Détails</summary>
                  <pre className="text-xs mt-1 overflow-auto bg-red-100 p-2 rounded">{JSON.stringify(debug, null, 2)}</pre>
                </details>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        {orders.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Total commandes", value: orders.length, icon: ShoppingBag, color: "text-[#8B5E3C]", bg: "bg-[#8B5E3C]/10" },
              { label: "Livrées", value: delivered, icon: CheckCircle, color: "text-[#6B8F71]", bg: "bg-[#6B8F71]/10" },
              { label: "En cours", value: inProgress, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Montant total", value: formatPrice(totalAmount), icon: TrendingUp, color: "text-[#C9A96E]", bg: "bg-[#C9A96E]/10" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div>
                  <p className="text-xs text-[#6B6B6B]">{label}</p>
                  <p className={`text-sm font-bold ${color}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!error && orders.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#8B5E3C]/10 flex items-center justify-center mx-auto mb-4">
              <Package className="w-7 h-7 text-[#8B5E3C]" />
            </div>
            <h3 className="text-sm font-bold text-[#1A1A1A] mb-1">Aucune commande</h3>
            <p className="text-xs text-[#6B6B6B] mb-6">Vous n'avez pas encore passé de commande.</p>
            <a href="/boutique" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8B5E3C] text-white text-sm font-bold rounded-xl hover:bg-[#5C3D1E] transition">
              <ShoppingBag className="w-4 h-4" />
              Découvrir nos produits
            </a>
          </div>
        )}

        {/* Orders list */}
        {!error && orders.length > 0 && (
          <div className="space-y-3">
            {orders.map(order => {
              const expanded = expandedOrders.has(order.id);
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Header row */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#8B5E3C]/10 flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-[#8B5E3C]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#1A1A1A]">#{order.id.slice(-8)}</p>
                        <p className="text-xs text-[#6B6B6B]">{formatDate(order.created_at)} · {order.items.length} article{order.items.length > 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`rounded-full text-xs font-semibold px-3 py-1 border ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                      <span className="text-sm font-bold text-[#8B5E3C]">{formatPrice(order.total)}</span>
                      <button
                        onClick={() => toggleOrderExpansion(order.id)}
                        className="sm:hidden ml-1 p-1.5 rounded-lg hover:bg-gray-50 transition"
                      >
                        {expanded ? <ChevronUp className="w-4 h-4 text-[#6B6B6B]" /> : <ChevronDown className="w-4 h-4 text-[#6B6B6B]" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable body */}
                  <div className={`${expanded ? "block" : "hidden"} sm:block border-t border-gray-100`}>
                    <div className="p-4 space-y-4">
                      {/* Items */}
                      <div>
                        <p className={labelCls}>Articles commandés</p>
                        <div className="space-y-1.5">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-2.5 bg-[#FAFAF8] rounded-xl">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-xs font-medium text-[#1A1A1A] truncate">{item.name}</span>
                                <div className="flex gap-1">
                                  <span className="bg-white border border-gray-200 text-xs px-1.5 py-0.5 rounded-lg">×{item.quantity}</span>
                                  {item.size && <span className="bg-white border border-gray-200 text-xs px-1.5 py-0.5 rounded-lg">{item.size}</span>}
                                  {item.color && <span className="bg-white border border-gray-200 text-xs px-1.5 py-0.5 rounded-lg">{item.color}</span>}
                                </div>
                              </div>
                              <span className="text-xs font-semibold text-[#8B5E3C] flex-shrink-0">{formatPrice(item.price)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Address + meta */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {order.address && (
                          <div className="p-3 bg-[#FAFAF8] rounded-xl">
                            <p className={labelCls}>Adresse de livraison</p>
                            <p className="text-xs text-[#1A1A1A]">{order.address.street}</p>
                            <p className="text-xs text-[#6B6B6B]">{order.address.postal_code} {order.address.city}, {order.address.country}</p>
                            {order.address.phone && <p className="text-xs text-[#6B6B6B]">Tél: {order.address.phone}</p>}
                          </div>
                        )}
                        <div className="p-3 bg-[#FAFAF8] rounded-xl space-y-1.5">
                          <p className={labelCls}>Informations</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[#6B6B6B]">Paiement</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${order.payment_status === "paid" || order.payment_status === "effectue" ? "bg-[#6B8F71]/10 text-[#6B8F71]" : "bg-orange-50 text-orange-700"}`}>
                              {order.payment_status === "en_attente" ? "En attente" : order.payment_status === "paid" ? "Payé" : order.payment_status}
                            </span>
                          </div>
                          {order.payment_method && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-[#6B6B6B]">Méthode</span>
                              <span className="text-xs text-[#1A1A1A]">{order.payment_method}</span>
                            </div>
                          )}
                          {order.delivery_method && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-[#6B6B6B]">Livraison</span>
                              <span className="text-xs text-[#1A1A1A]">{order.delivery_method}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-4 py-3 bg-[#F5F5F0] border-t border-gray-100 flex justify-end gap-2">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#1A1A1A] bg-white border border-gray-200 rounded-xl hover:border-[#8B5E3C] hover:text-[#8B5E3C] transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Voir détails
                      </button>
                      <button
                        onClick={() => handleDownloadInvoice(order)}
                        disabled={downloadingInvoice === order.id}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#8B5E3C] rounded-xl hover:bg-[#5C3D1E] transition disabled:opacity-50"
                      >
                        {downloadingInvoice === order.id ? (
                          <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Génération...</>
                        ) : (
                          <><Download className="w-3.5 h-3.5" />Facture</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedOrder && (
          <OrderDetailsModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            order={selectedOrder}
            token={token}
            onAuthError={() => { window.location.href = "/login"; }}
          />
        )}
      </div>
    </ClientLayout>
  );
}

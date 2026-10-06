import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useState } from "react";
import { useLoaderData } from "@remix-run/react";
import ClientLayout from "~/components/client/ClientLayout";
import { Plus, MessageSquare, Clock, CheckCircle, AlertCircle, X, Tag, Flag } from "lucide-react";
import { readToken } from "~/utils/session.server";

export const meta: MetaFunction = () => [
  { title: "Support - Adawi" },
  { name: "description", content: "Centre d'aide et tickets de support" },
];

interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  order_id?: string;
  created_at: string;
  updated_at: string;
  messages_count: number;
  last_message_at?: string;
}
interface Order {
  id: string;
  created_at: string;
  total: number;
}
interface User {
  id: string;
  email: string;
  full_name: string;
}
interface LoaderData {
  tickets: Ticket[];
  orders: Order[];
  user: User | null;
  token: string;
  error?: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const tokenData = await readToken(request);
    if (!tokenData) throw new Response("Non autorisé", { status: 401 });

    const token =
      typeof tokenData === "string"
        ? (() => { try { return JSON.parse(tokenData)?.access_token || tokenData; } catch { return tokenData; } })()
        : tokenData;

    if (!token) throw new Response("Token invalide", { status: 401 });

    const [userRes, ticketsRes, ordersRes] = await Promise.all([
      fetch("http://localhost:8000/auth/me", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("http://localhost:8000/support/tickets", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("http://localhost:8000/orders/", { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    const user = userRes.ok ? await userRes.json() : null;
    const tickets = ticketsRes.ok ? await ticketsRes.json() : [];
    const orders = ordersRes.ok ? await ordersRes.json() : [];

    return json<LoaderData>({ tickets, orders, user, token });
  } catch (err: any) {
    return json<LoaderData>({ tickets: [], orders: [], user: null, token: "", error: err.message || "Erreur serveur" });
  }
};

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[#FAFAF8] text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 transition";
const labelCls = "block text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide mb-1.5";

export default function ClientTickets() {
  const { tickets, orders, user, token, error } = useLoaderData<LoaderData>();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "", description: "", category: "commande", priority: "normale",
    order_id: orders.length > 0 ? orders[0].id : "",
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ticketsList, setTicketsList] = useState<Ticket[]>(tickets);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("http://localhost:8000/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json();
        setSubmitError(err.detail?.[0]?.msg || "Erreur lors de la création");
      } else {
        const newTicket = await res.json();
        setTicketsList([newTicket, ...ticketsList]);
        setShowCreateForm(false);
        setFormData({ title: "", description: "", category: "commande", priority: "normale", order_id: orders.length > 0 ? orders[0].id : "" });
      }
    } catch (err: any) {
      setSubmitError(err.message || "Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "ouvert": case "open": return <AlertCircle className="w-3.5 h-3.5" />;
      case "en_cours": case "in_progress": return <Clock className="w-3.5 h-3.5" />;
      case "résolu": case "resolved": case "fermé": case "closed": return <CheckCircle className="w-3.5 h-3.5" />;
      default: return <MessageSquare className="w-3.5 h-3.5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "ouvert": case "open": return "bg-red-50 text-[#C0392B] border-red-200";
      case "en_cours": case "in_progress": return "bg-blue-50 text-blue-700 border-blue-200";
      case "résolu": case "resolved": case "fermé": case "closed": return "bg-[#6B8F71]/10 text-[#6B8F71] border-[#6B8F71]/20";
      default: return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "haute": return "bg-red-50 text-[#C0392B]";
      case "normale": return "bg-amber-50 text-amber-700";
      case "basse": return "bg-[#6B8F71]/10 text-[#6B8F71]";
      default: return "bg-gray-50 text-gray-600";
    }
  };

  const getCategoryLabel = (cat: string) => {
    const map: Record<string, string> = { commande: "Commande", livraison: "Livraison", produit: "Produit", paiement: "Paiement", technique: "Technique", autre: "Autre" };
    return map[cat] || cat;
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString("fr-FR") : "N/A";

  return (
    <ClientLayout userName={user?.full_name}>
      <div className="min-h-screen bg-[#FAFAF8] space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#8B5E3C]/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#8B5E3C]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1A1A1A] uppercase tracking-wide">Centre de Support</h1>
              <p className="text-xs text-[#6B6B6B]">Créez et suivez vos demandes d'assistance</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#8B5E3C] text-white text-sm font-bold rounded-xl hover:bg-[#5C3D1E] transition"
          >
            <Plus className="w-4 h-4" />
            Nouveau ticket
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex gap-3 items-start bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4 text-[#C0392B] mt-0.5 flex-shrink-0" />
            <p className="text-[#C0392B]">{error}</p>
          </div>
        )}

        {/* Create modal */}
        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wide">Nouveau ticket</h2>
                <button onClick={() => setShowCreateForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
                  <X className="w-4 h-4 text-[#6B6B6B]" />
                </button>
              </div>

              {submitError && (
                <div className="mx-5 mt-4 flex gap-2 items-start bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-xs text-[#C0392B]">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className={labelCls}>Titre</label>
                  <input name="title" value={formData.title} onChange={handleChange} required className={inputCls} placeholder="Décrivez votre problème en quelques mots" />
                </div>

                <div>
                  <label className={labelCls}>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} required rows={3} className={inputCls} placeholder="Expliquez votre situation en détail..." />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Catégorie</label>
                    <select name="category" value={formData.category} onChange={handleChange} className={inputCls}>
                      <option value="commande">Commande</option>
                      <option value="livraison">Livraison</option>
                      <option value="produit">Produit</option>
                      <option value="paiement">Paiement</option>
                      <option value="technique">Technique</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Priorité</label>
                    <select name="priority" value={formData.priority} onChange={handleChange} className={inputCls}>
                      <option value="normale">Normale</option>
                      <option value="haute">Haute</option>
                      <option value="basse">Basse</option>
                    </select>
                  </div>
                </div>

                {orders.length > 0 && (
                  <div>
                    <label className={labelCls}>Commande associée</label>
                    <select name="order_id" value={formData.order_id} onChange={handleChange} className={inputCls}>
                      {orders.map(o => (
                        <option key={o.id} value={o.id}>#{o.id.slice(-8)} — {new Date(o.created_at).toLocaleDateString("fr-FR")}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setShowCreateForm(false)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-[#6B6B6B] bg-[#F5F5F0] rounded-xl hover:bg-gray-100 transition">
                    Annuler
                  </button>
                  <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-[#8B5E3C] rounded-xl hover:bg-[#5C3D1E] transition disabled:opacity-50">
                    {submitting ? "Création..." : "Créer le ticket"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Empty state */}
        {ticketsList.length === 0 && !error && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#8B5E3C]/10 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-7 h-7 text-[#8B5E3C]" />
            </div>
            <h3 className="text-sm font-bold text-[#1A1A1A] mb-1">Aucun ticket</h3>
            <p className="text-xs text-[#6B6B6B] mb-5">Vous n'avez pas encore créé de ticket de support.</p>
            <button onClick={() => setShowCreateForm(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8B5E3C] text-white text-sm font-bold rounded-xl hover:bg-[#5C3D1E] transition">
              <Plus className="w-4 h-4" />
              Créer mon premier ticket
            </button>
          </div>
        )}

        {/* Tickets list */}
        {ticketsList.length > 0 && (
          <div className="space-y-3">
            {ticketsList.map(ticket => (
              <div key={ticket.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#8B5E3C]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MessageSquare className="w-4 h-4 text-[#8B5E3C]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#1A1A1A]">
                        #{ticket.id.slice(-8)} — {ticket.title}
                      </p>
                      <p className="text-xs text-[#6B6B6B] mt-0.5 line-clamp-2">{ticket.description}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-[#6B6B6B]">
                          <Tag className="w-3 h-3" />
                          {getCategoryLabel(ticket.category)}
                        </span>
                        {ticket.order_id && (
                          <span className="text-xs text-[#6B6B6B]">· Commande #{ticket.order_id.slice(-8)}</span>
                        )}
                        <span className="text-xs text-[#6B6B6B]">· {formatDate(ticket.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className={`flex items-center gap-1 rounded-full text-xs font-semibold px-3 py-1 border ${getStatusColor(ticket.status)}`}>
                      {getStatusIcon(ticket.status)}
                      {ticket.status}
                    </span>
                    <span className={`rounded-full text-xs font-semibold px-3 py-1 ${getPriorityColor(ticket.priority)}`}>
                      <Flag className="w-3 h-3 inline mr-0.5" />
                      {ticket.priority}
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-xs text-[#6B6B6B]">{ticket.messages_count} message{ticket.messages_count !== 1 ? "s" : ""}</span>
                  {ticket.last_message_at && (
                    <span className="text-xs text-[#6B6B6B]">Dernier message : {formatDate(ticket.last_message_at)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ClientLayout>
  );
}

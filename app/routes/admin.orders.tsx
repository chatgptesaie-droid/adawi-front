import { useState, useMemo } from "react";
import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Search, Eye, Package, XCircle, CheckCircle, Clock, Truck, AlertCircle, BarChart3
} from "lucide-react";
import ViewOrderModal from "~/components/admin/ViewOrderModal";
import UpdateStatusModal from "~/components/admin/UpdateStatusModal";
import { readToken } from "~/utils/session.server";

export const meta: MetaFunction = () => [
  { title: "Commandes - Adawi Admin" },
  { name: "description", content: "Gestion des commandes" },
];

export interface Order { 
  id: string;
  items: Array<{
    product_id: string;
    quantity: number;
    size?: string;
    color?: string;
    price: number;
    name: string;
  }>;
  address: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
    phone: string;
  };
  total: number;
  status: string;
  payment_status: string;
  payment_method: string;
  delivery_method: string;
  delivery_status: string;
  status_history?: any[];
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface LoaderData {
  orders: Order[];
  token: string;
  error?: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const tokenData = await readToken(request);
    if (!tokenData) throw new Response("Non autorisé", { status: 401 });

    const token = typeof tokenData === "string"
      ? (() => {
        try { return JSON.parse(tokenData)?.access_token || tokenData }
        catch { return tokenData }
      })()
      : tokenData;

    const res = await fetch("http://localhost:8000/orders/", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Erreur lors de la récupération des commandes");

    const orders: Order[] = await res.json();
    return json<LoaderData>({ orders, token });
  } catch (err: any) {
    console.error("Erreur loader orders:", err);
    return json<LoaderData>({ orders: [], token: "", error: err.message || "Erreur serveur" });
  }
};

export default function AdminOrders() {
  const { orders: initialOrders, token, error } = useLoaderData<LoaderData>();

  // === STATES ===
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // === CALCUL DES STATS ===
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const livrees = orders.filter(o => o.status === "livré" || o.status === "livree").length;
    const enCours = orders.filter(o => o.status === "en_cours").length;
    const annulees = orders.filter(o => o.status === "annulé" || o.status === "annulee").length;
    const totalMontant = orders
      .filter(o => o.status !== "annulé" && o.status !== "annulee")
      .reduce((sum, o) => sum + o.total, 0);

    return { totalOrders, livrees, enCours, annulees, totalMontant };
  }, [orders]);


  // === FILTRAGE ===
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    let matchesDate = true;
    const orderDate = new Date(order.created_at);
    const today = new Date();
    const sevenDaysAgo = new Date(today); sevenDaysAgo.setDate(today.getDate() - 7);
    const thirtyDaysAgo = new Date(today); thirtyDaysAgo.setDate(today.getDate() - 30);

    if (dateFilter === "today") matchesDate = orderDate.toDateString() === today.toDateString();
    else if (dateFilter === "week") matchesDate = orderDate >= sevenDaysAgo;
    else if (dateFilter === "month") matchesDate = orderDate >= thirtyDaysAgo;

    return matchesSearch && matchesStatus && matchesDate;
  });

  // === ACTIONS ===
  const openViewModal = async (order: Order) => {
    try {
      const res = await fetch(`http://localhost:8000/orders/${order.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Impossible de récupérer les détails de la commande");
      const fullOrder: Order = await res.json();
      setSelectedOrder(fullOrder);
      setIsViewModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const openUpdateStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setIsUpdateStatusModalOpen(true);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:8000/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Erreur lors de la mise à jour du statut");

      const updatedOrder: Order = await res.json();
      setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
      setIsUpdateStatusModalOpen(false);
    } catch (err) {
      console.error("Erreur update status:", err);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "livré": case "livree":
        return { icon: <CheckCircle className="w-4 h-4" />, color: "bg-green-100 text-green-800" };
      case "en_cours":
        return { icon: <Truck className="w-4 h-4" />, color: "bg-blue-100 text-blue-800" };
      case "en_preparation":
        return { icon: <Package className="w-4 h-4" />, color: "bg-blue-100 text-blue-800" };
      case "en_attente":
        return { icon: <Clock className="w-4 h-4" />, color: "bg-gray-100 text-gray-800" };
      case "annulé": case "annulee":
        return { icon: <XCircle className="w-4 h-4" />, color: "bg-red-100 text-red-800" };
      default:
        return { icon: <AlertCircle className="w-4 h-4" />, color: "bg-gray-100 text-gray-800" };
    }
  };
const getPayementInfo = (status: string) => {
    switch (status) {
      case "effectué": case "effectue":
        return { icon: <CheckCircle className="w-4 h-4" />, color: "bg-green-100 text-green-800" }; 
      case "en_attente":
        return { icon: <Clock className="w-4 h-4" />, color: "bg-gray-100 text-gray-800" };
      case "échoué": case "echoue":
        return { icon: <XCircle className="w-4 h-4" />, color: "bg-red-100 text-red-800" };
      default:
        return { icon: <AlertCircle className="w-4 h-4" />, color: "bg-gray-100 text-gray-800" };
    }
};


  return (
    <div className="space-y-6">
      {error && <div className="text-red-600">{error}</div>}

      {/* === STATS HEADER === */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 bg-white rounded-xl shadow flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-indigo-500" />
          <div>
            <p className="text-sm text-gray-500">Total commandes</p>
            <p className="text-lg font-bold">{stats.totalOrders}</p>
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl shadow flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <div>
            <p className="text-sm text-gray-500">Livrées</p>
            <p className="text-lg font-bold">{stats.livrees}</p>
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl shadow flex items-center gap-3">
          <Truck className="w-6 h-6 text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">En cours</p>
            <p className="text-lg font-bold">{stats.enCours}</p>
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl shadow flex items-center gap-3">
          <XCircle className="w-6 h-6 text-red-500" />
          <div>
            <p className="text-sm text-gray-500">Annulées</p>
            <p className="text-lg font-bold">{stats.annulees}</p>
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl shadow flex items-center gap-3 col-span-2 md:col-span-1">
          <Clock className="w-6 h-6 text-yellow-500" />
          <div>
            <p className="text-sm text-gray-500">Montant total</p>
            <p className="text-lg font-bold">{stats.totalMontant.toLocaleString("fr-FR")} F CFA</p>
          </div>
        </div>
      </div>

      {/* Recherche + filtres */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par ID ou utilisateur..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 pr-3 py-2 border rounded-lg w-full"
          />
          {searchTerm && <XCircle onClick={() => setSearchTerm("")} className="absolute right-3 top-3 w-5 h-5 text-gray-400 cursor-pointer" />}
        </div>

        <button onClick={() => setShowFilters(!showFilters)} className="px-4 py-2 border rounded-lg">Filtres</button>
      </div>

      {showFilters && (
        <div className="flex gap-4 mt-2">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg px-2 py-1">
            <option value="all">Tous les statuts</option>
            <option value="livré">Livré</option>
            <option value="en_cours">En cours</option>
            <option value="en preparation">en preparation</option>
            <option value="en_attente">En attente</option>
            <option value="annulé">Annulé</option>
          </select>

          <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="border rounded-lg px-2 py-1">
            <option value="all">Toutes les dates</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">7 derniers jours</option>
            <option value="month">30 derniers jours</option>
          </select>
        </div>
      )}
      {/* Table */}
      <table className="w-full mt-4 border-collapse border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="border px-4 py-2 text-left">ID</th>
            <th className="border px-4 py-2 text-left">Statut</th>
            <th className="border px-4 py-2 text-left">Paiement</th>
            <th className="border px-4 py-2 text-left">Méthode</th>
            <th className="border px-4 py-2 text-left">Date</th>
            <th className="border px-4 py-2 text-left">Total</th>
            <th className="border px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length > 0 ? filteredOrders.map(order => {
            const statusInfo = getStatusInfo(order.status);
            const payementInfo = getPayementInfo(order.payment_status);
            return (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{order.id}</td>
                <td className="border px-4 py-2">
                  <span className={`px-2 py-1 rounded-full ${statusInfo.color} inline-flex items-center`}>
                    {statusInfo.icon}<span className="ml-1">{order.status}</span>
                  </span>
                </td>
                {/* <td className="border px-4 py-2">{order.payment_status}</td> */}
                <td className="border px-4 py-2">
                  <span className={`px-2 py-1 rounded-full ${payementInfo.color} inline-flex items-center`}>
                    {payementInfo.icon}<span className="ml-1">{order.payment_status}</span>
                  </span>
                </td>
                <td className="border px-4 py-2">{order.payment_method}</td>
                <td className="border px-4 py-2">{new Date(order.created_at).toLocaleDateString("fr-FR")}</td>
                <td className="border px-4 py-2">{order.total} F CFA</td>
                <td className="border px-4 py-2 flex gap-2">
                  <button onClick={() => openViewModal(order)} className="text-blue-500"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => openUpdateStatusModal(order)} className="text-green-500"><Package className="w-4 h-4" /></button>
                </td>
              </tr>
            );
          }) : (
            <tr>
              <td colSpan={7} className="text-center py-4">Aucune commande trouvée</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modals */}
      {selectedOrder && (
        <ViewOrderModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          orderId={selectedOrder?.id || null}
          token={token}
        />
      )}
      {selectedOrder && (
        <UpdateStatusModal
          isOpen={isUpdateStatusModalOpen}
          onClose={() => setIsUpdateStatusModalOpen(false)}
          orderId={selectedOrder?.id || null}
          currentStatus={selectedOrder?.status}
          token={token}
          onUpdated={(updated) => {
            setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
          }}
        />
      )}
    </div>
  );
}

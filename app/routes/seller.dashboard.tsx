import type { LoaderFunctionArgs } from "@remix-run/node";
import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { requireVendor } from "~/utils/auth.server";
import SellerLayout from "~/components/seller/SellerLayout";
import { readToken } from "~/utils/session.server";
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Bell
} from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard Vendeur - Adawi" },
    { name: "description", content: "Tableau de bord vendeur avec statistiques complètes" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireVendor(request);

  try {
    const token = await readToken(request);
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch("http://localhost:8000/dashboard/vendeur", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const dashboardData = await response.json();
    return json({ user, dashboardData });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    // Return empty data or handle error
    return json({
      user,
      dashboardData: {
        total_revenue: 0,
        total_orders: 0,
        total_products: 0,
        top_products: [],
        recent_orders: [],
        orders_by_status: [],
        average_order_value: 0,
        pending_orders: [],
        total_orders_today: 0,
        total_orders_week: 0,
        total_revenue_today: 0,
        total_revenue_week: 0,
        total_revenue_month: 0,
        total_orders_month: 0
      }
    });
  }
};

// Interfaces pour les données du dashboard
interface TopProduct {
  product_id: string;
  name: string;
  total_quantity: number;
  total_revenue: number;
}

interface RecentOrder {
  order_id: string;
  user_name: string;
  total: number;
  status: string;
  created_at: string;
}

interface OrderByStatus {
  status: string;
  count: number;
}

interface PendingOrder {
  order_id: string;
  user_name: string;
  status: string;
  created_at: string;
  total: number;
}

interface DashboardData {
  total_revenue: number;
  total_orders: number;
  total_products: number;
  top_products: TopProduct[];
  recent_orders: RecentOrder[];
  orders_by_status: OrderByStatus[];
  average_order_value: number;
  pending_orders: PendingOrder[];
  total_orders_today: number;
  total_orders_week: number;
  total_revenue_today: number;
  total_revenue_week: number;
  total_revenue_month: number;
  total_orders_month: number;
}

export default function SellerDashboard() {
  const { user, dashboardData } = useLoaderData<typeof loader>();

  const [activePeriod, setActivePeriod] = useState<'mois' | 'week' | 'day'>('mois');
  const [showDetails, setShowDetails] = useState(true);

  // Formater la devise
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'livré':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'en attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
      case 'en cours':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
      case 'annulé':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'livré':
        return <CheckCircle className="w-3 h-3" />;
      case 'pending':
      case 'en attente':
        return <Clock className="w-3 h-3" />;
      case 'processing':
      case 'en cours':
        return <RefreshCw className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  return (
    <SellerLayout userName={user.full_name}>
      <h1 className="text-2xl font-bold">Tableau de bord du Vendeur</h1>
      <div className="min-h-screen bg-gradient-to-br from-adawi-beige via-white to-adawi-beige/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header avec gradient */}
          <div className="bg-gradient-to-r from-adawi-brown to-adawi-gold rounded-2xl shadow-xl p-8 mb-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Bonjour, {user.full_name} 
                </h1>
                <p className="text-adawi-beige/90 text-lg">
                  Voici un aperçu de vos performances commerciales
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center px-4 py-3 bg-white text-adawi-brown rounded-xl hover:bg-adawi-beige transition-all duration-200 shadow-lg font-medium"
                >
                  {showDetails ? '>' : '<'}
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center px-6 py-3 bg-white text-adawi-brown rounded-xl hover:bg-adawi-beige transition-all duration-200 shadow-lg font-medium"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Actualiser
                </button>
              </div>
            </div>
          </div>

          {dashboardData ? (
            <>
              {/* Period Tabs */}
              <div className="flex justify-center mb-6">
                <div className="bg-white rounded-xl shadow-lg p-1 flex space-x-1">
                  <button
                    onClick={() => setActivePeriod('mois')}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${
                      activePeriod === 'mois' ? 'bg-adawi-gold text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Le mois
                  </button>
                  <button
                    onClick={() => setActivePeriod('week')}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${
                      activePeriod === 'week' ? 'bg-adawi-gold text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Semaine
                  </button>
                  <button
                    onClick={() => setActivePeriod('day')}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${
                      activePeriod === 'day' ? 'bg-adawi-gold text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Jour
                  </button>
                </div>
              </div>

              {/* Cartes de statistiques principales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(
                          activePeriod === 'mois' ? dashboardData.total_revenue_month :
                          activePeriod === 'week' ? dashboardData.total_revenue_week :
                          dashboardData.total_revenue_today
                        )}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activePeriod === 'mois' ? 'Chiffre d\'affaires' :
                         activePeriod === 'week' ? 'Semaine' :
                         ' Aujourd\'hui'}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">F CFA</span>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                      <ShoppingCart className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {activePeriod === 'mois' ? dashboardData.total_orders :
                         activePeriod === 'week' ? dashboardData.total_orders_week :
                         dashboardData.total_orders_today}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activePeriod === 'mois' ? 'Commandes Totales' :
                         activePeriod === 'week' ? 'Commandes Semaine' :
                         'Commandes Aujourd\'hui'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-green-600">
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    {/* <span className="text-sm font-medium">+12%</span> */}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{dashboardData.total_products}</p>
                      <p className="text-sm text-gray-500">Produits</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">En vente</span>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(dashboardData.average_order_value)}
                      </p>
                      <p className="text-sm text-gray-500">Panier Moyen</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">F CFA</span>
                </div>
              </div>

              {showDetails && (
                <>
                  {/* Section commandes par statut */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Commandes par Statut</h2>
                        <BarChart3 className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="space-y-4">
                        {dashboardData.orders_by_status.map((status: OrderByStatus, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(status.status)}
                              <span className="text-sm font-medium text-gray-900 capitalize">
                                {status.status}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-semibold text-gray-900">{status.count}</span>
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-adawi-gold h-2 rounded-full"
                                  style={{
                                    width: `${(status.count / Math.max(...dashboardData.orders_by_status.map((s: OrderByStatus) => s.count))) * 100}%`
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Commandes en attente */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Commandes en Attente</h2>
                        <Clock className="w-6 h-6 text-amber-500" />
                      </div>
                      <div className="space-y-4">
                        {dashboardData.pending_orders.length > 0 ? (
                          dashboardData.pending_orders.slice(0, 5).map((order: PendingOrder, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{order.user_name}</p>
                                <p className="text-xs text-gray-500">#{order.order_id.slice(-8)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900">
                                  {formatCurrency(order.total)} F CFA
                                </p>
                                <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                            <p className="text-gray-600">Aucune commande en attente</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section produits populaires et commandes récentes */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Produits populaires */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Produits Populaires</h2>
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="space-y-4">
                        {dashboardData.top_products.length > 0 ? (
                          dashboardData.top_products.slice(0, 5).map((product: TopProduct, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-adawi-gold rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                                    {product.name}
                                  </p>
                                  <p className="text-xs text-gray-500">{product.total_quantity} vendus</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900">
                                  {formatCurrency(product.total_revenue)} F CFA
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">Aucun produit populaire</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Commandes récentes */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Commandes Récentes</h2>
                        <ShoppingCart className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="space-y-4">
                        {dashboardData.recent_orders.length > 0 ? (
                          dashboardData.recent_orders.slice(0, 5).map((order: RecentOrder, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                  <Users className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{order.user_name}</p>
                                  <p className="text-xs text-gray-500">#{order.order_id.slice(-8)}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                    {getStatusIcon(order.status)}
                                    <span className="ml-1 capitalize">{order.status}</span>
                                  </span>
                                </div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {formatCurrency(order.total)} F CFA
                                </p>
                                <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">Aucune commande récente</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : null}
        </div>
      </div>
    </SellerLayout>
  );
}

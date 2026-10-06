import { useState, useEffect } from "react";
import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher, Form, useNavigation } from "@remix-run/react";
import { Search, Filter, Eye, X, AlertCircle, Loader2, CreditCard, Ban, RefreshCw, Calendar, DollarSign, Clock, CheckCircle, XCircle, Download, FileText, Users } from "lucide-react";
import { readToken } from "~/utils/session.server";
import { requireAdmin } from "~/utils/auth.server";

const API_BASE = "http://localhost:8000";

// Interfaces
export interface Installment {
  id: string;
  order_id: string;
  installment_number: number;
  amount: number;
  paid_amount: number;
  due_date: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  payment_method: string | null;
  paid_at: string | null;
  notes: string | null;
  created_by: string;
  paid_by: string | null;
  created_at: string;
  updated_at: string;
  // champs présents dans /installments/search
  customer_name?: string;
  customer_phone?: string;
}

export interface InstallmentStats {
  paid: {
    count: number;
    total_amount: number;
    total_paid: number;
  };
  cancelled: {
    count: number;
    total_amount: number;
    total_paid: number;
  };
  null: {
    count: number;
    total_amount: number;
    total_paid: number;
  };
  total_installments: number;
  paid_installments: number;
  pending_installments: number;
  overdue_installments: number;
  total_amount: number;
  paid_amount: number;
}

interface User {
  id: string;
  email: string;
  full_name: string;
}

// Ajouter une nouvelle interface pour le résumé de paiement
interface PaymentSummary {
  order_id: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  payment_type: string;
  installments_count: number;
  installments: Installment[];
}

interface LoaderData {
  token: string;
  stats: InstallmentStats;
  overdueInstallments: {
    installments: Installment[];
    count: number;
  };
  searchResults?: {
    installments: Installment[];
    count: number;
  };
  phoneSearchResults?: {
    installments: Installment[];
    count: number;
  };
  userSearchResults?: {
    users: User[];
    count: number;
  };
  paymentSummary?: PaymentSummary;
}

interface ActionData {
  success?: boolean;
  error?: string;
  installments?: Installment[];
}

export const meta: MetaFunction = () => {
  return [
    { title: "Gestion des Versements - Vendeur" },
    { name: "description", content: "Interface d'administration pour la gestion des versements" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const token = await readToken(request);
  await requireAdmin(request);

  if (!token) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const intent = url.searchParams.get("intent");
  const orderId = url.searchParams.get("orderId");
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  const status = url.searchParams.get("status");
  const userQuery = url.searchParams.get("userQuery");
  const phoneQuery = url.searchParams.get("phoneQuery");

  // Valeurs par défaut pour les statistiques (mise à jour selon la nouvelle structure)
  const defaultStats: InstallmentStats = {
    paid: { count: 0, total_amount: 0, total_paid: 0 },
    cancelled: { count: 0, total_amount: 0, total_paid: 0 },
    null: { count: 0, total_amount: 0, total_paid: 0 },
    total_installments: 0,
    paid_installments: 0,
    pending_installments: 0,
    overdue_installments: 0,
    total_amount: 0,
    paid_amount: 0
  };

  try {
    let parsedToken;
    try {
      parsedToken = typeof token === 'string' ? JSON.parse(token) : token;
    } catch {
      parsedToken = token;
    }
    const accessToken = parsedToken?.access_token || token;

    // Récupérer les statistiques avec gestion d'erreur
    let stats = defaultStats;
    try {
      const statsResponse = await fetch(`${API_BASE}/installments/stats`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        stats = statsData || defaultStats;
      } else {
        console.warn("Impossible de récupérer les statistiques:", statsResponse.status);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
    }

    // Récupérer les versements en retard avec gestion d'erreur
    let overdueInstallments = { installments: [], count: 0 };
    try {
      const overdueResponse = await fetch(`${API_BASE}/installments/overdue?days_overdue=0`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });

      if (overdueResponse.ok) {
        const overdueData = await overdueResponse.json();
        overdueInstallments = overdueData || { installments: [], count: 0 };
      } else {
        console.warn("Impossible de récupérer les versements en retard:", overdueResponse.status);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des versements en retard:", error);
    }

    let searchResults = undefined;
    let userSearchResults = undefined;
    let paymentSummary = undefined;
    let phoneSearchResults = undefined;

    // Gérer les recherches via le loader
    if (intent === "searchByOrder" && orderId) {
      try {
        const searchResponse = await fetch(`${API_BASE}/installments/order/${orderId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        });

        if (searchResponse.ok) {
          const installments = await searchResponse.json();
          searchResults = { installments: installments || [], count: installments?.length || 0 };
        }

        // Récupérer également le résumé de paiement pour cette commande
        try {
          const summaryResponse = await fetch(`${API_BASE}/installments/order/${orderId}/payment-summary`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json"
            }
          });

          if (summaryResponse.ok) {
            paymentSummary = await summaryResponse.json();
          }
        } catch (error) {
          console.error("Erreur lors de la récupération du résumé de paiement:", error);
        }
      } catch (error) {
        console.error("Erreur lors de la recherche par commande:", error);
      }
    }

    if (intent === "searchByDateRange" && startDate && endDate) {
      try {
        const params = new URLSearchParams({
          start_date: startDate,
          end_date: endDate,
          ...(status && status !== 'all' && { status })
        });

        const searchResponse = await fetch(`${API_BASE}/installments/date-range?${params}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        });

        if (searchResponse.ok) {
          const data = await searchResponse.json();
          searchResults = { installments: data.installments || [], count: data.installments?.length || 0 };
        }
      } catch (error) {
        console.error("Erreur lors de la recherche par plage de dates:", error);
      }
    }

    // Recherche d'utilisateurs par email
    if (intent === "searchUsers" && userQuery) {
      try {
        const userSearchResponse = await fetch(`${API_BASE}/installments/users/search?q=${encodeURIComponent(userQuery)}&limit=10`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        });

        if (userSearchResponse.ok) {
          userSearchResults = await userSearchResponse.json();
        }
      } catch (error) {
        console.error("Erreur lors de la recherche d'utilisateurs:", error);
      }
    }

    // Recherche par numéro de téléphone
    if (intent === "searchByPhone" && phoneQuery && phoneQuery.trim().length >= 3) {
      try {
        const params = new URLSearchParams({ phone: phoneQuery.trim() });
        if (status && status !== 'all') params.append("status", status);

        const phoneSearchResponse = await fetch(`${API_BASE}/installments/search?${params}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        });

        if (phoneSearchResponse.ok) {
          const data = await phoneSearchResponse.json();
          phoneSearchResults = { installments: data.installments || [], count: data.count || 0 };
        }
      } catch (error) {
        console.error("Erreur lors de la recherche par téléphone:", error);
      }
    }

    return json<LoaderData>({ 
      token: accessToken,
      stats,
      overdueInstallments,
      searchResults,
      phoneSearchResults,
      userSearchResults,
      paymentSummary
    });

  } catch (error) {
    console.error("Erreur lors du chargement des données:", error);
    
    // Retourner des données par défaut en cas d'erreur
    return json<LoaderData>({ 
      token: "",
      stats: defaultStats,
      overdueInstallments: { installments: [], count: 0 },
      searchResults: undefined,
      userSearchResults: undefined,
      paymentSummary: undefined
    });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const token = await readToken(request);
  await requireAdmin(request);

  if (!token) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  let parsedToken;
  try {
    parsedToken = typeof token === 'string' ? JSON.parse(token) : token;
  } catch {
    parsedToken = token;
  }
  const accessToken = parsedToken?.access_token || token;

  try {
    if (intent === "payInstallment") {
      const orderId = formData.get("orderId") as string;
      const installmentId = formData.get("installmentId") as string;
      const paidAmount = formData.get("paidAmount") as string;
      const paymentMethod = (formData.get("paymentMethod") as string) || "cash";

      if (!orderId || !installmentId || !paidAmount) {
        return json<ActionData>({ error: "Paramètres manquants pour le paiement" }, { status: 400 });
      }

      const response = await fetch(`${API_BASE}/installments/order/${orderId}/pay/${installmentId}?paid_amount=${paidAmount}&payment_method=${paymentMethod}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Erreur lors du paiement" }));
        return json<ActionData>({ error: error.detail || "Erreur lors du paiement" }, { status: response.status });
      }

      return json<ActionData>({ success: true });
    }

    if (intent === "cancelInstallment") {
      const installmentId = formData.get("installmentId") as string;
      const reason = (formData.get("reason") as string) || "";

      if (!installmentId) {
        return json<ActionData>({ error: "ID du versement manquant" }, { status: 400 });
      }

      const response = await fetch(`${API_BASE}/installments/${installmentId}?reason=${encodeURIComponent(reason)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Erreur lors de l'annulation" }));
        return json<ActionData>({ error: error.detail || "Erreur lors de l'annulation" }, { status: response.status });
      }

      return json<ActionData>({ success: true });
    }

    if (intent === "updateOverdueStatus") {
      const response = await fetch(`${API_BASE}/installments/update-overdue-status`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Erreur lors de la mise à jour" }));
        return json<ActionData>({ error: error.detail || "Erreur lors de la mise à jour" }, { status: response.status });
      }

      return json<ActionData>({ success: true });
    }

  } catch (error) {
    console.error("Erreur dans l'action:", error);
    return json<ActionData>({ error: "Erreur de connexion au serveur" }, { status: 500 });
  }

  return json<ActionData>({ error: "Action non reconnue" }, { status: 400 });
}

export default function AdminInstallments() {
  const { token, stats, overdueInstallments, searchResults, phoneSearchResults, userSearchResults, paymentSummary } = useLoaderData<LoaderData>();
  
  // Vérification de sécurité pour stats (mise à jour selon la nouvelle structure)
  const safeStats = {
    paid: stats?.paid ?? { count: 0, total_amount: 0, total_paid: 0 },
    cancelled: stats?.cancelled ?? { count: 0, total_amount: 0, total_paid: 0 },
    null: stats?.null ?? { count: 0, total_amount: 0, total_paid: 0 },
    total_installments: stats?.total_installments ?? 0,
    paid_installments: stats?.paid_installments ?? 0,
    pending_installments: stats?.pending_installments ?? 0,
    overdue_installments: stats?.overdue_installments ?? 0,
    total_amount: stats?.total_amount ?? 0,
    paid_amount: stats?.paid_amount ?? 0,
  };

  // Vérification de sécurité pour overdueInstallments
  const safeOverdueInstallments = overdueInstallments || { installments: [], count: 0 };
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [phoneSearchTerm, setPhoneSearchTerm] = useState("");
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUserSearchModal, setShowUserSearchModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetcher = useFetcher();
  const navigation = useNavigation();

  const isLoading = navigation.state === "loading";
  const isSubmitting = navigation.state === "submitting";

  // Auto-hide messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Handle fetcher responses
  useEffect(() => {
    const data = fetcher.data as ActionData;
    if (data?.success) {
      setSuccessMessage("Opération réussie !");
      setShowPayModal(false);
      setShowCancelModal(false);
      setSelectedInstallment(null);
      // Reload the page to refresh data
      window.location.reload();
    }
    if (data?.error) {
      setErrorMessage(data.error);
    }
  }, [fetcher.data]);

  // Fonction pour formater les montants
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Fonction pour formater les dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Fonction pour obtenir le libellé du statut
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Payé';
      case 'pending': return 'En attente';
      case 'overdue': return 'En retard';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  // Fonction pour exporter les données
  const exportData = (installments: Installment[], filename: string) => {
    const csvContent = [
      ['Commande', 'Versement', 'Montant', 'Payé', 'Statut', 'Date échéance', 'Méthode paiement', 'Date paiement'].join(','),
      ...installments.map(inst => [
        inst.order_id,
        inst.installment_number,
        inst.amount,
        inst.paid_amount,
        getStatusLabel(inst.status),
        formatDate(inst.due_date),
        inst.payment_method || '',
        inst.paid_at ? formatDate(inst.paid_at) : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Gestion des Versements</h1>
          <p className="text-gray-600">Suivi et gestion des paiements échelonnés</p>
        </div>

        {/* Message d'erreur si les données ne peuvent pas être chargées */}
        {!token && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>Impossible de charger certaines données. Veuillez actualiser la page.</span>
            </div>
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Versements</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{safeStats.total_installments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Payés</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{safeStats.paid_installments}</p>
                <p className="text-xs sm:text-sm text-gray-500">{formatAmount(safeStats.paid_amount)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">En Retard</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{safeStats.overdue_installments}</p>
                <p className="text-xs sm:text-sm text-gray-500">
                  {formatAmount(safeStats.null?.total_amount || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Montant Total</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatAmount(safeStats.total_amount)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ajout d'une section de statistiques détaillées */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiques Détaillées</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Versements Payés</p>
                  <p className="text-2xl font-bold text-green-900">{safeStats.paid.count}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600">Montant</p>
                  <p className="text-lg font-semibold text-green-900">
                    {formatAmount(safeStats.paid.total_amount)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">En Attente</p>
                  <p className="text-2xl font-bold text-yellow-900">{safeStats.null.count}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-yellow-600">Montant</p>
                  <p className="text-lg font-semibold text-yellow-900">
                    {formatAmount(safeStats.null.total_amount)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Annulés</p>
                  <p className="text-2xl font-bold text-red-900">{safeStats.cancelled.count}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-red-600">Montant</p>
                  <p className="text-lg font-semibold text-red-900">
                    {formatAmount(safeStats.cancelled.total_amount)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Barre de progression globale */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progression des paiements</span>
              <span>
                {safeStats.total_amount > 0 
                  ? Math.round((safeStats.paid_amount / safeStats.total_amount) * 100)
                  : 0
                }%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-600 h-3 rounded-full transition-all duration-300"
                style={{ 
                  width: `${safeStats.total_amount > 0 
                    ? (safeStats.paid_amount / safeStats.total_amount) * 100 
                    : 0
                  }%` 
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Payé: {formatAmount(safeStats.paid_amount)}</span>
              <span>Total: {formatAmount(safeStats.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Résumé de paiement pour une commande spécifique */}
        {paymentSummary && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">
                Résumé de paiement - Commande {paymentSummary.order_id}
              </h2>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  paymentSummary.remaining_amount === 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {paymentSummary.remaining_amount === 0 ? 'Entièrement payé' : 'Paiement partiel'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-xs font-medium text-blue-600">Montant total</p>
                    <p className="text-lg font-bold text-blue-900">{formatAmount(paymentSummary.total_amount)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-xs font-medium text-green-600">Montant payé</p>
                    <p className="text-lg font-bold text-green-900">{formatAmount(paymentSummary.paid_amount)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-red-600 mr-2" />
                  <div>
                    <p className="text-xs font-medium text-red-600">Montant restant</p>
                    <p className="text-lg font-bold text-red-900">{formatAmount(paymentSummary.remaining_amount)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 text-purple-600 mr-2" />
                  <div>
                    <p className="text-xs font-medium text-purple-600">Versements</p>
                    <p className="text-lg font-bold text-purple-900">{paymentSummary.installments_count}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Barre de progression */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progression du paiement</span>
                <span>{Math.round((paymentSummary.paid_amount / paymentSummary.total_amount) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(paymentSummary.paid_amount / paymentSummary.total_amount) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Timeline des versements */}
            <div className="space-y-3">
              <h3 className="text-md font-semibold text-gray-800">Détail des versements</h3>
              {paymentSummary.installments.map((installment, index) => (
                <div key={installment.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-4 ${
                    installment.status === 'paid' ? 'bg-green-500' :
                    installment.status === 'overdue' ? 'bg-red-500' :
                    installment.status === 'pending' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`}>
                    {installment.installment_number}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          Versement #{installment.installment_number}
                        </p>
                        <p className="text-sm text-gray-600">
                          Échéance: {formatDate(installment.due_date)}
                        </p>
                        {installment.paid_at && (
                          <p className="text-sm text-green-600">
                            Payé le: {formatDate(installment.paid_at)}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatAmount(installment.amount)}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(installment.status)}`}>
                          {getStatusLabel(installment.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions pour chaque versement */}
                  <div className="ml-4 flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedInstallment(installment);
                        setShowDetailsModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                      title="Voir détails"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {(installment.status === 'pending' || installment.status === 'overdue') && (
                      <button
                        onClick={() => {
                          setSelectedInstallment(installment);
                          setShowPayModal(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Enregistrer le paiement"
                      >
                        <CreditCard className="w-4 h-4" />
                      </button>
                    )}
                    {installment.status !== 'paid' && installment.status !== 'cancelled' && (
                      <button
                        onClick={() => {
                          setSelectedInstallment(installment);
                          setShowCancelModal(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Annuler le versement"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Historique des paiements */}
            {(() => {
              const paidInstallments = paymentSummary.installments
                .filter(installment => installment.status === 'paid' && installment.paid_at)
                .sort((a, b) => new Date(b.paid_at!).getTime() - new Date(a.paid_at!).getTime());

              if (paidInstallments.length === 0) return null;

              return (
                <div className="mt-6 space-y-3">
                  <h3 className="text-md font-semibold text-gray-800 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    Historique des paiements ({paidInstallments.length})
                  </h3>
                  {paidInstallments.map((installment, index) => (
                    <div key={installment.id} className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-4 bg-green-500">
                        {installment.installment_number}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">
                              Versement #{installment.installment_number} - Payé
                            </p>
                            <p className="text-sm text-green-700 font-medium">
                              Payé le: {formatDate(installment.paid_at!)}
                            </p>
                            <p className="text-sm text-gray-600">
                              Échéance: {formatDate(installment.due_date)}
                            </p>
                            {installment.payment_method && (
                              <p className="text-sm text-gray-600">
                                Méthode: {installment.payment_method}
                              </p>
                            )}
                          </div>

                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {formatAmount(installment.paid_amount)}
                            </p>
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Payé
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action pour voir les détails */}
                      <div className="ml-4">
                        <button
                          onClick={() => {
                            setSelectedInstallment(installment);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Actions rapides */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h2>
          <div className="flex flex-wrap gap-4">
            <fetcher.Form method="post">
              <input type="hidden" name="intent" value="updateOverdueStatus" />
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Mettre à jour les retards
              </button>
            </fetcher.Form>

            <button
              onClick={() => setShowUserSearchModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Users className="w-4 h-4 mr-2" />
              Rechercher des utilisateurs
            </button>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recherche et Filtres</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recherche par ID de commande
              </label>
              <Form method="get" className="flex">
                <input type="hidden" name="intent" value="searchByOrder" />
                <input
                  type="text"
                  name="orderId"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ID de la commande..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                />
                <button
                  type="submit"
                  disabled={isLoading || !searchTerm.trim()}
                  className="px-4 py-2 bg-adawi-gold text-white rounded-r-lg hover:bg-adawi-gold/90 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </button>
              </Form>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recherche par numéro de téléphone
              </label>
              <Form method="get" className="flex">
                <input type="hidden" name="intent" value="searchByPhone" />
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">+228</span>
                  <input
                    type="text"
                    name="phoneQuery"
                    value={phoneSearchTerm}
                    onChange={(e) => setPhoneSearchTerm(e.target.value)}
                    placeholder="97732987"
                    minLength={3}
                    className="w-full pl-14 pr-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || phoneSearchTerm.trim().length < 3}
                  className="px-4 py-2 bg-[#8B5E3C] text-white rounded-r-lg hover:bg-[#5C3D1E] transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </button>
              </Form>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début
              </label>
              <input
                type="datetime-local"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin
              </label>
              <input
                type="datetime-local"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="paid">Payé</option>
              <option value="overdue">En retard</option>
              <option value="cancelled">Annulé</option>
            </select>

            <Form method="get">
              <input type="hidden" name="intent" value="searchByDateRange" />
              <input type="hidden" name="startDate" value={dateRange.start} />
              <input type="hidden" name="endDate" value={dateRange.end} />
              <input type="hidden" name="status" value={statusFilter} />
              <button
                type="submit"
                disabled={!dateRange.start || !dateRange.end || isLoading}
                className="px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Recherche...
                  </>
                ) : (
                  'Rechercher par dates'
                )}
              </button>
            </Form>
          </div>
        </div>

        {/* Résultats recherche par téléphone */}
        {phoneSearchResults && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0 flex items-center">
                <Search className="w-5 h-5 mr-2 text-[#8B5E3C]" />
                Résultats — Recherche téléphone ({phoneSearchResults.count})
              </h2>
              {phoneSearchResults.count > 0 && (
                <button
                  onClick={() => exportData(phoneSearchResults.installments, 'versements-telephone')}
                  className="flex items-center px-3 py-2 bg-[#8B5E3C] text-white rounded-lg hover:bg-[#5C3D1E] transition-colors text-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </button>
              )}
            </div>

            {phoneSearchResults.count === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Aucun versement trouvé pour ce numéro.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commande</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N°</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Échéance</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {phoneSearchResults.installments.map((inst) => (
                      <tr key={inst.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{inst.customer_name || "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{inst.customer_phone || "—"}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 font-mono">{inst.order_id.slice(-8)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">#{inst.installment_number}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatAmount(inst.amount)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inst.status)}`}>
                            {getStatusLabel(inst.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(inst.due_date)}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => { setSelectedInstallment(inst); setShowDetailsModal(true); }}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            title="Voir détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Versements en retard */}
        {safeOverdueInstallments.count > 0 && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="text-lg font-semibold text-red-600 mb-2 sm:mb-0 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Versements en Retard ({safeOverdueInstallments.count})
              </h2>
              <button
                onClick={() => exportData(safeOverdueInstallments.installments, 'versements-en-retard')}
                className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commande
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Versement
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date d'échéance
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {safeOverdueInstallments.installments.map((installment) => (
                    <tr key={installment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {installment.order_id}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        #{installment.installment_number}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatAmount(installment.amount)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(installment.due_date)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedInstallment(installment);
                              setShowDetailsModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Voir détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedInstallment(installment);
                              setShowPayModal(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="Enregistrer le paiement"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedInstallment(installment);
                              setShowCancelModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Annuler le versement"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Liste des versements recherchés */}
        {searchResults && searchResults.installments.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">
                Résultats de recherche ({searchResults.count})
              </h2>
              <button
                onClick={() => exportData(searchResults.installments, 'resultats-recherche')}
                className="flex items-center px-3 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 transition-colors text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commande
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Versement
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payé
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date d'échéance
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {searchResults.installments.map((installment) => (
                    <tr key={installment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {installment.order_id}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        #{installment.installment_number}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatAmount(installment.amount)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatAmount(installment.paid_amount)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(installment.status)}`}>
                          {getStatusLabel(installment.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(installment.due_date)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedInstallment(installment);
                              setShowDetailsModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Voir détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {installment.status === 'pending' || installment.status === 'overdue' ? (
                            <button
                              onClick={() => {
                                setSelectedInstallment(installment);
                                setShowPayModal(true);
                              }}
                              className="text-green-600 hover:text-green-900"
                              title="Enregistrer le paiement"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                          ) : null}
                          {installment.status !== 'paid' && installment.status !== 'cancelled' ? (
                            <button
                              onClick={() => {
                                setSelectedInstallment(installment);
                                setShowCancelModal(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="Annuler le versement"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Message si aucun résultat */}
        {searchResults && searchResults.installments.length === 0 && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Aucun résultat trouvé</h3>
              <p className="text-sm">Essayez de modifier vos critères de recherche.</p>
            </div>
          </div>
        )}

        {/* Modal de recherche d'utilisateurs */}
        {showUserSearchModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Rechercher des utilisateurs
                </h3>
                <button
                  onClick={() => setShowUserSearchModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <Form method="get">
                <input type="hidden" name="intent" value="searchUsers" />
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email de l'utilisateur
                    </label>
                    <input
                      type="email"
                      name="userQuery"
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      placeholder="Tapez l'email de l'utilisateur..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                    />
                  </div>

                  {userSearchResults?.users && userSearchResults.users.length > 0 && (
                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                      <div className="p-3 bg-gray-50 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-700">
                          {userSearchResults.count} utilisateur(s) trouvé(s)
                        </p>
                      </div>
                      {userSearchResults.users.map((user) => (
                        <div key={user.id} className="p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                          <p className="font-medium text-gray-900">{user.full_name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500">ID: {user.id}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {userSearchResults?.users && userSearchResults.users.length === 0 && (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                      <p className="text-gray-500">Aucun utilisateur trouvé</p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowUserSearchModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Fermer
                    </button>
                    <button
                      type="submit"
                      disabled={!userSearchTerm.trim() || isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                          Recherche...
                        </>
                      ) : (
                        'Rechercher'
                      )}
                    </button>
                  </div>
                </div>
              </Form>
            </div>
          </div>
        )}

        {/* Modal de détails */}
        {showDetailsModal && selectedInstallment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-lg font-semibold flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Détails du versement
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ID du versement</label>
                      <p className="mt-1 text-sm text-gray-900 font-mono">{selectedInstallment.id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Commande</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedInstallment.order_id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Numéro de versement</label>
                      <p className="mt-1 text-sm text-gray-900">#{selectedInstallment.installment_number}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Statut</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getStatusColor(selectedInstallment.status)}`}>
                        {getStatusLabel(selectedInstallment.status)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Montant total</label>
                      <p className="mt-1 text-sm text-gray-900 font-semibold">{formatAmount(selectedInstallment.amount)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Montant payé</label>
                      <p className="mt-1 text-sm text-gray-900 font-semibold">{formatAmount(selectedInstallment.paid_amount)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Montant restant</label>
                      <p className="mt-1 text-sm text-gray-900 font-semibold text-red-600">
                        {formatAmount(selectedInstallment.amount - selectedInstallment.paid_amount)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date d'échéance</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedInstallment.due_date)}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Méthode de paiement</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedInstallment.payment_method || 'Non spécifiée'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date de paiement</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedInstallment.paid_at ? formatDate(selectedInstallment.paid_at) : 'Non payé'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Créé par</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedInstallment.created_by}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Payé par</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedInstallment.paid_by || 'Non spécifié'}</p>
                      </div>
                    </div>
                  </div>

                  {selectedInstallment.notes && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedInstallment.notes}</p>
                    </div>
                  )}

                  <div className="mt-4 text-xs text-gray-500">
                    <p>Créé le: {formatDate(selectedInstallment.created_at)}</p>
                    <p>Modifié le: {formatDate(selectedInstallment.updated_at)}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Fermer
                </button>
                {(selectedInstallment.status === 'pending' || selectedInstallment.status === 'overdue') && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowPayModal(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Enregistrer le paiement
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de paiement amélioré */}
        {showPayModal && selectedInstallment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Enregistrer le paiement</h3>
                <button
                  onClick={() => setShowPayModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <fetcher.Form method="post">
                <input type="hidden" name="intent" value="payInstallment" />
                <input type="hidden" name="orderId" value={selectedInstallment.order_id} />
                <input type="hidden" name="installmentId" value={selectedInstallment.id} />

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Montant à payer *
                    </label>
                    <input
                      type="number"
                      name="paidAmount"
                      defaultValue={selectedInstallment.amount - selectedInstallment.paid_amount}
                      max={selectedInstallment.amount - selectedInstallment.paid_amount}
                      min="0.01"
                      step="0.01"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum: {formatAmount(selectedInstallment.amount - selectedInstallment.paid_amount)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Méthode de paiement *
                    </label>
                    <select
                      name="paymentMethod"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                    >
                      <option value="cash">Espèces</option>
                      {/* <option value="card">Carte bancaire</option>
                      <option value="transfer">Virement bancaire</option>
                      <option value="mobile">Mobile Money</option>
                      <option value="check">Chèque</option>
                      <option value="other">Autre</option> */}
                    </select>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Commande:</strong> {selectedInstallment.order_id}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Versement:</strong> #{selectedInstallment.installment_number}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Montant total:</strong> {formatAmount(selectedInstallment.amount)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Déjà payé:</strong> {formatAmount(selectedInstallment.paid_amount)}
                    </p>
                    <p className="text-sm text-gray-600 font-semibold">
                      <strong>Restant:</strong> {formatAmount(selectedInstallment.amount - selectedInstallment.paid_amount)}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowPayModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={fetcher.state === "submitting"}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {fetcher.state === "submitting" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                        Traitement...
                      </>
                    ) : (
                      'Enregistrer le paiement'
                    )}
                  </button>
                </div>
              </fetcher.Form>
            </div>
          </div>
        )}

        {/* Modal d'annulation */}
        {showCancelModal && selectedInstallment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Annuler le versement</h3>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <fetcher.Form method="post">
                <input type="hidden" name="intent" value="cancelInstallment" />
                <input type="hidden" name="installmentId" value={selectedInstallment.id} />

                <div className="space-y-4">
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Attention:</strong> Cette action annulera définitivement ce versement.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Raison de l'annulation
                    </label>
                    <textarea
                      name="reason"
                      rows={3}
                      placeholder="Expliquez la raison de l'annulation..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                    />
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Commande:</strong> {selectedInstallment.order_id}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Versement:</strong> #{selectedInstallment.installment_number}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Montant:</strong> {formatAmount(selectedInstallment.amount)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Date d'échéance:</strong> {formatDate(selectedInstallment.due_date)}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={fetcher.state === "submitting"}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {fetcher.state === "submitting" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                        Traitement...
                      </>
                    ) : (
                      'Confirmer l\'annulation'
                    )}
                  </button>
                </div>
              </fetcher.Form>
            </div>
          </div>
        )}

        {/* Messages de feedback */}
        {successMessage && (
          <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>{successMessage}</span>
              <button
                onClick={() => setSuccessMessage(null)}
                className="ml-4 text-green-600 hover:text-green-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 mr-2" />
              <span>{errorMessage}</span>
              <button
                onClick={() => setErrorMessage(null)}
                className="ml-4 text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

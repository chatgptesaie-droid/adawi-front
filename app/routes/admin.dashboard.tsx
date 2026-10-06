import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState, useRef, useEffect } from "react";
import StatsCards from "~/components/admin/StatsCards";
import TopCategories from "~/components/admin/TopCategories";
import SalesChart from "~/components/admin/SalesChart";
import InventoryAlerts from "~/components/admin/InventoryAlerts";
import { readToken } from "~/utils/session.server";
import RefundStats from "~/components/admin/RefundStats";
import { requireAdmin } from "~/utils/auth.server";
import { GripVertical, X, MinusCircle, PlusCircle, BarChart3, DollarSign, Package, RefreshCw, AlertTriangle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard - Adawi Admin" },
    { name: "description", content: "Tableau de bord administrateur" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  // Vérifier que l'utilisateur est admin
  const user = await requireAdmin(request);

  try {
    const token = await readToken(request);
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Parallel fetch for dashboard data and inventory alerts
    const [dashboardResponse, inventoryResponse] = await Promise.all([
      fetch("http://localhost:8000/dashboard/admin", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }),
      fetch("http://localhost:8000/inventory/low-stock", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }),
    ]);

    if (!dashboardResponse.ok || !inventoryResponse.ok) {
      throw new Error(`API request failed with status ${dashboardResponse.status} or ${inventoryResponse.status}`);
    }

    const dashboardData = await dashboardResponse.json();
    const inventoryData = await inventoryResponse.json();
    return json({ ...dashboardData, inventory_alerts: inventoryData, user, token });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    // Return empty data or handle error
    return json({
      user,
      total_revenue: 0,
      total_orders: 0,
      total_customers: 0,
      total_vendors: 0,
      total_products: 0,
      commission_collected: 0,
      total_cost: 0,
      gross_profit: 0,
      gross_margin_percent: 0,
      refunds_count: 0,
      refunds_total_amount: 0,
      low_stock_products: 0,
      revenue_growth: 0,
      orders_growth: 0,
      customers_growth: 0,
      total_visitors: 0,
      weekly_revenue: 0,
      weekly_orders: 0,
      weekly_customers: 0,
      weekly_visitors: 0,
      weekly_revenue_growth: 0,
      weekly_orders_growth: 0,
      weekly_customers_growth: 0,
      weekly_visitors_growth: 0,
      top_categorie: "",
      top_categorie_revenue: 0,
      revenue_evolution: [],
      cost_revenue_evolution: [],
      sales_by_category: [],
      user_growth: [],
      geographic_sales: [],
      refund_stats: {
        total_refunds: 0,
        total_refunded_amount: 0,
        pending_refunds: 0,
        approved_refunds: 0,
        rejected_refunds: 0,
        processed_refunds: 0,
      },
      inventory_alerts: [],
      top_products: [],
      top_vendors: [],
      recent_orders: [],
      orders_by_status: [],
      pending_orders: [],
    });
  }
};

export default function AdminDashboard() {
  const data = useLoaderData<typeof loader>();
  const [activeSection, setActiveSection] = useState<string>('overview');

  // État pour la position de la div Stats - Initialisation sécurisée
  const [statsPosition, setStatsPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isStatsVisible, setIsStatsVisible] = useState(true);
  const [isStatsMinimized, setIsStatsMinimized] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Référence à la div Stats
  const statsRef = useRef<HTMLDivElement>(null);

  // Gestionnaire pour commencer le drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (statsRef.current) {
      const rect = statsRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  // Gestionnaire pour le mouvement pendant le drag
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      // Contraindre la position dans les limites de l'écran
      const maxX = window.innerWidth - (isStatsMinimized ? 200 : 256); // 256px = w-64
      const maxY = window.innerHeight - 100;

      setStatsPosition({
        x: Math.max(0, Math.min(maxX, e.clientX - dragOffset.x)),
        y: Math.max(0, Math.min(maxY, e.clientY - dragOffset.y))
      });
    }
  };

  // Gestionnaire pour terminer le drag
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Effet pour ajouter/supprimer les écouteurs d'événements
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Initialiser la position au chargement de la page - Côté client uniquement
  useEffect(() => {
    setIsClient(true);

    // Position initiale par défaut
    const initialX = Math.max(0, window.innerWidth - 300);
    const initialY = Math.max(0, window.innerHeight / 2 - 100);

    setStatsPosition({
      x: initialX,
      y: initialY
    });
  }, []);

  // Gérer le redimensionnement de la fenêtre
  useEffect(() => {
    if (!isClient) return;

    const handleResize = () => {
      // Ajuster la position si elle sort de l'écran après redimensionnement
      setStatsPosition(prev => {
        const maxX = window.innerWidth - (isStatsMinimized ? 200 : 256);
        const maxY = window.innerHeight - 100;

        return {
          x: Math.max(0, Math.min(maxX, prev.x)),
          y: Math.max(0, Math.min(maxY, prev.y))
        };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isClient, isStatsMinimized]);

  const sections: { id: string; label: string; icon: LucideIcon }[] = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'sales', label: 'Ventes', icon: DollarSign },
    { id: 'inventory', label: 'Inventaire', icon: Package },
    // { id: 'geographic', label: 'Géographie', icon: Globe },
    { id: 'refunds', label: 'Remboursements', icon: RefreshCw },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
      return (
        <div className="space-y-6">
          <StatsCards data={data} />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Catégories</h3>
              <TopCategories data={data} />
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Résumé rapide</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Commandes en attente:</span>
                  <span className="font-medium">{data.pending_orders?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Produits en rupture:</span>
                  <span className="font-medium text-red-600">{data.low_stock_products}</span>
                </div>
                {/* <div className="flex justify-between">
                  <span className="text-gray-600">Marge brute:</span>
                  <span className="font-medium text-green-600">{data.gross_margin_percent?.toFixed(1)}%</span>
                </div> */}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions rapides</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveSection('inventory')}
                  className="w-full text-left px-3 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-700 text-sm transition-colors"
                >
                  <AlertTriangle className="inline w-4 h-4 mr-1" />
                  Vérifier les stocks faibles ({data.low_stock_products})
                </button>
                <button
                  onClick={() => setActiveSection('refunds')}
                  className="w-full text-left px-3 py-2 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-yellow-700 text-sm transition-colors"
                >
                  <RefreshCw className="inline w-4 h-4 mr-1" />
                  Gérer les remboursements ({data.refund_stats.pending_refunds})
                </button>
              </div>
            </div>
          </div>
        </div>
      );

      case 'sales':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance des ventes</h3>
              <SalesChart data={data} token={data.token} />
            </div>
          </div>
        );

      case 'inventory':
        return (
          <div className="space-y-6">
            <InventoryAlerts data={data.inventory_alerts} />
          </div>
        );

      case 'refunds':
        return (
          <div className="space-y-6">
            <RefundStats data={data.refund_stats} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-adawi-brown mb-2">
            Bienvenue, Administrateur
          </h1>
          <p className="text-gray-600">
            Voici les statistiques de la semaine de votre boutique en ligne !
          </p>
        </div>
      </div>

      {/* Navigation Tabs - Desktop */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 lg:px-8 hidden md:block">
        <div className="max-w-7xl mx-auto">
          <nav className="flex space-x-8">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeSection === section.id
                    ? 'border-adawi-brown text-adawi-brown'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <section.icon className="inline w-4 h-4 mr-2" />
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Navigation Tabs - Mobile */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 md:hidden">
        <div className="flex overflow-x-auto py-2 space-x-4">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-adawi-brown text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <section.icon className="inline w-4 h-4 mr-2" />
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </div>

      {/* Quick Stats Sidebar - Draggable - Rendu côté client uniquement
      {isClient && isStatsVisible && (
        <div
          ref={statsRef}
          style={{
            position: 'fixed',
            left: `${statsPosition.x}px`,
            top: `${statsPosition.y}px`,
            zIndex: 50,
            width: isStatsMinimized ? 'auto' : '16rem', // w-64 = 16rem
            cursor: isDragging ? 'grabbing' : 'auto',
            transition: isDragging ? 'none' : 'all 0.2s ease',
            opacity: isDragging ? 0.8 : 1,
          }}
          className="bg-white rounded-lg shadow-lg border border-gray-200"
        > */}
          {/* Header avec poignée de déplacement
          <div
            className="flex items-center justify-between p-3 bg-adawi-brown/10 rounded-t-lg cursor-grab border-b border-gray-200 select-none"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center">
              <GripVertical className="w-4 h-4 text-gray-500 mr-2" />
              <h4 className="font-semibold text-gray-800 text-sm">Stats en temps réel</h4>
            </div>
            <div className="flex items-center space-x-1">
              {isStatsMinimized ? (
                <button
                  onClick={() => setIsStatsMinimized(false)}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  title="Agrandir"
                >
                  <PlusCircle className="w-4 h-4 text-gray-500" />
                </button>
              ) : (
                <button
                  onClick={() => setIsStatsMinimized(true)}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  title="Réduire"
                >
                  <MinusCircle className="w-4 h-4 text-gray-500" />
                </button>
              )}
              <button
                onClick={() => setIsStatsVisible(false)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                title="Fermer"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div> */}

          {/* Contenu
          {!isStatsMinimized && (
            <div className="p-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Revenus Total</span>
                  <span className="font-semibold text-green-600">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'XOF',
                      minimumFractionDigits: 0
                    }).format(data.total_revenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Commandes</span>
                  <span className="font-semibold">{data.total_orders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Nouveaux clients</span>
                  <span className="font-semibold text-blue-600">{data.total_customers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Visiteurs</span>
                  <span className="font-semibold text-purple-600">{data.total_visitors}</span>
                </div>
                <div className="h-px bg-gray-200 my-3"></div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Croissance revenus</span>
                  <span className={`font-semibold ${data.revenue_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.revenue_growth >= 0 ? '+' : ''}{data.revenue_growth?.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Croissance hebdomadaire</span>
                  <span className={`font-semibold ${data.weekly_revenue_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.weekly_revenue_growth >= 0 ? '+' : ''}{data.weekly_revenue_growth?.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Visiteurs hebdomadaires</span>
                  <span className="font-semibold text-purple-600">{data.weekly_visitors}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )} */}

      {/* Bouton pour réafficher les stats si masquées */}
      {isClient && !isStatsVisible && (
        <button
          onClick={() => setIsStatsVisible(true)}
          className="fixed bottom-6 right-6 bg-adawi-brown text-white rounded-full p-3 shadow-lg hover:bg-adawi-brown/90 transition-colors z-50"
          title="Afficher les statistiques"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>
      )}
    </div>
  );
}
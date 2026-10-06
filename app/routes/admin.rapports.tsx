import { useState, useEffect } from "react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  FileText,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  AlertCircle,
  Loader
} from "lucide-react";
import Pagination from "~/components/admin/Pagination";
import { readToken } from "~/utils/session.server";
import {
  fetchReportsSummary,
  fetchSalesReport,
  fetchProductsReport,
  exportReports,
  type ReportsSummary,
  type SalesReport,
  type ProductReport
} from "~/utils/adminReportsApi";

interface LoaderData {
  token: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  const token = await readToken(request);
  if (!token) throw new Response("Non autorisé", { status: 401 });

  return json<LoaderData>({ token });
};

export default function AdminRapports() {
  const { token } = useLoaderData<LoaderData>();
  const [activeTab, setActiveTab] = useState("ventes");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState("30-days");
  const itemsPerPage = 10;

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minAmount: "",
    maxAmount: "",
    productName: "",
    clientName: "",
    status: "all"
  });

  // State for API data
  const [reportsSummary, setReportsSummary] = useState<ReportsSummary | null>(null);
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [productsReport, setProductsReport] = useState<ProductReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Fetch data when component mounts or filters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch summary data
        const summary = await fetchReportsSummary(token, dateRange);
        setReportsSummary(summary);

        // Fetch sales data if on ventes tab
        if (activeTab === "ventes") {
          const sales = await fetchSalesReport(token, currentPage, itemsPerPage, dateRange);
          setSalesReport(sales);
        }

        // Fetch products data if on produits tab
        if (activeTab === "produits") {
          const products = await fetchProductsReport(token);
          setProductsReport(products);
        }
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, dateRange, activeTab, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await exportReports(token, dateRange);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapports-${dateRange}-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'export");
    } finally {
      setExporting(false);
    }
  };

  const tabs = [
    { id: "ventes", label: "Ventes", icon: TrendingUp, iconName: "Ventes" },
    { id: "produits", label: "Produits", icon: ShoppingBag, iconName: "Produits" },
  ];

  // Filter functions
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    // Here you would typically refetch data with filters
    // For now, we'll just close the modal
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({
      minAmount: "",
      maxAmount: "",
      productName: "",
      clientName: "",
      status: "all"
    });
  };

  const filteredSales = salesReport?.ventes.filter(sale => {
    const matchesMinAmount = !filters.minAmount || sale.montant >= parseInt(filters.minAmount);
    const matchesMaxAmount = !filters.maxAmount || sale.montant <= parseInt(filters.maxAmount);
    const matchesProduct = !filters.productName || sale.produit.toLowerCase().includes(filters.productName.toLowerCase());
    const matchesClient = !filters.clientName || (sale.client && sale.client.toLowerCase().includes(filters.clientName.toLowerCase()));

    return matchesMinAmount && matchesMaxAmount && matchesProduct && matchesClient;
  }) || [];

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Rapports</h1>
          <p className="text-sm sm:text-base text-gray-600">Analysez les performances de votre boutique</p>
        </div>
        
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 gap-3">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
          >
            <option value="today">Aujourd'hui</option>
            <option value="7-days">7 derniers jours</option>
            <option value="30-days">30 derniers jours</option>
            <option value="90-days">3 derniers mois</option>
            <option value="year">Cette année</option>
          </select>
          
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center justify-center w-full sm:w-auto px-3 sm:px-4 py-2 bg-adawi-gold text-white text-sm sm:text-base rounded-lg hover:bg-adawi-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {exporting ? "Export en cours..." : "Exporter"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-600">Ventes totales</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                {reportsSummary ? reportsSummary.total_orders.toLocaleString() : "—"}
              </p>
              {/* <p className={`text-sm ${reportsSummary && reportsSummary.orders_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {reportsSummary ? `${reportsSummary.orders_growth >= 0 ? '+' : ''}${reportsSummary.orders_growth}% ce mois` : "—"}
              </p> */}
            </div>
            <div className="p-2 sm:p-3 bg-green-100 rounded-lg flex-shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-600">Revenus</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                {reportsSummary ? `${(reportsSummary.total_revenue )} F CFA` : "—"}
              </p>
              {/* <p className={`text-sm ${reportsSummary && reportsSummary.revenue_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {reportsSummary ? `${reportsSummary.revenue_growth >= 0 ? '+' : ''}${reportsSummary.revenue_growth}% ce mois` : "—"}
              </p> */}
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-600">Nouveaux clients</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                {reportsSummary ? reportsSummary.total_nouveaux_clients.toLocaleString() : "—"}
              </p>
              {/* <p className={`text-sm ${reportsSummary && reportsSummary.customers_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {reportsSummary ? `${reportsSummary.customers_growth >= 0 ? '+' : ''}${reportsSummary.customers_growth}% ce mois` : "—"}
              </p> */}
            </div>
            <div className="p-2 sm:p-3 bg-purple-100 rounded-lg flex-shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-600">Produits vendus</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                {reportsSummary ? reportsSummary.total_produits_vendus.toLocaleString() : "—"}
              </p>
              {/* <p className="text-sm text-gray-600 truncate">Commission: {reportsSummary ? `${reportsSummary.commission_collected.toLocaleString()} F CFA` : "—"}</p> */}
            </div>
            <div className="p-2 sm:p-3 bg-orange-100 rounded-lg flex-shrink-0">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto px-4 sm:px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-2 sm:px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-adawi-gold text-adawi-gold'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <span className="hidden xs:inline">{tab.label}</span>
                  <span className="ml-1 text-xs text-gray-400">{tab.iconName}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Table Content */}
        <div className="p-4 sm:p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-6 sm:w-8 h-6 sm:h-8 animate-spin text-adawi-gold" />
              <span className="ml-2 text-gray-600 text-sm sm:text-base">Chargement des données...</span>
            </div>
          ) : (
            <>
              {activeTab === "ventes" && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Détail des ventes</h3>
                    <button
                      onClick={() => setShowFilters(true)}
                      className="flex items-center justify-center sm:justify-start px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filtrer
                    </button>
                  </div>

                  {filteredSales.length > 0 ? (
                    <>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Produit
                              </th>
                              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                Client
                              </th>
                              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Quantité
                              </th>
                              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Montant
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredSales.map((sale, index) => (
                              <tr key={`${sale.date}-${sale.produit}-${index}`} className="hover:bg-gray-50">
                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                  {sale.date}
                                </td>
                                <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm font-medium text-gray-900">
                                  <div className="max-w-[120px] sm:max-w-none truncate">
                                    {sale.produit}
                                  </div>
                                  <div className="sm:hidden text-xs text-gray-500 mt-1">
                                    {sale.client || "—"}
                                  </div>
                                </td>
                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                                  {sale.client || "—"}
                                </td>
                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                  {sale.quantite}
                                </td>
                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                                  <div className="max-w-[80px] sm:max-w-none truncate">
                                    {sale.montant.toLocaleString()} F CFA
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {salesReport && (
                        <div className="mt-4">
                          <Pagination
                            currentPage={salesReport.page}
                            totalPages={salesReport.total_pages}
                            onPageChange={handlePageChange}
                            totalItems={salesReport.total_items}
                            itemsPerPage={itemsPerPage}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-8 sm:w-12 h-8 sm:h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                        Aucune vente trouvée
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        Il n'y a pas de données de ventes pour la période sélectionnée.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "produits" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Performance des produits</h3>
                  </div>

                  {productsReport.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Produit
                            </th>
                            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Stock actuel
                            </th>
                            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                              Vendus
                            </th>
                            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                              Revenus
                            </th>
                            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Statut
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {productsReport.map((product, index) => (
                            <tr key={`${product.nom}-${index}`} className="hover:bg-gray-50">
                              <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm font-medium text-gray-900">
                                <div className="max-w-[120px] sm:max-w-none truncate">
                                  {product.nom}
                                </div>
                                <div className="sm:hidden text-xs text-gray-500 mt-1">
                                  Vendus: {product.vendus} • {product.revenus.toLocaleString()} F CFA
                                </div>
                              </td>
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                {product.stock}
                              </td>
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                                {product.vendus}
                              </td>
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 hidden sm:table-cell">
                                {product.revenus.toLocaleString()} F CFA
                              </td>
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  product.statut === 'En stock'
                                    ? 'bg-green-100 text-green-800'
                                    : product.statut === 'Stock faible'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {product.statut}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-8 sm:w-12 h-8 sm:h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                        Aucun produit trouvé
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        Il n'y a pas de données de produits disponibles.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {(activeTab === "clients" || activeTab === "revenus") && (
                <div className="text-center py-12">
                  <FileText className="w-8 sm:w-12 h-8 sm:h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    Rapport {activeTab} en cours de développement
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Cette section sera bientôt disponible avec des données détaillées.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filtrer les ventes</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Montant minimum */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Montant minimum (F CFA)
                  </label>
                  <input
                    type="number"
                    value={filters.minAmount}
                    onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                    placeholder="Ex: 10000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                  />
                </div>

                {/* Montant maximum */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Montant maximum (F CFA)
                  </label>
                  <input
                    type="number"
                    value={filters.maxAmount}
                    onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                    placeholder="Ex: 50000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                  />
                </div>

                {/* Nom du produit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du produit
                  </label>
                  <input
                    type="text"
                    value={filters.productName}
                    onChange={(e) => handleFilterChange('productName', e.target.value)}
                    placeholder="Rechercher un produit..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                  />
                </div>

                {/* Nom du client */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du client
                  </label>
                  <input
                    type="text"
                    value={filters.clientName}
                    onChange={(e) => handleFilterChange('clientName', e.target.value)}
                    placeholder="Rechercher un client..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Réinitialiser
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 text-sm font-medium text-white bg-adawi-gold border border-transparent rounded-lg hover:bg-adawi-gold/90 transition-colors"
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

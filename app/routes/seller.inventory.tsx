import type { LoaderFunctionArgs } from "@remix-run/node";
import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import { requireVendor } from "~/utils/auth.server";
import SellerLayout from "~/components/seller/SellerLayout";
import { readToken } from "~/utils/session.server";
import {
    Package,
    AlertTriangle,
    TrendingDown,
    RefreshCw,
    CheckCircle,
    DollarSign,
    ShoppingCart,
    BarChart3,
    ArrowUpRight,
} from "lucide-react";

export const meta: MetaFunction = () => {
    return [
        { title: "Inventaire Vendeur - Adawi" },
        { name: "description", content: "Gestion de l'inventaire et alertes de stock pour vendeurs" },
    ];
};

export const loader: LoaderFunction = async ({ request }) => {
    const user = await requireVendor(request);

    try {
        const token = await readToken(request);
        if (!token) {
            throw new Error("No authentication token found");
        }

        // Parallel fetch for stats and low stock products
        const [statsResponse, lowStockResponse] = await Promise.all([
            fetch("http://localhost:8000/inventory/stats", {
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

        if (!statsResponse.ok || !lowStockResponse.ok) {
            throw new Error(`API request failed with status ${statsResponse.status} or ${lowStockResponse.status}`);
        }

        const stats = await statsResponse.json();
        const lowStockProducts = await lowStockResponse.json();

        return json({ user, stats, lowStockProducts });
    } catch (error) {
        console.error("Error fetching inventory data:", error);
        // Return empty data on error
        return json({
            user,
            stats: {
                total_products: 0,
                low_stock_count: 0,
                out_of_stock_count: 0,
                average_stock: 0,
            },
            lowStockProducts: [],
        });
    }
};

// Interfaces for API responses
interface InventoryStats {
    total_products: number;
    low_stock_count: number;
    out_of_stock_count: number;
    average_stock?: number;
}

interface LowStockProduct {
    product_id: string;
    product_name: string;
    current_stock: number;
    low_stock_threshold: number;
    seller_id: string;
}

interface LoaderData {
    user: { full_name: string;[key: string]: any };
    stats: InventoryStats;
    lowStockProducts: LowStockProduct[];
}

export default function SellerInventory() {
    const { user, stats, lowStockProducts } = useLoaderData<LoaderData>();

    const [isRefreshing, setIsRefreshing] = useState(false);

    // Formater les nombres
    const formatNumber = (num: number) => {
        return num.toLocaleString('fr-FR');
    };

    // Filtrer les produits critiques (rupture de stock)
    const criticalAlerts = lowStockProducts.filter(item => item.current_stock <= 0);
    // Filtrer les produits en stock faible
    const lowStockAlerts = lowStockProducts.filter(item => item.current_stock > 0 && item.current_stock <= item.low_stock_threshold);

    const handleRefresh = () => {
        setIsRefreshing(true);
        window.location.reload();
    };

    return (
        <SellerLayout userName={user.full_name}>
            <div className="min-h-screen bg-gradient-to-br from-adawi-beige via-white to-adawi-beige/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header avec gradient */}
                    <div className="bg-gradient-to-r from-adawi-brown to-adawi-gold rounded-2xl shadow-xl p-8 mb-8 text-white">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">
                                    Gestion de l'Inventaire
                                </h1>
                                <p className="text-adawi-beige/90 text-lg">
                                    Surveillez vos stocks et recevez des alertes en temps réel
                                </p>
                            </div>

                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                    className="flex items-center px-6 py-3 bg-white text-adawi-brown rounded-xl hover:bg-adawi-beige transition-all duration-200 shadow-lg font-medium disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-5 h-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    Actualiser
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Cartes de statistiques principales */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
                        {/* <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                                    <Package className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatNumber(stats.total_products)}
                                    </p>
                                    <p className="text-sm text-gray-500">Produits Total</p>
                                </div>
                            </div>
                            <span className="text-sm text-gray-600">En inventaire</span>
                        </div> */}

                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                                    <TrendingDown className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatNumber(stats.low_stock_count)}
                                    </p>
                                    <p className="text-sm text-gray-500">Stock Faible</p>
                                </div>
                            </div>
                            <div className="flex items-center text-orange-600">
                                <ArrowUpRight className="w-4 h-4 mr-1" />
                                <span className="text-sm font-medium">À surveiller</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                                    <AlertTriangle className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatNumber(stats.out_of_stock_count)}
                                    </p>
                                    <p className="text-sm text-gray-500">Rupture de Stock</p>
                                </div>
                            </div>
                            <span className="text-sm text-red-600">Action requise</span>
                        </div>

                        {stats.average_stock !== undefined && (
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                                        <BarChart3 className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-900">
                                            {formatNumber(Math.round(stats.average_stock))}
                                        </p>
                                        <p className="text-sm text-gray-500">Stock Moyen</p>
                                    </div>
                                </div>
                                <span className="text-sm text-gray-600">Par produit</span>
                            </div>
                        )}
                    </div>

                    {/* Section alertes inventaire */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Alertes Inventaire</h2>
                            <div className="flex items-center gap-2">
                                {lowStockProducts.length > 0 ? (
                                    <div className="flex items-center gap-1 text-red-600">
                                        <AlertTriangle className="w-4 h-4" />
                                        <span className="text-sm font-medium">{lowStockProducts.length}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-green-600">
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="text-sm font-medium">Aucun</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Produits en rupture de stock */}
                            {criticalAlerts.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-red-600 mb-3 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        Produits en rupture de stock ({criticalAlerts.length})
                                    </h4>
                                    <ul className="space-y-2">
                                        {criticalAlerts.map((alert) => (
                                            <li key={alert.product_id} className="text-sm text-gray-700 bg-red-50 p-3 rounded-lg hover:bg-red-100 transition-colors">
                                                <Link to={"#"}
                                                onClick={(e) => e.preventDefault()}
                                                className="block w-full cursor-pointer">
                                                    
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{alert.product_name}</p>
                                                            <p className="text-xs text-gray-500">Stock: {alert.current_stock} / Min: {alert.low_stock_threshold}</p>
                                                        </div>
                                                        <div className="text-red-600 font-semibold">
                                                            RUPTURE
                                                        </div>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Produits en stock faible */}
                            {lowStockAlerts.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-orange-600 mb-3 flex items-center gap-2">
                                        <TrendingDown className="w-4 h-4" />
                                        Produits en stock faible ({lowStockAlerts.length})
                                    </h4>
                                    <ul className="space-y-2">
                                        {lowStockAlerts.map((alert) => (
                                            <li key={alert.product_id} className="text-sm text-gray-700 bg-orange-50 p-3 rounded-lg hover:bg-orange-100 transition-colors">
                                                <Link
                                                // `/seller/products/${alert.product_id}/edit`
                                                    to="#"
                                                    onClick={(e) => e.preventDefault()}
                                                    className="block w-full cursor-pointer"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{alert.product_name}</p>
                                                            <p className="text-xs text-gray-500">
                                                                Stock: {alert.current_stock} / Min: {alert.low_stock_threshold}
                                                            </p>
                                                        </div>
                                                        <div className="text-orange-600 font-semibold">FAIBLE</div>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Aucun alerte */}
                            {lowStockProducts.length === 0 && (
                                <div className="text-center py-8">
                                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                    <p className="text-gray-600 text-lg">Aucune alerte d'inventaire</p>
                                    <p className="text-gray-500 text-sm">Tous vos produits sont en stock suffisant</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
}

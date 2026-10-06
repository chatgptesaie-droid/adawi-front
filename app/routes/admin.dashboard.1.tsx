import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Footer from "~/components/Footer";

export const meta: MetaFunction = () => {
    return [
        { title: "Dashboard Admin - Statistiques" },
        { name: "description", content: "Statistiques globales de la plateforme." },
    ];
};

interface RevenueEvolution {
    date: string;
    revenue: number;
    orders_count: number;
}

interface SalesByCategory {
    category_name: string;
    total_sales: number;
    product_count: number;
    percentage: number;
}

interface UserGrowth {
    date: string;
    new_clients: number;
    new_vendors: number;
    total_users: number;
}

interface GeographicSales {
    region: string;
    sales_count: number;
    revenue: number;
}

interface RecentOrder {
    order_id: string;
    user_name: string;
    total: number;
    status: string;
    created_at: string;
}

interface LoaderData {
    total_revenue: number;
    total_orders: number;
    total_customers: number;
    total_vendors: number;
    total_products: number;
    commission_collected: number;
    total_cost: number;
    gross_profit: number;
    gross_margin_percent: number;
    refunds_count: number;
    refunds_total_amount: number;
    low_stock_products: number;
    revenue_growth: number;
    orders_growth: number;
    customers_growth: number;
    revenue_evolution: RevenueEvolution[];
    sales_by_category: SalesByCategory[];
    user_growth: UserGrowth[];
    geographic_sales: GeographicSales[];
    recent_orders: RecentOrder[];
}

export async function loader({ params }: LoaderFunctionArgs) {
    const response = await fetch(`http://localhost:8000/dashboard/admin`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Response("Failed to fetch admin dashboard data", { status: response.status });
    }

    const data: LoaderData = await response.json();
    return json(data);
}

export default function AdminDashboard() {
    const {
        total_revenue,
        total_orders,
        total_customers,
        total_vendors,
        total_products,
        commission_collected,
        total_cost,
        gross_profit,
        gross_margin_percent,
        refunds_count,
        refunds_total_amount,
        low_stock_products,
        revenue_growth,
        orders_growth,
        customers_growth,
        revenue_evolution,
        sales_by_category,
        user_growth,
        geographic_sales,
        recent_orders,
    } = useLoaderData<LoaderData>();

    return (
        <div className="min-h-screen bg-white">
            <TopBanner />
            <Header />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                <h1 className="text-2xl font-bold text-black mb-4">Dashboard Admin</h1>
                <p className="text-lg text-gray-700 mb-6">Statistiques globales de la plateforme</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 shadow-md">
                        <h2 className="text-xl font-semibold">Revenu Total</h2>
                        <p className="text-2xl font-bold">{total_revenue} F CFA</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-md">
                        <h2 className="text-xl font-semibold">Total Commandes</h2>
                        <p className="text-2xl font-bold">{total_orders}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-md">
                        <h2 className="text-xl font-semibold">Total Clients</h2>
                        <p className="text-2xl font-bold">{total_customers}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-md">
                        <h2 className="text-xl font-semibold">Total Vendeurs</h2>
                        <p className="text-2xl font-bold">{total_vendors}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-md">
                        <h2 className="text-xl font-semibold">Total Produits</h2>
                        <p className="text-2xl font-bold">{total_products}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-md">
                        <h2 className="text-xl font-semibold">Commission Collectée</h2>
                        <p className="text-2xl font-bold">{commission_collected} F CFA</p>
                    </div>
                </div>

                <h2 className="text-xl font-semibold mb-4">Évolution des Revenus</h2>
                <ul className="mb-6">
                    {revenue_evolution.map((item, index) => (
                        <li key={index} className="flex justify-between">
                            <span>{item.date}</span>
                            <span>{item.revenue} F CFA ({item.orders_count} commandes)</span>
                        </li>
                    ))}
                </ul>

                <h2 className="text-xl font-semibold mb-4">Ventes par Catégorie</h2>
                <ul className="mb-6">
                    {sales_by_category.map((category, index) => (
                        <li key={index} className="flex justify-between">
                            <span>{category.category_name}</span>
                            <span>{category.total_sales} F CFA ({category.product_count} produits)</span>
                        </li>
                    ))}
                </ul>

                <h2 className="text-xl font-semibold mb-4">Croissance des Utilisateurs</h2>
                <ul className="mb-6">
                    {user_growth.map((growth, index) => (
                        <li key={index} className="flex justify-between">
                            <span>{growth.date}</span>
                            <span>{growth.new_clients} nouveaux clients, {growth.new_vendors} nouveaux vendeurs</span>
                        </li>
                    ))}
                </ul>

                <h2 className="text-xl font-semibold mb-4">Ventes Géographiques</h2>
                <ul className="mb-6">
                    {geographic_sales.map((sale, index) => (
                        <li key={index} className="flex justify-between">
                            <span>{sale.region}</span>
                            <span>{sale.sales_count} ventes, {sale.revenue} F CFA</span>
                        </li>
                    ))}
                </ul>

                <h2 className="text-xl font-semibold mb-4">Commandes Récentes</h2>
                <ul className="mb-6">
                    {recent_orders.map((order, index) => (
                        <li key={index} className="flex justify-between">
                            <span>{order.order_id} - {order.user_name}</span>
                            <span>{order.total} F CFA - {order.status}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <Footer />
        </div>
    );
}

import { TrendingUp, TrendingDown, Users, Eye, RotateCcw } from "lucide-react";
import { useState } from "react";

interface StatsCardsProps {
  data: {
    total_revenue: number;
    total_orders: number;
    total_customers: number;
    refunds_count: number;
    revenue_growth: number;
    orders_growth: number;
    customers_growth: number;
    total_visiteurs: number;
    weekly_revenue: number;
    weekly_orders: number;
    total_commande_semaine:number;
    total_orders_week: number;
    weekly_customers: number;
    total_revenue_week: number;
    total_visiteurs_semaine: number;
    pourcentage_visiteurs_semaine: number;
    pourcentage_visiteur_total: number;
    pourcentage_revenue_semaine: number;
    total_revenue_semaine: number;
    weekly_revenue_growth: number;
    weekly_orders_growth: number;
    weekly_customers_growth: number;
    weekly_visitors_growth: number;
  };
}

export default function StatsCards({ data }: StatsCardsProps) {
  const [showWeekly, setShowWeekly] = useState(true);

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) {
      return "0";
    }
    return num.toLocaleString();
  };

  const stats = [
    {
      title: showWeekly ? "Ventes Semaine" : "Ventes Totales",
      value: formatNumber(showWeekly ? data.total_revenue_week : data.total_revenue),
      unit: "F CFA",
      // change: showWeekly
      //   ? `${data.pourcentage_revenue_semaine >= 0 ? '+' : ''}${data.pourcentage_revenue_semaine}%`
      //   : `${data.revenue_growth >= 0 ? '+' : ''}${data.revenue_growth}%`,
      // changeValue: showWeekly ? "+347k cette semaine" : "+347k cette semaine",
      trend: showWeekly
        ? (data.pourcentage_revenue_semaine >= 0 ? "up" : "down")
        : (data.revenue_growth >= 0 ? "up" : "down"),
      icon: TrendingUp,
      bgColor: "bg-gray-800",
      textColor: "text-white",
      hasWeeklyData: true
    },
    {
      title: showWeekly ? "Commandes Semaine" : "Commandes",
      value: formatNumber(showWeekly ? data.total_orders_week : data.total_orders),
      subtitle: showWeekly ? "Commandes cette semaine" : "Total des commandes",
      // change: showWeekly
      //   ? `${data.weekly_orders_growth >= 0 ? '+' : ''}${data.weekly_orders_growth}%`
      //   : `${data.orders_growth >= 0 ? '+' : ''}${data.orders_growth}%`,
      // changeValue: showWeekly ? "+120 cette semaine" : "+120 cette semaine",
      trend: showWeekly
        ? (data.weekly_orders_growth >= 0 ? "up" : "down")
        : (data.orders_growth >= 0 ? "up" : "down"),
      icon: Users,
      bgColor: "bg-white",
      textColor: "text-gray-900",
      hasWeeklyData: true
    },
    {
      title: showWeekly ? "Clients Semaine" : "Clients",
      value: formatNumber(showWeekly ? data.weekly_customers : data.total_customers),
      subtitle: showWeekly ? "Clients cette semaine" : "Nombre de clients",
      // change: showWeekly
        //  ? `${data.weekly_customers_growth >= 0 ? '+' : ''}${data.weekly_customers_growth}%`
      //   : `${data.customers_growth >= 0 ? '+' : ''}${data.customers_growth}%`,
      // changeValue: showWeekly ? "+1.2k cette semaine" : "+1.2k cette semaine",
      trend: showWeekly
        ? (data.weekly_customers_growth >= 0 ? "up" : "down")
        : (data.customers_growth >= 0 ? "up" : "down"),
      icon: Eye,
      bgColor: "bg-white",
      textColor: "text-gray-900",
      hasWeeklyData: true
    },
    {
      title: showWeekly ? "Visiteurs Semaine" : "Visiteurs Totaux",
      value: formatNumber(showWeekly ? data.total_visiteurs_semaine : data.total_visiteurs),
      subtitle: showWeekly ? "Visiteurs cette semaine" : "Nombre de visiteurs",
      change: showWeekly
        ? `${data.pourcentage_visiteurs_semaine >= 0 ? '+' : ''}${data.pourcentage_visiteurs_semaine}%`
        : `${data.pourcentage_visiteur_total >= 0 ? '+' : ''}${data.pourcentage_visiteur_total}%`,
      changeValue: showWeekly ? "" : "",
      trend: showWeekly
        ? (data.pourcentage_visiteurs_semaine >= 0 ? "up" : "down")
        : (data.pourcentage_visiteur_total >= 0 ? "up" : "down"),
      icon: Eye,
      bgColor: "bg-white",
      textColor: "text-gray-900",
      hasWeeklyData: true
    },
    {
      title: "Remboursements",
      value: formatNumber(data.refunds_count),
      subtitle: "Nombre de remboursements",
      change: "",
      changeValue: "",
      trend: "down",
      icon: RotateCcw,
      bgColor: "bg-white",
      textColor: "text-gray-900",
      hasWeeklyData: false
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const isPositive = stat.trend === "up";

        return (
          <div
            key={index}
            className={`${stat.bgColor} rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200`}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`p-1.5 sm:p-2 rounded-lg ${stat.bgColor === 'bg-gray-800' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.bgColor === 'bg-gray-800' ? 'text-white' : 'text-gray-600'}`} />
              </div>
              {stat.hasWeeklyData && (
                <button
                  onClick={() => setShowWeekly(!showWeekly)}
                  className={`${stat.textColor} hover:opacity-70 transition-opacity`}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>

            <div className="mb-2">
              <h3 className={`text-xs sm:text-sm font-medium ${stat.textColor} opacity-70 mb-1`}>
                {stat.title}
              </h3>
              {stat.subtitle && (
                <p className={`text-xs ${stat.textColor} opacity-50 mb-2`}>
                  {stat.subtitle}
                </p>
              )}
            </div>

            <div className="mb-3 sm:mb-4">
              <div className="flex items-baseline">
                <span className={`text-xl sm:text-2xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </span>
                {stat.unit && (
                  <span className={`text-xs sm:text-sm ${stat.textColor} opacity-70 ml-1`}>
                    {stat.unit}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <div className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? (
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                )}
                <span className="text-xs sm:text-sm font-medium">{stat.change}</span>
              </div>
              <span className={`text-xs ${stat.textColor} opacity-50 ml-2 truncate`}>
                {stat.changeValue}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

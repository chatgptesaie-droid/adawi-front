import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface SalesChartProps {
  data: {
    revenue_evolution: Array<{ date: string; revenue: number; orders_count: number }>;
    cost_revenue_evolution: Array<{ date: string; cost: number }>;
  };
  token: string;
}

export default function SalesChart({ data, token }: SalesChartProps) {
  const [timeRange, setTimeRange] = useState("14-days");

  // Combine revenue and cost data
  const baseChartData = data.revenue_evolution.map((rev, index) => ({
    date: new Date(rev.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    revenus: rev.revenue,
    couts: data.cost_revenue_evolution[index]?.cost || 0,
  }));

  const getFilteredData = () => {
    switch (timeRange) {
      case "7-days":
        return baseChartData.slice(-7);
      case "30-days":
        return [...baseChartData, ...baseChartData.slice(0, 16)].slice(-30);
      default:
        return baseChartData;
    }
  };

  const chartData = getFilteredData();

  const chartWidth = 700;
  const chartHeight = 300;

  const allValues = chartData.flatMap((d) => [d.revenus, d.couts]);
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues);
  const padding = (maxValue - minValue) * 0.1;
  const chartMax = maxValue + padding;
  const chartMin = Math.max(0, minValue - padding);

  const getX = (i: number) => (i / (chartData.length - 1)) * chartWidth;
  const getY = (val: number) =>
    chartHeight - ((val - chartMin) / (chartMax - chartMin)) * chartHeight;

  const revenusPoints = chartData.map((d, i) => `${getX(i)},${getY(d.revenus)}`).join(" ");
  const coutsPoints = chartData.map((d, i) => `${getX(i)},${getY(d.couts)}`).join(" ");

  const formatValue = (val: number) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val);

  const handleExport = async () => {
    const daysMap: Record<string, number> = {
      "7-days": 7,
      "14-days": 14,
      "30-days": 30,
    };
    const days = daysMap[timeRange] || 30;

    try {
    const response = await fetch(`/api.admin.export.sales?range_days=${days}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
      if (!response.ok) {
        throw new Error("Failed to export CSV");
      }
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `ventes-export-${days}.csv`;
      link.click();
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Erreur lors de l'export CSV");
    }
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          Performance des Ventes
        </h3>

        <div className="flex gap-3 flex-wrap">
          {/* <button
            onClick={handleExport}
            className="flex items-center px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Exporter CSV
            <ChevronDown className="w-4 h-4 ml-2" />
          </button> */}

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <option value="7-days">7 derniers jours</option>
            <option value="14-days">14 derniers jours</option>
            <option value="30-days">30 derniers jours</option>
          </select>
        </div>
      </div>

      {/* Légende */}
      <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-gray-800 rounded-full" />
          Revenus
        </div>
        {/* <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-gray-300 rounded-full" />
          Coûts
        </div> */}
      </div>

      {/* Chart */}
      <div className="h-64 relative pl-10 pr-2">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full">
          {/* Grille horizontale */}
          {[0.25, 0.5, 0.75, 1].map((p, i) => (
            <line
              key={i}
              x1="0"
              y1={chartHeight * p}
              x2={chartWidth}
              y2={chartHeight * p}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          ))}

          {/* Grille verticale */}
          {chartData.map((_, i) => {
            if (i % 2 === 0) {
              return (
                <line
                  key={i}
                  x1={getX(i)}
                  y1={0}
                  x2={getX(i)}
                  y2={chartHeight}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
              );
            }
            return null;
          })}

          {/* Lignes */}
          <polyline fill="none" stroke="#d1d5db" strokeWidth="2" points={coutsPoints} />
          <polyline fill="none" stroke="#1f2937" strokeWidth="2" points={revenusPoints} />

          {/* Points */}
          {chartData.map((d, i) => (
            <circle
              key={`revenus-${i}`}
              cx={getX(i)}
              cy={getY(d.revenus)}
              r="4"
              fill="#1f2937"
              stroke="white"
              strokeWidth="1"
            />
          ))}
          {chartData.map((d, i) => (
            <circle
              key={`couts-${i}`}
              cx={getX(i)}
              cy={getY(d.couts)}
              r="4"
              fill="#d1d5db"
              stroke="white"
              strokeWidth="1"
            />
          ))}
        </svg>

        {/* Labels Y (bien positionnés) */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
          {[chartMax, chartMax * 0.75, chartMax * 0.5, chartMax * 0.25, chartMin].map((v, i) => (
            <div key={i} className="h-full flex items-center">
              <span>{formatValue(Math.round(v))}</span>
            </div>
          ))}
        </div>

        {/* Labels X */}
        <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-gray-500 px-2">
          {chartData.map((d, i) =>
            i % Math.ceil(chartData.length / 5) === 0 || i === chartData.length - 1 ? (
              <span key={i} className="text-[10px]">
                {d.date}
              </span>
            ) : (
              <span key={i} className="text-[10px] opacity-0">
                {d.date}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}

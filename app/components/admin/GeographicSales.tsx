import { MapPin, TrendingUp } from "lucide-react";

interface GeographicData {
  region: string;
  sales_count: number;
  revenue: number;
}

interface GeographicSalesProps {
  data: GeographicData[];
}

export default function GeographicSales({ data }: GeographicSalesProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventes par Région</h3>
        <div className="flex items-center justify-center h-48 text-gray-500">
          Aucune donnée disponible
        </div>
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  const maxRevenue = Math.max(...sortedData.map(d => d.revenue));
  const totalRevenue = sortedData.reduce((sum, d) => sum + d.revenue, 0);
  const totalSales = sortedData.reduce((sum, d) => sum + d.sales_count, 0);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  const getRegionFlag = (region: string) => {
    const regionFlags: { [key: string]: string } = {
      'Maritime': '',
      'Plateaux': '',
      'Centrale': '',
      'Kara': '',
      'Savanes': '',
      'Lomé': '',
      'Kpalimé': '',
      'Sokodé': '',
      'Dapaong': ''
    };
    return regionFlags[region] || '';
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Ventes par Région</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{sortedData.length} régions</span>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
              <div className="text-xs text-gray-600">Revenus Total</div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-blue-900">{totalSales}</div>
              <div className="text-xs text-blue-600">Ventes Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Regions List */}
      <div className="space-y-4">
        {sortedData.map((region, index) => {
          const percentage = maxRevenue > 0 ? (region.revenue / maxRevenue) * 100 : 0;
          const revenuePercentage = totalRevenue > 0 ? (region.revenue / totalRevenue) * 100 : 0;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getRegionFlag(region.region)}</span>
                  <div>
                    <div className="font-medium text-gray-900">{region.region}</div>
                    <div className="text-xs text-gray-500">
                      {region.sales_count} ventes • {revenuePercentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(region.revenue)} F CFA
                  </div>
                  <div className="text-xs text-gray-500">
                    #{index + 1}
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    index === 0 ? 'bg-blue-600' : 
                    index === 1 ? 'bg-blue-500' : 
                    index === 2 ? 'bg-blue-400' : 'bg-gray-400'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Données des 30 derniers jours</span>
          <button className="text-blue-600 hover:text-blue-800">
            Voir détails →
          </button>
        </div>
      </div>
    </div>
  );
}
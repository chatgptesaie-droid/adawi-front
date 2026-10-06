import { Users, UserCheck } from "lucide-react";

interface UserGrowthData {
  date: string;
  new_clients: number;
  new_vendors: number;
  total_users: number;
}

interface UserGrowthChartProps {
  data: UserGrowthData[];
}

export default function UserGrowthChart({ data }: UserGrowthChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Croissance Utilisateurs</h3>
        <div className="flex items-center justify-center h-48 text-gray-500">
          Aucune donnée disponible
        </div>
      </div>
    );
  }

  const chartWidth = 400;
  const chartHeight = 200;

  const allValues = data.flatMap(d => [d.new_clients, d.new_vendors]);
  const maxValue = Math.max(...allValues, 1);
  const minValue = 0;

  const getX = (i: number) => (i / (data.length - 1)) * chartWidth;
  const getY = (val: number) => chartHeight - ((val - minValue) / (maxValue - minValue)) * chartHeight;

  const clientsPoints = data.map((d, i) => `${getX(i)},${getY(d.new_clients)}`).join(" ");
  const vendorsPoints = data.map((d, i) => `${getX(i)},${getY(d.new_vendors)}`).join(" ");

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    } catch {
      return dateString;
    }
  };

  const totalNewUsers = data.reduce((sum, d) => sum + d.new_clients + d.new_vendors, 0);
  const totalClients = data.reduce((sum, d) => sum + d.new_clients, 0);
  const totalVendors = data.reduce((sum, d) => sum + d.new_vendors, 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Croissance Utilisateurs</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">{totalNewUsers}</span>
          <span>nouveaux utilisateurs</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-blue-900">{totalClients}</div>
              <div className="text-xs text-blue-600">Nouveaux Clients</div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-green-900">{totalVendors}</div>
              <div className="text-xs text-green-600">Nouveaux Vendeurs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-500 rounded-full" />
          Clients
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full" />
          Vendeurs
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 relative pl-8 pr-2">
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

          {/* Lignes */}
          <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points={clientsPoints} />
          <polyline fill="none" stroke="#10b981" strokeWidth="2" points={vendorsPoints} />

          {/* Points */}
          {data.map((d, i) => (
            <circle
              key={`clients-${i}`}
              cx={getX(i)}
              cy={getY(d.new_clients)}
              r="3"
              fill="#3b82f6"
              stroke="white"
              strokeWidth="1"
            />
          ))}
          {data.map((d, i) => (
            <circle
              key={`vendors-${i}`}
              cx={getX(i)}
              cy={getY(d.new_vendors)}
              r="3"
              fill="#10b981"
              stroke="white"
              strokeWidth="1"
            />
          ))}
        </svg>

        {/* Labels Y */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
          {[maxValue, Math.round(maxValue * 0.75), Math.round(maxValue * 0.5), Math.round(maxValue * 0.25), 0].map((v, i) => (
            <div key={i} className="h-full flex items-center">
              <span>{v}</span>
            </div>
          ))}
        </div>

        {/* Labels X */}
        <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-gray-500 px-2">
          {data.map((d, i) =>
            i % Math.ceil(data.length / 4) === 0 || i === data.length - 1 ? (
              <span key={i} className="text-[10px]">
                {formatDate(d.date)}
              </span>
            ) : (
              <span key={i} className="text-[10px] opacity-0">
                {formatDate(d.date)}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
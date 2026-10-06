import { Package, Clock, CheckCircle, XCircle, Truck } from "lucide-react";

interface OrderStatusData {
  status: string;
  count: number;
}

interface OrdersStatusProps {
  data: OrderStatusData[];
}

export default function OrdersStatus({ data }: OrdersStatusProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statuts des Commandes</h3>
        <div className="flex items-center justify-center h-32 text-gray-500">
          Aucune donnée disponible
        </div>
      </div>
    );
  }

  const getStatusInfo = (status: string) => {
    const statusMap: { [key: string]: { 
      label: string, 
      icon: any, 
      color: string, 
      bgColor: string,
      textColor: string 
    }} = {
      'pending': {
        label: 'En Attente',
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-900'
      },
      'confirmed': {
        label: 'Confirmées',
        icon: CheckCircle,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-900'
      },
      'processing': {
        label: 'En Traitement',
        icon: Package,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-900'
      },
      'shipped': {
        label: 'Expédiées',
        icon: Truck,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        textColor: 'text-indigo-900'
      },
      'delivered': {
        label: 'Livrées',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        textColor: 'text-green-900'
      },
      'cancelled': {
        label: 'Annulées',
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        textColor: 'text-red-900'
      }
    };

    return statusMap[status.toLowerCase()] || {
      label: status,
      icon: Package,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-900'
    };
  };

  const totalOrders = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Statuts des Commandes</h3>
        <div className="text-sm text-gray-600">
          <span className="font-medium">{totalOrders}</span> total
        </div>
      </div>

      {/* Status List */}
      <div className="space-y-4">
        {data.map((item, index) => {
          const statusInfo = getStatusInfo(item.status);
          const Icon = statusInfo.icon;
          const percentage = totalOrders > 0 ? (item.count / totalOrders) * 100 : 0;

          return (
            <div key={index} className={`${statusInfo.bgColor} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${statusInfo.bgColor} rounded-lg border border-white/50`}>
                    <Icon className={`w-4 h-4 ${statusInfo.color}`} />
                  </div>
                  <div>
                    <div className={`font-medium ${statusInfo.textColor}`}>
                      {statusInfo.label}
                    </div>
                    <div className={`text-xs ${statusInfo.color}`}>
                      {percentage.toFixed(1)}% du total
                    </div>
                  </div>
                </div>
                <div className={`text-xl font-bold ${statusInfo.textColor}`}>
                  {item.count}
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-white/50 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${statusInfo.color.replace('text-', 'bg-')}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800">
          Voir toutes les commandes →
        </button>
      </div>
    </div>
  );
}
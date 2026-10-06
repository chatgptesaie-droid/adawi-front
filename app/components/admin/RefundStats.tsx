import { RotateCcw, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface RefundStatsData {
  total_refunds: number;
  total_refunded_amount: number;
  pending_refunds: number;
  approved_refunds: number;
  rejected_refunds: number;
  processed_refunds: number;
}

interface RefundStatsProps {
  data: RefundStatsData;
}

export default function RefundStats({ data }: RefundStatsProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  const refundItems = [
    {
      label: 'En Attente',
      value: data.pending_refunds,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      label: 'Approuvés',
      value: data.approved_refunds,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Rejetés',
      value: data.rejected_refunds,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      label: 'Traités',
      value: data.processed_refunds,
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  ];

  const pendingRate = data.total_refunds > 0 ? (data.pending_refunds / data.total_refunds) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Remboursements</h3>
        <div className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-600">{data.total_refunds}</span>
        </div>
      </div>

      {/* Main Stats */}
      <div className="mb-6 space-y-4">
        {/* Total Amount */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.total_refunded_amount)}
              </div>
              <div className="text-sm text-gray-600">F CFA remboursés</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-700">
                {data.total_refunds}
              </div>
              <div className="text-xs text-gray-500">demandes</div>
            </div>
          </div>
        </div>

        {/* Pending Alert */}
        {data.pending_refunds > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                {data.pending_refunds} remboursements en attente ({pendingRate.toFixed(0)}%)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Breakdown */}
      <div className="space-y-3">
        {refundItems.map((item, index) => {
          const Icon = item.icon;
          const percentage = data.total_refunds > 0 ? (item.value / data.total_refunds) * 100 : 0;

          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-1.5 ${item.bgColor} rounded`}>
                  <Icon className={`w-3 h-3 ${item.color}`} />
                </div>
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {item.value}
                </span>
                <div className="w-12 bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${item.color.replace('text-', 'bg-')}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-100">
       
      </div>
    </div>
  );
}
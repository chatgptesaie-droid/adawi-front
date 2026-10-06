import { useEffect, useState } from "react";
import { fetchRefundStats } from "~/services/refundService";

interface RefundStatsProps {
  token: string;
}

interface StatsData {
  counts: {
    rejected: number;
    pending: number;
    approved: number;
  };
  amounts: {
    rejected: number;
    pending: number;
    approved: number;
  };
  total_amount: number;
}

export default function RefundStats({ token }: RefundStatsProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, [token]);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRefundStats(token);
      setStats(data);
    } catch (err: any) {
      console.error("Error loading refund stats:", err);
      setError(err.message || "Erreur lors du chargement des statistiques");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiques des remboursements</h3>
        <div className="text-center py-4">Chargement des statistiques...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiques des remboursements</h3>
        <div className="text-red-600">Erreur: {error}</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiques des remboursements</h3>
        <div className="text-gray-500">Aucune statistique disponible</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiques des remboursements</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.counts.pending || 0}</div>
          <div className="text-sm text-blue-600">En attente</div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{stats.counts.rejected || 0}</div>
          <div className="text-sm text-yellow-600">Rejetés</div>
        </div>
        <div className="bg-green-400 p-4 rounded-lg">
          <div className="text-xl font-bold text-white">{stats.counts.approved || 0} </div>
          <div className="text-sm text-white">Approuvés</div>
        </div>

        <div className="bg-indigo-50 p-4 rounded-lg">
          <div className="text-xl font-bold text-indigo-600">{stats.total_amount?.toFixed(2)} F CFA</div>
          <div className="text-sm text-indigo-600">Montant total</div>
        </div>

      </div>

      <div className="mt-4">
        <button
          onClick={loadStats}
          className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 border border-indigo-300 rounded-md hover:bg-indigo-200"
        >
          Actualiser
        </button>
      </div>
    </div>
  );
}

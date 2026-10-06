import { useEffect, useState } from "react";
import { fetchRefunds, Refund } from "~/services/refundService";
import RefundModal from "./RefundModal";

interface RefundListProps {
  token: string;
  status?: "pending" | "approved" | "rejected" | "processed";
  skip?: number;
  limit?: number;
}

export default function RefundList({ token, status, skip = 0, limit = 50 }: RefundListProps) {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRefundId, setSelectedRefundId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function loadRefunds() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchRefunds(token, status || null, skip, limit);
        setRefunds(data);
      } catch (err: any) {
        console.error("Error fetching refunds:", err);
        setError(err.message || "Unknown error occurred while fetching refunds");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadRefunds();
    }
  }, [token, status, skip, limit]);

  const openModal = (refundId: string) => {
    setSelectedRefundId(refundId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedRefundId(null);
    setModalOpen(false);
  };

  const handleUpdate = () => {
    // Refresh the refund list after update
    if (token) {
      setLoading(true);
      fetchRefunds(token, status || null, skip, limit)
        .then(setRefunds)
        .catch((err) => setError(err.message || "Erreur lors du rafraîchissement"))
        .finally(() => setLoading(false));
    }
  };

  if (loading) {
    return <div>Chargement des remboursements...</div>;
  }

  if (error) {
    return <div className="text-red-600">Erreur: {error}</div>;
  }

  if (refunds.length === 0) {
    return <div>Aucun remboursement trouvé.</div>;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-md">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Commande</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Raison</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Commentaire</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Commentaire Admin</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Créé le</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mis à jour le</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {refunds.map((refund) => (
              <tr key={refund.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-700">{refund.id}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{refund.order_id}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{refund.amount.toFixed(2)}</td>
                <td className="px-4 py-2 text-sm text-gray-700 capitalize">{refund.status}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{refund.reason}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{refund.comment}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{refund.admin_comment}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{new Date(refund.created_at).toLocaleString()}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{new Date(refund.updated_at).toLocaleString()}</td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  <button
                    onClick={() => openModal(refund.id)}
                    className="text-indigo-600 hover:text-indigo-900 underline"
                  >
                    Voir détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <RefundModal
        token={token}
        refundId={selectedRefundId}
        isOpen={modalOpen}
        onClose={closeModal}
        onUpdate={handleUpdate}
      />
    </>
  );
}

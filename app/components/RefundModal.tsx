import { useEffect, useState } from "react";
import { fetchRefundDetails, updateRefund, Refund } from "~/services/refundService";

interface RefundModalProps {
  token: string;
  refundId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function RefundModal({ token, refundId, isOpen, onClose, onUpdate }: RefundModalProps) {
  const [refund, setRefund] = useState<Refund | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [newStatus, setNewStatus] = useState<Refund['status']>("pending");
  const [newAdminComment, setNewAdminComment] = useState("");

  useEffect(() => {
    if (isOpen && refundId) {
      loadRefundDetails();
    }
  }, [isOpen, refundId]);

  const loadRefundDetails = async () => {
    if (!refundId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await fetchRefundDetails(token, refundId);
      setRefund(data);
      setNewStatus(data.status);
      setNewAdminComment(data.admin_comment || "");
    } catch (err: any) {
      console.error("Error loading refund details:", err);
      setError(err.message || "Erreur lors du chargement des détails du remboursement");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!refund) return;

    setUpdating(true);
    setError(null);
    try {
      const updateData: { status?: Refund['status']; admin_comment?: string } = {};

      if (newStatus !== refund.status) {
        updateData.status = newStatus;
      }

      if (newAdminComment !== (refund.admin_comment || "")) {
        updateData.admin_comment = newAdminComment;
      }

      if (Object.keys(updateData).length > 0) {
        await updateRefund(token, refund.id, updateData);
        await loadRefundDetails(); // Reload the data
        onUpdate(); // Notify parent component
        setEditMode(false);
      }
    } catch (err: any) {
      console.error("Error updating refund:", err);
      setError(err.message || "Erreur lors de la mise à jour du remboursement");
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Détails du remboursement</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {loading && <div className="text-center py-4">Chargement...</div>}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {refund && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ID</label>
                <p className="mt-1 text-sm text-gray-900">{refund.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Commande</label>
                <p className="mt-1 text-sm text-gray-900">{refund.order_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Montant</label>
                <p className="mt-1 text-sm text-gray-900">{refund.amount.toFixed(2)} F CFA</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Utilisateur</label>
                <p className="mt-1 text-sm text-gray-900">{refund.user_id}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Raison</label>
              <p className="mt-1 text-sm text-gray-900">{refund.reason}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Commentaire client</label>
              <p className="mt-1 text-sm text-gray-900">{refund.comment}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Articles</label>
              <div className="mt-1 text-sm text-gray-900">
                {refund.items.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {refund.items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Aucun article spécifié</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Statut</label>
                {editMode ? (
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as Refund['status'])}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="pending">En attente</option>
                    <option value="approved">Approuvé</option>
                    <option value="rejected">Rejeté</option>
                    <option value="processed">Traité</option>
                  </select>
                ) : (
                  <p className="mt-1 text-sm text-gray-900 capitalize">{refund.status}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Commentaire admin</label>
                {editMode ? (
                  <textarea
                    value={newAdminComment}
                    onChange={(e) => setNewAdminComment(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{refund.admin_comment || "Aucun commentaire"}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Créé le</label>
                <p className="mt-1 text-sm text-gray-900">{new Date(refund.created_at).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mis à jour le</label>
                <p className="mt-1 text-sm text-gray-900">{new Date(refund.updated_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              {editMode ? (
                <>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={updating}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {updating ? "Mise à jour..." : "Mettre à jour"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 border border-indigo-300 rounded-md hover:bg-indigo-200"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Fermer
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

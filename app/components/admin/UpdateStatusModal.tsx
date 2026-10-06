import React, { useEffect, useState } from "react";

interface UpdateStatusModalProps {
  isOpen: boolean;
  orderId: string | null;      // ID de la commande
  token: string;               // token JWT passé par le parent
  currentStatus?: string;      // statut actuel pour pré-sélection
  onClose: () => void;
  onUpdated?: (updatedOrder: any) => void; // callback après succès
}

const API_BASE = "http://localhost:8000";

// Statuts acceptés par l'API: en_cours, expediee, livree, annulee, en preparation
const STATUSES = [
  { value: "en_cours",  label: "En cours" },
  { value: "en_preparation",  label: "en preparation" },
  { value: "expediee",  label: "Expédiée" },
  { value: "livree",    label: "Livrée" },
  { value: "annulee",   label: "Annulée" },
];

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  isOpen,
  orderId,
  token,
  currentStatus = "en_cours",
  onClose,
  onUpdated,
}) => {
  const [status, setStatus] = useState<string>(currentStatus);
  const [comment, setComment] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStatus(currentStatus);
      setComment("");
      setErr(null);
    }
  }, [isOpen, currentStatus]);

  if (!isOpen) return null;

  const submit = async () => {
    if (!orderId || !token) {
      setErr("Paramètres manquants.");
      return;
    }
    setLoading(true);
    setErr(null);

    try {
      const qs = new URLSearchParams({ status });
      if (comment.trim()) qs.append("comment", comment.trim());

      const res = await fetch(`${API_BASE}/orders/${orderId}/status?${qs.toString()}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Impossible de mettre à jour le statut");
      }

      const updated = await res.json();
      onUpdated?.(updated);
      onClose();
    } catch (e: any) {
      setErr(e?.message || "Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Mettre à jour le statut</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {err && <div className="mb-3 text-sm text-red-600">{err}</div>}

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Nouveau statut</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              {STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Commentaire (optionnel)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 min-h-[90px]"
              placeholder="Motif, note interne…"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-adawi-gold text-white disabled:opacity-60"
          >
            {loading ? "Mise à jour…" : "Mettre à jour"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateStatusModal;

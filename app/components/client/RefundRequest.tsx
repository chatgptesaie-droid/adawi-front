import { useState } from "react";

export default function RefundRequest() {
    const [orderId, setOrderId] = useState("");
    const [reason, setReason] = useState("other");
    const [comment, setComment] = useState("");
    const [items, setItems] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch("/refunds/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    order_id: orderId,
                    reason,
                    comment,
                    items,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail[0].msg || "Erreur lors de la demande de remboursement");
            }

            const data = await response.json();
            setSuccess(`Remboursement demandé avec succès. ID: ${data.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur inconnue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-white rounded-2xl shadow">
            <h1 className="text-2xl font-bold mb-4">Demande de Remboursement</h1>

            {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>}
            {success && <div className="bg-green-100 text-green-600 p-3 rounded mb-4">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">ID de Commande</label>
                    <input
                        type="text"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        required
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Raison</label>
                    <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full border p-2 rounded"
                    >
                        <option value="other">Autre</option>
                        <option value="damaged">Article endommagé</option>
                        <option value="wrong_item">Article incorrect</option>
                        <option value="not_satisfied">Insatisfait</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium">Commentaire</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Articles à retourner (IDs séparés par des virgules)</label>
                    <input
                        type="text"
                        value={items.join(",")}
                        onChange={(e) => setItems(e.target.value.split(",").map(item => item.trim()))}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-adawi-brown text-white py-2 rounded hover:bg-adawi-brown/90 transition"
                >
                    {loading ? "Traitement..." : "Soumettre la demande"}
                </button>
            </form>
        </div>
    );
}

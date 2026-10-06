import { useState } from "react";
import { X } from "lucide-react";
import type { Ticket } from "~/routes/admin.support";

interface UpdateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  onUpdateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
}

export default function UpdateTicketModal({ isOpen, onClose, ticket, onUpdateTicket }: UpdateTicketModalProps) {
  const [formData, setFormData] = useState({
    status: ticket.status,
    priority: ticket.priority,
    category: ticket.category,
    assigned_to: ticket.assigned_to || "",
    note: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updates: Partial<Ticket> = {
        status: formData.status as Ticket['status'],
        priority: formData.priority as Ticket['priority'],
        category: formData.category as Ticket['category'],
        assigned_to: formData.assigned_to || undefined
      };

      await onUpdateTicket(ticket.id, updates);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Mettre à jour le ticket #{ticket.id}
            </h3>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-500 focus:outline-none disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none disabled:opacity-50"
              >
                <option value="ouvert">Ouvert</option>
                <option value="en_cours">En cours</option>
                <option value="resolu">Résolu</option>
                <option value="ferme">Fermé</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priorité
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none disabled:opacity-50"
              >
                <option value="basse">Basse</option>
                <option value="normale">Normale</option>
                <option value="haute">Haute</option>
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none disabled:opacity-50"
              >
                <option value="commande">Commande</option>
                <option value="produit">Produit</option>
                <option value="paiement">Paiement</option>
                <option value="livraison">Livraison</option>
                <option value="technique">Technique</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div>
              <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700 mb-2">
                Assigné à (optionnel)
              </label>
              <input
                type="text"
                id="assigned_to"
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none disabled:opacity-50"
                placeholder="ID de l'agent assigné"
              />
            </div>

            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                Note interne (optionnelle)
              </label>
              <textarea
                id="note"
                name="note"
                rows={3}
                value={formData.note}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none resize-none disabled:opacity-50"
                placeholder="Ajouter une note interne (visible uniquement par l'équipe)"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-brown transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Mise à jour...</span>
                  </>
                ) : (
                  <span>Mettre à jour</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

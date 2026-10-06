import { useState } from "react";
import { X, Send, User, MessageCircle, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import type { Ticket } from "~/routes/admin.support";

interface ViewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  onAddResponse: (ticketId: string, responseText: string) => void;
  onUpdateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
}

export default function ViewTicketModal({ isOpen, onClose, ticket, onAddResponse, onUpdateTicket }: ViewTicketModalProps) {
  const [responseText, setResponseText] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (responseText.trim()) {
      onAddResponse(ticket.id, responseText);
      setResponseText("");
    }
  };

  const handleStatusChange = (newStatus: Ticket['status']) => {
    onUpdateTicket(ticket.id, { status: newStatus });
  };

  // Fonction pour obtenir l'icône et la couleur du statut
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "resolu":
        return { 
          icon: <CheckCircle className="w-4 h-4" />, 
          color: "bg-green-100 text-green-800" 
        };
      case "en_cours":
        return { 
          icon: <MessageCircle className="w-4 h-4" />, 
          color: "bg-blue-100 text-blue-800" 
        };
      case "ouvert":
        return { 
          icon: <Clock className="w-4 h-4" />, 
          color: "bg-yellow-100 text-yellow-800" 
        };
      case "ferme":
        return { 
          icon: <XCircle className="w-4 h-4" />, 
          color: "bg-gray-100 text-gray-800" 
        };
      default:
        return { 
          icon: <AlertCircle className="w-4 h-4" />, 
          color: "bg-gray-100 text-gray-800" 
        };
    }
  };

  // Fonction pour obtenir la couleur de la priorité
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "haute":
        return "bg-red-100 text-red-800";
      case "normale":
        return "bg-blue-100 text-blue-800";
      case "basse":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const statusInfo = getStatusInfo(ticket.status);
  const priorityColor = getPriorityColor(ticket.priority);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <MessageCircle className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  #{ticket.id.slice(-8)} - {ticket.title}
                </h3>
                <p className="text-sm text-gray-500">
                  Créé le {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Ticket Details */}
            <div className="md:col-span-2 space-y-6">
              {/* Original Message */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-gray-200 rounded-full mr-3">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{ticket.customer_name}</p>
                    <p className="text-sm text-gray-500">{new Date(ticket.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <div className="text-gray-800 whitespace-pre-wrap">
                  {ticket.description}
                </div>
              </div>

              {/* Messages placeholder - À implémenter selon votre API */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Messages ({ticket.messages_count})</h4>
                <div className="text-sm text-gray-500 italic">
                  Les messages détaillés seront affichés ici une fois l'API des messages implémentée.
                </div>
              </div>

              {/* Reply Form */}
              {ticket.status !== "ferme" && ticket.status !== "resolu" && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-2">
                      Votre réponse
                    </label>
                    <textarea
                      id="response"
                      rows={4}
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none resize-none"
                      placeholder="Tapez votre réponse ici..."
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!responseText.trim()}
                      className={`flex items-center px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-brown transition-colors ${
                        !responseText.trim() ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Envoyer
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Right Column - Customer Info & Actions */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Informations Client</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="p-2 bg-gray-100 rounded-full mr-3">
                      <User className="w-8 h-8 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{ticket.customer_name}</p>
                      <p className="text-sm text-gray-500">Client #{ticket.customer_id.slice(-8)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Info */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Détails du Ticket</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Numéro</p>
                    <p className="text-gray-900">#{ticket.id.slice(-8)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Catégorie</p>
                    <p className="text-gray-900 capitalize">{ticket.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Priorité</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${priorityColor}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Statut</p>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                      {statusInfo.icon}
                      <span className="ml-1">{ticket.status}</span>
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date de création</p>
                    <p className="text-gray-900">{new Date(ticket.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  {ticket.order_id && (
                    <div>
                      <p className="text-sm text-gray-500">Commande associée</p>
                      <p className="text-gray-900">#{ticket.order_id.slice(-8)}</p>
                    </div>
                  )}
                  {ticket.assigned_to && (
                    <div>
                      <p className="text-sm text-gray-500">Assigné à</p>
                      <p className="text-gray-900">{ticket.assigned_to_name || ticket.assigned_to}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Actions</h4>
                <div className="space-y-2">
                  {ticket.status !== "resolu" && (
                    <button
                      onClick={() => handleStatusChange("resolu")}
                      className="w-full flex items-center justify-center px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Marquer comme résolu
                    </button>
                  )}

                  {ticket.status !== "en_cours" && ticket.status !== "resolu" && ticket.status !== "ferme" && (
                    <button
                      onClick={() => handleStatusChange("en_cours")}
                      className="w-full flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Marquer en traitement
                    </button>
                  )}

                  {ticket.status !== "ferme" && (
                    <button
                      onClick={() => handleStatusChange("ferme")}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-600 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Fermer le ticket
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

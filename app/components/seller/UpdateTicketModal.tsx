import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface UpdateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  onUpdateTicket: (ticketId: string, updates: Partial<Ticket>) => Promise<void>;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: "commande" | "produit" | "paiement" | "livraison" | "technique" | "autre";
  priority: "normale" | "haute" | "basse";
  order_id?: string;
  customer_id: string;
  customer_name: string;
  status: "ouvert" | "en_cours" | "resolu" | "ferme";
  assigned_to?: string;
  assigned_to_name?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  messages_count: number;
  last_message_at?: string;
}

const statusOptions = [
  { value: 'ouvert', label: 'Ouvert', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
  { value: 'en_cours', label: 'En cours', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  { value: 'resolu', label: 'Résolu', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { value: 'ferme', label: 'Fermé', color: 'bg-gray-100 text-gray-800', icon: X }
];

const priorityOptions = [
  { value: 'basse', label: 'Basse', color: 'bg-green-100 text-green-800', icon: '↓' },
  { value: 'normale', label: 'Normale', color: 'bg-blue-100 text-blue-800', icon: '→' },
  { value: 'haute', label: 'Haute', color: 'bg-orange-100 text-orange-800', icon: '↑' }
];

export default function UpdateTicketModal({ isOpen, onClose, ticket, onUpdateTicket }: UpdateTicketModalProps) {
  const [status, setStatus] = useState<Ticket['status']>('ouvert');
  const [priority, setPriority] = useState<Ticket['priority']>('normale');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (ticket && isOpen) {
      setStatus(ticket.status);
      setPriority(ticket.priority);
      setError(null);
      setSuccess(false);
    }
  }, [ticket, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;

    setIsLoading(true);
    setError(null);

    try {
      // Utiliser la fonction onUpdateTicket passée en prop au lieu de faire l'appel API directement
      await onUpdateTicket(ticket.id, { status, priority });
      setSuccess(true);

      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl relative animate-in fade-in-0 zoom-in-95 duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Mettre à jour le ticket
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Ticket #{ticket.id.slice(-6)} • {ticket.customer_name}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Ticket Info */}
          <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{ticket.title}</h4>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                {ticket.category}
              </span>
              <span className="text-xs bg-white px-2 py-1 rounded-full">
                Messages: {ticket.messages_count}
              </span>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl animate-in slide-in-from-top-1 duration-300">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">
                  Ticket mis à jour avec succès !
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl animate-in slide-in-from-top-1 duration-300">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <div className="flex-1">
                  <span className="text-red-800 font-medium">Erreur</span>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                  {error.includes('Session expirée') && (
                    <p className="text-red-600 text-xs mt-2">
                      Redirection vers la page de connexion...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Status Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Statut du ticket
                <span className="ml-2 text-xs font-normal text-gray-500">
                  (Actuel: {statusOptions.find(s => s.value === ticket.status)?.label})
                </span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {statusOptions.map((option) => {
                  const IconComponent = option.icon;
                  const isSelected = status === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setStatus(option.value as Ticket['status'])}
                      className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 shadow-md scale-105'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center">
                        <IconComponent className={`w-5 h-5 mr-2 ${
                          isSelected ? 'text-indigo-600' : 'text-gray-600'
                        }`} />
                        <span className="font-medium">{option.label}</span>
                      </div>
                      <div className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${option.color}`}>
                        {option.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Priorité
                <span className="ml-2 text-xs font-normal text-gray-500">
                  (Actuel: {priorityOptions.find(p => p.value === ticket.priority)?.label})
                </span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {priorityOptions.map((option) => {
                  const isSelected = priority === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPriority(option.value as Ticket['priority'])}
                      className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50 shadow-md scale-105'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className={`text-lg mr-2 ${
                          isSelected ? 'text-purple-600' : 'text-gray-600'
                        }`}>
                          {option.icon}
                        </span>
                        <span className="font-medium">{option.label}</span>
                      </div>
                      <div className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${option.color}`}>
                        {option.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading || success || (status === ticket.status && priority === ticket.priority)}
                className={`flex-1 px-4 py-3 text-white rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  success 
                    ? 'bg-green-600 focus:ring-green-300'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:ring-indigo-300 active:scale-95'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Mise à jour...
                  </div>
                ) : success ? (
                  <div className="flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Mis à jour !
                  </div>
                ) : (status === ticket.status && priority === ticket.priority) ? (
                  'Aucun changement'
                ) : (
                  'Mettre à jour'
                )}
              </button>
            </div>
          </form>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Mise à jour en cours...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
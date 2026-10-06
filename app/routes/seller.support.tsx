import { useState, useEffect } from "react";
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Search, Filter, Eye, MessageCircle, CheckCircle, XCircle, Clock, AlertCircle, X, User, UserPlus } from "lucide-react";
import ViewTicketModal from "~/components/admin/ViewTicketModal";
import UpdateTicketModal from "~/components/seller/UpdateTicketModal";
import { readToken } from "~/utils/session.server";
import SellerLayout from "~/components/seller/SellerLayout";
import { requireVendor } from "~/utils/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Support - Adawi Vendeur" },
    { name: "description", content: "Gestion des tickets de support vendeur" },
  ];
};

// Interface Ticket pour l'API vendor
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

// Loader pour récupérer les tickets du vendeur
export async function loader({ request }: LoaderFunctionArgs) {
  await requireVendor(request);
  const token = await readToken(request);

  if (!token) {
    throw new Response("Non autorisé", { status: 401 });
  }

  try {
    console.log(" Appel API tickets vendeur");

    const response = await fetch("http://localhost:8000/support/vendor/tickets", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const tickets = await response.json();
    console.log(` ${tickets.length} tickets vendeur chargés`);

    return json({ tickets, token });
  } catch (error) {
    console.error(" Erreur chargement tickets vendeur:", error);
    return json({ tickets: [], token, error: "Erreur lors du chargement des tickets" });
  }
}

export default function VendorSupport() {
  const { tickets: initialTickets, token } = useLoaderData<typeof loader>();

  // États pour les modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // État pour la recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  // État pour les filtres
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // État pour les tickets
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [assigningTickets, setAssigningTickets] = useState<Set<string>>(new Set());

  // Fonction pour recharger les tickets du vendeur
  const loadTickets = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/support/vendor/tickets",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Erreur lors du chargement des tickets");

      const newTickets = await response.json();
      setTickets(newTickets);
    } catch (error) {
      console.error("Erreur lors du chargement des tickets:", error);
    }
  };

  // Filtrage des tickets (côté client)
  const filteredTickets = tickets.filter((ticket: Ticket) => {
    // Filtre de recherche
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      ticket.customer_name.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtre de statut
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;

    // Filtre de priorité
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;

    // Filtre de catégorie
    const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  // Séparer les tickets assignés et non assignés
  const assignedTickets = filteredTickets.filter((ticket: Ticket) => ticket.assigned_to);
  const unassignedTickets = filteredTickets.filter((ticket: Ticket) => !ticket.assigned_to);

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

  // Fonction pour effacer la recherche
  const clearSearch = () => {
    setSearchTerm("");
  };

  // Fonction pour s'assigner un ticket
  const handleAssignTicket = async (ticketId: string) => {
    try {
      // Ajouter le ticket aux tickets en cours d'assignation
      setAssigningTickets((prev: Set<string>) => new Set([...prev, ticketId]));
      
      console.log(` Assignation du ticket ${ticketId}`);
      
      const response = await fetch(`http://localhost:8000/support/vendor/tickets/${ticketId}/assign`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erreur lors de l'assignation du ticket");
      }

      const assignedTicket = await response.json();
      console.log(" Ticket assigné avec succès");
      
      // Mettre à jour la liste des tickets
      setTickets((prevTickets: Ticket[]) => 
        prevTickets.map((ticket: Ticket) => 
          ticket.id === ticketId ? assignedTicket : ticket
        )
      );
      
    } catch (error: unknown) {
      console.error(" Erreur lors de l'assignation du ticket:", error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      alert("Erreur lors de l'assignation du ticket: " + errorMessage);
    } finally {
      // Retirer le ticket des tickets en cours d'assignation
      setAssigningTickets((prev: Set<string>) => {
        const newSet = new Set(prev);
        newSet.delete(ticketId);
        return newSet;
      });
    }
  };

  // Fonctions pour gérer les tickets (utiliser l'API vendor si disponible)
  const handleUpdateTicket = async (ticketId: string, updates: Partial<Ticket>) => {
    try {
      console.log(' Mise à jour du ticket:', ticketId, updates);

      // Utiliser l'endpoint correct pour la mise à jour du statut
      const queryParams = new URLSearchParams();
      if (updates.status) {
        queryParams.append('status', updates.status);
      }
      if (updates.priority) {
        queryParams.append('priority', updates.priority);
      }

      const response = await fetch(`http://localhost:8000/support/vendor/tickets/${ticketId}/status?${queryParams}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.message || `Erreur HTTP ${response.status}`;
        throw new Error(errorMessage);
      }

      const updatedTicket = await response.json();
      console.log(' Ticket mis à jour avec succès:', updatedTicket);
      
      // Mettre à jour la liste des tickets
      setTickets((prevTickets: Ticket[]) => 
        prevTickets.map((ticket: Ticket) => 
          ticket.id === ticketId ? { ...ticket, ...updatedTicket } : ticket
        )
      );
      
      setIsUpdateModalOpen(false);
    } catch (error: unknown) {
      console.error(" Erreur lors de la mise à jour du ticket:", error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw error; // Re-throw pour que le modal puisse gérer l'erreur
    }
  };

  // Fonctions pour ouvrir les modals
  const openViewModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsViewModalOpen(true);
  };

  const openUpdateModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsUpdateModalOpen(true);
  };

  // Fonction vide pour handleAddResponse (à adapter selon votre logique)
  const handleAddResponse = () => {};

  return (
    <SellerLayout userName="Nom du Vendeur">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-adawi-brown">Support Vendeur</h1>
          <p className="text-gray-600">Gérez vos tickets de support et les demandes des clients</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
                <p className="text-sm text-gray-600">Total Tickets</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg mr-3">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{unassignedTickets.length}</p>
                <p className="text-sm text-gray-600">Non Assignés</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{assignedTickets.length}</p>
                <p className="text-sm text-gray-600">Assignés à moi</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {tickets.filter((t: Ticket) => t.status === "resolu" || t.status === "ferme").length}
                </p>
                <p className="text-sm text-gray-600">Résolus/Fermés</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className={`relative rounded-lg transition-all duration-200 ${searchFocused ? 'ring-2 ring-adawi-gold shadow-sm' : 'hover:shadow-sm'}`}>
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${searchFocused ? 'text-adawi-gold' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Rechercher par numéro de ticket, sujet ou client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none"
                />
                {searchTerm && (
                  <button 
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Button */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-black px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filtres
              <span className={`ml-2 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}>
                
              </span>
            </button>
          </div>

          {/* Filtres étendus */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="ouvert">Ouvert</option>
                  <option value="en_cours">En cours</option>
                  <option value="resolu">Résolu</option>
                  <option value="ferme">Fermé</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priorité
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                >
                  <option value="all">Toutes les priorités</option>
                  <option value="haute">Haute</option>
                  <option value="normale">Normale</option>
                  <option value="basse">Basse</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                >
                  <option value="all">Toutes les catégories</option>
                  <option value="commande">Commande</option>
                  <option value="produit">Produit</option>
                  <option value="paiement">Paiement</option>
                  <option value="livraison">Livraison</option>
                  <option value="technique">Technique</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Section Tickets Non Assignés */}
        {unassignedTickets.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-orange-50 px-4 py-3 border-b border-orange-200">
              <h3 className="text-lg font-medium text-orange-800 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Tickets Non Assignés ({unassignedTickets.length})
              </h3>
              <p className="text-sm text-orange-600">Ces tickets nécessitent une prise en charge</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Ticket</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Client</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Catégorie</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Priorité</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {unassignedTickets.map((ticket: Ticket) => {
                    const statusInfo = getStatusInfo(ticket.status);
                    const priorityColor = getPriorityColor(ticket.priority);

                    return (
                      <tr key={ticket.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="p-2 bg-orange-100 rounded-lg mr-3">
                              <MessageCircle className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{ticket.title}</p>
                              <p className="text-sm text-gray-500 truncate max-w-[200px]">{ticket.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="p-2 bg-gray-100 rounded-full mr-3">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{ticket.customer_name}</p>
                              <p className="text-sm text-gray-500">ID: {ticket.customer_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-900">
                          {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-4 px-4 text-gray-900">
                          {ticket.category}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${priorityColor}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                            {statusInfo.icon}
                            <span className="ml-1">{ticket.status}</span>
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => openViewModal(ticket)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Voir détails"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleAssignTicket(ticket.id)}
                              disabled={assigningTickets.has(ticket.id)}
                              className={`px-3 py-1 text-xs rounded-lg transition-colors flex items-center ${
                                assigningTickets.has(ticket.id)
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-orange-600 text-white hover:bg-orange-700'
                              }`}
                              title="Prendre en charge"
                            >
                              {assigningTickets.has(ticket.id) ? (
                                <>
                                  <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin mr-1"></div>
                                  Assignation...
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-3 h-3 mr-1" />
                                  Prendre en charge
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section Mes Tickets */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
            <h3 className="text-lg font-medium text-blue-800 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Mes Tickets Assignés ({assignedTickets.length})
            </h3>
            <p className="text-sm text-blue-600">Tickets qui vous sont assignés</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Ticket</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Client</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Catégorie</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Priorité</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assignedTickets.length > 0 ? (
                  assignedTickets.map((ticket: Ticket) => {
                    const statusInfo = getStatusInfo(ticket.status);
                    const priorityColor = getPriorityColor(ticket.priority);

                    return (
                      <tr key={ticket.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg mr-3">
                              <MessageCircle className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{ticket.title}</p>
                              <p className="text-sm text-gray-500 truncate max-w-[200px]">{ticket.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="p-2 bg-gray-100 rounded-full mr-3">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{ticket.customer_name}</p>
                              <p className="text-sm text-gray-500">ID: {ticket.customer_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-900">
                          {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-4 px-4 text-gray-900">
                          {ticket.category}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${priorityColor}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                            {statusInfo.icon}
                            <span className="ml-1">{ticket.status}</span>
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => openViewModal(ticket)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Voir détails"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => openUpdateModal(ticket)}
                              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                              title="Mettre à jour"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <User className="w-12 h-12 text-gray-300 mb-2" />
                        <p>Aucun ticket assigné trouvé</p>
                        {searchTerm && (
                          <button 
                            onClick={clearSearch}
                            className="mt-2 text-adawi-gold hover:underline"
                          >
                            Effacer la recherche
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Affichage de <span className="font-medium">1</span> à <span className="font-medium">{filteredTickets.length}</span> sur <span className="font-medium">{tickets.length}</span> tickets
          </p>
          
          <div className="flex items-center space-x-2">
            <button className="px-3 text-black py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Précédent
            </button>
            <button className="px-3 py-2 text-sm bg-adawi-gold text-white rounded-lg">
              1
            </button>
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Suivant
            </button>
          </div>
        </div>

        {/* View Ticket Modal */}
        {selectedTicket && (
          <ViewTicketModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            ticket={selectedTicket}
            onAddResponse={handleAddResponse}
            onUpdateTicket={handleUpdateTicket}
          />
        )}

        {/* Update Ticket Modal */}
        {selectedTicket && (
          <UpdateTicketModal
            isOpen={isUpdateModalOpen}
            onClose={() => setIsUpdateModalOpen(false)}
            ticket={selectedTicket}
            onUpdateTicket={handleUpdateTicket}
          />
        )}
      </div>
    </SellerLayout>
  );
}

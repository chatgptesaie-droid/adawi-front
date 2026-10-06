import { useState, useEffect } from "react";
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Search, Filter, Eye, MessageCircle, CheckCircle, XCircle, Clock, AlertCircle, X, User } from "lucide-react";
import ViewTicketModal from "~/components/admin/ViewTicketModal";
import UpdateTicketModal from "~/components/admin/UpdateTicketModal";
import { readToken } from "~/utils/session.server";
import { requireAdmin } from "~/utils/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Support - Adawi Admin" },
    { name: "description", content: "Gestion des tickets de support" },
  ];
};

// Mise à jour de l'interface Ticket pour correspondre à l'API
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

// Loader pour récupérer les tickets
export async function loader({ request }: LoaderFunctionArgs) {
  const token = await readToken(request);
    await requireAdmin(request);


  if (!token) {
    throw new Response("Non autorisé", { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);

    // Récupérer les paramètres de filtrage
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const skip = searchParams.get("skip") || "0";
    const limit = searchParams.get("limit") || "50";

    // Construire l'URL de l'API avec les paramètres
    const apiUrl = new URL("http://localhost:8000/support/admin/tickets");
    if (status) apiUrl.searchParams.append("status", status);
    if (category) apiUrl.searchParams.append("category", category);
    apiUrl.searchParams.append("skip", skip);
    apiUrl.searchParams.append("limit", limit);

    console.log(" Appel API tickets:", apiUrl.toString());

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const tickets = await response.json();
    console.log(` ${tickets.length} tickets chargés`);

    return json({ tickets, token });
  } catch (error) {
    console.error(" Erreur chargement tickets:", error);
    return json({ tickets: [], token, error: "Erreur lors du chargement des tickets" });
  }
}

export default function AdminSupport() {
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

  // État pour les tickets
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);

  // Fonction pour recharger les tickets
  const loadTickets = async (filters?: { status?: string; category?: string }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.category) params.append("category", filters.category);

      const response = await fetch(
        `http://localhost:8000/support/admin/tickets?${params}`,
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

  // Recharger les tickets quand les filtres changent
  useEffect(() => {
    const filters: { status?: string; category?: string } = {};
    if (statusFilter !== "all") filters.status = statusFilter;
    if (categoryFilter !== "all") filters.category = categoryFilter;
    loadTickets(filters);
  }, [statusFilter, categoryFilter]);

  // Filtrage des tickets
  const filteredTickets = tickets.filter(ticket => {
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

  // Fonctions pour gérer les tickets
  const handleUpdateTicket = async (ticketId: string, updates: Partial<Ticket>) => {
    try {
      const response = await fetch(`http://localhost:8000/support/admin/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour du ticket");

      const updatedTicket = await response.json();
      setTickets(tickets.map(ticket => 
        ticket.id === ticketId ? { ...ticket, ...updatedTicket } : ticket
      ));
      setIsUpdateModalOpen(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du ticket:", error);
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-adawi-brown">Support Client</h1>
        <p className="text-gray-600">Gérez les tickets de support et les demandes des clients</p>
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
            <div className="p-2 bg-yellow-100 rounded-lg mr-3">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{tickets.filter(t => t.status === "ouvert").length}</p>
              <p className="text-sm text-gray-600">Tickets Ouverts</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{tickets.filter(t => t.status === "en_cours").length}</p>
              <p className="text-sm text-gray-600">En Traitement</p>
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
                {tickets.filter(t => t.status === "resolu" || t.status === "ferme").length}
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

      {/* Tickets Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => {
                  const statusInfo = getStatusInfo(ticket.status);
                  const priorityColor = getPriorityColor(ticket.priority);

                  return (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-gray-100 rounded-lg mr-3">
                            <MessageCircle className="w-5 h-5 text-gray-600" />
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
                            title="Mettre à jour le statut"
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
                      <AlertCircle className="w-12 h-12 text-gray-300 mb-2" />
                      <p>Aucun ticket trouvé</p>
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
  );
}

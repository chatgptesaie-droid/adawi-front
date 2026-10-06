import { useState, useEffect } from "react";
import { X, Package, User, MapPin, CreditCard, Calendar, CheckCircle, XCircle, Clock, Truck, AlertCircle, LogIn } from "lucide-react";
import ZoomModal from "../blog/ZoomModal";

// Interfaces pour les données
interface OrderItem {
  product_id: string;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
  name: string;
  image_url?: string;
  images?: string[];
}

interface Address {
  street?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
}

interface StatusHistoryItem {
  status: string;
  changed_at: string;
  comment?: string;
}

interface Installment {
  id: string;
  installment_number: number;
  amount: number;
  paid_amount: number;
  due_date: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  payment_method?: string;
  paid_at?: string;
  notes?: string;
}

interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  address?: Address;
  total: number;
  status: string;
  payment_status: string;
  status_history?: StatusHistoryItem[];
  payment_method?: string;
  delivery_method?: string;
  delivery_status?: string;
  created_at: string;
  updated_at: string;
  // Propriétés pour les versements
  payment_type?: "full" | "installments";
  installments_count?: number;
  paid_amount?: number;
  remaining_amount?: number;
  installments?: Installment[];
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  token?: string | null;
  onAuthError?: () => void;
}

const API_BASE = "http://localhost:8000";

export default function OrderDetailsModal({ isOpen, onClose, order, token, onAuthError }: OrderDetailsModalProps) {
  const [fetchedOrder, setFetchedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);

  // Zoom modal state
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState('');
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Zoom modal handlers
  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.2, 5));
  const handleZoomOut = () => setZoomScale(prev => Math.max(prev - 0.2, 0.5));
  const handleZoomReset = () => {
    setZoomScale(1);
    setZoomPosition({ x: 0, y: 0 });
  };
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale > 1) {
      setIsDragging(true);
    }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomScale > 1) {
      setZoomPosition(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
      }));
    }
  };
  const handleMouseUp = () => setIsDragging(false);
  const handleToggleControls = () => setShowControls(prev => !prev);
  const handleSetDragging = (dragging: boolean) => setIsDragging(dragging);
  const handleSetZoomPosition = (position: { x: number; y: number }) => setZoomPosition(position);
  const handleSetZoomScale = (scale: number) => setZoomScale(scale);

  // Fonction pour vérifier le token
  const getAuthToken = (): string | null => {
    if (!token) {
      setAuthError(true);
      setError("Vous devez être connecté pour voir les détails de la commande.");
      return null;
    }
    return token;
  };

  // Fonction pour gérer les erreurs d'authentification
  const handleAuthError = (status: number) => {
    if (status === 401 || status === 403) {
      setAuthError(true);
      setError("Votre session a expiré. Veuillez vous reconnecter.");
      if (onAuthError) {
        onAuthError();
      }
      return true;
    }
    return false;
  };

  // Fonction pour faire des requêtes authentifiées
  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const authToken = getAuthToken();
    if (!authToken) {
      throw new Error("Token d'authentification manquant");
    }

    // Extraire le token si c'est un objet JSON stringifié
    let actualToken = authToken;
    try {
      const parsedToken = JSON.parse(authToken);
      actualToken = parsedToken?.access_token || authToken;
    } catch {
      // Si ce n'est pas du JSON, utiliser tel quel
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${actualToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (handleAuthError(response.status)) {
        throw new Error("Erreur d'authentification");
      }

      // Essayer de récupérer le message d'erreur de l'API
      try {
        const errorData = await response.json();
        const errorMessage = errorData.detail || errorData.message || `Erreur ${response.status}`;
        throw new Error(errorMessage);
      } catch (jsonError) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
    }

    return response;
  };

  useEffect(() => {
    if (isOpen && order.id && token) {
      // La liste des commandes contient déjà les informations nécessaires au modal.
      // Les détails restent donc visibles même si le rafraîchissement distant échoue.
      setFetchedOrder(order);
      setLoading(false);
      setError(null);
      setAuthError(false);

      // Vérifier d'abord si on a un token
      const authToken = getAuthToken();
      if (!authToken) {
        setLoading(false);
        return;
      }

      // Récupérer les détails de la commande
      authenticatedFetch(`${API_BASE}/orders/${order.id}`)
        .then(res => res.json())
        .then(async (data) => {
          console.log('Données de commande récupérées:', data);
          console.log('Type de paiement:', data.payment_type);
          console.log('Versements bruts:', data.installments);

          // Si la commande a des versements (IDs uniquement), récupérer leurs détails
          if (data.installments && Array.isArray(data.installments) && data.installments.length > 0) {
            console.log('Récupération des détails des versements...');
            try {
              const installmentDetails = await Promise.all(
                data.installments.map(async (installmentId: string | Installment) => {
                  try {
                    // Vérifier si c'est déjà un objet ou juste un ID
                    if (typeof installmentId === 'object' && installmentId.id) {
                      console.log('Versement déjà un objet:', installmentId);
                      return installmentId;
                    }
                    
                    if (typeof installmentId === 'string') {
                      console.log('Récupération du versement ID:', installmentId);
                      const response = await authenticatedFetch(`${API_BASE}/installments/${installmentId}`);
                      const installmentData = await response.json();
                      console.log('Détails du versement récupérés:', installmentData);
                      return installmentData;
                    }
                    
                    console.warn('Format de versement inattendu:', installmentId);
                    return null;
                  } catch (err) {
                    console.error(`Erreur lors de la récupération du versement ${installmentId}:`, err);
                    return null;
                  }
                })
              );
              // Filtrer les résultats null et mettre à jour les versements
              const validInstallments = installmentDetails.filter(inst => inst !== null);
              console.log('Versements valides récupérés:', validInstallments);
              data.installments = validInstallments;
            } catch (err) {
              console.error('Erreur lors de la récupération des versements:', err);
              // En cas d'erreur, vider les versements pour éviter les erreurs de rendu
              data.installments = [];
            }
          }
          
          console.log('Données finales de la commande:', data);
          setFetchedOrder(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Erreur lors de la récupération de la commande:', err);
          setFetchedOrder(order);
          setError(null);
          setAuthError(false);
          setLoading(false);
        });
    } else if (isOpen && !token) {
      setAuthError(true);
      setError("Token d'authentification manquant.");
    } else {
      setFetchedOrder(null);
      setError(null);
      setAuthError(false);
    }
  }, [isOpen, order.id, token]);

  // Fonction pour réessayer après reconnexion
  const handleRetry = () => {
    if (isOpen && order.id && token) {
      setError(null);
      setAuthError(false);
      // Relancer le useEffect en modifiant un état
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 100);
    }
  };

  // Fonctions utilitaires
  const getStatusInfo = (status: string) => {
    switch (status?.toLowerCase()) {
      case "livree":
      case "delivered":
        return { 
          icon: <CheckCircle className="w-5 h-5" />, 
          color: "bg-green-100 text-green-800" 
        };
      case "en_cours":
      case "en cours":
      case "processing":
        return { 
          icon: <Truck className="w-5 h-5" />, 
          color: "bg-blue-100 text-blue-800" 
        };
      case "en_preparation":
      case "en préparation":
      case "preparing":
        return { 
          icon: <Package className="w-5 h-5" />, 
          color: "bg-yellow-100 text-yellow-800" 
        };
      case "en_attente":
      case "en attente":
      case "pending":
        return { 
          icon: <Clock className="w-5 h-5" />, 
          color: "bg-orange-100 text-orange-800" 
        };
      case "annulé":
      case "cancelled":
        return { 
          icon: <XCircle className="w-5 h-5" />, 
          color: "bg-red-100 text-red-800" 
        };
      default:
        return { 
          icon: <AlertCircle className="w-5 h-5" />, 
          color: "bg-gray-100 text-gray-800" 
        };
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(price);
  };

  if (!isOpen) return null;

  const displayOrder = fetchedOrder || order;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Détails de la commande</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-6 text-center">
            <div className="inline-flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-adawi-brown mr-2"></div>
              <span className="text-gray-600">Chargement des détails...</span>
            </div>
          </div>
        )}

        {/* Authentication Error State */}
        {authError && (
          <div className="p-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <LogIn className="w-5 h-5 text-yellow-500 mr-2" />
                <span className="text-yellow-800 font-medium">Authentification requise</span>
              </div>
              <p className="text-yellow-700 mb-4">{error}</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => window.location.href = '/login'}
                  className="px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold-light transition-colors"
                >
                  Se connecter
                </button>
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* General Error State */}
        {error && !authError && (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-800 font-medium">Erreur de chargement</span>
              </div>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {!error && (
          <div className="p-6">
            {/* Order Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="p-3 bg-adawi-beige rounded-lg mr-4">
                  <Package className="w-6 h-6 text-adawi-brown" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">#{order.id.slice(-8)}</h3>
                  <div className="flex items-center mt-1">
                    <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-500">
                      Commandé le {formatDate(order.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusInfo(order.status).color}`}>
                  {getStatusInfo(order.status).icon}
                  <span className="ml-1">{order.status}</span>
                </span>
                <p className="mt-1 text-lg font-semibold text-adawi-brown">{formatPrice(order.total)}</p>
              </div>
            </div>

            {/* Order Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Order Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Package className="w-5 h-5 text-gray-500 mr-2" />
                  <h4 className="font-medium text-gray-900">Informations de commande</h4>
                </div>
                <div className="space-y-2 pl-7">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID de commande:</span>
                    <span className="font-medium text-gray-900">{order.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date de création:</span>
                    <span className="font-medium text-gray-900">{formatDate(order.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dernière mise à jour:</span>
                    <span className="font-medium text-gray-900">{formatDate(order.updated_at)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {order.address && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <MapPin className="w-5 h-5 text-gray-500 mr-2" />
                    <h4 className="font-medium text-gray-900">Adresse de livraison</h4>
                  </div>
                  <div className="space-y-1 pl-7">
                    <p className="text-gray-600">{order.address.street}</p>
                    <p className="text-gray-600">{order.address.postal_code} {order.address.city}</p>
                    <p className="text-gray-600">{order.address.country}</p>
                    {order.address.phone && <p className="text-gray-600">Tél: {order.address.phone}</p>}
                  </div>
                </div>
              )}

              {/* Payment Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <CreditCard className="w-5 h-5 text-gray-500 mr-2" />
                  <h4 className="font-medium text-gray-900">Informations de paiement</h4>
                </div>
                <div className="space-y-2 pl-7">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Statut:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${ 
                      order.payment_status === 'paid' || order.payment_status === 'effectue' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800' 
                    }`}>
                      {order.payment_status === 'en_attente' ? 'En attente' : 
                       order.payment_status === 'paid' ? 'Payé' : order.payment_status}
                    </span>
                  </div>
                  {order.payment_method && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Méthode:</span>
                      <span className="font-medium text-gray-900">{order.payment_method}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Truck className="w-5 h-5 text-gray-500 mr-2" />
                  <h4 className="font-medium text-gray-900">Informations de livraison</h4>
                </div>
                <div className="space-y-2 pl-7">
                  {order.delivery_method && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Méthode:</span>
                      <span className="font-medium text-gray-900">{order.delivery_method}</span>
                    </div>
                  )}
                  {order.delivery_status && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Statut:</span>
                      <span className="font-medium text-gray-900">{order.delivery_status}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Installment Information - Improved with better error handling */}
            {(displayOrder.payment_type === 'installments' || displayOrder.payment_method === 'installments') && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-4">Informations de versement</h4>
                
                {/* Debug info - Remove in production */}
                {/* {process.env.NODE_ENV === 'development' && (
                  <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
                    <p>Debug - Payment type: {displayOrder.payment_type}</p>
                    <p>Debug - Payment method: {displayOrder.payment_method}</p>
                    <p>Debug - Installments count: {displayOrder.installments_count}</p>
                    <p>Debug - Installments array length: {displayOrder.installments?.length || 0}</p>
                  </div>
                )} */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Nombre de versements</div>
                    <div className="text-lg font-semibold text-blue-900">
                      {displayOrder.installments_count || displayOrder.installments?.length || 0}
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Montant payé</div>
                    <div className="text-lg font-semibold text-green-900">
                      {formatPrice(displayOrder.paid_amount || 0)}
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Reste à payer</div>
                    <div className="text-lg font-semibold text-orange-900">
                      {formatPrice(displayOrder.remaining_amount || (displayOrder.total - (displayOrder.paid_amount || 0)))}
                    </div>
                  </div>
                </div>

                {/* Installments Table */}
                {displayOrder.installments && Array.isArray(displayOrder.installments) && displayOrder.installments.length > 0 ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">ID Versement</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-gray-900">Montant</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-gray-900">Échéance</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-gray-900">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {displayOrder.installments.map((installment: any, index: number) => {
                          // Vérification de sécurité pour chaque versement
                          if (!installment || typeof installment !== 'object') {
                            console.warn('Versement invalide à l\'index', index, ':', installment);
                            return (
                              <tr key={index}>
                                <td colSpan={4} className="py-3 px-4 text-center text-red-600">
                                  Données de versement invalides
                                </td>
                              </tr>
                            );
                          }

                          return (
                            <tr key={installment.id || index}>
                              <td className="py-3 px-4 text-gray-900 font-mono text-sm">
                                {installment.id ? installment.id.slice(-8) : `V${index + 1}`}
                              </td>
                              <td className="py-3 px-4 text-center text-gray-900 font-medium">
                                {formatPrice(installment.amount || 0)}
                              </td>
                              <td className="py-3 px-4 text-center text-gray-900">
                                {installment.due_date ? formatDate(installment.due_date) : 'N/A'}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  installment.status === 'paid' || installment.status === 'effectue'
                                    ? 'bg-green-100 text-green-800'
                                    : installment.status === 'pending' || installment.status === 'en_attente'
                                    ? 'bg-orange-100 text-orange-800'
                                    : installment.status === 'overdue'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {installment.status === 'en_attente' ? 'En attente' :
                                   installment.status === 'paid' ? 'Payé' :
                                   installment.status === 'effectue' ? 'Effectué' :
                                   installment.status === 'overdue' ? 'En retard' :
                                   installment.status || 'Inconnu'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-6 text-center text-gray-500">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Aucun détail de versement disponible</p>
                    {displayOrder.installments_count && (
                      <p className="text-sm mt-1">
                        {displayOrder.installments_count} versement(s) configuré(s)
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Order Items */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-4">Articles commandés</h4>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Produit</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-900">Quantité</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-900">Prix unitaire</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-900">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.items && order.items.length > 0 ? order.items.map((item: OrderItem, index: number) => (
                      <tr key={index}>
                        <td className="py-4 px-4">
                          <div>
                            {item.images && item.images.length > 0 ? (
                              <img
                                src={item.images[0]}
                                alt={item.name || item.product_id}
                                className="w-20 h-20 sm:w-16 sm:h-16 object-cover rounded-lg border shadow-sm cursor-pointer"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                                onClick={() => {
                                  if (item.images && item.images.length > 0) {
                                    setZoomedImage(item.images[0]);
                                    setIsZoomModalOpen(true);
                                    setZoomScale(1);
                                    setZoomPosition({ x: 0, y: 0 });
                                    setIsDragging(false);
                                    setShowControls(true);
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-20 h-20 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center border">
                                <span className="text-gray-400 text-xs text-center">Pas d'image</span>
                              </div>
                            )}
                            <p className="font-medium text-gray-900">{item.name || 'Produit sans nom'}</p>
                            <div className="text-sm text-gray-500 space-x-2">
                              {item.size && <span>Taille: {item.size}</span>}
                              {item.color && <span>• Couleur: {item.color}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center text-gray-900">{item.quantity || 0}</td>
                        <td className="py-4 px-4 text-right text-gray-900">{formatPrice(item.price || 0)}</td>
                        <td className="py-4 px-4 text-right text-gray-900 font-medium">
                          {formatPrice((item.price || 0) * (item.quantity || 0))}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="py-4 px-4 text-center text-gray-500">
                          Aucun article trouvé
                        </td>
                      </tr>
                    )}
                  </tbody>

                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="py-3 px-4 text-right font-medium text-gray-900">
                        Total de la commande
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-adawi-brown text-lg">
                        {formatPrice(order.total || 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Status History */}
            {order.status_history && order.status_history.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-4">Historique des statuts</h4>
                <div className="space-y-2">
                  {order.status_history.map((status: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-900">{status.status || status}</span>
                      <span className="text-sm text-gray-500">
                        {status.date ? formatDate(status.date) : status.changed_at ? formatDate(status.changed_at) : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold-light transition-colors"
          >
            Fermer
          </button>
        </div>

        {/* Zoom Modal */}
        {isZoomModalOpen && (
          <ZoomModal
            zoomedImage={zoomedImage}
            zoomScale={zoomScale}
            zoomPosition={zoomPosition}
            isDragging={isDragging}
            showControls={showControls}
            onClose={() => setIsZoomModalOpen(false)}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomReset={handleZoomReset}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onToggleControls={handleToggleControls}
            onSetDragging={handleSetDragging}
            onSetZoomPosition={handleSetZoomPosition}
            onSetZoomScale={handleSetZoomScale}
          />
        )}
      </div>
    </div>
  );
}

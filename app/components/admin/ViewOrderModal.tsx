import React, { useEffect, useState } from "react";
import ZoomModal from '../blog/ZoomModal';

type OrderItem = {
  product_id: string;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
  name: string;
  images: string[];
};

type Measurements = {
  height: number;
  weight: number;
  shoulder_width: number;
  chest: number;
  waist_length: number;
  ventral_circumference: number;
  hips: number;
  corsage_length: number;
  belt: number;
  skirt_length: number;
  dress_length: number;
  sleeve_length: number;
  sleeve_circumference: number;
  pants_length: number;
  short_dress_length: number;
  thigh_circumference: number;
  knee_length: number;
  knee_circumference: number;
  bottom: number;
  inseam: number;
  other_measurements: string;
};

type StatusHistoryItem = {
  status: string;
  changed_at: string;
  comment: string;
};

type Installment = {
  id: string;
  installment_number: number;
  amount: number;
  paid_amount: number;
  due_date: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  payment_method?: string;
  paid_at?: string;
  notes?: string;
};

type Order = {
  id: string;
  items: OrderItem[];
  address?: {
    street?: string;
    city?: string;
    postal_code?: string;
    country?: string;
    phone?: string;
  };
  total: number;
  status: string;
  payment_status: string;
  payment_method?: string;
  delivery_method?: string;
  delivery_status?: string;
  status_history?: StatusHistoryItem[];
  user_id: string;
  created_at: string;
  updated_at: string;
  photo_urls?: string[];
  measurements?: Measurements;
  delivery_type?: string;
  delivery_date?: string;
  current_size?: string;
  description?: string;
  // Nouvelles propriétés pour les versements
  payment_type?: "full" | "installments";
  installments_count?: number;
  paid_amount?: number;
  remaining_amount?: number;
  installments?: Installment[];
  customer_name?: string;
  customer_phone?: string;
};

interface ViewOrderModalProps {
  isOpen: boolean;
  orderId: string | null;
  token: string;
  onClose: () => void;
}

const API_BASE = "http://localhost:8000";

const ViewOrderModal: React.FC<ViewOrderModalProps> = ({ isOpen, orderId, token, onClose }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [contentRef, setContentRef] = useState<HTMLDivElement | null>(null);

  // Zoom modal states
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState('');
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Vérifier s'il y a du contenu à scroller
  const checkScrollIndicator = () => {
    if (contentRef) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef;
      const isScrollable = scrollHeight > clientHeight;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setShowScrollIndicator(isScrollable && !isAtBottom);
    }
  };

  // Fonction pour formater les montants
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Fonction pour formater les dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Fonction pour obtenir le libellé du statut
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Payé';
      case 'pending': return 'En attente';
      case 'overdue': return 'En retard';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  // Zoom handlers
  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.2, 5));
  const handleZoomOut = () => setZoomScale(prev => Math.max(prev - 0.2, 0.5));
  const handleZoomReset = () => {
    setZoomScale(1);
    setZoomPosition({ x: 0, y: 0 });
  };
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - zoomPosition.x,
        y: e.clientY - zoomPosition.y,
      });
    }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setZoomPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  const handleToggleControls = () => setShowControls(prev => !prev);
  const handleSetDragging = (dragging: boolean) => setIsDragging(dragging);
  const handleSetZoomPosition = (position: { x: number; y: number }) => setZoomPosition(position);
  const handleSetZoomScale = (scale: number) => setZoomScale(scale);

  useEffect(() => {
    if (!isOpen || !orderId || !token) return;

    let cancelled = false;
    const ctrl = new AbortController();

    (async () => {
      setLoading(true);
      setErr(null);
      setOrder(null);
      try {
        const res = await fetch(`${API_BASE}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: ctrl.signal,
        });
        if (!res.ok) {
          const msg = await res.text().catch(() => "");
          throw new Error(msg || "Erreur lors de la récupération de la commande");
        }
        const data: Order = await res.json();
        if (!cancelled) setOrder(data);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Erreur réseau");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [isOpen, orderId, token]);

  // Vérifier l'indicateur de scroll après le chargement des données
  useEffect(() => {
    if (order && contentRef) {
      const timer = setTimeout(checkScrollIndicator, 100);
      return () => clearTimeout(timer);
    }
  }, [order, contentRef]);

  // Empêcher le scroll de la page principale quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-4xl rounded-lg sm:rounded-xl shadow-lg h-[90vh] sm:h-[85vh] overflow-hidden flex flex-col relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-gray-50 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Détails de la commande</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative">
          <div
            ref={setContentRef}
            className="h-full overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            onScroll={checkScrollIndicator}
          >
            {!token && <p className="text-red-600 text-center py-4">Token manquant.</p>}
            {loading && <p className="text-center py-8 text-gray-600">Chargement…</p>}
            {err && <p className="text-red-600 text-center py-4 bg-red-50 rounded-lg">{err}</p>}

            {!loading && !err && order && (
              <div className="space-y-6">
                {/* Informations principales */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 text-gray-900">Informations générales</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs uppercase tracking-wide">ID</span>
                      <span className="font-medium text-gray-900 truncate" title={order.id}>{order.id}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs uppercase tracking-wide">Utilisateur</span>
                      <span className="font-medium text-gray-900 truncate" title={order.user_id}>{order.user_id}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs uppercase tracking-wide">Statut</span>
                      <span className="font-medium text-gray-900">{order.status}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs uppercase tracking-wide">Paiement</span>
                      <span className="font-medium text-gray-900">{order.payment_status}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs uppercase tracking-wide">Créée le</span>
                      <span className="font-medium text-gray-900">{new Date(order.created_at).toLocaleString("fr-FR")}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs uppercase tracking-wide">MAJ le</span>
                      <span className="font-medium text-gray-900">{new Date(order.updated_at).toLocaleString("fr-FR")}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs uppercase tracking-wide">Total</span>
                      <span className="font-bold text-lg text-green-600">{formatAmount(order.total)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs uppercase tracking-wide">Méthode</span>
                      <span className="font-medium text-gray-900">{order.payment_method || "—"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs uppercase tracking-wide">Livraison</span>
                      <span className="font-medium text-gray-900">{order.delivery_method || "—"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs uppercase tracking-wide">Statut livraison</span>
                      <span className="font-medium text-gray-900">{order.delivery_status || "—"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs uppercase tracking-wide">Type livraison</span>
                      <span className="font-medium text-gray-900">{order.delivery_type || "—"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs uppercase tracking-wide">Date livraison</span>
                      <span className="font-medium text-gray-900">{order.delivery_date ? new Date(order.delivery_date).toLocaleDateString("fr-FR") : "—"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs uppercase tracking-wide">Taille actuelle</span>
                      <span className="font-medium text-gray-900">{order.current_size || "—"}</span>
                    </div>
                  </div>
                  {order.description && (
                    <div className="mt-4 pt-4 border-t">
                      <span className="text-gray-500 text-xs uppercase tracking-wide block mb-1">Description</span>
                      <p className="font-medium text-gray-900 text-sm leading-relaxed">{order.description}</p>
                    </div>
                  )}
                </div>

                {/* Informations client (nouvelles propriétés) */}
                {(order.customer_name || order.customer_phone) && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-gray-900">Informations Client</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      {order.customer_name && (
                        <div className="flex flex-col">
                          <span className="text-gray-500 text-xs uppercase tracking-wide">Nom du client</span>
                          <span className="font-medium text-gray-900">{order.customer_name}</span>
                        </div>
                      )}
                      {order.customer_phone && (
                        <div className="flex flex-col">
                          <span className="text-gray-500 text-xs uppercase tracking-wide">Téléphone</span>
                          <span className="font-medium text-gray-900">{order.customer_phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Informations de paiement en versements */}
                {order.payment_type === "installments" && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-gray-900">Paiement en Versements</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm mb-4">
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-xs uppercase tracking-wide">Type de paiement</span>
                        <span className="font-medium text-gray-900">Versements</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-xs uppercase tracking-wide">Nombre de versements</span>
                        <span className="font-medium text-gray-900">{order.installments_count || 0}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-xs uppercase tracking-wide">Montant payé</span>
                        <span className="font-medium text-green-600">{formatAmount(order.paid_amount || 0)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-xs uppercase tracking-wide">Montant restant</span>
                        <span className="font-medium text-red-600">{formatAmount(order.remaining_amount || 0)}</span>
                      </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progression du paiement</span>
                        <span>
                          {order.total > 0 
                            ? Math.round(((order.paid_amount || 0) / order.total) * 100)
                            : 0
                          }%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${order.total > 0 
                              ? ((order.paid_amount || 0) / order.total) * 100 
                              : 0
                            }%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Liste des versements */}
                    {/* {order.installments && order.installments.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Détail des versements</h4>
                        <div className="space-y-2">
                          {order.installments.map((installment, index) => (
                            <div key={installment.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                              <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                  installment.status === 'paid' ? 'bg-green-500' :
                                  installment.status === 'overdue' ? 'bg-red-500' :
                                  installment.status === 'pending' ? 'bg-yellow-500' :
                                  'bg-gray-500'
                                }`}>
                                  {installment.installment_number}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    Versement #{installment.installment_number}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Échéance: {formatDate(installment.due_date)}
                                  </p>
                                  {installment.paid_at && (
                                    <p className="text-sm text-green-600">
                                      Payé le: {formatDate(installment.paid_at)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">
                                  {formatAmount(installment.amount)}
                                </p>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(installment.status)}`}>
                                  {getStatusLabel(installment.status)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )} */}
                  </div>
                )}

                {/* Adresse */}
                <div>
                  <h3 className="font-semibold mb-3 text-gray-900">Adresse de livraison</h3>
                  <div className="rounded-lg border border-gray-200 p-4 bg-white">
                    <div className="space-y-1 text-sm">
                      <div className="font-medium text-gray-900">{order.address?.street || "Adresse non renseignée"}</div>
                      <div className="text-gray-600">
                        {order.address?.postal_code && <span>{order.address.postal_code} </span>}
                        {order.address?.city}
                      </div>
                      <div className="text-gray-600">{order.address?.country || "—"}</div>
                      {order.address?.phone && (
                        <div className="flex items-center pt-2 border-t border-gray-100">
                          <span className="text-gray-500 mr-2"></span>
                          <span className="font-medium text-gray-900">{order.address.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Articles */}
                <div>
                  <h3 className="font-semibold mb-3 text-gray-900">Articles commandés</h3>
                  <div className="rounded-lg border border-gray-200 divide-y divide-gray-200 bg-white">
                    {order.items?.length ? order.items.map((it, i) => (
                      <div key={`${it.product_id}-${i}`} className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                          {/* Image */}
                          <div className="flex-shrink-0 mx-auto sm:mx-0">
                            {it.images && it.images.length > 0 ? (
                              <img
                                src={it.images[0]}
                                alt={it.name || it.product_id}
                                className="w-20 h-20 sm:w-16 sm:h-16 object-cover rounded-lg border shadow-sm cursor-pointer"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                                onClick={() => {
                                  setZoomedImage(it.images[0]);
                                  setIsZoomModalOpen(true);
                                  setZoomScale(1);
                                  setZoomPosition({ x: 0, y: 0 });
                                  setIsDragging(false);
                                  setShowControls(true);
                                }}
                              />
                            ) : (
                              <div className="w-20 h-20 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center border">
                                <span className="text-gray-400 text-xs text-center">Pas d'image</span>
                              </div>
                            )}
                          </div>

                          {/* Détails */}
                          <div className="flex-1 text-center sm:text-left">
                            <h4 className="font-semibold text-gray-900 mb-2">{it.name || it.product_id}</h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div>Quantité: <span className="font-medium">{it.quantity}</span></div>
                              {it.size && <div>Taille: <span className="font-medium">{it.size}</span></div>}
                              {it.color && <div>Couleur: <span className="font-medium">{it.color}</span></div>}
                            </div>
                          </div>

                          {/* Prix */}
                          <div className="flex-shrink-0 text-center sm:text-right">
                            <div className="text-lg font-bold text-gray-900">{formatAmount(it.price)}</div>
                            <div className="text-sm text-gray-500">Prix unitaire</div>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="p-6 text-center text-gray-500">Aucun article trouvé</div>
                    )}
                  </div>
                </div>

                {/* Photos */}
                {order.photo_urls && order.photo_urls.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-900">Photos jointes</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {order.photo_urls.map((url, idx) => (
                        <div key={idx} className="aspect-square">
                          <img
                            src={url}
                            alt={`Photo ${idx + 1}`}
                            className="w-full h-full object-cover rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                            onClick={() => window.open(url, '_blank')}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mesures */}
                {order.measurements && (
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-900">Mesures corporelles</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Object.entries(order.measurements).map(([key, value]) => (
                          <div key={key} className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                              {key.replace(/_/g, ' ')}
                            </span>
                            <span className="font-medium text-gray-900">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Indicateur de scroll */}
          {showScrollIndicator && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 animate-bounce pointer-events-none">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 text-sm font-medium">
                <span>Plus d'infos en bas</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-4 sm:p-6 flex-shrink-0">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Fermer
            </button>
          </div>
        </div>
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
  );
};

export default ViewOrderModal;
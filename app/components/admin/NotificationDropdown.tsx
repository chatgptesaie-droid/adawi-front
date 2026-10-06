import React from 'react';
import { Bell, Check, RefreshCw, Package, CreditCard, Truck, AlertCircle, MessageSquare, X } from "lucide-react";

interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  order_id?: string;
  product_id?: string;
  ticket_id?: string;
  refund_id?: string;
  created_at: string;
  read: boolean;
  order_details?: object;
  product_details?: object;
  ticket_details?: object;
  refund_details?: object;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  notifications: Notification[];
  isLoading: boolean;
  error?: string | null;
  onMarkAsRead: (notificationId: string) => void;
  onRefresh: () => void;
  onNotificationClick: (notification: Notification) => void;
  onClose: () => void;
}

export default function NotificationDropdown({ 
  isOpen, 
  notifications, 
  isLoading, 
  error,
  onMarkAsRead, 
  onRefresh,
  onNotificationClick,
  onClose
}: NotificationDropdownProps) {
  if (!isOpen) return null;

  // Fonction pour obtenir l'icône selon le type de notification
  const getNotificationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'order':
      case 'commande':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'payment':
      case 'paiement':
        return <CreditCard className="w-4 h-4 text-green-500" />;
      case 'delivery':
      case 'livraison':
        return <Truck className="w-4 h-4 text-orange-500" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case 'alert':
      case 'alerte':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)} h`;
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleNotificationClick = (notification: Notification) => {
    // Marquer comme lu si ce n'est pas déjà fait
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    // Ouvrir le modal avec les détails
    onNotificationClick(notification);
  };

  const unreadNotifications = notifications.filter(notif => !notif.read);

  return (
    <>
      {/* Overlay pour fermer en cliquant à l'extérieur */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Dropdown */}
      <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-900">
              Notifications
            </h3>
            {unreadNotifications.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadNotifications.length}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 rounded"
              title="Actualiser"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-3">Chargement des notifications...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <p className="text-sm text-red-600 mb-2 font-medium">Erreur de chargement</p>
              <p className="text-xs text-gray-500 mb-4">{error}</p>
              <button
                onClick={onRefresh}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium px-3 py-1 rounded border border-blue-200 hover:bg-blue-50"
              >
                Réessayer
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">Aucune notification</p>
              <p className="text-xs text-gray-400 mt-1">
                Vous êtes à jour !
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-5 ${
                        !notification.read ? 'font-medium text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center space-x-2 mt-2">
                        {notification.order_id && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            Commande #{notification.order_id.slice(-8)}
                          </span>
                        )}
                        {notification.product_id && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            Produit #{notification.product_id.slice(-8)}
                          </span>
                        )}
                        {notification.ticket_id && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            Ticket #{notification.ticket_id.slice(-8)}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>

                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsRead(notification.id);
                        }}
                        className="flex-shrink-0 p-1 text-gray-400 hover:text-green-600 transition-colors rounded"
                        title="Marquer comme lu"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {unreadNotifications.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                unreadNotifications.forEach(notif => onMarkAsRead(notif.id));
              }}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium"
            >
              Tout marquer comme lu ({unreadNotifications.length})
            </button>
          </div>
        )}
      </div>
    </>
  );
}
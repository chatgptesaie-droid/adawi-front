import React from "react";
import { Bell, Package, CreditCard, Truck, AlertCircle, MessageSquare, X } from "lucide-react";

interface NotificationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: {
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
  } | null;
  onMarkAsRead?: (notificationId: string) => void;
}

export default function NotificationDetailsModal({ 
  isOpen, 
  onClose, 
  notification,
  onMarkAsRead 
}: NotificationDetailsModalProps) {
  if (!isOpen || !notification) return null;

  const getNotificationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'order':
      case 'commande':
        return <Package className="w-6 h-6 text-blue-500" />;
      case 'payment':
      case 'paiement':
        return <CreditCard className="w-6 h-6 text-green-500" />;
      case 'delivery':
      case 'livraison':
        return <Truck className="w-6 h-6 text-orange-500" />;
      case 'message':
        return <MessageSquare className="w-6 h-6 text-purple-500" />;
      case 'alert':
      case 'alerte':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Bell className="w-6 h-6 text-gray-500" />;
    }
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderDetails = (details: object | undefined, title: string) => {
    if (!details) return null;
    
    return (
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">{title}</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto">
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-3">
            {getNotificationIcon(notification.type)}
            <h2 className="text-lg font-semibold text-gray-900">
              Détails de la Notification
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Message principal */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Message</h3>
            <p className="text-base text-gray-900 leading-6">
              {notification.message}
            </p>
          </div>

          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Type</h4>
              <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full capitalize">
                {notification.type}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Statut</h4>
              <span className={`inline-block text-sm font-medium px-3 py-1 rounded-full ${
                notification.read 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {notification.read ? 'Lue' : 'Non lue'}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Date de création</h4>
              <p className="text-sm text-gray-900">
                {formatFullDate(notification.created_at)}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">ID Notification</h4>
              <p className="text-sm text-gray-900 font-mono break-all">
                {notification.id}
              </p>
            </div>
          </div>

          {/* IDs associés */}
          {(notification.order_id || notification.product_id || notification.ticket_id || notification.refund_id) && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Éléments associés</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notification.order_id && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-blue-900">Commande</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1 font-mono break-all">
                      #{notification.order_id}
                    </p>
                  </div>
                )}

                {notification.product_id && (
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-900">Produit</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1 font-mono break-all">
                      #{notification.product_id}
                    </p>
                  </div>
                )}

                {notification.ticket_id && (
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium text-purple-900">Ticket</span>
                    </div>
                    <p className="text-sm text-purple-700 mt-1 font-mono break-all">
                      #{notification.ticket_id}
                    </p>
                  </div>
                )}

                {notification.refund_id && (
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium text-orange-900">Remboursement</span>
                    </div>
                    <p className="text-sm text-orange-700 mt-1 font-mono break-all">
                      #{notification.refund_id}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Détails additionnels */}
          {renderDetails(notification.order_details, "Détails de la commande")}
          {renderDetails(notification.product_details, "Détails du produit")}
          {renderDetails(notification.ticket_details, "Détails du ticket")}
          {renderDetails(notification.refund_details, "Détails du remboursement")}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          {/* {!notification.read && onMarkAsRead && (
            <button
              className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
              onClick={() => {
                onMarkAsRead(notification.id);
              }}
            >
              Marquer comme lu
            </button>
          )} */}
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
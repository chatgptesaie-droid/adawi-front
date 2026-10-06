import React from "react";

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
}

const NotificationDetailsModal: React.FC<NotificationDetailsModalProps> = ({ isOpen, onClose, notification }) => {
    if (!isOpen || !notification) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                <h2 className="text-lg font-bold mb-4">Détails de la Notification</h2>
                <p><strong>Type:</strong> {notification.type}</p>
                <p><strong>Message:</strong> {notification.message}</p>
                {notification.order_id && <p><strong>Order ID:</strong> {notification.order_id}</p>}
                {notification.product_id && <p><strong>Product ID:</strong> {notification.product_id}</p>}
                {notification.ticket_id && <p><strong>Ticket ID:</strong> {notification.ticket_id}</p>}
                {notification.refund_id && <p><strong>Refund ID:</strong> {notification.refund_id}</p>}
                <p><strong>Créé le:</strong> {new Date(notification.created_at).toLocaleString()}</p>
                <button onClick={onClose} className="mt-4 bg-adawi-gold text-white px-4 py-2 rounded">Fermer</button>
            </div>
        </div>
    );
};

export default NotificationDetailsModal;

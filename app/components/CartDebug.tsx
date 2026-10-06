import { useCart } from "~/contexts/CartContext";

export default function CartDebug() {
    const { state } = useCart();

    // Afficher uniquement en développement
    if (process.env.NODE_ENV === 'production') {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md max-h-96 overflow-auto z-50">
            <h3 className="font-bold mb-2">État du panier (Debug)</h3>
            <div className="text-xs">
                <p><strong>Session ID:</strong> {state.sessionId || 'Non défini'}</p>
                <p><strong>Cart ID:</strong> {state.cartId || 'Non défini'}</p>
                <p><strong>Total:</strong> {state.total}</p>
                <p><strong>Articles:</strong> {state.items.length}</p>
                <details>
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">Voir les articles</summary>
                    <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto">
                        {JSON.stringify(state.items, null, 2)}
                    </pre>
                </details>
            </div>
        </div>
    );
}

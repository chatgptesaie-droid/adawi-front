import type { MetaFunction } from "@remix-run/node";
import { useState, useEffect } from "react";
import { Link } from "@remix-run/react";
import { useCart } from "~/contexts/CartContext";
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft } from "lucide-react";

export const meta: MetaFunction = () => {
    return [
        { title: "Panier Temporaire - Adawi" },
        { name: "description", content: "Page temporaire pour tester le panier" },
    ];
};

export default function CartPage() {
    const { state, dispatch, refreshCart, addToCart } = useCart();
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Rafraîchir le panier au chargement
    useEffect(() => {
        refreshCart();
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refreshCart();
        setIsRefreshing(false);
    };

    const updateQuantity = (id: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            dispatch({ type: 'REMOVE_ITEM', payload: { id } });
        } else {
            dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: newQuantity } });
        }
    };

    const removeItem = (id: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { id } });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    // Fonction pour ajouter un produit de test
    const addTestProduct = async () => {
        const testProduct = {
            id: `test-${Date.now()}`,
            name: `Produit Test ${Date.now()}`,
            price: 29.99,
            images: ['/placeholder-product.png'],
            category: { name: 'Test' }
        };

        const success = await addToCart(testProduct, 'M', 'Rouge', 1);
        if (success) {
            console.log("Produit test ajouté avec succès");
        } else {
            console.error("Erreur lors de l'ajout du produit test");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <Link 
                                to="/boutique" 
                                className="flex items-center text-gray-600 hover:text-adawi-gold transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Retour à la boutique
                            </Link>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Panier Temporaire (Debug)</h1>
                    </div>

                    {/* Actions de debug */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                            {isRefreshing ? "Actualisation..." : "Actualiser le panier"}
                        </button>
                        <button
                            onClick={addTestProduct}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                            Ajouter un produit test
                        </button>
                        <button
                            onClick={clearCart}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                            Vider le panier
                        </button>
                    </div>
                </div>

                {/* État du panier */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">État du panier</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-gray-50 p-3 rounded">
                            <span className="font-medium">Session ID:</span>
                            <p className="text-gray-600 break-all">{state.sessionId || 'Non défini'}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                            <span className="font-medium">Cart ID:</span>
                            <p className="text-gray-600 break-all">{state.cartId || 'Non défini'}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                            <span className="font-medium">Nombre d'articles:</span>
                            <p className="text-gray-600">{state.items.length}</p>
                        </div>
                    </div>
                    
                    {state.error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                            <p className="text-red-800 text-sm">{state.error}</p>
                        </div>
                    )}
                </div>

                {/* Loading */}
                {state.isLoading && (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center mb-6">
                        <div className="w-8 h-8 border-4 border-adawi-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Chargement du panier...</p>
                    </div>
                )}

                {/* Articles du panier */}
                {!state.isLoading && (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold">Articles du panier ({state.items.length})</h2>
                                <p className="text-lg font-bold text-adawi-gold">
                                    Total: {state.total.toFixed(2)} F CFA
                                </p>
                            </div>
                        </div>

                        {state.items.length === 0 ? (
                            <div className="p-12 text-center">
                                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Votre panier est vide</h3>
                                <p className="text-gray-600 mb-6">Ajoutez des produits pour les voir apparaître ici</p>
                                <button
                                    onClick={addTestProduct}
                                    className="px-6 py-3 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 transition-colors"
                                >
                                    Ajouter un produit test
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {state.items.map((item, index) => {
                                    const itemPrice = typeof item.price === 'number' ? item.price : parseFloat(String(item.price));
                                    const itemTotal = itemPrice * item.quantity;

                                    return (
                                        <div key={item.id || index} className="p-6">
                                            <div className="flex items-center space-x-4">
                                                {/* Image */}
                                                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={item.images?.[0] || '/placeholder-product.png'}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/placeholder-product.png';
                                                        }}
                                                    />
                                                </div>

                                                {/* D��tails du produit */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-base font-medium text-gray-900 truncate">
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        Prix unitaire: {itemPrice.toFixed(2)} F CFA
                                                    </p>
                                                    {(item.size || item.color) && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {item.size && <span>Taille: {item.size}</span>}
                                                            {item.size && item.color && <span> • </span>}
                                                            {item.color && <span>Couleur: {item.color}</span>}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        ID: {item.id} | Product ID: {item.product_id}
                                                    </p>
                                                </div>

                                                {/* Contrôles de quantité */}
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="text-base font-medium min-w-[2rem] text-center">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Prix total et suppression */}
                                                <div className="text-right">
                                                    <p className="text-lg font-medium text-gray-900">
                                                        {itemTotal.toFixed(2)} F CFA
                                                    </p>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="mt-2 text-red-600 hover:text-red-800 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Données brutes (pour debug) */}
                <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
                    <details>
                        <summary className="cursor-pointer text-gray-700 font-medium hover:text-gray-900">
                            Voir les données brutes du panier (Debug)
                        </summary>
                        <pre className="mt-4 bg-gray-100 p-4 rounded-lg overflow-auto text-xs">
                            {JSON.stringify(state, null, 2)}
                        </pre>
                    </details>
                </div>

                {/* Actions finales */}
                {state.items.length > 0 && (
                    <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                            <div className="text-lg">
                                <span className="text-gray-600">Total: </span>
                                <span className="font-bold text-adawi-gold">{state.total.toFixed(2)} F CFA</span>
                            </div>
                            <div className="flex gap-3">
                                <Link
                                    to="/panier"
                                    className="px-6 py-3 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 transition-colors"
                                >
                                    Aller au panier
                                </Link>
                                <button
                                    onClick={clearCart}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Vider le panier
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

import { useCategory } from "~/hooks/useCategory";
import { useState, useEffect } from "react";
import { useCart } from "~/contexts/CartContext";
import { ShoppingCart, Plus, Minus, Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  sizes?: string[];
  colors?: string[];
  category_id?: string;
  description?: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, state } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddToCart = async () => {
    console.log(" Début ajout au panier");
    setIsAdding(true);
    setError(null);
    setAddSuccess(false);

    try {
      console.log(" Données envoyées:", {
        productId: product.id,
        quantity: quantity
      });

      const success = await addToCart(product.id, quantity);
      
      console.log(" Résultat:", success);
      
      if (success) {
        setAddSuccess(true);
        setTimeout(() => setAddSuccess(false), 2000);
      } else {
        setError("Erreur lors de l'ajout");
      }
    } catch (error) {
      console.error(" Erreur:", error);
      setError("Erreur lors de l'ajout");
    }

    // IMPORTANT: Toujours remettre isAdding à false
    console.log(" Fin ajout au panier");
    setIsAdding(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      {/* Image du produit */}
      <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
        <img
          src={product.images[0] || "/placeholder-product.png"}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Informations du produit */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {product.name}
        </h3>

        <p className="text-xl font-bold text-adawi-gold">
          {product.price.toLocaleString()} F CFA
        </p>

        {/* Quantité */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Quantité:
          </label>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isAdding}
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent text-center"
              disabled={isAdding}
            />
            <button
              type="button"
              onClick={() => setQuantity(prev => prev + 1)}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isAdding}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Bouton d'ajout au panier */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className={`w-full py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
            addSuccess
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-adawi-gold hover:bg-adawi-gold/90 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isAdding ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Ajout en cours...</span>
            </>
          ) : addSuccess ? (
            <>
              <ShoppingCart className="w-5 h-5" />
              <span>Ajouté au panier !</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              <span>Ajouter au panier</span>
            </>
          )}
        </button>

        {/* Debug info */}
        <div className="text-xs text-gray-500">
          ID: {product.id} | Loading: {isAdding ? 'Oui' : 'Non'}
        </div>
      </div>
    </div>
  );
}

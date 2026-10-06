import { useEffect, useState } from "react";
import { ShoppingCart, X } from "lucide-react";
import { useToast } from "~/contexts/ToastContext";

// Interface pour les produits (simplifiée pour l'admin)
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  sizes?: string[];
  colors?: string[];
  stock: number;
}

interface AdminAddToCartModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminAddToCartModal({ product, isOpen, onClose }: AdminAddToCartModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const { showToast } = useToast();

  // Animation d'ouverture/fermeture
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  // Fermer avec Échap
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Reset state quand le produit change
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setSelectedSize(product.sizes?.[0] || 'M');
      setSelectedColor(product.colors?.[0] || 'noir');
    }
  }, [product]);

  // Fonction pour ajouter au panier
  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);

    try {
      // Préparer les données pour l'API
      const cartData = {
        product_id: product.id,
        quantity: quantity,
        size: selectedSize || "",
        color: selectedColor || "",
        images: product.images || [],
        price: product.price,
        name: product.name
      };

      console.log('Données envoyées à l\'API:', cartData);

      // Appel à l'API avec credentials pour les cookies HTTP-only
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important pour les cookies HTTP-only
        body: JSON.stringify(cartData)
      });

      const responseText = await response.text();
      console.log('Réponse brute de l\'API:', responseText);

      if (!response.ok) {
        const result = JSON.parse(responseText);

        // Gérer le cas où l'utilisateur n'est pas connecté
        if (result.errorType === 'auth_required' || result.errorType === 'session_expired') {
          showToast(
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.876c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.062 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="font-semibold text-gray-800">{result.title}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">{result.message}</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => window.location.href = result.loginUrl}
                  className="px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-brown transition-colors text-sm font-medium"
                >
                  {result.buttonText}
                </button>
                <button
                  onClick={() => {/* Le bouton X du toast fermera automatiquement */}}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Plus tard
                </button>
              </div>
            </div>,
            15000
          );
          return;
        }

        throw new Error(`Erreur ${response.status}: ${responseText}`);
      }

      const result = JSON.parse(responseText);
      console.log('Réponse parsée de l\'API:', result);

      // Attendre un peu pour l'animation
      await new Promise(resolve => setTimeout(resolve, 300));

      showToast(`${quantity} ${product.name} ajouté(e)s au panier`);

      // Déclencher un événement pour mettre à jour le compteur du panier
      window.dispatchEvent(new CustomEvent('cartUpdated', {
        detail: {
          total: result.total || 0,
          itemCount: result.items?.length || 0
        }
      }));

      handleClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      showToast(
        error instanceof Error
          ? `Erreur: ${error.message}`
          : 'Erreur lors de l\'ajout au panier',
        6000
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  if (!isOpen || !product) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 transition-all duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-30 flex justify-between items-center p-4 sm:p-6 border-b backdrop-blur-sm bg-white/95">
          <h2 className="text-xl sm:text-2xl font-bold text-black">Ajouter au panier</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-black transition-all duration-200 text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-95"
          >
            ×
          </button>
        </div>

        {/* Contenu */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Image du produit */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={product.images?.[0] || '/placeholder-product.png'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-product.png';
                  }}
                />
              </div>
            </div>

            {/* Informations produit */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-black mb-2">{product.name}</h3>
                <p className="text-2xl font-bold text-adawi-gold">
                  {product.price.toLocaleString()} {product.currency}
                </p>
                <p className="text-sm text-gray-600 mt-2">Stock: {product.stock} unités</p>
              </div>

              {/* Sélection de taille */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-black mb-3">Taille:</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`h-10 border-2 text-sm font-semibold transition-all duration-300 rounded-lg hover:scale-105 active:scale-95 ${
                          selectedSize === size
                            ? 'border-black bg-adawi-gold text-white shadow-lg transform scale-105'
                            : 'border-gray-300 text-black hover:shadow-md'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sélection de couleur */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-black mb-3">Couleur:</h4>
                  <div className="flex gap-3 flex-wrap">
                    {product.colors.map((color) => {
                      // Fonction pour générer les classes CSS basées sur la couleur
                      const getColorClasses = (colorName: string) => {
                        const colorLower = colorName.toLowerCase().trim();

                        // Mapping des couleurs spécifiques
                        const colorMap: Record<string, string> = {
                          blanc: "bg-white border-gray-400",
                          white: "bg-white border-gray-400",
                          noir: "bg-black border-gray-600",
                          black: "bg-black border-gray-600",
                          rouge: "bg-red-500 border-red-600",
                          red: "bg-red-500 border-red-600",
                          vert: "bg-green-500 border-green-600",
                          green: "bg-green-500 border-green-600",
                          bleu: "bg-blue-500 border-blue-600",
                          blue: "bg-blue-500 border-blue-600",
                          jaune: "bg-yellow-400 border-yellow-500",
                          yellow: "bg-yellow-400 border-yellow-500",
                          orange: "bg-orange-500 border-orange-600",
                          violet: "bg-purple-500 border-purple-600",
                          purple: "bg-purple-500 border-purple-600",
                          rose: "bg-pink-500 border-pink-600",
                          pink: "bg-pink-500 border-pink-600",
                          marron: "bg-amber-700 border-amber-800",
                          brown: "bg-amber-700 border-amber-800",
                          gris: "bg-gray-500 border-gray-600",
                          gray: "bg-gray-500 border-gray-600",
                          argent: "bg-gray-300 border-gray-400",
                          silver: "bg-gray-300 border-gray-400",
                          or: "bg-yellow-300 border-yellow-400",
                          gold: "bg-yellow-300 border-yellow-400",
                        };

                        return colorMap[colorLower] || "bg-gray-400 border-gray-500";
                      };

                      const colorClasses = getColorClasses(color);

                      return (
                        <div key={color} className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => setSelectedColor(color)}
                            className={`relative w-10 h-10 rounded-full border-2 transition-all duration-300 hover:scale-110 active:scale-95 ${colorClasses} ${
                              selectedColor === color
                                ? 'ring-4 ring-adawi-gold ring-offset-2 shadow-lg transform scale-110'
                                : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2 hover:shadow-md'
                            }`}
                            title={color}
                          >
                            {selectedColor === color && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-adawi-gold rounded-full border-2 border-white shadow-sm"></div>
                            )}
                          </button>
                          <span className="text-xs text-gray-600 font-medium capitalize">{color}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantité */}
              <div>
                <h4 className="text-sm font-semibold text-black mb-3">Quantité:</h4>
                <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-2 w-fit">
                  <button
                    className={`w-10 h-10 border-2 rounded-xl flex items-center justify-center text-lg font-bold transition-all duration-300 hover:scale-105 active:scale-95 ${
                      quantity > 1
                        ? 'border-gray-300 hover:border-black hover:bg-white text-black hover:shadow-md'
                        : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-100'
                    }`}
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="text-lg text-black font-bold min-w-[3rem] text-center bg-white px-4 py-2 rounded-lg">
                    {quantity}
                  </span>
                  <button
                    className="w-10 h-10 border-2 text-black border-gray-300 rounded-xl flex items-center justify-center text-lg font-bold hover:border-black hover:bg-white hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
                    onClick={increaseQuantity}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Bouton d'ajout au panier */}
              <div className="pt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${
                    isAddingToCart
                      ? "bg-adawi-gold text-white cursor-not-allowed scale-95"
                      : "bg-gradient-to-r bg-adawi-gold text-white hover:shadow-xl hover:bg-adawi-gold"
                  }`}
                >
                  {isAddingToCart ? (
                    <>
                      <svg
                        className="animate-spin h-6 w-6 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>AJOUT EN COURS...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>AJOUTER AU PANIER</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

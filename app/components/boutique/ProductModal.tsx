import { useEffect, useState, useCallback } from "react";
import type { Product } from "./ProductGrid";
import { useToast } from "~/contexts/ToastContext";
import { useCart } from "~/contexts/CartContext";
import { Link } from "react-router-dom";
import ZoomModal from "../blog/ZoomModal";
import {
  User,
  ShoppingCart,
  ShoppingBag,
  MessageSquare,
  LogOut,
  X
} from "lucide-react";

// Interface pour les produits API originaux
interface ApiProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  discounted_price?: number | null;
  discount_amount?: number | null;
  cost_price?: number;
  currency: string;
  category_id: string;
  sizes: string[];
  colors: string[];
  stock: number;
  low_stock_threshold?: number;
  images: string[];
  hover_images?: string[];
  tags: string[];
  seller_id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  category?: {
    id: string;
    name: string;
    description: string;
    parent_id: string;
  };
  profit?: number;
  margin_percent?: number;
}

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  apiProducts?: ApiProduct[]; // Nouveau prop pour les produits API originaux
}

export default function ProductModal({ product, isOpen, onClose, apiProducts = [] }: ProductModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<"next" | "prev" | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  // Zoom modal state
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState('');
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showControls, setShowControls] = useState(true);


  const { showToast } = useToast();
  const { addToCart } = useCart();

  // Zoom modal handlers
  const openZoomModal = (image: string) => {
    setZoomedImage(image);
    setZoomScale(1);
    setZoomPosition({ x: 0, y: 0 });
    setZoomModalOpen(true);
    setShowControls(true);
  };

  const closeZoomModal = () => {
    setZoomModalOpen(false);
  };

  const zoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.25, 5));
  };

  const zoomOut = () => {
    setZoomScale((prev) => Math.max(prev - 0.25, 1));
    setZoomPosition({ x: 0, y: 0 });
  };

  const zoomReset = () => {
    setZoomScale(1);
    setZoomPosition({ x: 0, y: 0 });
  };

  const toggleControls = () => {
    setShowControls((prev) => !prev);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setZoomPosition((prev) => ({
      x: prev.x + e.movementX,
      y: prev.y + e.movementY,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Animation d'ouverture/fermeture
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

// Fermer avec Échap et empêcher le scroll du body (pas de la modal)
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Sauvegarder la position de scroll actuelle
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      
      // Restaurer la position de scroll
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
      }
    };
  }, [isOpen]);

  const getAvailableSizes = (product: Product): string[] => {
    if (product.sizes) {
      return product.sizes
        .split(',')
        .map(size => size.trim().toUpperCase())
        .filter(size => size.length > 0);
    }
    return product.size ? [product.size.toUpperCase()] : ['M'];
  };

  const getAvailableColors = (product: Product): string[] => {
    if (product.colors) {
      return product.colors
        .split(',')
        .map(color => color.trim().toLowerCase())
        .filter(color => color.length > 0);
    }
    return product.color ? [product.color.toLowerCase()] : ['noir'];
  };

  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      setQuantity(1);
      setSelectedSize(getAvailableSizes(product)[0] || 'M');
      setSelectedColor(getAvailableColors(product)[0] || 'noir');
    }
  }, [product]);

  const getColorStyle = (color: string) => {
    const colorMap: Record<string, { bg: string, border: string }> = {
      blanc: { bg: "#FFFFFF", border: "#DC2626" },
      noir: { bg: "#000000", border: "#000000" },
      rouge: { bg: "#DC2626", border: "#DC2626" },
      vert: { bg: "#16A34A", border: "#16A34A" },
      marron: { bg: "#92400E", border: "#92400E" },
      bleu: { bg: "#2563EB", border: "#2563EB" },
    };

    // Pour les couleurs inconnues, créer un style dynamique
    const dynamicColorMap: Record<string, string> = {
      // Couleurs de base étendues
      rose: "#FF69B4",
      violet: "#8A2BE2",
      orange: "#FFA500",
      jaune: "#FFFF00",
      gris: "#808080",
      beige: "#F5F5DC",
      turquoise: "#40E0D0",
      magenta: "#FF00FF",
      cyan: "#00FFFF",
      lime: "#00FF00",
      indigo: "#4B0082",
      corail: "#FF7F50",
      saumon: "#FA8072",
      lavande: "#E6E6FA",
      menthe: "#98FB98",
      chocolat: "#D2691E",
      creme: "#FFFACD",

      // Nuances de rose et rouge
      fuchsia: "#FF00FF",
      bordeaux: "#800020",
      rouge: "#FF0000",
      rubis: "#E0115F",
      cerise: "#DE3163",
      framboise: "#C72C48",
      pourpre: "#800080",

      // Nuances de bleu
      bleu: "#0000FF",
      marine: "#000080",
      navy: "#000080",
      azur: "#007FFF",
      cobalt: "#0047AB",
      pétrole: "#1B4D5C",
      canard: "#048B9A",
      denim: "#1560BD",

      // Nuances de vert
      vert: "#008000",
      olive: "#808000",
      kaki: "#8B7355",
      émeraude: "#50C878",
      jade: "#00A86B",
      pistache: "#BEF574",
      sapin: "#0A3A2A",

      // Nuances de marron et terre
      marron: "#8B4513",
      caramel: "#AF6E4D",
      taupe: "#483C32",
      camel: "#C19A6B",
      cognac: "#9A463D",
      terracotta: "#E2725B",
      brun: "#654321",

      // Nuances de blanc et clair
      blanc: "#FFFFFF",
      ivoire: "#FFFFF0",
      ecru: "#F5F5DC",
      champagne: "#F7E7CE",
      perle: "#FDEEF4",

      // Nuances de noir et foncé
      noir: "#000000",
      anthracite: "#293133",
      charbon: "#36454F",

      // Couleurs métalliques
      or: "#FFD700",
      argent: "#C0C0C0",
      bronze: "#CD7F32",
      cuivre: "#B87333",

      // Couleurs pastel
      "rose pâle": "#FFB6C1",
      "bleu ciel": "#87CEEB",
      "vert menthe": "#F5FFFA",
      "jaune pâle": "#FFFFE0",
      "pêche": "#FFE5B4",

      // Couleurs vives
      fluo: "#CCFF00",
      néon: "#FF10F0",
      électrique: "#00FFFF",

      // Autres couleurs courantes
      prune: "#8E4585",
      aubergine: "#614051",
      moutarde: "#FFDB58",
      ocre: "#CC7722",
      ardoise: "#708090",
      lilas: "#C8A2C8",
      mauve: "#E0B0FF",
      grenat: "#733635",
      safran: "#F4C430",
      ambre: "#FFBF00",
      topaze: "#FFC87C",
    };

    if (colorMap[color]) {
      return {
        backgroundColor: colorMap[color].bg,
        borderColor: colorMap[color].border,
      };
    }

    const cssColor = dynamicColorMap[color.toLowerCase()] || "#808080"; // Gris par défaut si inconnu

    return {
      backgroundColor: cssColor,
      borderColor: "#D1D5DB", // gray-300
    };
  };

  function isNewProduct(productDate: Date | string): boolean {
    const today = new Date();
    const date = new Date(productDate);
    return Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)) <= 15;
  }

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  //  Fonction pour ajouter au panier et rediriger vers checkout-custom
  const handleAddToCartAndRedirect = async () => {
    if (!product) return;

    setIsAddingToCart(true);

    try {
      //  Trouver le produit API original pour obtenir les vraies données
      const apiProduct = apiProducts.find(p => p.id === product.id);

      //  Préparer les données exactement comme AddToCartModal
      const cartData = {
        product_id: product.id, //  Utiliser l'ID original (string)
        quantity: quantity,
        size: selectedSize || "",
        color: selectedColor || "",
        images: [product.image].filter(Boolean), //  Simplifier les images
        price: product.priceValue,
        name: product.name
      };

      console.log('Données envoyées à l\'API:', cartData);

      //  Appel à l'API avec credentials pour les cookies HTTP-only
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', //  Important pour les cookies HTTP-only
        body: JSON.stringify(cartData)
      });

      //  Log de la réponse brute pour le débogage
      const responseText = await response.text();
      console.log('Réponse brute de l\'API:', responseText);

      if (!response.ok) {
        const result = JSON.parse(responseText);

        // Gérer le cas où l'utilisateur n'est pas connecté
        if (result.errorType === 'auth_required' || result.errorType === 'session_expired') {
          // Créer un ID unique pour ce toast
          const toastId = `auth-toast-${Date.now()}`;

          // Afficher un toast personnalisé avec bouton de connexion
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
                  onClick={() => {/* Le bouton X du toast fermera automatiquement */ }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Plus tard
                </button>
              </div>
            </div>,
            15000 // 15 secondes - assez long pour que l'utilisateur puisse lire et agir
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

      //  Déclencher un événement pour mettre à jour le compteur du panier
      window.dispatchEvent(new CustomEvent('cartUpdated', {
        detail: {
          total: result.total || 0,
          itemCount: result.items?.length || 0
        }
      }));

      handleClose();

      //  Rediriger vers checkout-custom après ajout au panier
      window.location.href = '/checkout-custom';
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      showToast(
        error instanceof Error
          ? `Erreur: ${error.message}`
          : 'Erreur lors de l\'ajout au panier',
        6000 // 6 secondes pour les erreurs
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  //  Fonction corrigée pour utiliser le CartContext
  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);

    try {
      await addToCart(product, selectedSize || "", selectedColor || "", quantity);

      // Attendre un peu pour l'animation
      await new Promise(resolve => setTimeout(resolve, 300));

      showToast(`${quantity} ${product.name} ajouté(e)s au panier`);
      handleClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      showToast(
        error instanceof Error
          ? `Erreur: ${error.message}`
          : 'Erreur lors de l\'ajout au panier',
        6000 // 6 secondes pour les erreurs
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Tableau d'images — sans doublons
  const productImages = [
    product?.image,
    product?.hoverImage,
    product?.image1,
    product?.image2,
  ].filter((img, index, arr) =>
    Boolean(img) && arr.indexOf(img) === index // déduplique
  ) as string[];

  const currentImage = productImages[selectedImageIndex] || '/placeholder-product.png';

  // Open zoom modal on image click
  const handleImageClick = () => {
    if (currentImage) {
      openZoomModal(currentImage);
    }
  };

  const availableSizes = product ? getAvailableSizes(product) : [];
  const availableColors = product ? getAvailableColors(product) : [];
  const allSizes = ['XXL', 'XL', 'L', 'M', 'S', 'XS'];
  const allColors = ['noir', 'blanc', 'rouge', 'vert', 'marron', 'bleu'];

  // Fonction pour changer d'image avec animation
  const changeImage = (direction: "next" | "prev") => {
    if (productImages.length <= 1) return;

    setAnimationDirection(direction);
    setTimeout(() => {
      setSelectedImageIndex((prev) =>
        direction === "next"
          ? prev === productImages.length - 1 ? 0 : prev + 1
          : prev === 0 ? productImages.length - 1 : prev - 1
      );
      setAnimationDirection(null);
    }, 200);
  };

  // Swipe mobile
  useEffect(() => {
    if (!isOpen || productImages.length <= 1) return;
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      if (Math.abs(touchEndX - touchStartX) > 50) {
        touchEndX < touchStartX ? changeImage("next") : changeImage("prev");
      }
    };

    const modal = document.getElementById("product-modal-images");
    modal?.addEventListener("touchstart", handleTouchStart);
    modal?.addEventListener("touchend", handleTouchEnd);

    return () => {
      modal?.removeEventListener("touchstart", handleTouchStart);
      modal?.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isOpen, productImages.length]);

  // Flèches PC
  useEffect(() => {
    if (!isOpen || productImages.length <= 1) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") changeImage("next");
      if (e.key === "ArrowLeft") changeImage("prev");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, productImages.length]);

  if (!isOpen || !product) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 transition-all duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'
        }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto shadow-2xl transform transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Sticky sur mobile */}
        <div className="sticky top-0 bg-white z-30 flex justify-between items-center p-4 sm:p-6 border-b backdrop-blur-sm bg-white/95">
          <h2 className="text-xl sm:text-2xl font-bold text-black">Détails du produit</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-black transition-all duration-200 text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-95"
          >
            ×
          </button>
        </div>

        {/* Contenu */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

            {/* Images - Colonne gauche */}
            <div id="product-modal-images" className="space-y-4 order-1">
              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group">
                <img
                  key={selectedImageIndex}
                  src={currentImage}
                  alt={product.name}
                  onClick={handleImageClick}
                  className={`w-full h-full object-cover transition-all duration-300 ease-out transform
                    ${animationDirection === "next" ? "translate-x-10 opacity-0 scale-110" : ""}
                    ${animationDirection === "prev" ? "-translate-x-10 opacity-0 scale-110" : ""}
                    group-hover:scale-105 cursor-zoom-in
                  `}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-product.png';
                  }}
                />

                {isNewProduct(product.date) && (
                  <span
                    className="absolute top-3 left-3 z-20 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse cursor-default select-none"
                    onClick={(e) => e.stopPropagation()}
                  >
                    NEW
                  </span>
                )}

                {/* Flèches de navigation avec animation */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        changeImage("prev");
                      }}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white rounded-full p-3 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        changeImage("next");
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white rounded-full p-3 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Indicateur d'images */}
                {productImages.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {productImages.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${selectedImageIndex === index ? 'bg-white scale-125' : 'bg-white/50'
                          }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Miniatures avec scroll horizontal sur mobile */}
              {productImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative min-w-[4rem] w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-105 active:scale-95 ${selectedImageIndex === index
                        ? 'border-adawi-gold shadow-lg ring-2 ring-adawi-gold/20'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} vue ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-product.png';
                        }}
                      />
                      {selectedImageIndex === index && (
                        <div className="absolute inset-0 bg-adawi-gold/10 backdrop-blur-[1px]"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Infos produit - Colonne centre */}
            <div className="space-y-6 order-2 lg:order-2">
              <div className="animate-fade-in-up">
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-2 font-medium">
                  {product.category?.charAt(0).toUpperCase() + product.category?.slice(1) || 'Produit'}
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold text-black mb-4 leading-tight">{product.name}</h3>
                <div className="flex items-center gap-3 mb-4">
                  {(() => {
                    const apiProduct = apiProducts.find(p => p.id === product.id);
                    const hasDiscount = apiProduct?.discounted_price && apiProduct.discounted_price < apiProduct.price;
                    const originalPrice = apiProduct?.price || product.priceValue;
                    const discountedPrice = apiProduct?.discounted_price;

                    return (
                      <>
                        {hasDiscount ? (
                          <>
                            <p className="text-2xl sm:text-3xl font-bold text-red-600 bg-gradient-to-r from-red-600 to-red-800 bg-clip-text">
                              {discountedPrice}F CFA
                            </p>
                            <p className="text-lg sm:text-xl font-semibold text-gray-500 line-through">
                              {originalPrice}F CFA
                            </p>
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              -{Math.round(((originalPrice - discountedPrice!) / originalPrice) * 100)}%
                            </span>
                          </>
                        ) : (
                          <p className="text-2xl sm:text-3xl font-bold text-black bg-gradient-to-r from-black to-gray-800 bg-clip-text">
                            {product.price}
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Sélection de taille avec animation */}
              <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <h4 className="text-sm font-semibold text-black mb-4">Taille:</h4>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {allSizes.map((size) => {
                    const isAvailable = availableSizes.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => isAvailable && setSelectedSize(size)}
                        disabled={!isAvailable}
                        className={`relative h-12 border-2 text-sm font-semibold transition-all duration-300 rounded-lg hover:scale-105 active:scale-95 ${selectedSize === size && isAvailable
                          ? 'border-black bg-adawi-gold text-white shadow-lg transform scale-105'
                          : isAvailable
                            ? 'border-gray-300 text-black hover:shadow-md'
                            : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50 opacity-60'
                          }`}
                      >
                        <span className={!isAvailable ? 'line-through decoration-2 decoration-red-500' : ''}>
                          {size}
                        </span>
                        {selectedSize === size && isAvailable && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-black rounded-full"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {availableSizes.length > 0 && (
                  <p className="text-xs text-gray-500 mt-3 font-medium">
                    Disponible en: {availableSizes.join(', ')}
                  </p>
                )}
              </div>

              {/* Sélection de couleur avec animation */}
              <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <h4 className="text-sm font-semibold text-black mb-4">
                  Couleur: <span className="font-normal">{selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1)}</span>
                </h4>
                <div className="flex gap-3 flex-wrap">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      style={getColorStyle(color)}
                      className={`relative w-12 h-12 rounded-full border-4 transition-all duration-300 hover:scale-110 active:scale-95 ${selectedColor === color
                        ? 'ring-4 ring-adawi-gold ring-offset-2 shadow-lg transform scale-110'
                        : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2 hover:shadow-md'
                        }`}
                      aria-label={`Sélectionner la couleur ${color}`}
                    >
                      {selectedColor === color && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-adawi-gold rounded-full border-2 border-white shadow-sm"></div>
                      )}
                    </button>
                  ))}
                </div>
                {availableColors.length > 0 && (
                  <p className="text-xs text-gray-500 mt-3 font-medium">
                    Disponible en: {availableColors.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')}
                  </p>
                )}
              </div>

              {/* Quantité avec animation */}
              <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <h4 className="text-sm font-semibold text-black mb-4">Quantité:</h4>
                <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-2 w-fit">
                  <button
                    className={`w-12 h-12 border-2 rounded-xl flex items-center justify-center text-xl font-bold transition-all duration-300 hover:scale-105 active:scale-95 ${quantity > 1
                      ? 'border-gray-300 hover:border-black hover:bg-white text-black hover:shadow-md'
                      : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-100'
                      }`}
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    aria-label="Diminuer la quantité"
                  >
                    −
                  </button>
                  <span className="text-xl text-black font-bold min-w-[3rem] text-center bg-white px-4 py-2 rounded-lg">
                    {quantity}
                  </span>
                  <button
                    className="w-12 h-12 border-2 text-black border-gray-300 rounded-xl flex items-center justify-center text-xl font-bold hover:border-black hover:bg-white hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
                    onClick={increaseQuantity}
                    aria-label="Augmenter la quantité"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Actions et informations - Colonne droite */}
            <div className="space-y-4 order-3 lg:order-3">

              {/* Bouton d'ajout au panier */}

              {/* Sections pliables avec animations */}
              <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                <details className="group bg-gray-50 rounded-xl overflow-hidden hover:bg-gray-100 transition-colors duration-300">
                  <summary className="flex items-center justify-between cursor-pointer py-4 px-5 text-sm font-bold text-black">
                    DESCRIPTION
                    <svg className="w-5 h-5 transition-transform duration-300 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-4 text-sm text-gray-700 animate-fade-in">
                    <p className="leading-relaxed">Découvrez ce magnifique {product.name.toLowerCase()} de taille {selectedSize} et de couleur {selectedColor} de notre collection {product.category}. Confectionné avec soin et attention aux détails, ce produit allie style et confort pour un look parfait en toute occasion.</p>
                  </div>
                </details>

                <details className="group bg-gray-50 rounded-xl overflow-hidden hover:bg-gray-100 transition-colors duration-300">
                  <summary className="flex items-center justify-between cursor-pointer py-4 px-5 text-sm font-bold text-black">
                    POLITIQUE DE RETOUR
                    <svg className="w-5 h-5 transition-transform duration-300 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-4 text-sm text-gray-700 animate-fade-in">
                    <p className="leading-relaxed">Retours gratuits sous 30 jours. Les articles doivent être dans leur état d'origine avec tous les labels et emballages. Remboursement intégral garanti.</p>
                  </div>
                </details>

                <details className="group bg-gray-50 rounded-xl overflow-hidden hover:bg-gray-100 transition-colors duration-300">
                  <summary className="flex items-center justify-between cursor-pointer py-4 px-5 text-sm font-bold text-black">
                    GUIDE DES TAILLES
                    <svg className="w-5 h-5 transition-transform duration-300 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-4 animate-fade-in">
                    <div className="space-y-6">
                      {/* Hauts & Robes (Femme) */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="text-sm font-bold text-black mb-3 text-center">Hauts & Robes (Femme)</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-gray-700 border-collapse">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="border border-gray-300 px-2 py-2 text-center font-semibold">Taille</th>
                                <th className="border border-gray-300 px-2 py-2 text-center font-semibold">Tour de poitrine(cm)</th>
                                <th className="border border-gray-300 px-2 py-2 text-center font-semibold">Tour de taille(cm)</th>
                                <th className="border border-gray-300 px-2 py-2 text-center font-semibold">Tour de hanches(cm)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr><td className="border border-gray-300 px-2 py-1 text-center">XS</td><td className="border border-gray-300 px-2 py-1 text-center">82-86</td><td className="border border-gray-300 px-2 py-1 text-center">62-66</td><td className="border border-gray-300 px-2 py-1 text-center">88-92</td></tr>
                              <tr className="bg-gray-50"><td className="border border-gray-300 px-2 py-1 text-center">S</td><td className="border border-gray-300 px-2 py-1 text-center">86-90</td><td className="border border-gray-300 px-2 py-1 text-center">66-70</td><td className="border border-gray-300 px-2 py-1 text-center">92-96</td></tr>
                              <tr><td className="border border-gray-300 px-2 py-1 text-center">M</td><td className="border border-gray-300 px-2 py-1 text-center">90-94</td><td className="border border-gray-300 px-2 py-1 text-center">70-74</td><td className="border border-gray-300 px-2 py-1 text-center">96-100</td></tr>
                              <tr className="bg-gray-50"><td className="border border-gray-300 px-2 py-1 text-center">L</td><td className="border border-gray-300 px-2 py-1 text-center">94-98</td><td className="border border-gray-300 px-2 py-1 text-center">74-78</td><td className="border border-gray-300 px-2 py-1 text-center">100-104</td></tr>
                              <tr><td className="border border-gray-300 px-2 py-1 text-center">XL</td><td className="border border-gray-300 px-2 py-1 text-center">98-102</td><td className="border border-gray-300 px-2 py-1 text-center">78-82</td><td className="border border-gray-300 px-2 py-1 text-center">104-108</td></tr>
                              <tr className="bg-gray-50"><td className="border border-gray-300 px-2 py-1 text-center">XXL</td><td className="border border-gray-300 px-2 py-1 text-center">102-106</td><td className="border border-gray-300 px-2 py-1 text-center">82-86</td><td className="border border-gray-300 px-2 py-1 text-center">108-112</td></tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Pantalons & Jupes (Femme) */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="text-sm font-bold text-black mb-3 text-center">Pantalons & Jupes (Femme)</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-gray-700 border-collapse">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="border border-gray-300 px-2 py-2 text-center font-semibold">Taille</th>
                                <th className="border border-gray-300 px-2 py-2 text-center font-semibold">Tour de taille(cm)</th>
                                <th className="border border-gray-300 px-2 py-2 text-center font-semibold">Tour de hanches(cm)</th>
                                <th className="border border-gray-300 px-2 py-2 text-center font-semibold">Longueur jambe(cm)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr><td className="border border-gray-300 px-2 py-1 text-center">34</td><td className="border border-gray-300 px-2 py-1 text-center">62-66</td><td className="border border-gray-300 px-2 py-1 text-center">88-92</td><td className="border border-gray-300 px-2 py-1 text-center">76</td></tr>
                              <tr className="bg-gray-50"><td className="border border-gray-300 px-2 py-1 text-center">36</td><td className="border border-gray-300 px-2 py-1 text-center">66-70</td><td className="border border-gray-300 px-2 py-1 text-center">92-96</td><td className="border border-gray-300 px-2 py-1 text-center">78</td></tr>
                              <tr><td className="border border-gray-300 px-2 py-1 text-center">38</td><td className="border border-gray-300 px-2 py-1 text-center">70-74</td><td className="border border-gray-300 px-2 py-1 text-center">96-100</td><td className="border border-gray-300 px-2 py-1 text-center">80</td></tr>
                              <tr className="bg-gray-50"><td className="border border-gray-300 px-2 py-1 text-center">40</td><td className="border border-gray-300 px-2 py-1 text-center">74-78</td><td className="border border-gray-300 px-2 py-1 text-center">100-104</td><td className="border border-gray-300 px-2 py-1 text-center">82</td></tr>
                              <tr><td className="border border-gray-300 px-2 py-1 text-center">42</td><td className="border border-gray-300 px-2 py-1 text-center">78-82</td><td className="border border-gray-300 px-2 py-1 text-center">104-108</td><td className="border border-gray-300 px-2 py-1 text-center">84</td></tr>
                              <tr className="bg-gray-50"><td className="border border-gray-300 px-2 py-1 text-center">44</td><td className="border border-gray-300 px-2 py-1 text-center">82-86</td><td className="border border-gray-300 px-2 py-1 text-center">108-112</td><td className="border border-gray-300 px-2 py-1 text-center">86</td></tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Chemises & T-shirts (Homme) */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="text-sm font-bold text-black mb-3 text-center">Chemises & T-shirts (Homme)</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-gray-700 border-collapse">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="border border-gray-300 px-2 py-2 text-center font-semibold">Taille</th>
                                <th className="border border-gray-300 px-2 py-2 text-center font-semibold">Tour de poitrine(cm)</th>
                                <th className="border border-gray-300 px-2 py-2 text-center font-semibold">Tour de taille(cm)</th>
                                <th className="border border-gray-300 px-2 py-2 text-center font-semibold">Longueur dos(cm)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr><td className="border border-gray-300 px-2 py-1 text-center">S</td><td className="border border-gray-300 px-2 py-1 text-center">88-92</td><td className="border border-gray-300 px-2 py-1 text-center">76-80</td><td className="border border-gray-300 px-2 py-1 text-center">68</td></tr>
                              <tr className="bg-gray-50"><td className="border border-gray-300 px-2 py-1 text-center">M</td><td className="border border-gray-300 px-2 py-1 text-center">92-96</td><td className="border border-gray-300 px-2 py-1 text-center">80-84</td><td className="border border-gray-300 px-2 py-1 text-center">70</td></tr>
                              <tr><td className="border border-gray-300 px-2 py-1 text-center">L</td><td className="border border-gray-300 px-2 py-1 text-center">96-100</td><td className="border border-gray-300 px-2 py-1 text-center">84-88</td><td className="border border-gray-300 px-2 py-1 text-center">72</td></tr>
                              <tr className="bg-gray-50"><td className="border border-gray-300 px-2 py-1 text-center">XL</td><td className="border border-gray-300 px-2 py-1 text-center">100-104</td><td className="border border-gray-300 px-2 py-1 text-center">88-92</td><td className="border border-gray-300 px-2 py-1 text-center">74</td></tr>
                              <tr><td className="border border-gray-300 px-2 py-1 text-center">XXL</td><td className="border border-gray-300 px-2 py-1 text-center">104-108</td><td className="border border-gray-300 px-2 py-1 text-center">92-96</td><td className="border border-gray-300 px-2 py-1 text-center">76</td></tr>
                              <tr className="bg-gray-50"><td className="border border-gray-300 px-2 py-1 text-center">XXXL</td><td className="border border-gray-300 px-2 py-1 text-center">108-112</td><td className="border border-gray-300 px-2 py-1 text-center">96-100</td><td className="border border-gray-300 px-2 py-1 text-center">78</td></tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Pantalons (Homme) */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="text-sm font-bold text-black mb-3 text-center">Pantalons (Homme)</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-gray-700 border-collapse">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="border border-gray-300 px-2 py-2 text-center font-semibold">Taille</th>
                                <th className="border border-gray-300 px-2 py-2 text-center font-semibold">Tour de taille(cm)</th>
                                <th className="border border-gray-300 px-2 py-2 text-center font-semibold">Tour de hanches(cm)</th>
                                <th className="border border-gray-300 px-2 py-2 text-center font-semibold">Longueur jambe(cm)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr><td className="border border-gray-300 px-2 py-1 text-center">44</td><td className="border border-gray-300 px-2 py-1 text-center">76-80</td><td className="border border-gray-300 px-2 py-1 text-center">92-96</td><td className="border border-gray-300 px-2 py-1 text-center">82</td></tr>
                              <tr className="bg-gray-50"><td className="border border-gray-300 px-2 py-1 text-center">46</td><td className="border border-gray-300 px-2 py-1 text-center">80-84</td><td className="border border-gray-300 px-2 py-1 text-center">96-100</td><td className="border border-gray-300 px-2 py-1 text-center">84</td></tr>
                              <tr><td className="border border-gray-300 px-2 py-1 text-center">48</td><td className="border border-gray-300 px-2 py-1 text-center">84-88</td><td className="border border-gray-300 px-2 py-1 text-center">100-104</td><td className="border border-gray-300 px-2 py-1 text-center">86</td></tr>
                              <tr className="bg-gray-50"><td className="border border-gray-300 px-2 py-1 text-center">50</td><td className="border border-gray-300 px-2 py-1 text-center">88-92</td><td className="border border-gray-300 px-2 py-1 text-center">104-108</td><td className="border border-gray-300 px-2 py-1 text-center">88</td></tr>
                              <tr><td className="border border-gray-300 px-2 py-1 text-center">52</td><td className="border border-gray-300 px-2 py-1 text-center">92-96</td><td className="border border-gray-300 px-2 py-1 text-center">108-112</td><td className="border border-gray-300 px-2 py-1 text-center">90</td></tr>
                              <tr className="bg-gray-50"><td className="border border-gray-300 px-2 py-1 text-center">54</td><td className="border border-gray-300 px-2 py-1 text-center">96-100</td><td className="border border-gray-300 px-2 py-1 text-center">112-116</td><td className="border border-gray-300 px-2 py-1 text-center">92</td></tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </details>

                <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                  {(() => {
                    const apiProduct = apiProducts.find(p => p.id === product.id);
                    const isOutOfStock = apiProduct && apiProduct.stock <= 0;

                    if (isOutOfStock) {
                      return (
                        <div className="w-full py-4 px-6 rounded-2xl bg-red-50 border-2 border-red-200 text-center">
                          <div className="flex items-center justify-center gap-2 text-red-600 font-semibold mb-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.876c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.062 15.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span>RUPTURE DE STOCK</span>
                          </div>
                          <p className="text-sm text-red-500">
                            Ce produit n'est plus disponible. Commandez sur mesure pour une pièce unique !
                          </p>
                        </div>
                      );
                    }

                    return (
                      <button
                        onClick={handleAddToCart}
                        disabled={isAddingToCart}
                        className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${isAddingToCart
                            ? "bg-adawi-gold text-white cursor-not-allowed scale-95"
                            : "bg-adawi-gold text-white hover:shadow-xl hover:brightness-110"
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
                    );
                  })()}
                </div>

                {/* Titre et bouton contact */}
                <div className="animate-fade-in-up text-center space-y-4" style={{ animationDelay: '500ms' }}>
                  <h3 className="text-sm font-medium text-gray-600">Vous ne trouvez pas votre taille/couleur?</h3>
                  <button
                    onClick={handleAddToCartAndRedirect}
                    disabled={isAddingToCart}
                    className="w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 bg-adawi-gold border-2 text-white hover:text-white flex items-center justify-center gap-3 transform hover:scale-105 active:scale-95 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {isAddingToCart ? "AJOUT EN COURS..." : "COMMANDER SUR MESURE"}
                  </button>
                </div>
                <div className="animate-fade-in-up text-center space-y-4" style={{ animationDelay: '500ms' }}>
                  <h3 className="text-sm font-medium text-gray-600">Voulez-vous prendre rendez-vous?</h3>
                  <Link
                    to="/client/appointments"
                    className="w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 bg-adawi-gold border-2 text-white  hover:text-white flex items-center justify-center gap-3 transform hover:scale-105 active:scale-95 hover:shadow-xl"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    PRENDRE RENDEZ-VOUS
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {zoomModalOpen && (
        <ZoomModal
          zoomedImage={zoomedImage}
          zoomScale={zoomScale}
          zoomPosition={zoomPosition}
          isDragging={isDragging}
          showControls={showControls}
          onClose={closeZoomModal}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onZoomReset={zoomReset}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onToggleControls={toggleControls}
          onSetDragging={setIsDragging}
          onSetZoomPosition={setZoomPosition}
        />
      )}

      <style>{`\n        @keyframes fade-in-up {\n          from {\n            opacity: 0;\n            transform: translateY(20px);\n          }\n          to {\n            opacity: 1;\n            transform: translateY(0);\n          }\n        }\n        \n        @keyframes fade-in {\n          from {\n            opacity: 0;\n          }\n          to {\n            opacity: 1;\n          }\n        }\n        \n        .animate-fade-in-up {\n          animation: fade-in-up 0.6s ease-out forwards;\n        }\n        \n        .animate-fade-in {\n          animation: fade-in 0.3s ease-out;\n        }\n        \n        .scrollbar-hide {\n          -ms-overflow-style: none;\n          scrollbar-width: none;\n        }\n        \n        .scrollbar-hide::-webkit-scrollbar {\n          display: none;\n        }\n        \n        @media (max-width: 1024px) {\n          .order-1 { order: 1; }\n          .order-2 { order: 2; }\n          .order-3 { order: 3; }\n        }\n      `}</style>
    </div>
  );
}
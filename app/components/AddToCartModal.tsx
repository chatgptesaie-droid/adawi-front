import { useState } from "react";
import { X, ShoppingCart, Package, Palette, Ruler } from "lucide-react";

interface Product {
    id: string;
    name: string;
    price: number;
    currency: string;
    sizes: string[];
    colors: string[];
    images: string[];
    stock: number;
}

interface AddToCartModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (productId: string, quantity: number, size: string, color: string) => Promise<void>;
    isAdding: boolean;
}

export default function AddToCartModal({
    product,
    isOpen,
    onClose,
    onAddToCart,
    isAdding
}: AddToCartModalProps) {
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [quantity, setQuantity] = useState(1);

    if (!isOpen || !product) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (product.sizes.length > 0 && !selectedSize) {
            alert("Veuillez sélectionner une taille");
            return;
        }
        
        if (product.colors.length > 0 && !selectedColor) {
            alert("Veuillez sélectionner une couleur");
            return;
        }

        await onAddToCart(product.id, quantity, selectedSize, selectedColor);
    };

    const formatPrice = (price: number, currency: string = "F CFA") => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: currency
        }).format(price);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                            <ShoppingCart className="w-5 h-5 mr-2 text-adawi-gold" />
                            Ajouter au panier
                        </h2>
                        <button
                            onClick={onClose}
                            disabled={isAdding}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Produit */}
                    <div className="flex items-start space-x-4 mb-6">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {product.images && product.images.length > 0 ? (
                                <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-8 h-8 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                            <p className="text-lg font-bold text-adawi-gold">
                                {formatPrice(product.price, product.currency)}
                            </p>
                            <p className="text-sm text-gray-500">
                                Stock: {product.stock} disponible{product.stock > 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    {/* Quantité */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantité
                        </label>
                        <div className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={quantity <= 1 || isAdding}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                -
                            </button>
                            <span className="w-12 text-center font-medium">{quantity}</span>
                            <button
                                type="button"
                                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                disabled={quantity >= product.stock || isAdding}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Tailles */}
                    {product.sizes && product.sizes.length > 0 && (
                        <div className="mb-6">
                            <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <Ruler className="w-4 h-4 mr-1" />
                                Taille *
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {product.sizes.map(size => (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={() => setSelectedSize(size)}
                                        disabled={isAdding}
                                        className={`px-3 py-2 text-sm rounded-md border transition-colors disabled:opacity-50 ${
                                            selectedSize === size
                                                ? 'bg-adawi-gold text-white border-adawi-gold'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Couleurs */}
                    {product.colors && product.colors.length > 0 && (
                        <div className="mb-6">
                            <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <Palette className="w-4 h-4 mr-1" />
                                Couleur *
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {product.colors.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setSelectedColor(color)}
                                        disabled={isAdding}
                                        className={`px-3 py-2 text-sm rounded-md border transition-colors disabled:opacity-50 ${
                                            selectedColor === color
                                                ? 'bg-adawi-gold text-white border-adawi-gold'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Total */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">Total:</span>
                            <span className="text-xl font-bold text-adawi-gold">
                                {formatPrice(product.price * quantity, product.currency)}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isAdding}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isAdding || product.stock === 0}
                            className="flex-1 px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {isAdding ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Ajout...</span>
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="w-4 h-4" />
                                    <span>Ajouter au panier</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

import { X, Package, Tag, Palette, Ruler, Calendar, User } from "lucide-react";
import { useState, useEffect } from "react";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
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

interface ViewProductModalProps {
    product: Product | null;
    productId?: string; // Nouveau prop pour charger un produit par ID
    isOpen: boolean;
    onClose: () => void;
    isLoading?: boolean; // Ajout de la prop isLoading comme optionnelle
}

export default function ViewProductModal({ 
    product: initialProduct, 
    productId, 
    isOpen, 
    onClose,
    isLoading: externalLoading = false // Valeur par défaut
}: ViewProductModalProps) {
    const [product, setProduct] = useState<Product | null>(initialProduct);
    const [isLoading, setIsLoading] = useState(externalLoading);
    const [error, setError] = useState<string | null>(null);

    // Charger le produit par ID si nécessaire
    useEffect(() => {
        if (isOpen && productId && !initialProduct) {
            loadProduct(productId);
        } else if (initialProduct) {
            setProduct(initialProduct);
            setError(null);
        }
    }, [isOpen, productId, initialProduct]);

    const loadProduct = async (id: string) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`/api/products/${id}`);
            const data = await response.json();
            
            if (data.success) {
                setProduct(data.product);
            } else {
                setError(data.error || "Erreur lors du chargement du produit");
            }
        } catch (err) {
            setError("Erreur de connexion");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (price: number, currency: string = 'F CFA') => {
        return `${price.toLocaleString()} ${currency}`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">Détails du produit</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-adawi-gold border-t-transparent rounded-full animate-spin"></div>
                            <span className="ml-3 text-gray-600">Chargement...</span>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <X className="w-8 h-8 text-red-600" />
                                </div>
                                <p className="text-red-600 font-medium">{error}</p>
                                <button
                                    onClick={() => productId && loadProduct(productId)}
                                    className="mt-4 px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 transition-colors"
                                >
                                    Réessayer
                                </button>
                            </div>
                        </div>
                    ) : !product ? (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-gray-500">Aucun produit à afficher</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Images */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Images</h3>
                                {product.images && product.images.length > 0 ? (
                                    <div className="space-y-4">
                                        {/* Images principales */}
                                        <div>
                                            <p className="text-sm text-gray-500 mb-2">Images principales</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                {product.images.map((image, index) => (
                                                    <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                                        <img
                                                            src={image}
                                                            alt={`${product.name} - Image ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Images de survol */}
                                        {product.hover_images && product.hover_images.length > 0 && (
                                            <div>
                                                <p className="text-sm text-gray-500 mb-2">Images de survol</p>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {product.hover_images.map((image, index) => (
                                                        <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                                            <img
                                                                src={image}
                                                                alt={`${product.name} - Survol ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                                        <Package className="w-16 h-16 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                                    <p className="text-sm text-gray-500">ID: {product.id}</p>
                                    <div className="mt-2">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                            product.is_active 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {product.is_active ? "Actif" : "Inactif"}
                                        </span>
                                    </div>
                                </div>

                                {/* Price and Financial Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-100 px-4 py-3 rounded-lg">
                                        <p className="text-sm text-gray-500">Prix de vente</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {formatPrice(product.price, product.currency)}
                                        </p>
                                    </div>
                                    <div className="bg-gray-100 px-4 py-3 rounded-lg">
                                        <p className="text-sm text-gray-500">Stock</p>
                                        <p className={`text-xl font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {product.stock} unités
                                        </p>
                                    </div>
                                </div>

                                {/* Cost and Profit (if available) */}
                                {(product.cost_price !== undefined || product.profit !== undefined) && (
                                    <div className="grid grid-cols-2 gap-4">
                                        {product.cost_price !== undefined && (
                                            <div className="bg-blue-50 px-4 py-3 rounded-lg">
                                                <p className="text-sm text-gray-500">Prix de revient</p>
                                                <p className="text-lg font-bold text-blue-900">
                                                    {formatPrice(product.cost_price, product.currency)}
                                                </p>
                                            </div>
                                        )}
                                        {product.profit !== undefined && (
                                            <div className="bg-green-50 px-4 py-3 rounded-lg">
                                                <p className="text-sm text-gray-500">Profit unitaire</p>
                                                <p className="text-lg font-bold text-green-900">
                                                    {formatPrice(product.profit, product.currency)}
                                                </p>
                                                {product.margin_percent !== undefined && (
                                                    <p className="text-xs text-green-600">
                                                        Marge: {product.margin_percent.toFixed(1)}%
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Stock Threshold */}
                                {product.low_stock_threshold !== undefined && (
                                    <div className="bg-yellow-50 px-4 py-3 rounded-lg">
                                        <p className="text-sm text-gray-500">Seuil d'alerte stock</p>
                                        <p className="font-medium text-yellow-800">
                                            {product.low_stock_threshold} unités
                                        </p>
                                        {product.stock <= product.low_stock_threshold && (
                                            <p className="text-xs text-red-600 mt-1">
                                                 Stock faible !
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Category */}
                                <div className="flex items-center space-x-3">
                                    <Tag className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Catégorie</p>
                                        <p className="font-medium text-gray-900">
                                            {product.category?.name || product.category_id}
                                        </p>
                                    </div>
                                </div>

                                {/* Sizes */}
                                {product.sizes && product.sizes.length > 0 && (
                                    <div className="flex items-start space-x-3">
                                        <Ruler className="w-5 h-5 text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-500">Tailles disponibles</p>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {product.sizes.map((size, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 bg-gray-200 text-gray-700 text-sm rounded"
                                                    >
                                                        {size}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Colors */}
                                {product.colors && product.colors.length > 0 && (
                                    <div className="flex items-start space-x-3">
                                        <Palette className="w-5 h-5 text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-500">Couleurs disponibles</p>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {product.colors.map((color, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 bg-gray-200 text-gray-700 text-sm rounded"
                                                    >
                                                        {color}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Tags */}
                                {product.tags && product.tags.length > 0 && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-2">Tags</p>
                                        <div className="flex flex-wrap gap-2">
                                            {product.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-adawi-gold/20 text-adawi-gold text-sm rounded-full"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Dates */}
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <Calendar className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">Créé le</p>
                                            <p className="font-medium text-gray-900">{formatDate(product.created_at)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Calendar className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">Modifié le</p>
                                            <p className="font-medium text-gray-900">{formatDate(product.updated_at)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Seller */}
                                <div className="flex items-center space-x-3">
                                    <User className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Vendeur ID</p>
                                        <p className="font-medium text-gray-900">{product.seller_id}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {product && (
                        <div className="mt-8">
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">Description</h4>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-700 leading-relaxed">
                                    {product.description || "Aucune description disponible."}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200">
                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { X, Package, Tag, Palette, Ruler, FileText, Calendar, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost_price?: number;
  currency?: string;
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
  is_active?: boolean;
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
  isOpen: boolean;
  onClose: () => void;
  productId: string | null;
}

export default function ViewProductModal({ isOpen, onClose, productId }: ViewProductModalProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (error) {
      console.error("Erreur:", error);
      setError("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && productId) {
      loadProduct(productId);
    }
  }, [isOpen, productId]);

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Détails du produit</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

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
          ) : product ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Images */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Images</h3>
                <div className="space-y-4">
                  {product.images && product.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {product.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {product.hover_images && product.hover_images.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Images de survol</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {product.hover_images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`${product.name} survol ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Informations */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        <Package className="w-4 h-4 inline mr-2" />
                        Nom
                      </label>
                      <p className="mt-1 text-gray-900">{product.name}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        <FileText className="w-4 h-4 inline mr-2" />
                        Description
                      </label>
                      <p className="mt-1 text-gray-900 whitespace-pre-wrap">{product.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          <DollarSign className="w-4 h-4 inline mr-2" />
                          Prix de vente
                        </label>
                        <p className="mt-1 text-gray-900 font-semibold">
                          {product.price.toLocaleString('fr-FR')} {product.currency || 'F CFA'}
                        </p>
                      </div>
                      {product.cost_price && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Prix de revient</label>
                          <p className="mt-1 text-gray-900">
                            {product.cost_price.toLocaleString('fr-FR')} {product.currency || 'F CFA'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        <Tag className="w-4 h-4 inline mr-2" />
                        Catégorie
                      </label>
                      <p className="mt-1 text-gray-900">{product.category?.name || "Sans catégorie"}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Stock</label>
                        <p className="mt-1 text-gray-900 font-semibold">{product.stock} unités</p>
                      </div>
                      {product.low_stock_threshold && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Seuil d'alerte</label>
                          <p className="mt-1 text-gray-900">{product.low_stock_threshold} unités</p>
                        </div>
                      )}
                    </div>

                    {product.sizes && product.sizes.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          <Ruler className="w-4 h-4 inline mr-2" />
                          Tailles
                        </label>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {product.sizes.map((size, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded">
                              {size}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {product.colors && product.colors.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          <Palette className="w-4 h-4 inline mr-2" />
                          Couleurs
                        </label>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {product.colors.map((color, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded">
                              {color}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {product.tags && product.tags.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          <Tag className="w-4 h-4 inline mr-2" />
                          Tags
                        </label>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {product.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <label className="block font-medium">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Créé le
                        </label>
                        <p>{formatDate(product.created_at)}</p>
                      </div>
                      <div>
                        <label className="block font-medium">Modifié le</label>
                        <p>{formatDate(product.updated_at)}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Statut</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

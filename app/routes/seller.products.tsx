import type { LoaderFunctionArgs } from "@remix-run/node";
import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState, useEffect, useRef } from "react";
import AddProductModal from "~/components/admin/AddProductModal";
import ViewProductModal from "~/components/admin/ViewProductModal";
import SellerAddToCartModal from "~/components/seller/SellerAddToCartModal";
import { requireVendor } from "~/utils/auth.server";
import SellerLayout from "~/components/seller/SellerLayout";

import {
  Package,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  ArrowUpRight,
  Plus,
  TrendingUp,
  ShoppingBag,
  X,
  Image,
  Upload,
  Bell
} from "lucide-react";
import { readToken } from "~/utils/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard Vendeur - Adawi" },
    { name: "description", content: "Tableau de bord vendeur pour gérer vos produits" },
  ];
};

function extractTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  // Adapter selon le nom de votre cookie d'authentification
  // Essayez différents noms possibles
  const possibleNames = ['authToken', 'token', 'access_token', 'jwt', 'session'];

  for (const name of possibleNames) {
    const regex = new RegExp(`${name}=([^;]+)`);
    const match = cookieHeader.match(regex);
    if (match) {
      console.log(` Token trouvé dans le cookie '${name}'`);
      return match[1];
    }
  }

  console.log(" Aucun token trouvé dans les cookies");
  console.log(" Cookies disponibles:", cookieHeader);
  return null;
}
function EditProductModal({
  isOpen,
  onClose,
  product,
  onEditProduct,
  categories,
  token
}: {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onEditProduct: (product: any) => void;
  categories: { id: string, name: string }[];
  token: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    price: product.price.toString(),
    cost_price: product.cost_price?.toString() || "",
    category_id: product.category_id,
    stock: product.stock.toString(),
    low_stock_threshold: product.low_stock_threshold?.toString() || "",
    sizes: product.sizes?.join(",") || "",
    colors: product.colors?.join(",") || "",
    tags: product.tags?.join(",") || "",
    is_active: product.is_active
  });

  const [newImages, setNewImages] = useState<File[]>([]);
  const [newHoverImages, setNewHoverImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [hoverImagePreviewUrls, setHoverImagePreviewUrls] = useState<string[]>([]);


  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const hoverImageInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setNewImages(files);
    setImagePreviewUrls(files.map(f => URL.createObjectURL(f)));
  };

  const handleHoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setNewHoverImages(files);
    setHoverImagePreviewUrls(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const submitFormData = new FormData();

      // ... (le reste du code de préparation des données reste identique)

      // Ajouter les champs de base
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          if (key === 'sizes' || key === 'colors' || key === 'tags') {
            // Convertir les chaînes en arrays JSON
            const arrayValue = value.toString().split(',').map(s => s.trim()).filter(s => s);
            if (arrayValue.length > 0) {
              submitFormData.append(key, JSON.stringify(arrayValue));
            }
          } else {
            submitFormData.append(key, value.toString());
          }
        }
      });

      // Ajouter les nouvelles images si fournies
      if (newImages.length > 0) {
        newImages.forEach(image => {
          submitFormData.append("images", image);
        });
      }

      if (newHoverImages.length > 0) {
        newHoverImages.forEach(image => {
          submitFormData.append("hover_images", image);
        });
      }

      console.log(" Modification du produit:", product.id);
      console.log(" Token utilisé:", token?.substring(0, 20) + "...");

      const response = await fetch(`http://localhost:8000/products/${product.id}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: submitFormData,
      });

      // Lire d'abord le corps de la réponse
      const responseText = await response.text();
      console.log(" Réponse brute:", responseText);

      let responseData;
      try {
        // Essayer de parser la réponse en JSON
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.log(" La réponse n'est pas du JSON valide");
        throw new Error("Format de réponse invalide");
      }

      if (!response.ok) {
        console.error(" Erreur modification:", response.status, responseData);
        throw new Error(responseData.detail || responseData.message || "Erreur lors de la modification");
      }

      console.log(" Produit modifié avec succès:", responseData);

      // Si on arrive ici, c'est que la modification a réussi
      onEditProduct(responseData);
      onClose();

    } catch (err: any) {
      console.error(" Erreur handleSubmit:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Modifier le produit</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600" disabled={isSubmitting}>
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colonne gauche */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Informations de base</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix de vente (F CFA) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix de revient (F CFA)</label>
                  <input
                    type="number"
                    name="cost_price"
                    value={formData.cost_price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seuil d'alerte stock</label>
                  <input
                    type="number"
                    name="low_stock_threshold"
                    value={formData.low_stock_threshold}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-adawi-gold border-gray-300 rounded focus:ring-adawi-gold"
                />
                <label className="ml-2 text-sm text-gray-700">Produit actif</label>
              </div>
            </div>

            {/* Colonne droite */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Variantes et Images</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tailles (séparées par des virgules)</label>
                <input
                  type="text"
                  name="sizes"
                  value={formData.sizes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                  placeholder="S,M,L,XL"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Couleurs (séparées par des virgules)</label>
                <input
                  type="text"
                  name="colors"
                  value={formData.colors}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                  placeholder="Rouge,Bleu,Noir"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (séparés par des virgules)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                  placeholder="été,casual,tendance"
                  disabled={isSubmitting}
                />
              </div>

              {/* Images actuelles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Images actuelles</label>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {product.images?.map((image, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Nouvelles images principales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remplacer les images principales</label>
                <input
                  type="file"
                  ref={mainImageInputRef}
                  onChange={handleMainImageChange}
                  multiple
                  accept="image/*"
                  className="hidden"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => mainImageInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-adawi-gold transition-colors disabled:opacity-50"
                >
                  <Upload className="w-5 h-5 mr-2 text-gray-400" />
                  <span className="text-gray-600">Choisir de nouvelles images</span>
                </button>

                {/* Aperçu des nouvelles images */}
                {imagePreviewUrls.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={url}
                          alt={`Nouvelle image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Images de survol actuelles */}
              {product.hover_images && product.hover_images.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Images de survol actuelles</label>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {product.hover_images.map((image, index) => (
                      <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`Survol ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nouvelles images de survol */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remplacer les images de survol</label>
                <input
                  type="file"
                  ref={hoverImageInputRef}
                  onChange={handleHoverImageChange}
                  multiple
                  accept="image/*"
                  className="hidden"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => hoverImageInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-adawi-gold transition-colors disabled:opacity-50"
                >
                  <Image className="w-5 h-5 mr-2 text-gray-400" />
                  <span className="text-gray-600">Choisir de nouvelles images de survol</span>
                </button>

                {/* Aperçu des nouvelles images de survol */}
                {hoverImagePreviewUrls.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {hoverImagePreviewUrls.map((url, index) => (
                      <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={url}
                          alt={`Nouvelle image survol ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Modification...</span>
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" />
                  <span>Mettre à jour</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Confirmation Modal Component
function DeleteConfirmationModal({
  isOpen,
  onClose,
  product,
  onConfirmDelete,
  isDeleting
}: {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onConfirmDelete: (productId: string) => void;
  isDeleting: boolean;
}) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-red-100 rounded-full mr-3">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Confirmer la suppression</h2>
          </div>

          <p className="text-gray-600 mb-6">
            Êtes-vous sûr de vouloir supprimer le produit <strong>"{product.name}"</strong> ?
            Cette action est irréversible.
          </p>

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={() => onConfirmDelete(product.id)}
              disabled={isDeleting}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Suppression...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Supprimer</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireVendor(request);
  const token = await readToken(request);

  if (!token) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return json({ user, token });
};
// Interface pour les produits
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

// Interface pour les notifications
interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  order_id?: string;
  created_at: string;
  read: boolean;
}

export default function SellerDashboard() {
  const { user, token } = useLoaderData<typeof loader>();

  // États pour les produits
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [isNotificationOpen, setIsNotificationOpen] = useState(false);




  // États pour le modal d'ajout de produit
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddToCartModalOpen, setIsAddToCartModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const openViewModal = (product: Product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };
  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };
  // États pour les notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);

  // Fonction pour charger les produits du vendeur
  const loadProducts = async () => {
    setIsLoadingProducts(true);
    setProductsError(null);

    try {
      const response = await fetch(`/api/products/vendor`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur API: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setProducts(data.products || []);
      } else {
        const errorMessage = data.error || "Erreur lors du chargement des produits";
        setProductsError(errorMessage);
      }
    } catch (error: any) {
      setProductsError(`Erreur de connexion: ${error.message}`);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Charger les catégories
  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();

      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des catégories:", err);
    }
  };

  // Charger les notifications
  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Récupération des notifications via API locale...');

      // Demander plus de notifications (limite à 100)
      const response = await fetch('/api/notifications?limit=100&offset=0');

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur API locale:', errorData);
        setError(errorData.error || `Erreur ${response.status}`);
        return;
      }

      const data = await response.json();
      console.log('Données reçues:', data);
      console.log('Nombre de notifications:', data.length);
      console.log('Première notification:', data[0]);
      console.log('Dernière notification:', data[data.length - 1]);

      setNotifications(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  // Marquer une notification comme lue
  const markAsRead = async (notificationId: string) => {
    try {
      console.log(' Marquage notification comme lue:', notificationId);

      // Utiliser la route existante avec FormData
      const formData = new FormData();
      formData.append('notificationId', notificationId);

      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        console.log(' Notification marquée comme lue:', result);

        // Mettre à jour l'état local
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId
              ? { ...notif, read: true }
              : notif
          )
        );
      } else {
        const errorData = await response.json();
        console.error(' Erreur marquage notification:', errorData);

        // Mettre à jour localement même si l'API échoue
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId
              ? { ...notif, read: true }
              : notif
          )
        );
      }
    } catch (error) {
      console.error(" Erreur lors du marquage de la notification:", error);

      // Mettre à jour localement même si l'API échoue
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, read: true }
            : notif
        )
      );
    }
  };

  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    setIsNotificationOpen(false); // Fermer le dropdown
  };

  // Fonction pour fermer le modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadProducts();
    loadCategories();
    // loadNotifications();
  }, []);

// Calculer les statistiques
  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.is_active).length,
    totalStock: products.reduce((sum, p) => sum + p.stock, 0),
    lowStockProducts: products.filter(p => p.stock <= (p.low_stock_threshold || 5)).length,
    totalValue: products.reduce((sum, p) => sum + p.price * p.stock, 0),
    totalProfit: products.reduce((sum, p) => sum + (p.price - (p.cost_price || 0)) * p.stock, 0)
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Fonction pour gérer l'ajout de produit
  const handleProductCreated = () => {
    loadProducts();
    setIsAddModalOpen(false);
  };
  const handleEditProduct = async (updatedProduct: any) => {
    try {
      console.log(" Produit mis à jour:", updatedProduct);
      // Recharger la liste des produits pour afficher les modifications
      await loadProducts();
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      // Afficher un message de succès
      alert("Produit modifié avec succès !");
    } catch (error) {
      console.error(" Erreur dans handleEditProduct:", error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setIsDeleting(true);
    try {
      console.log(" Suppression du produit:", productId);

      const response = await fetch(`http://localhost:8000/products/${productId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || "Erreur lors de la suppression");
      }

      console.log(" Produit supprimé avec succès");
      // Recharger la liste des produits
      await loadProducts();
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
      alert("Produit supprimé avec succès !");
    } catch (error: any) {
      console.error(" Erreur lors de la suppression:", error);
      alert(`Erreur lors de la suppression: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };
  useEffect(() => {
    fetchNotifications();

    // Actualiser les notifications toutes les 30 secondes
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Compter les notifications non lues
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SellerLayout userName="Nom du Vendeur"> {/* Replace with actual seller name */}
      <div className="min-h-screen bg-gradient-to-br from-adawi-beige via-white to-adawi-beige/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header avec gradient */}
          <div className="bg-gradient-to-r from-adawi-brown to-adawi-gold rounded-2xl shadow-xl p-8 mb-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                 Gérez vos produits et suivez vos performances 
                </h1>
                
              </div>

              <div className="flex items-center space-x-4">
                {/* Bouton Ajouter un produit */}
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center px-6 py-3 bg-white text-adawi-brown rounded-xl hover:bg-adawi-beige transition-all duration-200 shadow-lg font-medium"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Ajouter un produit
                </button>
              </div>
            </div>
          </div>

          {/* Cartes de statistiques améliorées */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 mb-4">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                  <p className="text-sm text-gray-500">Produits</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{stats.activeProducts} actifs</span>
                <div className="flex items-center text-green-600">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">
                    {Math.round((stats.activeProducts / Math.max(stats.totalProducts, 1)) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStock}</p>
                  <p className="text-sm text-gray-500">Stock Total</p>
                </div>
              </div>
              {stats.lowStockProducts > 0 && (
                <div className="flex items-center text-amber-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">
                    {stats.lowStockProducts} en stock bas
                  </span>
                </div>
              )}
            </div>

            {/* <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalValue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-sm text-gray-500">Valeur Stock</p>
                </div>
              </div>
              <span className="text-sm text-gray-600">F CFA</span>
            </div> */}

            {/* <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalProfit.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-sm text-gray-500">Profit Potentiel</p>
                </div>
              </div>
              <span className="text-sm text-gray-600">F CFA</span>
            </div> */}
          </div>

          {/* Section des produits améliorée */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Mes Produits</h2>
                  <p className="text-gray-600 mt-1">
                    Gérez votre catalogue de produits
                  </p>
                </div>
                <button
                  onClick={() => loadProducts()}
                  disabled={isLoadingProducts}
                  className="flex items-center px-4 py-2 text-adawi-brown hover:text-adawi-gold transition-colors"
                >
                  <RefreshCw className={`w-5 h-5 mr-2 ${isLoadingProducts ? 'animate-spin' : ''}`} />
                  Actualiser
                </button>
              </div>
            </div>

            {/* Contenu du tableau */}
            <div className="overflow-x-auto">
              {isLoadingProducts ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-adawi-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Chargement des produits...</p>
                  </div>
                </div>
              ) : productsError ? (
                <div className="text-center py-16">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6 inline-block">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-800 font-medium mb-2">Erreur de chargement</p>
                    <p className="text-red-600 text-sm mb-4">{productsError}</p>
                    <button
                      onClick={() => loadProducts()}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Réessayer
                    </button>
                  </div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
                  <p className="text-gray-600 mb-6">Commencez par ajouter votre premier produit</p>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-6 py-3 bg-adawi-gold text-white rounded-xl hover:bg-adawi-gold/90 transition-colors font-medium"
                  >
                    Ajouter un produit
                  </button>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Prix
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-12 w-12 flex-shrink-0">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  className="h-12 w-12 rounded-xl object-cover border-2 border-gray-200"
                                  src={product.images[0]}
                                  alt={product.name}
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-gray-200 ${product.images?.length > 0 ? 'hidden' : ''}`}>
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900 max-w-xs truncate">
                                {product.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {product.category?.name || "Sans catégorie"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-semibold">
                            {product.price.toLocaleString('fr-FR')} {product.currency || 'F CFA'}
                          </div>
                          {product.cost_price && product.cost_price > 0 && (
                            <div className="text-xs text-green-600 font-medium">
                              Marge: {Math.round(((product.price - product.cost_price) / product.price) * 100)}%
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-semibold ${product.stock <= 0
                            ? 'text-red-600'
                            : product.stock <= (product.low_stock_threshold || 5)
                              ? 'text-amber-600'
                              : 'text-green-600'
                            }`}>
                            {product.stock}
                          </div>
                          {product.low_stock_threshold && (
                            <div className="text-xs text-gray-500">
                              Seuil: {product.low_stock_threshold}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${product.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {product.is_active ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Actif
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                Inactif
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">
                            {formatDate(product.created_at)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(product.created_at).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsAddToCartModalOpen(true);
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Ajouter au panier"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                            <button
                              onClick={() => openViewModal(product)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Voir détails"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                             <button
                              onClick={() => openEditModal(product)}
                              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Supprimer le produit"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>


          </div>
        </div>


        {/* Add Product Modal */}
        <AddProductModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onProductCreated={handleProductCreated}
          categories={categories}
          token={token}
        />
        {selectedProduct && (
          <ViewProductModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            product={selectedProduct}
          />
        )}
         {selectedProduct && (
          <EditProductModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            product={selectedProduct}
            onEditProduct={handleEditProduct}
            categories={categories}
            token={token}
          />

        )} 

        {/* Seller Add to Cart Modal */}
        {selectedProduct && (
          <SellerAddToCartModal
            isOpen={isAddToCartModalOpen}
            onClose={() => setIsAddToCartModalOpen(false)}
            product={selectedProduct}
          />
        )}

        {/* Delete Confirmation Modal */}
        {selectedProduct && (
          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedProduct(null);
            }}
            product={selectedProduct}
            onConfirmDelete={handleDeleteProduct}
            isDeleting={isDeleting}
          />
        )}
      </div>
    </SellerLayout>

  );
}

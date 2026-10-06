import { useState, useEffect, useRef } from "react";
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { Plus, Search, Filter, Edit, Trash2, Eye, X, AlertCircle, Loader2, Upload, Image, PlusIcon } from "lucide-react";
import AddProductModal from "~/components/admin/AddProductModal";
import ViewProductModal from "~/components/admin/ViewProductModal";
import AdminAddToCartModal from "~/components/admin/AdminAddToCartModal";
import { readToken } from "~/utils/session.server";
import { requireAdmin } from "~/utils/auth.server";
import { compressImages } from "~/utils/imageCompression";

// Mettre à jour l'interface pour correspondre à l'API
export interface Product {
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

// Fonction pour extraire le token du cookie
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

export async function loader({ request }: LoaderFunctionArgs) {
  const token = await readToken(request);
    await requireAdmin(request);


  if (!token) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return json({ token });
}

export const meta: MetaFunction = () => {
  return [
    { title: "Produits - Adawi Admin" },
    { name: "description", content: "Gestion des produits" },
  ];
};



// Modal COMPLET pour modifier un produit - REMPLACER L'ANCIEN
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

  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      // Compresser les images
      const compressedFiles = await compressImages(files);
      setNewImages(compressedFiles);
      setImagePreviewUrls(compressedFiles.map(f => URL.createObjectURL(f)));
    } catch (error) {
      console.error('Erreur lors de la compression des images principales:', error);
      // En cas d'erreur, utiliser les fichiers originaux
      setNewImages(files);
      setImagePreviewUrls(files.map(f => URL.createObjectURL(f)));
    }
  };

  const handleHoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      // Compresser les images de survol
      const compressedFiles = await compressImages(files);
      setNewHoverImages(compressedFiles);
      setHoverImagePreviewUrls(compressedFiles.map(f => URL.createObjectURL(f)));
    } catch (error) {
      console.error('Erreur lors de la compression des images de survol:', error);
      // En cas d'erreur, utiliser les fichiers originaux
      setNewHoverImages(files);
      setHoverImagePreviewUrls(files.map(f => URL.createObjectURL(f)));
    }
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

// Modal pour confirmer la suppression - AMÉLIORER
function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType,
  isDeleting = false
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType: string;
  isDeleting?: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Confirmer la suppression</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600" disabled={isDeleting}>
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Êtes-vous sûr de vouloir supprimer le {itemType}{" "}
            <span className="font-semibold text-gray-900">\"{itemName}\"</span> ?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-medium text-red-800">Cette action est irréversible</p>
            <p className="text-sm text-red-700 mt-1">
              Le produit sera définitivement supprimé et ne pourra pas être récupéré.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
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
  );
}

export default function AdminProducts() {
  const { token } = useLoaderData<typeof loader>();

  // États pour les modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddToCartModalOpen, setIsAddToCartModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // État pour la recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  // État pour les filtres
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // États pour les produits
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);

  // Catégories disponibles
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);

  // Fetcher pour l'ajout de produit
  const createFetcher = useFetcher<{ success: boolean; error?: string; product?: Product }>();

  // États pour la suppression
  const [isDeleting, setIsDeleting] = useState(false);

  // Charger les produits depuis l'API
  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(" Chargement de tous les produits...");

      const response = await fetch(`/api/products/admin`);
      const data = await response.json();

      console.log(" Données reçues:", data);

      if (data.success) {
        setProducts(data.products);
        setTotalProducts(data.products.length);
        console.log(` Produits chargés: ${data.products.length}`);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error(" Erreur loadProducts:", err);
      setError("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
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

  // Charger les données au montage du composant
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // Filtrage des produits
  const filteredProducts = products.filter(product => {
    // Filtre de recherche
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category?.name || "").toLowerCase().includes(searchTerm.toLowerCase());

    // Filtre de catégorie
    const matchesCategory = categoryFilter === "all" || product.category?.id === categoryFilter;

    // Filtre de statut
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "Actif" && product.is_active) ||
      (statusFilter === "Rupture" && !product.is_active);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Fonction pour gérer l'ajout de produit
  const handleProductCreated = () => {
    console.log(" Produit créé, rechargement de la liste...");
    loadProducts();
    setIsAddModalOpen(false);
  };

  // Fonctions pour gérer les produits
  const handleAddProduct = async (formData: FormData) => {
    createFetcher.submit(formData, {
      method: "POST",
      action: "/api/products/create",
      encType: "multipart/form-data"
    });
  };

  // Gérer la réponse de création
  useEffect(() => {
    if (createFetcher.data?.success) {
      // Recharger les produits après création réussie
      loadProducts();
      // Fermer le modal
      setIsAddModalOpen(false);
      // Afficher un message de succès (optionnel)
      alert("Produit créé avec succès !");
    }
  }, [createFetcher.data]);

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

  const handleDeleteProduct = async () => {
  if (!selectedProduct) return;

  setIsDeleting(true);
  try {
    console.log(" Suppression du produit:", selectedProduct.id);
    console.log(" Token utilisé:", token?.substring(0, 20) + "...");

    const response = await fetch(`http://localhost:8000/products/${selectedProduct.id}`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    console.log(" Réponse suppression:", response.status, response.statusText);

    if (!response.ok) {
      // Lire la réponse d'erreur
      let errorMessage = "Erreur lors de la suppression";
      try {
        const errorData = await response.json();
        console.error(" Erreur suppression:", errorData);
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (e) {
        console.error(" Impossible de lire l'erreur");
      }
      throw new Error(errorMessage);
    }

    // Recharger la liste des produits
    await loadProducts();
    setIsDeleteModalOpen(false);
    setSelectedProduct(null);
    
    // Afficher un message de succès
    alert("Produit supprimé avec succès !");
  } catch (err: any) {
    console.error(" Erreur handleDeleteProduct:", err);
    alert(`Erreur lors de la suppression: ${err.message}`);
  } finally {
    setIsDeleting(false);
  }
};

  // Fonctions pour ouvrir les modals
  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const openViewModal = (product: Product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  // Fonction pour effacer la recherche
  const clearSearch = () => {
    setSearchTerm("");
  };



  // Calculer les statistiques
  const activeProducts = products.filter(p => p.is_active).length;
  const inactiveProducts = products.filter(p => !p.is_active).length;
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-adawi-brown">Gestion des Produits</h1>
          <p className="text-gray-600">Gérez votre catalogue de produits</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter un produit
        </button>
      </div>

      {/* Debug info - À supprimer en production
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            <strong>Debug:</strong> Token présent: {token ? " Oui" : " Non"}{" "}
            {token && ` (${token.length} caractères)`}
          </p>
        </div>
      )} */}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              <p className="text-sm text-gray-600">Total Produits</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeProducts}</p>
              <p className="text-sm text-gray-600">Produits Actifs</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg mr-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{inactiveProducts}</p>
              <p className="text-sm text-gray-600">Produits Inactifs</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg mr-3">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalStock}</p>
              <p className="text-sm text-gray-600">Stock Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className={`relative rounded-lg transition-all duration-200 ${searchFocused ? 'ring-2 ring-adawi-gold shadow-sm' : 'hover:shadow-sm'}`}>
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${searchFocused ? 'text-adawi-gold' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Rechercher un produit par nom ou catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex text-black items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filtres
            <span className={`ml-2 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}>
              
            </span>
          </button>
        </div>

        {/* Filtres étendus */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
              >
                <option value="all">Tous les statuts</option>
                <option value="Actif">Actif</option>
                <option value="Rupture">Inactif</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-adawi-gold animate-spin" />
            <span className="ml-3 text-gray-600">Chargement des produits...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={loadProducts}
              className="mt-4 px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Produit</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Catégorie</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Prix</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Stock</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <img
                            src={product.images[0] || "/placeholder"}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover mr-3"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500">ID: {product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-900">{product.category?.name || "Non catégorisé"}</td>
                      <td className="py-4 px-4 text-gray-900">{product.price.toLocaleString()} {product.currency}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${product.stock > 10
                          ? 'bg-green-100 text-green-800'
                          : product.stock > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          {product.stock} unités
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${product.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}>
                          {product.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
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
                            onClick={() => openDeleteModal(product)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <AlertCircle className="w-12 h-12 text-gray-300 mb-2" />
                        <p>Aucun produit trouvé</p>
                        {searchTerm && (
                          <button
                            onClick={clearSearch}
                            className="mt-2 text-adawi-gold hover:underline"
                          >
                            Effacer la recherche
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>



      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductCreated={handleProductCreated}
        categories={categories}
        token={token}
      />

      {/* Edit Product Modal */}
      {selectedProduct && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setSelectedProduct(null); }}
          product={selectedProduct}
          onEditProduct={handleEditProduct}
          categories={categories}
          token={token}
        />
      )}

      {/* Delete Confirmation Modal */}
      {selectedProduct && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => { setIsDeleteModalOpen(false); setSelectedProduct(null); }}
          onConfirm={handleDeleteProduct}
          itemName={selectedProduct.name}
          itemType="produit"
          isDeleting={isDeleting}
        />
      )}

      {selectedProduct && (
        <ViewProductModal
          isOpen={isViewModalOpen}
          onClose={() => { setIsViewModalOpen(false); setSelectedProduct(null); }}
          product={selectedProduct}
        />
      )}

      {/* AdminAddToCartModal */}
      <AdminAddToCartModal
        isOpen={isAddToCartModalOpen}
        onClose={() => { setIsAddToCartModalOpen(false); setSelectedProduct(null); }}
        product={selectedProduct}
      />
    </div>
  );
}
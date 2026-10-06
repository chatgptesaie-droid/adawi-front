import { X, Package, Tag, Palette, Ruler, FileText, Save, Upload, Trash2 } from "lucide-react";
import { useState } from "react";
import CategorySelector from "./CategorySelector";
import CategoryDetails from "./CategoryDetails";

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
}

interface EditProductModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FormData) => void;
    isSubmitting: boolean;
    error?: string;
    categories: Array<{ id: string; name: string; }>;
}

export default function EditProductModal({ 
    product, 
    isOpen, 
    onClose,
    onSubmit,
    isSubmitting,
    error,
    categories 
}: EditProductModalProps) {
    if (!isOpen || !product) return null;

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
        tags: product.tags?.join(",") || ""
    });

    const [newImages, setNewImages] = useState<File[]>([]);
    const [newHoverImages, setNewHoverImages] = useState<File[]>([]);
    const [selectedCategoryDetails, setSelectedCategoryDetails] = useState<any>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const submitFormData = new FormData();

        // Ajouter les champs de base
        Object.entries(formData).forEach(([key, value]) => {
            if (value && value.trim() !== '') {
                submitFormData.append(key, value.trim());
            }
        });

        // Ajouter les nouvelles images principales
        newImages.forEach(image => {
            submitFormData.append("images", image);
        });

        // Ajouter les nouvelles images de survol
        newHoverImages.forEach(image => {
            submitFormData.append("hover_images", image);
        });

        onSubmit(submitFormData);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'hover') => {
        const files = Array.from(e.target.files || []);
        if (type === 'main') {
            setNewImages(files);
        } else {
            setNewHoverImages(files);
        }
    };

    const removeImage = (index: number, type: 'main' | 'hover') => {
        if (type === 'main') {
            setNewImages(prev => prev.filter((_, i) => i !== index));
        } else {
            setNewHoverImages(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleCategoryLoad = (category: any) => {
        setSelectedCategoryDetails(category);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">Modifier le produit</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Messages d'erreur/succès */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    {!error && isSubmitting && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-blue-800">Mise à jour en cours...</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Colonne gauche - Informations de base */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">Informations de base</h3>

                            {/* Nom du produit */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Package className="w-4 h-4 inline mr-2" />
                                    Nom du produit *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FileText className="w-4 h-4 inline mr-2" />
                                    Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                                    required
                                />
                            </div>

                            {/* Prix */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Prix de vente (F CFA) *
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Prix de revient (F CFA)
                                    </label>
                                    <input
                                        type="number"
                                        name="cost_price"
                                        value={formData.cost_price}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>

                            {/* Catégorie */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Tag className="w-4 h-4 inline mr-2" />
                                    Catégorie *
                                </label>
                                <select
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                                    required
                                >
                                    <option value="">Sélectionner une catégorie</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>

                                {/* Affichage des détails de la catégorie sélectionnée */}
                                {formData.category_id && (
                                    <div className="mt-3">
                                        <CategoryDetails 
                                            categoryId={formData.category_id}
                                            className="bg-gray-50"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Stock */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Stock *
                                    </label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Seuil d'alerte stock
                                    </label>
                                    <input
                                        type="number"
                                        name="low_stock_threshold"
                                        value={formData.low_stock_threshold}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Colonne droite - Variantes et Images */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">Variantes et Images</h3>

                            {/* Tailles */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Ruler className="w-4 h-4 inline mr-2" />
                                    Tailles (séparées par des virgules)
                                </label>
                                <input
                                    type="text"
                                    name="sizes"
                                    value={formData.sizes}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                                    placeholder="S,M,L,XL"
                                />
                            </div>

                            {/* Couleurs */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Palette className="w-4 h-4 inline mr-2" />
                                    Couleurs (séparées par des virgules)
                                </label>
                                <input
                                    type="text"
                                    name="colors"
                                    value={formData.colors}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                                    placeholder="Rouge,Bleu,Noir"
                                />
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Tag className="w-4 h-4 inline mr-2" />
                                    Tags (séparés par des virgules)
                                </label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                                    placeholder="été,casual,tendance"
                                />
                            </div>

                            {/* Images actuelles */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Images actuelles
                                </label>
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Remplacer les images principales
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(e, 'main')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                                />
                                {newImages.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {newImages.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                                                <span className="text-sm text-gray-700">{file.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index, 'main')}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Images de survol actuelles */}
                            {product.hover_images && product.hover_images.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Images de survol actuelles
                                    </label>
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Remplacer les images de survol
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(e, 'hover')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                                />
                                {newHoverImages.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {newHoverImages.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                                                <span className="text-sm text-gray-700">{file.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index, 'hover')}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
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
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            <span>Mettre à jour</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
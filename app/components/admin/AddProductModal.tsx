// ... imports identiques
import { useState, useRef } from "react";
import { X, Upload, Plus, Minus, Package, Tag, DollarSign, Hash, FileText, Palette, Ruler, Image } from "lucide-react";
import SuccessNotification from "~/components/SuccessNotification";
import { compressImages } from "~/utils/imageCompression";

interface Category {
  id: string;
  name: string;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: () => void;
  categories: Category[];
  token: string;
}

export default function AddProductModal({
  isOpen,
  onClose,
  onProductCreated,
  categories,
  token
}: AddProductModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // États du formulaire
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    cost_price: "",
    currency: "F CFA",
    category_id: "",
    stock: "",
    low_stock_threshold: "",
    is_active: true,
  });

  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  //  Images principales
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  //  Hover images
  const [hoverImages, setHoverImages] = useState<File[]>([]);
  const [hoverPreviews, setHoverPreviews] = useState<string[]>([]);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hoverInputRef = useRef<HTMLInputElement>(null);
  const sizeInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // --- Images principales ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      // Compresser les images avant de les stocker
      const compressedFiles = await compressImages(files);

      // Limiter à 5 images maximum
      const newImages = [...images, ...compressedFiles].slice(0, 5);
      setImages(newImages);

      // Créer les aperçus des images compressées
      const newPreviews: string[] = [];
      for (const file of compressedFiles.slice(0, 5 - imagePreviews.length)) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            newPreviews.push(ev.target.result as string);
            if (newPreviews.length === compressedFiles.slice(0, 5 - imagePreviews.length).length) {
              setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 5));
            }
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Erreur lors de la compression des images:', error);
      // En cas d'erreur, utiliser les fichiers originaux
      const newImages = [...images, ...files].slice(0, 5);
      setImages(newImages);

      files.forEach(file => {
        if (imagePreviews.length < 5) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            if (ev.target?.result) {
              setImagePreviews(prev => [...prev, ev.target!.result as string].slice(0, 5));
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // --- Hover images ---
  const handleHoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      // Compresser les images avant de les stocker
      const compressedFiles = await compressImages(files);

      // Limiter à 5 images maximum
      const newImages = [...hoverImages, ...compressedFiles].slice(0, 5);
      setHoverImages(newImages);

      // Créer les aperçus des images compressées
      const newPreviews: string[] = [];
      for (const file of compressedFiles.slice(0, 5 - hoverPreviews.length)) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            newPreviews.push(ev.target.result as string);
            if (newPreviews.length === compressedFiles.slice(0, 5 - hoverPreviews.length).length) {
              setHoverPreviews(prev => [...prev, ...newPreviews].slice(0, 5));
            }
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Erreur lors de la compression des images hover:', error);
      // En cas d'erreur, utiliser les fichiers originaux
      const newImages = [...hoverImages, ...files].slice(0, 5);
      setHoverImages(newImages);

      files.forEach(file => {
        if (hoverPreviews.length < 5) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            if (ev.target?.result) {
              setHoverPreviews(prev => [...prev, ev.target!.result as string].slice(0, 5));
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const removeHoverImage = (index: number) => {
    setHoverImages(prev => prev.filter((_, i) => i !== index));
    setHoverPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addSize = () => {
    const input = sizeInputRef.current;
    if (input && input.value.trim()) {
      const newSizes = input.value.split(',').map(s => s.trim()).filter(s => s);
      setSizes(prev => [...prev, ...newSizes]);
      input.value = "";
    }
  };

  const removeSize = (index: number) => {
    setSizes(prev => prev.filter((_, i) => i !== index));
  };

  const addColor = () => {
    const input = colorInputRef.current;
    if (input && input.value.trim()) {
      const newColors = input.value.split(',').map(c => c.trim()).filter(c => c);
      setColors(prev => [...prev, ...newColors]);
      input.value = "";
    }
  };

  const removeColor = (index: number) => {
    setColors(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    const input = tagInputRef.current;
    if (input && input.value.trim()) {
      const newTags = input.value.split(',').map(t => t.trim()).filter(t => t);
      setTags(prev => [...prev, ...newTags]);
      input.value = "";
    }
  };

  const removeTag = (index: number) => {
    setTags(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name.trim());
      submitData.append("description", formData.description.trim());
      submitData.append("price", formData.price);
      if (formData.cost_price) submitData.append("cost_price", formData.cost_price);
      submitData.append("currency", formData.currency);
      submitData.append("category_id", formData.category_id);
      submitData.append("stock", formData.stock || "0");
      if (formData.low_stock_threshold) submitData.append("low_stock_threshold", formData.low_stock_threshold);
      submitData.append("is_active", formData.is_active.toString());

      submitData.append("sizes", JSON.stringify(sizes));
      submitData.append("colors", JSON.stringify(colors));
      submitData.append("tags", JSON.stringify(tags));

      // Images principales
      images.forEach((image, index) => {
        submitData.append(`images`, image);
      });

      //  Hover images
      hoverImages.forEach((image, index) => {
        submitData.append(`hover_images`, image);
      });

      const response = await fetch("/api/products/create", {
        method: "POST",  
        body: submitData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setSuccess(true);
        setShowNotification(true);
        resetForm();
        setTimeout(() => {
          onProductCreated();
          setSuccess(false);
          onClose();
        }, 1500);
      } else {
        setError(result.error || "Erreur lors de la création du produit");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      cost_price: "",
      currency: "F CFA",
      category_id: "",
      stock: "",
      low_stock_threshold: "",
      is_active: true,
    });
    setSizes([]);
    setColors([]);
    setTags([]);
    setImages([]);
    setImagePreviews([]);
    setHoverImages([]);
    setHoverPreviews([]);
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* ... en-tête + messages */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Ajouter un produit</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
              type="button"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Messages de succès/erreur */}
          {success && (
            <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-green-800 font-medium">Produit créé avec succès !</p>
                  <p className="text-green-700 text-sm mt-1">Le produit a été ajouté au catalogue et sera visible après validation.</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-red-800 font-medium">Erreur lors de la création</p>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* ... inputs déjà présents */}
            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Package className="w-4 h-4 inline mr-1" />
                  Nom du produit *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent disabled:opacity-50"
                  placeholder="Ex: T-shirt en coton bio"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Catégorie *
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent disabled:opacity-50"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent disabled:opacity-50"
                placeholder="Description détaillée du produit..."
              />
            </div>

            {/* Prix et stock */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Prix de vente *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent disabled:opacity-50"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix d'achat
                </label>
                <input
                  type="number"
                  name="cost_price"
                  value={formData.cost_price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent disabled:opacity-50"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="w-4 h-4 inline mr-1" />
                  Stock
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent disabled:opacity-50"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seuil d'alerte
                </label>
                <input
                  type="number"
                  name="low_stock_threshold"
                  value={formData.low_stock_threshold}
                  onChange={handleInputChange}
                  min="0"
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent disabled:opacity-50"
                  placeholder="5"
                />
              </div>
            </div>

            {/* Images principales */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Upload className="w-4 h-4 inline mr-1" />
                Images principales (max 5)
              </label>
              <input ref={fileInputRef} type="file" onChange={handleImageUpload} multiple accept="image/*" className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full px-4 py-3 border-2 border-dashed rounded-lg">
                Ajouter des images
              </button>
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
                  {imagePreviews.map((preview, i) => (
                    <div key={i} className="relative">
                      <img src={preview} alt="" className="w-full h-24 object-cover rounded-lg" />
                      <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/*  Hover images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Image className="w-4 h-4 inline mr-1" />
                Images au survol (max 5)
              </label>
              <input ref={hoverInputRef} type="file" onChange={handleHoverUpload} multiple accept="image/*" className="hidden" />
              <button type="button" onClick={() => hoverInputRef.current?.click()} className="w-full px-4 py-3 border-2 border-dashed rounded-lg">
                Ajouter des hover images
              </button>
              {hoverPreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
                  {hoverPreviews.map((preview, i) => (
                    <div key={i} className="relative">
                      <img src={preview} alt="" className="w-full h-24 object-cover rounded-lg" />
                      <button type="button" onClick={() => removeHoverImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ... reste du formulaire (tailles, couleurs, tags, statut, actions) */}
            {/* Tailles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Ruler className="w-4 h-4 inline mr-1" />
                Tailles disponibles
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  ref={sizeInputRef}
                  type="text"
                  placeholder="Ex: S, M, L, XL"
                  disabled={isSubmitting}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent disabled:opacity-50"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                />
                <button
                  type="button"
                  onClick={addSize}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {sizes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {size}
                      <button
                        type="button"
                        onClick={() => removeSize(index)}
                        disabled={isSubmitting}
                        className="ml-2 text-gray-500 hover:text-red-500 disabled:opacity-50"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Couleurs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Palette className="w-4 h-4 inline mr-1" />
                Couleurs disponibles
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  ref={colorInputRef}
                  type="text"
                  placeholder="Ex: Rouge, Bleu, Vert"
                  disabled={isSubmitting}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent disabled:opacity-50"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                />
                <button
                  type="button"
                  onClick={addColor}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {colors.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {colors.map((color, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {color}
                      <button
                        type="button"
                        onClick={() => removeColor(index)}
                        disabled={isSubmitting}
                        className="ml-2 text-gray-500 hover:text-red-500 disabled:opacity-50"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Tags (mots-clés)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  ref={tagInputRef}
                  type="text"
                  placeholder="Ex: bio, coton, été"
                  disabled={isSubmitting}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent disabled:opacity-50"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        disabled={isSubmitting}
                        className="ml-2 text-gray-500 hover:text-red-500 disabled:opacity-50"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Statut */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-4 h-4 text-adawi-gold border-gray-300 rounded focus:ring-adawi-gold disabled:opacity-50"
              />
              <label className="ml-2 text-sm text-gray-700">
                Produit actif (visible sur le site)
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Création...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Créer le produit</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success notification */}
      {showNotification && (
        <SuccessNotification
          message="Produit créé avec succès !"
          description="Le produit a été ajouté au catalogue."
          onClose={() => setShowNotification(false)}
        />
      )}
    </>
  );
}

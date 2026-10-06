import { X, Folder, FileText, Tag } from "lucide-react";
import { useState } from "react";

interface Category {
    id: string;
    name: string;
    description: string;
    parent_id: string | null;
    children: string[];
    created_at: string;
    updated_at: string;
}

interface AddCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FormData) => void;
    isSubmitting: boolean;
    error?: string;
    categories: Category[];
}

export default function AddCategoryModal({ 
    isOpen, 
    onClose,
    onSubmit,
    isSubmitting,
    error,
    categories 
}: AddCategoryModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        parent_id: ""
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const submitFormData = new FormData();
        submitFormData.append("name", formData.name.trim());
        submitFormData.append("description", formData.description.trim());
        if (formData.parent_id && formData.parent_id.trim() !== '') {
            submitFormData.append("parent_id", formData.parent_id.trim());
        }

        onSubmit(submitFormData);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            parent_id: ""
        });
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    // Organiser les catégories pour l'affichage hiérarchique
    const organizeCategories = (categories: Category[]) => {
        const categoryMap = new Map<string, Category & { level: number }>();
        const rootCategories: (Category & { level: number })[] = [];

        // Première passe : créer la map
        categories.forEach(category => {
            categoryMap.set(category.id, { ...category, level: 0 });
        });

        // Deuxième passe : calculer les niveaux et organiser
        const calculateLevel = (category: Category & { level: number }): number => {
            if (category.parent_id) {
                const parent = categoryMap.get(category.parent_id);
                if (parent) {
                    return calculateLevel(parent) + 1;
                }
            }
            return 0;
        };

        categories.forEach(category => {
            const categoryWithLevel = categoryMap.get(category.id)!;
            categoryWithLevel.level = calculateLevel(categoryWithLevel);
            
            if (!category.parent_id) {
                rootCategories.push(categoryWithLevel);
            }
        });

        // Trier par niveau puis par nom
        const sortedCategories = Array.from(categoryMap.values()).sort((a, b) => {
            if (a.level !== b.level) return a.level - b.level;
            return a.name.localeCompare(b.name);
        });

        return sortedCategories;
    };

    const sortedCategories = organizeCategories(categories);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Folder className="w-6 h-6 text-adawi-gold mr-2" />
                            <h2 className="text-xl font-bold text-gray-900">Nouvelle catégorie</h2>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Messages d'erreur */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Nom de la catégorie */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Tag className="w-4 h-4 inline mr-2" />
                            Nom de la catégorie *
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                            placeholder="Ex: Vêtements"
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
                            required
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                            placeholder="Description de la catégorie..."
                        />
                    </div>

                    {/* Catégorie parent */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Folder className="w-4 h-4 inline mr-2" />
                            Catégorie parent (optionnel)
                        </label>
                        <select
                            name="parent_id"
                            value={formData.parent_id}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                        >
                            <option value="">Aucune (catégorie racine)</option>
                            {sortedCategories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {'  '.repeat(category.level)}
                                    {category.level > 0 ? '└─ ' : ''}
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Sélectionnez une catégorie parent pour créer une sous-catégorie
                        </p>
                    </div>

                    {/* Boutons */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Création...</span>
                                </>
                            ) : (
                                <>
                                    <Folder className="w-4 h-4" />
                                    <span>Créer</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

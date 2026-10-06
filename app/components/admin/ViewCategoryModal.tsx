import { X, Folder, FileText, Calendar, Users, Tag } from "lucide-react";
import { useCategory } from "~/hooks/useCategory";
import CategoryDetails from "./CategoryDetails";
import { useState, useEffect } from "react";

interface Category {
    id: string;
    name: string;
    description: string;
    parent_id: string | null;
    children: string[];
    created_at: string;
    updated_at: string;
}

interface ViewCategoryModalProps {
    categoryId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ViewCategoryModal({ 
    categoryId, 
    isOpen, 
    onClose 
}: ViewCategoryModalProps) {
    const [category, setCategory] = useState<Category | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Charger les détails de la catégorie
    const loadCategory = async (id: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/categories/${id}`);
            const data = await response.json();

            if (data.success) {
                setCategory(data.category);
            } else {
                setError(data.error || "Erreur lors du chargement");
            }
        } catch (err) {
            setError("Erreur de connexion");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && categoryId) {
            loadCategory(categoryId);
        } else {
            setCategory(null);
            setError(null);
        }
    }, [isOpen, categoryId]);

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
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Folder className="w-6 h-6 text-adawi-gold mr-2" />
                            <h2 className="text-xl font-bold text-gray-900">Détails de la catégorie</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
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
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800">{error}</p>
                            <button
                                onClick={() => categoryId && loadCategory(categoryId)}
                                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                            >
                                Réessayer
                            </button>
                        </div>
                    ) : category ? (
                        <div className="space-y-6">
                            {/* Informations principales */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Tag className="w-5 h-5 mr-2 text-adawi-gold" />
                                    Informations générales
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700">ID:</span>
                                        <p className="text-gray-900">{category.id}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Nom:</span>
                                        <p className="text-gray-900 font-medium">{category.name}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <span className="font-medium text-gray-700">Description:</span>
                                        <p className="text-gray-900 mt-1">{category.description}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Parent ID:</span>
                                        <p className="text-gray-900">{category.parent_id || "Aucun (catégorie racine)"}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Sous-catégories:</span>
                                        <p className="text-gray-900">{category.children?.length || 0} sous-catégorie(s)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Sous-catégories */}
                            {category.children && category.children.length > 0 && (
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <Users className="w-5 h-5 mr-2 text-blue-600" />
                                        Sous-catégories ({category.children.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {category.children.map((childId, index) => (
                                            <div key={childId} className="bg-white rounded p-3 border border-blue-200">
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-medium">ID:</span> {childId}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Métadonnées */}
                            <div className="bg-green-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Calendar className="w-5 h-5 mr-2 text-green-600" />
                                    Métadonnées
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700">Créée le:</span>
                                        <p className="text-gray-900">{formatDate(category.created_at)}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Modifiée le:</span>
                                        <p className="text-gray-900">{formatDate(category.updated_at)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Catégorie non trouvée</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}

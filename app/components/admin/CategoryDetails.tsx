import { Calendar, Folder, FileText, Users } from "lucide-react";
import { useCategory } from "~/hooks/useCategory";

interface CategoryDetailsProps {
    categoryId: string | null;
    className?: string;
}

export default function CategoryDetails({ categoryId, className = "" }: CategoryDetailsProps) {
    const { category, isLoading, error, refetch } = useCategory(categoryId);

    if (!categoryId) {
        return (
            <div className={`text-center py-4 text-gray-500 ${className}`}>
                Aucune catégorie sélectionnée
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className={`flex items-center justify-center py-4 ${className}`}>
                <div className="w-6 h-6 border-2 border-adawi-gold border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-gray-600">Chargement des détails...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
                <p className="text-red-800 text-sm">{error}</p>
                <button
                    onClick={refetch}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    if (!category) {
        return (
            <div className={`text-center py-4 text-gray-500 ${className}`}>
                Catégorie non trouvée
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={`bg-white border border-gray-200 rounded-lg p-4 space-y-4 ${className}`}>
            {/* En-tête */}
            <div className="flex items-start justify-between">
                <div className="flex items-center">
                    <Folder className="w-6 h-6 text-adawi-gold mr-3" />
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-500">ID: {category.id}</p>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Description</p>
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                </div>
            </div>

            {/* Catégorie parent */}
            {category.parent_id && (
                <div className="flex items-center space-x-3">
                    <Folder className="w-5 h-5 text-gray-400" />
                    <div>
                        <p className="text-sm font-medium text-gray-700">Catégorie parent</p>
                        <p className="text-sm text-gray-600">{category.parent_id}</p>
                    </div>
                </div>
            )}

            {/* Sous-catégories */}
            {category.children.length > 0 && (
                <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-gray-700">Sous-catégories</p>
                        <p className="text-sm text-gray-600">{category.children.length} sous-catégorie(s)</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                            {category.children.map((childId, index) => (
                                <span
                                    key={childId}
                                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                                >
                                    {childId}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                        <p className="text-sm font-medium text-gray-700">Créée le</p>
                        <p className="text-sm text-gray-600">{formatDate(category.created_at)}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                        <p className="text-sm font-medium text-gray-700">Modifiée le</p>
                        <p className="text-sm text-gray-600">{formatDate(category.updated_at)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { X, AlertTriangle, Trash2 } from "lucide-react";

interface Category {
    id: string;
    name: string;
    description: string;
    parent_id: string | null;
    children: string[];
    created_at: string;
    updated_at: string;
}

interface DeleteCategoryModalProps {
    category: Category | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
    error?: string;
}

export default function DeleteCategoryModal({ 
    category,
    isOpen, 
    onClose,
    onConfirm,
    isDeleting,
    error
}: DeleteCategoryModalProps) {
    if (!isOpen || !category) return null;

    const hasChildren = category.children.length > 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
                            <h2 className="text-xl font-bold text-gray-900">Confirmer la suppression</h2>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Messages d'erreur */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Informations de la catégorie */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-2">{category.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                        <div className="text-xs text-gray-500 space-y-1">
                            <p><span className="font-medium">ID:</span> {category.id}</p>
                            <p><span className="font-medium">Créée le:</span> {new Date(category.created_at).toLocaleDateString('fr-FR')}</p>
                            {hasChildren && (
                                <p><span className="font-medium">Sous-catégories:</span> {category.children.length}</p>
                            )}
                        </div>
                    </div>

                    {/* Message de confirmation */}
                    <div className="space-y-3">
                        <p className="text-gray-700">
                            Êtes-vous sûr de vouloir supprimer la catégorie <strong>"{category.name}"</strong> ?
                        </p>
                        
                        {hasChildren && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <div className="flex items-start">
                                    <AlertTriangle className="w-5 h-5 text-amber-500 mr-2 mt-0.5" />
                                    <div>
                                        <p className="text-amber-800 text-sm font-medium">Attention !</p>
                                        <p className="text-amber-700 text-sm">
                                            Cette catégorie contient {category.children.length} sous-catégorie(s). 
                                            La suppression pourrait échouer si des produits sont associés à cette catégorie ou à ses sous-catégories.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <p className="text-sm text-gray-500">
                            Cette action est <strong>irréversible</strong>.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200">
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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

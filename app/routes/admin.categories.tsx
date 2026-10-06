import { useState, useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import { Plus, Folder, Edit, Trash2, Eye } from "lucide-react";
import AddCategoryModal from "~/components/admin/AddCategoryModal";
import EditCategoryModal from "~/components/admin/EditCategoryModal";
import ViewCategoryModal from "~/components/admin/ViewCategoryModal";
import DeleteCategoryModal from "~/components/admin/DeleteCategoryModal";
import CategoryTester from "~/components/admin/CategoryTester";
import { requireAdmin } from "~/utils/auth.server";

interface Category {
    id: string;
    name: string;
    description: string;
    parent_id: string | null;
    children: string[];
    created_at: string;
    updated_at: string;
}

// Interface séparée pour les catégories avec niveau et enfants organisés
interface CategoryWithLevel {
    id: string;
    name: string;
    description: string;
    parent_id: string | null;
    children: CategoryWithLevel[]; // Différent de Category.children qui est string[]
    created_at: string;
    updated_at: string;
    level: number;
}

export default function AdminCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<Category | null>(null);
    const [selectedCategoryForDelete, setSelectedCategoryForDelete] = useState<Category | null>(null);

    // Fetchers
    const createFetcher = useFetcher<{ success: boolean; error?: string; category?: Category }>();
    const editFetcher = useFetcher<{ success: boolean; error?: string; category?: Category }>();
    const deleteFetcher = useFetcher<{ success: boolean; error?: string; categoryId?: string }>();

    // Charger les catégories
    const loadCategories = async () => {
        setIsLoading(true);
        setError(null);
        

        try {
            
            const response = await fetch('/api/categories/');

            const data = await response.json();

            if (data.success) {
                setCategories(data.categories);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError("Erreur de connexion");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    // Gérer la création de catégorie
    const handleCreateCategory = (formData: FormData) => {
        createFetcher.submit(formData, {
            method: "POST",
            action: "/api/categories/create"
        });
    };

    // Gérer la modification de catégorie
    const handleEditCategory = (category: Category) => {
        setSelectedCategoryForEdit(category);
        setIsEditModalOpen(true);
    };

    const handleUpdateCategory = (formData: FormData) => {
        if (!selectedCategoryForEdit) return;

        editFetcher.submit(formData, {
            method: "POST",
            action: `/api/categories/${selectedCategoryForEdit.id}/edit`
        });
    };

    // Gérer la suppression de catégorie
    const handleDeleteCategory = (category: Category) => {
        setSelectedCategoryForDelete(category);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteCategory = () => {
        if (!selectedCategoryForDelete) return;

        deleteFetcher.submit({}, {
            method: "DELETE",
            action: `/api/categories/${selectedCategoryForDelete.id}/delete`
        });
    };

    // Gérer la visualisation d'une catégorie
    const handleViewCategory = (categoryId: string) => {
        setSelectedCategoryId(categoryId);
        setIsViewModalOpen(true);
    };

    // Gérer les réponses des fetchers
    useEffect(() => {
        if (createFetcher.data?.success) {
            loadCategories();
            setIsAddModalOpen(false);
        }
    }, [createFetcher.data]);

    useEffect(() => {
        if (editFetcher.data?.success) {
            loadCategories();
            setIsEditModalOpen(false);
            setSelectedCategoryForEdit(null);
        }
    }, [editFetcher.data]);

    useEffect(() => {
        if (deleteFetcher.data?.success) {
            loadCategories();
            setIsDeleteModalOpen(false);
            setSelectedCategoryForDelete(null);
        }
    }, [deleteFetcher.data]);

    // Organiser les catégories en arbre
    const organizeCategories = (categories: Category[]): CategoryWithLevel[] => {
        const categoryMap = new Map<string, CategoryWithLevel>();
        const rootCategories: CategoryWithLevel[] = [];

        // Créer la map avec niveau et enfants vides
        categories.forEach(category => {
            categoryMap.set(category.id, { 
                id: category.id,
                name: category.name,
                description: category.description,
                parent_id: category.parent_id,
                created_at: category.created_at,
                updated_at: category.updated_at,
                level: 0, 
                children: [] 
            });
        });

        // Calculer les niveaux et organiser
        const calculateLevel = (categoryId: string, visited = new Set<string>()): number => {
            if (visited.has(categoryId)) return 0;
            visited.add(categoryId);

            const category = categoryMap.get(categoryId);
            if (!category || !category.parent_id) return 0;

            return calculateLevel(category.parent_id, visited) + 1;
        };

        categories.forEach(category => {
            const categoryWithLevel = categoryMap.get(category.id)!;
            categoryWithLevel.level = calculateLevel(category.id);

            if (category.parent_id) {
                const parent = categoryMap.get(category.parent_id);
                if (parent) {
                    parent.children.push(categoryWithLevel);
                }
            } else {
                rootCategories.push(categoryWithLevel);
            }
        });

        return rootCategories.sort((a, b) => a.name.localeCompare(b.name));
    };

    const renderCategory = (category: CategoryWithLevel): JSX.Element => {
        return (
            <div key={category.id} className="border border-gray-200 rounded-lg mb-2">
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <div style={{ marginLeft: `${category.level * 20}px` }}>
                            <Folder className="w-5 h-5 text-adawi-gold mr-3" />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">{category.name}</h3>
                            <p className="text-sm text-gray-500">{category.description}</p>
                            <p className="text-xs text-gray-400">
                                Créée le {new Date(category.created_at).toLocaleDateString('fr-FR')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={() => handleViewCategory(category.id)}
                            className="p-2 text-gray-400 hover:text-adawi-gold transition-colors"
                            title="Voir les détails"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleEditCategory({
                                id: category.id,
                                name: category.name,
                                description: category.description,
                                parent_id: category.parent_id,
                                children: [], // Convertir en string[] vide pour Category
                                created_at: category.created_at,
                                updated_at: category.updated_at
                            })}
                            className="p-2 text-gray-400 hover:text-adawi-gold transition-colors"
                            title="Modifier"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleDeleteCategory({
                                id: category.id,
                                name: category.name,
                                description: category.description,
                                parent_id: category.parent_id,
                                children: [], // Convertir en string[] vide pour Category
                                created_at: category.created_at,
                                updated_at: category.updated_at
                            })}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Supprimer"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Sous-catégories */}
                {category.children.length > 0 && (
                    <div className="pl-4 pb-4">
                        {category.children.map(child => renderCategory(child))}
                    </div>
                )}
            </div>
        );
    };

    const organizedCategories = organizeCategories(categories);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des catégories</h1>
                    <p className="text-gray-600">Créez et organisez les catégories de produits</p>
                </div>

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 transition-colors"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle catégorie
                </button>
            </div>

            {/* Testeur d'endpoint */}
            <CategoryTester />

            {/* Liste des catégories */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-adawi-gold border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-3 text-gray-600">Chargement...</span>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error}</p>
                    <button
                        onClick={loadCategories}
                        className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                    >
                        Réessayer
                    </button> 
                </div>
            ) : organizedCategories.length === 0 ? (
                <div className="text-center py-12">
                    <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune catégorie trouvée</p>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="mt-4 text-adawi-gold hover:text-adawi-gold/80"
                    >
                        Créer la première catégorie
                    </button>
                </div>
            ) : (
                <div>
                    {organizedCategories.map(category => renderCategory(category))}
                </div>
            )}

            {/* Modal de suppression */}
            <DeleteCategoryModal
                category={selectedCategoryForDelete}
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedCategoryForDelete(null);
                }}
                onConfirm={confirmDeleteCategory}
                isDeleting={deleteFetcher.state === "submitting"}
                error={deleteFetcher.data?.error}
            />

            {/* Modal de modification */}
            <EditCategoryModal
                category={selectedCategoryForEdit}
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedCategoryForEdit(null);
                }}
                onSubmit={handleUpdateCategory}
                isSubmitting={editFetcher.state === "submitting"}
                error={editFetcher.data?.error}
                categories={categories}
            />

            {/* Modal de visualisation */}
            <ViewCategoryModal
                categoryId={selectedCategoryId}
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setSelectedCategoryId(null);
                }}
            />

            {/* Modal de création */}
            <AddCategoryModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleCreateCategory}
                isSubmitting={createFetcher.state === "submitting"}
                error={createFetcher.data?.error}
                categories={categories}
            />
        </div>
    );
}

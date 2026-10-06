import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Folder, FolderOpen, AlertCircle } from "lucide-react";

interface Category {
    id: string;
    name: string;
    description: string;
    parent_id: string | null;
    children: string[];
    created_at: string;
    updated_at: string;
}

interface CategorySelectorProps {
    categories: Category[];
    selectedCategoryId: string;
    onCategorySelect: (categoryId: string) => void;
    placeholder?: string;
    showCategoryDetails?: boolean; // Nouvelle prop pour afficher les détails
    onCategoryLoad?: (category: Category | null) => void; // Callback quand une catégorie est chargée
}

export default function CategorySelector({ 
    categories, 
    selectedCategoryId, 
    onCategorySelect,
    placeholder = "Sélectionner une catégorie",
    showCategoryDetails = false,
    onCategoryLoad
}: CategorySelectorProps) {
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCategoryDetails, setSelectedCategoryDetails] = useState<Category | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [detailsError, setDetailsError] = useState<string | null>(null);

    // Charger les détails de la catégorie sélectionnée
    const loadCategoryDetails = async (categoryId: string) => {
        if (!categoryId || !showCategoryDetails) return;
        
        setIsLoadingDetails(true);
        setDetailsError(null);
        
        try {
            const response = await fetch(`/api/categories/${categoryId}`);
            const data = await response.json();
            
            if (data.success) {
                setSelectedCategoryDetails(data.category);
                onCategoryLoad?.(data.category);
            } else {
                setDetailsError(data.error);
                setSelectedCategoryDetails(null);
                onCategoryLoad?.(null);
            }
        } catch (error) {
            setDetailsError("Erreur de connexion");
            setSelectedCategoryDetails(null);
            onCategoryLoad?.(null);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    // Charger les détails quand la catégorie sélectionnée change
    useEffect(() => {
        if (selectedCategoryId && showCategoryDetails) {
            loadCategoryDetails(selectedCategoryId);
        } else {
            setSelectedCategoryDetails(null);
            onCategoryLoad?.(null);
        }
    }, [selectedCategoryId, showCategoryDetails]);

    // Organiser les catégories en arbre
    const organizeCategories = (categories: Category[]) => {
        const categoryMap = new Map<string, Category>();
        const rootCategories: Category[] = [];

        // Créer une map de toutes les catégories
        categories.forEach(category => {
            categoryMap.set(category.id, { ...category, children: [] });
        });

        // Organiser en arbre
        categories.forEach(category => {
            if (category.parent_id) {
                const parent = categoryMap.get(category.parent_id);
                if (parent) {
                    parent.children.push(category.id);
                }
            } else {
                rootCategories.push(categoryMap.get(category.id)!);
            }
        });

        return { categoryMap, rootCategories };
    };

    const { categoryMap, rootCategories } = organizeCategories(categories);

    const toggleExpanded = (categoryId: string) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    const handleCategorySelect = (categoryId: string) => {
        onCategorySelect(categoryId);
        setIsOpen(false);
    };

    const renderCategory = (category: Category, level: number = 0) => {
        const hasChildren = category.children.length > 0;
        const isExpanded = expandedCategories.has(category.id);
        const isSelected = selectedCategoryId === category.id;

        return (
            <div key={category.id}>
                <div
                    className={`flex items-center py-2 px-3 cursor-pointer hover:bg-gray-50 ${ 
                        isSelected ? 'bg-adawi-gold/20 text-adawi-gold font-medium' : ''
                    }`}
                    style={{ paddingLeft: `${12 + level * 20}px` }}
                    onClick={() => handleCategorySelect(category.id)}
                >
                    {hasChildren ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleExpanded(category.id);
                            }}
                            className="mr-2 p-1 hover:bg-gray-200 rounded"
                        >
                            {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                            ) : (
                                <ChevronRight className="w-4 h-4" />
                            )}
                        </button>
                    ) : (
                        <div className="w-6 h-6 mr-2" />
                    )}

                    {hasChildren ? (
                        isExpanded ? (
                            <FolderOpen className="w-4 h-4 mr-2 text-adawi-gold" />
                        ) : (
                            <Folder className="w-4 h-4 mr-2 text-adawi-gold" />
                        )
                    ) : (
                        <div className="w-4 h-4 mr-2 bg-gray-300 rounded-sm" />
                    )}

                    <span className="flex-1">{category.name}</span>
                </div>

                {hasChildren && isExpanded && (
                    <div>
                        {category.children.map(childId => {
                            const childCategory = categoryMap.get(childId);
                            return childCategory ? renderCategory(childCategory, level + 1) : null;
                        })}
                    </div>
                )}
            </div>
        );
    };

    const selectedCategory = categoryMap.get(selectedCategoryId);

    return (
        <div className="space-y-3">
            {/* Sélecteur principal */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none text-left flex items-center justify-between"
                >
                    <span className={selectedCategory ? 'text-gray-900' : 'text-gray-500'}>
                        {selectedCategory ? selectedCategory.name : placeholder}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        <div
                            className="py-2 px-3 cursor-pointer hover:bg-gray-50 border-b border-gray-200"
                            onClick={() => handleCategorySelect('')}
                        >
                            <span className="text-gray-500">{placeholder}</span>
                        </div>
                        {rootCategories.map(category => renderCategory(category))}
                    </div>
                )}

                {isOpen && (
                    <div
                        className="fixed inset-0 z-5"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </div>

            {/* Détails de la catégorie sélectionnée */}
            {showCategoryDetails && selectedCategoryId && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Détails de la catégorie</h4>
                    
                    {isLoadingDetails ? (
                        <div className="flex items-center text-sm text-gray-500">
                            <div className="w-4 h-4 border-2 border-adawi-gold border-t-transparent rounded-full animate-spin mr-2"></div>
                            Chargement...
                        </div>
                    ) : detailsError ? (
                        <div className="flex items-center text-sm text-red-600">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            {detailsError}
                        </div>
                    ) : selectedCategoryDetails ? (
                        <div className="space-y-2">
                            <div>
                                <span className="text-xs text-gray-500">Nom:</span>
                                <p className="text-sm font-medium text-gray-900">{selectedCategoryDetails.name}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500">Description:</span>
                                <p className="text-sm text-gray-700">{selectedCategoryDetails.description}</p>
                            </div>
                            {selectedCategoryDetails.parent_id && (
                                <div>
                                    <span className="text-xs text-gray-500">Catégorie parent:</span>
                                    <p className="text-sm text-gray-700">{selectedCategoryDetails.parent_id}</p>
                                </div>
                            )}
                            {selectedCategoryDetails.children.length > 0 && (
                                <div>
                                    <span className="text-xs text-gray-500">Sous-catégories:</span>
                                    <p className="text-sm text-gray-700">{selectedCategoryDetails.children.length} sous-catégorie(s)</p>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}

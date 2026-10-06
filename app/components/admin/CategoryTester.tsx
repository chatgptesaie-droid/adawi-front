import { useState } from "react";
import { Search, Eye } from "lucide-react";

export default function CategoryTester() {
    const [categoryId, setCategoryId] = useState("");
    const [category, setCategory] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const testCategory = async () => {
        if (!categoryId.trim()) {
            setError("Veuillez entrer un ID de catégorie");
            return;
        }

        setIsLoading(true);
        setError(null);
        setCategory(null);

        try {
            console.log(` Test de récupération de la catégorie: ${categoryId}`);
            
            const response = await fetch(`/api/categories/${categoryId.trim()}`);
            const data = await response.json();

            if (data.success) {
                setCategory(data.category);
                console.log(" Catégorie récupérée:", data.category);
            } else {
                setError(data.error);
                console.error(" Erreur:", data.error);
            }
        } catch (err) {
            setError("Erreur de connexion");
            console.error(" Erreur de connexion:", err);
        } finally {
            setIsLoading(false);
        }
    };

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
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Test de récupération de catégorie</h3>
            
            {/* Input pour l'ID */}
            <div className="flex space-x-3">
                <input
                    type="text"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    placeholder="ID de la catégorie à tester"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                />
                <button
                    onClick={testCategory}
                    disabled={isLoading}
                    className="px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                    {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Search className="w-4 h-4" />
                    )}
                    <span>Tester</span>
                </button>
            </div>

            {/* Résultats */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">{error}</p>
                </div>
            )}

            {category && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center">
                        <Eye className="w-5 h-5 text-green-600 mr-2" />
                        <h4 className="font-medium text-green-900">Catégorie trouvée</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-medium text-gray-700">ID:</span>
                            <p className="text-gray-900">{category.id}</p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Nom:</span>
                            <p className="text-gray-900">{category.name}</p>
                        </div>
                        <div className="md:col-span-2">
                            <span className="font-medium text-gray-700">Description:</span>
                            <p className="text-gray-900">{category.description}</p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Parent ID:</span>
                            <p className="text-gray-900">{category.parent_id || "Aucun"}</p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Enfants:</span>
                            <p className="text-gray-900">{category.children.length} sous-catégorie(s)</p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Créée le:</span>
                            <p className="text-gray-900">{formatDate(category.created_at)}</p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Modifiée le:</span>
                            <p className="text-gray-900">{formatDate(category.updated_at)}</p>
                        </div>
                    </div>

                    {/* Affichage des enfants */}
                    {category.children.length > 0 && (
                        <div>
                            <span className="font-medium text-gray-700">IDs des sous-catégories:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {category.children.map((childId: string, index: number) => (
                                    <span
                                        key={childId}
                                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                    >
                                        {childId}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

import { X } from "lucide-react";

interface SidebarEssaieProps {
    isMobile?: boolean;
    onClose?: () => void;
    activeFilterCategory: string;
    onFilterCategoryChange: (categoryId: string) => void;
    minPrice: string;
    maxPrice: string;
    onMinPriceChange: (value: string) => void;
    onMaxPriceChange: (value: string) => void;
    selectedSizes: string[];
    selectedColors: string[];
    onSizeToggle: (size: string) => void;
    onColorToggle: (color: string) => void;
}

export default function SidebarEssaie({
    isMobile = false,
    onClose,
    activeFilterCategory,
    onFilterCategoryChange,
    minPrice,
    maxPrice,
    onMinPriceChange,
    onMaxPriceChange,
    selectedSizes,
    selectedColors,
    onSizeToggle,
    onColorToggle
}: SidebarEssaieProps) {
    return (
        <div className={`bg-white rounded-lg border border-gray-200 p-3 ${isMobile ? 'h-full overflow-y-auto' : ''} w-full max-w-[240px]`}>
            {isMobile && (
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-900">Filtres</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="space-y-3">
                {/* Bouton Trier par */}
                <div>
                    <button className="w-full px-3 py-1.5 border border-gray-300 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        Trier par
                    </button>
                </div>

                {/* Prix */}
                <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-2 text-sm">Prix</h4>
                    <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-600">De</span>
                        <input
                            type="number"
                            placeholder="0"
                            value={minPrice}
                            onChange={(e) => onMinPriceChange(e.target.value)}
                            className="flex-1 px-1.5 py-1 border border-gray-300 rounded text-xs w-12"
                        />
                        <span className="text-xs text-gray-600">à</span>
                        <input
                            type="number"
                            placeholder="1000"
                            value={maxPrice}
                            onChange={(e) => onMaxPriceChange(e.target.value)}
                            className="flex-1 px-1.5 py-1 border border-gray-300 rounded text-xs w-12"
                        />
                        <span className="text-xs text-gray-600">F CFA</span>
                    </div>
                </div>

                {/* Catégorie */}
                <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-2 text-sm">Catégorie</h4>
                    <div className="space-y-1.5">
                        {[
                            { id: "vedette", label: "Vedette" },
                            { id: "nouveaute", label: "Nouveauté" },
                            { id: "homme", label: "Homme" },
                            { id: "femme", label: "Femme" },
                            { id: "enfant", label: "Enfant" },
                            { id: "montre", label: "Montre" }
                        ].map(category => (
                            <label key={category.id} className="flex items-center justify-between">
                                <span className="text-xs text-gray-700">{category.label}</span>
                                <input
                                    type="radio"
                                    name="category"
                                    checked={activeFilterCategory === category.id}
                                    onChange={() => onFilterCategoryChange(category.id)}
                                    className="w-3 h-3 text-orange-500 border-gray-300 focus:ring-orange-500"
                                />
                            </label>
                        ))}
                    </div>
                </div>

                {/* Taille */}
                <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-2 text-sm">Taille</h4>
                    <div className="space-y-1.5">
                        {["XXL", "XL", "L", "M", "S"].map(size => (
                            <label key={size} className="flex items-center justify-between">
                                <span className="text-xs text-gray-700">{size}</span>
                                <input
                                    type="radio"
                                    name="size"
                                    checked={selectedSizes.includes(size)}
                                    onChange={() => onSizeToggle(size)}
                                    className="w-3 h-3 text-orange-500 border-gray-300 focus:ring-orange-500"
                                />
                            </label>
                        ))}
                    </div>
                </div>

                {/* Couleur */}
                <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-2 text-sm">Couleur</h4>
                    <div className="space-y-1.5">
                        {[
                            { id: "blanc", label: "Blanc" },
                            { id: "noir", label: "Noir" },
                            { id: "rouge", label: "Rouge" },
                            { id: "vert", label: "Vert" }
                        ].map(color => (
                            <label key={color.id} className="flex items-center justify-between">
                                <span className="text-xs text-gray-700">{color.label}</span>
                                <input
                                    type="radio"
                                    name="color"
                                    checked={selectedColors.includes(color.id)}
                                    onChange={() => onColorToggle(color.id)}
                                    className="w-3 h-3 text-orange-500 border-gray-300 focus:ring-orange-500"
                                />
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

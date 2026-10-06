import React from "react";
import { ProductCategory } from "./ProductGrid";

interface FilterBarProps {
  activeCategory: ProductCategory;
  onCategoryChange: (category: ProductCategory) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ activeCategory, onCategoryChange }) => {
  const categories = [
    { id: "vedette" as ProductCategory, label: "Voir tout les produits" },
    { id: "nouveaute" as ProductCategory, label: "Nouveauté" },
    { id: "homme" as ProductCategory, label: "Homme" },
    { id: "femme" as ProductCategory, label: "Femme" },
    { id: "enfant" as ProductCategory, label: "Enfant" },
    { id: "couple" as ProductCategory, label: "Couple" },
    // { id: "montre" as ProductCategory, label: "Montre" }
  ];

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`px-4 py-2 rounded-full ${
            activeCategory === category.id
              ? "bg-adawi-gold text-black"
              : "border-2 border-adawi-gold text-black hover:bg-adawi-gold hover:text-white"
          } transition-colors text-sm`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
};

export default FilterBar;

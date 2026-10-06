import React, { useState } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { ProductCategory, ProductSize, ProductColor } from "./ProductGrid";

interface SidebarFiltersProps {
  activeCategory: ProductCategory;
  selectedSize: ProductSize | undefined;
  selectedColor: ProductColor | undefined;
  onCategoryChange: (category: ProductCategory) => void;
  onSizeChange: (size: ProductSize | undefined) => void;
  onColorChange: (color: ProductColor | undefined) => void;
}

const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  activeCategory,
  selectedSize,
  selectedColor,
  onCategoryChange,
  onSizeChange,
  onColorChange,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const categoryOptions = [
    { id: "vedette", label: "Tout" },
    { id: "nouveaute", label: "Nouveauté" },
    { id: "homme", label: "Homme" },
    { id: "femme", label: "Femme" },
    { id: "enfant", label: "Enfant" },
    { id: "couple", label: "Couple" },
  ];

  const sizeOptions = [
    { id: "xxl", label: "XXL" },
    { id: "xl", label: "XL" },
    { id: "l", label: "L" },
    { id: "m", label: "M" },
    { id: "s", label: "S" },
  ];

  const colorOptions = [
    { id: "blanc", label: "Blanc" },
    { id: "noir", label: "Noir" },
    { id: "rouge", label: "Rouge" },
    { id: "vert", label: "Vert" },
  ];

  const baseRadioStyle =
    "w-4 h-4 appearance-none border border-gray-400 rounded-full checked:bg-adawi-gold checked:border-adawi-gold focus:ring-2 focus:ring-adawi-gold transition duration-150";

  const renderFilters = () => (
    <div className="border-4 border-adawi-gold rounded-3xl p-4 space-y-6">
      {/* Catégorie */}
      <div>
        <h3 className="font-semibold pl-9 text-black mb-3">Catégorie</h3>
        <div className="space-y-2">
          {categoryOptions.map((option) => (
            <div key={option.id} className="flex justify-between items-center">
              <label htmlFor={`category-${option.id}`} className="text-sm text-black pl-12">
                {option.label}
              </label>
              <input
                type="radio"
                id={`category-${option.id}`}
                name="category"
                className={baseRadioStyle}
                checked={activeCategory === option.id}
                onChange={() => onCategoryChange(option.id as ProductCategory)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Taille */}
      <div>
        <h3 className="pl-9 font-semibold text-black mb-3">Taille</h3>
        <div className="space-y-2">
          {sizeOptions.map((option) => (
            <div key={option.id} className="flex justify-between items-center">
              <label htmlFor={`size-${option.id}`} className="text-sm text-black pl-12">
                {option.label}
              </label>
              <input
                type="radio"
                id={`size-${option.id}`}
                name="size"
                className={baseRadioStyle}
                checked={selectedSize === option.id}
                onChange={() => onSizeChange(option.id as ProductSize)}
              />
            </div>
          ))}
          <div className="flex justify-between items-center">
            <label htmlFor="size-all" className="text-sm text-black pl-12">
              Tout
            </label>
            <input
              type="radio"
              id="size-all"
              name="size"
              className={baseRadioStyle}
              checked={selectedSize === undefined}
              onChange={() => onSizeChange(undefined)}
            />
          </div>
        </div>
      </div>

      {/* Couleur */}
      <div>
        <h3 className="pl-9 font-semibold text-black mb-3">Couleur</h3>
        <div className="space-y-2">
          {colorOptions.map((option) => (
            <div key={option.id} className="flex justify-between items-center">
              <label htmlFor={`color-${option.id}`} className="text-sm text-black pl-12">
                {option.label}
              </label>
              <input
                type="radio"
                id={`color-${option.id}`}
                name="color"
                className={baseRadioStyle}
                checked={selectedColor === option.id}
                onChange={() => onColorChange(option.id as ProductColor)}
              />
            </div>
          ))}
          <div className="flex justify-between items-center">
            <label htmlFor="color-all" className="text-sm text-black pl-12">
              Tout
            </label>
            <input
              type="radio"
              id="color-all"
              name="color"
              className={baseRadioStyle}
              checked={selectedColor === undefined}
              onChange={() => onColorChange(undefined)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* BOUTON FILTRES MOBILE */}
      <div className="md:hidden flex justify-end mb-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="bg-adawi-gold text-white px-4 py-2 rounded-full flex items-center gap-2"
        >
          <SlidersHorizontal size={18} /> Filtres
        </button>
      </div>

      {/* SIDEBAR POUR DESKTOP */}
      <div className="hidden md:block w-full md:w-64">
        {renderFilters()}
      </div>

      {/* DRAWER POUR MOBILE */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-end md:hidden"
          onClick={() => setIsMobileOpen(false)}
        >
          <div
            className="bg-white w-80 h-full p-4 overflow-y-auto shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filtres</h2>
              <button onClick={() => setIsMobileOpen(false)}>
                <X size={25} className="text-black" />
              </button>
            </div>
            {renderFilters()}
          </div>
        </div>
      )}
    </>
  );
};

export default SidebarFilters;

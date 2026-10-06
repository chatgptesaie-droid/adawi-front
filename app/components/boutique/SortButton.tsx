import React, { useState } from "react";

export type SortOption = "featured" | "newest" | "price-low" | "price-high";

interface SortButtonProps {
  onSort: (option: SortOption) => void;
  currentSort: SortOption;
}

const SortButton: React.FC<SortButtonProps> = ({ onSort, currentSort }) => {
  const [selectedOption, setSelectedOption] = useState<SortOption>(currentSort);

  const sortOptions = [
    // { value: "featured", label: "En vedette" },
    // { value: "newest", label: "Nouveautés" },
     { value: "prix", label: "Prix" },
    { value: "price-low", label: "Prix: croissant" },
    { value: "price-high", label: "Prix: décroissant" }
  ];

  // Trouver l'option actuellement sélectionnée
  const currentLabel = sortOptions.find(option => option.value === selectedOption)?.label || "Trier par";

  // Fonction pour changer l'option sélectionnée
  const handleOptionChange = (option: SortOption) => {
    setSelectedOption(option);
  };

  // Fonction pour appliquer le tri
  const handleApplySort = () => {
    onSort(selectedOption);
  };

  return (
    <div className="flex flex-col space-y-2 w-full">
      <h3 className="font-semibold text-black">Trier par</h3>
      <div className="flex items-center space-x-2">
        <div className="relative inline-block text-left flex-grow">
          <select
            className="appearance-none w-full px-4 py-2 rounded-full border-2  border-adawi-gold text-black  bg-transparent transition-colors text-sm pr-8"
            value={selectedOption}
            onChange={(e) => handleOptionChange(e.target.value as SortOption)}
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}             
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-adawi-gold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <button
          onClick={handleApplySort}
          className="px-4 py-2 rounded-full bg-adawi-gold text-black hover:bg-adawi-gold/90 transition-colors text-sm whitespace-nowrap"
        >
          Trier
        </button>
      </div>
    </div>
  );
};

export default SortButton;

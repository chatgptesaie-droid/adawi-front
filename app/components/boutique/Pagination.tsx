import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const maxVisible = 3;
  const [startPage, setStartPage] = useState(1);

  useEffect(() => {
    // Met à jour le bloc de pages visibles quand la page courante change
    const newStart = Math.max(
      Math.min(currentPage - Math.floor(maxVisible / 2), totalPages - maxVisible + 1),
      1
    );
    setStartPage(newStart);
  }, [currentPage, totalPages]);

  const endPage = Math.min(startPage + maxVisible - 1, totalPages);
  const visiblePages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  const handlePrevSet = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextSet = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      {/* Flèche gauche */}
      <button
        onClick={handlePrevSet}
        disabled={currentPage === 1}
        className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Page précédente"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>

      {/* Boutons numérotés */}
      <div className="flex items-center space-x-1">
        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-current={currentPage === page ? "page" : undefined}
            className={`w-8 h-8 rounded-full text-sm font-medium transition-all duration-200
              ${
                currentPage === page
                  ? "bg-adawi-gold text-white shadow"
                  : "text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Flèche droite */}
      <button
        onClick={handleNextSet}
        disabled={currentPage === totalPages}
        className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Page suivante"
      >
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
}

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    const maxVisible = 3;
    const [startPage, setStartPage] = useState(1);

    const endPage = Math.min(startPage + maxVisible - 1, totalPages);
    const visiblePages = Array.from(
        { length: endPage - startPage + 1 },
        (_, i) => startPage + i
    );

    const handleNextSet = () => {
        if (startPage + maxVisible <= totalPages) {
            setStartPage(startPage + 1);
        }
    };

    const handlePrevSet = () => {
        if (startPage > 1) {
            setStartPage(startPage - 1);
        }
    };

    return (
        <div className="flex items-center justify-center space-x-2 mt-8">
            {/* Flèche gauche */}
            <button
                type="button"
                onClick={handlePrevSet}
                disabled={startPage === 1}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                aria-label="Page précédente"
            >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            {/* Boutons de pagination numérotés */}
            <div className="flex items-center space-x-1">
                {visiblePages.map((page) => (
                    <button
                        key={page}
                        type="button"
                        onClick={() => onPageChange(page)}
                        className={`w-8 h-8 rounded-full text-sm font-medium transition-all duration-200
                            ${currentPage === page
                                ? 'bg-adawi-gold text-white shadow-md'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-adawi-gold border border-gray-300'
                            }`}
                    >
                        {page}
                    </button>
                ))}
            </div>

            {/* Flèche droite */}
            <button
                type="button"
                onClick={handleNextSet}
                disabled={endPage >= totalPages}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                aria-label="Page suivante"
            >
                <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
        </div>
    );
}

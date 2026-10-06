import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void | Promise<void>;
  totalItems?: number;
  itemsPerPage?: number;
  showInfo?: boolean;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems,
  itemsPerPage = 10,
  showInfo = true
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    // Calculer la plage de pages à afficher
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // Ajouter la première page
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    // Ajouter les pages du milieu
    rangeWithDots.push(...range);

    // Ajouter la dernière page
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    // Supprimer les doublons
    return rangeWithDots.filter((page, index, arr) => 
      index === 0 || page !== arr[index - 1]
    );
  };

  const visiblePages = getVisiblePages();
  const startItem = totalItems ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between bg-white px-4 py-3 border-t border-gray-200">
      {/* Informations sur les résultats */}
      {showInfo && totalItems && (
        <div className="flex-1 flex justify-between sm:hidden">
          <span className="text-sm text-gray-700">
            {startItem} - {endItem} sur {totalItems}
          </span>
        </div>
      )}

      {/* Navigation mobile */}
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Précédent
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Suivant
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      {/* Navigation desktop */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        {showInfo && totalItems && (
          <div>
            <p className="text-sm text-gray-700">
              Affichage de <span className="font-medium">{startItem}</span> à{' '}
              <span className="font-medium">{endItem}</span> sur{' '}
              <span className="font-medium">{totalItems}</span> résultats
            </p>
          </div>
        )}
        
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            {/* Bouton Précédent */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Page précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Numéros de page */}
            {visiblePages.map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' ? onPageChange(page) : undefined}
                disabled={page === '...'}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                  page === currentPage
                    ? 'z-10 bg-adawi-gold border-adawi-gold text-white'
                    : page === '...'
                    ? 'bg-white border-gray-300 text-gray-700 cursor-default'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-adawi-gold'
                }`}
                aria-label={typeof page === 'number' ? `Page ${page}` : 'Plus de pages'}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            ))}

            {/* Bouton Suivant */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Page suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

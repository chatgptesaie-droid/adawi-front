import { useEffect } from "react";

interface ImageModalProps {
  imageUrl: string | null;
  imageAlt: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageModal({ imageUrl, imageAlt, isOpen, onClose }: ImageModalProps) {
  // Fermer la modale avec la touche Échap
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Empêcher le scroll du body quand la modale est ouverte
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full flex items-center justify-center text-xl font-bold transition-all duration-200"
          aria-label="Fermer l'image"
        >
          X
        </button>

        {/* Image en taille complète */}
        <img
          src={imageUrl}
          alt={imageAlt}
          className="max-w-full bg-gray-200 max-h-full object-contain rounded-lg "
        />
      </div>
    </div>
  );
}

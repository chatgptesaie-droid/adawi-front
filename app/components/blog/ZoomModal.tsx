import React from "react";
import { useEffect, useState, useCallback } from "react";

interface ZoomModalProps {
  zoomedImage: string;
  zoomScale: number;
  zoomPosition: { x: number; y: number };
  isDragging: boolean;
  showControls: boolean;
  onClose: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onToggleControls: () => void;
  onSetDragging: (dragging: boolean) => void;
  onSetZoomPosition: (position: { x: number; y: number }) => void;
  onSetZoomScale?: (scale: number) => void; // Nouvelle prop optionnelle
}

export default function ZoomModal({
  zoomedImage,
  zoomScale,
  zoomPosition,
  isDragging,
  showControls,
  onClose,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onToggleControls,
  onSetDragging,
  onSetZoomPosition,
  onSetZoomScale,
}: ZoomModalProps) {
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Configuration du zoom
  const ZOOM_STEP = 0.2; // Étapes plus petites pour un zoom plus fluide
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 5;

  // Empêcher le scroll du body quand le modal est ouvert
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Fonction pour zoom progressif avec limites
  const handleZoomIn = useCallback(() => {
    if (onSetZoomScale) {
      const newScale = Math.min(zoomScale + ZOOM_STEP, MAX_ZOOM);
      onSetZoomScale(newScale);
    } else {
      onZoomIn();
    }
  }, [zoomScale, onSetZoomScale, onZoomIn]);

  const handleZoomOut = useCallback(() => {
    if (onSetZoomScale) {
      const newScale = Math.max(zoomScale - ZOOM_STEP, MIN_ZOOM);
      onSetZoomScale(newScale);
      
      // Si on revient en dessous de 1, on recentre l'image
      if (newScale <= 1) {
        onSetZoomPosition({ x: 0, y: 0 });
      }
    } else {
      onZoomOut();
    }
  }, [zoomScale, onSetZoomScale, onZoomOut, onSetZoomPosition]);

  const handleZoomReset = useCallback(() => {
    if (onSetZoomScale) {
      onSetZoomScale(1);
      onSetZoomPosition({ x: 0, y: 0 });
    } else {
      onZoomReset();
    }
  }, [onSetZoomScale, onSetZoomPosition, onZoomReset]);

  // Gestion des touches clavier
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          handleZoomReset();
          break;
        case 'h':
        case 'H':
          e.preventDefault();
          onToggleControls();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          // Zoom pour ajuster à l'écran
          if (onSetZoomScale) {
            onSetZoomScale(1);
            onSetZoomPosition({ x: 0, y: 0 });
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onClose, handleZoomIn, handleZoomOut, handleZoomReset, onToggleControls, onSetZoomScale, onSetZoomPosition]);

  // Gestion de la molette de la souris avec zoom progressif
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    if (onSetZoomScale) {
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomScale + delta));
      onSetZoomScale(newScale);
      
      // Recentrer si on zoom out en dessous de 1
      if (newScale <= 1) {
        onSetZoomPosition({ x: 0, y: 0 });
      }
    } else {
      if (e.deltaY < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    }
  }, [zoomScale, onSetZoomScale, onSetZoomPosition, handleZoomIn, handleZoomOut]);

  // Gestion du touch pour mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && zoomScale > 1) {
      const touch = e.touches[0];
      onSetDragging(true);
      setDragStart({
        x: touch.clientX - zoomPosition.x,
        y: touch.clientY - zoomPosition.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1 && zoomScale > 1) {
      e.preventDefault();
      const touch = e.touches[0];
      onSetZoomPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    onSetDragging(false);
  };

  // Niveaux de zoom prédéfinis
  const zoomLevels = [0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 5];
  const currentZoomIndex = zoomLevels.findIndex(level => Math.abs(level - zoomScale) < 0.1);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
      onWheel={handleWheel}
    >
      {/* Overlay pour fermer */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
      />

      {/* Contrôles - Responsive */}
      {showControls && (
        <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10 flex items-center space-x-1 md:space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleZoomOut();
            }}
            disabled={zoomScale <= MIN_ZOOM}
            className={`bg-white/10 backdrop-blur-sm text-white p-2 md:p-3 rounded-full hover:bg-white/20 transition-all duration-200 touch-manipulation ${
              zoomScale <= MIN_ZOOM ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Zoom arrière (- ou molette)"
            aria-label="Zoom arrière"
          >
            <svg
              className="w-4 h-4 md:w-5 md:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleZoomReset();
            }}
            className="bg-white/10 backdrop-blur-sm text-white p-2 md:p-3 rounded-full hover:bg-white/20 transition-all duration-200 touch-manipulation"
            title="Réinitialiser le zoom (0 ou F)"
            aria-label="Réinitialiser le zoom"
          >
            <svg
              className="w-4 h-4 md:w-5 md:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleZoomIn();
            }}
            disabled={zoomScale >= MAX_ZOOM}
            className={`bg-white/10 backdrop-blur-sm text-white p-2 md:p-3 rounded-full hover:bg-white/20 transition-all duration-200 touch-manipulation ${
              zoomScale >= MAX_ZOOM ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Zoom avant (+ ou molette)"
            aria-label="Zoom avant"
          >
            <svg
              className="w-4 h-4 md:w-5 md:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="bg-white/10 backdrop-blur-sm text-white p-2 md:p-3 rounded-full hover:bg-white/20 transition-all duration-200 touch-manipulation"
            title="Fermer (Échap)"
            aria-label="Fermer"
          >
            <svg
              className="w-4 h-4 md:w-5 md:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Bouton pour masquer/afficher les contrôles */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleControls();
        }}
        className="absolute top-2 left-2 md:top-4 md:left-4 z-10 bg-white/10 backdrop-blur-sm text-white p-2 md:p-3 rounded-full hover:bg-white/20 transition-all duration-200 touch-manipulation"
        title="Masquer/Afficher les contrôles (H)"
        aria-label="Basculer l'affichage des contrôles"
      >
        <svg
          className="w-4 h-4 md:w-5 md:h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {showControls ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          )}
        </svg>
      </button>

      {/* Indicateur de zoom avec barre de progression */}
      {showControls && (
        <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 z-10">
          <div className="bg-white/10 backdrop-blur-sm text-white px-2 py-1 md:px-3 md:py-2 rounded-full text-xs md:text-sm mb-2">
            {Math.round(zoomScale * 100)}%
          </div>
          {/* Barre de zoom */}
          <div className="w-32 h-1 bg-white/20 rounded-full">
            <div 
              className="h-full bg-white/60 rounded-full transition-all duration-200"
              style={{
                width: `${Math.min(100, ((zoomScale - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100)}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Container de l'image avec gestion du overflow */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden p-2 md:p-4">
        <img
          src={zoomedImage}
          alt="Image agrandie"
          className={`max-w-none max-h-none object-contain transition-transform duration-200 select-none ${
            isDragging ? 'cursor-grabbing' : zoomScale > 1 ? 'cursor-grab' : 'cursor-zoom-in'
          }`}
          style={{
            transform: `scale(${zoomScale}) translate(${zoomPosition.x / zoomScale}px, ${zoomPosition.y / zoomScale}px)`,
            transformOrigin: 'center',
            touchAction: 'none',
            maxWidth: zoomScale === 1 ? '100%' : 'none',
            maxHeight: zoomScale === 1 ? '100%' : 'none',
          }}
          draggable="false"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </div>

      {/* Instructions - Responsive */}
      {showControls && (
        <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 z-10 bg-white/10 backdrop-blur-sm text-white px-2 py-1 md:px-3 md:py-2 rounded-full text-xs">
          <span className="hidden sm:inline">
            {zoomScale > 1 ? "Glisser pour déplacer • F pour ajuster" : "Molette, +/- ou F pour zoomer"}
          </span>
          <span className="sm:hidden">
            {zoomScale > 1 ? "Glisser pour bouger" : "Pincer pour zoomer"}
          </span>
        </div>
      )}
    </div>
  );
}
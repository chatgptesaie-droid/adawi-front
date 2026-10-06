import React, { useState, useEffect, useRef } from "react";
import { Link } from "@remix-run/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ZoomModal from "./blog/ZoomModal";

interface Photo {
  image_url: string;
  description: string;
  _id: string;
  user_id: string;
  created_at: string;
}

const NewProducts: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<Set<string>>(new Set());
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);

  // Zoom modal state
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState('');
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Récupération des photos depuis l'API
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setIsLoadingPhotos(true);
        
        // Récupérer le token - adapter selon votre implémentation côté client
        const token = localStorage.getItem('auth_token') || 
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbjEwQGV4YW1wbGUuY29tIiwic2Vzc2lvbl9pZCI6ImZlNWY4NmUxLWM3NzEtNDc4MS1hZjM1LTBhNWIxOTJjNDA5NyIsImV4cCI6MTc1OTg2NzUwNn0.0rDYmkId4afvZBGbDyVShXYAbs51pkUrbI9ZihCnm6M';

        const response = await fetch(
          'http://localhost:8000/user-photos/?skip=0&limit=100',
          {
            headers: {
              'accept': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des photos');
        }

        const data: Photo[] = await response.json();
        setPhotos(data);
        setPhotoError(null);
      } catch (error) {
        console.error('Erreur lors du chargement des photos:', error);
        setPhotoError('Impossible de charger les photos');
      } finally {
        setIsLoadingPhotos(false);
      }
    };

    fetchPhotos();
  }, []);

  // Nombre de photos visibles par page (5 en version desktop, adaptatif)
  const photosPerPage = 5;
  const totalPages = Math.ceil(photos.length / photosPerPage);

  // Défilement automatique
  useEffect(() => {
    if (photos.length > photosPerPage) {
      autoScrollRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex >= totalPages - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // Change toutes les 5 secondes

      return () => {
        if (autoScrollRef.current) {
          clearInterval(autoScrollRef.current);
        }
      };
    }
  }, [photos.length, totalPages]);

  // Animation d'apparition au scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleImageLoad = (photoId: string) => {
    setImagesLoaded(prev => new Set(prev).add(photoId));
  };

  // Navigation manuelle
  const handlePrev = () => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
    }
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? totalPages - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
    }
    setCurrentIndex((prevIndex) => 
      prevIndex >= totalPages - 1 ? 0 : prevIndex + 1
    );
  };

  // Photos à afficher pour la page courante
  const startIndex = currentIndex * photosPerPage;
  const visiblePhotos = photos.slice(startIndex, startIndex + photosPerPage);

  // Zoom modal handlers
  const openZoomModal = (image: string) => {
    setZoomedImage(image);
    setZoomScale(1);
    setZoomPosition({ x: 0, y: 0 });
    setZoomModalOpen(true);
    setShowControls(true);
  };

  const closeZoomModal = () => {
    setZoomModalOpen(false);
  };

  const zoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.25, 5));
  };

  const zoomOut = () => {
    setZoomScale((prev) => Math.max(prev - 0.25, 1));
    setZoomPosition({ x: 0, y: 0 });
  };

  const zoomReset = () => {
    setZoomScale(1);
    setZoomPosition({ x: 0, y: 0 });
  };

  const toggleControls = () => {
    setShowControls((prev) => !prev);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setZoomPosition((prev) => ({
      x: prev.x + e.movementX,
      y: prev.y + e.movementY,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <>
      <section ref={sectionRef} className="bg-gradient-to-br from-gray-50 to-gray-100 px-3 sm:px-4 md:px-6 py-12 sm:py-16 lg:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Header avec animation */}
        <div className={`flex flex-col sm:flex-row items-center justify-between mb-8 sm:mb-12 gap-4 sm:gap-6 transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
        }`}>
          
          <div className="text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-black mb-2 relative">
              <span className="relative inline-block">
                Nouveautés
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-adawi-gold via-adawi-gold/60 to-transparent rounded-full transform origin-left scale-x-0 animate-expand-line"></div>
              </span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Découvrez notre sélection exclusive</p>
          </div>
          
          <div className={`transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`} style={{ transitionDelay: '300ms' }}>
            <Link 
              to="/boutique" 
              className="group relative inline-flex items-center border-2 border-adawi-gold/90 text-black px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-full hover:bg-adawi-gold hover:text-white transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm sm:text-base font-medium overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                Voir tous
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-adawi-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </Link>
          </div>
        </div>

        {/* Message de chargement */}
        {isLoadingPhotos && (
          <div className="mb-8 text-center">
            <div className="inline-block w-8 h-8 border-2 border-adawi-gold border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-600">Chargement des photos...</p>
          </div>
        )}

        {/* Message d'erreur */}
        {photoError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center">
            {photoError}
          </div>
        )}

        {/* Grille de photos avec navigation */}
        {!isLoadingPhotos && photos.length > 0 && (
          <div className="relative">
            {/* Bouton précédent */}
            {totalPages > 1 && (
              <button
                onClick={handlePrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                aria-label="Photos précédentes"
              >
                <ChevronLeft className="w-6 h-6 text-black" />
              </button>
            )}

            {/* Grille de produits responsive */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
              {visiblePhotos.map((photo, index) => (
                <div
                  key={photo._id}
                  className={`group cursor-pointer transition-all duration-700 ease-out ${
                    isVisible 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${400 + index * 150}ms` }}
                >
                  {/* Card container avec effet de profondeur */}
                  <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] overflow-hidden">
                    
                    {/* Image container avec overlay */}
                    <div className="relative aspect-[4/5] overflow-hidden cursor-pointer" onClick={() => openZoomModal(photo.image_url)}>
                      
                      {/* Image avec effet de zoom */}
                      <img
                        src={photo.image_url}
                        alt={photo.description}
                        className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                          imagesLoaded.has(photo._id) ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => handleImageLoad(photo._id)}
                        loading="lazy"
                      />
                      
                      {/* Placeholder pendant le chargement */}
                      {!imagesLoaded.has(photo._id) && (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
                          <div className="w-8 h-8 border-2 border-adawi-gold border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      
                      {/* Overlay gradient au survol */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Indicateur "Nouveau" pour les photos récentes (moins de 7 jours) */}
                      {(() => {
                        const photoDate = new Date(photo.created_at);
                        const daysDiff = Math.floor((Date.now() - photoDate.getTime()) / (1000 * 60 * 60 * 24));
                        return daysDiff < 7 ? (
                          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-adawi-gold rounded-full animate-pulse shadow-lg"></div>
                          </div>
                        ) : null;
                      })()}
                      
                      {/* Bouton d'action au survol */}
                      {/* <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <button className="w-full bg-white/90 backdrop-blur-sm text-black py-2 px-3 rounded-lg font-medium text-xs sm:text-sm hover:bg-white transition-colors duration-200">
                          Voir détails
                        </button>
                      </div> */}
                    </div>

                    {/* Informations produit */}
                    <div className="p-3 sm:p-4 space-y-2">
                      {/* Description */}
                      <h3 className="text-adawi-brown font-semibold text-sm sm:text-base lg:text-lg line-clamp-2 group-hover:text-adawi-gold transition-colors duration-300">
                        {photo.description || "Photo"}
                      </h3>
                      
                      {/* Date de création */}
                      <div className="flex items-center text-xs text-gray-500">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(photo.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bouton suivant */}
            {totalPages > 1 && (
              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                aria-label="Photos suivantes"
              >
                <ChevronRight className="w-6 h-6 text-black" />
              </button>
            )}

            {/* Indicateurs de pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 gap-2">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'bg-adawi-gold w-8'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Page ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Message si aucune photo */}
        {!isLoadingPhotos && !photoError && photos.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucune photo disponible pour le moment
          </div>
        )}
      </div>

      {/* Éléments décoratifs d'arrière-plan */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-adawi-gold/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-adawi-gold/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* CSS intégré pour les animations personnalisées */}
      <style>{`
        @keyframes expandLine {
          to {
            transform: scaleX(1);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-expand-line {
          animation: expandLine 1s ease-out 0.5s forwards;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (hover: none) {
          .group:active .group-hover\\:scale-110 {
            transform: scale(1.05);
          }
          
          .group:active .group-hover\\:opacity-100 {
            opacity: 1;
          }
        }

        @media (max-width: 400px) {
          .grid {
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
          }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
          }
        }

        @media (min-width: 1280px) {
          .product-card {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .product-card:hover {
            transform: translateY(-12px) scale(1.02);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          
          .group:hover img {
            transform: none;
          }
        }

        @media (prefers-color-scheme: dark) {
          .bg-white {
            background-color: #1f2937;
          }
          
          .text-black {
            color: #f9fafb;
          }
          
          .text-adawi-brown {
            color: #d1d5db;
          }
        }

        .product-image {
          will-change: transform;
          backface-visibility: hidden;
          perspective: 1000px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </section>

    {/* Zoom Modal */}
    {zoomModalOpen && (
      <ZoomModal
        zoomedImage={zoomedImage}
        onClose={closeZoomModal}
        zoomScale={zoomScale}
        zoomPosition={zoomPosition}
        isDragging={isDragging}
        showControls={showControls}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onZoomReset={zoomReset}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onToggleControls={toggleControls}
        onSetDragging={setIsDragging}
        onSetZoomPosition={setZoomPosition}
        onSetZoomScale={setZoomScale}
      />
    )}
    </>
  );
};

export default NewProducts;

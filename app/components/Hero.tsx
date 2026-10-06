import React, { useState, useEffect } from "react";
import { Link } from "@remix-run/react";

interface HeroProps {
  mainImage?: string;
  secondaryImage?: string;
  title?: React.ReactNode;
  features?: string[];
  buttonText?: string;
}

const Hero: React.FC<HeroProps> = ({
  mainImage = "/_VPS5758.jpg", 
  secondaryImage = "/_VPS6328.jpg",
  title = (
    <>
      L'élégance est une attitude. Trouvez la
      <br />
      vôtre ici
    </>
  ),
  features = ["Matériaux durables", "Fabriqué au Togo", "Livraison rapide"],
  buttonText = "Voir la collection"
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    // Animation d'entrée après le montage du composant
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleImageLoad = () => {
    setImagesLoaded(true);
  };

  return (
    <section className="bg-adawi-beige-dark px-3 sm:px-4 md:px-6 py-12 sm:py-16 lg:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12 lg:gap-16 lg:pl-16 xl:pl-24">
        
        {/* Left Content */}
        <div className={`w-full lg:flex-1 text-center lg:text-left transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
        }`}>
          
          {/* Titre animé */}
          <div className="overflow-hidden mb-6 sm:mb-8">
            <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-black leading-tight transition-all duration-1200 ease-out ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}>
              <span className="inline-block">
                {title}
              </span>
            </h1>
          </div>

          {/* Features avec animation en cascade */}
          <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10 lg:mb-12">
            {features.map((feature, index) => (
              <li 
                key={index} 
                className={`flex items-center justify-center lg:justify-start text-black text-sm sm:text-base lg:text-lg transition-all duration-700 ease-out ${
                  isVisible 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 -translate-x-5'
                }`}
                style={{ 
                  transitionDelay: `${300 + index * 150}ms` 
                }}
              >
                <div className="relative mr-3 sm:mr-4">
                  <svg 
                    className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-adawi-gold transition-all duration-300" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  <div className="absolute inset-0 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 rounded-full bg-adawi-gold/20 scale-0 animate-ping"></div>
                </div>
                <span className="font-medium">{feature}</span>
              </li>
            ))}
          </ul>

          {/* Bouton CTA avec amélioration mobile */}
          <div className={`transition-all duration-1000 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: '800ms' }}>
            
            {/* Zone de touch élargie pour mobile */}
            <div className="inline-block p-2 sm:p-0">
              <Link 
                className="group relative inline-flex items-center justify-center bg-adawi-gold text-black font-semibold rounded-full transition-all duration-300 active:scale-95 
                          /* Tailles responsives optimisées pour le touch */
                          min-h-[48px] px-6 py-3 text-base
                          sm:min-h-[52px] sm:px-8 sm:py-4 sm:text-base
                          md:min-h-[56px] md:px-10 md:py-4 md:text-lg
                          lg:hover:bg-adawi-gold/90 lg:hover:scale-105 lg:hover:shadow-xl
                          /* Touch feedback pour mobile */
                          touch-manipulation select-none
                          /* Focus visible pour l'accessibilité */
                          focus:outline-none focus:ring-4 focus:ring-adawi-gold/30 focus:ring-offset-2"
                to="/boutique"
              >
                <span className="relative z-10 whitespace-nowrap">{buttonText}</span>
                
                {/* Effet de brillance au survol (desktop seulement) */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full lg:group-hover:translate-x-full transition-transform duration-700"></div>
                
                {/* Icône flèche animée */}
                <svg 
                  className="w-5 h-5 ml-3 transform lg:group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>

                {/* Indicateur de touch sur mobile */}
                <div className="absolute inset-0 rounded-full bg-black/5 opacity-0 group-active:opacity-100 transition-opacity duration-150 lg:hidden"></div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Images - Améliorées pour mobile */}
        <div className={`w-full lg:flex-1 flex justify-center lg:justify-end transition-all duration-1200 ease-out ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
        }`} style={{ transitionDelay: '400ms' }}>
          
          {/* Version mobile/tablette */}
          <div className="block lg:hidden relative w-full max-w-sm mx-auto">
            <div className="relative">
              <img
                src={mainImage}
                alt="Homme élégant en costume"
                className={`w-full h-auto object-cover rounded-2xl shadow-2xl transform transition-all duration-700 ${
                  imagesLoaded ? 'scale-100 rotate-0' : 'scale-95 rotate-1'
                }`}
                onLoad={handleImageLoad}
                loading="lazy"
              />
              
              {/* Image secondaire en overlay sur mobile */}
              <div className="absolute -bottom-4 -right-4 w-24 sm:w-32 md:w-40">
                <img
                  src={secondaryImage}
                  alt="Collection mode"
                  className={`w-full h-auto object-cover rounded-xl shadow-xl border-4 border-adawi-beige-dark transform transition-all duration-700 ${
                    imagesLoaded ? 'scale-100 rotate-0' : 'scale-90 -rotate-2'
                  }`}
                  style={{ transitionDelay: '300ms' }}
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Version desktop */}
          <div className="hidden lg:flex flex-1 justify-end pr-6 xl:pr-10">
            <div className="relative w-fit">
              {/* Image principale */}
              <div className="relative">
                <img
                  src={mainImage}
                  alt="Homme élégant en costume"
                  className={`rounded-2xl shadow-2xl max-w-[280px] xl:max-w-[360px] w-full h-auto object-cover transform transition-all duration-1000 hover:scale-105 hover:shadow-3xl ${
                    imagesLoaded ? 'scale-100 rotate-0' : 'scale-95 rotate-1'
                  }`}
                  onLoad={handleImageLoad}
                  loading="lazy"
                />
                
                {/* Effet de bordure dorée */}
                <div className="absolute inset-0 rounded-2xl border-2 border-adawi-gold/30 pointer-events-none"></div>
                
                {/* Particules flottantes */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-adawi-gold rounded-full animate-bounce opacity-70"></div>
                <div className="absolute top-1/4 -left-3 w-2 h-2 bg-adawi-gold/60 rounded-full animate-pulse"></div>
              </div>

              {/* Image secondaire */}
              <div className="absolute bottom-4 xl:bottom-5 right-0 translate-x-1/2 translate-y-1/4">
                <img
                  src={secondaryImage}
                  alt="Collection mode"
                  className={`rounded-xl shadow-xl max-w-[140px] xl:max-w-[180px] w-full h-auto object-cover border-4 border-adawi-beige-dark transform transition-all duration-1000 hover:scale-110 hover:rotate-3 ${
                    imagesLoaded ? 'scale-100 rotate-0' : 'scale-90 -rotate-2'
                  }`}
                  style={{ transitionDelay: '400ms' }}
                  loading="lazy"
                />
                
                {/* Effet de brillance */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Éléments décoratifs flottants */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-adawi-gold/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-adawi-gold/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      {/* CSS intégré pour les animations avancées */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
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
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Touch targets optimisés pour mobile */
        @media (max-width: 1023px) {
          /* Suppression des effets hover sur mobile */
          .group:hover .hero-hover-effect {
            transform: none !important;
          }
          
          /* Zone de touch élargie */
          .touch-target {
            padding: 8px;
            margin: -8px;
          }
          
          /* Feedback tactile amélioré */
          .mobile-button {
            -webkit-tap-highlight-color: rgba(212, 175, 55, 0.3);
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
          }
        }

        /* Effet de parallax léger (desktop uniquement) */
        @media (min-width: 1024px) and (hover: hover) {
          .hero-image {
            transition: transform 0.3s ease-out;
          }
          
          .hero-image:hover {
            transform: translateY(-5px) scale(1.02);
          }
        }

        /* Animation de révélation du texte */
        .reveal-text {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(212, 175, 55, 0.4),
            transparent
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        /* Effets pour les devices avec hover uniquement */
        @media (hover: hover) and (pointer: fine) {
          .feature-item:hover svg {
            transform: scale(1.2) rotate(10deg);
            color: #d4af37;
          }
        }

        /* Optimisations pour les très petits écrans */
        @media (max-width: 360px) {
          .hero-mobile {
            padding: 1.5rem 0.75rem;
          }
          
          .mobile-button {
            min-width: 280px;
            max-width: 90vw;
          }
        }

        /* Styles pour l'accessibilité */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Mode sombre */
        @media (prefers-color-scheme: dark) {
          .hero-content {
            color: #f3f4f6;
          }
          
          .hero-feature {
            color: #e5e7eb;
          }
        }

        /* Amélioration du focus pour la navigation au clavier */
        .focus\\:ring-4:focus {
          box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.3);
        }

        /* Prévention du zoom sur iOS lors du focus */
        @supports (-webkit-touch-callout: none) {
          input, button, select, textarea {
            font-size: 16px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
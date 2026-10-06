import { useState, useEffect } from "react";
import { useParams, Link } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import Newsletter from "~/components/Newsletter";
import ZoomModal from "~/components/blog/ZoomModal";

export const meta: MetaFunction = ({ params }) => {
  return [
    { title: `Article - Adawi` },
    {
      name: "description",
      content: "Découvrez cet article de mode et nos conseils vestimentaires.",
    },
  ];
};

interface BlogPostDetail {
  slug: string;
  title: string;
  body_html: string;
  meta_description?: string;
  meta_keywords?: string;
  status: string;
  id: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  author_name?: string | null;
  views_count?: number | null;
  cover_image?: string;
  excerpt?: string;
}

export default function BlogSlug() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // États pour le modal de zoom
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(true);

  const safeAuthorName = post?.author_name || "Adawi";
  const safeViewsCount = post?.views_count ?? 0;

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        const res = await fetch(`/api/blog/post/${slug}`);

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Article non trouvé (${res.status})`);
        }

        const data = await res.json();
        setPost(data.post);
        setTimeout(() => setIsVisible(true), 100);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement de l'article");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  // Progress bar reading
  useEffect(() => {
    const updateReadingProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', updateReadingProgress);
    return () => window.removeEventListener('scroll', updateReadingProgress);
  }, []);

  // Gestion du modal de zoom
  const openZoom = (imageSrc: string) => {
    setZoomedImage(imageSrc);
    setZoomScale(1);
    setZoomPosition({ x: 0, y: 0 });
    setShowControls(true);
  };

  const closeZoom = () => {
    setZoomedImage(null);
    setZoomScale(1);
    setZoomPosition({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoomScale(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleZoomReset = () => {
    setZoomScale(1);
    setZoomPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - zoomPosition.x,
        y: e.clientY - zoomPosition.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomScale > 1) {
      setZoomPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleControls = () => {
    setShowControls(prev => !prev);
  };

  const handleSetDragging = (dragging: boolean) => {
    setIsDragging(dragging);
  };

  const handleSetZoomPosition = (position: { x: number; y: number }) => {
    setZoomPosition(position);
  };

  // Gestion des événements clavier et molette pour le zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (zoomedImage) {
        if (e.key === 'Escape') {
          closeZoom();
        } else if (e.key === '+' || e.key === '=') {
          e.preventDefault();
          handleZoomIn();
        } else if (e.key === '-') {
          e.preventDefault();
          handleZoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          handleZoomReset();
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (zoomedImage) {
        e.preventDefault();
        if (e.deltaY < 0) {
          handleZoomIn();
        } else {
          handleZoomOut();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('wheel', handleWheel);
    };
  }, [zoomedImage, zoomScale]);

  // Ajouter les boutons loupe aux images après le rendu du contenu - amélioré pour mobile
  useEffect(() => {
    if (post && isVisible) {
      const images = document.querySelectorAll('.article-content img');

      images.forEach((img) => {
        const imgElement = img as HTMLImageElement;

        // Vérifier si le bouton loupe n'existe pas déjà
        if (imgElement.parentElement?.querySelector('.zoom-button')) {
          return;
        }

        // Créer un conteneur pour l'image et le bouton
        const container = document.createElement('div');
        container.className = 'image-zoom-container';
        container.style.position = 'relative';
        container.style.display = 'inline-block';
        container.style.width = '100%';

        // Insérer le conteneur avant l'image
        imgElement.parentNode?.insertBefore(container, imgElement);

        // Déplacer l'image dans le conteneur
        container.appendChild(imgElement);

        // Créer le bouton loupe
        const zoomButton = document.createElement('button');
        zoomButton.className = 'zoom-button';
        zoomButton.innerHTML = `
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
          </svg>
        `;
        zoomButton.title = 'Agrandir l\'image';
        zoomButton.setAttribute('aria-label', 'Agrandir l\'image');
        
        // Styles améliorés pour mobile
        zoomButton.style.cssText = `
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          border-radius: 50%;
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0.8;
          transition: all 0.3s ease;
          z-index: 10;
          backdrop-filter: blur(4px);
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        `;

        // Détection d'appareil tactile
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        if (!isTouchDevice) {
          // Comportement desktop : apparition au hover
          zoomButton.style.opacity = '0';
          
          container.addEventListener('mouseenter', () => {
            zoomButton.style.opacity = '1';
          });

          container.addEventListener('mouseleave', () => {
            zoomButton.style.opacity = '0';
          });
        }

        // Événements de clic améliorés pour mobile
        const handleZoomClick = (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          openZoom(imgElement.src);
        };

        zoomButton.addEventListener('click', handleZoomClick);
        zoomButton.addEventListener('touchend', handleZoomClick);

        // Ajouter le bouton au conteneur
        container.appendChild(zoomButton);

        // Rendre l'image elle-même cliquable pour zoomer
        imgElement.style.cursor = 'zoom-in';
        imgElement.style.touchAction = 'manipulation';
        
        const handleImageClick = (e: Event) => {
          e.preventDefault();
          openZoom(imgElement.src);
        };

        imgElement.addEventListener('click', handleImageClick);
        imgElement.addEventListener('touchend', handleImageClick);
      });
    }
  }, [post, isVisible]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <TopBanner />
        <Header />

        <div className="bg-adawi-beige-dark py-2 sm:py-4"></div>
        <div className="bg-gray-200 py-1 sm:py-2"></div>

        <main className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2 sm:w-1/3"></div>
            <div className="h-6 sm:h-8 bg-gray-200 rounded w-full sm:w-3/4"></div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 sm:w-1/2"></div>
            <div className="h-32 sm:h-48 md:h-64 bg-gray-200 rounded"></div>
            <div className="space-y-3 sm:space-y-4">
              <div className="h-3 sm:h-4 bg-gray-200 rounded"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-11/12 sm:w-5/6"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-5/6 sm:w-4/6"></div>
            </div>
          </div>
        </main>

        <Newsletter />
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white">
        <TopBanner />
        <Header />

        <div className="bg-adawi-beige-dark py-2 sm:py-4"></div>
        <div className="bg-gray-200 py-1 sm:py-2"></div>

        <main className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-12">
          <div className="text-center animate-fade-in-up">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
                Oups ! Article introuvable
              </h1>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 px-4">
                L'article que vous recherchez n'existe pas ou a été supprimé.
              </p>
            </div>

            <Link
              to="/blog"
              className="inline-flex items-center bg-adawi-gold text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-adawi-gold/90 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base"
            >
              ← Retour au blog
            </Link>
          </div>
        </main>

        <Newsletter />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div
          className="h-full bg-gradient-to-r from-adawi-gold to-yellow-500 transition-all duration-200 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <TopBanner />
      <Header />

      <div className="bg-adawi-beige-dark py-2 sm:py-4"></div>
      <div className="bg-gray-200 py-1 sm:py-2"></div>

      {/* Modal de zoom */}
      {zoomedImage && (
        <ZoomModal
          zoomedImage={zoomedImage}
          zoomScale={zoomScale}
          zoomPosition={zoomPosition}
          isDragging={isDragging}
          showControls={showControls}
          onClose={closeZoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onToggleControls={toggleControls}
          onSetDragging={handleSetDragging}
          onSetZoomPosition={handleSetZoomPosition}
        />
      )}

      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Breadcrumb */}
        <nav className={`mb-4 sm:mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} aria-label="Breadcrumb">
          <ol className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500 overflow-x-auto whitespace-nowrap pb-2">
            <li className="flex-shrink-0">
              <Link
                to="/"
                className="hover:text-adawi-gold transition-colors duration-200"
              >
                Accueil
              </Link>
            </li>
            <li className="text-gray-300 flex-shrink-0">/</li>
            <li className="flex-shrink-0">
              <Link
                to="/blog"
                className="hover:text-adawi-gold transition-colors duration-200"
              >
                Blog
              </Link>
            </li>
            <li className="text-gray-300 flex-shrink-0">/</li>
            <li className="text-gray-400 truncate">
              {post.title}
            </li>
          </ol>
        </nav>

        <article className={`bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl overflow-hidden border border-gray-100 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Article Header */}
          <header className="relative">
            {/* Image de couverture */}
            {post.cover_image && (
              <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden group rounded-t-xl">
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 rounded-t-xl"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent rounded-t-xl"></div>

                {/* Badge de statut */}
                <div className="absolute top-3 sm:top-6 right-3 sm:right-6 z-10">
                  <span className="bg-adawi-gold text-white px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-lg backdrop-blur-sm animate-fade-in">
                    {post.status === 'published' ? '✓ Publié' : ' Brouillon'}
                  </span>
                </div>

                {/* Overlay cliquable pour zoomer sur toute l'image */}
                <div
                  className="absolute inset-0 cursor-zoom-in rounded-t-xl"
                  onClick={() => openZoom(post.cover_image!)}
                  aria-label="Agrandir l'image"
                ></div>
              </div>
            )}

            {/* Contenu du header avec design moderne */}
            <div className={`${post.cover_image ? 'p-6 sm:p-8 md:p-10 lg:p-12 bg-white rounded-b-xl shadow-md -mt-6 max-w-4xl mx-auto' : 'p-4 sm:p-6 md:p-8 lg:p-12 pb-4 sm:pb-6 bg-gradient-to-br from-gray-50 to-white'}`}>
              <div>

                {/* Métadonnées avec icônes modernes - version plus responsive */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm mb-4 sm:mb-6 text-gray-700">
                  <div className="flex items-center group">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-adawi-gold to-yellow-500 rounded-full flex items-center justify-center mr-2 sm:mr-3 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <span className="text-white font-bold text-xs sm:text-sm md:text-base lg:text-lg">
                        {safeAuthorName.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <span className="font-semibold text-adawi-gold block text-xs sm:text-sm">
                        {safeAuthorName}
                      </span>
                      <span className="text-xs text-gray-500">
                        Auteur
                      </span>
                    </div>
                  </div>

                  {post.published_at && (
                    <div className="flex items-center bg-gray-100 rounded-full px-2 sm:px-3 py-1 sm:py-2">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-adawi-gold" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs sm:text-sm text-adawi-gold">
                        <span className="hidden sm:inline">{formatDate(post.published_at)}</span>
                        <span className="sm:hidden">{formatShortDate(post.published_at)}</span>
                      </span>
                    </div>
                  )}

                  <div className="flex items-center bg-gray-100 rounded-full px-2 sm:px-3 py-1 sm:py-2">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-adawi-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs sm:text-sm text-adawi-gold">
                      {safeViewsCount.toLocaleString()} vues
                    </span>
                  </div>
                </div>

                {/* Titre avec animation */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight mb-3 sm:mb-4 lg:mb-6 text-gray-900 transform hover:scale-[1.02] transition-transform duration-300 animate-slide-up">
                  {post.title}
                </h1>

                {/* Excerpt avec style élégant */}
                {(post.excerpt || post.meta_description) && (
                  <div className="relative animate-fade-in-delayed">
                    <p className="text-base sm:text-lg lg:text-xl leading-relaxed font-light text-gray-600 max-w-4xl">
                      {post.excerpt || post.meta_description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Contenu de l'article avec espacement amélioré */}
          <div className="p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 bg-white">
            {/* Séparateur décoratif si pas d'image de couverture */}
            {!post.cover_image && (
              <div className="flex items-center justify-center mb-6 sm:mb-8 lg:mb-12 animate-fade-in">
                <div className="h-px bg-gradient-to-r from-transparent via-adawi-gold to-transparent w-16 sm:w-24 lg:w-32"></div>
                <div className="mx-2 sm:mx-4 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-adawi-gold rounded-full"></div>
                <div className="h-px bg-gradient-to-r from-adawi-gold via-adawi-gold to-transparent w-16 sm:w-24 lg:w-32"></div>
              </div>
            )}

            {/* Zone de lecture avec focus */}
            <div className="article-content-wrapper max-w-4xl mx-auto animate-fade-in-up-delayed">
              <div
                className="article-content"
                dangerouslySetInnerHTML={{ __html: post.body_html }}
              />
            </div>

            {/* Mots-clés avec design moderne */}
            {post.meta_keywords && (
              <div className="mt-8 sm:mt-12 lg:mt-16 pt-6 sm:pt-8 lg:pt-12 border-t border-gray-100 animate-fade-in-up-delayed">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 lg:mb-6 flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-adawi-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  Mots-clés
                </h3>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {post.meta_keywords.split(',').map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center bg-gradient-to-r from-adawi-gold to-yellow-500 text-white text-xs sm:text-sm px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-full font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 animate-bounce-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      #{keyword.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Footer de l'article - version plus responsive */}
        <footer className={`mt-6 sm:mt-8 lg:mt-12 pt-4 sm:pt-6 lg:pt-8 border-t border-gray-200 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left w-full sm:w-auto order-2 sm:order-1">
              <p className="flex items-center justify-center sm:justify-start">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Dernière mise à jour : {formatShortDate(post.updated_at)}
              </p>
              <p className="mt-1 text-xs">
                Article créé le {formatShortDate(post.created_at)}
              </p>
            </div>

            <div className="flex flex-row gap-2 sm:gap-3 lg:gap-4 w-full sm:w-auto order-1 sm:order-2 justify-center sm:justify-end">
              <Link
                to="/blog"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center bg-adawi-gold text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-adawi-gold/90 transition-all duration-300 transform hover:scale-105 shadow-md text-xs sm:text-sm"
              >
                ← Retour au blog
              </Link>

              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center bg-gray-100 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-200 transition-all duration-300 text-xs sm:text-sm"
              >
                ↑ Haut de page
              </button>
            </div>
          </div>
        </footer>
      </main>

      <Newsletter />
      <Footer />

      {/* Styles CSS intégrés pour le contenu et les animations */}
      <style>{`
        /* === ANIMATIONS === */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }

        .animate-fade-in-delayed {
          animation: fadeIn 0.8s ease-out 0.3s both;
        }

        .animate-fade-in-up-delayed {
          animation: fadeInUp 1s ease-out 0.4s both;
        }

        .animate-slide-up {
          animation: slideUp 0.8s ease-out 0.2s both;
        }

        .animate-bounce-in {
          animation: bounceIn 0.6s ease-out both;
        }

        /* === STYLES POUR LE CONTENU DE L'ARTICLE === */
        .article-content-wrapper {
          max-width: none;
          line-height: 1.8;
          color: #374151;
          font-size: 1rem;
        }

        @media (min-width: 640px) {
          .article-content-wrapper {
            font-size: 1.1rem;
          }
        }

        .article-content * {
          max-width: 100%;
          word-wrap: break-word;
        }

        /* === STYLES POUR LES IMAGES AVEC BOUTON LOUPE === */
        .article-content img {
          max-width: 100%;
          height: auto;
          margin: 2rem auto;
          display: block;
          border-radius: 0.5rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        @media (min-width: 640px) {
          .article-content img {
            margin: 3rem auto;
            border-radius: 1rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          }
        }

        .article-content .image-zoom-container:hover img {
          transform: scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        /* Styles pour le conteneur d'image avec bouton zoom */
        .article-content .image-zoom-container {
          position: relative !important;
          display: inline-block !important;
          width: 100% !important;
          margin: 2rem auto !important;
        }

        @media (min-width: 640px) {
          .article-content .image-zoom-container {
            margin: 3rem auto !important;
          }
        }

        /* Animation hover pour le bouton loupe */
        .zoom-button:hover {
          background: rgba(212, 175, 55, 0.9) !important;
          transform: scale(1.1) !important;
        }

        /* Responsive pour le bouton loupe */
        @media (max-width: 640px) {
          .zoom-button {
            width: 2rem !important;
            height: 2rem !important;
            top: 0.5rem !important;
            right: 0.5rem !important;
          }
          
          .zoom-button svg {
            width: 1rem !important;
            height: 1rem !important;
          }
        }

        /* Affichage permanent du bouton sur mobile */
        @media (hover: none) and (pointer: coarse) {
          .zoom-button {
            opacity: 0.8 !important;
          }
        }

        /* Titres responsifs */
        .article-content h1,
        .article-content h2,
        .article-content h3,
        .article-content h4,
        .article-content h5,
        .article-content h6 {
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-weight: 700;
          line-height: 1.3;
          color: #111827;
        }

        @media (min-width: 640px) {
          .article-content h1,
          .article-content h2,
          .article-content h3,
          .article-content h4,
          .article-content h5,
          .article-content h6 {
            margin-top: 2.5rem;
            margin-bottom: 1.25rem;
          }
        }

        .article-content h1 {
          font-size: 1.75rem;
          border-bottom: 2px solid #d4af37;
          padding-bottom: 0.5rem;
          margin-bottom: 1.5rem;
        }

        @media (min-width: 640px) {
          .article-content h1 {
            font-size: 2.5rem;
            border-bottom: 3px solid #d4af37;
            margin-bottom: 2rem;
          }
        }

        .article-content h2 {
          font-size: 1.5rem;
          color: #1f2937;
          position: relative;
          padding-left: 1rem;
        }

        @media (min-width: 640px) {
          .article-content h2 {
            font-size: 2rem;
            padding-left: 0;
          }
        }

        .article-content h2::before {
          content: '';
          position: absolute;
          left: -0.5rem;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: linear-gradient(to bottom, #d4af37, #b8941f);
          border-radius: 2px;
        }

        @media (min-width: 640px) {
          .article-content h2::before {
            left: -1.5rem;
            width: 4px;
          }
        }

        .article-content h3 {
          font-size: 1.25rem;
          color: #374151;
        }

        @media (min-width: 640px) {
          .article-content h3 {
            font-size: 1.6rem;
          }
        }
          /* Améliorations pour les petits écrans mobiles */
@media (max-width: 360px) {
  .article-content h1 {
    font-size: 1.5rem;
  }
  
  .article-content h2 {
    font-size: 1.3rem;
  }
  
  .article-content p:first-of-type::first-letter {
    font-size: 2.5rem;
    line-height: 2rem;
  }
  
  .article-content blockquote {
    margin: 1.5rem -0.5rem;
    padding: 0.75rem;
  }
  
  .article-content blockquote::before {
    font-size: 2rem;
  }
}

/* Amélioration de l'affichage des images sur mobile */
@media (max-width: 640px) {
  .article-content .image-zoom-container {
    margin: 1.5rem auto !important;
  }
  
  /* Toujours afficher le bouton zoom sur mobile */
  .zoom-button {
    opacity: 0.8 !important;
    width: 2rem !important;
    height: 2rem !important;
  }
}

/* Amélioration de la navigation sur mobile */
@media (max-width: 480px) {
  .breadcrumb-item {
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

        .article-content h4 {
          font-size: 1.125rem;
          color: #4b5563;
        }

        @media (min-width: 640px) {
          .article-content h4 {
            font-size: 1.3rem;
          }
        }

        /* Paragraphes responsifs */
        .article-content p {
          margin-bottom: 1.25rem;
          line-height: 1.8;
          color: #374151;
          text-align: left;
        }

        @media (min-width: 640px) {
          .article-content p {
            margin-bottom: 1.75rem;
            text-align: justify;
          }
        }

        .article-content p:first-of-type {
          font-size: 1.1rem;
          color: #1f2937;
          font-weight: 400;
        }

        @media (min-width: 640px) {
          .article-content p:first-of-type {
            font-size: 1.2rem;
          }
        }

        .article-content p:first-of-type::first-letter {
          font-size: 3rem;
          font-weight: 700;
          float: left;
          line-height: 2.5rem;
          margin: 0.3rem 0.3rem 0 0;
          color: #d4af37;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }

        @media (min-width: 640px) {
          .article-content p:first-of-type::first-letter {
            font-size: 4rem;
            line-height: 3rem;
            margin: 0.5rem 0.5rem 0 0;
          }
        }

        /* Listes responsives */
        .article-content ul,
        .article-content ol {
          margin: 1.5rem 0;
          padding-left: 1.5rem;
        }

        @media (min-width: 640px) {
          .article-content ul,
          .article-content ol {
            margin: 2rem 0;
            padding-left: 2rem;
          }
        }

        .article-content ul {
          list-style: none;
        }

        .article-content ul li::before {
          content: '→';
          color: #d4af37;
          font-weight: bold;
          position: absolute;
          margin-left: -1.2rem;
        }

        @media (min-width: 640px) {
          .article-content ul li::before {
            margin-left: -1.5rem;
          }
        }

        .article-content ol li {
          counter-increment: list-counter;
        }

        .article-content ol {
          counter-reset: list-counter;
        }

        .article-content ol li::marker {
          color: #d4af37;
          font-weight: bold;
        }

        .article-content li {
          margin-bottom: 0.5rem;
          line-height: 1.7;
          position: relative;
        }

        @media (min-width: 640px) {
          .article-content li {
            margin-bottom: 0.75rem;
          }
        }

        /* Citations responsives */
        .article-content blockquote {
          margin: 2rem -1rem;
          padding: 1.5rem;
          border-left: 4px solid #d4af37;
          background: linear-gradient(135deg, #fefdf8 0%, #f9f7f0 100%);
          font-style: italic;
          color: #4b5563;
          border-radius: 0 0.5rem 0.5rem 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          position: relative;
        }

        @media (min-width: 640px) {
          .article-content blockquote {
            margin: 3rem 0;
            padding: 2rem;
            border-left: 5px solid #d4af37;
            border-radius: 0 1rem 1rem 0;
          }
        }

        .article-content blockquote::before {
          content: '"';
          font-size: 3rem;
          color: #d4af37;
          position: absolute;
          top: -0.5rem;
          left: 1rem;
          font-family: Georgia, serif;
        }

        @media (min-width: 640px) {
          .article-content blockquote::before {
            font-size: 4rem;
            top: -1rem;
          }
        }

        .article-content blockquote p {
          margin-bottom: 0;
          font-size: 1rem;
          position: relative;
          z-index: 1;
        }

        @media (min-width: 640px) {
          .article-content blockquote p {
            font-size: 1.1rem;
          }
        }

        /* Liens avec animation */
        .article-content a {
          color: #d4af37;
          text-decoration: none;
          position: relative;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .article-content a::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -2px;
          left: 0;
          background: linear-gradient(90deg, #d4af37, #b8941f);
          transition: width 0.3s ease;
        }

        .article-content a:hover::after {
          width: 100%;
        }

        .article-content a:hover {
          color: #b8941f;
        }

        /* Code responsif */
        .article-content code {
          background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
          padding: 0.2rem 0.4rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          color: #dc2626;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          border: 1px solid #e5e7eb;
        }

        @media (min-width: 640px) {
          .article-content code {
            padding: 0.25rem 0.6rem;
            border-radius: 0.5rem;
            font-size: 0.9rem;
          }
        }

        .article-content pre {
          background: linear-gradient(135deg, #1f2937, #111827);
          color: #f9fafb;
          padding: 1.5rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem -1rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          border: 1px solid #374151;
        }

        @media (min-width: 640px) {
          .article-content pre {
            padding: 2rem;
            border-radius: 1rem;
            margin: 2rem 0;
          }
        }

        .article-content pre code {
          background: none;
          padding: 0;
          color: inherit;
          border: none;
        }

        /* Tableaux responsifs */
        .article-content table {
          width: 100%;
          margin: 1.5rem 0;
          border-collapse: collapse;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border-radius: 0.5rem;
          overflow: hidden;
          font-size: 0.875rem;
        }

        @media (min-width: 640px) {
          .article-content table {
            margin: 2rem 0;
            font-size: 1rem;
          }
        }

        .article-content th,
        .article-content td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }

        @media (min-width: 640px) {
          .article-content th,
          .article-content td {
            padding: 1rem;
          }
        }

        .article-content th {
          background: linear-gradient(135deg, #d4af37, #b8941f);
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
        }

        @media (min-width: 640px) {
          .article-content th {
            font-size: 1rem;
          }
        }

        .article-content tr:nth-child(even) {
          background-color: #f9fafb;
        }

        .article-content tr:hover {
          background-color: #f3f4f6;
        }

        /* Séparateurs */
        .article-content hr {
          margin: 2rem auto;
          border: none;
          height: 2px;
          background: linear-gradient(to right, transparent, #d4af37, transparent);
          width: 50%;
        }

        @media (min-width: 640px) {
          .article-content hr {
            margin: 3rem auto;
          }
        }

        /* Éléments strong et em */
        .article-content strong {
          color: #1f2937;
          font-weight: 700;
        }

        .article-content em {
          color: #4b5563;
          font-style: italic;
        }

        /* Divs et sections */
        .article-content div,
        .article-content section {
          margin-bottom: 1rem;
        }

        @media (min-width: 640px) {
          .article-content div,
          .article-content section {
            margin-bottom: 1.5rem;
          }
        }

        /* Animation d'apparition */
        .article-content {
          animation: fadeInUp 0.8s ease-out;
        }

        /* Améliorations pour mobile */
        @media (max-width: 640px) {
          .article-content {
            font-size: 1rem;
            line-height: 1.7;
          }
          
          .article-content h1 {
            font-size: 1.75rem;
            margin-top: 1rem;
          }
          
          .article-content h2 {
            font-size: 1.5rem;
            margin-top: 1.5rem;
          }
          
          .article-content h3 {
            font-size: 1.25rem;
          }
          
          .article-content p:first-of-type::first-letter {
            font-size: 3rem;
            line-height: 2.5rem;
            margin: 0.2rem 0.3rem 0 0;
          }
          
          .article-content blockquote {
            margin: 1.5rem -0.75rem;
            padding: 1rem;
            font-size: 0.95rem;
          }
          
          .article-content blockquote::before {
            font-size: 2.5rem;
            top: -0.3rem;
            left: 0.5rem;
          }
          
          .article-content img {
            margin: 1.5rem auto;
            border-radius: 0.5rem;
          }
          
          .article-content pre {
            margin: 1rem -0.75rem;
            padding: 1rem;
            border-radius: 0;
            font-size: 0.875rem;
          }
          
          .article-content table {
            font-size: 0.8rem;
            overflow-x: auto;
            display: block;
            white-space: nowrap;
          }
          
          .article-content th,
          .article-content td {
            padding: 0.5rem;
          }
        }

        /* Améliorations pour tablettes */
        @media (min-width: 641px) and (max-width: 1024px) {
          .article-content {
            font-size: 1.05rem;
          }
          
          .article-content h1 {
            font-size: 2.25rem;
          }
          
          .article-content h2 {
            font-size: 1.875rem;
          }
          
          .article-content h3 {
            font-size: 1.5rem;
          }
          
          .article-content p:first-of-type {
            font-size: 1.15rem;
          }
          
          .article-content p:first-of-type::first-letter {
            font-size: 3.5rem;
            line-height: 2.75rem;
          }
        }

        /* Styles pour l'impression */
        @media print {
          .article-content {
            color: black !important;
            font-size: 12pt;
            line-height: 1.6;
          }
          
          .article-content a {
            color: black !important;
            text-decoration: underline !important;
          }
          
          .article-content img {
            max-width: 100% !important;
            box-shadow: none !important;
            break-inside: avoid;
          }
          
          .article-content blockquote {
            border-left: 3px solid black !important;
            background: white !important;
            break-inside: avoid;
          }
          
          .article-content pre {
            background: white !important;
            border: 1px solid black !important;
            color: black !important;
            break-inside: avoid;
          }
          
          .article-content h1,
          .article-content h2,
          .article-content h3,
          .article-content h4 {
            break-after: avoid;
            color: black !important;
          }
        }

        /* Améliorations pour l'accessibilité */
        @media (prefers-reduced-motion: reduce) {
          .article-content,
          .animate-fade-in,
          .animate-fade-in-up,
          .animate-fade-in-delayed,
          .animate-fade-in-up-delayed,
          .animate-slide-up,
          .animate-bounce-in {
            animation: none;
          }
          
          .article-content img:hover,
          .article-content a {
            transform: none;
            transition: none;
          }
        }

        /* Mode sombre (si activé par l'utilisateur) */
        @media (prefers-color-scheme: dark) {
          .article-content {
            color: #e5e7eb;
          }
          
          .article-content h1,
          .article-content h2,
          .article-content h3,
          .article-content h4 {
            color: #f9fafb;
          }
          
          .article-content p {
            color: #d1d5db;
          }
          
          .article-content blockquote {
            background: linear-gradient(135deg, #374151, #4b5563);
            color: #e5e7eb;
            border-left-color: #d4af37;
          }
          
          .article-content code {
            background: #374151;
            color: #fbbf24;
            border-color: #6b7280;
          }
        }

        /* Focus states pour l'accessibilité */
        .article-content a:focus,
        .article-content img:focus {
          outline: 2px solid #d4af37;
          outline-offset: 2px;
          border-radius: 2px;
        }

        /* Amélioration de la lisibilité */
        .article-content {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        /* Espacement cohérent pour tous les éléments */
        .article-content > * + * {
          margin-top: 1rem;
        }

        @media (min-width: 640px) {
          .article-content > * + * {
            margin-top: 1.5rem;
          }
        }

        /* Animation au scroll pour les éléments */
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
          /* Améliorations pour les appareils tactiles */
@media (hover: none) and (pointer: coarse) {
  /* Bouton loupe toujours visible sur mobile */
  .zoom-button {
    opacity: 0.8 !important;
  }
  
  /* Amélioration de la zone tactile */
  .zoom-button {
    min-width: 44px !important;
    min-height: 44px !important;
    width: 2.75rem !important;
    height: 2.75rem !important;
  }
  
  /* Suppression des effets hover sur mobile */
  .zoom-button:hover {
    transform: none !important;
    background: rgba(0, 0, 0, 0.7) !important;
  }
  
  /* Images plus facilement cliquables sur mobile */
  .article-content img {
    cursor: zoom-in;
    touch-action: manipulation;
  }
  
  /* Amélioration du bouton sur l'image de couverture */
  .group .opacity-80 {
    opacity: 0.9 !important;
  }
}

/* Suppression du highlight tactile sur tous les navigateurs */
* {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Permettre la sélection de texte dans le contenu */
.article-content,
.article-content p,
.article-content h1,
.article-content h2,
.article-content h3,
.article-content h4,
.article-content h5,
.article-content h6 {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}

/* Amélioration des boutons tactiles */
button {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* Zone tactile minimale recommandée (44px) */
@media (max-width: 640px) {
  .zoom-button {
    min-width: 44px !important;
    min-height: 44px !important;
    width: 2.75rem !important;
    height: 2.75rem !important;
    top: 0.75rem !important;
    right: 0.75rem !important;
  }
  
  .zoom-button svg {
    width: 1.25rem !important;
    height: 1.25rem !important;
  }
}

/* Amélioration de l'accessibilité tactile */
@media (max-width: 480px) {
  .image-zoom-container {
    position: relative;
    touch-action: manipulation;
  }
  
  .article-content img {
    border-radius: 0.75rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
}

        /* Effet parallax léger sur les images */
        @media (min-width: 1024px) {
          .article-content img {
            transition: transform 0.6s ease-out;
          }
          
          .article-content img:hover {
            transform: translateY(-5px) scale(1.02);
          }
        }

        /* Protection contre le débordement */
        .article-content img {
          will-change: transform;
          backface-visibility: hidden;
        }

        /* Optimisation des performances */
        .article-content {
          will-change: transform;
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}
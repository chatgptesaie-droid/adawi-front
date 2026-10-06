import { Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import type { BlogPost } from "~/routes/blog";

interface BlogGridProps {
  posts: BlogPost[];
}

export default function BlogGrid({ posts }: BlogGridProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredPost, setHoveredPost] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  // Animation de chargement initial
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const handleImageLoad = (postId: string) => {
    setLoadedImages(prev => new Set(prev).add(postId));
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    target.src = '/placeholder-blog.jpg'; // Image de fallback
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Date inconnue";
    }
  };

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="animate-pulse">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-800 mb-2">Aucun article disponible</h3>
        <p className="text-gray-600">Revenez bientôt pour découvrir nos derniers contenus !</p>
      </div>
    );
  }

  return (
    <>
      {/* Grid responsive avec breakpoints optimisés */}
      <div className="grid grid-cols-2 xs:grid-cols-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-12">
        {posts.map((post, index) => {
          const isImageLoaded = loadedImages.has(post.id);
          const isHovered = hoveredPost === post.id;
          
          return (
            <article 
              key={post.id} 
              className={`group cursor-pointer transform transition-all duration-500 hover:scale-[1.02] ${
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
              style={{ 
                transitionDelay: `${index * 50}ms`,
                animationDelay: `${index * 50}ms`
              }}
              onMouseEnter={() => setHoveredPost(post.id)}
              onMouseLeave={() => setHoveredPost(null)}
            >
              <Link 
                to={`/blog/${post.slug}`}
                className="block h-full"
              >
                {/* Container avec effet de parallaxe subtil */}
                <div className={`relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col ${
                  isHovered ? 'shadow-2xl' : ''
                }`}>
                  
                  {/* Image avec overlay et effets */}
                  <div className="relative aspect-[4/3] sm:aspect-[3/4] md:aspect-[4/5] overflow-hidden bg-gray-100">
                    {/* Skeleton loader pendant le chargement */}
                    {!isImageLoaded && (
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                      </div>
                    )}
                    
                    {/* Image principale */}
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      loading="lazy"
                      onLoad={() => handleImageLoad(post.id)}
                      onError={handleImageError}
                      className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                        isImageLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                    
                    {/* Overlay gradient au hover */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    }`} />
                    
                    {/* Bouton de lecture en overlay */}
                    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                      isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                    }`}>
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-110">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-adawi-gold ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                    
                    {/* Badge catégorie (si disponible) */}
                    {post.category && (
                      <div className="absolute top-3 left-3">
                        <span className="inline-block bg-adawi-gold/90 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
                          {post.category}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Contenu texte */}
                  <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between">
                    <div className="space-y-2 sm:space-y-3">
                      {/* Titre avec animation au hover */}
                      <h3 className={`text-sm sm:text-base lg:text-lg font-medium text-black leading-tight line-clamp-2 sm:line-clamp-3 transition-all duration-300 ${
                        isHovered ? 'text-adawi-gold transform translate-x-1' : 'group-hover:text-adawi-gold'
                      }`}>
                        {post.title}
                      </h3>
                      
                      {/* Extrait (si disponible) */}
                      {post.excerpt && (
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 transition-colors duration-300 group-hover:text-gray-700">
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                    
                    {/* Footer avec date et temps de lecture */}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-adawi-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <time className="text-xs sm:text-sm text-adawi-gold font-medium">
                          {formatDate(post.published_at)}
                        </time>
                      </div>
                      
                      {/* Indicateur de lecture */}
                      <div className="flex items-center space-x-1">
                        {/* <span className="text-xs text-gray-400">
                          {post.read_time || '5min'} 
                        </span> */}
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Barre de progression au bas de la carte */}
                  <div className="h-1 bg-gray-100">
                    <div 
                      className={`h-full bg-gradient-to-r from-adawi-gold to-yellow-400 transform origin-left transition-transform duration-500 ${
                        isHovered ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    />
                  </div>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
      
      {/* Bouton "Voir plus" si nécessaire */}
      {posts.length >= 12 && (
        <div className={`text-center transform transition-all duration-700 ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`} style={{ transitionDelay: `${posts.length * 50 + 200}ms` }}>
          <button className="group inline-flex items-center space-x-2 bg-white border-2 border-adawi-gold text-adawi-gold px-6 py-3 rounded-full hover:bg-adawi-gold hover:text-white transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
            <span className="font-medium">Voir plus d'articles</span>
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
      
      {/* CSS personnalisé pour les animations */}
      <style >{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shimmer {
          animation: shimmer 1.5s ease-in-out infinite;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Responsive breakpoint pour xs */
        @media (min-width: 475px) {
          .xs\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </>
  );
}
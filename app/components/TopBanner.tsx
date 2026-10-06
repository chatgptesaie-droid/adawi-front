import React, { useState } from "react";
import { usePromotion } from "~/hooks/usePromotion";

const TopBanner: React.FC = () => {
  const { promotion, loading } = usePromotion();
  const [direction, setDirection] = useState<'left' | 'right'>('left'); // Changé par défaut vers la gauche
  
  // Debug complet
  console.log("TopBanner - Hook state:", { promotion, loading });

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-center py-2 text-sm overflow-hidden">
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  const getMessage = () => {
    console.log("getMessage - promotion:", promotion);

    if (promotion) {
      const endDate = new Date(promotion.end_date);
      const now = new Date();
      const diffTime = endDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      console.log("Date calculation:", {
        endDate: promotion.end_date,
        endDateParsed: endDate,
        now,
        diffTime,
        daysLeft
      });

      if (daysLeft > 1) {
        return `${promotion.description} -${promotion.discount_percentage}% - Plus que ${daysLeft} jours !`;
      } else if (daysLeft === 1) {
        return `${promotion.description} -${promotion.discount_percentage}% - Dernière chance !`;
      } else if (daysLeft === 0) {
        return `${promotion.description} -${promotion.discount_percentage}% - Dernières heures !`;
      } else {
        return `${promotion.description} -${promotion.discount_percentage}% (Expirée)`;
      }
    }

    console.log("Using fallback message");
    return "Soyez les bienvenus sur notre boutique ! Nous espérons que vous trouverez votre bonheur parmi notre large gamme de produits.";
  };

  const message = getMessage();

  const toggleDirection = () => {
    setDirection(prev => prev === 'right' ? 'left' : 'right');
  };

  return (
    <div className="bg-gradient-to-r from-white to-white text-red-600 py-3 text-sm overflow-hidden relative shadow-lg">
      <style>{`
        @keyframes scroll-right {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes scroll-left {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
       
        .scrolling-text-right {
          animation: scroll-right 15s linear infinite;
          white-space: nowrap;
          display: inline-block;
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        .scrolling-text-left {
          animation: scroll-left 15s linear infinite;
          white-space: nowrap;
          display: inline-block;
          font-weight: 500;
          letter-spacing: 0.5px;
        }
       
        .banner-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          cursor: pointer;
        }
        
        .banner-container:hover .scrolling-text-right,
        .banner-container:hover .scrolling-text-left {
          animation-play-state: paused;
        }

        /* Effet de transition fluide entre les directions */
        .scrolling-text-right,
        .scrolling-text-left {
          transition: animation-direction 0.3s ease;
        }

        /* Indicateur de direction */
        .direction-indicator {
          position: absolute;
          top: 2px;
          right: 8px;
          font-size: 10px;
          color: rgba(239, 68, 68, 0.6);
          pointer-events: none;
          z-index: 10;
        }

        /* Effet hover sur tout le banner */
        .banner-container:hover {
          background: linear-gradient(to right, #fef3f2, #fef2f2);
        }

        /* Animation de pulse pour attirer l'attention */
        @keyframes gentle-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        .banner-container:not(:hover) {
          animation: gentle-pulse 4s ease-in-out infinite;
        }
      `}</style>
      
      {/* Indicateur de direction */}
      <div className="direction-indicator">
        {direction === 'right' ? '→' : '←'}
      </div>

      <div className="banner-container" onClick={toggleDirection} title="Cliquez pour changer la direction">
        <div className={direction === 'right' ? 'scrolling-text-right' : 'scrolling-text-left'}>
          {message} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {message}
        </div>
      </div>
    </div>
  );
};

export default TopBanner;
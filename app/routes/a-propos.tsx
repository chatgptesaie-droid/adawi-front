import type { MetaFunction } from "@remix-run/node";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Services from "~/components/Services";
import Footer from "~/components/Footer";
import { useState, useEffect } from "react";
import { Sparkles, Heart, Star, Users, Award, Shirt } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "À propos - Adawi" },
    { name: "description", content: "Découvrez l'univers Adawi, bien plus qu'une simple boutique de vêtements." },
  ];
};

export default function APropos() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSection(prev => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Shirt className="w-8 h-8" />,
      title: "Collections tendances",
      description: "Soigneusement sélectionnées"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Qualité irréprochable",
      description: "À des prix accessibles"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Accompagnement personnalisé",
      description: "Pour la tenue parfaite"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />
     
      {/* Hero Section avec image de boutique */}
      <section className="relative h-[500px] overflow-hidden group">
        <img
          src="/image.png"
          alt="Intérieur moderne de la boutique Adawi avec vêtements suspendus, éclairage design et comptoir central"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className={`text-white text-4xl md:text-5xl font-light mb-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              Bienvenue chez <span className="text-adawi-gold font-bold">Adawi</span>
            </h1>
            <div className={`flex items-center justify-center space-x-2 text-white/90 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <Sparkles className="w-5 h-5 text-adawi-gold animate-pulse" />
              <span className="text-lg">Votre style commence ici</span>
              <Sparkles className="w-5 h-5 text-adawi-gold animate-pulse" />
            </div>
          </div>
        </div>
        
        {/* Effet de particules flottantes */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-adawi-gold rounded-full opacity-30 animate-bounce"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${2 + i * 0.3}s`
              }}
            />
          ))}
        </div>
      </section>

      {/* Section features animée */}
      <section className="bg-adawi-beige px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className={`text-center group transition-all duration-700 delay-${idx * 200} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-6">
                  <div className="text-adawi-gold group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-black mb-2 group-hover:text-adawi-gold transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-black/80 group-hover:text-black transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section descriptive modernisée */}
      <section className="bg-white px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-2xl md:text-3xl font-bold text-black mb-12 leading-tight text-center">
              Bien plus qu'une simple boutique de vêtements,{" "}
              <span className="text-adawi-gold relative">
                un univers
                <div className="absolute -bottom-1 left-0 w-full h-1 bg-adawi-gold/30 rounded-full"></div>
              </span>{" "}
              où la mode, l'élégance et l'originalité se rencontrent
            </h2>
          </div>
         
          <div className={`space-y-8 text-black text-base leading-relaxed transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-adawi-beige/30 rounded-2xl p-8 border-l-4 border-adawi-gold hover:bg-adawi-beige/50 transition-all duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-md">
              <p className="text-lg">
                Fondée avec passion, <span className="font-semibold text-adawi-gold">Adawi</span> est née du désir d'offrir des tenues qui mettent en valeur toutes les personnalités. Que vous soyez à la recherche d'un look chic, décontracté ou audacieux, notre sélection de vêtements a été pensée pour répondre à tous les styles et toutes les occasions.
              </p>
            </div>
           
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <p className="text-lg mb-6 font-medium text-black">Nous mettons un point d'honneur à proposer :</p>
             
              <ul className="space-y-4">
                {[
                  "des collections tendances et soigneusement sélectionnées",
                  "une qualité irréprochable à des prix accessibles", 
                  "un accompagnement personnalisé pour vous aider à trouver la tenue parfaite"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start group">
                    <div className="w-6 h-6 bg-adawi-gold rounded-full flex items-center justify-center mr-4 mt-0.5 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span className="group-hover:text-adawi-gold transition-colors duration-300">
                      {item} {idx === 0 && <span className="text-adawi-gold">;</span>}
                      {idx === 1 && <span className="text-adawi-gold">;</span>}
                      {idx === 2 && <span className="text-adawi-gold">.</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
           
            <div className="bg-gradient-to-r from-adawi-beige/40 to-adawi-gold/10 rounded-2xl p-8 border border-adawi-gold/20 hover:border-adawi-gold/40 transition-all duration-300 transform hover:-translate-y-1">
              <p className="text-lg mb-4">
                Notre boutique, c'est aussi un <span className="font-semibold text-adawi-gold">espace chaleureux et accueillant</span> où chaque client(e) est reçu(e) avec attention, car votre style est unique, et nous sommes là pour le sublimer.
              </p>
            </div>

            <div className="text-center bg-black rounded-2xl p-8 text-white hover:bg-gray-900 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-adawi-gold mr-2 animate-pulse" />
                <Star className="w-6 h-6 text-adawi-gold animate-pulse" style={{ animationDelay: '0.5s' }} />
                <Heart className="w-6 h-6 text-adawi-gold ml-2 animate-pulse" style={{ animationDelay: '1s' }} />
              </div>
              <p className="text-xl mb-2">
                Merci de faire partie de l'aventure <span className="text-adawi-gold font-bold">Adawi</span>. 
              </p>
              <p className="text-lg text-adawi-gold font-semibold">
                Votre style commence ici.
              </p>
            </div>
          </div>
        </div>
      </section>
     
      <Services />

      {/* Section image des vêtements avec overlay */}
      <section className="bg-white relative group">
        <div className="w-full h-[400px] md:h-[500px] overflow-hidden relative">
          <img
            src="/africaine.png"
            alt="Collection de vêtements colorés suspendus sur cintres dans un dressing moderne"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-12">
            <div className="text-center text-white transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
              <h3 className="text-2xl font-bold mb-2">Notre Collection</h3>
              <p className="text-lg text-white/90">Des styles pour toutes les occasions</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Floating elements décoratifs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute opacity-5"
            style={{
              left: `${10 + i * 20}%`,
              top: `${20 + i * 15}%`,
              animationDelay: `${i * 1.5}s`
            }}
          >
            <div className="w-12 h-12 border-2 border-adawi-gold rounded-full animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Animation de défilement pour les éléments */}
      <style >{`
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
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
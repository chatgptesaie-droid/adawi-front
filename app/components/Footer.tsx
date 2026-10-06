import { useState } from "react";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight, Heart, Clock } from "lucide-react";

const socialLinks = [
  { icon: Facebook, url: "https://facebook.com", name: "Facebook", color: "hover:bg-blue-600" },
  { icon: Twitter, url: "https://twitter.com", name: "Twitter", color: "hover:bg-sky-500" },
  { icon: Linkedin, url: "https://Linkedin.com", name: "Linkedin", color: "hover:bg-gray-800" },
  { icon: Instagram, url: "https://instagram.com", name: "Instagram", color: "hover:bg-pink-600" },
];

export default function Footer() {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const navLinks = {
    commander: [
      { name: "Homme", href: "/boutique" },
      { name: "Femme", href: "/boutique" },
      { name: "Enfants", href: "/boutique" },
      { name: "Couple", href: "/boutique" },
    ],
    informations: [
      { name: "À propos", href: "/A-propos" },
      { name: "Blog", href: "/blog" },
      { name: "Services", href: "/services" },
      { name: "Notre équipe", href: "/equipe" },
      { name: "Contact", href: "/contact" },
    ],
    aide: [
      { name: "FAQ", href: "/faq" },
      // { name: "Livraison", href: "/livraison" },
      { name: "Retours", href: "/retour" },
      { name: "Guide des tailles", href: "/guide-tailles" },
      { name: "Support", href: "/support" },
    ]
  };

  // Fonction pour déterminer si nous sommes ouvert maintenant
  const isCurrentlyOpen = () => {
    const now = new Date();
    const day = now.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
    const hour = now.getHours();
    
    // Fermé le dimanche (jour 0)
    if (day === 0) return false;
    
    // Ouvert de 8h à 19h du lundi au samedi
    return hour >= 8 && hour < 19;
  };

  const currentlyOpen = isCurrentlyOpen();

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float-gentle {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
          }
          
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          @keyframes pulse-soft {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          @keyframes pulse-status {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
          }
          
          .animate-float-gentle {
            animation: float-gentle 3s ease-in-out infinite;
          }
          
          .animate-fade-in-up {
            animation: fade-in-up 0.6s ease-out both;
          }
          
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient-shift 4s ease infinite;
          }
          
          .animate-pulse-soft {
            animation: pulse-soft 2s ease-in-out infinite;
          }
          
          .animate-pulse-status {
            animation: pulse-status 2s ease-in-out infinite;
          }
          
          .link-hover-effect {
            position: relative;
            transition: all 0.3s ease;
          }
          
          .link-hover-effect::before {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 0;
            height: 2px;
            background: linear-gradient(90deg, #f59e0b, #d97706);
            transition: width 0.3s ease;
          }
          
          .link-hover-effect:hover::before {
            width: 100%;
          }
          
          .social-icon {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .social-icon:hover {
            transform: translateY(-3px) scale(1.1);
          }
          
          .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            display: inline-block;
            margin-right: 8px;
          }
          
          .status-open {
            background-color: #10b981;
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
          }
          
          .status-closed {
            background-color: #ef4444;
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
          }
        `
      }} />
      
      <footer className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white overflow-hidden">
        {/* Éléments décoratifs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-16 left-8 w-28 h-28 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-2xl animate-float-gentle"></div>
          <div className="absolute bottom-16 right-16 w-24 h-24 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-xl animate-float-gentle" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="max-w-6xl mx-auto">
            
            {/* Section principale */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8 mb-10">
              
              {/* Logo + Coordonnées */}
              <div className="lg:col-span-1 animate-fade-in-up">
                <div className="mb-6">
                  <div className="relative group mb-4 w-28">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                    <div className="relative bg-white p-3 rounded-xl shadow-lg transform group-hover:scale-105 transition-all duration-300">
                      <img src="/ADAWI _ LOGO FOND BLANC.png" alt="Logo Adawi" />
                    </div>
                  </div>

                  {/* Coordonnées avec animations de hover */}
                  <div className="space-y-3 text-sm mb-6">
                    <div className="flex items-center space-x-2 group">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-gray-300 group-hover:text-white transition-colors duration-300">Carrefour Bodiona</p>
                    </div>
                    <div className="flex items-center space-x-2 group">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Mail className="w-4 h-4 text-white" />
                      </div>
                      <a href="mailto:Adawi10@gmail.com" className="text-gray-300 hover:text-white transition-colors duration-300">Adawi10@gmail.com</a>
                    </div>
                    <div className="flex items-center space-x-2 group">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Phone className="w-4 h-4 text-white" />
                      </div>
                      <a href="tel:+22890000000" className="text-gray-300 hover:text-white transition-colors duration-300">+228 90 00 00 00</a>
                    </div>
                  </div>
                </div>

                {/* Réseaux sociaux avec tooltips */}
                <div className="flex space-x-3">
                  {socialLinks.map(({ icon: Icon, url, name, color }, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`social-icon group relative w-9 h-9 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg flex items-center justify-center ${color} transition-all duration-300 hover:shadow-xl`}
                      aria-label={name}
                    >
                      <Icon className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        {name}
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Colonne Commander */}
              <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <h3 className="text-lg font-semibold mb-4 capitalize relative">
                  <span className="relative z-10">Commander</span>
                  <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-500"></div>
                </h3>
                <ul className="space-y-2 text-sm">
                  {navLinks.commander.map((link, idx) => (
                    <li key={idx}>
                      <a
                        href={link.href}
                        className="link-hover-effect text-gray-300 hover:text-white hover:translate-x-2 inline-flex items-center group transition-all duration-300"
                        onMouseEnter={() => setHoveredLink(`commander-${idx}`)}
                        onMouseLeave={() => setHoveredLink(null)}
                      >
                        <ArrowRight className={`w-4 h-4 mr-2 transition-all duration-300 ${hoveredLink === `commander-${idx}` ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Colonne Horaires d'ouverture */}
              <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <h3 className="text-lg font-semibold mb-4 relative">
                  <span className="relative z-10">Horaires</span>
                  <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-orange-400 to-red-500"></div>
                </h3>
                
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="text-sm font-semibold text-white">Nos horaires</h4>
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-300">
                    <div className="flex justify-between items-center">
                      <span>Lundi - Samedi</span>
                      <span className="font-medium text-white">8h - 19h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Dimanche</span>
                      <span className="font-medium text-red-400">Fermé</span>
                    </div>
                  </div>
                  
                  {/* Statut actuel */}
                  <div className={`mt-3 pt-3 border-t border-white/10 flex items-center text-xs font-medium ${
                    currentlyOpen ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <span className={`status-dot ${currentlyOpen ? 'status-open animate-pulse-status' : 'status-closed'}`}></span>
                    {currentlyOpen ? 'Actuellement ouvert' : 'Actuellement fermé'}
                  </div>
                </div>
              </div>

              {/* Colonne Informations */}
              <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <h3 className="text-lg font-semibold mb-4 capitalize relative">
                  <span className="relative z-10">Informations</span>
                  <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-green-400 to-blue-500"></div>
                </h3>
                <ul className="space-y-2 text-sm">
                  {navLinks.informations.map((link, idx) => (
                    <li key={idx}>
                      <a
                        href={link.href}
                        className="link-hover-effect text-gray-300 hover:text-white hover:translate-x-2 inline-flex items-center group transition-all duration-300"
                        onMouseEnter={() => setHoveredLink(`informations-${idx}`)}
                        onMouseLeave={() => setHoveredLink(null)}
                      >
                        <ArrowRight className={`w-4 h-4 mr-2 transition-all duration-300 ${hoveredLink === `informations-${idx}` ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Colonne Aide */}
              <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <h3 className="text-lg font-semibold mb-4 capitalize relative">
                  <span className="relative z-10">Aide</span>
                  <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-purple-400 to-pink-500"></div>
                </h3>
                <ul className="space-y-2 text-sm">
                  {navLinks.aide.map((link, idx) => (
                    <li key={idx}>
                      <a
                        href={link.href}
                        className="link-hover-effect text-gray-300 hover:text-white hover:translate-x-2 inline-flex items-center group transition-all duration-300"
                        onMouseEnter={() => setHoveredLink(`aide-${idx}`)}
                        onMouseLeave={() => setHoveredLink(null)}
                      >
                        <ArrowRight className={`w-4 h-4 mr-2 transition-all duration-300 ${hoveredLink === `aide-${idx}` ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
import type { MetaFunction } from "@remix-run/node";
import { useState } from "react";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import { User, UserRound, Ruler, Circle, Square, Footprints } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Guide des Tailles - Adawi" },
    { name: "description", content: "Trouvez votre taille parfaite avec notre guide des tailles détaillé. Conseils et tableaux de correspondance pour tous nos vêtements." },
  ];
};

export default function GuideTailles() {
  const [activeCategory, setActiveCategory] = useState<string>('femme');
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const categories = [
    { id: 'femme', name: 'Femme', icon: UserRound },
    { id: 'homme', name: 'Homme', icon: User },
   
  ];

  const sizeTablesFemme = {
    tops: {
      title: "Hauts & Robes",
      headers: ["Taille", "Tour de poitrine (cm)", "Tour de taille (cm)", "Tour de hanches (cm)"],
      rows: [
        ["XS", "82-86", "62-66", "88-92"],
        ["S", "86-90", "66-70", "92-96"],
        ["M", "90-94", "70-74", "96-100"],
        ["L", "94-98", "74-78", "100-104"],
        ["XL", "98-102", "78-82", "104-108"],
        ["XXL", "102-106", "82-86", "108-112"]
      ]
    },
    bottoms: {
      title: "Pantalons & Jupes",
      headers: ["Taille", "Tour de taille (cm)", "Tour de hanches (cm)", "Longueur jambe (cm)"],
      rows: [
        ["34", "62-66", "88-92", "76"],
        ["36", "66-70", "92-96", "78"],
        ["38", "70-74", "96-100", "80"],
        ["40", "74-78", "100-104", "82"],
        ["42", "78-82", "104-108", "84"],
        ["44", "82-86", "108-112", "86"]
      ]
    }
  };

  const sizeTablesHomme = {
    tops: {
      title: "Chemises & T-shirts",
      headers: ["Taille", "Tour de poitrine (cm)", "Tour de taille (cm)", "Longueur dos (cm)"],
      rows: [
        ["S", "88-92", "76-80", "68"],
        ["M", "92-96", "80-84", "70"],
        ["L", "96-100", "84-88", "72"],
        ["XL", "100-104", "88-92", "74"],
        ["XXL", "104-108", "92-96", "76"],
        ["XXXL", "108-112", "96-100", "78"]
      ]
    },
    bottoms: {
      title: "Pantalons",
      headers: ["Taille", "Tour de taille (cm)", "Tour de hanches (cm)", "Longueur jambe (cm)"],
      rows: [
        ["44", "76-80", "92-96", "82"],
        ["46", "80-84", "96-100", "84"],
        ["48", "84-88", "100-104", "86"],
        ["50", "88-92", "104-108", "88"],
        ["52", "92-96", "108-112", "90"],
        ["54", "96-100", "112-116", "92"]
      ]
    }
  };

  
  const measurementTips = [
    {
      title: "Comment mesurer votre tour de poitrine",
      description: "Placez le mètre ruban horizontalement autour de la partie la plus forte de votre poitrine, en gardant les bras le long du corps.",
      icon: Ruler
    },
    {
      title: "Comment mesurer votre tour de taille",
      description: "Mesurez au niveau de la partie la plus étroite de votre taille, généralement juste au-dessus du nombril.",
      icon: Circle
    },
    {
      title: "Comment mesurer votre tour de hanches",
      description: "Placez le mètre ruban autour de la partie la plus large de vos hanches, environ 20 cm sous la taille.",
      icon: Square
    },
    {
      title: "Comment mesurer la longueur de votre pied",
      description: "Placez votre pied sur une feuille, tracez le contour et mesurez de l'orteil le plus long au talon.",
      icon: Footprints
    }
  ];

  const renderSizeTable = (table: any) => (
    <div className="bg-white rounded-2xl shadow-lg border border-adawi-gold/20 overflow-hidden mb-8">
      <div className="bg-adawi-beige px-6 py-4 border-b border-adawi-gold/20">
        <h3 className="text-xl font-semibold text-adawi-brown">{table.title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-adawi-gold/10">
            <tr>
              {table.headers.map((header: string, index: number) => (
                <th key={index} className="px-4 py-3 text-left text-sm font-semibold text-adawi-brown">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row: string[], index: number) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-adawi-beige/20'}>
                {row.map((cell: string, cellIndex: number) => (
                  <td key={cellIndex} className="px-4 py-3 text-sm text-black">
                    {cellIndex === 0 ? (
                      <span className="font-semibold text-adawi-brown">{cell}</span>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />

      <main className="bg-gradient-to-br from-adawi-beige via-white to-adawi-beige-dark">
        {/* Hero Section */}
        <section className="bg-adawi-beige py-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-adawi-gold rounded-full mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-adawi-brown mb-4 tracking-tight">
              Guide des Tailles
            </h1>
            <p className="text-xl text-black max-w-2xl mx-auto leading-relaxed">
              Trouvez votre taille parfaite grâce à nos tableaux de correspondance détaillés et nos conseils de mesure.
            </p>
          </div>
        </section>

        {/* Navigation des catégories */}
        <section className="py-8 px-4 sm:px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                    activeCategory === category.id
                      ? 'bg-adawi-gold text-white shadow-lg'
                      : 'bg-adawi-beige text-adawi-brown hover:bg-adawi-beige-dark'
                  }`}
                >
                  <category.icon className="w-5 h-5 mr-2" />
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Tableaux de tailles */}
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            {activeCategory === 'femme' && (
              <div>
                <h2 className="text-3xl font-bold text-adawi-brown mb-8 text-center">
                  Tailles Femme
                </h2>
                {renderSizeTable(sizeTablesFemme.tops)}
                {renderSizeTable(sizeTablesFemme.bottoms)}
              </div>
            )}

            {activeCategory === 'homme' && (
              <div>
                <h2 className="text-3xl font-bold text-adawi-brown mb-8 text-center">
                  Tailles Homme
                </h2>
                {renderSizeTable(sizeTablesHomme.tops)}
                {renderSizeTable(sizeTablesHomme.bottoms)}
              </div>
            )}

            

            
          </div>
        </section>

        {/* Conseils de mesure */}
        <section className="py-16 px-4 sm:px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-adawi-brown mb-4">
                Comment bien prendre ses mesures ?
              </h2>
              <p className="text-xl text-black max-w-2xl mx-auto">
                Suivez nos conseils pour obtenir des mesures précises
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {measurementTips.map((tip, index) => (
                <div key={index} className="bg-adawi-beige rounded-2xl p-6 hover:bg-adawi-beige-dark transition-colors duration-300">
                  <div className="flex items-start">
                    <div className="mr-4 flex-shrink-0">
                      <tip.icon className="w-8 h-8 text-adawi-gold" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-adawi-brown mb-2">
                        {tip.title}
                      </h3>
                      <p className="text-black text-sm leading-relaxed">
                        {tip.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Accordéon */}
        <section className="py-16 px-4 sm:px-6 bg-adawi-beige/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-adawi-brown mb-4">
                Questions Fréquentes
              </h2>
              <p className="text-xl text-black">
                Trouvez les réponses à vos questions sur les tailles
              </p>
            </div>

            <div className="space-y-4">
              {/* FAQ 1 */}
              <div className="bg-white rounded-2xl shadow-lg border border-adawi-gold/20 overflow-hidden">
                <button
                  onClick={() => toggleSection('faq1')}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-adawi-beige/20 transition-colors duration-200"
                >
                  <h3 className="text-lg font-semibold text-adawi-brown">
                    Que faire si je suis entre deux tailles ?
                  </h3>
                  <svg 
                    className={`w-5 h-5 text-adawi-brown transition-transform duration-200 ${
                      activeSection === 'faq1' ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {activeSection === 'faq1' && (
                  <div className="px-8 pb-6 border-t border-adawi-gold/10">
                    <p className="text-black mt-4 leading-relaxed">
                      Si vous hésitez entre deux tailles, nous recommandons généralement de choisir la taille supérieure pour plus de confort. 
                      Consultez également les avis clients sur chaque produit pour connaître la coupe réelle.
                    </p>
                  </div>
                )}
              </div>

              {/* FAQ 2 */}
              <div className="bg-white rounded-2xl shadow-lg border border-adawi-gold/20 overflow-hidden">
                <button
                  onClick={() => toggleSection('faq2')}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-adawi-beige/20 transition-colors duration-200"
                >
                  <h3 className="text-lg font-semibold text-adawi-brown">
                    Les tailles correspondent-elles aux standards européens ?
                  </h3>
                  <svg 
                    className={`w-5 h-5 text-adawi-brown transition-transform duration-200 ${
                      activeSection === 'faq2' ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {activeSection === 'faq2' && (
                  <div className="px-8 pb-6 border-t border-adawi-gold/10">
                    <p className="text-black mt-4 leading-relaxed">
                      Oui, nos tailles suivent les standards européens. Cependant, la coupe peut varier selon les modèles. 
                      Nous vous conseillons de toujours consulter notre guide des tailles avant votre commande.
                    </p>
                  </div>
                )}
              </div>

              {/* FAQ 3 */}
              <div className="bg-white rounded-2xl shadow-lg border border-adawi-gold/20 overflow-hidden">
                <button
                  onClick={() => toggleSection('faq3')}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-adawi-beige/20 transition-colors duration-200"
                >
                  <h3 className="text-lg font-semibold text-adawi-brown">
                    Puis-je échanger si la taille ne convient pas ?
                  </h3>
                  <svg 
                    className={`w-5 h-5 text-adawi-brown transition-transform duration-200 ${
                      activeSection === 'faq3' ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {activeSection === 'faq3' && (
                  <div className="px-8 pb-6 border-t border-adawi-gold/10">
                    <p className="text-black mt-4 leading-relaxed">
                      Bien sûr ! Vous disposez de 30 jours pour échanger votre article contre une autre taille, 
                      à condition qu'il soit dans son état d'origine avec les étiquettes. 
                      L'échange est gratuit pour votre première demande.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 px-4 sm:px-6 bg-gradient-to-r from-adawi-gold-light">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Besoin d'aide pour choisir votre taille ?
            </h2>
            <p className="text-xl text-black mb-8 max-w-2xl mx-auto">
              Notre équipe est là pour vous conseiller et vous aider à trouver la taille parfaite
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-white text-adawi-brown px-8 py-4 rounded-full font-semibold hover:bg-adawi-beige transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Nous Contacter
              </a>
              
              <a
                href="mailto:adawi@gmail.com"
                className="border-2 border-white text-black px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-adawi-brown transition-all duration-300 hover:shadow-xl transform hover:scale-105"
              >
                adawi@gmail.com
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

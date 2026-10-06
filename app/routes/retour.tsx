import type { MetaFunction } from "@remix-run/node";
import { useState, useEffect } from "react";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Footer from "~/components/Footer";

export const meta: MetaFunction = () => {
  return [
    { title: "Politique de Retour - Adawi" },
    { name: "description", content: "Découvrez notre politique de retour et d'échange. Retours gratuits sous 30 jours, processus simple et rapide." },
  ];
};

export default function Retour() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-adawi-brown mb-4 tracking-tight">
              Politique de Retour
            </h1>
            <p className="text-xl text-black max-w-2xl mx-auto leading-relaxed">
              Chez Adawi, votre satisfaction est notre priorité. Découvrez notre politique de retour simple et transparente.
            </p>
          </div>
        </section>

        {/* Points Clés */}
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-adawi-gold/20 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-adawi-gold/10 rounded-full mb-6">
                  <svg className="w-8 h-8 text-adawi-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-adawi-brown mb-3">30 Jours</h3>
                <p className="text-black">
                  Délai de retour généreux pour tous vos achats
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg border border-adawi-gold/20 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-adawi-gold/10 rounded-full mb-6">
                  <svg className="w-8 h-8 text-adawi-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-adawi-brown mb-3">Retours Gratuits</h3>
                <p className="text-black">
                  Frais de retour pris en charge par Adawi
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg border border-adawi-gold/20 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-adawi-gold/10 rounded-full mb-6">
                  <svg className="w-8 h-8 text-adawi-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-adawi-brown mb-3">Processus Simple</h3>
                <p className="text-black">
                  Retour en 4 étapes faciles et rapides
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Processus de Retour */}
        <section className="py-16 px-4 sm:px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-adawi-brown mb-4">
                Comment effectuer un retour ?
              </h2>
              <p className="text-xl text-black max-w-2xl mx-auto">
                Suivez ces 4 étapes simples pour retourner votre commande
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="relative bg-adawi-beige rounded-2xl p-6 text-center hover:bg-adawi-beige-dark transition-colors duration-300">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 h-8 bg-adawi-gold text-white rounded-full flex items-center justify-center font-bold text-sm">
                    01
                  </div>
                </div><br /><br />
                
               
                
                <h3 className="text-lg font-semibold text-adawi-brown mb-2">
                  Demande de retour
                </h3>
                <p className="text-sm text-black">
                  Contactez-nous dans les 30 jours suivant votre achat
                </p>
              </div>

              <div className="relative bg-adawi-beige rounded-2xl p-6 text-center hover:bg-adawi-beige-dark transition-colors duration-300">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 h-8 bg-adawi-gold text-white rounded-full flex items-center justify-center font-bold text-sm">
                    02
                  </div>
                </div>
                
               <br /><br />
                
                <h3 className="text-lg font-semibold text-adawi-brown mb-2">
                  Emballage
                </h3>
                <p className="text-sm text-black">
                  Remballez l'article dans son emballage d'origine
                </p>
              </div>

              <div className="relative bg-adawi-beige rounded-2xl p-6 text-center hover:bg-adawi-beige-dark transition-colors duration-300">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 h-8 bg-adawi-gold text-white rounded-full flex items-center justify-center font-bold text-sm">
                    03
                  </div>
                </div>
                
                <br /><br />
                
                <h3 className="text-lg font-semibold text-adawi-brown mb-2">
                  Expédition
                </h3>
                <p className="text-sm text-black">
                  Utilisez l'étiquette de retour prépayée fournie
                </p>
              </div>

              <div className="relative bg-adawi-beige rounded-2xl p-6 text-center hover:bg-adawi-beige-dark transition-colors duration-300">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 h-8 bg-adawi-gold text-white rounded-full flex items-center justify-center font-bold text-sm">
                    04
                  </div>
                </div>
                
                <br /><br />
                
                <h3 className="text-lg font-semibold text-adawi-brown mb-2">
                  Remboursement
                </h3>
                <p className="text-sm text-black">
                  Recevez votre remboursement sous 5-7 jours ouvrables
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Conditions Accordéon */}
        <section className="py-16 px-4 sm:px-6 bg-adawi-beige/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-adawi-brown mb-4">
                Conditions de Retour
              </h2>
              <p className="text-xl text-black">
                Consultez les conditions détaillées pour un retour réussi
              </p>
            </div>

            <div className="space-y-4">
              {/* Articles éligibles */}
              <div className="bg-white rounded-2xl shadow-lg border border-adawi-gold/20 overflow-hidden">
                <button
                  onClick={() => toggleSection('eligible')}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-adawi-beige/20 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-green-600 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-adawi-brown">Articles éligibles au retour</h3>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-adawi-brown transition-transform duration-200 ${
                      activeSection === 'eligible' ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {activeSection === 'eligible' && (
                  <div className="px-8 pb-6 border-t border-adawi-gold/10">
                    <ul className="space-y-3 mt-4">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-adawi-gold rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-black">Vêtements non portés avec étiquettes d'origine</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-adawi-gold rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-black">Accessoires dans leur emballage d'origine</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-adawi-gold rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-black">Chaussures non portées à l'extérieur</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-adawi-gold rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-black">Articles achetés au prix plein ou en promotion</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Articles non éligibles */}
              <div className="bg-white rounded-2xl shadow-lg border border-adawi-gold/20 overflow-hidden">
                <button
                  onClick={() => toggleSection('non-eligible')}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-adawi-beige/20 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-red-500 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-adawi-brown">Articles non éligibles au retour</h3>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-adawi-brown transition-transform duration-200 ${
                      activeSection === 'non-eligible' ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {activeSection === 'non-eligible' && (
                  <div className="px-8 pb-6 border-t border-adawi-gold/10">
                    <ul className="space-y-3 mt-4">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-black">Sous-vêtements et maillots de bain</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-black">Articles personnalisés ou sur mesure</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-black">Articles endommagés par l'usage</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-black">Articles achetés il y a plus de 30 jours</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Délais */}
              <div className="bg-white rounded-2xl shadow-lg border border-adawi-gold/20 overflow-hidden">
                <button
                  onClick={() => toggleSection('delais')}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-adawi-beige/20 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-adawi-gold mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-adawi-brown">Délais et Remboursement</h3>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-adawi-brown transition-transform duration-200 ${
                      activeSection === 'delais' ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {activeSection === 'delais' && (
                  <div className="px-8 pb-6 border-t border-adawi-gold/10">
                    <div className="mt-4 space-y-4">
                      <p className="text-black">
                        <strong className="text-adawi-brown">30 jours calendaires</strong> à compter de la réception pour initier un retour.
                      </p>
                      <p className="text-black">
                        <strong className="text-adawi-brown">5-7 jours ouvrables</strong> pour le traitement du remboursement après réception.
                      </p>
                      <p className="text-black">
                        Le remboursement s'effectue sur votre <strong className="text-adawi-brown">mode de paiement original</strong>.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 px-4 sm:px-6 bg-gradient-to-r from-adawi-gold-light ">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Besoin d'aide pour votre retour ?
            </h2>
            <p className="text-xl text-black mb-8 max-w-2xl mx-auto">
              Notre équipe customer service est là pour vous accompagner dans votre processus de retour
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

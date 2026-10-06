import type { MetaFunction } from "@remix-run/node";
import { useState } from "react";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import {
  HelpCircle,
  Search,
  ShoppingCart,
  Truck,
  RotateCcw,
  CreditCard,
  User,
  Phone,
  Mail,
  MessageCircle,
  Ruler
} from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "FAQ - Questions Fréquentes - Adawi" },
    { name: "description", content: "Trouvez rapidement les réponses à vos questions sur nos produits, livraisons, retours et services. Support client Adawi." },
  ];
};

export default function FAQ() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const categories = [
    { id: "all", name: "Toutes", icon: HelpCircle },
    { id: "commandes", name: "Commandes", icon: ShoppingCart },
    { id: "livraison", name: "Livraison", icon: Truck },
    { id: "retours", name: "Retours", icon: RotateCcw },
    { id: "paiement", name: "Paiement", icon: CreditCard },
    { id: "compte", name: "Mon Compte", icon: User }
  ];

  const faqItems = [
    // Commandes
    {
      id: 'faq1',
      category: 'commandes',
      question: "Comment passer une commande sur votre site ?",
      answer: "Pour passer commande, parcourez notre catalogue, ajoutez les articles souhaités à votre panier, puis cliquez sur 'Commander'. Suivez ensuite les étapes : vérification du panier, informations de livraison, choix du mode de paiement et confirmation."
    },
    {
      id: 'faq2',
      category: 'commandes',
      question: "Puis-je modifier ma commande après validation ?",
      answer: "Vous pouvez modifier votre commande dans les 2 heures suivant la validation en nous contactant directement. Passé ce délai, si la commande est en préparation, les modifications ne seront plus possibles."
    },
    {
      id: 'faq3',
      category: 'commandes',
      question: "Comment annuler ma commande ?",
      answer: "L'annulation est possible dans les 2 heures suivant la commande. Connectez-vous à votre compte, allez dans 'Mes commandes' et cliquez sur 'Annuler'. Au-delà, contactez notre service client."
    },
    {
      id: 'faq4',
      category: 'commandes',
      question: "Que faire si un article n'est plus disponible ?",
      answer: "Si un article de votre commande n'est plus disponible, nous vous contactons immédiatement pour vous proposer un article similaire ou un remboursement partiel."
    },

    // Livraison
    {
      id: 'faq5',
      category: 'livraison',
      question: "Quels sont vos délais de livraison ?",
      answer: "Les délais varient selon votre localisation : 24h pour Lomé Centre, 2-3 jours pour le Grand Lomé, 3-5 jours pour l'intérieur du Togo, et 7-15 jours pour l'international."
    },
    {
      id: 'faq6',
      category: 'livraison',
      question: "Comment suivre ma commande ?",
      answer: "Dès l'expédition, vous recevez un email avec un numéro de suivi. Vous pouvez suivre votre colis sur notre site dans 'Mon Compte' > 'Suivi de commandes' ou sur notre page de suivi dédiée."
    },
    {
      id: 'faq7',
      category: 'livraison',
      question: "Livrez-vous à l'international ?",
      answer: "Oui, nous livrons en Afrique de l'Ouest et en Europe. Les frais et délais sont calculés selon la destination. Contactez-nous pour un devis personnalisé."
    },
    {
      id: 'faq8',
      category: 'livraison',
      question: "Que faire si je ne suis pas présent à la livraison ?",
      answer: "Le livreur tentera une nouvelle livraison le lendemain. Après 3 tentatives, votre colis sera disponible en point relais pendant 15 jours."
    },

    // Retours
    {
      id: 'faq9',
      category: 'retours',
      question: "Quelle est votre politique de retour ?",
      answer: "Vous avez 30 jours pour retourner un article non porté avec ses étiquettes. Les frais de retour sont à votre charge sauf en cas de défaut du produit."
    },
    {
      id: 'faq10',
      category: 'retours',
      question: "Comment procéder à un retour ?",
      answer: "Connectez-vous à votre compte, allez dans 'Mes commandes', sélectionnez l'article à retourner et suivez la procédure. Vous recevrez une étiquette de retour prépayée."
    },
    {
      id: 'faq11',
      category: 'retours',
      question: "Quand serai-je remboursé ?",
      answer: "Le remboursement est effectué sous 5-7 jours ouvrés après réception et vérification de votre retour, sur le même moyen de paiement utilisé."
    },
    {
      id: 'faq12',
      category: 'retours',
      question: "Puis-je échanger un article ?",
      answer: "Oui, vous pouvez échanger un article contre une autre taille ou couleur. L'échange est gratuit si effectué dans les 15 jours suivant la réception."
    },

    // Paiement
    {
      id: 'faq13',
      category: 'paiement',
      question: "Quels moyens de paiement acceptez-vous ?",
      answer: "Nous acceptons les cartes bancaires (Visa, Mastercard), Mobile Money (Flooz, T-Money), et le paiement à la livraison pour les commandes au Togo."
    },
    {
      id: 'faq14',
      category: 'paiement',
      question: "Le paiement en ligne est-il sécurisé ?",
      answer: "Oui, tous nos paiements sont sécurisés par cryptage SSL. Nous ne stockons aucune donnée bancaire sur nos serveurs."
    },
    {
      id: 'faq15',
      category: 'paiement',
      question: "Puis-je payer en plusieurs fois ?",
      answer: "Le paiement en plusieurs fois est disponible pour les commandes supérieures à 50 000 F CFA. Cette option apparaît lors du panier."
    },
    {
      id: 'faq16',
      category: 'paiement',
      question: "Que faire si mon paiement est refusé ?",
      answer: "Vérifiez vos informations bancaires et votre solde. Si le problème persiste, contactez votre banque ou utilisez un autre moyen de paiement."
    },

    // Compte
    {
      id: 'faq17',
      category: 'compte',
      question: "Comment créer un compte ?",
      answer: "Cliquez sur 'S'inscrire' en haut de la page, remplissez le formulaire avec vos informations personnelles et validez votre email."
    },
    {
      id: 'faq18',
      category: 'compte',
      question: "J'ai oublié mon mot de passe, que faire ?",
      answer: "Cliquez sur 'Mot de passe oublié' sur la page de connexion, entrez votre email et suivez les instructions reçues par email."
    },
    {
      id: 'faq19',
      category: 'compte',
      question: "Comment modifier mes informations personnelles ?",
      answer: "Connectez-vous à votre compte, allez dans 'Mon Profil' et modifiez les informations souhaitées. N'oubliez pas de sauvegarder."
    },
    {
      id: 'faq20',
      category: 'compte',
      question: "Puis-je supprimer mon compte ?",
      answer: "Oui, vous pouvez supprimer votre compte en nous contactant. Attention, cette action est irréversible et supprimera tout votre historique."
    }
  ];

  const filteredFAQs = faqItems.filter(item => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = searchTerm === "" || 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />

      <main className="bg-gradient-to-br from-adawi-beige via-white to-adawi-beige-dark">
        {/* Hero Section */}
        <section className="bg-adawi-beige py-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-adawi-gold rounded-full mb-6">
              <HelpCircle className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-adawi-brown mb-4 tracking-tight">
              Questions Fréquentes
            </h1>
            <p className="text-xl text-black max-w-2xl mx-auto leading-relaxed">
              Trouvez rapidement les réponses à vos questions. Notre équipe support est là pour vous aider.
            </p>
          </div>
        </section>

        {/* Barre de recherche */}
        <section className="py-8 px-4 sm:px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-adawi-brown-light w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher dans les questions fréquentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-adawi-gold/30 rounded-full focus:outline-none focus:ring-2 focus:ring-adawi-gold focus:border-transparent bg-white text-adawi-brown placeholder-black/25 text-lg"
              />
            </div>
          </div>
        </section>

        {/* Filtres par catégorie */}
        <section className="py-8 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                      activeCategory === category.id
                        ? 'bg-adawi-gold text-white shadow-lg'
                        : 'bg-white text-adawi-brown border border-adawi-gold/30 hover:bg-adawi-beige/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ Items */}
        <section className="py-8 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="w-16 h-16 text-adawi-brown-light mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-adawi-brown mb-2">
                  Aucune question trouvée
                </h3>
                <p className="text-adawi-brown-light">
                  Essayez avec d'autres mots-clés ou contactez notre support.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFAQs.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl shadow-lg border border-adawi-gold/20 overflow-hidden">
                    <button
                      onClick={() => toggleSection(item.id)}
                      className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-adawi-beige/20 transition-colors duration-200"
                    >
                      <h3 className="text-lg font-semibold text-adawi-brown pr-4">
                        {item.question}
                      </h3>
                      <svg 
                        className={`w-5 h-5 text-adawi-brown transition-transform duration-200 flex-shrink-0 ${
                          activeSection === item.id ? 'rotate-180' : ''
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {activeSection === item.id && (
                      <div className="px-8 pb-6 border-t border-adawi-gold/10">
                        <p className="text-black mt-4 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Section d'aide supplémentaire */}
        <section className="py-16 px-4 sm:px-6 bg-adawi-beige/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-adawi-brown mb-4">
              Vous ne trouvez pas votre réponse ?
            </h2>
            <p className="text-xl text-black mb-12 max-w-2xl mx-auto">
              Notre équipe support est disponible pour vous aider personnellement
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-adawi-gold/20 hover:shadow-xl transition-all duration-300">
                <Phone className="w-12 h-12 text-adawi-gold mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-adawi-brown mb-2">Téléphone</h3>
                <p className="text-black mb-4">Lun-Ven: 8h-18h<br />Sam: 9h-15h</p>
                <a href="tel:+22890000000" className="text-adawi-gold font-medium hover:text-adawi-brown">
                  +228 90 00 00 00
                </a>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-adawi-gold/20 hover:shadow-xl transition-all duration-300">
                <Mail className="w-12 h-12 text-adawi-gold mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-adawi-brown mb-2">Email</h3>
                <p className="text-black mb-4">Réponse sous 24h<br />7j/7</p>
                <a href="mailto:support@adawi.com" className="text-adawi-gold font-medium hover:text-adawi-brown">
                  support@adawi.com
                </a>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-adawi-gold/20 hover:shadow-xl transition-all duration-300">
                <MessageCircle className="w-12 h-12 text-adawi-gold mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-adawi-brown mb-2">Chat en Direct</h3>
                <p className="text-black mb-4">Assistance immédiate<br />Lun-Ven: 9h-17h</p>
                <button className="text-adawi-gold font-medium hover:text-adawi-brown">
                  Démarrer le chat
                </button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-adawi-gold text-white px-8 py-4 rounded-full font-semibold hover:bg-adawi-brown transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Nous Contacter
              </a>
              
              <a
                href="/support"
                className="border-2 border-adawi-gold text-adawi-brown px-8 py-4 rounded-full font-semibold hover:bg-adawi-gold hover:text-white transition-all duration-300 hover:shadow-xl transform hover:scale-105"
              >
                Centre d'Aide
              </a>
            </div>
          </div>
        </section>

        {/* Guides utiles */}
        <section className="py-16 px-4 sm:px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-adawi-brown mb-4">
                Guides Utiles
              </h2>
              <p className="text-xl text-black">
                Découvrez nos guides pour une meilleure expérience
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <a href="/guide-tailles" className="bg-adawi-beige/30 rounded-2xl p-6 hover:bg-adawi-beige/50 transition-all duration-300 text-center group">
                <div className="flex justify-center mb-4">
                  <Ruler className="w-10 h-10 text-adawi-gold" />
                </div>
                <h3 className="text-lg font-semibold text-adawi-brown mb-2 group-hover:text-adawi-gold">
                  Guide des Tailles
                </h3>
                <p className="text-sm text-black">
                  Trouvez votre taille parfaite
                </p>
              </a>

              <a href="/livraison" className="bg-adawi-beige/30 rounded-2xl p-6 hover:bg-adawi-beige/50 transition-all duration-300 text-center group">
                <div className="flex justify-center mb-4">
                  <Truck className="w-10 h-10 text-adawi-gold" />
                </div>
                <h3 className="text-lg font-semibold text-adawi-brown mb-2 group-hover:text-adawi-gold">
                  Livraison
                </h3>
                <p className="text-sm text-black">
                  Délais et zones de livraison
                </p>
              </a>

              <a href="/retour" className="bg-adawi-beige/30 rounded-2xl p-6 hover:bg-adawi-beige/50 transition-all duration-300 text-center group">
                <div className="flex justify-center mb-4">
                  <RotateCcw className="w-10 h-10 text-adawi-gold" />
                </div>
                <h3 className="text-lg font-semibold text-adawi-brown mb-2 group-hover:text-adawi-gold">
                  Retours & Échanges
                </h3>
                <p className="text-sm text-black">
                  Politique de retour
                </p>
              </a>

              
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

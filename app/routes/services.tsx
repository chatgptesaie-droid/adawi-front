import type { MetaFunction } from "@remix-run/node";
import { useState } from "react";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import {
  Sparkles,
  Users,
  Scissors,
  Truck,
  Shield,
  Heart,
  ShoppingBag,
  Star,
  Clock,
  Phone,
  Mail,
  CheckCircle
} from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Services - Adawi" },
    { name: "description", content: "Découvrez tous nos services : conseil personnalisé, stylisme, retouches, livraison express et bien plus. Une expérience shopping unique." },
  ];
};

export default function Services() {
  const [activeService, setActiveService] = useState<string | null>(null);

  const toggleService = (serviceId: string) => {
    setActiveService(activeService === serviceId ? null : serviceId);
  };

  const mainServices = [
    {
      id: "conseil",
      title: "Conseil Personnalisé",
      description: "Un accompagnement sur-mesure pour trouver le style qui vous correspond",
      icon: Users,
      color: "bg-blue-100 text-blue-800",
      features: [
        "Consultation style gratuite",
        "Analyse morphologique",
        "Conseils couleurs personnalisés",
        "Sélection d'articles adaptés"
      ],
      details: "Nos conseillers mode vous accompagnent pour créer un style unique qui reflète votre personnalité. Que ce soit pour un événement spécial ou pour renouveler votre garde-robe, nous vous guidons dans vos choix."
    },
    {
      id: "stylisme",
      title: "Service de Stylisme",
      description: "Création de looks complets par nos stylistes professionnels",
      icon: Sparkles,
      color: "bg-purple-100 text-purple-800",
      features: [
        "Création de looks complets",
        "Stylistes professionnels",
        "Séance photo incluse",
        "Conseils d'association"
      ],
      details: "Nos stylistes créent des tenues complètes selon vos besoins : professionnel, décontracté, soirée. Service premium avec séance photo pour immortaliser vos nouveaux looks."
    },
    {
      id: "retouches",
      title: "Retouches & Ajustements",
      description: "Service de couture professionnel pour un ajustement parfait",
      icon: Scissors,
      color: "bg-green-100 text-green-800",
      features: [
        "Ajustement de taille",
        "Ourlets professionnels",
        "Réparations textiles",
        "Personnalisation"
      ],
      details: "Notre atelier de couture assure des retouches de qualité pour que vos vêtements vous aillent parfaitement. Délai rapide et finitions soignées garanties."
    },
    {
      id: "livraison-premium",
      title: "Livraison Premium",
      description: "Service de livraison express et sur-mesure",
      icon: Truck,
      color: "bg-adawi-gold/20 text-adawi-brown",
      features: [
        "Livraison express 2h",
        "Créneau au choix",
        "Essayage à domicile",
        "Retour gratuit"
      ],
      details: "Recevez vos commandes en express avec possibilité d'essayage à domicile. Si les articles ne conviennent pas, notre livreur repart avec gratuitement."
    },
    {
      id: "sav",
      title: "Service Après-Vente",
      description: "Un accompagnement continu après votre achat",
      icon: Shield,
      color: "bg-red-100 text-red-800",
      features: [
        "Garantie étendue",
        "Entretien conseils",
        "Réparations gratuites",
        "Échange facilité"
      ],
      details: "Nous restons à vos côtés après l'achat avec une garantie étendue, des conseils d'entretien et un service de réparation pour prolonger la vie de vos vêtements."
    },
    {
      id: "fidelite",
      title: "Programme Fidélité",
      description: "Des avantages exclusifs pour nos clients fidèles",
      icon: Heart,
      color: "bg-pink-100 text-pink-800",
      features: [
        "Points de fidélité",
        "Réductions exclusives",
        "Accès prioritaire",
        "Événements privés"
      ],
      details: "Cumulez des points à chaque achat et bénéficiez d'avantages exclusifs : réductions, accès prioritaire aux nouveautés, invitations aux événements privés."
    }
  ];

  const additionalServices = [
    {
      title: "Personal Shopping",
      description: "Shopping accompagné avec un conseiller dédié",
      icon: ShoppingBag
    },
    {
      title: "Garde-Robe Audit",
      description: "Analyse et optimisation de votre garde-robe existante",
      icon: Scissors
    },
    {
      title: "Styling Événementiel",
      description: "Tenues sur-mesure pour vos événements spéciaux",
      icon: Sparkles
    },
    {
      title: "Entretien Premium",
      description: "Service de nettoyage et entretien professionnel",
      icon: Shield
    }
  ];

  const processSteps = [
    {
      step: 1,
      title: "Prise de Contact",
      description: "Contactez-nous pour définir vos besoins"
    },
    {
      step: 2,
      title: "Consultation",
      description: "Rendez-vous personnalisé avec nos experts"
    },
    {
      step: 3,
      title: "Service",
      description: "Réalisation du service selon vos attentes"
    },
    {
      step: 4,
      title: "Suivi",
      description: "Accompagnement continu et satisfaction"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />

      <main className="bg-gradient-to-br from-adawi-beige via-white to-adawi-beige-dark">
        {/* Hero Section */}
        <section className="bg-adawi-beige py-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-adawi-gold rounded-full mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-adawi-brown mb-4 tracking-tight">
              Nos Services
            </h1>
            <p className="text-xl text-black max-w-2xl mx-auto leading-relaxed">
              Une expérience shopping unique avec des services personnalisés pour sublimer votre style et vous accompagner dans tous vos projets mode.
            </p>
          </div>
        </section>

        {/* Services Principaux */}
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-adawi-brown mb-4">
                Services Principaux
              </h2>
              <p className="text-xl text-black">
                Des services premium pour une expérience mode exceptionnelle
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mainServices.map((service) => {
                const Icon = service.icon;
                return (
                  <div key={service.id} className="bg-white rounded-2xl shadow-lg border border-adawi-gold/20 overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-adawi-gold rounded-full mr-4">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${service.color}`}>
                          Premium
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-adawi-brown mb-2">
                        {service.title}
                      </h3>
                      <p className="text-black mb-4">
                        {service.description}
                      </p>
                      
                      <ul className="space-y-2 mb-6">
                        {service.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-adawi-brown">
                            <CheckCircle className="w-4 h-4 text-adawi-gold mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      
                      <button
                        onClick={() => toggleService(service.id)}
                        className="w-full bg-adawi-beige/50 text-adawi-brown py-2 px-4 rounded-full font-medium hover:bg-adawi-gold hover:text-white transition-all duration-300"
                      >
                        {activeService === service.id ? 'Masquer les détails' : 'Voir les détails'}
                      </button>
                      
                      {activeService === service.id && (
                        <div className="mt-4 p-4 bg-adawi-beige/20 rounded-xl">
                          <p className="text-sm text-black leading-relaxed">
                            {service.details}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Services Additionnels */}
        <section className="py-16 px-4 sm:px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-adawi-brown mb-4">
                Services Additionnels
              </h2>
              <p className="text-xl text-black-light">
                Des services complémentaires pour répondre à tous vos besoins
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {additionalServices.map((service, index) => (
                <div key={index} className="bg-adawi-beige/30 rounded-2xl p-6 text-center hover:bg-adawi-beige/50 transition-all duration-300 hover:scale-105">
                  <div className="flex justify-center mb-4">
                    <service.icon className="w-8 h-8 text-adawi-gold" />
                  </div>
                  <h3 className="text-lg font-semibold text-adawi-brown mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-black">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Processus */}
        <section className="py-16 px-4 sm:px-6 bg-adawi-beige/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-adawi-brown mb-4">
                Comment ça marche ?
              </h2>
              <p className="text-xl text-black">
                Un processus simple en 4 étapes pour bénéficier de nos services
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {processSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-adawi-gold rounded-full mb-4">
                    <span className="text-2xl font-bold text-white">{step.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-adawi-brown mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-black">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Avantages */}
        <section className="py-16 px-4 sm:px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-adawi-brown mb-4">
                Pourquoi Choisir Nos Services ?
              </h2>
              <p className="text-xl text-black">
                L'excellence au service de votre style
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-adawi-gold/20 rounded-full mb-6">
                  <Star className="w-8 h-8 text-adawi-gold" />
                </div>
                <h3 className="text-xl font-semibold text-adawi-brown mb-4">
                  Expertise Professionnelle
                </h3>
                <p className="text-black">
                  Une équipe de professionnels formés aux dernières tendances mode et techniques de stylisme.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-adawi-gold/20 rounded-full mb-6">
                  <Clock className="w-8 h-8 text-adawi-gold" />
                </div>
                <h3 className="text-xl font-semibold text-adawi-brown mb-4">
                  Service Rapide
                </h3>
                <p className="text-black">
                  Des délais respectés et un service efficace pour répondre à vos besoins dans les meilleurs délais.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-adawi-gold/20 rounded-full mb-6">
                  <Heart className="w-8 h-8 text-adawi-gold" />
                </div>
                <h3 className="text-xl font-semibold text-adawi-brown mb-4">
                  Approche Personnalisée
                </h3>
                <p className="text-black">
                  Chaque client est unique. Nos services s'adaptent à vos goûts, votre morphologie et votre budget.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Témoignages */}
        <section className="py-16 px-4 sm:px-6 bg-adawi-beige/20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-adawi-brown mb-4">
                Ce que disent nos clients
              </h2>
              <p className="text-xl text-black">
                Leur satisfaction est notre plus belle récompense
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-adawi-gold/20">
                <div className="flex items-center mb-4">
                  <div className="flex text-adawi-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-black mb-4 italic">
                  "Le service de stylisme m'a complètement transformée ! Les conseils étaient parfaits et j'ai enfin trouvé mon style."
                </p>
                <div className="font-semibold text-adawi-brown">
                  Marie K. - Lomé
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-adawi-gold/20">
                <div className="flex items-center mb-4">
                  <div className="flex text-adawi-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-black mb-4 italic">
                  "Les retouches sont impeccables et le service de livraison premium est un vrai plus. Je recommande !"
                </p>
                <div className="font-semibold text-adawi-brown">
                  Jean-Paul M. - Kara
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-adawi-gold/20">
                <div className="flex items-center mb-4">
                  <div className="flex text-adawi-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-black mb-4 italic">
                  "Le programme fidélité et les événements privés font vraiment la différence. Service exceptionnel !"
                </p>
                <div className="font-semibold text-adawi-brown">
                  Fatima A. - Sokodé
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Services */}
        <section className="py-16 px-4 sm:px-6 bg-gradient-to-r from-adawi-gold to-adawi-brown">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Prêt à Découvrir Nos Services ?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Contactez-nous pour bénéficier de nos services personnalisés et vivre une expérience mode unique
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <Phone className="w-8 h-8 text-white mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Réservation Téléphonique</h3>
                <p className="text-white/90 mb-2">Lun-Sam: 9h-18h</p>
                <a href="tel:+22890000000" className="text-white font-medium hover:text-adawi-beige">
                  +228 90 00 00 00
                </a>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <Mail className="w-8 h-8 text-white mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Demande par Email</h3>
                <p className="text-white/90 mb-2">Réponse sous 24h</p>
                <a href="mailto:services@adawi.com" className="text-white font-medium hover:text-adawi-beige">
                  services@adawi.com
                </a>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/client/appointments"
                className="bg-white text-adawi-brown px-8 py-4 rounded-full font-semibold hover:bg-adawi-beige transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Prendre Rendez-vous
              </a>
              
              <a
                href="/faq"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-adawi-brown transition-all duration-300 hover:shadow-xl transform hover:scale-105"
              >
                Questions Fréquentes
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

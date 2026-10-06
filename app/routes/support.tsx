import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useState } from "react";
import { useLoaderData } from "@remix-run/react";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import { readToken } from "~/utils/session.server";
import type { LucideIcon } from "lucide-react";
import {
  MessageCircle,
  Mail,
  Phone,
  Package,
  RefreshCw,
  Ruler,
  Truck,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings
} from "lucide-react";

interface User {
  id: string;
  email: string;
  full_name: string;
}

interface Order {
  id: string;
  created_at: string;
  total: number;
}

interface LoaderData {
  user: User | null;
  orders: Order[];
  token: string;
  error?: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const tokenData = await readToken(request);
    if (!tokenData) {
      return json<LoaderData>({
        user: null,
        orders: [],
        token: "",
      });
    }

    const token = typeof tokenData === "string"
      ? (() => {
          try { return JSON.parse(tokenData)?.access_token || tokenData }
          catch { return tokenData }
        })()
      : tokenData;

    if (!token) {
      return json<LoaderData>({
        user: null,
        orders: [],
        token: "",
      });
    }

    const [userRes, ordersRes] = await Promise.all([
      fetch("http://localhost:8000/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("http://localhost:8000/orders/", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const user = userRes.ok ? await userRes.json() : null;
    const orders = ordersRes.ok ? await ordersRes.json() : [];

    return json<LoaderData>({ user, orders, token });
  } catch (err: any) {
    console.error("Erreur loader support:", err);
    return json<LoaderData>({
      user: null,
      orders: [],
      token: "",
      error: err.message || "Erreur serveur",
    });
  }
};

export const meta: MetaFunction = () => {
  return [
    { title: "Support Client - Adawi" },
    { name: "description", content: "Besoin d'aide ? Notre équipe support est là pour vous accompagner. FAQ, assistance en ligne et support personnalisé." },
  ];
};

export default function Support() {
  const { user, orders, token, error } = useLoaderData<LoaderData>();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'commande',
    priority: 'normale',
    order_id: orders.length > 0 ? orders[0].id : ''
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("http://localhost:8000/support/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        setSubmitError(errData.detail?.[0]?.msg || "Erreur lors de la création du ticket");
      } else {
        alert('Votre ticket a été créé avec succès ! Nous vous répondrons dans les plus brefs délais.');
        setShowCreateForm(false);
        setFormData({
          title: '',
          description: '',
          category: 'commande',
          priority: 'normale',
          order_id: orders.length > 0 ? orders[0].id : ''
        });
      }
    } catch (err: any) {
      setSubmitError(err.message || "Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  };

  const supportChannels = [
    // {
    //   title: "Chat en Direct",
    //   description: "Assistance immédiate avec notre équipe",
    //   icon: MessageCircle,
    //   availability: "Lun-Ven 9h-18h",
    //   status: "En ligne",
    //   action: "Démarrer le chat",
    //   color: "bg-green-100 text-green-800"
    // },
    {
      title: "Email Support",
      description: "Réponse sous 24h maximum",
      icon: Mail,
      availability: "24h/24, 7j/7",
      status: "Disponible",
      action: "sergiodaklu12@gmail.com",
      color: "bg-blue-100 text-blue-800"
    },
    {
      title: "Téléphone",
      description: "Assistance téléphonique directe",
      icon: Phone,
      availability: "Lun-Ven 9h-17h",
      status: "Ouvert",
      action: "+228 97732976",
      color: "bg-adawi-gold/20 text-adawi-brown"
    }
  ];

  const quickHelp = [
    {
      title: "Suivi de commande",
      description: "Vérifiez le statut de votre commande",
      icon: Package,
      link: "/suivi-commande"
    },
    {
      title: "Retours & Échanges",
      description: "Politique et processus de retour",
      icon: RefreshCw,
      link: "/retour"
    },
    {
      title: "Guide des Tailles",
      description: "Trouvez votre taille parfaite",
      icon: Ruler,
      link: "/guide-tailles"
    },
    {
      title: "Livraison",
      description: "Informations sur la livraison",
      icon: Truck,
      link: "/livraison"
    }
  ];

  const faqItems = [
    {
      id: 'faq1',
      question: "Comment puis-je suivre ma commande ?",
      answer: "Vous pouvez suivre votre commande en utilisant le numéro de suivi envoyé par email après l'expédition. Rendez-vous sur notre page de suivi ou cliquez sur le lien dans l'email de confirmation."
    },
    {
      id: 'faq2',
      question: "Quels sont les délais de livraison ?",
      answer: "Les délais de livraison varient selon votre localisation : 2-3 jours pour Lomé, 3-5 jours pour le reste du Togo, et 5-10 jours pour l'international. La livraison express est disponible pour Lomé (24h)."
    },
    {
      id: 'faq3',
      question: "Comment puis-je retourner un article ?",
      answer: "Vous disposez de 30 jours pour retourner un article. L'article doit être dans son état d'origine avec les étiquettes. Contactez-nous pour obtenir une étiquette de retour gratuite."
    },
    {
      id: 'faq4',
      question: "Acceptez-vous les paiements internationaux ?",
      answer: "Oui, nous acceptons les cartes Visa, Mastercard, PayPal et les virements bancaires internationaux. Tous les paiements sont sécurisés et cryptés."
    },
    {
      id: 'faq5',
      question: "Proposez-vous des retouches ?",
      answer: "Oui, nous offrons un service de retouches professionnel. Les retouches mineures (ourlets) sont gratuites pour les achats de plus de 100FCFA. Contactez-nous pour plus d'informations."
    },
    {
      id: 'faq6',
      question: "Comment puis-je annuler ma commande ?",
      answer: "Vous pouvez annuler votre commande dans les 2 heures suivant la confirmation si elle n'a pas encore été expédiée. Contactez-nous immédiatement par chat ou email."
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
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-adawi-brown mb-4 tracking-tight">
              Support Client
            </h1>
            <p className="text-xl text-black max-w-2xl mx-auto leading-relaxed">
              Notre équipe dédiée est là pour vous aider. Trouvez rapidement les réponses à vos questions ou contactez-nous directement.
            </p>
          </div>
        </section>

        {/* Aide Rapide */}
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-adawi-brown mb-4">
                Aide Rapide
              </h2>
              <p className="text-xl text-black">
                Accédez rapidement aux informations les plus demandées
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickHelp.map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-adawi-gold/20 hover:shadow-xl transition-all duration-300 hover:scale-105 text-center group"
                >
                  <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-10 h-10 text-adawi-gold" />
                  </div>
                  <h3 className="text-lg font-semibold text-adawi-brown mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-black">
                    {item.description}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Canaux de Support */}
        <section className="py-16 px-4 sm:px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-adawi-brown mb-4">
                Contactez-nous
              </h2>
              <p className="text-xl text-black">
                Choisissez le canal qui vous convient le mieux
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {supportChannels.map((channel, index) => (
                <div key={index} className="bg-adawi-beige/30 rounded-2xl p-8 text-center hover:bg-adawi-beige/50 transition-all duration-300">
                  <div className="flex justify-center mb-4">
                    <channel.icon className="w-10 h-10 text-adawi-gold" />
                  </div>
                  <h3 className="text-xl font-semibold text-adawi-brown mb-2">{channel.title}</h3>
                  <p className="text-black mb-4">{channel.description}</p>
                  
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${channel.color}`}>
                      {channel.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-adawi-brown mb-4 font-medium">{channel.availability}</p>
                  
            
                  <a href="mailto:sergiodaklu12@gmail.com" className="bg-adawi-gold text-white px-6 py-3 rounded-full hover:bg-adawi-brown transition-colors duration-300 font-semibold">
                    {channel.action}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 sm:px-6 bg-adawi-beige/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-adawi-brown mb-4">
                Questions Fréquentes
              </h2>
              <p className="text-xl text-black">
                Trouvez rapidement les réponses à vos questions
              </p>
            </div>

            <div className="space-y-4">
              {faqItems.map((item) => (
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
          </div>
        </section>

        {/* Formulaire de Contact */}
        <section className="py-16 px-4 sm:px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-adawi-brown mb-4">
                Créer un Ticket de Support
              </h2>
              <p className="text-xl text-black">
                Décrivez votre problème en détail pour une assistance rapide et personnalisée
              </p>
            </div>

            <div className="bg-adawi-beige/20 rounded-2xl p-8 border border-adawi-gold/20">
              {submitError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{submitError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-adawi-brown mb-2">
                      Titre du ticket *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-adawi-gold/30 rounded-full focus:outline-none focus:ring-2 focus:ring-adawi-gold focus:border-transparent bg-white text-black placeholder-black/25"
                      placeholder="Résumé de votre demande"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-adawi-brown mb-2">
                      Catégorie *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-adawi-gold/30 rounded-full focus:outline-none focus:ring-2 focus:ring-adawi-gold focus:border-transparent bg-white text-black"
                      required
                    >
                      <option value="commande">Problème de commande</option>
                      <option value="livraison">Livraison</option>
                      <option value="retour">Retour/Échange</option>
                      <option value="produit">Question produit</option>
                      <option value="paiement">Paiement</option>
                      <option value="technique">Problème technique</option>
                      <option value="general">Question générale</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-adawi-brown mb-2">
                      Priorité *
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-adawi-gold/30 rounded-full focus:outline-none focus:ring-2 focus:ring-adawi-gold focus:border-transparent bg-white text-black"
                    >
                      <option value="basse">Basse</option>
                      <option value="normale">Normale</option>
                      <option value="haute">Élevée</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  </div>
                  {orders.length > 0 && (
                    <div>
                      <label htmlFor="order_id" className="block text-sm font-medium text-adawi-brown mb-2">
                        Commande associée (optionnel)
                      </label>
                      <select
                        id="order_id"
                        name="order_id"
                        value={formData.order_id}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-adawi-gold/30 rounded-full focus:outline-none focus:ring-2 focus:ring-adawi-gold focus:border-transparent bg-white text-black"
                      >
                        <option value="">Aucune commande</option>
                        {orders.map((order) => (
                          <option key={order.id} value={order.id}>
                            Commande #{order.id} - {new Date(order.created_at).toLocaleDateString()}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-adawi-brown mb-2">
                    Description détaillée *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-adawi-gold/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-adawi-gold focus:border-transparent bg-white text-black placeholder-black/25 resize-none"
                    placeholder="Décrivez votre problème en détail. Plus vous nous donnez d'informations, plus nous pourrons vous aider efficacement..."
                    required
                  />
                </div>

                <div className="bg-adawi-gold/10 rounded-xl p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-adawi-gold mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-adawi-brown">
                      <p className="font-medium mb-1">Temps de réponse estimé :</p>
                      <ul className="text-black space-y-1">
                        <li>• Questions générales : 2-4 heures</li>
                        <li>• Problèmes de commande : 1-2 heures</li>
                        <li>• Problèmes urgents : 30 minutes</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-adawi-brown text-white px-8 py-4 rounded-full font-semibold hover:bg-adawi-gold transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Envoi en cours...
                      </div>
                    ) : (
                      'Envoyer ma Demande'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Ressources Utiles */}
        <section className="py-16 px-4 sm:px-6 bg-adawi-beige/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-adawi-brown mb-4">
                Ressources Utiles
              </h2>
              <p className="text-xl text-black">
                Explorez nos guides et ressources pour une expérience optimale
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <a href="/guide-tailles" className="bg-white rounded-2xl p-6 shadow-lg border border-adawi-gold/20 hover:shadow-xl transition-all duration-300 hover:scale-105 text-center group">
                <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Ruler className="w-10 h-10 text-adawi-gold" />
                </div>
                <h3 className="text-lg font-semibold text-adawi-brown mb-2">Guide des Tailles</h3>
                <p className="text-sm text-black">Trouvez votre taille parfaite</p>
              </a>

              <a href="/retour" className="bg-white rounded-2xl p-6 shadow-lg border border-adawi-gold/20 hover:shadow-xl transition-all duration-300 hover:scale-105 text-center group">
                <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <RefreshCw className="w-10 h-10 text-adawi-gold" />
                </div>
                <h3 className="text-lg font-semibold text-adawi-brown mb-2">Retours</h3>
                <p className="text-sm text-black">Politique de retour</p>
              </a>

              <a href="/livraison" className="bg-white rounded-2xl p-6 shadow-lg border border-adawi-gold/20 hover:shadow-xl transition-all duration-300 hover:scale-105 text-center group">
                <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Truck className="w-10 h-10 text-adawi-gold" />
                </div>
                <h3 className="text-lg font-semibold text-adawi-brown mb-2">Livraison</h3>
                <p className="text-sm text-black">Infos de livraison</p>
              </a>

              <a href="/services" className="bg-white rounded-2xl p-6 shadow-lg border border-adawi-gold/20 hover:shadow-xl transition-all duration-300 hover:scale-105 text-center group">
                <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Settings className="w-10 h-10 text-adawi-gold" />
                </div>
                <h3 className="text-lg font-semibold text-adawi-brown mb-2">Nos Services</h3>
                <p className="text-sm text-black">Découvrez nos services</p>
              </a>
            </div>
          </div>
        </section>

        {/* Horaires et Contact */}
        <section className="py-16 px-4 sm:px-6 bg-gradient-to-r from-adawi-gold to-adawi-brown">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
              Nos Horaires de Support
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-white mb-4">Support en Ligne</h3>
                <div className="space-y-2 text-white/90">
                  <p>Lundi - Vendredi : 9h00 - 18h00</p>
                  <p>Samedi : 10h00 - 16h00</p>
                  <p>Dimanche : Fermé</p>
                </div>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-white mb-4">Support Téléphonique</h3>
                <div className="space-y-2 text-white/90">
                  <p>Lundi - Vendredi : 9h00 - 17h00</p>
                  <p>Samedi : 10h00 - 14h00</p>
                  <p>Dimanche : Fermé</p>
                </div>
              </div>
            </div>

            <p className="text-xl text-white/90 mb-8">
              En dehors de ces horaires, vous pouvez nous envoyer un email ou créer un ticket. Nous vous répondrons dès que possible.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-white text-adawi-brown px-8 py-4 rounded-full font-semibold hover:bg-adawi-beige transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Nous Contacter
              </a>
              
              <a
                href="mailto:sergiodaklu12@gmail.com"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-adawi-brown transition-all duration-300 hover:shadow-xl transform hover:scale-105"
              >
                sergiodaklu12@gmail.com
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

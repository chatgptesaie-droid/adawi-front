import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import { useState } from "react";
import { Facebook, Instagram, Linkedin, Github, AlertCircle } from "lucide-react";
import { Link } from "@remix-run/react";
import { readToken } from "~/utils/session.server";

export const meta: MetaFunction = () => {
    return [
        { title: "Contact - Adawi" },
        { name: "description", content: "Contactez-nous pour toute question. Nous sommes situés à Carrefour Bodjona." },
    ];
};

// Loader pour vérifier l'état de connexion côté serveur
export const loader: LoaderFunction = async ({ request }) => {
    const token = await readToken(request);
    const isLoggedIn = !!token;

    return json({ isLoggedIn });
};

const socialIcons = [
    { label: "TikTok", href: "#", icon: <Github className="w-4 h-4" /> },
    { label: "Facebook", href: "#", icon: <Facebook className="w-4 h-4" /> },
    { label: "Instagram", href: "#", icon: <Instagram className="w-4 h-4" /> },
    { label: "LinkedIn", href: "#", icon: <Linkedin className="w-4 h-4" /> },
];

export default function Contact() {
    const { isLoggedIn } = useLoaderData<typeof loader>();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
        acceptTerms: false
    });

    const [status, setStatus] = useState<null | string>(null);
    const [showLoginError, setShowLoginError] = useState<boolean>(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
        }));

        // Masquer l'erreur de connexion si l'utilisateur commence à taper
        if (showLoginError) {
            setShowLoginError(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Vérifier si l'utilisateur est connecté
        if (!isLoggedIn) {
            setShowLoginError(true);
            setStatus(" Vous devez être connecté pour envoyer un message.");
            return;
        }

        setStatus("Envoi en cours...");
        setShowLoginError(false);

        try {
            console.log("Tentative d'envoi du message...");

            const res = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    message: formData.message
                })
            });

            console.log("Réponse reçue:", res.status, res.statusText);

            // Vérifier si la réponse est du JSON valide
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                console.error("Réponse non-JSON reçue:", contentType);
                setStatus(" Erreur : Réponse invalide du serveur");
                return;
            }

            const data = await res.json();
            console.log("Données reçues:", data);

            if (res.ok) {
                setStatus(" Message envoyé avec succès!");
                setFormData({ name: "", email: "", message: "", acceptTerms: false });
            } else {
                if (res.status === 401) {
                    setShowLoginError(true);
                    setStatus(" Vous devez être connecté pour envoyer un message.");
                } else if (res.status === 404) {
                    setStatus(" Erreur : Endpoint non trouvé. Vérifiez l'URL de l'API.");
                } else if (res.status === 500) {
                    setStatus(" Erreur serveur. Réessayez plus tard.");
                } else {
                    setStatus(` Erreur ${res.status}: ${data.message || "Impossible d'envoyer le message"}`);
                }
            }
        } catch (error) {
            console.error("Erreur détaillée:", error);

            // Gestion d'erreurs plus spécifique
            if (error instanceof TypeError && error.message.includes('fetch')) {
                setStatus(" Impossible de contacter le serveur. Vérifiez votre connexion internet.");
            } else if (error instanceof SyntaxError) {
                setStatus(" Erreur de format de réponse du serveur.");
            } else {
                setStatus(` Erreur technique: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
            }
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <TopBanner />
            <Header />
            <section className="bg-adawi-beige px-4 sm:px-6 py-8 sm:py-12">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-center gap-8">

                    {/* Infos de contact */}
                    <div className="w-full md:w-[45%] space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
                        <h1 className="text-2xl font-bold text-black mb-6">Entrez en contact</h1>
                        <div className="space-y-3 text-black">
                            <p className="text-sm">Nous sommes situés à Carrefour Bodjona</p>
                            <p className="text-sm">Adawi10@gmail.com</p>
                            <p className="text-sm">+228 90000000</p>
                        </div>
                        <div className="flex space-x-3 pt-3 justify-center md:justify-start">
                            {socialIcons.map((item, idx) => (
                                <a
                                    key={idx}
                                    href={item.href}
                                    className="w-8 h-8 bg-black text-white rounded-sm flex items-center justify-center hover:bg-adawi-gold transition-colors duration-300"
                                    aria-label={item.label}
                                >
                                    {item.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Formulaire */}
                    <div className="w-full md:w-[45%] max-w-md space-y-4 flex flex-col items-center md:items-start mx-auto">
                        <h2 className="text-xl font-bold mb-6 text-black text-center md:text-left w-full">Envoyez-nous un message</h2>

                        {/* Message d'erreur de connexion - affiché seulement si pas connecté */}
                        {!isLoggedIn && (
                            <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                <div className="flex items-start">
                                    <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-red-800 mb-2">
                                            Connexion requise
                                        </h3>
                                        <p className="text-sm text-red-700 mb-3">
                                            Vous devez être connecté pour envoyer un message. Connectez-vous ou créez un compte pour continuer.
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <Link
                                                to="/login"
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
                                            >
                                                Se connecter
                                            </Link>
                                            <Link
                                                to="/signup"
                                                className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 transition-colors duration-200"
                                            >
                                                Créer un compte
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Message d'erreur dynamique - affiché lors de la soumission */}
                        {showLoginError && isLoggedIn && (
                            <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                <div className="flex items-start">
                                    <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-red-800 mb-2">
                                            Session expirée
                                        </h3>
                                        <p className="text-sm text-red-700 mb-3">
                                            Votre session a expiré. Veuillez vous reconnecter.
                                        </p>
                                        <Link
                                            to="/login"
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
                                        >
                                            Se reconnecter
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="w-full space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-xs font-medium text-black mb-1">Nom</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    disabled={!isLoggedIn}
                                    className={`w-full px-2 py-2 border-2 border-adawi-gold rounded-md focus:outline-none focus:ring-1 focus:ring-adawi-gold bg-white text-black text-sm ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-xs font-medium text-black mb-1">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={!isLoggedIn}
                                    className={`w-full px-2 py-2 border-2 border-adawi-gold rounded-md focus:outline-none focus:ring-1 focus:ring-adawi-gold bg-white text-black text-sm ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-xs font-medium text-black mb-1">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    disabled={!isLoggedIn}
                                    rows={3}
                                    className={`w-full px-2 py-2 border-2 border-adawi-gold rounded-md focus:outline-none focus:ring-1 focus:ring-adawi-gold bg-white text-black text-sm ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    required
                                />
                            </div>
                            <div className="flex items-start space-x-2">
                                <input
                                    type="checkbox"
                                    id="acceptTerms"
                                    name="acceptTerms"
                                    checked={formData.acceptTerms}
                                    onChange={handleInputChange}
                                    disabled={!isLoggedIn}
                                    className={`mt-0.5 w-4 h-4 bg-white border-2 border-adawi-gold rounded text-adawi-gold focus:ring-2 focus:ring-adawi-gold checked:bg-adawi-gold ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    required
                                />
                                <label htmlFor="acceptTerms" className={`text-xs text-black ${!isLoggedIn ? 'opacity-50' : ''
                                    }`}>
                                    J'accepte tous les termes <br /> et conditions
                                </label>
                            </div>
                            <button
                                type="submit"
                                disabled={!isLoggedIn}
                                className={`w-full font-medium py-2 px-4 rounded-full transition-colors duration-300 shadow-sm hover:shadow-md text-sm ${isLoggedIn
                                        ? "bg-adawi-gold hover:bg-adawi-gold/90 text-white"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                            >
                                {isLoggedIn ? "Envoyer" : "Connexion requise"}
                            </button>
                        </form>

                        {/* Message d'état */}
                        {status && (
                            <p className="text-sm mt-2 text-center w-full text-black">{status}</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Carte */}
            <section className="bg-white">
                <div className="w-full h-[300px] sm:h-[400px] relative rounded-lg shadow-md overflow-hidden">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d865.077403022854!2d1.1895910107109433!3d6.204954871781036!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1023e188533ea905%3A0x469c30b5ad8af216!2sHognekaba!5e1!3m2!1sen!2stg!4v1755793854401!5m2!1sen!2stg"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Localisation Adawi - Carrefour Bodjona, Lomé, Togo"
                        className="w-full h-full"
                    />
                </div>
            </section>

            <Footer />
        </div>
    );
}

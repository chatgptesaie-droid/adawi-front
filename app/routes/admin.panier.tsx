import { json, type LoaderFunctionArgs, type MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate, useFetcher } from "@remix-run/react";
import { useState, useEffect } from "react";
import { Link } from "@remix-run/react";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import { readSessionData } from "~/utils/session.server";
import { CreditCard, Loader2, X, CheckCircle, Calendar, Users } from "lucide-react";


export const meta: MetaFunction = () => {
    return [
        { title: "Panier - Adawi" },
        { name: "description", content: "Votre panier d'achats - Finalisez votre commande" },
    ];
};

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
    images: string[];
    stock: number;
    product_id: string;
}

interface LoaderData {
    cartItems: CartItem[];
    total: number;
    isLoggedIn: boolean;
    error?: string;
    debugInfo?: any;
    sessionData?: {
        session_id: string;
        access_token: string;
    };
}

interface CreateInstallmentOrderData {
    installments_count: number;
    first_payment_amount: number;
    installment_amount: number;
    due_dates: string[];
    customer_name: string;
    customer_phone: string;
    user_email?: string;
    notes?: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
    try {
        console.log(" Début du loader panier");

        const sessionData = await readSessionData(request);
        console.log(" Session data:", sessionData);

        if (!sessionData || !sessionData.session_id) {
            console.log(" Pas de session_id trouvé");
            return json<LoaderData>({
                cartItems: [],
                total: 0,
                isLoggedIn: false,
                error: "Vous devez être connecté pour voir votre panier",
                debugInfo: { sessionData }
            });
        }

        console.log(" Session ID trouvé:", sessionData.session_id);

        const apiUrl = `${process.env.API_BASE_URL || 'http://localhost:8000'}/cart/?session-id=${sessionData.session_id}`;
        console.log(" Appel API:", apiUrl);

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionData.access_token}`,
            },
        });

        console.log(" Réponse API:", {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });

        if (!response.ok) {
            if (response.status === 401) {
                return json<LoaderData>({
                    cartItems: [],
                    total: 0,
                    isLoggedIn: false,
                    error: "Votre session a expiré. Veuillez vous reconnecter.",
                    debugInfo: {
                        sessionData,
                        apiResponse: { status: response.status, statusText: response.statusText }
                    }
                });
            }

            const errorText = await response.text();
            console.log(" Erreur API:", errorText);

            throw new Error(`Erreur API: ${response.status} - ${errorText}`);
        }

        const cartData = await response.json();
        console.log(" Données du panier reçues:", cartData);

        const cartItems: CartItem[] = cartData.items?.map((item: any) => ({
            id: item.id || item.product_id,
            name: item.name || item.product_name || 'Produit sans nom',
            price: item.price || 0,
            quantity: item.quantity || 1,
            size: item.size,
            color: item.color,
            images: item.images || ['/placeholder-product.png'],
            stock: item.stock || 0,
            product_id: item.product_id
        })) || [];

        const total = cartData.total || cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        console.log(" Panier transformé:", { itemsCount: cartItems.length, total });

        return json<LoaderData>({
            cartItems,
            total,
            isLoggedIn: true,
            sessionData: {
                session_id: sessionData.session_id,
                access_token: sessionData.access_token
            },
            debugInfo: {
                sessionData: { session_id: sessionData.session_id, hasToken: !!sessionData.access_token },
                apiResponse: { status: response.status, itemsCount: cartItems.length }
            }
        });

    } catch (error) {
        console.error(" Erreur dans le loader:", error);
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        return json<LoaderData>({
            cartItems: [],
            total: 0,
            isLoggedIn: false,
            error: `Erreur lors du chargement du panier: ${errorMessage}`,
            debugInfo: { error: errorMessage }
        }, { status: 500 });
    }
}

export async function action({ request }: ActionFunctionArgs) {
    const sessionData = await readSessionData(request);
    if (!sessionData || !sessionData.session_id) {
        return json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await request.formData();
    const intent = formData.get("intent") as string;

    try {
        if (intent === "createInstallmentOrder") {
            const orderData: CreateInstallmentOrderData = {
                installments_count: parseInt(formData.get("installments_count") as string),
                first_payment_amount: parseFloat(formData.get("first_payment_amount") as string),
                installment_amount: parseFloat(formData.get("installment_amount") as string),
                due_dates: JSON.parse(formData.get("due_dates") as string),
                customer_name: formData.get("customer_name") as string,
                customer_phone: formData.get("customer_phone") as string,
                user_email: formData.get("user_email") as string || undefined,
                notes: formData.get("notes") as string || undefined,
            };

            const apiUrl = `${process.env.API_BASE_URL || 'http://localhost:8000'}/installments/create-order`;

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionData.access_token}`,
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                return json({
                    error: errorData.detail || `Erreur ${response.status}: ${response.statusText}`
                }, { status: response.status });
            }

            const result = await response.json();
            return json({ success: true, data: result });
        }

        return json({ error: "Action non reconnue" }, { status: 400 });
    } catch (error) {
        console.error("Erreur dans l'action:", error);
        return json({ error: "Erreur de connexion au serveur" }, { status: 500 });
    }
}

export default function panier() {
    const loaderData = useLoaderData<LoaderData>();
    const navigate = useNavigate();
    const fetcher = useFetcher<LoaderData>();
    const actionFetcher = useFetcher<{ success?: boolean; error?: string; data?: any }>();

    const currentData = fetcher.data || loaderData;
    const cartItems = currentData.cartItems || [];
    const total = currentData.total || 0;
    const isLoggedIn = currentData.isLoggedIn || false;
    const error = currentData.error;
    const debugInfo = currentData.debugInfo;
    const sessionData = currentData.sessionData;
    const [orderNote, setOrderNote] = useState('');
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [isClearing, setIsClearing] = useState(false);
    const [animatingItems, setAnimatingItems] = useState<Set<string>>(new Set());
    const [isLoaded, setIsLoaded] = useState(false);

    const [showInstallmentModal, setShowInstallmentModal] = useState(false);
    const [installmentData, setInstallmentData] = useState<Partial<CreateInstallmentOrderData>>({
        installments_count: 2,
        first_payment_amount: Math.round(total * 0.5),
        installment_amount: Math.round(total * 0.5),
        due_dates: [],
        customer_name: '',
        customer_phone: '',
        user_email: '',
        notes: ''
    });
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (total > 0) {
            setInstallmentData(prev => ({
                ...prev,
                first_payment_amount: Math.round(total * 0.5),
                installment_amount: Math.round(total * 0.5)
            }));
        }
    }, [total]);

    useEffect(() => {
        if (actionFetcher.data?.success) {
            setSuccessMessage("Commande en versements créée avec succès!");
            setShowInstallmentModal(false);

            setTimeout(() => {
                navigate('/admin/orders');
            }, 2000);
        }

        if (actionFetcher.data?.error) {
            setErrorMessage(actionFetcher.data.error);
        }
    }, [actionFetcher.data, navigate]);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => setErrorMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    // Fonction pour calculer les dates d'échéance automatiquement
    const calculateDueDates = (count: number, startDate: Date = new Date()) => {
        const dates = [];
        const today = new Date();
        
        // S'assurer que la date de début n'est pas dans le passé
        const validStartDate = startDate < today ? today : startDate;
        
        for (let i = 0; i < count; i++) {
            const date = new Date(validStartDate);
            date.setMonth(date.getMonth() + i);
            dates.push(date.toISOString());
        }
        return dates;
    };

    // Fonction pour valider une date par rapport à la date précédente
    const isValidDate = (date: Date, previousDate: Date | null) => {
        if (!previousDate) return true;
        return date > previousDate;
    };

    // Fonction pour formater les montants
    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Gestion des erreurs
    if (error) {
        return (
            <div className="min-h-screen bg-white">
                <TopBanner />
                <Header />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-16 text-center">
                    <div className={`transform transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                        <h1 className="text-2xl sm:text-3xl font-bold text-black mb-6 sm:mb-8">PANIER</h1>
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 sm:p-12 shadow-lg">
                            <div className="animate-bounce">
                                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-lg sm:text-xl font-semibold text-red-800 mb-2">Erreur de chargement</h2>
                            <p className="text-red-600 mb-6 text-sm sm:text-base">{error}</p>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
                                >
                                    Réessayer
                                </button>
                                <Link
                                    to="/login"
                                    className="inline-block bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
                                >
                                    Se connecter
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Si pas connecté
    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-white">
                <TopBanner />
                <Header />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-16 text-center">
                    <div className={`transform transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                        <h1 className="text-2xl sm:text-3xl font-bold text-black mb-6 sm:mb-8">PANIER</h1>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 sm:p-12 shadow-lg">
                            <div className="animate-pulse">
                                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h2 className="text-lg sm:text-xl font-semibold text-yellow-800 mb-2">Connexion requise</h2>
                            <p className="text-yellow-700 mb-6 text-sm sm:text-base">Vous devez être connecté pour voir votre panier</p>
                            <Link
                                to="/login"
                                className="inline-block bg-adawi-gold hover:bg-adawi-gold/90 text-white font-medium py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                Se connecter
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const handleIncrease = async (item: CartItem) => {
        setIsUpdating(item.product_id);
        setAnimatingItems(prev => new Set(prev).add(item.product_id));

        try {
            const response = await fetch('/api/cart/increase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: item.product_id,
                    size: item.size,
                    color: item.color
                })
            });
            if (response.ok) {
                setTimeout(() => {
                    fetcher.load('/admin/panier');
                }, 300);
            } else {
                console.error('Failed to increase quantity');
                alert('Erreur lors de l\'augmentation de la quantité');
            }
        } catch (error) {
            console.error('Error increasing quantity:', error);
            alert('Erreur de connexion. Veuillez réessayer.');
        } finally {
            setTimeout(() => {
                setIsUpdating(null);
                setAnimatingItems(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(item.product_id);
                    return newSet;
                });
            }, 500);
        }
    };

    const handleDecrease = async (item: CartItem) => {
        setIsUpdating(item.product_id);
        setAnimatingItems(prev => new Set(prev).add(item.product_id));

        try {
            const response = await fetch('/api/cart/decrease', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: item.product_id,
                    size: item.size,
                    color: item.color
                })
            });
            if (response.ok) {
                setTimeout(() => {
                    fetcher.load('/admin/panier');
                }, 300);
            } else {
                console.error('Failed to decrease quantity');
                alert('Erreur lors de la diminution de la quantité');
            }
        } catch (error) {
            console.error('Error decreasing quantity:', error);
            alert('Erreur de connexion. Veuillez réessayer.');
        } finally {
            setTimeout(() => {
                setIsUpdating(null);
                setAnimatingItems(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(item.product_id);
                    return newSet;
                });
            }, 500);
        }
    };

    const removeItem = async (itemId: string) => {
        setIsUpdating(itemId);
        setAnimatingItems(prev => new Set(prev).add(itemId));

        try {
            console.log(' Suppression produit:', { itemId });

            const apiBaseUrl = 'http://localhost:8000';
            const apiUrl = `${apiBaseUrl}/cart/remove/${itemId}`;
            console.log(' Appel API remove:', apiUrl);

            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionData?.access_token || ''}`,
                    'session-id': sessionData?.session_id || '',
                },
            });

            console.log(' Réponse remove:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            if (!response.ok) {
                let errorMessage = `Erreur ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorData.message || errorMessage;
                } catch {
                    const errorText = await response.text();
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log(' Résultat remove:', result);

            setTimeout(() => {
                window.location.reload();
            }, 300);

        } catch (error) {
            console.error(' Erreur réseau:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';

            if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
                alert("Votre session a expiré. Veuillez vous reconnecter.");
                navigate('/login');
            } else {
                alert(`Erreur de connexion: ${errorMessage}. Veuillez réessayer.`);
            }
        } finally {
            setTimeout(() => {
                setIsUpdating(null);
                setAnimatingItems(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(itemId);
                    return newSet;
                });
            }, 500);
        }
    };

    const clearCart = async () => {
        if (!confirm('Êtes-vous sûr de vouloir vider votre panier ? Cette action est irréversible.')) {
            return;
        }

        setIsClearing(true);

        try {
            console.log(' Vidage du panier');

            const apiBaseUrl = 'http://localhost:8000';
            const apiUrl = `${apiBaseUrl}/cart/clear`;
            console.log(' Appel API clear:', apiUrl);

            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionData?.access_token || ''}`,
                    'session-id': sessionData?.session_id || '',
                },
            });

            console.log(' Réponse clear:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            if (!response.ok) {
                let errorMessage = `Erreur ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorData.message || errorMessage;
                } catch {
                    const errorText = await response.text();
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log(' Résultat clear:', result);

            setTimeout(() => {
                window.location.reload();
            }, 500);

        } catch (error) {
            console.error(' Erreur réseau:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';

            if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
                alert("Votre session a expiré. Veuillez vous reconnecter.");
                navigate('/login');
            } else {
                alert(`Erreur de connexion: ${errorMessage}. Veuillez réessayer.`);
            }
        } finally {
            setIsClearing(false);
        }
    };

    const handlePhysicalSale = async () => {
        if (!cartItems || cartItems.length === 0) {
            alert("Votre panier est vide");
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/orders/physical-sale', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionData?.access_token}`,
                },
            });

            if (response.ok) {
                const result = await response.json();
                alert(` Vente créée! Commande: ${result.identifier}`);
                navigate('/admin/orders');
            } else {
                const errorText = await response.text();
                alert(`Erreur ${response.status}: ${errorText}`);
            }
        } catch (error) {
            console.error('Erreur:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
            alert(`Erreur: ${errorMessage}`);
        }
    };

    // Vérifications de sécurité pour l'état du panier
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-16 text-center">
                    <div className={`transform transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                        <h1 className="text-2xl sm:text-3xl font-bold text-black mb-6 sm:mb-8">PANIER</h1>
                        <div className="bg-gray-50 rounded-xl p-6 sm:p-12 shadow-lg">
                            <div className="animate-pulse">
                                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2 4h12m-8 4a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
                                </svg>
                            </div>
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Votre panier est vide</h2>
                            <p className="text-gray-600 mb-6 text-sm sm:text-base">Découvrez nos produits et ajoutez-les à votre panier</p>
                            <Link
                                to="/admin/products"
                                className="inline-block bg-adawi-gold hover:bg-adawi-gold/90 text-white font-medium py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                Découvrir nos produits
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
                {/* Titre avec compteur d'articles et bouton vider */}
                <div className={`text-center mb-8 sm:mb-12 transform transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                    <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2 tracking-wider">PANIER</h1>
                    <p className="text-gray-600 mb-4 text-sm sm:text-base">
                        Frais de livraison payé à la réception de la marchandise
                    </p>

                    {/* Bouton vider le panier */}
                    {cartItems.length > 0 && (
                        <button
                            onClick={clearCart}
                            disabled={isClearing || isUpdating !== null}
                            className={`text-sm text-red-600 hover:text-red-800 underline transition-all duration-300 transform hover:scale-105 ${isClearing || isUpdating !== null ? 'cursor-not-allowed opacity-50' : ''
                                }`}
                        >
                            {isClearing ? (
                                <span className="flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Vidage en cours...
                                </span>
                            ) : (
                                'Vider le panier'
                            )}
                        </button>
                    )}
                </div>

                {/* En-têtes du tableau - seulement sur desktop */}
                <div className="hidden lg:grid lg:grid-cols-12 gap-4 pb-4 border-b border-gray-200 mb-8">
                    <div className="col-span-6">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">PRODUIT</h3>
                    </div>
                    <div className="col-span-3 text-center">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">QUANTITÉ</h3>
                    </div>
                    <div className="col-span-3 text-right">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">TOTAL</h3>
                    </div>
                </div>

                {/* Articles du panier */}
                <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
                    {cartItems.map((item, index) => {
                        const itemPrice = item.price || 0;
                        const quantity = item.quantity || 1;
                        const itemTotal = itemPrice * quantity;
                        const itemId = item.product_id || item.id;
                        const isAnimating = animatingItems.has(itemId);

                        return (
                            <div
                                key={itemId}
                                className={`bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-500 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                                    } ${isAnimating ? 'scale-105 shadow-lg' : 'hover:scale-[1.02]'}`}
                                style={{
                                    animationDelay: `${index * 100}ms`,
                                    transitionDelay: isLoaded ? `${index * 100}ms` : '0ms'
                                }}
                            >
                                {/* Version Mobile */}
                                <div className="lg:hidden p-4 sm:p-6">
                                    <div className="flex space-x-4">
                                        {/* Image */}
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            <img
                                                src={item.images?.[0] || '/placeholder-product.png'}
                                                alt={item.name}
                                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/placeholder-product.png';
                                                }}
                                            />
                                        </div>

                                        {/* Informations produit */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base sm:text-lg font-medium text-black mb-1 truncate">
                                                {item.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {itemPrice.toLocaleString()} F CFA
                                            </p>
                                            <p className="text-xs text-gray-500 mb-3">
                                                {(item.size || 'M').toUpperCase()} / {(item.color || 'NOIR').toUpperCase()}
                                            </p>

                                            {/* Contrôles quantité mobile */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => handleDecrease(item)}
                                                        disabled={isUpdating === itemId || quantity <= 1 || isClearing}
                                                        className={`w-8 h-8 border rounded-full flex items-center justify-center text-lg font-medium transition-all duration-200 ${quantity <= 1 || isUpdating === itemId || isClearing
                                                            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                                            : 'border-gray-300 text-gray-600 hover:bg-gray-50 active:scale-95'
                                                            }`}
                                                    >
                                                        {isUpdating === itemId ? (
                                                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                                        ) : (
                                                            '−'
                                                        )}
                                                    </button>
                                                    <span className="text-base font-medium text-black min-w-[2rem] text-center">
                                                        {quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => handleIncrease(item)}
                                                        disabled={isUpdating === itemId || isClearing}
                                                        className={`w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all duration-200 text-lg font-medium active:scale-95 ${isUpdating === itemId || isClearing ? 'cursor-not-allowed opacity-50' : ''
                                                            }`}
                                                    >
                                                        {isUpdating === itemId ? (
                                                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                                        ) : (
                                                            '+'
                                                        )}
                                                    </button>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-lg font-medium text-black mb-1">
                                                        {itemTotal.toLocaleString()} F CFA
                                                    </p>
                                                    <button
                                                        onClick={() => removeItem(itemId)}
                                                        disabled={isUpdating === itemId || isClearing}
                                                        className={`text-sm text-gray-500 hover:text-red-600 underline transition-colors ${isUpdating === itemId || isClearing ? 'cursor-not-allowed opacity-50' : ''
                                                            }`}
                                                    >
                                                        {isUpdating === itemId ? 'Suppression...' : 'Supprimer'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Version Desktop */}
                                <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center p-6">
                                    {/* Produit */}
                                    <div className="col-span-6 flex items-center space-x-4">
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            <img
                                                src={item.images?.[0] || '/placeholder-product.png'}
                                                alt={item.name}
                                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/placeholder-product.png';
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-medium text-black mb-1 truncate">
                                                {item.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {itemPrice.toLocaleString()} F CFA
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {(item.size || 'M').toUpperCase()} / {(item.color || 'NOIR').toUpperCase()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quantité */}
                                    <div className="col-span-3 flex items-center justify-center space-x-3">
                                        <button
                                            onClick={() => handleDecrease(item)}
                                            disabled={isUpdating === itemId || quantity <= 1 || isClearing}
                                            className={`w-8 h-8 border rounded-full flex items-center justify-center text-lg font-medium transition-all duration-200 ${quantity <= 1 || isUpdating === itemId || isClearing
                                                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'border-gray-300 text-gray-600 hover:bg-gray-50 active:scale-95'
                                                }`}
                                        >
                                            {isUpdating === itemId ? (
                                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                '−'
                                            )}
                                        </button>
                                        <span className="text-base font-medium text-black min-w-[2rem] text-center">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => handleIncrease(item)}
                                            disabled={isUpdating === itemId || isClearing}
                                            className={`w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all duration-200 text-lg font-medium active:scale-95 ${isUpdating === itemId || isClearing ? 'cursor-not-allowed opacity-50' : ''
                                                }`}
                                        >
                                            {isUpdating === itemId ? (
                                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                '+'
                                            )}
                                        </button>
                                    </div>

                                    {/* Total et Remove */}
                                    <div className="col-span-3 text-right space-y-2">
                                        <p className="text-lg font-medium text-black">
                                            {itemTotal.toLocaleString()} F CFA
                                        </p>
                                        <button
                                            onClick={() => removeItem(itemId)}
                                            disabled={isUpdating === itemId || isClearing}
                                            className={`text-sm text-gray-500 hover:text-red-600 underline transition-colors ${isUpdating === itemId || isClearing ? 'cursor-not-allowed opacity-50' : ''
                                                }`}
                                        >
                                            {isUpdating === itemId ? 'Suppression...' : 'Supprimer'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Section inférieure */}
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 transform transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`} style={{ transitionDelay: `${cartItems.length * 100 + 200}ms` }}>

                    {/* Note de commande */}
                    <div className="order-2 lg:order-1">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
                            <h3 className="text-base font-medium text-black mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-adawi-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Note de commande
                            </h3>
                            <textarea
                                value={orderNote}
                                onChange={(e) => setOrderNote(e.target.value)}
                                placeholder="Comment pouvons-nous vous aider? (instructions de livraison, demandes spéciales...)"
                                disabled={isClearing}
                                className={`w-full h-28 sm:h-32 p-4 border border-gray-200 bg-white text-black rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-adawi-gold focus:border-transparent text-sm transition-all duration-300 ${isClearing ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300'
                                    }`}
                                maxLength={500}
                            />
                            <div className="text-right text-xs text-gray-400 mt-2">
                                {orderNote.length}/500 caractères
                            </div>
                        </div>
                    </div>

                    {/* Résumé et checkout */}
                    <div className="order-1 lg:order-2">
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all duration-300 sticky top-6">
                            <h3 className="text-lg font-medium text-black mb-6 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-adawi-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                Résumé de commande
                            </h3>

                            {/* Calculs */}
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-base py-2">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span className="font-medium text-black">{total.toLocaleString()} F CFA</span>
                                </div>
                                <div className="flex justify-between text-base py-2">
                                    <span className="text-gray-600">Taxes:</span>
                                    <span className="font-medium text-black">0 F CFA</span>
                                </div>
                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex justify-between text-xl font-bold">
                                        <span className="text-black">Total:</span>
                                        <span className="text-adawi-gold">{total.toLocaleString()} F CFA</span>
                                    </div>
                                </div>

                                {/* Nombre d'articles */}
                                <div className="text-center text-sm text-gray-500 bg-gray-50 rounded-lg py-2">
                                    {cartItems.length} article{cartItems.length > 1 ? 's' : ''} dans votre panier
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-xs text-gray-500 text-center leading-relaxed">
                                    Taxes et frais de livraison calculés à la commande.
                                    <br />
                                    Frais de livraison payé à la réception de la marchandise
                                </p>

                                {/* Boutons d'action */}
                                <div className="space-y-3">
                                    {/* Bouton vente physique */}
                                    <button
                                        onClick={handlePhysicalSale}
                                        disabled={isClearing}
                                        className={`w-full bg-gradient-to-r from-adawi-gold to-adawi-gold text-white font-medium py-4 px-6 text-base rounded-full hover:bg-adawi-gold transition-all duration-300 tracking-wider transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl ${isClearing ? 'opacity-50 cursor-not-allowed' : 'animate-pulse hover:animate-none'
                                            }`}
                                    >
                                        <span className="flex items-center justify-center">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            VENDRE
                                        </span>
                                    </button>

                                    {/* Nouveau bouton pour créer une commande en versements */}
                                    <button
                                        onClick={() => {
                                            setInstallmentData(prev => ({
                                                ...prev,
                                                installments_count: 2,
                                                first_payment_amount: Math.round(total * 0.5),
                                                installment_amount: Math.round(total * 0.5),
                                                due_dates: calculateDueDates(2)
                                            }));
                                            setShowInstallmentModal(true);
                                        }}
                                        disabled={isClearing || total <= 0}
                                        className={`w-full bg-gradient-to-r from-adawi-gold to-adawi-gold text-white font-medium py-4 px-6 text-base rounded-full hover:bg-adawi-gold transition-all duration-300 tracking-wider transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl ${isClearing ? 'opacity-50 cursor-not-allowed' : 'animate-pulse hover:animate-none'
                                            }`}
                                    >
                                        <span className="flex items-center justify-center">
                                            <CreditCard className="w-5 h-5 mr-2" />
                                            CRÉER VERSEMENTS
                                        </span>
                                    </button>
                                </div>

                                {/* Méthodes de paiement acceptées */}
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 mb-2">Méthodes de paiement acceptées:</p>
                                    <div className="flex justify-center space-x-2">
                                        <div className="w-8 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded text-white text-[8px] flex items-center justify-center font-bold">FLOOZ</div>
                                        <div className="w-8 h-5 bg-gradient-to-r from-red-500 to-orange-500 rounded text-white text-[8px] flex items-center justify-center font-bold">MIX</div>
                                        <div className="w-8 h-5 bg-gradient-to-r from-green-500 to-green-600 rounded text-white text-[8px] flex items-center justify-center font-bold">$</div>
                                    </div>
                                </div>

                                {/* Lien continuer les achats */}
                                <div className="text-center pt-2">
                                    <Link
                                        to="/boutique"
                                        className="text-sm text-gray-600 hover:text-adawi-gold underline transition-all duration-300 hover:no-underline flex items-center justify-center group"
                                    >
                                        <svg className="w-4 h-4 mr-1 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Continuer les achats
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section informations supplémentaires */}
                <div className={`mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 transform transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`} style={{ transitionDelay: `${cartItems.length * 100 + 400}ms` }}>

                    {/* Livraison */}
                    <div className="text-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105">
                        <div className="w-12 h-12 bg-adawi-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-adawi-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h4 className="font-medium text-black mb-2">Livraison rapide</h4>
                        <p className="text-sm text-gray-600">Livraison sous 24-48h dans toute la région</p>
                    </div>

                    {/* Support */}
                    <div className="text-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105">
                        <div className="w-12 h-12 bg-adawi-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-adawi-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h4 className="font-medium text-black mb-2">Support 24/7</h4>
                        <p className="text-sm text-gray-600">Une question? Notre équipe est là pour vous aider</p>
                    </div>

                    {/* Garantie */}
                    <div className="text-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105">
                        <div className="w-12 h-12 bg-adawi-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-adawi-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h4 className="font-medium text-black mb-2">Garantie qualité</h4>
                        <p className="text-sm text-gray-600">Satisfaction garantie ou remboursé</p>
                    </div>
                </div>
            </div>

            {/* Modal de création de commande en versements */}
            {showInstallmentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-lg font-semibold flex items-center">
                                <CreditCard className="w-5 h-5 mr-2" />
                                Créer une commande en versements
                            </h3>
                            <button
                                onClick={() => setShowInstallmentModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <actionFetcher.Form 
                            method="post" 
                            className="p-6"
                            onSubmit={(e) => {
                                // Validation des champs obligatoires
                                if (!installmentData.customer_name?.trim()) {
                                    e.preventDefault();
                                    setErrorMessage("Le nom du client est obligatoire");
                                    return;
                                }

                                if (!installmentData.customer_phone?.trim()) {
                                    e.preventDefault();
                                    setErrorMessage("Le téléphone du client est obligatoire");
                                    return;
                                }

                                // Validation des dates
                                const dates = installmentData.due_dates || [];
                                if (dates.length < (installmentData.installments_count || 2)) {
                                    e.preventDefault();
                                    setErrorMessage("Toutes les dates d'échéance doivent être définies");
                                    return;
                                }

                                for (let i = 1; i < dates.length; i++) {
                                    const currentDate = new Date(dates[i]);
                                    const previousDate = new Date(dates[i - 1]);
                                    
                                    if (!isValidDate(currentDate, previousDate)) {
                                        e.preventDefault();
                                        setErrorMessage(`La date du versement ${i + 1} doit être postérieure au versement ${i}`);
                                        return;
                                    }
                                }

                                // Validation des montants
                                if (!installmentData.first_payment_amount || installmentData.first_payment_amount <= 0) {
                                    e.preventDefault();
                                    setErrorMessage("Le montant du premier paiement doit être supérieur à 0");
                                    return;
                                }

                                if (!installmentData.installment_amount || installmentData.installment_amount <= 0) {
                                    e.preventDefault();
                                    setErrorMessage("Le montant par versement doit être supérieur à 0");
                                    return;
                                }

                                // Tout est valide, effacer les erreurs
                                setErrorMessage(null);
                            }}
                        >
                            <input type="hidden" name="intent" value="createInstallmentOrder" />
                            <input type="hidden" name="due_dates" value={JSON.stringify(installmentData.due_dates)} />

                            <div className="space-y-6">
                                {/* Informations client */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-4">Informations Client</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nom du client *
                                            </label>
                                            <input
                                                type="text"
                                                name="customer_name"
                                                value={installmentData.customer_name}
                                                onChange={(e) => setInstallmentData(prev => ({ ...prev, customer_name: e.target.value }))}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                                                placeholder="John Doe"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Téléphone *
                                            </label>
                                            <input
                                                type="tel"
                                                name="customer_phone"
                                                value={installmentData.customer_phone}
                                                onChange={(e) => setInstallmentData(prev => ({ ...prev, customer_phone: e.target.value }))}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                                                placeholder="+2250102030405"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email utilisateur (optionnel)
                                            </label>
                                            <input
                                                type="email"
                                                name="user_email"
                                                value={installmentData.user_email}
                                                onChange={(e) => setInstallmentData(prev => ({ ...prev, user_email: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                                                placeholder="client@example.com"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Si fourni, la commande sera associée à cet utilisateur existant
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Configuration des versements */}
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-4">Configuration des Versements</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nombre de versements *
                                            </label>
                                            <input
                                                type="number"
                                                name="installments_count"
                                                value={installmentData.installments_count}
                                                onChange={(e) => {
                                                    const count = parseInt(e.target.value);
                                                    if (count >= 2) {
                                                        setInstallmentData(prev => ({
                                                            ...prev,
                                                            installments_count: count,
                                                            due_dates: calculateDueDates(count)
                                                        }));
                                                    }
                                                }}
                                                min="2"
                                                max="12"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Premier paiement (F CFA) *
                                            </label>
                                            <input
                                                type="number"
                                                name="first_payment_amount"
                                                value={installmentData.first_payment_amount}
                                                onChange={(e) => {
                                                    const firstPayment = parseFloat(e.target.value);
                                                    setInstallmentData(prev => ({
                                                        ...prev,
                                                        first_payment_amount: firstPayment
                                                    }));
                                                }}
                                                min="0"
                                                step="0.01"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                                                placeholder="50000"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Montant par versement (F CFA) *
                                            </label>
                                            <input
                                                type="number"
                                                name="installment_amount"
                                                value={installmentData.installment_amount}
                                                onChange={(e) => setInstallmentData(prev => ({ ...prev, installment_amount: parseFloat(e.target.value) }))}
                                                min="0"
                                                step="0.01"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                                                placeholder="20000"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Total calculé
                                            </label>
                                            <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                                                {formatAmount((installmentData.first_payment_amount || 0) + (installmentData.installment_amount || 0) * ((installmentData.installments_count || 2) - 1))}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Panier actuel: {formatAmount(total)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Dates d'échéance */}
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-4">Dates d'Échéance</h4>
                                    
                                    {/* Message d'information */}
                                    <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 mb-4">
                                        <div className="flex items-start">
                                            <Calendar className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                                            <div className="text-sm text-blue-800">
                                                <p className="font-medium">Important :</p>
                                                <p>Chaque date de versement doit être postérieure à la date du versement précédent.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {installmentData.due_dates && installmentData.due_dates.map((date, index) => {
                                            const currentDate = date ? new Date(date) : new Date();
                                            const dueDates = installmentData.due_dates || [];
                                            const previousDate = index > 0 && dueDates[index - 1] 
                                                ? new Date(dueDates[index - 1]) 
                                                : null;
                                            const isInvalid = previousDate && !isValidDate(currentDate, previousDate);

                                            return (
                                                <div key={index}>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        {index === 0 ? 'Premier paiement' : `Versement ${index + 1}`}
                                                        {index > 0 && previousDate && (
                                                            <span className="text-xs text-gray-500 ml-1">
                                                                (après le {previousDate.toLocaleDateString('fr-FR')})
                                                            </span>
                                                        )}
                                                    </label>
                                                    <input
                                                        type="datetime-local"
                                                        value={date ? new Date(date).toISOString().slice(0, 16) : ''}
                                                        onChange={(e) => {
                                                            const newDate = new Date(e.target.value);
                                                            const dueDates = installmentData.due_dates || [];
                                                            const previousDate = index > 0 && dueDates[index - 1]
                                                                ? new Date(dueDates[index - 1])
                                                                : null;
                                                            
                                                            if (previousDate && !isValidDate(newDate, previousDate)) {
                                                                setErrorMessage(`La date du versement ${index + 1} doit être postérieure au versement ${index}`);
                                                            } else {
                                                                setErrorMessage(null);
                                                            }

                                                            const newDates = [...dueDates];
                                                            newDates[index] = newDate.toISOString();
                                                            setInstallmentData(prev => ({ ...prev, due_dates: newDates }));
                                                        }}
                                                        required
                                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none ${
                                                            isInvalid ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                        }`}
                                                    />
                                                    {isInvalid && (
                                                        <p className="text-xs text-red-600 mt-1 flex items-center">
                                                            <X className="w-3 h-3 mr-1" />
                                                            Cette date doit être postérieure au versement précédent
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setInstallmentData(prev => ({
                                            ...prev,
                                            due_dates: calculateDueDates(prev.installments_count || 2)
                                        }))}
                                        className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline flex items-center"
                                    >
                                        <Calendar className="w-4 h-4 mr-1" />
                                        Générer automatiquement les dates (mensuel)
                                    </button>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notes (optionnel)
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={installmentData.notes}
                                        onChange={(e) => setInstallmentData(prev => ({ ...prev, notes: e.target.value }))}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                                        placeholder="Informations supplémentaires sur cette commande en versements..."
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col space-y-4">
                                <button
                                    type="submit"
                                    disabled={actionFetcher.state === "submitting"}
                                    className="w-full bg-adawi-gold hover:bg-adawi-gold/90 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center"
                                >
                                    {actionFetcher.state === "submitting" ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Création en cours...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="w-5 h-5 mr-2" />
                                            Créer la commande en versements
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowInstallmentModal(false)}
                                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg transition-all duration-300"
                                >
                                    Annuler
                                </button>
                            </div>
                        </actionFetcher.Form>
                    </div>
                </div>
            )}

            {/* Messages de notification */}
            {successMessage && (
                <div className="fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg max-w-md animate-fade-in-up z-50">
                    <div className="flex">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <p>{successMessage}</p>
                    </div>
                </div>
            )}

            {errorMessage && (
                <div className="fixed bottom-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg max-w-md animate-fade-in-up z-50">
                    <div className="flex">
                        <X className="w-5 h-5 mr-2" />
                        <p>{errorMessage}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
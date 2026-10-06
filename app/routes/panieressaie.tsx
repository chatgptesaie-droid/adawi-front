import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate, useFetcher } from "@remix-run/react";
import { useState, useEffect } from "react";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import { readSessionData } from "~/utils/session.server";

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
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    console.log(" Début du loader panieressaie");

    // Récupérer les données de session
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

    // Appel à l'API pour récupérer le panier
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

    // Transformer les données de l'API vers notre format
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
      debugInfo: {
        sessionData: { session_id: sessionData.session_id, hasToken: !!sessionData.access_token },
        apiResponse: { status: response.status, itemsCount: cartItems.length }
      }
    });

  } catch (error) {
    console.error(" Erreur dans le loader:", error);
    return json<LoaderData>({
      cartItems: [],
      total: 0,
      isLoggedIn: false,
      error: `Erreur lors du chargement du panier: ${error.message}`,
      debugInfo: { error: error.message }
    }, { status: 500 });
  }
}

export default function PanierEssaie() {
  const { cartItems, total, isLoggedIn, error, debugInfo } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  // Gestion des erreurs
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <TopBanner />
        <Header />
        
        <main className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            
            {/* Informations de débogage */}
            <div className="mb-6">
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {showDebug ? "Masquer" : "Afficher"} les infos de débogage
              </button>
              
              {showDebug && debugInfo && (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
                  <h3 className="font-bold mb-2">Informations de débogage :</h3>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-adawi-gold text-white px-6 py-2 rounded-lg hover:bg-adawi-brown transition-colors"
              >
                Réessayer
              </button>
              <button
                onClick={() => navigate("/login")}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Se reconnecter
              </button>
              <button
                onClick={() => navigate("/")}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  // Si pas connecté
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white">
        <TopBanner />
        <Header />
        
        <main className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Connexion requise</h1>
            <p className="text-gray-600 mb-6">Vous devez être connecté pour voir votre panier</p>
            <button
              onClick={() => navigate("/login")}
              className="bg-adawi-gold text-white px-6 py-2 rounded-lg hover:bg-adawi-brown transition-colors"
            >
              Se connecter
            </button>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(itemId);
    
    try {
      // Appel à l'API pour mettre à jour la quantité
      const response = await fetch('/api/cart/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          product_id: itemId,
          quantity: newQuantity
        }),
      });

      if (response.ok) {
        // Recharger la page pour récupérer les données mises à jour
        window.location.reload();
      } else {
        console.error('Erreur lors de la mise à jour de la quantité');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setIsUpdating(itemId);
    
    try {
      // Appel à l'API pour supprimer l'item
      const response = await fetch('/api/cart/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          product_id: itemId
        }),
      });

      if (response.ok) {
        // Recharger la page pour récupérer les données mises à jour
        window.location.reload();
      } else {
        console.error('Erreur lors de la suppression de l\'item');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header avec infos de débogage */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/boutique")}
              className="flex items-center text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Continuer mes achats
            </button>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-black">Mon Panier</h1>
            {debugInfo && (
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="text-xs text-gray-500 hover:text-gray-700 underline mt-1"
              >
                Debug: {showDebug ? "Masquer" : "Afficher"}
              </button>
            )}
          </div>
        </div>

        {/* Panneau de débogage */}
        {showDebug && debugInfo && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-bold text-blue-900 mb-2">Informations de session :</h3>
            <pre className="text-xs text-blue-800 overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        {cartItems.length === 0 ? (
          // Panier vide
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Votre panier est vide</h2>
            <p className="text-gray-600 mb-8">Découvrez nos produits et ajoutez-les à votre panier</p>
            <button
              onClick={() => navigate("/boutique")}
              className="bg-adawi-gold text-white px-8 py-3 rounded-lg hover:bg-adawi-brown transition-colors"
            >
              Découvrir nos produits
            </button>
          </div>
        ) : (
          // Panier avec items
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Liste des produits */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => (
                <div key={item.id || index} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-4">
                    {/* Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.images?.[0] || '/placeholder-product.png'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-product.png';
                        }}
                      />
                    </div>

                    {/* Détails du produit */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-black">{item.name}</h3>
                      {item.size && (
                        <p className="text-sm text-gray-600">Taille: {item.size}</p>
                      )}
                      {item.color && (
                        <p className="text-sm text-gray-600">Couleur: {item.color}</p>
                      )}
                      <p className="text-lg font-bold text-black mt-1">
                        {item.price.toLocaleString()} F CFA
                      </p>
                    </div>

                    {/* Contrôles de quantité */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item.product_id || item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isUpdating === item.id}
                        className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-base font-medium text-black min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product_id || item.id, item.quantity + 1)}
                        disabled={isUpdating === item.id}
                        className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Bouton supprimer */}
                    <button
                      onClick={() => removeItem(item.product_id || item.id)}
                      disabled={isUpdating === item.id}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Résumé de commande */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
                <h3 className="text-xl font-bold text-black mb-4">Résumé</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sous-total</span>
                    <span className="font-medium">{total.toLocaleString()} F CFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Livraison</span>
                    <span className="font-medium">Gratuite</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold">Total</span>
                      <span className="text-lg font-bold">{total.toLocaleString()} F CFA</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/panier")}
                  className="w-full bg-adawi-gold text-white py-3 rounded-lg hover:bg-adawi-brown transition-colors font-medium"
                >
                  Passer la commande
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

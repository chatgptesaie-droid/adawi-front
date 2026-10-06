// routes/profile.tsx
import { LoaderFunction, json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { readToken } from "~/utils/session.server";
import { Form } from "@remix-run/react";
import TopBanner from "~/components/TopBanner";
import CompactHeader from "~/components/CompactHeader";
import Footer from "~/components/Footer";

// Fonction utilitaire pour faire des requêtes avec timeout
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export const loader: LoaderFunction = async ({ request }) => {
  const token = await readToken(request);
  
  // Si pas de token, redirection immédiate vers login
  if (!token) {
    console.log("Pas de token trouvé, redirection vers login");
    return redirect("/login");
  }

  try {
    console.log("Vérification du token utilisateur...");
    
    // Requête avec timeout de 10 secondes
    const res = await fetchWithTimeout(
      "http://localhost:8000/auth/me", 
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      },
      10000 // 10 secondes de timeout
    );

    if (!res.ok) {
      console.log(`Erreur API: ${res.status} ${res.statusText}`);
      
      // Si 401 (non autorisé) ou 403 (interdit), token expiré
      if (res.status === 401 || res.status === 403) {
        console.log("Token expiré ou invalide, redirection vers login");
        return redirect("/login");
      }
      
      // Pour les autres erreurs, on essaie de récupérer le message
      let errorMessage = "Erreur lors de la récupération des données utilisateur";
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (e) {
        // Ignore les erreurs de parsing JSON
      }
      
      return json({ error: errorMessage }, { status: res.status });
    }

    const user = await res.json();
    console.log("Données utilisateur récupérées avec succès");
    return json({ user, error: null });

  } catch (error: any) {
    console.error("Erreur lors de la vérification du token:", error);
    
    // Gestion des différents types d'erreurs
    if (error.name === 'AbortError') {
      console.log("Timeout de la requête, redirection vers login");
      return redirect("/login?error=timeout");
    }
    
    if (error.message?.includes('fetch')) {
      console.log("Erreur réseau, redirection vers login");
      return redirect("/login?error=network");
    }
    
    // Pour toute autre erreur, redirection vers login
    console.log("Erreur inconnue, redirection vers login");
    return redirect("/login?error=unknown");
  }
};

export default function ProfilePage() {
  const data = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  
  // Si on a une erreur mais pas d'utilisateur, afficher l'erreur
  if (data.error && !data.user) {
    return (
      <div className="min-h-screen bg-adawi-beige flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
            <p className="text-gray-600 mb-6">{data.error}</p>
            <div className="space-y-3">
              <a 
                href="/login" 
                className="block w-full bg-adawi-gold text-white py-2 px-4 rounded-lg hover:bg-adawi-gold/90 transition-colors"
              >
                Se reconnecter
              </a>
              <a 
                href="/" 
                className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Retour à l'accueil
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const user = data.user;

  // Indicateur de chargement pendant la navigation
  if (navigation.state === "loading") {
    return (
      <div className="min-h-screen bg-adawi-beige flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-adawi-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-adawi-brown font-medium">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-adawi-beige">
      <TopBanner />
      <CompactHeader />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-adawi-brown via-adawi-brown-light to-adawi-gold p-8 text-white">
            <div className="flex items-center space-x-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>

              {/* User Info */}
              <div>
                <h1 className="text-3xl font-bold mb-2">Mon Profil</h1>
                <p className="text-white/90 text-lg">{user.full_name}</p>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-adawi-brown mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Informations personnelles
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-adawi-beige rounded-lg">
                    <div className="w-10 h-10 bg-adawi-gold/20 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-adawi-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nom complet</p>
                      <p className="font-semibold text-adawi-brown">{user.full_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-adawi-beige rounded-lg">
                    <div className="w-10 h-10 bg-adawi-gold/20 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-adawi-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Adresse email</p>
                      <p className="font-semibold text-adawi-brown">{user.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-adawi-brown mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Informations du compte
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-adawi-beige rounded-lg">
                    <div className="w-10 h-10 bg-adawi-gold/20 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-adawi-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Rôle</p>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-adawi-gold text-white">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-adawi-beige rounded-lg">
                    <div className="w-10 h-10 bg-adawi-gold/20 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-adawi-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Statut du compte</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${ 
                        user.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? "Actif" : "Inactif"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-6 py-3 bg-adawi-beige text-adawi-brown rounded-lg hover:bg-adawi-beige-dark transition-colors duration-200 flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Modifier le profil
                </button>

                <Form method="post" action="/logout">
                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-gradient-to-r from-adawi-brown to-adawi-gold text-white rounded-lg hover:from-adawi-brown-light hover:to-adawi-gold-light transition-all duration-200 flex items-center justify-center shadow-md"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Se déconnecter
                  </button>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

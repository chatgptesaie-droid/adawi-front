import React, { useEffect, useState } from "react";
import { MetaFunction, LoaderFunction, json, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { User, Mail, Shield, Edit, LogOut, ArrowLeft } from "lucide-react";
import TopBanner from "~/components/TopBanner";
import Footer from "~/components/Footer";
import CompactHeader from "~/components/CompactHeader";
import { readToken } from "~/utils/session.server";
import { API_BASE } from "~/utils/auth.server";

export const meta: MetaFunction = () => [
  { title: "Mon Profil - Adawi" },
  { name: "description", content: "Gérez votre profil utilisateur" }
];

// Interface pour les données utilisateur
interface UserData {
  id: string;
  email: string;
  nom?: string;
  prenom?: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

interface LoaderData {
  user: UserData;
  token: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  const sessionData = await readToken(request);
  
  if (!sessionData) {
    return redirect("/login?error=timeout");
  }

  let parsedSession;
  try {
    parsedSession = typeof sessionData === 'string' ? JSON.parse(sessionData) : sessionData;
  } catch (error) {
    console.error("Erreur parsing session:", error);
    return redirect("/login?error=unknown");
  }

  const token = parsedSession?.access_token;
  if (!token) {
    return redirect("/login?error=timeout");
  }

  try {
    // Récupérer les données de l'utilisateur depuis l'API
    const response = await fetch(`${API_BASE}/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return redirect("/login?error=timeout");
      }
      throw new Error(`Erreur API: ${response.status}`);
    }

    const userData = await response.json();
    
    return json<LoaderData>({
      user: userData,
      token
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des données utilisateur:", error);
    return redirect("/login?error=network");
  }
};

export default function UtilisateurProfile() {
  const { user, token } = useLoaderData<LoaderData>();
  const [isLoading, setIsLoading] = useState(false);

  // Fonction pour formater le rôle
  const formatRole = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
      case 'administrator':
        return { label: 'Administrateur', color: 'bg-red-100 text-red-800 border-red-200' };
      case 'vendeur':
      case 'seller':
      case 'vendor':
        return { label: 'Vendeur', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'client':
      case 'customer':
      case 'user':
        return { label: 'Client', color: 'bg-green-100 text-green-800 border-green-200' };
      default:
        return { label: role || 'Non défini', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non disponible';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  // Fonction pour obtenir les initiales
  const getInitials = (nom?: string, prenom?: string, email?: string) => {
    if (nom && prenom) {
      return `${nom.charAt(0)}${prenom.charAt(0)}`.toUpperCase();
    }
    if (nom) {
      return nom.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const roleInfo = formatRole(user.role);
  const fullName = user.prenom && user.nom 
    ? `${user.prenom} ${user.nom}` 
    : user.nom || user.prenom || 'Nom non défini';

  return (
    <>
      <TopBanner />
      <CompactHeader />
      
      <main className="min-h-screen bg-gradient-to-br from-adawi-beige-light via-white to-adawi-beige py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <nav className="mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center text-adawi-brown hover:text-adawi-gold transition-colors duration-200 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              Retour à la boutique
            </Link>
          </nav>

          {/* En-tête de la page */}
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-adawi-brown mb-2">
              Mon Profil
            </h1>
            <p className="text-adawi-brown-light text-lg">
              Gérez vos informations personnelles
            </p>
          </div>

          {/* Carte principale du profil */}
          <div className="bg-white rounded-2xl shadow-xl border border-adawi-gold/20 overflow-hidden">
            
            {/* Header avec avatar */}
            <div className="bg-gradient-to-r from-adawi-brown via-adawi-brown-light to-adawi-gold p-8 text-white">
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                
                {/* Avatar */}
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
                  <span className="text-2xl font-bold text-white">
                    {getInitials(user.nom, user.prenom, user.email)}
                  </span>
                </div>

                {/* Informations principales */}
                <div className="text-center sm:text-left flex-1">
                  <h2 className="text-2xl font-bold mb-1">{fullName}</h2>
                  <p className="text-white/80 mb-3 flex items-center justify-center sm:justify-start">
                    <Mail className="w-4 h-4 mr-2" />
                    {user.email}
                  </p>
                  <div className="inline-flex">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${roleInfo.color} bg-white/10 backdrop-blur-sm text-white border-white/30`}>
                      <Shield className="w-4 h-4 inline mr-2" />
                      {roleInfo.label}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
                    disabled={isLoading}
                  >
                    <Edit className="w-4 h-4" />
                    <span className="hidden sm:inline">Modifier</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Contenu détaillé */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Informations personnelles */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-adawi-brown mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-adawi-gold" />
                    Informations personnelles
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-adawi-beige/30 rounded-lg p-4">
                      <label className="block text-sm font-medium text-adawi-brown-light mb-1">
                        Prénom
                      </label>
                      <p className="text-adawi-brown font-medium">
                        {user.prenom || 'Non renseigné'}
                      </p>
                    </div>

                    <div className="bg-adawi-beige/30 rounded-lg p-4">
                      <label className="block text-sm font-medium text-adawi-brown-light mb-1">
                        Nom
                      </label>
                      <p className="text-adawi-brown font-medium">
                        {user.nom || 'Non renseigné'}
                      </p>
                    </div>

                    <div className="bg-adawi-beige/30 rounded-lg p-4">
                      <label className="block text-sm font-medium text-adawi-brown-light mb-1">
                        Adresse email
                      </label>
                      <p className="text-adawi-brown font-medium break-all">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Informations du compte */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-adawi-brown mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-adawi-gold" />
                    Informations du compte
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-adawi-beige/30 rounded-lg p-4">
                      <label className="block text-sm font-medium text-adawi-brown-light mb-1">
                        Identifiant
                      </label>
                      <p className="text-adawi-brown font-mono text-sm">
                        #{user.id}
                      </p>
                    </div>

                    <div className="bg-adawi-beige/30 rounded-lg p-4">
                      <label className="block text-sm font-medium text-adawi-brown-light mb-1">
                        Rôle
                      </label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${roleInfo.color}`}>
                        <Shield className="w-4 h-4 mr-2" />
                        {roleInfo.label}
                      </span>
                    </div>

                    <div className="bg-adawi-beige/30 rounded-lg p-4">
                      <label className="block text-sm font-medium text-adawi-brown-light mb-1">
                        Membre depuis
                      </label>
                      <p className="text-adawi-brown font-medium">
                        {formatDate(user.created_at)}
                      </p>
                    </div>

                    {user.updated_at && (
                      <div className="bg-adawi-beige/30 rounded-lg p-4">
                        <label className="block text-sm font-medium text-adawi-brown-light mb-1">
                          Dernière mise à jour
                        </label>
                        <p className="text-adawi-brown font-medium">
                          {formatDate(user.updated_at)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions supplémentaires */}
              <div className="mt-8 pt-6 border-t border-adawi-gold/20">
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                  <div className="text-sm text-adawi-brown-light">
                    Vos données sont sécurisées et protégées.
                  </div>
                  <div className="flex space-x-4">
                    <Link
                      to="/logout"
                      className="inline-flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Se déconnecter
                    </Link>
                    <button
                      className="inline-flex items-center px-6 py-2 bg-adawi-gold hover:bg-adawi-gold-dark text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                      disabled={isLoading}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier le profil
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section actions rapides */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/boutisque"
              className="bg-white rounded-xl p-6 shadow-lg border border-adawi-gold/20 hover:shadow-xl transition-all duration-200 group"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-adawi-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-adawi-gold/20 transition-colors">
                  <svg className="w-6 h-6 text-adawi-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-adawi-brown mb-2">Boutique</h3>
                <p className="text-sm text-adawi-brown-light">Découvrir nos produits</p>
              </div>
            </Link>

            <Link
              to="/panier"
              className="bg-white rounded-xl p-6 shadow-lg border border-adawi-gold/20 hover:shadow-xl transition-all duration-200 group"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-adawi-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-adawi-gold/20 transition-colors">
                  <svg className="w-6 h-6 text-adawi-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2 4h12" />
                  </svg>
                </div>
                <h3 className="font-semibold text-adawi-brown mb-2">Mon Panier</h3>
                <p className="text-sm text-adawi-brown-light">Voir mes achats</p>
              </div>
            </Link>

            <Link
              to="/contact"
              className="bg-white rounded-xl p-6 shadow-lg border border-adawi-gold/20 hover:shadow-xl transition-all duration-200 group"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-adawi-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-adawi-gold/20 transition-colors">
                  <svg className="w-6 h-6 text-adawi-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-adawi-brown mb-2">Support</h3>
                <p className="text-sm text-adawi-brown-light">Nous contacter</p>
              </div>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
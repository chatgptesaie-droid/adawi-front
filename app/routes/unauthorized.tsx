import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Lock } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Accès refusé - Adawi" },
    { name: "description", content: "Page d'accès refusé - Zone protégée" },
  ];
};

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="bg-white shadow-lg rounded-2xl p-10 text-center max-w-md">
        {/* Icône */}
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 text-red-600 p-4 rounded-full">
            <Lock className="w-10 h-10" />
          </div>
        </div>

        {/* Titre */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Accès refusé
        </h1>
        <p className="text-gray-600 mb-6">
          Désolé, vous n’avez pas les autorisations nécessaires pour accéder à
          cette page.
        </p>

        {/* Boutons */}
        <div className="flex flex-col gap-3">
          <Link
            to="/"
            className="bg-adawi-brown text-white px-6 py-3 rounded-xl shadow hover:bg-adawi-brown/90 transition"
          >
            Retour à l’accueil
          </Link>
          
        </div>
      </div>
    </div>
  );
}

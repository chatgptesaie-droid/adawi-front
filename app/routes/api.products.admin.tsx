import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { readToken } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
    try {
        console.log(" Début du loader API products admin");

        // Utiliser la fonction readToken existante qui gère les cookies HTTP-only
        const token = await readToken(request);
        console.log(" Token récupéré:", token ? "Token présent" : "Aucun token");

        if (!token) {
            console.log(" Aucun token trouvé, retour 401");
            return json({ 
                success: false, 
                error: "Non authentifié - aucun token trouvé" 
            }, { status: 401 });
        }

        // Récupérer les paramètres de pagination
        const url = new URL(request.url);
        const skip = url.searchParams.get("skip") || "0";
        const limit = url.searchParams.get("limit") || "100"; // Augmenter la limite par défaut

        console.log(` Chargement des produits admin (skip=${skip}, limit=${limit})`);

        // Construire l'URL avec les paramètres - utiliser le bon endpoint
        const apiUrl = `http://localhost:8000/products/admin/all?skip=${skip}&limit=${limit}`;
        console.log(" URL API:", apiUrl);

        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        console.log(" Réponse API:", response.status, response.statusText);

        if (!response.ok) {
            console.error(" Erreur API produits admin:", response.status);

            // Essayer de lire le corps de la réponse pour plus d'infos
            try {
                const errorBody = await response.text();
                console.error(" Corps de l'erreur:", errorBody);
            } catch (e) {
                console.error(" Impossible de lire le corps de l'erreur");
            }

            let errorMessage = "Erreur lors du chargement des produits";

            if (response.status === 403) {
                errorMessage = "Vous n'avez pas l'autorisation d'accéder à ces produits";
            } else if (response.status === 401) {
                errorMessage = "Session expirée, veuillez vous reconnecter";
            }

            return json({ 
                success: false, 
                error: errorMessage 
            }, { status: response.status });
        }

        const products = await response.json();
        console.log(` ${products.length} produits chargés`);

        // Pour obtenir le total réel, faire une requête séparée ou utiliser une logique différente
        // Ici on suppose que si on reçoit moins que la limite, c'est qu'on a tout
        const totalProducts = products.length < parseInt(limit) ? 
            parseInt(skip) + products.length : 
            parseInt(skip) + products.length + 1; // +1 pour indiquer qu'il y en a peut-être plus

        return json({ 
            success: true,
            products: products,
            total: totalProducts,
            currentPage: Math.floor(parseInt(skip) / parseInt(limit)) + 1,
            itemsPerPage: parseInt(limit)
        });

    } catch (error) {
        console.error(" Erreur lors du chargement des produits:", error);
        return json({ 
            success: false, 
            error: "Erreur de connexion au serveur" 
        }, { status: 500 });
    }
};
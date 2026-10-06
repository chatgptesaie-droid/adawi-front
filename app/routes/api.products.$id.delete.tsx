import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { readToken } from "~/utils/session.server";

export const action: ActionFunction = async ({ request, params }) => {
    if (request.method !== "DELETE") {
        return json({ success: false, error: "Méthode non autorisée" }, { status: 405 });
    }

    const token = await readToken(request);
    if (!token) {
        return json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
        return json({ success: false, error: "ID produit manquant" }, { status: 400 });
    }

    try {
        console.log(` Suppression du produit ${id}`);

        const response = await fetch(`http://localhost:8000/products/${id}`, {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(" Erreur API suppression:", response.status, errorText);
            
            if (response.status === 404) {
                return json({ 
                    success: false, 
                    error: "Produit non trouvé" 
                }, { status: 404 });
            }
            
            if (response.status === 403) {
                return json({ 
                    success: false, 
                    error: "Vous n'avez pas l'autorisation de supprimer ce produit" 
                }, { status: 403 });
            }

            return json({ 
                success: false, 
                error: `Erreur lors de la suppression: ${response.status}` 
            }, { status: response.status });
        }

        // Vérifier si la réponse contient du contenu
        let data = null;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const text = await response.text();
            if (text) {
                data = JSON.parse(text);
            }
        }

        console.log(" Produit supprimé avec succès:", data);

        return json({
            success: true,
            message: "Produit supprimé avec succès",
            productId: id
        });

    } catch (error) {
        console.error(" Erreur lors de la suppression du produit:", error);
        return json({ 
            success: false, 
            error: "Erreur de connexion au serveur" 
        }, { status: 500 });
    }
};

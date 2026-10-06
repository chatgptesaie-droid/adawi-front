import { json, type ActionFunction } from "@remix-run/node";
import { readToken } from "~/utils/session.server";

export const action: ActionFunction = async ({ request, params }) => {
    if (request.method !== "DELETE") {
        return json({ success: false, error: "Méthode non autorisée" }, { status: 405 });
    }

    try {
        const token = await readToken(request);
        const { categoryId } = params;
        
        if (!token) {
            return json({ success: false, error: "Non authentifié" }, { status: 401 });
        }

        if (!categoryId) {
            return json({ success: false, error: "ID de catégorie manquant" }, { status: 400 });
        }

        console.log(" Suppression catégorie:", categoryId);

        // Envoyer à l'API backend
        const response = await fetch(`http://localhost:8000/products/categories/${categoryId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(" Erreur suppression catégorie:", response.status, errorData);
            
            return json({ 
                success: false, 
                error: errorData.detail || `Erreur ${response.status}` 
            }, { status: response.status });
        }

        console.log(" Catégorie supprimée:", categoryId);
        
        return json({ 
            success: true, 
            categoryId,
            message: "Catégorie supprimée avec succès"
        });

    } catch (error) {
        console.error(" Erreur lors de la suppression de la catégorie:", error);
        return json({ 
            success: false, 
            error: "Erreur de connexion au serveur" 
        }, { status: 500 });
    }
};

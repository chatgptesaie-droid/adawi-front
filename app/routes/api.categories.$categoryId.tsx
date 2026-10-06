import { json, type LoaderFunction } from "@remix-run/node";
import { readToken } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request, params }) => {
    try {
        const token = await readToken(request);
        const { categoryId } = params;
        
        if (!token) {
            return json({ success: false, error: "Non authentifié" }, { status: 401 });
        }

        if (!categoryId) {
            return json({ success: false, error: "ID de catégorie manquant" }, { status: 400 });
        }

        // Récupérer la catégorie depuis l'API backend
        const response = await fetch(`http://localhost:8000/products/categories/${categoryId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(" Erreur récupération catégorie:", response.status, errorData);
            
            return json({ 
                success: false, 
                error: errorData.detail || `Erreur ${response.status}` 
            }, { status: response.status });
        }

        const category = await response.json();
        
        console.log(" Catégorie récupérée:", category);
        
        return json({ 
            success: true, 
            category 
        });

    } catch (error) {
        console.error(" Erreur lors de la récupération de la catégorie:", error);
        return json({ 
            success: false, 
            error: "Erreur de connexion au serveur" 
        }, { status: 500 });
    }
};

import { json, type ActionFunction } from "@remix-run/node";
import { readToken } from "~/utils/session.server";

export const action: ActionFunction = async ({ request, params }) => {
    if (request.method !== "POST") {
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

        const formData = await request.formData();
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const parent_id = formData.get("parent_id") as string;

        // Validation
        if (!name || !description) {
            return json({ 
                success: false, 
                error: "Le nom et la description sont requis" 
            }, { status: 400 });
        }

        // Préparer les données pour l'API
        const categoryData: any = {
            name: name.trim(),
            description: description.trim(),
        };

        // Ajouter parent_id seulement s'il est fourni et non vide
        if (parent_id && parent_id.trim() !== '') {
            categoryData.parent_id = parent_id.trim();
        } else {
            categoryData.parent_id = null;
        }

        console.log(" Modification catégorie:", categoryId, categoryData);

        // Envoyer à l'API backend
        const response = await fetch(`http://localhost:8000/products/categories/${categoryId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(categoryData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(" Erreur modification catégorie:", response.status, errorData);
            
            return json({ 
                success: false, 
                error: errorData.detail || `Erreur ${response.status}` 
            }, { status: response.status });
        }

        const updatedCategory = await response.json();
        
        console.log(" Catégorie modifiée:", updatedCategory);
        
        return json({ 
            success: true, 
            category: updatedCategory,
            message: "Catégorie modifiée avec succès"
        });

    } catch (error) {
        console.error(" Erreur lors de la modification de la catégorie:", error);
        return json({ 
            success: false, 
            error: "Erreur de connexion au serveur" 
        }, { status: 500 });
    }
};

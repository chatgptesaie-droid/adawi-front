import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { readToken } from "~/utils/session.server";

export const action: ActionFunction = async ({ request, params }) => {
    if (request.method !== "POST") {
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
        console.log(` Modification du produit ${id}`);

        // Récupérer les données du formulaire
        const formData = await request.formData();

        // Log pour debug
        console.log(" Données reçues:");
        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`  ${key}: ${value.name} (${value.size} bytes)`);
            } else {
                console.log(`  ${key}: ${value}`);
            }
        }

        // Préparer les données pour l'API
        const apiFormData = new FormData();

        // Champs de base
        const basicFields = ['name', 'description', 'price', 'cost_price', 'category_id', 'stock', 'low_stock_threshold'];
        basicFields.forEach(field => {
            const value = formData.get(field) as string;
            if (value && value.trim() !== '') {
                apiFormData.append(field, value.trim());
            }
        });

        // Arrays (sizes, colors, tags) - convertir en JSON
        const arrayFields = ['sizes', 'colors', 'tags'];
        arrayFields.forEach(field => {
            const value = formData.get(field) as string;
            if (value && value.trim() !== '') {
                const arrayValue = value.split(',').map(item => item.trim()).filter(item => item !== '');
                if (arrayValue.length > 0) {
                    apiFormData.append(field, JSON.stringify(arrayValue));
                }
            }
        });

        // Images principales
        const images = formData.getAll("images") as File[];
        const validImages = images.filter(image => image instanceof File && image.size > 0);
        validImages.forEach((image) => {
            apiFormData.append("images", image);
        });

        // Images de survol
        const hoverImages = formData.getAll("hover_images") as File[];
        const validHoverImages = hoverImages.filter(image => image instanceof File && image.size > 0);
        validHoverImages.forEach((image) => {
            apiFormData.append("hover_images", image);
        });

        console.log(" Envoi vers l'API backend...");

        // Appel à l'API backend
        const response = await fetch(`http://localhost:8000/products/${id}`, {
            method: "PUT",
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: apiFormData
        });

        console.log(` Réponse API: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(" Erreur API:", errorText);

            let errorMessage = "Erreur lors de la modification du produit";

            try {
                const errorData = JSON.parse(errorText);
                if (errorData.detail) {
                    if (Array.isArray(errorData.detail)) {
                        errorMessage = errorData.detail.map((err: any) => {
                            const field = err.loc ? err.loc[err.loc.length - 1] : 'Champ';
                            return `${field}: ${err.msg}`;
                        }).join(", ");
                    } else {
                        errorMessage = errorData.detail;
                    }
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (e) {
                errorMessage = errorText || errorMessage;
            }

            return json({ 
                success: false, 
                error: errorMessage 
            }, { status: response.status });
        }

        const updatedProduct = await response.json();
        console.log(" Produit modifié avec succès");

        return json({ 
            success: true, 
            message: "Produit modifié avec succès",
            product: updatedProduct 
        });

    } catch (error) {
        console.error(" Erreur lors de la modification:", error);
        return json({ 
            success: false, 
            error: "Erreur de connexion au serveur" 
        }, { status: 500 });
    }
};

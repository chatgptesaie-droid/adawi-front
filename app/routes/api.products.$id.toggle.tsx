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
        const body = await request.json();
        const { is_active } = body;

        console.log(` Toggle statut produit ${id} vers ${is_active ? 'actif' : 'inactif'}`);

        const response = await fetch(`http://localhost:8000/products/${id}`, {
            method: "PATCH",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ is_active })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(" Erreur API toggle:", response.status, errorText);

            if (response.status === 404) {
                return json({ 
                    success: false, 
                    error: "Produit non trouvé" 
                }, { status: 404 });
            }

            if (response.status === 403) {
                return json({ 
                    success: false, 
                    error: "Vous n'avez pas l'autorisation de modifier ce produit" 
                }, { status: 403 });
            }

            return json({ 
                success: false, 
                error: `Erreur lors de la modification: ${response.status}` 
            }, { status: response.status });
        }

        const updatedProduct = await response.json();
        console.log(` Statut produit ${id} modifié avec succès`);

        return json({ 
            success: true, 
            message: `Produit ${is_active ? 'activé' : 'désactivé'} avec succès`,
            product: updatedProduct 
        });

    } catch (error) {
        console.error(" Erreur lors du toggle du produit:", error);
        return json({ 
            success: false, 
            error: "Erreur de connexion au serveur" 
        }, { status: 500 });
    }
};

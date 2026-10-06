import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { readToken } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request, params }) => {
    const token = await readToken(request);
    if (!token) {
        return json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
        return json({ success: false, error: "ID produit manquant" }, { status: 400 });
    }

    try {
        console.log(` Récupération du produit ${id}`);

        const response = await fetch(`http://localhost:8000/products/${id}`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(" Erreur API récupération produit:", response.status, errorText);

            let errorMessage = "Erreur lors de la récupération du produit";

            try {
                const errorData = JSON.parse(errorText);
                if (errorData.detail) {
                    errorMessage = Array.isArray(errorData.detail) 
                        ? errorData.detail.map((err: any) => err.msg).join(", ")
                        : errorData.detail;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (e) {
                if (errorText) {
                    errorMessage = errorText;
                }
            }

            if (response.status === 404) {
                errorMessage = "Produit non trouvé";
            } else if (response.status === 403) {
                errorMessage = "Vous n'avez pas l'autorisation d'accéder à ce produit";
            } else if (response.status === 401) {
                errorMessage = "Session expirée, veuillez vous reconnecter";
            }

            return json({ 
                success: false, 
                error: errorMessage 
            }, { status: response.status });
        }

        const product = await response.json();
        console.log(` Produit ${id} récupéré avec succès`);

        return json({ 
            success: true,
            product: product
        });

    } catch (error) {
        console.error(" Erreur lors de la récupération du produit:", error);
        return json({ 
            success: false, 
            error: "Erreur de connexion au serveur" 
        }, { status: 500 });
    }
};

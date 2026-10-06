import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, type LoaderFunction, type ActionFunction } from "@remix-run/node";
import { readToken } from "~/utils/session.server";

// GET /products/{product_id} - Récupérer un produit
export const loader: LoaderFunction = async ({ request, params }) => {
  try {
    const token = await readToken(request);

    if (!token) {
      return json({ error: "Non authentifié", success: false }, { status: 401 });
    }

    const { productId } = params;
    if (!productId) {
      return json({ error: "ID produit manquant", success: false }, { status: 400 });
    }

    console.log(' Récupération du produit:', productId);

    const response = await fetch(`http://localhost:8000/products/${productId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(' Status récupération:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(' Erreur récupération produit:', errorText);
      return json({ 
        error: `Erreur ${response.status}: ${errorText}`, 
        success: false 
      }, { status: response.status });
    }

    const product = await response.json();
    console.log(' Produit récupéré avec succès');

    return json({ 
      product: product, 
      success: true 
    });

  } catch (error) {
    console.error(' Erreur lors de la récupération du produit:', error);
    return json({ 
      error: "Erreur serveur", 
      success: false 
    }, { status: 500 });
  }
};

// PUT /products/{product_id} - Mettre à jour un produit
// DELETE /products/{product_id} - Supprimer un produit
export const action: ActionFunction = async ({ request, params }) => {
  try {
    const token = await readToken(request);

    if (!token) {
      return json({ error: "Non authentifié", success: false }, { status: 401 });
    }

    const { productId } = params;
    if (!productId) {
      return json({ error: "ID produit manquant", success: false }, { status: 400 });
    }

    if (request.method === "PUT") {
      // Mise à jour du produit
      const formData = await request.formData();

      console.log(' Mise à jour du produit:', productId);

      const response = await fetch(`http://localhost:8000/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData, // Envoyer directement le FormData pour les images
      });

      console.log(' Status mise à jour:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(' Erreur mise à jour produit:', errorText);
        return json({ 
          error: `Erreur ${response.status}: ${errorText}`, 
          success: false 
        }, { status: response.status });
      }

      const result = await response.json();
      console.log(' Produit mis à jour avec succès');

      return json({ 
        product: result,
        success: true,
        message: "Produit mis à jour avec succès"
      });

    } else if (request.method === "DELETE") {
      // Suppression du produit
      console.log(' Suppression du produit:', productId);

      const response = await fetch(`http://localhost:8000/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(' Status suppression:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(' Erreur suppression produit:', errorText);
        return json({ 
          error: `Erreur ${response.status}: ${errorText}`, 
          success: false 
        }, { status: response.status });
      }

      console.log(' Produit supprimé avec succès');

      return json({ 
        success: true,
        message: "Produit supprimé avec succès"
      });

    } else {
      return json({ error: "Méthode non autorisée", success: false }, { status: 405 });
    }

  } catch (error) {
    console.error(' Erreur lors de l\'action sur le produit:', error);
    return json({ 
      error: "Erreur serveur", 
      success: false 
    }, { status: 500 });
  }
};

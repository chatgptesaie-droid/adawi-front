import { json, type ActionFunction } from "@remix-run/node";
import { readToken } from "~/utils/session.server";

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ error: "Méthode non autorisée", success: false }, { status: 405 });
  }

  try {
    const token = await readToken(request);

    if (!token) {
      return json({ error: "Non authentifié", success: false }, { status: 401 });
    }

    // Récupérer le FormData (avec les images)
    const formData = await request.formData();

    console.log(' Création de produit...');

    const response = await fetch('http://localhost:8000/products/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData, // Envoyer directement le FormData pour les images
    });

    console.log(' Status création:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(' Erreur création produit:', errorText);
      return json({ 
        error: `Erreur ${response.status}: ${errorText}`, 
        success: false 
      }, { status: response.status });
    }

    const result = await response.json();
    console.log(' Produit créé avec succès');
    
    return json({ 
      ...result, 
      success: true,
      message: "Produit créé avec succès"
    });

  } catch (error) {
    console.error(' Erreur lors de la création du produit:', error);
    return json({ 
      error: "Erreur serveur", 
      success: false 
    }, { status: 500 });
  }
};

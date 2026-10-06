import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { readSessionData } from "~/utils/session.server";

export const action: ActionFunction = async ({ request }) => {
  try {
    if (request.method !== 'POST') {
      return json({ success: false, error: 'Méthode non autorisée' }, { status: 405 });
    }

    // Récupérer les données de session
    const sessionData = await readSessionData(request);
    if (!sessionData || !sessionData.session_id) {
      return json({ success: false, error: 'Session non trouvée' }, { status: 401 });
    }

    const body = await request.json();
    const { product_id, quantity } = body;

    if (!product_id || quantity === undefined) {
      return json({ success: false, error: 'Données manquantes' }, { status: 400 });
    }

    // Appel à l'API backend pour mettre à jour la quantité
    const apiUrl = `${process.env.API_BASE_URL || 'http://localhost:8000'}/cart/update`;

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionData.access_token}`,
      },
      body: JSON.stringify({
        session_id: sessionData.session_id,
        product_id,
        quantity
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(' Erreur API update:', errorText);
      return json({ success: false, error: `Erreur API: ${response.status}` }, { status: response.status });
    }

    const result = await response.json();
    return json({ success: true, data: result });
  } catch (error) {
    console.error(' Erreur update:', error);
    return json({ success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }, { status: 500 });
  }
};

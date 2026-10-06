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
    const { product_id } = body;

    if (!product_id) {
      return json({ success: false, error: 'Product ID manquant' }, { status: 400 });
    }

    console.log(' Suppression produit:', { product_id, session_id: sessionData.session_id });

    //  Correction: product_id dans l'URL et session-id dans les headers
    const apiUrl = `${process.env.API_BASE_URL || 'http://localhost:8000'}/cart/remove/${product_id}`;

    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionData.access_token}`,
        'session-id': sessionData.session_id, //  session-id dans les headers
      },
      //  Pas de body pour DELETE avec product_id dans l'URL
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(' Erreur API remove:', errorText);
      return json({ success: false, error: `Erreur API: ${response.status}` }, { status: response.status });
    }

    const result = await response.json();
    console.log(' Produit supprimé:', result);

    return json({ success: true, data: result });
  } catch (error) {
    console.error(' Erreur remove:', error);
    return json({ success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }, { status: 500 });
  }
};

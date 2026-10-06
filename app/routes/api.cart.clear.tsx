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

    console.log(' Vidage du panier:', { session_id: sessionData.session_id });

    // Appel à l'API backend pour vider le panier
    const apiUrl = `${process.env.API_BASE_URL || 'http://localhost:8000'}/cart/clear`;

    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionData.access_token}`,
        'session-id': sessionData.session_id,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(' Erreur API clear:', errorText);
      return json({ success: false, error: `Erreur API: ${response.status}` }, { status: response.status });
    }

    const result = await response.json();
    console.log(' Panier vidé:', result);

    return json({ success: true, data: result });
  } catch (error) {
    console.error(' Erreur clear:', error);
    return json({ success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }, { status: 500 });
  }
};

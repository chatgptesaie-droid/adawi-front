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
    const { street, city, postal_code, country, phone } = body;

    // Validation des champs requis
    if (!street || !city || !postal_code || !country || !phone) {
      return json({ 
        success: false, 
        error: 'Tous les champs sont requis',
        detail: [{ msg: 'Tous les champs sont requis', type: 'value_error' }]
      }, { status: 422 });
    }

    console.log(' Création de commande:', { 
      address: { street, city, postal_code, country, phone },
      session_id: sessionData.session_id 
    });

    // Appel à l'API backend pour créer la commande
    const apiUrl = `${process.env.API_BASE_URL || 'http://localhost:8000'}/orders/panier`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionData.access_token}`,
        'session-id': sessionData.session_id,
      },
      body: JSON.stringify({
        street,
        city,
        postal_code,
        country,
        phone
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(' Erreur API panier:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        return json({ 
          success: false, 
          error: errorData.detail || `Erreur API: ${response.status}`,
          detail: errorData.detail
        }, { status: response.status });
      } catch {
        return json({ 
          success: false, 
          error: `Erreur API: ${response.status} - ${errorText}` 
        }, { status: response.status });
      }
    }

    const result = await response.json();
    console.log(' Commande créée:', result);

    return json({ success: true, data: result });
  } catch (error) {
    console.error(' Erreur panier:', error);
    return json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    }, { status: 500 });
  }
};

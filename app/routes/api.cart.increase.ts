// app/routes/api.cart.increase.ts
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { readSessionData } from "~/utils/session.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ success: false, error: "Method not allowed" }, { status: 405 });
  }

  try {
    // Récupérer les données de session
    const sessionData = await readSessionData(request);
    if (!sessionData || !sessionData.session_id) {
      return json({ 
        success: false, 
        error: "Session non trouvée" 
      }, { status: 401 });
    }

    // Récupérer les données du body
    const { product_id, size, color } = await request.json();

    if (!product_id) {
      return json({ 
        success: false, 
        error: "product_id requis" 
      }, { status: 400 });
    }

    // Appel à l'API backend
    const response = await fetch(`${process.env.API_BASE_URL || 'http://localhost:8000'}/cart/increase_quantity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionData.access_token}`,
        'session-id': sessionData.session_id,
      },
      body: JSON.stringify({ product_id, size, color }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return json({ 
        success: false, 
        error: `Erreur API: ${response.status} - ${errorText}` 
      }, { status: response.status });
    }

    const result = await response.json();
    return json({ success: true, data: result });

  } catch (error) {
    return json({
      success: false,
      error: `Erreur serveur: ${error instanceof Error ? error.message : String(error)}`
    }, { status: 500 });
  }
}
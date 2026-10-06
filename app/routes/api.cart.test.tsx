import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  try {
    const body = await request.json();
    const sessionId = request.headers.get('session-id');
    
    console.log('Test API - Données reçues:', body);
    console.log('Test API - Session ID:', sessionId);
    
    // Simuler une réponse réussie
    return json({
      success: true,
      message: "Test réussi",
      receivedData: body,
      sessionId: sessionId,
      items: [body],
      total: body.price * body.quantity
    });
  } catch (error) {
    console.error('Erreur dans le test API:', error);
    return json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    }, { status: 500 });
  }
};

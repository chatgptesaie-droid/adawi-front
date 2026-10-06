import { json, type ActionFunction } from "@remix-run/node";
import { readToken } from "~/utils/session.server";

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ error: "Méthode non autorisée" }, { status: 405 });
  }

  try {
    // Récupérer le token depuis la session côté serveur
    const token = await readToken(request);
    
    if (!token) {
      return json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer l'ID de la notification depuis le body
    const formData = await request.formData();
    const notificationId = formData.get("notificationId") as string;

    if (!notificationId) {
      return json({ error: "ID de notification manquant" }, { status: 400 });
    }

    // Appeler l'API pour marquer comme lu
    const response = await fetch(`http://localhost:8000/notifications/mark_read/${notificationId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API mark_read:', errorText);
      return json({ error: `Erreur ${response.status}: ${errorText}` }, { status: response.status });
    }

    const result = await response.json();
    return json(result);
    
  } catch (error) {
    console.error('Erreur lors du marquage de la notification:', error);
    return json({ error: "Erreur serveur" }, { status: 500 });
  }
};

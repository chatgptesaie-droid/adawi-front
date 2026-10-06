import { json, type LoaderFunction } from "@remix-run/node";
import { readToken } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  try {
    // Récupérer le token depuis la session côté serveur
    const token = await readToken(request);

    if (!token) {
      return json({ error: "Non authentifié" }, { status: 401 });
    }

    // Essayer différents paramètres de pagination
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') || '100';

    // Construire l'URL avec différents paramètres possibles
    const apiUrl = new URL('http://localhost:8000/notifications/');

    // Essayer différents paramètres de pagination
    apiUrl.searchParams.set('limit', limit);
    // Ou essayer d'autres paramètres courants :
    // apiUrl.searchParams.set('per_page', limit);
    // apiUrl.searchParams.set('size', limit);
    // apiUrl.searchParams.set('count', limit);

    console.log('URL API:', apiUrl.toString());

    // Appeler l'API des notifications avec le token
    const response = await fetch(apiUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Status de la réponse:', response.status);
    console.log('Headers de la réponse:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API notifications:', errorText);
      return json({ error: `Erreur ${response.status}: ${errorText}` }, { status: response.status });
    }

    const notifications = await response.json();
    console.log(`Notifications récupérées: ${notifications.length}`);

    return json(notifications);

  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    return json({ error: "Erreur serveur" }, { status: 500 });
  }
};

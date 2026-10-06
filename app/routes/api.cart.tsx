import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { getSession, readSessionData } from "~/utils/session.server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const sessionData = await readSessionData(request);
    if (!sessionData?.session_id || !sessionData?.access_token) {
      return json({ error: "Non authentifié" }, { status: 401 });
    }

    const apiUrl = new URL(`${API_BASE_URL}/cart/`);
    apiUrl.searchParams.set("session-id", sessionData.session_id);

    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionData.access_token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return json({ error: errorData.detail || errorData.error || `Erreur ${response.status}` }, { status: response.status });
    }

    const cartData = await response.json();
    return json({
      success: true,
      items: cartData.items || [],
      total: cartData.total || 0,
      item_count: cartData.item_count || 0,
      id: cartData.id,
    });
  } catch (error) {
    console.error("Erreur lors du chargement du panier:", error);
    return json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const userId = session.get("userId");

    if (!userId) {
      return json({ error: "Non authentifié" }, { status: 401 });
    }

    const formData = await request.formData();
    const action = formData.get("action");

    switch (action) {
      case "add":
        // Logique d'ajout au panier
        return json({ success: true, message: "Produit ajouté au panier" });
        
      case "remove":
        // Logique de suppression du panier
        return json({ success: true, message: "Produit supprimé du panier" });
        
      case "update":
        // Logique de mise à jour de quantité
        return json({ success: true, message: "Quantité mise à jour" });
        
      default:
        return json({ error: "Action non reconnue" }, { status: 400 });
    }
  } catch (error) {
    console.error("Erreur dans l'action du panier:", error);
    return json({ error: "Erreur serveur" }, { status: 500 });
  }
}

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { readToken } from "~/utils/session.server";
import { API_BASE } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const token = await readToken(request);
    if (!token) {
      // No token: treat as no active promotion for unauthenticated users
      return json(null);
    }

    const response = await fetch(`${API_BASE}/promotions/active`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404 || response.status === 401) {
        // No active promotion or invalid token: return null without error
        return json(null);
      }
      return json({ error: "Erreur lors de la récupération de la promotion" }, { status: response.status });
    }

    const promotionData = await response.json();
    console.log("Promotion data from API:", promotionData);

    let activePromotion = null;

    if (Array.isArray(promotionData)) {
      // If response is an array, find the first active promotion
      activePromotion = promotionData.find(promo => promo.is_active === true || promo.status === "active");
    } else if (promotionData && (promotionData.is_active === true || promotionData.status === "active")) {
      // If single object and active
      activePromotion = promotionData;
    }

    if (activePromotion) {
      return json(activePromotion);
    } else {
      console.log("No active promotion found, returning null");
      return json(null);
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de la promotion:", error);
    return json({ error: "Erreur serveur" }, { status: 500 });
  }
}

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { readToken } from "~/utils/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const token = await readToken(request);
    if (!token) {
      return json({ error: "Non autorisé" }, { status: 401 });
    }

    const response = await fetch("http://localhost:8000/admin/rapports/produits", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return json(
        { error: errorData.detail || errorData.error || `Erreur ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return json(data);
  } catch (error) {
    console.error("Erreur proxy produits admin:", error);
    return json({ error: "Erreur de connexion au serveur" }, { status: 500 });
  }
}

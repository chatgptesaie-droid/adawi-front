import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { readToken } from "~/utils/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const token = await readToken(request);
    if (!token) {
      return json({ error: "Non autorisé" }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = url.searchParams.get("page") || "1";
    const itemsPerPage = url.searchParams.get("items_per_page") || "10";
    const dateRange = url.searchParams.get("date_range") || "30-days";

    const backendUrl = new URL("http://localhost:8000/admin/rapports/ventes");
    backendUrl.searchParams.set("page", page);
    backendUrl.searchParams.set("items_per_page", itemsPerPage);
    backendUrl.searchParams.set("date_range", dateRange);

    const response = await fetch(backendUrl.toString(), {
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
    console.error("Erreur proxy ventes admin:", error);
    return json({ error: "Erreur de connexion au serveur" }, { status: 500 });
  }
}

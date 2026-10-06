import { type LoaderFunctionArgs } from "@remix-run/node";
import { readToken } from "~/utils/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const token = await readToken(request);
    if (!token) {
      return new Response("Non autorisé", { status: 401 });
    }

    const url = new URL(request.url);
    const dateRange = url.searchParams.get("date_range") || "30-days";

    const backendUrl = new URL("http://localhost:8000/admin/export/rapports");
    backendUrl.searchParams.set("date_range", dateRange);

    const response = await fetch(backendUrl.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      return new Response(errorData || `Erreur ${response.status}`, { status: response.status });
    }

    const blob = await response.blob();
    const contentType = response.headers.get("Content-Type") || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const contentDisposition = response.headers.get("Content-Disposition") || 'attachment; filename="rapports.xlsx"';

    return new Response(blob, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
      },
    });
  } catch (error) {
    console.error("Erreur proxy export rapports admin:", error);
    return new Response("Erreur de connexion au serveur", { status: 500 });
  }
}

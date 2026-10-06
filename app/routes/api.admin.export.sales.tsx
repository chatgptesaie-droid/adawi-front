import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { readToken } from "~/utils/session.server";

export const action: ActionFunction = async ({ request }) => {
  try {
    const token = await readToken(request);
    if (!token) {
      return json({ error: "No authentication token found" }, { status: 401 });
    }

    const url = new URL(request.url);
    const range_days = url.searchParams.get("range_days") || "30";

    const response = await fetch(`http://localhost:8000/admin/export/sales?range_days=${range_days}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const csvText = await response.text();

    return new Response(csvText, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="ventes-export-${range_days}-days.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting CSV:", error);
    return json({ error: "Failed to export CSV" }, { status: 500 });
  }
};

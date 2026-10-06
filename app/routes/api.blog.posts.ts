import { json, type LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const skip = url.searchParams.get("skip") || "0";
    const limit = url.searchParams.get("limit") || "10";
    const tags = url.searchParams.get("tags") || "";

    const apiUrl = new URL("http://localhost:8000/content/blog/posts");
    apiUrl.searchParams.set("skip", skip);
    apiUrl.searchParams.set("limit", limit);
    if (tags) {
      apiUrl.searchParams.set("tags", tags);
    }

    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return json(
        {
          success: false,
          error: errorData.detail || `Erreur ${response.status}`,
          posts: [],
        },
        { status: response.status }
      );
    }

    const posts = await response.json();
    return json({ success: true, posts: posts || [] });
  } catch (error) {
    console.error("Erreur lors de la récupération des posts blog:", error);
    return json(
      {
        success: false,
        error: "Erreur de connexion au serveur",
        posts: [],
      },
      { status: 500 }
    );
  }
}

import { json, type LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ params, request }: LoaderFunctionArgs) {
  try {
    const { slug } = params;
    if (!slug) {
      return json({ success: false, error: "Slug manquant" }, { status: 400 });
    }

    const response = await fetch(
      `http://localhost:8000/content/blog/posts/${slug}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return json(
        {
          success: false,
          error: errorData.detail || `Erreur ${response.status}`,
        },
        { status: response.status }
      );
    }

    const post = await response.json();
    return json({ success: true, post });
  } catch (error) {
    console.error("Erreur lors de la récupération du post blog:", error);
    return json(
      {
        success: false,
        error: "Erreur de connexion au serveur",
      },
      { status: 500 }
    );
  }
}

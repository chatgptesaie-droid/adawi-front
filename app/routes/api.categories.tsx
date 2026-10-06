import { json, redirect, type LoaderFunction } from "@remix-run/node";
import { readToken } from "~/utils/session.server";


export const loader: LoaderFunction = async ({ request }) => {
  try {
    // Vérifier d'abord si un token existe
    const token = await readToken(request);
    if (!token) {
      return json(

        { success: false, error: "Non authentifié" },
        { status: 401 },
      ); 
    }

    // Vérifier que l'utilisateur est bien admin

    // Appeler ton backend
    const response = await fetch(
      "http://localhost:8000/products/categories/",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(" Erreur API categories:", response.status, errorData);

      return json(
        {
          success: false,
          error: errorData.detail || `Erreur ${response.status}`,
        },
        { status: response.status }
      );
    }

    const categories = await response.json();

    console.log(" Catégories récupérées:", categories.length || 0);

    return json({
      success: true,
      categories: categories || [],
    });
  } catch (error) {
    console.error(" Erreur lors de la récupération des catégories:", error);
    return json(
      {
        success: false,
        error: "Erreur de connexion au serveur",
      },
      { status: 500 }
    );
  }
};

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getUserProfile } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const user = await getUserProfile(request);

    if (!user) {
      return json({ error: "Non authentifié" }, { status: 401 });
    }

    return json(user);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return json({ error: "Erreur serveur" }, { status: 500 });
  }
}

import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { readToken } from "~/utils/session.server";

export async function action({ request }: ActionFunctionArgs) {
    // Vérifier l'authentification
    const token = await readToken(request);
    if (!token) {
        return json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await request.json();
    
    try {
        // Faire la requête vers votre backend avec le token
        const response = await fetch("http://localhost:8000/contact/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // Si votre API utilise Bearer token
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (response.ok) {
            return json({ success: true, message: "Message envoyé avec succès" });
        } else {
            return json({ error: data.message || "Erreur lors de l'envoi" }, { status: response.status });
        }
    } catch (error) {
        console.error("Erreur API contact:", error);
        return json({ error: "Erreur serveur" }, { status: 500 });
    }
}

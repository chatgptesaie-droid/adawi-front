import { ActionFunction, json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { readToken } from "~/utils/session.server";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const title = formData.get("title")?.toString() || "";
  const description = formData.get("description")?.toString() || "";
  const category = formData.get("category")?.toString() || "commande";
  const priority = formData.get("priority")?.toString() || "normale";
  const order_id = formData.get("order_id")?.toString() || null;

  const token = await readToken(request);
  if (!token) {
    return redirect("/login");
  }

  try {
    const res = await fetch("http://localhost:8000/support/tickets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        description,
        category,
        priority,
        order_id,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return json({ error: err.detail || "Erreur inconnue" }, { status: res.status });
    }

    const ticket = await res.json();

    //  après création, redirige vers la page du ticket
    return redirect(`/client/support/${ticket.id}`);
  } catch (error) {
    return json({ error: "Impossible de créer le ticket" }, { status: 500 });
  }
};

export default function CreateTicketPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  return (
    <div className="max-w-xl mx-auto bg-white shadow-md p-6 rounded-lg mt-8">
      <h1 className="text-2xl font-bold mb-4">Nouveau Ticket de Support</h1>

      {actionData?.error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {actionData.error}
        </div>
      )}

      <Form method="post" className="space-y-4">
        <div>
          <label className="block font-medium">Titre</label>
          <input
            type="text"
            name="title"
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Description</label>
          <textarea
            name="description"
            required
            rows={4}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Catégorie</label>
          <select name="category" className="w-full border rounded px-3 py-2">
            <option value="commande">Commande</option>
            <option value="produit">Produit</option>
            <option value="paiement">Paiement</option>
            <option value="autre">Autre</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Priorité</label>
          <select name="priority" className="w-full border rounded px-3 py-2">
            <option value="normale">Normale</option>
            <option value="haute">Haute</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">ID Commande (optionnel)</label>
          <input
            type="text"
            name="order_id"
            placeholder="ex: CMD12345"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={navigation.state === "submitting"}
          className="bg-adawi-gold text-white px-4 py-2 rounded-lg hover:bg-adawi-gold/90"
        >
          {navigation.state === "submitting" ? "Envoi en cours..." : "Créer le ticket"}
        </button>
      </Form>
    </div>
  );
}

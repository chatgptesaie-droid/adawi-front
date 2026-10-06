import type { ActionFunction, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { API_BASE } from "~/utils/auth.server"; // ton backend base URL
import { readToken } from "~/utils/session.server";

export const meta: MetaFunction = () => [
  { title: "Checkout - Adawi" },
  { name: "description", content: "Finaliser votre commande" },
];

// --- Action pour envoyer la requête au backend ---
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const street = formData.get("street") as string;
  const city = formData.get("city") as string;
  const postal_code = formData.get("postal_code") as string;
  const country = formData.get("country") as string;
  const phone = formData.get("phone") as string;

  const token = await readToken(request);
  if (!token) return redirect("/login");

  const res = await fetch(`${API_BASE}/orders/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ street, city, postal_code, country, phone }),
  });

  if (res.status === 422) {
    const error = await res.json();
    return json({ error }, { status: 422 });
  }

  if (!res.ok) {
    return json({ error: "Impossible de finaliser la commande" }, { status: res.status });
  }

  const data = await res.json();
  return json({ success: true, order: data });
};

// --- Page Checkout ---
export default function CheckoutPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-2xl shadow">
      <h1 className="text-2xl font-bold mb-4 text-adawi-brown">Finaliser la commande</h1>

      {actionData?.error && (
        <div className="bg-red-100 text-red-600 p-3 rounded mb-4">
          Erreur : {JSON.stringify(actionData.error)}
        </div>
      )}

      {actionData?.success && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
           Commande créée avec succès !<br />
          ID : {actionData.order.id}<br />
          Total : {actionData.order.total} F CFA<br />
          Statut : {actionData.order.status}
        </div>
      )}

      <Form method="post" className="space-y-4">
        <input
          name="street"
          type="text"
          placeholder="Rue"
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="city"
          type="text"
          placeholder="Ville"
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="postal_code"
          type="text"
          placeholder="Code Postal"
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="country"
          type="text"
          placeholder="Pays"
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="phone"
          type="text"
          placeholder="Téléphone"
          className="w-full p-2 border rounded"
          required
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-adawi-brown text-white py-2 rounded hover:bg-adawi-brown/90 transition"
        >
          {isSubmitting ? "Traitement..." : "Payer maintenant"}
        </button>
      </Form>
    </div>
  );
}

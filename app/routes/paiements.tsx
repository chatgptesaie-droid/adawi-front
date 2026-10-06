// app/routes/paiements.new.tsx
import { ActionFunction, json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { API_BASE } from "~/utils/auth.server"; // ton API_BASE défini dans auth.server.ts
import { useSearchParams } from "react-router-dom"; // Import useSearchParams

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const phone_number = formData.get("phone_number");
  const amount = formData.get("amount");
  const network = formData.get("network");

  const res = await fetch(`${API_BASE}/paiements/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone_number,
      amount: Number(amount),
      network,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    return json({ error }, { status: res.status });
  }

  const data = await res.json();
  // Rediriger directement vers l'URL de paiement du prestataire
  return redirect(data.payment_url);
};

interface PaiementPageProps {
  total: number; // Add total prop
}

export default function PaiementPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams(); // Get search params
  const total = Number(searchParams.get("total")) || 0; // Retrieve total from query params

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg">
      <h1 className="text-xl font-bold mb-4 text-adawi-brown">Nouveau Paiement</h1>

      {actionData?.error && (
        <div className="p-2 bg-red-100 text-red-600 rounded mb-4">
          Erreur : {actionData.error.detail?.[0]?.msg || "Paiement échoué"}
        </div>
      )}

      <Form method="post" onSubmit={() => setLoading(true)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Numéro de téléphone</label>
          <input
            type="text"
            name="phone_number"
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Montant</label>
          <input
            type="number"
            name="amount"
            required
            min={1}
            defaultValue={total} // Set the default value to the total
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Opérateur</label>
          <select name="network" className="w-full border p-2 rounded" required>
            <option value="">-- Sélectionnez --</option>
            <option value="T-money">t-money</option>
            <option value="flooz">Flooz</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={navigation.state === "submitting" || loading}
          className="w-full bg-adawi-brown text-white py-2 rounded-xl"
        >
          {loading || navigation.state === "submitting"
            ? "Redirection vers PayGate..."
            : "Payer"}
        </button>
      </Form>
    </div>
  );
}

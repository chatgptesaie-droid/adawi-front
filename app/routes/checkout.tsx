import type { LoaderFunction, ActionFunction, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { API_BASE } from "~/utils/auth.server";
import { readToken } from "~/utils/session.server";
import { useSearchParams } from "react-router-dom";
import CompactHeader from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import TopBanner from "~/components/TopBanner";

export const meta: MetaFunction = () => [
  { title: "Checkout - Adawi" },
  { name: "description", content: "Finaliser votre commande" },
];

interface LoaderData {
  cartItems?: any[];
  cartTotal?: number;
}

export const loader: LoaderFunction = async ({ request }) => {
  // Optionnel : charger les données du panier si nécessaire
  return json<LoaderData>({});
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("_action") as string;

  const token = await readToken(request);
  if (!token) {
    return redirect("/login");
  }

  // Correction du parsing du token (même logique que dans le code availability)
  let authToken = "";
  if (typeof token === "string") {
    try {
      const parsed = JSON.parse(token);
      authToken = parsed?.access_token || token;
    } catch {
      authToken = token;
    }
  } else {
    authToken = token as string;
  }

  if (action === "checkout") {
    // Étape 1: Créer la commande avec les informations de livraison
    const street = formData.get("street") as string;
    const city = formData.get("city") as string;
    const postal_code = formData.get("postal_code") as string;
    const country = formData.get("country") as string;
    const phone = formData.get("phone") as string;
    const phone_number = formData.get("phone_number") as string;
    const network = formData.get("network") as string;

    // Server-side validation
    if (!street || !city || !postal_code || !country || !phone || !phone_number || !network) {
      return json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Validate phone number format (Togo format: 8 digits starting with specific prefixes)
    const phoneRegex = /^(70|79|90|91|92|93|96|97|98|99)\d{6}$/;
    if (!phoneRegex.test(phone_number)) {
      return json(
        { error: "Format de numéro de téléphone pour le paiement invalide" },
        { status: 400 }
      );
    }

    try {
      console.log("Making checkout request to:", `${API_BASE}/orders/checkout`);
      console.log("Token:", authToken ? "Present" : "Missing");
      console.log("Payload:", {
        address: { street, city, postal_code, country, phone },
        phone_number,
        network
      });

      // Construire l'URL avec les paramètres de requête
      const url = new URL(`${API_BASE}/orders/checkout`);
      url.searchParams.append("phone_number", phone_number);
      url.searchParams.append("network", network);

      const res = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          street,
          city,
          postal_code,
          country,
          phone,
        }),
      });

      console.log("Response status:", res.status);
      console.log("Response ok:", res.ok);

      if (!res.ok) {
        // Gestion des erreurs (même logique que le premier fichier)
        const errorText = await res.text();
        console.error("API Error response:", errorText);

        let data;
        let errorMessage = "Une erreur est survenue lors du traitement de la commande";

        try {
          data = JSON.parse(errorText);
          if (res.status === 400) {
            errorMessage = data.detail || data.message || data.error || "Données invalides";
          } else if (res.status === 401) {
            errorMessage = "Session expirée, veuillez vous reconnecter";
            return redirect("/login");
          } else if (res.status === 422) {
            // Handle FastAPI validation errors
            if (data.detail && Array.isArray(data.detail)) {
              const fieldErrors = data.detail.map((err: any) =>
                `${err.loc ? err.loc.join('.') : 'Champ'}: ${err.msg}`
              ).join(', ');
              errorMessage = `Erreur de validation: ${fieldErrors}`;
            } else {
              errorMessage = "Données de validation incorrectes";
            }
          } else if (res.status >= 500) {
            errorMessage = "Erreur serveur, veuillez réessayer plus tard";
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
          errorMessage = `Erreur ${res.status}: ${errorText}`;
        }

        return json({ error: errorMessage }, { status: res.status });
      }

      // Succès - Lire la réponse
      const responseText = await res.text();
      console.log("Response text:", responseText);

      // Essayer de parser en JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed JSON data:", data);

        // Si c'est un JSON avec payment_url, rediriger
        if (data.payment_url) {
          console.log("Redirecting to payment_url:", data.payment_url);
          console.log("Order created:", data.order);
          console.log("Payment identifier:", data.identifier);
          return redirect(data.payment_url);
        }

        // Si c'est un JSON mais sans payment_url
        if (data.order) {
          return json({
            success: true,
            order: data.order,
            message: "Commande créée avec succès",
            error: "URL de paiement manquante"
          });
        }

      } catch (parseError) {
        console.log("Not JSON, checking if it's a direct URL...");
      }

      // Vérifier si la réponse est directement une URL PayGateGlobal
      if (responseText.includes('paygateglobal.com')) {
        console.log("Direct PayGateGlobal URL detected:", responseText);
        return redirect(responseText.trim());
      }

      // Vérifier si c'est une redirection
      const location = res.headers.get('location');
      if (location) {
        console.log("Redirect location header:", location);
        return redirect(location);
      }

      // Si le texte ressemble à une URL
      const urlPattern = /^https?:\/\/.+/;
      if (urlPattern.test(responseText.trim())) {
        console.log("Assuming responseText is URL:", responseText.trim());
        return redirect(responseText.trim());
      }

      console.error("Unexpected response format:", responseText);
      return json(
        { error: `Format de réponse inattendu: ${responseText}` },
        { status: 500 }
      );

    } catch (error) {
      console.error("Fetch error:", error);

      // Différencier les erreurs de réseau
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return json(
          { error: "Erreur de connexion au serveur. Vérifiez votre connexion internet." },
          { status: 500 }
        );
      }

      return json(
        { error: `Erreur technique.message}` },
        { status: 500 }
      );
    }
  }

  return json({ error: "Action non reconnue" }, { status: 400 });
};

export default function CheckoutPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [network, setNetwork] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");

  const total = Number(searchParams.get("total")) || 0;
  const isSubmitting = navigation.state === "submitting";

  // Format phone number as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 8) {
      setPhoneNumber(value);
    }
  };

  const handleDeliveryPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 8) {
      setDeliveryPhone(value);
    }
  };

  // Validate phone number format
  const isValidPhone = (phone: string) => {
    const phoneRegex = /^(70|79|90|91|92|93|96|97|98|99)\d{6}$/;
    return phoneRegex.test(phone);
  };

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <CompactHeader />
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow">
        <h1 className="text-2xl font-bold mb-6 text-adawi-brown">Finaliser la commande</h1>

        {/* Display total amount */}
        {total > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total à payer:</span>
              <span className="text-xl font-bold text-adawi-brown">
                {total.toLocaleString()} F CFA
              </span>
            </div>
          </div>
        )}

        {/* Error display */}
        {actionData?.error && (
          <div className="bg-red-100 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{actionData.error}</span>
            </div>
          </div>
        )}

        {/* Success message */}
        {actionData?.success && (
          <div className="bg-green-100 border border-green-200 text-green-700 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium">Commande créée avec succès !</p>
                {actionData.order && (
                  <div className="mt-2 text-sm">
                    <p>ID: {actionData.order.id}</p>
                    <p>Total: {actionData.order.total} F CFA</p>
                    <p>Statut: {actionData.order.status}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <Form method="post" className="space-y-6">
          <input type="hidden" name="_action" value="checkout" />

          {/* Informations de livraison */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-adawi-brown">Informations de livraison</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Rue / Adresse</label>
                <input
                  name="street"
                  type="text"
                  placeholder="123 Rue de la République"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-brown focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ville</label>
                <input
                  name="city"
                  type="text"
                  placeholder="Lomé"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-brown focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Code Postal</label>
                <input
                  name="postal_code"
                  type="text"
                  placeholder="BP 1234"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-brown focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Pays</label>
                <input
                  name="country"
                  type="text"
                  defaultValue="Togo"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-brown focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Téléphone de contact</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">+228</span>
                  </div>
                  <input
                    type="text"
                    name="phone"
                    value={deliveryPhone}
                    onChange={handleDeliveryPhoneChange}
                    placeholder="70123456"
                    required
                    className={`w-full pl-12 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-adawi-brown focus:border-transparent ${deliveryPhone && !isValidPhone(deliveryPhone)
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                      }`}
                  />
                </div>
                {deliveryPhone && !isValidPhone(deliveryPhone) && (
                  <p className="mt-1 text-sm text-red-600">
                    Format invalide. Ex: 70123456, 91234567
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Informations de paiement */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-adawi-brown">Informations de paiement</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Numéro de téléphone pour le paiement
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">+228</span>
                  </div>
                  <input
                    type="text"
                    name="phone_number"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="70123456"
                    required
                    className={`w-full pl-12 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-adawi-brown focus:border-transparent ${phoneNumber && !isValidPhone(phoneNumber)
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                      }`}
                  />
                </div>
                {phoneNumber && !isValidPhone(phoneNumber) && (
                  <p className="mt-1 text-sm text-red-600">
                    Format invalide. Ex: 70123456, 91234567
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Opérateur de paiement mobile
                </label>
                <select
                  name="network"
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-brown focus:border-transparent"
                  required
                >
                  <option value="">-- Sélectionnez votre opérateur --</option>
                  <option value="TMONEY">T-money (Togocom)</option>
                  <option value="FLOOZ">Flooz (Moov)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={
              isSubmitting ||
              !isValidPhone(phoneNumber) ||
              !isValidPhone(deliveryPhone) ||
              !network
            }
            className="w-full bg-adawi-brown text-white py-4 px-6 rounded-lg hover:bg-adawi-brown/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg font-medium"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Traitement en cours...
              </>
            ) : (
              "Finaliser et payer la commande"
            )}
          </button>
        </Form>

        {/* Help text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-800 mb-2">Instructions de paiement :</p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Assurez-vous que votre compte mobile money a suffisamment de solde</li>
            <li>• Vous recevrez une notification de paiement sur votre téléphone</li>
            <li>• Composez votre code PIN pour confirmer le paiement</li>
            <li>• Une confirmation vous sera envoyée une fois le paiement validé</li>
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  );
}
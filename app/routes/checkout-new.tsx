import type { LoaderFunction, ActionFunction, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation, useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { API_BASE } from "~/utils/auth.server";
import { readToken } from "~/utils/session.server";
import { useSearchParams } from "react-router-dom";
import CompactHeader from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import TopBanner from "~/components/TopBanner";

export const meta: MetaFunction = () => [
  { title: "Finaliser la commande — Adawi" },
  { name: "description", content: "Finalisez votre commande Adawi en toute sécurité." },
  { name: "viewport", content: "width=device-width, initial-scale=1" },
];

interface LoaderData {
  cartItems?: any[];
  cartTotal?: number;
  profile?: {
    full_name?: string;
    address?: {
      street?: string;
      city?: string;
      postal_code?: string;
      country?: string;
      phone?: string;
    };
  } | null;
}

export const loader: LoaderFunction = async ({ request }) => {
  const token = await readToken(request);
  if (!token) return redirect("/login");

  let authToken = "";
  if (typeof token === "string") {
    try { authToken = JSON.parse(token)?.access_token || token; }
    catch { authToken = token; }
  } else { authToken = token as string; }

  try {
    const res = await fetch(`${API_BASE}/profile/`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!res.ok) return json<LoaderData>({ profile: null });
    return json<LoaderData>({ profile: await res.json() });
  } catch {
    return json<LoaderData>({ profile: null });
  }
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("_action") as string;

  const token = await readToken(request);
  if (!token) return redirect("/login");

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
    const street = formData.get("street") as string;
    const city = formData.get("city") as string;
    const postal_code = formData.get("postal_code") as string;
    const country = formData.get("country") as string;
    const phone = formData.get("phone") as string;
    const phone_number = formData.get("phone_number") as string;
    const network = formData.get("network") as string;

    if (!street || !city || !postal_code || !country || !phone || !phone_number || !network) {
      return json({ error: "Tous les champs sont requis" }, { status: 400 });
    }

    const phoneRegex = /^(70|79|90|91|92|93|96|97|98|99)\d{6}$/;
    if (!phoneRegex.test(phone_number)) {
      return json({ error: "Format de numéro de téléphone invalide" }, { status: 400 });
    }

    try {
      const url = new URL(`${API_BASE}/orders/checkout`);
      url.searchParams.append("phone_number", phone_number);
      url.searchParams.append("network", network);

      const res = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ street, city, postal_code, country, phone }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = "Une erreur est survenue lors du traitement de la commande";
        try {
          const data = JSON.parse(errorText);
          if (res.status === 401) return redirect("/login");
          if (res.status === 422 && Array.isArray(data.detail)) {
            errorMessage = data.detail.map((e: any) => `${e.loc?.join(".") || "Champ"}: ${e.msg}`).join(", ");
          } else {
            errorMessage = data.detail || data.message || data.error || errorMessage;
          }
        } catch {
          errorMessage = `Erreur ${res.status}: ${errorText}`;
        }
        return json({ error: errorMessage }, { status: res.status });
      }

      const responseText = await res.text();
      try {
        const data = JSON.parse(responseText);
        if (data.payment_url) return redirect(data.payment_url);
        if (data.order) return json({ success: true, order: data.order, message: "Commande créée avec succès" });
      } catch {}

      if (responseText.includes("paygateglobal.com")) return redirect(responseText.trim());
      const location = res.headers.get("location");
      if (location) return redirect(location);
      if (/^https?:\/\/.+/.test(responseText.trim())) return redirect(responseText.trim());

      return json({ error: `Format de réponse inattendu` }, { status: 500 });
    } catch (error) {
      return json(
        { error: error instanceof TypeError ? "Erreur de connexion au serveur." : `Erreur: ${error instanceof Error ? error.message : String(error)}` },
        { status: 500 }
      );
    }
  }

  return json({ error: "Action non reconnue" }, { status: 400 });
};

export default function CheckoutPage() {
  const { profile } = useLoaderData<LoaderData>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [network, setNetwork] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState(
    profile?.address?.phone?.replace(/^\+228/, "") || ""
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [mounted, setMounted] = useState(false);

  const [deliveryInfo, setDeliveryInfo] = useState({
    street:      profile?.address?.street      || "",
    city:        profile?.address?.city        || "",
    postal_code: profile?.address?.postal_code || "",
    country:     profile?.address?.country     || "Togo",
  });

  const total = Number(searchParams.get("total")) || 0;
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => { setMounted(true); }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, "");
    if (v.length <= 8) setPhoneNumber(v);
  };

  const handleDeliveryPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, "");
    if (v.length <= 8) setDeliveryPhone(v);
  };

  const isValidPhone = (p: string) => /^(70|79|90|91|92|93|96|97|98|99)\d{6}$/.test(p);

  const isStep1Valid = () =>
    deliveryInfo.street.trim() &&
    deliveryInfo.city.trim() &&
    deliveryInfo.postal_code.trim() &&
    deliveryInfo.country.trim() &&
    isValidPhone(deliveryPhone);

  const steps = ["Livraison", "Paiement", "Confirmation"];

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <TopBanner />
      <CompactHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">

        {/* ── Page title ── */}
        <div className={`mb-10 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <p className="text-xs font-semibold tracking-widest text-[#C9A96E] uppercase mb-2">Commande</p>
          <h1 className="text-3xl lg:text-4xl font-bold text-[#1A1A1A]">Finaliser votre achat</h1>
        </div>

        {/* ── Stepper ── */}
        <div className={`mb-10 transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="flex items-center gap-0">
            {steps.map((label, i) => {
              const step = i + 1;
              const done = step < currentStep;
              const active = step === currentStep;
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-300
                      ${done ? "bg-[#6B8F71] text-white" : active ? "bg-[#8B5E3C] text-white shadow-lg shadow-[#8B5E3C]/30" : "bg-white border-2 border-gray-200 text-gray-400"}`}>
                      {done ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : step}
                    </div>
                    <span className={`text-sm font-medium hidden sm:block transition-colors ${active ? "text-[#1A1A1A]" : done ? "text-[#6B8F71]" : "text-gray-400"}`}>
                      {label}
                    </span>
                  </div>
                  {step < steps.length && (
                    <div className={`flex-1 h-0.5 mx-3 rounded-full transition-colors duration-500 ${done ? "bg-[#6B8F71]" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">

          {/* ── LEFT — Form ── */}
          <div className={`lg:col-span-3 transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

            {/* Alerts */}
            {actionData?.error && (
              <div className="mb-6 flex gap-3 items-start bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4">
                <div className="mt-0.5 w-5 h-5 shrink-0 text-red-500">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-sm">Erreur</p>
                  <p className="text-sm mt-0.5">{actionData.error}</p>
                </div>
              </div>
            )}

            {actionData?.success && (
              <div className="mb-6 flex gap-3 items-start bg-green-50 border border-green-200 text-green-800 rounded-2xl p-4">
                <div className="mt-0.5 w-5 h-5 shrink-0 text-green-500">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm font-semibold">Commande créée avec succès !</p>
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <Form method="post">
                <input type="hidden" name="_action" value="checkout" />
                <input type="hidden" name="phone" value={deliveryPhone} />

                {/* ─ STEP 1 : Livraison ─ */}
                <div className={currentStep === 1 ? "block" : "hidden"}>
                  <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#8B5E3C]/10 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#8B5E3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-[#1A1A1A]">Adresse de livraison</h2>
                        <p className="text-xs text-[#6B6B6B]">Où souhaitez-vous recevoir votre commande ?</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Bandeau profil pré-rempli */}
                    {profile?.address?.street && (
                      <div className="flex items-center gap-2 bg-[#F0F7F1] border border-[#6B8F71]/30 rounded-xl px-4 py-2.5">
                        <svg className="w-4 h-4 text-[#6B8F71] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className="text-xs text-[#4A7A52] font-medium">
                          Adresse pré-remplie depuis votre profil — modifiable ci-dessous
                        </p>
                      </div>
                    )}

                    {/* Rue */}
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wide mb-2">
                        Rue / Adresse complète <span className="text-[#C0392B]">*</span>
                      </label>
                      <input
                        name="street"
                        type="text"
                        value={deliveryInfo.street}
                        onChange={(e) => setDeliveryInfo(p => ({ ...p, street: e.target.value }))}
                        placeholder="Ex : Quartier Bè Klikamé, non loin de..."
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#FAFAF8] text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 transition"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Ville */}
                      <div>
                        <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wide mb-2">
                          Ville <span className="text-[#C0392B]">*</span>
                        </label>
                        <input
                          name="city"
                          type="text"
                          value={deliveryInfo.city}
                          onChange={(e) => setDeliveryInfo(p => ({ ...p, city: e.target.value }))}
                          placeholder="Lomé"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#FAFAF8] text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 transition"
                        />
                      </div>

                      {/* Code postal */}
                      <div>
                        <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wide mb-2">
                          Code postal <span className="text-[#C0392B]">*</span>
                        </label>
                        <input
                          name="postal_code"
                          type="text"
                          value={deliveryInfo.postal_code}
                          onChange={(e) => setDeliveryInfo(p => ({ ...p, postal_code: e.target.value }))}
                          placeholder="BP 1234"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#FAFAF8] text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 transition"
                        />
                      </div>
                    </div>

                    {/* Pays */}
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wide mb-2">
                        Pays <span className="text-[#C0392B]">*</span>
                      </label>
                      <input
                        name="country"
                        type="text"
                        value={deliveryInfo.country}
                        onChange={(e) => setDeliveryInfo(p => ({ ...p, country: e.target.value }))}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#FAFAF8] text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 transition"
                      />
                    </div>

                    {/* Téléphone livraison */}
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wide mb-2">
                        Téléphone de contact <span className="text-[#C0392B]">*</span>
                      </label>
                      <div className="flex rounded-xl border border-gray-200 bg-[#FAFAF8] overflow-hidden focus-within:border-[#8B5E3C] focus-within:ring-2 focus-within:ring-[#8B5E3C]/10 transition">
                        <span className="flex items-center px-4 text-sm font-semibold text-[#6B6B6B] bg-gray-100 border-r border-gray-200 shrink-0">
                          +228
                        </span>
                        <input
                          type="text"
                          value={deliveryPhone}
                          onChange={handleDeliveryPhoneChange}
                          placeholder="70 12 34 56"
                          required
                          className="flex-1 px-4 py-3 text-sm text-[#1A1A1A] bg-transparent placeholder:text-gray-400 focus:outline-none"
                        />
                        {deliveryPhone && (
                          <span className="flex items-center pr-4">
                            {isValidPhone(deliveryPhone)
                              ? <svg className="w-4 h-4 text-[#6B8F71]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                              : <svg className="w-4 h-4 text-[#C0392B]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            }
                          </span>
                        )}
                      </div>
                      {deliveryPhone && !isValidPhone(deliveryPhone) && (
                        <p className="mt-1.5 text-xs text-[#C0392B]">Format invalide. Exemples : 70123456, 91234567</p>
                      )}
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      disabled={!isStep1Valid()}
                      className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200
                        bg-[#8B5E3C] text-white hover:bg-[#5C3D1E] shadow-lg shadow-[#8B5E3C]/20
                        disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
                    >
                      Continuer vers le paiement →
                    </button>
                    {!isStep1Valid() && (
                      <p className="text-center text-xs text-[#6B6B6B] mt-3">Veuillez remplir tous les champs obligatoires</p>
                    )}
                  </div>
                </div>

                {/* ─ STEP 2 : Paiement ─ */}
                <div className={currentStep === 2 ? "block" : "hidden"}>
                  <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#C9A96E]/15 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#C9A96E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-[#1A1A1A]">Paiement Mobile Money</h2>
                        <p className="text-xs text-[#6B6B6B]">Rapide, sécurisé, sans frais supplémentaires</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Opérateur */}
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wide mb-3">
                        Opérateur <span className="text-[#C0392B]">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: "TMONEY", label: "T-Money", sub: "Togocom", color: "bg-blue-500" },
                          { value: "FLOOZ", label: "Flooz", sub: "Moov Africa", color: "bg-orange-500" },
                        ].map((op) => (
                          <button
                            key={op.value}
                            type="button"
                            onClick={() => setNetwork(op.value)}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left
                              ${network === op.value
                                ? "border-[#8B5E3C] bg-[#8B5E3C]/5 shadow-md"
                                : "border-gray-200 bg-[#FAFAF8] hover:border-gray-300"
                              }`}
                          >
                            <div className={`w-9 h-9 ${op.color} rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                              {op.label[0]}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#1A1A1A]">{op.label}</p>
                              <p className="text-xs text-[#6B6B6B]">{op.sub}</p>
                            </div>
                            {network === op.value && (
                              <svg className="w-4 h-4 text-[#8B5E3C] ml-auto shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                      <input type="hidden" name="network" value={network} />
                    </div>

                    {/* Numéro paiement */}
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wide mb-2">
                        Numéro Mobile Money <span className="text-[#C0392B]">*</span>
                      </label>
                      <div className="flex rounded-xl border border-gray-200 bg-[#FAFAF8] overflow-hidden focus-within:border-[#8B5E3C] focus-within:ring-2 focus-within:ring-[#8B5E3C]/10 transition">
                        <span className="flex items-center px-4 text-sm font-semibold text-[#6B6B6B] bg-gray-100 border-r border-gray-200 shrink-0">
                          +228
                        </span>
                        <input
                          type="text"
                          name="phone_number"
                          value={phoneNumber}
                          onChange={handlePhoneChange}
                          placeholder="70 12 34 56"
                          required
                          className="flex-1 px-4 py-3 text-sm text-[#1A1A1A] bg-transparent placeholder:text-gray-400 focus:outline-none"
                        />
                        {phoneNumber && (
                          <span className="flex items-center pr-4">
                            {isValidPhone(phoneNumber)
                              ? <svg className="w-4 h-4 text-[#6B8F71]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                              : <svg className="w-4 h-4 text-[#C0392B]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            }
                          </span>
                        )}
                      </div>
                      {phoneNumber && !isValidPhone(phoneNumber) && (
                        <p className="mt-1.5 text-xs text-[#C0392B]">Format invalide. Exemples : 70123456, 91234567</p>
                      )}
                    </div>

                    {/* Instructions */}
                    <div className="bg-[#F5F5F0] rounded-2xl p-4 border border-gray-200">
                      <p className="text-xs font-semibold text-[#1A1A1A] uppercase tracking-wide mb-3">Comment ça marche ?</p>
                      <div className="space-y-2.5">
                        {[
                          "Assurez-vous que votre solde Mobile Money est suffisant.",
                          "Vous recevrez une notification de confirmation sur votre téléphone.",
                          "Composez votre code PIN pour valider le paiement.",
                          "Votre commande sera confirmée immédiatement.",
                        ].map((text, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-[#C9A96E] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </div>
                            <p className="text-xs text-[#6B6B6B] leading-relaxed">{text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="sm:w-auto w-full px-6 py-3.5 rounded-xl text-sm font-semibold text-[#6B6B6B] bg-[#F5F5F0] hover:bg-gray-200 transition-all duration-200 order-2 sm:order-1"
                    >
                      ← Retour
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !isValidPhone(phoneNumber) || !network}
                      className="flex-1 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-2
                        bg-[#8B5E3C] text-white hover:bg-[#5C3D1E] shadow-lg shadow-[#8B5E3C]/20
                        disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed order-1 sm:order-2"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Traitement en cours...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Confirmer et payer
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </Form>
            </div>
          </div>

          {/* ── RIGHT — Order Summary ── */}
          <div className={`lg:col-span-2 transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="sticky top-6 space-y-4">

              {/* Total card */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-widest mb-4">Récapitulatif</h3>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B6B6B]">Sous-total</span>
                    <span className="font-medium text-[#1A1A1A]">{total > 0 ? total.toLocaleString() : "—"} F CFA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B6B6B]">Livraison</span>
                    <span className="font-medium text-[#6B8F71]">Gratuite</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B6B6B]">Taxes</span>
                    <span className="font-medium text-[#1A1A1A]">0 F CFA</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-semibold text-[#1A1A1A]">Total</span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#8B5E3C]">
                        {total > 0 ? total.toLocaleString() : "—"}
                      </p>
                      <p className="text-xs text-[#6B6B6B]">F CFA</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery recap (visible only on step 2) */}
              {currentStep === 2 && deliveryInfo.street && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-widest">Livraison</h4>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs text-[#8B5E3C] hover:underline font-medium"
                    >
                      Modifier
                    </button>
                  </div>
                  <div className="text-sm text-[#1A1A1A] space-y-1">
                    <p className="font-medium">{deliveryInfo.street}</p>
                    <p className="text-[#6B6B6B]">{deliveryInfo.city}{deliveryInfo.postal_code ? `, ${deliveryInfo.postal_code}` : ""}</p>
                    <p className="text-[#6B6B6B]">{deliveryInfo.country}</p>
                    {deliveryPhone && <p className="text-[#6B6B6B]">+228 {deliveryPhone}</p>}
                  </div>
                </div>
              )}

              {/* Trust badges */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
                <div className="space-y-3">
                  {[
                    { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: "Paiement 100% sécurisé" },
                    { icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", label: "Livraison sous 24–48h" },
                    { icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", label: "Mobile Money T-Money & Flooz" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F5F5F0] flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-[#8B5E3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                        </svg>
                      </div>
                      <p className="text-xs text-[#6B6B6B] font-medium">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

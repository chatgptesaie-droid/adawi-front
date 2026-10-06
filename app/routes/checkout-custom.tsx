import type { LoaderFunction, ActionFunction, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation, useLoaderData, Link } from "@remix-run/react";
import { useState } from "react";
import { API_BASE } from "~/utils/auth.server";
import { readToken } from "~/utils/session.server";
import CompactHeader from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import TopBanner from "~/components/TopBanner";
import { ArrowLeft, Calendar, Ruler, Package, CreditCard, Camera, MapPin, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

export const meta: MetaFunction = () => [
  { title: "Commande sur mesure — Adawi" },
  { name: "description", content: "Commandez un vêtement sur mesure, parfaitement adapté à vous." },
];

// ─── Loader ───────────────────────────────────────────────────────────────────
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
    if (!res.ok) return json({ profile: null });
    return json({ profile: await res.json() });
  } catch {
    return json({ profile: null });
  }
};

// ─── Action ───────────────────────────────────────────────────────────────────
export const action: ActionFunction = async ({ request }) => {
  const token = await readToken(request);
  if (!token) return redirect("/login");

  let authToken = "";
  if (typeof token === "string") {
    try { authToken = JSON.parse(token)?.access_token || token; }
    catch { authToken = token; }
  } else { authToken = token as string; }

  const formData = await request.formData();
  const phone_number   = formData.get("phone_number")  as string;
  const network        = formData.get("network")        as string;
  const description    = formData.get("description")    as string;
  const current_size   = formData.get("current_size")   as string;
  const delivery_type  = formData.get("delivery_type")  as string;
  const delivery_date  = formData.get("delivery_date")  as string;

  const measurements = {
    height: parseFloat(formData.get("height") as string) || 0,
    weight: parseFloat(formData.get("weight") as string) || 0,
    shoulder_width: parseFloat(formData.get("shoulder_width") as string) || 0,
    chest: parseFloat(formData.get("chest") as string) || 0,
    waist_length: parseFloat(formData.get("waist_length") as string) || 0,
    ventral_circumference: parseFloat(formData.get("ventral_circumference") as string) || 0,
    hips: parseFloat(formData.get("hips") as string) || 0,
    corsage_length: parseFloat(formData.get("corsage_length") as string) || 0,
    belt: parseFloat(formData.get("belt") as string) || 0,
    skirt_length: parseFloat(formData.get("skirt_length") as string) || 0,
    dress_length: parseFloat(formData.get("dress_length") as string) || 0,
    sleeve_length: parseFloat(formData.get("sleeve_length") as string) || 0,
    sleeve_circumference: parseFloat(formData.get("sleeve_circumference") as string) || 0,
    pants_length: parseFloat(formData.get("pants_length") as string) || 0,
    short_dress_length: parseFloat(formData.get("short_dress_length") as string) || 0,
    thigh_circumference: parseFloat(formData.get("thigh_circumference") as string) || 0,
    knee_length: parseFloat(formData.get("knee_length") as string) || 0,
    knee_circumference: parseFloat(formData.get("knee_circumference") as string) || 0,
    bottom: parseFloat(formData.get("bottom") as string) || 0,
    inseam: parseFloat(formData.get("inseam") as string) || 0,
    other_measurements: (formData.get("other_measurements") as string) || "",
  };

  let address: any = null;
  if (delivery_type === "delivery") {
    address = {
      street:      formData.get("street")      as string,
      city:        formData.get("city")        as string,
      postal_code: formData.get("postal_code") as string,
      country:     formData.get("country")     as string,
      phone:       formData.get("phone")       as string,
    };
  }

  if (!phone_number || !network || !description || !current_size || !delivery_type || !delivery_date)
    return json({ error: "Tous les champs requis doivent être remplis" }, { status: 400 });

  if (!/^(70|79|90|91|92|93|96|97|98|99)\d{6}$/.test(phone_number))
    return json({ error: "Format de numéro de téléphone invalide" }, { status: 400 });

  if (delivery_type === "delivery" && (!address?.street || !address?.city || !address?.postal_code || !address?.country || !address?.phone))
    return json({ error: "Adresse complète requise pour la livraison" }, { status: 400 });

  try {
    const submitData = new FormData();
    submitData.append("description", description);
    submitData.append("measurements", JSON.stringify(measurements));
    submitData.append("current_size", current_size);
    submitData.append("delivery_type", delivery_type);
    submitData.append("delivery_date", delivery_date);
    if (address) submitData.append("address", JSON.stringify(address));
    (formData.getAll("photos") as File[]).forEach((p) => { if (p.size > 0) submitData.append("photos", p); });

    const url = new URL(`${API_BASE}/orders/checkout-custom`);
    url.searchParams.append("phone_number", phone_number);
    url.searchParams.append("network", network);

    const res = await fetch(url.toString(), {
      method: "POST",
      body: submitData,
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = "Erreur lors de la création de la commande";
      try {
        const data = JSON.parse(errorText);
        errorMessage = Array.isArray(data.detail)
          ? data.detail.map((e: any) => e.msg).join(", ")
          : data.detail || data.message || errorText;
      } catch { errorMessage = errorText; }
      return json({ error: errorMessage }, { status: res.status });
    }

    const data = await res.json();
    if (data.payment_url) return redirect(data.payment_url);
    return json({ success: true, order: data.order });
  } catch (error: any) {
    return json({ error: `Erreur: ${error.message}` }, { status: 500 });
  }
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function CheckoutCustomPage() {
  const actionData  = useActionData<typeof action>();
  const navigation  = useNavigation();
  const { profile } = useLoaderData<typeof loader>();

  const [deliveryType,  setDeliveryType]  = useState("pickup");
  const [phoneNumber,   setPhoneNumber]   = useState(profile?.address?.phone || "");
  const [network,       setNetwork]       = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState(profile?.address?.phone || "");
  const [photos,        setPhotos]        = useState<File[]>([]);
  const [showMeasures,  setShowMeasures]  = useState(false);

  const measurementLabels: Record<string, string> = {
    height: "Taille", weight: "Poids", shoulder_width: "Épaules",
    chest: "Poitrine", waist_length: "Taille",
    ventral_circumference: "Ventre", hips: "Hanches",
    corsage_length: "Corsage", belt: "Ceinture",
    skirt_length: "Jupe", dress_length: "Robe",
    sleeve_length: "Manche", sleeve_circumference: "Tour manche",
    pants_length: "Pantalon", short_dress_length: "Robe courte",
    thigh_circumference: "Cuisse", knee_length: "Genou",
    knee_circumference: "Tour genou", bottom: "Bas", inseam: "Entrejambe",
    other_measurements: "Autres mesures",
  };

  const [measurements, setMeasurements] = useState({
    height: profile?.measurements?.height || "",
    weight: profile?.measurements?.weight || "",
    shoulder_width: profile?.measurements?.shoulder_width || "",
    chest: profile?.measurements?.chest || "",
    waist_length: profile?.measurements?.waist_length || "",
    ventral_circumference: profile?.measurements?.ventral_circumference || "",
    hips: profile?.measurements?.hips || "",
    corsage_length: profile?.measurements?.corsage_length || "",
    belt: profile?.measurements?.belt || "",
    skirt_length: profile?.measurements?.skirt_length || "",
    dress_length: profile?.measurements?.dress_length || "",
    sleeve_length: profile?.measurements?.sleeve_length || "",
    sleeve_circumference: profile?.measurements?.sleeve_circumference || "",
    pants_length: profile?.measurements?.pants_length || "",
    short_dress_length: profile?.measurements?.short_dress_length || "",
    thigh_circumference: profile?.measurements?.thigh_circumference || "",
    knee_length: profile?.measurements?.knee_length || "",
    knee_circumference: profile?.measurements?.knee_circumference || "",
    bottom: profile?.measurements?.bottom || "",
    inseam: profile?.measurements?.inseam || "",
    other_measurements: profile?.measurements?.other_measurements || "",
  });

  const [description, setDescription] = useState("");
  const [currentSize, setCurrentSize] = useState(profile?.size || "");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [address, setAddress] = useState({
    street: profile?.address?.street || "",
    city: profile?.address?.city || "",
    postal_code: profile?.address?.postal_code || "",
    country: profile?.address?.country || "Togo",
    phone: profile?.address?.phone || "",
  });

  const isSubmitting = navigation.state === "submitting";
  const isValidPhone = (p: string) => /^(70|79|90|91|92|93|96|97|98|99)\d{6}$/.test(p);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, ""); if (v.length <= 8) setPhoneNumber(v);
  };
  const handleDeliveryPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, "");
    if (v.length <= 8) { setDeliveryPhone(v); setAddress(p => ({ ...p, phone: v })); }
  };
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPhotos(Array.from(e.target.files || []));
  const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMeasurements(p => ({ ...p, [name]: value }));
  };

  // shared classes
  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[#FAFAF8] text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 transition";
  const labelCls = "block text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide mb-1.5";

  // Phone input with prefix
  const PhoneInput = ({
    name, value, onChange, required = false,
  }: { name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean }) => (
    <div>
      <div className="flex rounded-xl border border-gray-200 bg-[#FAFAF8] overflow-hidden focus-within:border-[#8B5E3C] focus-within:ring-2 focus-within:ring-[#8B5E3C]/10 transition">
        <span className="flex items-center px-3 text-xs font-bold text-[#6B6B6B] bg-gray-100 border-r border-gray-200 shrink-0">+228</span>
        <input type="text" name={name} value={value} onChange={onChange} placeholder="70 12 34 56" required={required}
          className="flex-1 px-3 py-2.5 text-sm bg-transparent focus:outline-none" />
        {value && (
          <span className="flex items-center pr-3">
            {isValidPhone(value)
              ? <CheckCircle className="w-4 h-4 text-[#6B8F71]" />
              : <svg className="w-4 h-4 text-[#C0392B]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>}
          </span>
        )}
      </div>
      {value && !isValidPhone(value) && (
        <p className="mt-1 text-xs text-[#C0392B]">Format invalide (ex: 70123456)</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <TopBanner />
      <CompactHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between mb-5">
          <Link to="/boutique" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6B6B6B] hover:text-[#8B5E3C] transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Retour à la boutique
          </Link>
          <Link to="/client/appointments"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#8B5E3C] text-[#8B5E3C] text-sm font-semibold hover:bg-[#8B5E3C] hover:text-white transition-all">
            <Calendar className="w-4 h-4" />
            Prendre RDV
          </Link>
        </div>

        {/* ── Alerts ── */}
        {actionData?.error && (
          <div className="mb-4 flex gap-3 items-center bg-red-50 border border-red-200 text-red-800 rounded-2xl px-4 py-3 text-sm">
            <svg className="w-4 h-4 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span><strong>Erreur :</strong> {actionData.error}</span>
          </div>
        )}
        {actionData?.success && (
          <div className="mb-4 flex gap-3 items-center bg-green-50 border border-green-200 text-green-800 rounded-2xl px-4 py-3 text-sm">
            <CheckCircle className="w-4 h-4 shrink-0 text-green-500" />
            <span><strong>Commande créée !</strong> ID : {actionData.order?.id}</span>
          </div>
        )}

        {/* ── Main grid ── */}
        <Form method="post" encType="multipart/form-data">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* ════ COLONNE GAUCHE (2/3) ════ */}
            <div className="lg:col-span-2 space-y-4">

              {/* ── Card : Titre + Description + Taille ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                {/* Header card */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-xl bg-[#8B5E3C]/10 flex items-center justify-center">
                    <Package className="w-4 h-4 text-[#8B5E3C]" />
                  </div>
                  <div>
                    <h1 className="text-base font-bold text-[#1A1A1A]">Commande sur mesure</h1>
                    <p className="text-xs text-[#6B6B6B]">Vêtement entièrement personnalisé selon vos mesures</p>
                  </div>
                </div>

                <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Description */}
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Description du vêtement <span className="text-[#C0392B]">*</span></label>
                    <textarea
                      name="description" value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Style, couleur, tissu, détails spécifiques..."
                      rows={4} required
                      className={`${inputCls} resize-none`}
                    />
                  </div>

                  {/* Taille + Date */}
                  <div className="space-y-3">
                    <div>
                      <label className={labelCls}>Taille actuelle <span className="text-[#C0392B]">*</span></label>
                      <select name="current_size" value={currentSize} onChange={(e) => setCurrentSize(e.target.value)} required className={inputCls}>
                        <option value="">Sélectionner...</option>
                        {["XS","S","M","L","XL","XXL"].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Date souhaitée <span className="text-[#C0392B]">*</span></label>
                      <input type="date" name="delivery_date" value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        required className={inputCls} />
                    </div>
                    {/* Photo upload compact */}
                    <div>
                      <label className={labelCls}>Photos de référence</label>
                      <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-gray-300 bg-[#FAFAF8] hover:border-[#8B5E3C] hover:bg-[#8B5E3C]/5 transition cursor-pointer text-xs text-[#6B6B6B]">
                        <Camera className="w-4 h-4 shrink-0 text-[#8B5E3C]" />
                        {photos.length > 0 ? `${photos.length} photo${photos.length > 1 ? "s" : ""} choisie${photos.length > 1 ? "s" : ""}` : "Ajouter des photos"}
                        <input type="file" name="photos" multiple accept="image/*" onChange={handlePhotoChange} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Card : Mesures (accordéon) ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowMeasures(!showMeasures)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#8B5E3C]/10 flex items-center justify-center">
                      <Ruler className="w-4 h-4 text-[#8B5E3C]" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-[#1A1A1A]">Mesures corporelles <span className="text-xs font-normal text-[#6B6B6B]">(en cm)</span></p>
                      <p className="text-xs text-[#6B6B6B]">{showMeasures ? "Cliquez pour réduire" : "Cliquez pour renseigner vos mesures"}</p>
                    </div>
                  </div>
                  {showMeasures
                    ? <ChevronUp className="w-4 h-4 text-[#6B6B6B]" />
                    : <ChevronDown className="w-4 h-4 text-[#6B6B6B]" />
                  }
                </button>

                {showMeasures && (
                  <div className="px-5 pb-5 border-t border-gray-100">
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-4">
                      {Object.entries(measurements).map(([key, value]) => {
                        if (key === "other_measurements") return (
                          <div key={key} className="col-span-3 sm:col-span-4 lg:col-span-5">
                            <label className={labelCls}>{measurementLabels[key]}</label>
                            <textarea name={key} rows={2} value={value as string}
                              onChange={handleMeasurementChange}
                              placeholder="Autres précisions..."
                              className={`${inputCls} resize-none`} />
                          </div>
                        );
                        return (
                          <div key={key}>
                            <label className={labelCls}>{measurementLabels[key]}</label>
                            <div className="relative">
                              <input type="number" name={key} step="0.1" placeholder="0"
                                value={value as string}
                                onChange={handleMeasurementChange}
                                className={`${inputCls} pr-8`} />
                              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium">cm</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* ════ COLONNE DROITE (1/3) ════ */}
            <div className="space-y-4">

              {/* ── Livraison ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-xl bg-[#8B5E3C]/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-[#8B5E3C]" />
                  </div>
                  <p className="text-sm font-bold text-[#1A1A1A]">Livraison</p>
                </div>
                <div className="p-5 space-y-4">

                  {/* Mode */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "pickup",   label: "Retrait boutique", sub: "Gratuit" },
                      { value: "delivery", label: "Livraison",        sub: "A domicile" },
                    ].map(opt => (
                      <button key={opt.value} type="button" onClick={() => setDeliveryType(opt.value)}
                        className={`flex flex-col items-start p-3 rounded-xl border-2 transition-all text-left
                          ${deliveryType === opt.value
                            ? "border-[#8B5E3C] bg-[#8B5E3C]/5"
                            : "border-gray-200 bg-[#FAFAF8] hover:border-gray-300"}`}>
                        <p className="text-xs font-bold text-[#1A1A1A]">{opt.label}</p>
                        <p className="text-[10px] text-[#6B6B6B] mt-0.5">{opt.sub}</p>
                        {deliveryType === opt.value && <CheckCircle className="w-3 h-3 text-[#8B5E3C] mt-1" />}
                      </button>
                    ))}
                  </div>
                  <input type="hidden" name="delivery_type" value={deliveryType} />

                  {/* Adresse (si livraison) */}
                  {deliveryType === "delivery" && (
                    <div className="space-y-3 pt-2 border-t border-gray-100">
                      <div>
                        <label className={labelCls}>Rue <span className="text-[#C0392B]">*</span></label>
                        <input name="street" type="text" value={address.street}
                          onChange={(e) => setAddress(p => ({ ...p, street: e.target.value }))}
                          placeholder="Quartier, rue..." required className={inputCls} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className={labelCls}>Ville <span className="text-[#C0392B]">*</span></label>
                          <input name="city" type="text" value={address.city}
                            onChange={(e) => setAddress(p => ({ ...p, city: e.target.value }))}
                            placeholder="Lomé" required className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>Code postal</label>
                          <input name="postal_code" type="text" value={address.postal_code}
                            onChange={(e) => setAddress(p => ({ ...p, postal_code: e.target.value }))}
                            placeholder="BP..." required className={inputCls} />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Pays <span className="text-[#C0392B]">*</span></label>
                        <input name="country" type="text" value={address.country}
                          onChange={(e) => setAddress(p => ({ ...p, country: e.target.value }))}
                          required className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Téléphone <span className="text-[#C0392B]">*</span></label>
                        <PhoneInput name="phone" value={deliveryPhone} onChange={handleDeliveryPhoneChange} required />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Paiement ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-xl bg-[#C9A96E]/15 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-[#C9A96E]" />
                  </div>
                  <p className="text-sm font-bold text-[#1A1A1A]">Paiement Mobile Money</p>
                </div>
                <div className="p-5 space-y-4">

                  {/* Opérateur */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "TMONEY", label: "T-Money",  sub: "Togocom",     color: "bg-blue-500" },
                      { value: "FLOOZ",  label: "Flooz",    sub: "Moov Africa", color: "bg-orange-500" },
                    ].map(op => (
                      <button key={op.value} type="button" onClick={() => setNetwork(op.value)}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all
                          ${network === op.value
                            ? "border-[#8B5E3C] bg-[#8B5E3C]/5"
                            : "border-gray-200 bg-[#FAFAF8] hover:border-gray-300"}`}>
                        <div className={`w-7 h-7 ${op.color} rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>{op.label[0]}</div>
                        <div className="text-left min-w-0">
                          <p className="text-xs font-bold text-[#1A1A1A]">{op.label}</p>
                          <p className="text-[10px] text-[#6B6B6B] truncate">{op.sub}</p>
                        </div>
                        {network === op.value && <CheckCircle className="w-3 h-3 text-[#8B5E3C] ml-auto shrink-0" />}
                      </button>
                    ))}
                  </div>
                  <input type="hidden" name="network" value={network} />

                  {/* Numéro */}
                  <div>
                    <label className={labelCls}>Numéro <span className="text-[#C0392B]">*</span></label>
                    <PhoneInput name="phone_number" value={phoneNumber} onChange={handlePhoneChange} required />
                  </div>

                  <p className="text-[11px] text-[#6B6B6B] bg-[#F5F5F0] rounded-xl px-3 py-2.5 border border-gray-200">
                    Vous serez redirigé vers la page de paiement mobile pour finaliser.
                  </p>
                </div>
              </div>

              {/* ── Bouton submit ── */}
              <button type="submit" disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl text-sm font-bold tracking-wide flex items-center justify-center gap-2
                  bg-[#8B5E3C] text-white hover:bg-[#5C3D1E] shadow-lg shadow-[#8B5E3C]/20
                  disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed transition-all">
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
                    <Package className="w-4 h-4" />
                    Commander sur mesure
                  </>
                )}
              </button>

              <Link to="/client/appointments"
                className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2
                  border-2 border-[#8B5E3C] text-[#8B5E3C] hover:bg-[#8B5E3C] hover:text-white transition-all">
                <Calendar className="w-4 h-4" />
                Ou prendre rendez-vous
              </Link>

              {/* Info cards condensées */}
              <div className="space-y-2">
                {[
                  { icon: <Ruler className="w-3.5 h-3.5 text-[#8B5E3C]" />, title: "Mesures précises", text: "Venez en boutique pour un service professionnel." },
                  { icon: <Calendar className="w-3.5 h-3.5 text-[#8B5E3C]" />, title: "Délai 7–14 jours", text: "Selon la complexité du vêtement." },
                  { icon: <Package className="w-3.5 h-3.5 text-[#8B5E3C]" />, title: "Suivi personnalisé", text: "Notifications à chaque étape." },
                ].map((c, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3">
                    <div className="w-6 h-6 rounded-lg bg-[#8B5E3C]/10 flex items-center justify-center shrink-0 mt-0.5">{c.icon}</div>
                    <div>
                      <p className="text-xs font-bold text-[#1A1A1A]">{c.title}</p>
                      <p className="text-[11px] text-[#6B6B6B]">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </Form>
      </div>

      <Footer />
    </div>
  );
}

import { LoaderFunction, json, redirect, ActionFunction } from "@remix-run/node";
import { useLoaderData, useNavigation, Form, useActionData } from "@remix-run/react";
import { readToken } from "~/utils/session.server";
import ClientLayout from "~/components/client/ClientLayout";
import { useState } from "react";
import {
  User, Mail, MapPin, Shield, Ruler, Camera, LogOut,
  Pencil, Check, X, ChevronDown, ChevronUp, Phone
} from "lucide-react";

// ─── fetch with timeout ───────────────────────────────────────────────────────
async function fetchWithTimeout(url: string, options: RequestInit, ms = 10000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { ...options, signal: ctrl.signal });
    clearTimeout(id); return r;
  } catch (e) { clearTimeout(id); throw e; }
}

// ─── Loader ───────────────────────────────────────────────────────────────────
export const loader: LoaderFunction = async ({ request }) => {
  const token = await readToken(request);
  if (!token) return redirect("/login");

  try {
    const res = await fetchWithTimeout(
      "http://localhost:8000/profile/",
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
      10000
    );
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) return redirect("/login");
      let msg = "Erreur lors de la récupération des données";
      try { const d = await res.json(); msg = d.message || d.detail || msg; } catch {}
      return json({ error: msg, user: null }, { status: res.status });
    }
    return json({ user: await res.json(), error: null });
  } catch (e: any) {
    if (e.name === "AbortError") return redirect("/login?error=timeout");
    if (e.message?.includes("fetch")) return redirect("/login?error=network");
    return redirect("/login?error=unknown");
  }
};

// ─── Action ───────────────────────────────────────────────────────────────────
export const action: ActionFunction = async ({ request }) => {
  const token = await readToken(request);
  if (!token) return redirect("/login");

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "updateProfile") {
    const fd = new FormData();
    const mFields = [
      "height","weight","shoulder_width","chest","waist_length","ventral_circumference",
      "hips","corsage_length","belt","skirt_length","dress_length","sleeve_length",
      "sleeve_circumference","pants_length","short_dress_length","thigh_circumference",
      "knee_length","knee_circumference","bottom","inseam",
    ];
    const measurements: any = {};
    mFields.forEach(f => { measurements[f] = parseFloat(formData.get(f) as string) || 0; });
    measurements.other_measurements = formData.get("other_measurements") || "";

    const address = {
      street: formData.get("address_street") || "",
      city: formData.get("address_city") || "",
      postal_code: formData.get("address_postal_code") || "",
      country: formData.get("address_country") || "",
      phone: formData.get("address_phone") || "",
    };

    fd.append("measurements", JSON.stringify(measurements));
    fd.append("address", JSON.stringify(address));
    fd.append("size", (formData.get("size") as string) || "");
    (formData.getAll("photos") as File[]).forEach(p => { if (p.size > 0) fd.append("photos", p); });

    try {
      const res = await fetchWithTimeout(
        "http://localhost:8000/profile/",
        { method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: fd },
        10000
      );
      if (!res.ok) {
        const d = await res.json();
        return json({ success: false, error: d.detail || "Erreur lors de la mise à jour" });
      }
      return json({ success: true, message: "Profil mis à jour avec succès" });
    } catch {
      return json({ success: false, error: "Erreur réseau lors de la mise à jour" });
    }
  }
  return json({ success: false, error: "Action non reconnue" });
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const data       = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [isEditing,     setIsEditing]     = useState(false);
  const [showMeasures,  setShowMeasures]  = useState(false);

  const isSubmitting = navigation.state === "submitting";

  // ── Error state ──
  if (data.error && !data.user) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-sm w-full text-center">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <X className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-base font-bold text-[#1A1A1A] mb-2">Erreur de chargement</h2>
            <p className="text-sm text-[#6B6B6B] mb-6">{data.error}</p>
            <a href="/login" className="block w-full py-2.5 rounded-xl bg-[#8B5E3C] text-white text-sm font-semibold hover:bg-[#5C3D1E] transition mb-2">
              Se reconnecter
            </a>
            <a href="/" className="block w-full py-2.5 rounded-xl bg-[#F5F5F0] text-[#6B6B6B] text-sm font-semibold hover:bg-gray-200 transition">
              Retour à l'accueil
            </a>
          </div>
        </div>
      </ClientLayout>
    );
  }

  const user = data.user;
  const hasMeasurements = user.measurements && Object.keys(user.measurements).some(k => k !== "other_measurements" && user.measurements[k]);

  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[#FAFAF8] text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 transition";
  const labelCls = "block text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide mb-1.5";

  const measurementLabels: Record<string, string> = {
    height: "Taille", weight: "Poids", shoulder_width: "Épaules",
    chest: "Poitrine", waist_length: "Taille (cm)", ventral_circumference: "Ventre",
    hips: "Hanches", corsage_length: "Corsage", belt: "Ceinture",
    skirt_length: "Jupe", dress_length: "Robe", sleeve_length: "Manche",
    sleeve_circumference: "Tour manche", pants_length: "Pantalon",
    short_dress_length: "Robe courte", thigh_circumference: "Cuisse",
    knee_length: "Genou", knee_circumference: "Tour genou",
    bottom: "Bas", inseam: "Entrejambe",
  };

  return (
    <ClientLayout userName={user.full_name}>
      <div className="space-y-4">

        {/* ── Alerts ── */}
        {actionData?.success && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 rounded-2xl px-4 py-3 text-sm">
            <Check className="w-4 h-4 shrink-0 text-[#6B8F71]" />
            <span>{actionData.message}</span>
          </div>
        )}
        {actionData?.error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 rounded-2xl px-4 py-3 text-sm">
            <X className="w-4 h-4 shrink-0 text-[#C0392B]" />
            <span>{actionData.error}</span>
          </div>
        )}

        {/* ════ VIEW MODE ════ */}
        {!isEditing ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* ── COL GAUCHE : avatar + actions ── */}
            <div className="space-y-4">

              {/* Avatar card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
                <div className="w-20 h-20 rounded-2xl bg-[#8B5E3C]/10 flex items-center justify-center mx-auto mb-4 overflow-hidden">
                  {user.photo?.[0]
                    ? <img src={user.photo[0]} alt={user.full_name} className="w-full h-full object-cover" />
                    : <User className="w-9 h-9 text-[#8B5E3C]" />
                  }
                </div>
                <h2 className="text-base font-bold text-[#1A1A1A] mb-0.5">{user.full_name}</h2>
                <p className="text-xs text-[#6B6B6B] mb-4">
                  Membre depuis {new Date(user.created_at).toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}
                </p>

                {/* badges */}
                <div className="flex items-center justify-center gap-2 flex-wrap mb-5">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#C9A96E]/15 text-[#8B5E3C]">
                    <Shield className="w-3 h-3" />{user.role}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold
                    ${user.is_active ? "bg-green-100 text-[#6B8F71]" : "bg-red-100 text-[#C0392B]"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? "bg-[#6B8F71]" : "bg-[#C0392B]"}`} />
                    {user.is_active ? "Actif" : "Inactif"}
                  </span>
                  {user.size && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#F5F5F0] text-[#6B6B6B]">
                      <Ruler className="w-3 h-3" />{user.size}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full py-2.5 rounded-xl bg-[#8B5E3C] text-white text-sm font-semibold hover:bg-[#5C3D1E] transition flex items-center justify-center gap-2"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Modifier le profil
                </button>
              </div>

              {/* Logout */}
              <Form method="post" action="/logout">
                <button type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#F5F5F0] text-[#6B6B6B] text-sm font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2">
                  <LogOut className="w-3.5 h-3.5" />
                  Se déconnecter
                </button>
              </Form>
            </div>

            {/* ── COL DROITE : infos + mensurations ── */}
            <div className="lg:col-span-2 space-y-4">

              {/* Infos personnelles */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-xl bg-[#8B5E3C]/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-[#8B5E3C]" />
                  </div>
                  <p className="text-sm font-bold text-[#1A1A1A]">Informations personnelles</p>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {/* Nom */}
                  <div className="flex items-center gap-3 bg-[#FAFAF8] rounded-xl p-3">
                    <div className="w-8 h-8 rounded-lg bg-[#C9A96E]/15 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-[#8B5E3C]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wide">Nom complet</p>
                      <p className="text-sm font-semibold text-[#1A1A1A] truncate">{user.full_name}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-3 bg-[#FAFAF8] rounded-xl p-3">
                    <div className="w-8 h-8 rounded-lg bg-[#C9A96E]/15 flex items-center justify-center shrink-0">
                      <Mail className="w-3.5 h-3.5 text-[#8B5E3C]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wide">Email</p>
                      <p className="text-sm font-semibold text-[#1A1A1A] truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* Adresse */}
                  {user.address && (
                    <div className="flex items-start gap-3 bg-[#FAFAF8] rounded-xl p-3 sm:col-span-2">
                      <div className="w-8 h-8 rounded-lg bg-[#C9A96E]/15 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#8B5E3C]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wide mb-0.5">Adresse</p>
                        <p className="text-sm font-semibold text-[#1A1A1A]">{user.address.street || "—"}</p>
                        <p className="text-xs text-[#6B6B6B]">
                          {[user.address.postal_code, user.address.city, user.address.country].filter(Boolean).join(" • ")}
                        </p>
                        {user.address.phone && (
                          <p className="text-xs text-[#6B6B6B] flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" />{user.address.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mensurations */}
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
                      <p className="text-sm font-bold text-[#1A1A1A]">Mes mensurations</p>
                      <p className="text-xs text-[#6B6B6B]">{hasMeasurements ? "Cliquez pour afficher" : "Non renseignées"}</p>
                    </div>
                  </div>
                  {showMeasures ? <ChevronUp className="w-4 h-4 text-[#6B6B6B]" /> : <ChevronDown className="w-4 h-4 text-[#6B6B6B]" />}
                </button>

                {showMeasures && (
                  <div className="px-5 pb-5 border-t border-gray-100">
                    {hasMeasurements ? (
                      <>
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-4">
                          {Object.entries(user.measurements).map(([key, value]) => {
                            if (key === "other_measurements" || !value) return null;
                            const label = measurementLabels[key] || key.replace(/_/g, " ");
                            return (
                              <div key={key} className="bg-[#FAFAF8] rounded-xl p-3 text-center">
                                <p className="text-[10px] text-[#6B6B6B] font-semibold uppercase tracking-wide mb-1">{label}</p>
                                <p className="text-sm font-bold text-[#8B5E3C]">{String(value)}<span className="text-[10px] font-normal text-[#6B6B6B] ml-0.5">cm</span></p>
                              </div>
                            );
                          })}
                        </div>
                        {user.measurements.other_measurements && (
                          <div className="mt-3 bg-[#FAFAF8] rounded-xl p-3">
                            <p className="text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wide mb-1">Notes supplémentaires</p>
                            <p className="text-sm text-[#1A1A1A]">{user.measurements.other_measurements}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="mt-4 text-center py-6">
                        <p className="text-sm text-[#6B6B6B] mb-4">Vos mensurations ne sont pas encore enregistrées.</p>
                        <a href="tel:+22897732976"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B5E3C] text-white text-sm font-semibold hover:bg-[#5C3D1E] transition">
                          <Phone className="w-4 h-4" />
                          Nous contacter
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>

        ) : (

          /* ════ EDIT MODE ════ */
          <Form method="post" encType="multipart/form-data" onSubmit={() => setIsEditing(false)}>
            <input type="hidden" name="intent" value="updateProfile" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* ── COL GAUCHE ── */}
              <div className="space-y-4">

                {/* Photos */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-xl bg-[#8B5E3C]/10 flex items-center justify-center">
                      <Camera className="w-4 h-4 text-[#8B5E3C]" />
                    </div>
                    <p className="text-sm font-bold text-[#1A1A1A]">Photo de profil</p>
                  </div>
                  <div className="p-5 space-y-3">
                    {user.photo?.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {user.photo.map((p: string, i: number) => (
                          <img key={i} src={p} alt={`Photo ${i+1}`} className="w-full h-16 object-cover rounded-xl" />
                        ))}
                      </div>
                    )}
                    <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-gray-300 bg-[#FAFAF8] hover:border-[#8B5E3C] hover:bg-[#8B5E3C]/5 transition cursor-pointer text-xs text-[#6B6B6B]">
                      <Camera className="w-4 h-4 text-[#8B5E3C] shrink-0" />
                      Choisir une photo
                      <input type="file" name="photos" multiple accept="image/*" className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Taille */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <label className={labelCls}>Taille vestimentaire</label>
                  <select name="size" defaultValue={user.size || "M"} className={inputCls}>
                    {["XS","S","M","L","XL","XXL"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button type="submit" disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-[#8B5E3C] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#5C3D1E] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-[#8B5E3C]/20">
                    {isSubmitting
                      ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Enregistrement...</>
                      : <><Check className="w-4 h-4" />Enregistrer</>
                    }
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-[#F5F5F0] text-[#6B6B6B] text-sm font-semibold hover:bg-gray-200 disabled:opacity-50 transition flex items-center justify-center gap-2">
                    <X className="w-4 h-4" />
                    Annuler
                  </button>
                </div>
              </div>

              {/* ── COL DROITE ── */}
              <div className="lg:col-span-2 space-y-4">

                {/* Adresse */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-xl bg-[#8B5E3C]/10 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-[#8B5E3C]" />
                    </div>
                    <p className="text-sm font-bold text-[#1A1A1A]">Adresse de livraison</p>
                  </div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Rue / Adresse</label>
                      <input type="text" name="address_street" defaultValue={user.address?.street || ""} className={inputCls} placeholder="Quartier, rue..." />
                    </div>
                    <div>
                      <label className={labelCls}>Ville</label>
                      <input type="text" name="address_city" defaultValue={user.address?.city || ""} className={inputCls} placeholder="Lomé" />
                    </div>
                    <div>
                      <label className={labelCls}>Code postal</label>
                      <input type="text" name="address_postal_code" defaultValue={user.address?.postal_code || ""} className={inputCls} placeholder="BP..." />
                    </div>
                    <div>
                      <label className={labelCls}>Pays</label>
                      <input type="text" name="address_country" defaultValue={user.address?.country || ""} className={inputCls} placeholder="Togo" />
                    </div>
                    <div>
                      <label className={labelCls}>Téléphone</label>
                      <input type="tel" name="address_phone" defaultValue={user.address?.phone || ""} className={inputCls} placeholder="+228 70 12 34 56" />
                    </div>
                  </div>
                </div>

                {/* Mensurations */}
                {user.measurements && Object.keys(user.measurements).length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <button type="button" onClick={() => setShowMeasures(!showMeasures)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#8B5E3C]/10 flex items-center justify-center">
                          <Ruler className="w-4 h-4 text-[#8B5E3C]" />
                        </div>
                        <p className="text-sm font-bold text-[#1A1A1A]">Mensurations <span className="text-xs font-normal text-[#6B6B6B]">(cm)</span></p>
                      </div>
                      {showMeasures ? <ChevronUp className="w-4 h-4 text-[#6B6B6B]" /> : <ChevronDown className="w-4 h-4 text-[#6B6B6B]" />}
                    </button>

                    {showMeasures && (
                      <div className="px-5 pb-5 border-t border-gray-100">
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                          {Object.entries(user.measurements).map(([key, value]) => {
                            if (key === "other_measurements") return null;
                            const label = measurementLabels[key] || key.replace(/_/g, " ");
                            return (
                              <div key={key}>
                                <label className={labelCls}>{label}</label>
                                <div className="relative">
                                  <input type="number" name={key} defaultValue={String(value || "")} step="0.1"
                                    className={`${inputCls} pr-8`} placeholder="0" />
                                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">cm</span>
                                </div>
                              </div>
                            );
                          })}
                          <div className="col-span-3 sm:col-span-4">
                            <label className={labelCls}>Autres mesures</label>
                            <textarea name="other_measurements" defaultValue={user.measurements.other_measurements || ""}
                              rows={2} className={`${inputCls} resize-none`} placeholder="Précisions supplémentaires..." />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Form>
        )}
      </div>
    </ClientLayout>
  );
}

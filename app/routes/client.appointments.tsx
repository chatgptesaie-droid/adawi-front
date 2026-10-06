import type { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigation } from "@remix-run/react";
import ClientLayout from "~/components/client/ClientLayout";
import { getUserProfile, requireUser, API_BASE } from "~/utils/auth.server";
import { readToken } from "~/utils/session.server";
import { useEffect, useState } from "react";
import {
  Calendar, Clock, User, MapPin, FileText, AlertCircle,
  CheckCircle, Plus, ChevronRight, Info
} from "lucide-react";

export const meta: MetaFunction = () => [
  { title: "Créer un rendez-vous - Adawi" },
  { name: "description", content: "Page pour créer un nouveau rendez-vous" },
];

type LoaderData = {
  user: { id: string; name: string; email: string } | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUserProfile(request);
  if (!user) return redirect("/login?redirectTo=/appointments");
  return json<LoaderData>({ user: { id: user.id || "", name: user.full_name || "", email: user.email || "" } });
};

type ActionData = {
  formError?: string;
  fieldErrors?: {
    service_type?: string; title?: string; description?: string;
    appointment_date?: string; duration_minutes?: string;
    client_name?: string; client_email?: string; client_phone?: string;
    location?: string; client_notes?: string;
  };
  fields?: {
    service_type: string; title: string; description: string;
    appointment_date: string; duration_minutes: string; client_name: string;
    client_email: string; client_phone: string; location: string; client_notes: string;
  };
  success?: boolean;
  successMessage?: string;
};

function validateRequired(field: string, fieldName: string) {
  if (!field || field.trim() === "") return `${fieldName} est requis`;
}
function validateEmail(email: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email invalide";
}
function validateDateTime(dateTimeString: string) {
  if (!dateTimeString?.trim()) return "Date du rendez-vous est requise";
  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) return "Date du rendez-vous invalide";
  if (date < new Date()) return "La date ne peut pas être dans le passé";
}
function validateDurationMinutes(duration: string) {
  if (!duration?.trim()) return "Durée est requise";
  const n = Number(duration);
  if (isNaN(n) || n <= 0) return "Durée invalide";
  if (n > 480) return "Durée maximale de 8 heures";
}
function formatDateForAPI(dateTimeString: string): string {
  return new Date(dateTimeString).toISOString();
}

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  const form = await request.formData();

  const service_type = form.get("service_type")?.toString() || "";
  const title = form.get("title")?.toString() || "";
  const description = form.get("description")?.toString() || "";
  const appointment_date = form.get("appointment_date")?.toString() || "";
  const duration_minutes = form.get("duration_minutes")?.toString() || "";
  const client_name = form.get("client_name")?.toString() || "";
  const client_email = form.get("client_email")?.toString() || "";
  const client_phone = form.get("client_phone")?.toString() || "";
  const location = form.get("location")?.toString() || "";
  const client_notes = form.get("client_notes")?.toString() || "";

  const fields = { service_type, title, description, appointment_date, duration_minutes, client_name, client_email, client_phone, location, client_notes };

  const fieldErrors: ActionData["fieldErrors"] = {
    service_type: validateRequired(service_type, "Type de service"),
    title: validateRequired(title, "Titre"),
    description: validateRequired(description, "Description"),
    appointment_date: validateDateTime(appointment_date),
    duration_minutes: validateDurationMinutes(duration_minutes),
    client_name: validateRequired(client_name, "Nom du client"),
    client_email: validateRequired(client_email, "Email du client") || validateEmail(client_email),
  };
  Object.keys(fieldErrors).forEach(k => { if (!fieldErrors[k as keyof typeof fieldErrors]) delete fieldErrors[k as keyof typeof fieldErrors]; });

  if (Object.keys(fieldErrors).length > 0) return json<ActionData>({ fieldErrors, fields }, { status: 422 });

  const token = await readToken(request);
  const payload = {
    user_id: user.id, service_type, title, description,
    appointment_date: formatDateForAPI(appointment_date),
    duration_minutes: Number(duration_minutes),
    client_name, client_email,
    client_phone: client_phone || null,
    location: location || null,
    client_notes: client_notes || null,
  };

  try {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      if (res.status === 422) {
        try { const ed = JSON.parse(errorText); return json<ActionData>({ formError: "Erreur de validation", fieldErrors: ed.fieldErrors || {}, fields }, { status: 422 }); }
        catch { return json<ActionData>({ formError: `Erreur: ${errorText}`, fields }, { status: 422 }); }
      }
      if (res.status === 401) return json<ActionData>({ formError: "Session expirée.", fields }, { status: 401 });
      return json<ActionData>({ formError: `Erreur (${res.status}): ${errorText}`, fields }, { status: res.status });
    }

    return json<ActionData>({ success: true, successMessage: "Rendez-vous créé avec succès !" });
  } catch (error) {
    return json<ActionData>({ formError: `Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`, fields }, { status: 500 });
  }
};

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[#FAFAF8] text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 transition";
const labelCls = "block text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide mb-1.5";

export default function Appointments() {
  const { user } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [showSuccess, setShowSuccess] = useState(false);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (actionData?.success) {
      setShowSuccess(true);
      setFormKey(p => p + 1);
      const t = setTimeout(() => setShowSuccess(false), 10000);
      return () => clearTimeout(t);
    }
  }, [actionData?.success]);

  const serviceTypes = [
    { value: "prise_de_mesure", label: "Prise de mesure" },
    { value: "consultation", label: "Consultation" },
    { value: "suivi", label: "Suivi" },
    { value: "urgence", label: "Urgence" },
    { value: "preventif", label: "Préventif" },
    { value: "autre", label: "Autre" },
  ];

  return (
    <ClientLayout userName={user?.name}>
      <div className="min-h-screen bg-[#FAFAF8] space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#8B5E3C]/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[#8B5E3C]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#1A1A1A] uppercase tracking-wide">Créer un rendez-vous</h1>
            <p className="text-xs text-[#6B6B6B]">Planifiez votre prochain rendez-vous</p>
          </div>
        </div>

        {/* Success banner */}
        {showSuccess && actionData?.success && (
          <div className="flex gap-3 items-start bg-[#6B8F71]/10 border border-[#6B8F71]/20 rounded-2xl px-4 py-4">
            <CheckCircle className="w-5 h-5 text-[#6B8F71] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-[#6B8F71]">Rendez-vous créé avec succès</p>
              <p className="text-xs text-[#6B8F71] mt-0.5">{actionData.successMessage}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={() => { window.location.href = "/client/list"; }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6B8F71] text-white text-xs font-bold rounded-xl hover:bg-[#5a7a60] transition"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  Voir mes rendez-vous
                </button>
                <button
                  onClick={() => { setShowSuccess(false); setFormKey(p => p + 1); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#6B8F71]/30 text-[#6B8F71] text-xs font-bold rounded-xl hover:bg-[#6B8F71]/5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Créer un autre
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-4">
            <Form method="post" key={formKey} className="space-y-4">

              {/* Section: Rendez-vous */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-[#8B5E3C]/10 flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5 text-[#8B5E3C]" />
                  </div>
                  <h2 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide">Détails du rendez-vous</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="service_type" className={labelCls}>Type de service</label>
                    <select id="service_type" name="service_type" defaultValue={actionData?.fields?.service_type || ""} required className={inputCls}>
                      <option value="">Sélectionnez un type de service</option>
                      {serviceTypes.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    {actionData?.fieldErrors?.service_type && <p className="text-xs text-[#C0392B] mt-1">{actionData.fieldErrors.service_type}</p>}
                  </div>

                  <div>
                    <label htmlFor="title" className={labelCls}>Titre</label>
                    <input type="text" id="title" name="title" defaultValue={actionData?.fields?.title || ""} required maxLength={100} placeholder="Ex: Prise de mesure costume" className={inputCls} />
                    {actionData?.fieldErrors?.title && <p className="text-xs text-[#C0392B] mt-1">{actionData.fieldErrors.title}</p>}
                  </div>

                  <div>
                    <label htmlFor="description" className={labelCls}>Description</label>
                    <textarea id="description" name="description" rows={3} defaultValue={actionData?.fields?.description || ""} required maxLength={500} placeholder="Décrivez le motif du rendez-vous..." className={inputCls} />
                    {actionData?.fieldErrors?.description && <p className="text-xs text-[#C0392B] mt-1">{actionData.fieldErrors.description}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="appointment_date" className={labelCls}>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Date et heure</span>
                      </label>
                      <input type="datetime-local" id="appointment_date" name="appointment_date" min={new Date().toISOString().slice(0, 16)} defaultValue={actionData?.fields?.appointment_date || ""} required className={inputCls} />
                      {actionData?.fieldErrors?.appointment_date && <p className="text-xs text-[#C0392B] mt-1">{actionData.fieldErrors.appointment_date}</p>}
                    </div>
                    <div>
                      <label htmlFor="duration_minutes" className={labelCls}>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Durée</span>
                      </label>
                      <select id="duration_minutes" name="duration_minutes" defaultValue={actionData?.fields?.duration_minutes || "60"} required className={inputCls}>
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">1 heure</option>
                        <option value="90">1h30</option>
                        <option value="120">2 heures</option>
                        <option value="180">3 heures</option>
                      </select>
                      {actionData?.fieldErrors?.duration_minutes && <p className="text-xs text-[#C0392B] mt-1">{actionData.fieldErrors.duration_minutes}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="location" className={labelCls}>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />Lieu</span>
                    </label>
                    <select id="location" name="location" defaultValue={actionData?.fields?.location || ""} className={inputCls}>
                      <option value="">Sélectionnez un lieu</option>
                      <option value="Boutique">Boutique</option>
                      <option value="Domicile">Domicile</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section: Client info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-[#8B5E3C]/10 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-[#8B5E3C]" />
                  </div>
                  <h2 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide">Informations client</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="client_name" className={labelCls}>Nom complet</label>
                      <input type="text" id="client_name" name="client_name" defaultValue={user?.name || actionData?.fields?.client_name || ""} required maxLength={100} className={inputCls} />
                      {actionData?.fieldErrors?.client_name && <p className="text-xs text-[#C0392B] mt-1">{actionData.fieldErrors.client_name}</p>}
                    </div>
                    <div>
                      <label htmlFor="client_email" className={labelCls}>Email</label>
                      <input type="email" id="client_email" name="client_email" defaultValue={user?.email || actionData?.fields?.client_email || ""} required className={inputCls} />
                      {actionData?.fieldErrors?.client_email && <p className="text-xs text-[#C0392B] mt-1">{actionData.fieldErrors.client_email}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="client_phone" className={labelCls}>Téléphone</label>
                    <input type="tel" id="client_phone" name="client_phone" defaultValue={actionData?.fields?.client_phone || ""} placeholder="+228 XX XX XX XX" className={inputCls} />
                  </div>

                  <div>
                    <label htmlFor="client_notes" className={labelCls}>Notes supplémentaires</label>
                    <textarea id="client_notes" name="client_notes" rows={3} defaultValue={actionData?.fields?.client_notes || ""} maxLength={1000} placeholder="Instructions spéciales, préférences..." className={inputCls} />
                    <p className="text-xs text-[#6B6B6B] mt-1">Maximum 1000 caractères</p>
                  </div>
                </div>
              </div>

              {/* Form error */}
              {actionData?.formError && (
                <div className="flex gap-3 items-start bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm">
                  <AlertCircle className="w-4 h-4 text-[#C0392B] mt-0.5 flex-shrink-0" />
                  <p className="text-[#C0392B]">{actionData.formError}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button type="submit" disabled={isSubmitting} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white bg-[#8B5E3C] rounded-xl hover:bg-[#5C3D1E] transition disabled:opacity-50">
                  {isSubmitting ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Création...</>
                  ) : (
                    <><Plus className="w-4 h-4" />Créer le rendez-vous</>
                  )}
                </button>
                <button type="button" onClick={() => window.history.back()} disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-[#6B6B6B] bg-[#F5F5F0] rounded-xl hover:bg-gray-100 transition disabled:opacity-50">
                  Annuler
                </button>
              </div>
            </Form>
          </div>

          {/* Right: Info sidebar */}
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-[#8B5E3C]/10 flex items-center justify-center">
                  <Info className="w-3.5 h-3.5 text-[#8B5E3C]" />
                </div>
                <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide">À savoir</h3>
              </div>
              <ul className="space-y-2.5">
                {[
                  "Votre rendez-vous sera confirmé par email.",
                  "Vous pouvez annuler jusqu'à 24h avant.",
                  "Présentez-vous 5 min avant l'heure.",
                  "En cas d'empêchement, contactez-nous.",
                ].map(info => (
                  <li key={info} className="flex items-start gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-[#8B5E3C] mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-[#6B6B6B]">{info}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Horaires */}
            <div className="bg-[#8B5E3C]/5 rounded-2xl border border-[#8B5E3C]/10 p-5">
              <p className="text-xs font-bold text-[#8B5E3C] uppercase tracking-wide mb-3">Horaires d'ouverture</p>
              <div className="space-y-1.5">
                {[
                  { day: "Lun — Ven", hours: "09h00 — 18h00" },
                  { day: "Samedi", hours: "09h00 — 14h00" },
                  { day: "Dimanche", hours: "Fermé" },
                ].map(({ day, hours }) => (
                  <div key={day} className="flex justify-between">
                    <span className="text-xs text-[#6B6B6B]">{day}</span>
                    <span className="text-xs font-semibold text-[#1A1A1A]">{hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide mb-2">Besoin d'aide ?</p>
              <p className="text-xs text-[#6B6B6B] mb-3">Notre équipe répond à toutes vos questions.</p>
              <a href="/client/tickets" className="flex items-center gap-1 text-xs font-semibold text-[#8B5E3C] hover:text-[#5C3D1E] transition">
                Créer un ticket <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}

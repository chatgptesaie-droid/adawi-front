import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link, useFetcher, useActionData } from "@remix-run/react";
import { requireUser, API_BASE } from "~/utils/auth.server";
import { readToken } from "~/utils/session.server";
import ClientLayout from "~/components/client/ClientLayout";
import { useState } from "react";
import {
  Calendar, Clock, MapPin, Tag, X, CheckCircle,
  AlertCircle, Plus, FileText
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Appointment = {
  _id: string;
  user_id: string;
  vendor_id: string;
  service_type: string;
  title: string;
  description: string;
  appointment_date: string;
  duration_minutes: number;
  status: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  location: string;
  client_notes: string;
  vendor_notes: string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  reminder_sent: boolean;
  reminder_sent_at: string;
  status_history: any[];
};

type LoaderData = {
  appointments: Appointment[];
  user: { id: string; name: string; email: string } | null;
};

type ActionData = {
  success?: boolean;
  error?: string;
  message?: string;
};

// ─── Loader ───────────────────────────────────────────────────────────────────
export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);
  if (!user) return redirect("/login");

  const url = new URL(request.url);
  const queryParams = new URLSearchParams();
  ["status", "start_date", "end_date"].forEach(k => {
    const v = url.searchParams.get(k);
    if (v) queryParams.append(k, v);
  });
  queryParams.append("limit", url.searchParams.get("limit") || "50");
  queryParams.append("skip", url.searchParams.get("skip") || "0");

  const token = await readToken(request);
  const res = await fetch(`${API_BASE}/appointments?${queryParams}`, {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });

  if (!res.ok) throw new Response("Failed to load appointments", { status: res.status });

  return json<LoaderData>({
    appointments: await res.json(),
    user: { id: user.id || "", name: user.full_name || "", email: user.email || "" },
  });
};

// ─── Action ───────────────────────────────────────────────────────────────────
export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  if (!user) return redirect("/login");

  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const token = await readToken(request);

  if (intent === "cancelAppointment") {
    const appointmentId = formData.get("appointmentId") as string;
    const cancelReason = formData.get("cancelReason") as string;

    try {
      const url = new URL(`${API_BASE}/appointments/${appointmentId}/cancel`);
      if (cancelReason) url.searchParams.append("cancel_reason", cancelReason);

      const response = await fetch(url.toString(), {
        method: "PUT",
        headers: { Authorization: token ? `Bearer ${token}` : "", "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return json<ActionData>({ error: errorData.detail || `Erreur ${response.status}` }, { status: response.status });
      }

      const responseData = await response.json().catch(() => ({}));
      return json<ActionData>({ success: true, message: responseData.message || "Rendez-vous annulé avec succès" });
    } catch {
      return json<ActionData>({ error: "Erreur de connexion. Veuillez réessayer." }, { status: 500 });
    }
  }

  return json<ActionData>({ error: "Action non reconnue" }, { status: 400 });
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function statusConfig(status: string) {
  switch (status) {
    case "confirmé":  return { cls: "bg-[#6B8F71]/15 text-[#6B8F71]",  dot: "bg-[#6B8F71]" };
    case "en cours":  return { cls: "bg-[#C9A96E]/15 text-[#8B5E3C]",  dot: "bg-[#C9A96E]" };
    case "terminé":   return { cls: "bg-blue-100 text-blue-700",         dot: "bg-blue-400" };
    case "annulé":    return { cls: "bg-[#C0392B]/10 text-[#C0392B]",   dot: "bg-[#C0392B]" };
    default:          return { cls: "bg-gray-100 text-gray-600",          dot: "bg-gray-400" };
  }
}

function formatFull(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
function formatShort(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ClientAppointmentsList() {
  const { appointments, user } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const fetcher = useFetcher<ActionData>();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const handleCancelClick = (appt: Appointment) => {
    setSelectedAppt(appt);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleCancelSubmit = () => {
    if (!selectedAppt) return;
    const fd = new FormData();
    fd.append("intent", "cancelAppointment");
    fd.append("appointmentId", selectedAppt._id);
    fd.append("cancelReason", cancelReason);
    fetcher.submit(fd, { method: "post" });
    setShowCancelModal(false);
    setSelectedAppt(null);
    setCancelReason("");
  };

  const successMsg = actionData?.message || fetcher.data?.message;
  const errorMsg   = actionData?.error   || fetcher.data?.error;

  const stats = {
    total:     appointments.length,
    confirme:  appointments.filter(a => a.status === "confirmé").length,
    enCours:   appointments.filter(a => a.status === "en cours").length,
    termine:   appointments.filter(a => a.status === "terminé").length,
  };

  return (
    <ClientLayout userName={user?.name}>
      <div className="space-y-5">

        {/* ── Alerts ── */}
        {successMsg && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 rounded-2xl px-4 py-3 text-sm">
            <CheckCircle className="w-4 h-4 shrink-0 text-[#6B8F71]" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 rounded-2xl px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#C0392B]" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest text-[#C9A96E] uppercase mb-1">Espace client</p>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Mes Rendez-vous</h1>
          </div>
          <Link
            to="/client/appointments"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B5E3C] text-white text-sm font-semibold hover:bg-[#5C3D1E] transition shadow-lg shadow-[#8B5E3C]/20"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau rendez-vous</span>
            <span className="sm:hidden">Nouveau</span>
          </Link>
        </div>

        {/* ── Stats ── */}
        {appointments.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total",     value: stats.total,    color: "text-[#8B5E3C]",  bg: "bg-[#8B5E3C]/10"  },
              { label: "Confirmés", value: stats.confirme, color: "text-[#6B8F71]",  bg: "bg-[#6B8F71]/10"  },
              { label: "En cours",  value: stats.enCours,  color: "text-[#C9A96E]",  bg: "bg-[#C9A96E]/15"  },
              { label: "Terminés",  value: stats.termine,  color: "text-blue-600",    bg: "bg-blue-50"        },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className={`w-8 h-8 ${s.bg} rounded-xl flex items-center justify-center mb-2`}>
                  <Calendar className={`w-4 h-4 ${s.color}`} />
                </div>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-[#6B6B6B] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {appointments.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-14 h-14 bg-[#8B5E3C]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-7 h-7 text-[#8B5E3C]" />
            </div>
            <h3 className="text-base font-bold text-[#1A1A1A] mb-2">Aucun rendez-vous</h3>
            <p className="text-sm text-[#6B6B6B] mb-6 max-w-xs mx-auto">
              Vous n'avez pas encore de rendez-vous programmés.
            </p>
            <Link
              to="/client/appointments"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#8B5E3C] text-white text-sm font-semibold hover:bg-[#5C3D1E] transition"
            >
              <Plus className="w-4 h-4" />
              Créer un rendez-vous
            </Link>
          </div>
        )}

        {/* ── Grid ── */}
        {appointments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {appointments.map((appt) => {
              const sc = statusConfig(appt.status);
              const isSubmittingThis = fetcher.state === "submitting" &&
                fetcher.formData?.get("appointmentId") === appt._id;
              const canCancel = appt.status === "confirmé" || appt.status === "en cours";

              return (
                <div key={appt._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">

                  {/* Card header */}
                  <div className="px-5 pt-5 pb-4 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-bold text-[#1A1A1A] line-clamp-2 flex-1">{appt.title}</h3>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 ${sc.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {appt.status}
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="px-5 py-4 space-y-2.5 flex-1">
                    {/* Date */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-[#8B5E3C]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Calendar className="w-3 h-3 text-[#8B5E3C]" />
                      </div>
                      <span className="text-xs text-[#1A1A1A] leading-relaxed">{formatShort(appt.appointment_date)}</span>
                    </div>

                    {/* Durée */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-[#8B5E3C]/10 flex items-center justify-center shrink-0">
                        <Clock className="w-3 h-3 text-[#8B5E3C]" />
                      </div>
                      <span className="text-xs text-[#6B6B6B]">{appt.duration_minutes} minutes</span>
                    </div>

                    {/* Service */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-[#8B5E3C]/10 flex items-center justify-center shrink-0">
                        <Tag className="w-3 h-3 text-[#8B5E3C]" />
                      </div>
                      <span className="text-xs text-[#6B6B6B] capitalize">{appt.service_type.replace(/_/g, " ")}</span>
                    </div>

                    {/* Lieu */}
                    {appt.location && (
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-[#8B5E3C]/10 flex items-center justify-center shrink-0">
                          <MapPin className="w-3 h-3 text-[#8B5E3C]" />
                        </div>
                        <span className="text-xs text-[#6B6B6B]">{appt.location}</span>
                      </div>
                    )}

                    {/* Description */}
                    {appt.description && (
                      <p className="text-xs text-[#6B6B6B] line-clamp-2 pt-1 border-t border-gray-100 mt-1">
                        {appt.description}
                      </p>
                    )}

                    {/* Notes */}
                    {appt.client_notes && (
                      <div className="bg-[#FAFAF8] rounded-xl p-3 border border-gray-100">
                        <p className="text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wide mb-1">Vos notes</p>
                        <p className="text-xs text-[#1A1A1A] line-clamp-2">{appt.client_notes}</p>
                      </div>
                    )}

                    {appt.vendor_notes && (
                      <div className="bg-[#C9A96E]/10 rounded-xl p-3 border border-[#C9A96E]/20">
                        <p className="text-[10px] font-semibold text-[#8B5E3C] uppercase tracking-wide mb-1">Notes du prestataire</p>
                        <p className="text-xs text-[#1A1A1A] line-clamp-2">{appt.vendor_notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Card footer */}
                  {canCancel && (
                    <div className="px-5 pb-5 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleCancelClick(appt)}
                        disabled={isSubmittingThis}
                        className="w-full py-2 rounded-xl border border-[#C0392B] text-[#C0392B] text-xs font-semibold hover:bg-[#C0392B] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmittingThis ? "Annulation..." : "Annuler ce rendez-vous"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modal annulation ── */}
      {showCancelModal && selectedAppt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#1A1A1A]">Annuler le rendez-vous</h3>
              <button onClick={() => setShowCancelModal(false)}
                className="w-8 h-8 rounded-xl bg-[#F5F5F0] flex items-center justify-center hover:bg-gray-200 transition">
                <X className="w-4 h-4 text-[#6B6B6B]" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Warning */}
              <div className="flex gap-3 items-start bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-800">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C0392B]" />
                <span>Cette action annulera définitivement votre rendez-vous.</span>
              </div>

              {/* Détails */}
              <div className="bg-[#FAFAF8] rounded-2xl border border-gray-100 p-4 space-y-2">
                <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide mb-2">Détails</p>
                <p className="text-sm font-semibold text-[#1A1A1A]">{selectedAppt.title}</p>
                <p className="text-xs text-[#6B6B6B]">{formatFull(selectedAppt.appointment_date)}</p>
                <p className="text-xs text-[#6B6B6B] capitalize">{selectedAppt.service_type.replace(/_/g, " ")}</p>
              </div>

              {/* Raison */}
              <div>
                <label className="block text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide mb-1.5">
                  Raison (optionnel)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Pourquoi annulez-vous ce rendez-vous ?"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[#FAFAF8] text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 transition resize-none"
                />
                <p className="text-[11px] text-[#6B6B6B] text-right mt-1">{cancelReason.length}/500</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#F5F5F0] text-[#6B6B6B] text-sm font-semibold hover:bg-gray-200 transition"
                >
                  Garder
                </button>
                <button
                  onClick={handleCancelSubmit}
                  disabled={fetcher.state === "submitting"}
                  className="flex-1 py-2.5 rounded-xl bg-[#C0392B] text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {fetcher.state === "submitting" ? "Annulation..." : "Confirmer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ClientLayout>
  );
}

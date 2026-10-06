import { useState, useMemo } from "react";
import type { MetaFunction, LoaderFunction, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import {
  Calendar, Clock, User, CheckCircle, XCircle, Search,
  ChevronLeft, ChevronRight, AlertCircle, X
} from "lucide-react";
import { readToken } from "~/utils/session.server";
import { useBooking } from "~/hooks/useBooking";
import ClientLayout from "~/components/client/ClientLayout";

export const meta: MetaFunction = () => [
  { title: "Réserver un créneau - Adawi" },
  { name: "description", content: "Réservez votre créneau de rendez-vous" },
];

interface TimeSlot {
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  is_available: boolean;
  vendor_id: string;
  vendor_name: string;
}
interface LoaderData {
  slots: TimeSlot[];
  token: string;
  error?: string;
  user?: any;
}

function formatDisplayDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
}
function formatDisplayTime(timeStr: string): string {
  return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const tokenData = await readToken(request);
    if (!tokenData) return redirect("/login");

    let token = "";
    if (typeof tokenData === "string") {
      try { const p = JSON.parse(tokenData); token = p?.access_token || tokenData; }
      catch { token = tokenData; }
    } else { token = tokenData as string; }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30);

    const url = new URL(request.url);
    const startParam = url.searchParams.get("start_date") || startDate.toISOString();
    const endParam = url.searchParams.get("end_date") || endDate.toISOString();
    const slotsUrl = `http://localhost:8000/availability/slots?start_date=${encodeURIComponent(startParam)}&end_date=${encodeURIComponent(endParam)}`;

    const res = await fetch(slotsUrl, { headers: { Authorization: `Bearer ${token}` } });
    const slots: TimeSlot[] = res.ok ? await res.json() : [];

    return json<LoaderData>({ slots, token });
  } catch (err: any) {
    return json<LoaderData>({ slots: [], token: "", error: err.message || "Erreur serveur" });
  }
};

export const action: ActionFunction = async ({ request }) => {
  try {
    const tokenData = await readToken(request);
    if (!tokenData) return json({ error: "Non authentifié", success: false }, { status: 401 });

    let token = "";
    if (typeof tokenData === "string") {
      try { const p = JSON.parse(tokenData); token = p?.access_token || tokenData; }
      catch { token = tokenData; }
    } else { token = tokenData as string; }

    const formData = await request.formData();
    const action = formData.get("_action");

    if (action === "check_availability") {
      const date = formData.get("date") as string;
      const duration = parseInt(formData.get("duration_minutes") as string || "60");
      const res = await fetch(`http://localhost:8000/availability/check?date=${encodeURIComponent(date)}&duration_minutes=${duration}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const e = await res.json(); throw new Error(`Erreur: ${JSON.stringify(e)}`); }
      const result = await res.json();
      return json({ success: true, available: result, message: "Vérification effectuée" });
    }

    if (action === "book_slot") {
      const date = formData.get("date") as string;
      const startTime = formData.get("start_time") as string;
      const endTime = formData.get("end_time") as string;
      const vendorId = formData.get("vendor_id") as string;
      const notes = formData.get("notes") as string;

      const res = await fetch("http://localhost:8000/appointments/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          appointment_date: `${date}T${startTime}:00`,
          end_time: `${date}T${endTime}:00`,
          vendor_id: vendorId, notes: notes || "", status: "pending",
        }),
      });

      if (!res.ok) { const e = await res.json(); throw new Error(`Erreur: ${JSON.stringify(e)}`); }
      const appointment = await res.json();
      return json({ success: true, appointment, message: "Rendez-vous réservé avec succès!" });
    }

    return json({ error: "Action non reconnue", success: false }, { status: 400 });
  } catch (err: any) {
    return json({ error: err.message || "Erreur serveur", success: false }, { status: 500 });
  }
};

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[#FAFAF8] text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 transition";
const labelCls = "block text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide mb-1.5";

export default function ClientBooking() {
  const { slots: initialSlots, error } = useLoaderData<LoaderData>();

  const {
    selectedSlot, isBookingModalOpen, searchTerm, vendorFilter,
    checkingSlot, slotsByDate, vendors, filteredSlots, weekDates,
    handleSlotClick, handleCheckAvailability, handleBookSlot, closeBookingModal,
    goToPreviousWeek, goToNextWeek, setSearchTerm, setVendorFilter, isLoading,
  } = useBooking(initialSlots);

  const [isMobileCalendarView, setIsMobileCalendarView] = useState(false);

  return (
    <ClientLayout>
      <div className="min-h-screen bg-[#FAFAF8] space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#8B5E3C]/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[#8B5E3C]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#1A1A1A] uppercase tracking-wide">Réserver un créneau</h1>
            <p className="text-xs text-[#6B6B6B]">Choisissez le créneau qui vous convient</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex gap-3 items-start bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4 text-[#C0392B] mt-0.5 flex-shrink-0" />
            <p className="text-[#C0392B]">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par vendeur..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-[#FAFAF8] text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 transition"
              />
            </div>
            <select
              value={vendorFilter}
              onChange={e => setVendorFilter(e.target.value)}
              className="sm:w-48 px-3 py-2.5 rounded-xl border border-gray-200 bg-[#FAFAF8] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 transition"
            >
              <option value="all">Tous les vendeurs</option>
              {vendors.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>

        {/* Mobile view toggle */}
        <div className="block sm:hidden">
          <div className="bg-white rounded-2xl border border-gray-100 p-1.5 flex gap-1">
            <button
              onClick={() => setIsMobileCalendarView(false)}
              className={`flex-1 py-2 px-4 rounded-xl text-xs font-semibold transition ${!isMobileCalendarView ? "bg-[#8B5E3C] text-white" : "text-[#6B6B6B] hover:bg-[#FAFAF8]"}`}
            >
              Liste
            </button>
            <button
              onClick={() => setIsMobileCalendarView(true)}
              className={`flex-1 py-2 px-4 rounded-xl text-xs font-semibold transition ${isMobileCalendarView ? "bg-[#8B5E3C] text-white" : "text-[#6B6B6B] hover:bg-[#FAFAF8]"}`}
            >
              Calendrier
            </button>
          </div>
        </div>

        {/* Week calendar */}
        <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${!isMobileCalendarView ? "hidden sm:block" : ""}`}>
          {/* Navigation */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={goToPreviousWeek}
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-[#8B5E3C] rounded-xl hover:bg-[#8B5E3C]/5 border border-[#8B5E3C]/20 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Précédente</span>
            </button>

            <div className="text-center">
              <p className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide">
                <span className="hidden sm:inline">Semaine du {weekDates[0] ? formatDisplayDate(weekDates[0]) : "—"}</span>
                <span className="sm:hidden">{weekDates[0] ? formatShortDate(weekDates[0]) : "—"}</span>
              </p>
            </div>

            <button
              onClick={goToNextWeek}
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-[#8B5E3C] rounded-xl hover:bg-[#8B5E3C]/5 border border-[#8B5E3C]/20 transition"
            >
              <span className="hidden sm:inline">Suivante</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 7-col grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2">
            {weekDates.map(date => {
              const daySlots = slotsByDate[date] || [];
              const availableSlots = daySlots.filter(s =>
                s.is_available &&
                (vendorFilter === "all" || s.vendor_name === vendorFilter) &&
                s.vendor_name.toLowerCase().includes(searchTerm.toLowerCase())
              );
              return (
                <div key={date} className="rounded-xl border border-gray-100 bg-[#FAFAF8] p-2 min-h-[130px]">
                  <div className="text-center mb-2">
                    <p className="text-xs font-bold text-[#1A1A1A]">
                      <span className="sm:hidden">{formatShortDate(date)}</span>
                      <span className="hidden sm:block text-[10px]">{new Date(date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}</span>
                    </p>
                    <p className="text-[10px] text-[#6B6B6B]">{availableSlots.length} créneaux</p>
                  </div>
                  <div className="space-y-1">
                    {availableSlots.slice(0, 3).map((slot, i) => (
                      <button
                        key={i}
                        onClick={() => handleSlotClick(slot)}
                        className="w-full bg-[#8B5E3C]/8 hover:bg-[#8B5E3C]/15 border border-[#8B5E3C]/10 rounded-lg p-1.5 text-center transition"
                      >
                        <p className="text-[10px] font-bold text-[#8B5E3C]">{formatDisplayTime(slot.start_time)}</p>
                        <p className="text-[9px] text-[#6B6B6B] truncate">{slot.vendor_name}</p>
                      </button>
                    ))}
                    {availableSlots.length > 3 && (
                      <p className="text-[10px] text-center text-[#6B6B6B] pt-0.5">+{availableSlots.length - 3} autres</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Slots list */}
        <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${isMobileCalendarView ? "hidden sm:block" : ""}`}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-[#8B5E3C]/10 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-[#8B5E3C]" />
            </div>
            <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide">
              Créneaux disponibles ({filteredSlots.length})
            </h3>
          </div>

          {filteredSlots.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-[#1A1A1A] mb-1">Aucun créneau disponible</p>
              <p className="text-xs text-[#6B6B6B]">Aucun créneau ne correspond aux critères sélectionnés.</p>
              {initialSlots.length > 0 && (
                <p className="text-xs text-[#6B6B6B] mt-1">({initialSlots.length} créneaux au total)</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredSlots.map((slot, index) => (
                <div key={index} className="rounded-xl border border-gray-100 bg-[#FAFAF8] p-3 hover:border-[#8B5E3C]/30 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#1A1A1A]">
                        <span className="hidden sm:block">{formatDisplayDate(slot.date)}</span>
                        <span className="sm:hidden">{formatShortDate(slot.date)}</span>
                      </p>
                      <p className="text-xs text-[#6B6B6B]">{formatDisplayTime(slot.start_time)} — {formatDisplayTime(slot.end_time)}</p>
                      <p className="text-[10px] text-[#6B6B6B]">{slot.duration_minutes} min</p>
                    </div>
                    {slot.is_available
                      ? <CheckCircle className="w-4 h-4 text-[#6B8F71] flex-shrink-0" />
                      : <XCircle className="w-4 h-4 text-[#C0392B] flex-shrink-0" />
                    }
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    <User className="w-3 h-3 text-[#6B6B6B] flex-shrink-0" />
                    <span className="text-xs text-[#6B6B6B] truncate">{slot.vendor_name}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleCheckAvailability(slot)}
                      disabled={checkingSlot === `${slot.date}-${slot.start_time}` || isLoading}
                      className="flex-1 py-1.5 text-xs font-semibold text-[#6B6B6B] bg-white border border-gray-200 rounded-xl hover:border-[#8B5E3C]/30 transition disabled:opacity-50"
                    >
                      {checkingSlot === `${slot.date}-${slot.start_time}` ? "..." : "Vérifier"}
                    </button>
                    <button
                      onClick={() => handleSlotClick(slot)}
                      className="flex-1 py-1.5 text-xs font-bold text-white bg-[#8B5E3C] rounded-xl hover:bg-[#5C3D1E] transition"
                    >
                      Réserver
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && selectedSlot && (
        <BookingModal
          slot={selectedSlot}
          isOpen={isBookingModalOpen}
          onClose={closeBookingModal}
          onSubmit={handleBookSlot}
          formatTime={formatDisplayTime}
          formatDate={formatDisplayDate}
        />
      )}
    </ClientLayout>
  );
}

function BookingModal({
  slot, isOpen, onClose, onSubmit, formatTime, formatDate,
}: {
  slot: TimeSlot; isOpen: boolean; onClose: () => void;
  onSubmit: (formData: FormData) => void;
  formatTime: (t: string) => string; formatDate: (d: string) => string;
}) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.append("date", slot.date);
    fd.append("start_time", slot.start_time);
    fd.append("end_time", slot.end_time);
    fd.append("vendor_id", slot.vendor_id);
    onSubmit(fd);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wide">Confirmer la réservation</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
            <X className="w-4 h-4 text-[#6B6B6B]" />
          </button>
        </div>

        <div className="p-5">
          {/* Slot details */}
          <div className="bg-[#F5F5F0] rounded-xl p-4 mb-5 space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#8B5E3C] flex-shrink-0" />
              <span className="text-sm font-semibold text-[#1A1A1A]">{formatDate(slot.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8B5E3C] flex-shrink-0" />
              <span className="text-sm text-[#1A1A1A]">{formatTime(slot.start_time)} — {formatTime(slot.end_time)}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#8B5E3C] flex-shrink-0" />
              <span className="text-sm text-[#1A1A1A]">{slot.vendor_name}</span>
            </div>
          </div>

          {/* Form */}
          <Form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide mb-1.5">
                Notes (optionnel)
              </label>
              <textarea
                name="notes"
                rows={3}
                placeholder="Informations utiles pour ce rendez-vous..."
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[#FAFAF8] text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10 transition resize-none"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-sm font-semibold text-[#6B6B6B] bg-[#F5F5F0] rounded-xl hover:bg-gray-100 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 text-sm font-bold text-white bg-[#8B5E3C] rounded-xl hover:bg-[#5C3D1E] transition"
              >
                Confirmer
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

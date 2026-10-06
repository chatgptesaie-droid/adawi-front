import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form, useNavigation } from "@remix-run/react";
import { requireAdmin, requireUser, API_BASE } from "~/utils/auth.server";
import { readToken } from "~/utils/session.server";
import { useState, useEffect } from "react";
import { useFetcher } from "@remix-run/react";

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

type StatsData = {
  total: number;
  by_status: {
    "en cours"?: number;
    "terminé"?: number;
    "confirmé"?: number;
    "annulé"?: number;
  };
  by_service_type: Record<string, number>;
  upcoming: number;
  today: number;
};

type LoaderData = {
  appointments: Appointment[];
  stats: StatsData;
};

export const loader: LoaderFunction = async ({ request }) => {
  // Require admin or user (since client also has access)
  const user = await requireUser(request);
  if (!user) {
    return redirect("/login");
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || "";
  const start_date = url.searchParams.get("start_date") || "";
  const end_date = url.searchParams.get("end_date") || "";
  const limit = url.searchParams.get("limit") || "50";
  const skip = url.searchParams.get("skip") || "0";

  const token = await readToken(request);

  const queryParams = new URLSearchParams();
  if (status) queryParams.append("status", status);
  if (start_date) queryParams.append("start_date", start_date);
  if (end_date) queryParams.append("end_date", end_date);
  queryParams.append("limit", limit);
  queryParams.append("skip", skip);

  const res = await fetch(`${API_BASE}/appointments?${queryParams.toString()}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (!res.ok) {
    throw new Response("Failed to load appointments", { status: res.status });
  }

  const appointments: Appointment[] = await res.json();

  // Fetch stats
  const statsRes = await fetch(`${API_BASE}/appointments/stats/overview`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  let stats: StatsData = {
    total: 0,
    by_status: {},
    by_service_type: {},
    upcoming: 0,
    today: 0,
  };

  if (statsRes.ok) {
    stats = await statsRes.json();
  }

  return json<LoaderData>({ appointments, stats });
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  if (!user) {
    return redirect("/login");
  }

  const form = await request.formData();
  const appointmentId = form.get("appointmentId")?.toString();
  const status = form.get("status")?.toString();
  const notes = form.get("notes")?.toString() || "";

  if (!appointmentId || !status) {
    return json({ formError: "Appointment ID and status are required" }, { status: 400 });
  }

  const token = await readToken(request);

  const res = await fetch(`${API_BASE}/appointments/${appointmentId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify({ status, notes }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    return json({ formError: `Failed to update status: ${errorText}` }, { status: res.status });
  }

  return redirect("/admin/appointments");
};

export default function AdminAppointments() {
  const { appointments, stats } = useLoaderData<LoaderData>();
  const navigation = useNavigation();
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const fetcher = useFetcher();

  const handleViewDetails = (appointmentId: string) => {
    fetcher.load(`/admin/appointments/details/${appointmentId}`);
  };

  // Handle fetcher response
  useEffect(() => {
    if (fetcher.data && fetcher.state === "idle") {
      setSelectedAppointment(fetcher.data as Appointment);
      setShowDetailsModal(true);
    }
  }, [fetcher.data, fetcher.state]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Rendez-vous</h1>
        <button
          onClick={() => setShowStats(!showStats)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {showStats ? "Masquer les statistiques" : "Voir les statistiques"}
        </button>
      </div>

      {showStats && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total des rendez-vous</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-500 text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Confirmés</p>
          <p className="text-2xl font-bold text-gray-900">{stats.by_status["confirmé"] ?? 0}</p>
                </div>
                <div className="p-3 rounded-full bg-green-500 text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En attente</p>
          <p className="text-2xl font-bold text-gray-900">{stats.by_status["en cours"] ?? 0}</p>
                </div>
                <div className="p-3 rounded-full bg-yellow-500 text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Annulés</p>
          <p className="text-2xl font-bold text-gray-900">{stats.by_status["annulé"] ?? 0}</p>
                </div>
                <div className="p-3 rounded-full bg-red-500 text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Terminés</p>
          <p className="text-2xl font-bold text-gray-900">{stats.by_status["terminé"] ?? 0}</p>
                </div>
                <div className="p-3 rounded-full bg-purple-500 text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aujourd'hui</p>
          <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
                </div>
                <div className="p-3 rounded-full bg-indigo-500 text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cette semaine</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
                </div>
                <div className="p-3 rounded-full bg-teal-500 text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ce mois</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
                </div>
                <div className="p-3 rounded-full bg-orange-500 text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Résumé</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {stats.total > 0 ? Math.round(((stats.by_status["confirmé"] ?? 0) / stats.total) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Taux de confirmation</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {stats.total > 0 ? Math.round(((stats.by_status["terminé"] ?? 0) / stats.total) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Taux de réalisation</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Date</th>
            <th className="border border-gray-300 p-2">Client</th>
            <th className="border border-gray-300 p-2">Titre</th>
            <th className="border border-gray-300 p-2">Type de service</th>
            <th className="border border-gray-300 p-2">Statut</th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center p-4">
                Aucun rendez-vous trouvé.
              </td>
            </tr>
          )}
          {appointments.map((appt) => (
            <tr key={appt._id} className="hover:bg-gray-100">
              <td className="border border-gray-300 p-2">{new Date(appt.appointment_date).toLocaleString()}</td>
              <td className="border border-gray-300 p-2">{appt.client_name}</td>
              <td className="border border-gray-300 p-2">{appt.title}</td>
              <td className="border border-gray-300 p-2">{appt.service_type}</td>
              <td className="border border-gray-300 p-2">{appt.status}</td>
              <td className="border border-gray-300 p-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(appt._id)}
                    className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 text-sm"
                  >
                    Voir les détails
                  </button>
                  <Form method="post" className="flex gap-2">
                    <input type="hidden" name="appointmentId" value={appt._id} />
                    <select
                      name="status"
                      defaultValue={appt.status}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="en cours">En cours</option>
                      <option value="confirmé">Confirmé</option>
                      <option value="annulé">Annulé</option>
                      <option value="terminé">Terminé</option>
                    </select>
                    <input
                      type="text"
                      name="notes"
                      placeholder="Notes admin"
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={navigation.state === "submitting"}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
                    >
                      {navigation.state === "submitting" ? "Mise à jour..." : "Mettre à jour"}
                    </button>
                  </Form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal pour les détails du rendez-vous */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Détails du rendez-vous</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Titre</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAppointment.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type de service</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAppointment.service_type}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date et heure</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedAppointment.appointment_date).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Durée</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAppointment.duration_minutes} minutes</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Statut</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAppointment.status}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lieu</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAppointment.location}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Informations client</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nom</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedAppointment.client_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedAppointment.client_email}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAppointment.client_phone}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Description et notes</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAppointment.description}</p>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Notes client</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAppointment.client_notes}</p>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Notes prestataire</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAppointment.vendor_notes}</p>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Notes admin</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAppointment.admin_notes}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Informations système</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Créé le</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedAppointment.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Modifié le</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedAppointment.updated_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Rappel envoyé</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedAppointment.reminder_sent ? "Oui" : "Non"}
                      {selectedAppointment.reminder_sent_at && (
                        <span className="ml-2">
                          ({new Date(selectedAppointment.reminder_sent_at).toLocaleString()})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
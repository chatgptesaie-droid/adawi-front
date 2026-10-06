import { useState, useMemo, useEffect } from "react";
import type { MetaFunction, LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit, useFetcher } from "@remix-run/react";
import {
  Search, Eye, Plus, Edit, Trash2, Clock, CheckCircle, XCircle, BarChart3
} from "lucide-react";
import { readToken } from "~/utils/session.server";
import SellerLayout from "~/components/seller/SellerLayout";

export const meta: MetaFunction = () => [
  { title: "Disponibilités - Adawi Admin" },
  { name: "description", content: "Gestion des disponibilités" },
];

export interface TimeSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
  max_appointments: number;
}

export interface DaySchedule {
  day_of_week: number;
  is_working_day: boolean;
  time_slots: TimeSlot[];
  break_start?: string;
  break_end?: string;
}

export interface Availability {
  _id: string;
  vendor_id: string;
  name: string;
  weekly_schedule: DaySchedule[];
  special_dates: { [date: string]: TimeSlot[] };
  blocked_dates: string[];
  default_duration: number;
  buffer_time: number;
  max_advance_booking_days: number;
  min_advance_booking_hours: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  is_active: boolean;
}

interface LoaderData {
  availabilities: Availability[];
  token: string;
  error?: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const tokenData = await readToken(request);
    if (!tokenData) throw new Response("Non autorisé", { status: 401 });

    // Correction du parsing du token
    let token = "";
    if (typeof tokenData === "string") {
      try {
        const parsed = JSON.parse(tokenData);
        token = parsed?.access_token || tokenData;
      } catch {
        token = tokenData;
      }
    } else {
      token = tokenData as string;
    }

    const res = await fetch("http://localhost:8000/availability/", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Erreur lors de la récupération des disponibilités");

    const availabilities: Availability[] = await res.json();
    return json<LoaderData>({ availabilities, token });
  } catch (err: any) {
    console.error("Erreur loader availabilities:", err);
    return json<LoaderData>({ availabilities: [], token: "", error: err.message || "Erreur serveur" });
  }
};

export const action: ActionFunction = async ({ request }) => {
  try {
    const tokenData = await readToken(request);
    if (!tokenData) {
      return json({ error: "Non authentifié", success: false }, { status: 401 });
    }

    // Correction du parsing du token (même correction que dans le loader)
    let token = "";
    if (typeof tokenData === "string") {
      try {
        const parsed = JSON.parse(tokenData);
        token = parsed?.access_token || tokenData;
      } catch {
        token = tokenData;
      }
    } else {
      token = tokenData as string;
    }

    const formData = await request.formData();
    const action = formData.get("_action");

    if (action === "create") {
      const availabilityData = {
        vendor_id: formData.get("vendor_id") || "default",
        name: formData.get("name") || `Planning ${new Date().toLocaleDateString()}`,
        weekly_schedule: JSON.parse(formData.get("weekly_schedule") as string || "[]"),
        special_dates: JSON.parse(formData.get("special_dates") as string || "{}"),
        blocked_dates: JSON.parse(formData.get("blocked_dates") as string || "[]"),
        default_duration: parseInt(formData.get("default_duration") as string || "60"),
        buffer_time: parseInt(formData.get("buffer_time") as string || "15"),
        max_advance_booking_days: parseInt(formData.get("max_advance_booking_days") as string || "90"),
        min_advance_booking_hours: parseInt(formData.get("min_advance_booking_hours") as string || "24"),
      };

      console.log("Creating availability with data:", availabilityData);

      const res = await fetch("http://localhost:8000/availability/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(availabilityData),
      });

      const responseData = await res.json();
      console.log("Create response:", responseData);

      if (!res.ok) {
        throw new Error(`Erreur lors de la création: ${JSON.stringify(responseData)}`);
      }

      return json({ success: true, message: "Disponibilité créée avec succès", data: responseData });
    }

    if (action === "update") {
      const id = formData.get("id");
      const updateData = {
        name: formData.get("name"),
        weekly_schedule: JSON.parse(formData.get("weekly_schedule") as string || "[]"),
        special_dates: JSON.parse(formData.get("special_dates") as string || "{}"),
        blocked_dates: JSON.parse(formData.get("blocked_dates") as string || "[]"),
        default_duration: parseInt(formData.get("default_duration") as string || "60"),
        buffer_time: parseInt(formData.get("buffer_time") as string || "15"),
        max_advance_booking_days: parseInt(formData.get("max_advance_booking_days") as string || "90"),
        min_advance_booking_hours: parseInt(formData.get("min_advance_booking_hours") as string || "24"),
        is_active: formData.get("is_active") === "true",
      };

      console.log("Updating availability with data:", updateData);

      const res = await fetch(`http://localhost:8000/availability/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const responseData = await res.json();
      console.log("Update response:", responseData);

      if (!res.ok) {
        throw new Error(`Erreur lors de la mise à jour: ${JSON.stringify(responseData)}`);
      }

      return json({ success: true, message: "Disponibilité mise à jour avec succès", data: responseData });
    }

    if (action === "delete") {
      const id = formData.get("id");

      console.log("Deleting availability with id:", id);

      const res = await fetch(`http://localhost:8000/availability/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Erreur lors de la suppression: ${JSON.stringify(errorData)}`);
      }

      return json({ success: true, message: "Disponibilité supprimée avec succès" });
    }

    if (action === "create_default") {
      console.log("Creating default availability");

      const res = await fetch("http://localhost:8000/availability/default", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      const responseData = await res.json();
      console.log("Default create response:", responseData);

      if (!res.ok) {
        throw new Error(`Erreur lors de la création par défaut: ${JSON.stringify(responseData)}`);
      }

      return json({ success: true, message: "Disponibilités par défaut créées avec succès", data: responseData });
    }

    return json({ error: "Action non reconnue", success: false }, { status: 400 });
  } catch (err: any) {
    console.error("Erreur action availability:", err);
    return json({ error: err.message || "Erreur serveur", success: false }, { status: 500 });
  }
};

export default function SellerAvailability() {
  const { availabilities: initialAvailabilities, token, error } = useLoaderData<LoaderData>();
  const submit = useSubmit();
  const fetcher = useFetcher();

  const [availabilities, setAvailabilities] = useState<Availability[]>(initialAvailabilities);
  const [selectedAvailability, setSelectedAvailability] = useState<Availability | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      console.log("Fetcher data:", fetcher.data);
      if ((fetcher.data as any).success) {
        // Recharger les données après une opération réussie
        window.location.reload(); // Solution simple pour recharger les données
      } else if ((fetcher.data as any).error) {
        alert(`Erreur: ${(fetcher.data as any).error}`);
      }
    }
  }, [fetcher]);

  const stats = useMemo(() => {
    const totalAvailabilities = availabilities.length;
    const active = availabilities.filter(a => a.is_active).length;
    const inactive = availabilities.filter(a => !a.is_active).length;
    const totalSlots = availabilities.reduce((acc, avail) => 
      acc + avail.weekly_schedule.reduce((weekAcc, day) => weekAcc + day.time_slots.length, 0), 0
    );

    return { totalAvailabilities, active, inactive, totalSlots };
  }, [availabilities]);

  const filteredAvailabilities = availabilities.filter(availability => {
    const matchesSearch = availability?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         availability?._id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" ||
                         (statusFilter === "active" && availability?.is_active) ||
                         (statusFilter === "inactive" && !availability?.is_active);

    return matchesSearch && matchesStatus;
  });

  const handleCreate = (formData: FormData) => {
    fetcher.submit(formData, { method: "post" });
  };

  const handleUpdate = (formData: FormData) => {
    fetcher.submit(formData, { method: "post" });
  };

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette configuration ?")) {
      const formData = new FormData();
      formData.append("_action", "delete");
      formData.append("id", id);
      fetcher.submit(formData, { method: "post" });
    }
  };

  const handleCreateDefault = () => {
    const formData = new FormData();
    formData.append("_action", "create_default");
    fetcher.submit(formData, { method: "post" });
  };

  const openViewModal = (availability: Availability) => {
    setSelectedAvailability(availability);
    setIsViewModalOpen(true);
  };

  const openEditModal = (availability: Availability) => {
    setSelectedAvailability(availability);
    setIsEditModalOpen(true);
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[dayOfWeek];
  };

  return (
    <SellerLayout>
    <div className="space-y-6">
      {error && <div className="text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Disponibilités</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-adawi-gold text-black px-4 py-2 rounded-lg hover:bg-yellow-500 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Configuration
          </button>
          <button
            onClick={handleCreateDefault}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Créer Config. par Défaut
          </button>
        </div>
      </div>

      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl shadow flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-indigo-500" />
          <div>
            <p className="text-sm text-gray-500">Total configurations</p>
            <p className="text-lg font-bold">{stats.totalAvailabilities}</p>
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl shadow flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <div>
            <p className="text-sm text-gray-500">Actives</p>
            <p className="text-lg font-bold">{stats.active}</p>
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl shadow flex items-center gap-3">
          <XCircle className="w-6 h-6 text-red-500" />
          <div>
            <p className="text-sm text-gray-500">Inactives</p>
            <p className="text-lg font-bold">{stats.inactive}</p>
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl shadow flex items-center gap-3">
          <Clock className="w-6 h-6 text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">Total créneaux</p>
            <p className="text-lg font-bold">{stats.totalSlots}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 py-2 border rounded-lg w-full"
          />
          {searchTerm && (
            <XCircle 
              onClick={() => setSearchTerm("")} 
              className="absolute right-3 top-3 w-5 h-5 text-gray-400 cursor-pointer" 
            />
          )}
        </div>

        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)} 
          className="border rounded-lg px-3 py-2"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jours actifs</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durée par défaut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAvailabilities.length > 0 ? filteredAvailabilities.map(availability => (
              <tr key={availability._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{availability.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{availability.vendor_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {availability.weekly_schedule.filter(day => day.is_working_day).length} jours
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{availability.default_duration} min</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    availability.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {availability.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openViewModal(availability)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="Voir"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(availability)}
                      className="text-yellow-600 hover:text-yellow-900 p-1"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(availability._id)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Aucune configuration trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {isViewModalOpen && selectedAvailability && (
        <ViewAvailabilityModal
          availability={selectedAvailability}
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          getDayName={getDayName}
        />
      )}

      {isCreateModalOpen && (
        <CreateAvailabilityModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreate}
        />
      )}

      {isEditModalOpen && selectedAvailability && (
        <EditAvailabilityModal
          availability={selectedAvailability}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdate}
        />
      )}
    </div>
    </SellerLayout>
  );
}

// Modal Components
function ViewAvailabilityModal({ 
  availability, 
  isOpen, 
  onClose, 
  getDayName 
}: { 
  availability: Availability; 
  isOpen: boolean; 
  onClose: () => void;
  getDayName: (day: number) => string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Configuration : {availability.name}</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Vendor ID:</strong> {availability.vendor_id}</p>
              <p><strong>Durée par défaut:</strong> {availability.default_duration} min</p>
              <p><strong>Temps de pause:</strong> {availability.buffer_time} min</p>
            </div>
            <div>
              <p><strong>Réservation max à l'avance:</strong> {availability.max_advance_booking_days} jours</p>
              <p><strong>Préavis minimum:</strong> {availability.min_advance_booking_hours} heures</p>
              <p><strong>Statut:</strong> {availability.is_active ? "Active" : "Inactive"}</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Planning hebdomadaire:</h3>
            <div className="space-y-2">
              {availability.weekly_schedule.map((day, index) => (
                <div key={index} className="border p-2 rounded">
                  <strong>{getDayName(day.day_of_week)}</strong>
                  {day.is_working_day ? (
                    <div className="ml-4">
                      <p>Créneaux: {day.time_slots.length}</p>
                      {day.break_start && <p>Pause: {day.break_start} - {day.break_end}</p>}
                    </div>
                  ) : (
                    <span className="ml-4 text-gray-500">Non travaillé</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {Object.keys(availability.special_dates).length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Dates spéciales:</h3>
              <p>{Object.keys(availability.special_dates).length} date(s) configurée(s)</p>
            </div>
          )}

          {availability.blocked_dates.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Dates bloquées:</h3>
              <p>{availability.blocked_dates.length} date(s) bloquée(s)</p>
            </div>
          )}
        </div>
        
        <button
          onClick={onClose}
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

function CreateAvailabilityModal({ 
  isOpen, 
  onClose, 
  onSubmit 
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
}) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("_action", "create");
    
    // Créer une structure basique pour l'exemple
    const basicWeeklySchedule = Array.from({length: 7}, (_, i) => ({
      day_of_week: i,
      is_working_day: i >= 1 && i <= 5, // Lundi à Vendredi
      time_slots: i >= 1 && i <= 5 ? [{
        start_time: "09:00",
        end_time: "17:00",
        is_available: true,
        max_appointments: 1
      }] : [],
      break_start: i >= 1 && i <= 5 ? "12:00" : undefined,
      break_end: i >= 1 && i <= 5 ? "13:00" : undefined
    }));

    formData.append("weekly_schedule", JSON.stringify(basicWeeklySchedule));
    formData.append("special_dates", JSON.stringify({}));
    formData.append("blocked_dates", JSON.stringify([]));
    
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Créer une Configuration</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la configuration *</label>
            <input
              type="text"
              name="name"
              required
              placeholder="Ex: Planning Standard"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor ID *</label>
            <input
              type="text"
              name="vendor_id"
              required
              placeholder="ID du vendeur"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durée par défaut (min)</label>
              <input
                type="number"
                name="default_duration"
                defaultValue="60"
                min="15"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temps de pause (min)</label>
              <input
                type="number"
                name="buffer_time"
                defaultValue="15"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-adawi-gold text-black px-4 py-2 rounded hover:bg-yellow-500 font-medium"
            >
              Créer
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditAvailabilityModal({ 
  availability, 
  isOpen, 
  onClose, 
  onSubmit 
}: {
  availability: Availability;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
}) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("_action", "update");
    formData.append("id", availability._id);
    
    formData.append("weekly_schedule", JSON.stringify(availability.weekly_schedule));
    formData.append("special_dates", JSON.stringify(availability.special_dates));
    formData.append("blocked_dates", JSON.stringify(availability.blocked_dates));
    
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Modifier la Configuration</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              name="name"
              defaultValue={availability.name}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durée par défaut (min)</label>
              <input
                type="number"
                name="default_duration"
                defaultValue={availability.default_duration}
                min="15"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temps de pause (min)</label>
              <input
                type="number"
                name="buffer_time"
                defaultValue={availability.buffer_time}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Réservation max (jours)</label>
              <input
                type="number"
                name="max_advance_booking_days"
                defaultValue={availability.max_advance_booking_days}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Préavis min (heures)</label>
              <input
                type="number"
                name="min_advance_booking_hours"
                defaultValue={availability.min_advance_booking_hours}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                value="true"
                defaultChecked={availability.is_active}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Configuration active</span>
            </label>
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-adawi-gold text-black px-4 py-2 rounded hover:bg-yellow-500 font-medium"
            >
              Modifier
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
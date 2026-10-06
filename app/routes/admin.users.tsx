import { useState, useEffect } from "react";
import type { MetaFunction, LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit, useActionData, useNavigation } from "@remix-run/react";
import { Plus, Search, Filter, Edit, Trash2, Eye, Mail, Phone, MoreVertical, AlertCircle, CheckCircle, User } from "lucide-react";
import AddUserModal from "~/components/admin/AddUserModal";
import EditRoleModal from "~/components/admin/EditRoleModal";
import UpdateUserModal from "~/components/admin/UpdateUserModal";
import { readToken } from "~/utils/session.server";
import ViewUserModal from "~/components/admin/ViewUserModal";
import { requireAdmin } from "~/utils/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Utilisateurs - Adawi Admin" },
    { name: "description", content: "Gestion des utilisateurs" },
  ];
};

// URL de l'API corrigée
const API_BASE = "http://localhost:8000";

// Types pour les données de l'API
interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_banned: boolean;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  photo?: string[];
}

interface LoaderData {
  users: User[];
  error?: string;
  debug?: any;
  success?: string;
}

interface ActionData {
  success?: boolean;
  error?: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  console.log(" Début du loader admin.users");
  
  const url = new URL(request.url);
  const intent = url.searchParams.get("intent");
  const userId = url.searchParams.get("userId");

  // Cas spécial : récupérer le profil d'un utilisateur
  if (intent === "getUserProfile" && userId) {
    await requireAdmin(request);
    const tokenData = await readToken(request);
    
    if (!tokenData) {
      return json({ error: "Non autorisé" }, { status: 401 });
    }

    try {
      let token;
      try {
        const parsedToken = typeof tokenData === 'string' ? JSON.parse(tokenData) : tokenData;
        token = parsedToken?.access_token || tokenData;
      } catch {
        token = tokenData;
      }

      const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      }); 

      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch { }
        return json({ error: errorMessage }, { status: response.status });
      }

      const userData = await response.json();
      return json(userData);

    } catch (error: any) {
      return json({ error: `Erreur de connexion: ${error.message}` }, { status: 500 });
    }
  }

  await requireAdmin(request);
  const tokenData = await readToken(request);
  
  if (!tokenData) {
    throw new Response("Non autorisé", { status: 401 });
  }

  try {
    let token;
    try {
      const parsedToken = typeof tokenData === 'string' ? JSON.parse(tokenData) : tokenData;
      token = parsedToken?.access_token || tokenData;
    } catch (parseError) {
      token = tokenData;
    }

    const response = await fetch(`${API_BASE}/admin/users?skip=0&limit=1000`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });

    if (!response.ok) {
      let errorMessage = `Erreur ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch { }
      
      return json<LoaderData>({ 
        users: [], 
        error: errorMessage,
        debug: { status: response.status, statusText: response.statusText }
      });
    }

    const users = await response.json();
    return json<LoaderData>({ users, error: null, debug: null });

  } catch (error: any) {
    console.error(" Erreur dans le loader:", error);
    return json<LoaderData>({ 
      users: [], 
      error: `Erreur de connexion: ${error.message}`,
      debug: { error: error.message, stack: error.stack }
    });
  }
};

export const action: ActionFunction = async ({ request }) => {
  const tokenData = await readToken(request);
  if (!tokenData) throw new Response("Non autorisé", { status: 401 });

  const formData = await request.formData();
  const intent = String(formData.get("intent") || "");

  // --- Cas 1 : Mise à jour du rôle ---
  // --- Cas 3 : Supprimer un utilisateur ---
  if (intent === "deleteUser") {
    const userId = String(formData.get("userId") || "");
    if (!userId) {
      return json<ActionData>({ error: "ID utilisateur manquant" }, { status: 400 });
    }

    try {
      let token;
      try {
        const parsedToken = typeof tokenData === "string" ? JSON.parse(tokenData) : tokenData;
        token = parsedToken?.access_token || tokenData;
      } catch {
        token = tokenData;
      }

      const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch { }
        return json<ActionData>({ error: errorMessage }, { status: response.status });
      }

      return json<ActionData>({ success: true });
    } catch (error: any) {
      return json<ActionData>({ error: "Erreur de connexion au serveur" }, { status: 500 });
    }
  }

  if (intent === "updateRole") {
    const userId = String(formData.get("userId") || "");
    const role = String(formData.get("role") || "");
    if (!userId || !role) {
      return json<ActionData>({ error: "Paramètres manquants" }, { status: 400 });
    }

    try {
      let token;
      try {
        const parsedToken = typeof tokenData === 'string' ? JSON.parse(tokenData) : tokenData;
        token = parsedToken?.access_token || tokenData;
      } catch (e) {
        token = tokenData;
      }

      const response = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role })
      });

      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch { }
        return json<ActionData>({ error: errorMessage }, { status: response.status });
      }

      return json<ActionData>({ success: true });

    } catch (error: any) {
      return json<ActionData>({ error: "Erreur de connexion au serveur" }, { status: 500 });
    }
  }

  // --- Cas 2 : Bannir / Débannir ---
  if (intent === "toggleBan") {
    const userId = String(formData.get("userId") || "");
    const ban = formData.get("ban") === "true"; // true ou false

    try {
      let token;
      try {
        const parsedToken = typeof tokenData === 'string' ? JSON.parse(tokenData) : tokenData;
        token = parsedToken?.access_token || tokenData;
      } catch {
        token = tokenData;
      }

      const response = await fetch(`${API_BASE}/admin/users/${userId}/ban`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ban })
      });

      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch { }
        return json<ActionData>({ error: errorMessage }, { status: response.status });
      }

      return json<ActionData>({ success: true });

    } catch (error: any) {
      return json<ActionData>({ error: "Erreur de connexion au serveur" }, { status: 500 });
    }
  }

  // --- Cas 4 : Créer un utilisateur ---
  if (intent === "createUser") {
    const name = String(formData.get("name") || "");
    const email = String(formData.get("email") || "");
    const role = String(formData.get("role") || "");
    const password = String(formData.get("password") || "");
    const status = String(formData.get("status") || "");

    if (!name || !email || !role || !password) {
      return json<ActionData>({ error: "Tous les champs requis doivent être remplis" }, { status: 400 });
    }

    try {
      let token;
      try {
        const parsedToken = typeof tokenData === "string" ? JSON.parse(tokenData) : tokenData;
        token = parsedToken?.access_token || tokenData;
      } catch {
        token = tokenData;
      }

      const userData = {
        name,
        email,
        role,
        password,
        status
      };

      const response = await fetch(`${API_BASE}/admin/users`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch { }
        return json<ActionData>({ error: errorMessage }, { status: response.status });
      }

      return json<ActionData>({ success: true });

    } catch (error: any) {
      return json<ActionData>({ error: "Erreur de connexion au serveur" }, { status: 500 });
    }
  }

  // --- Cas : Mettre à jour le profil utilisateur ---
  if (intent === "updateProfile") {
    const userId = String(formData.get("userId") || "");
    if (!userId) {
      return json<ActionData>({ error: "ID utilisateur manquant" }, { status: 400 });
    }

    try {
      let token;
      try {
        const parsedToken = typeof tokenData === "string" ? JSON.parse(tokenData) : tokenData;
        token = parsedToken?.access_token || tokenData;
      } catch {
        token = tokenData;
      }

      // Construire l'objet measurements
      const measurements: any = {};
      const measurementFields = [
        'height', 'weight', 'shoulder_width', 'chest', 'waist_length',
        'ventral_circumference', 'hips', 'corsage_length', 'belt',
        'skirt_length', 'dress_length', 'sleeve_length', 'sleeve_circumference',
        'pants_length', 'short_dress_length', 'thigh_circumference',
        'knee_length', 'knee_circumference', 'bottom', 'inseam'
      ];
      
      measurementFields.forEach(field => {
        const value = formData.get(`measurements.${field}`);
        measurements[field] = value ? parseFloat(value as string) : 0;
      });
      measurements.other_measurements = formData.get('measurements.other_measurements') || '';

      // Construire l'objet address
      const address = {
        street: formData.get('address.street') || '',
        city: formData.get('address.city') || '',
        postal_code: formData.get('address.postal_code') || '',
        country: formData.get('address.country') || '',
        phone: formData.get('address.phone') || ''
      };

      const updateData = new FormData();
      updateData.append('measurements', JSON.stringify(measurements));
      updateData.append('size', formData.get('size') as string);
      updateData.append('address', JSON.stringify(address));

      // Gérer les photos si présentes
      const photos = formData.getAll('photos');
      photos.forEach(photo => {
        if (photo instanceof File && photo.size > 0) {
          updateData.append('photos', photo);
        }
      });

      const response = await fetch(`${API_BASE}/admin/users/${userId}/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: updateData
      });

      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch { }
        return json<ActionData>({ error: errorMessage }, { status: response.status });
      }

      return json<ActionData>({ success: true });

    } catch (error: any) {
      return json<ActionData>({ error: "Erreur de connexion au serveur" }, { status: 500 });
    }
  }

  return json<ActionData>({ error: "Intent non reconnu" }, { status: 400 });
};

export default function AdminUsers() {
  const { users, error, debug, success } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdateUserModalOpen, setIsUpdateUserModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);

  const submit = useSubmit();

  const isSubmitting = navigation.state === "submitting";

  //  FIX: Added null checks for user properties
  const filteredUsers = users.filter(user => {
    // Check if user properties exist and provide fallbacks
    const fullName = user.full_name || "";
    const email = user.email || "";
    const role = user.role || "";

    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || role.toLowerCase() === filterRole.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const handleEditRole = (user: User) => {
    setSelectedUser(user);
    setModalKey(prev => prev + 1);
    setIsEditRoleModalOpen(true);
    setSuccessMessage(null);
  };
  
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  // Nouvelle fonction pour ouvrir le modal de mise à jour du profil
  const handleUpdateUserProfile = (user: User) => {
    setSelectedUser(user);
    setIsUpdateUserModalOpen(true);
  };

  const updateUserRole = async (userId: string, role: string) => {
    submit(
      { intent: "updateRole", userId, role }, //  ajouter intent
      { method: "post" }
    );
    setSuccessMessage(`${selectedUser?.full_name} est passé de ${selectedUser?.role} à ${role}`);
  };

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fermer le modal après succès
  // if (actionData?.success && isEditRoleModalOpen) {
  //   setIsEditRoleModalOpen(false);
  //   setSelectedUser(null);
  // }



  const getRoleColor = (role: string) => {
    //  FIX: Added null check
    if (!role) return "bg-gray-100 text-gray-800";
    
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "seller":
      case "vendeur":
      case "Vendeur":
        return "bg-blue-100 text-blue-800";
      case "client":
      case "customer":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role: string) => {
    //  FIX: Added null check
    if (!role) return "Non défini";
    
    switch (role.toLowerCase()) {
      case "admin": return "Admin";
      case "seller": return "Vendeur";
      case "client": return "Client";
      case "customer": return "Client";
      default: return role;
    }
  };

  const getStatusColor = (user: User) => {
    if (user.is_banned) return "bg-red-100 text-red-800";
    if (!user.is_active) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusLabel = (user: User) => {
    if (user.is_banned) return "Banni";
    if (!user.is_active) return "Inactif";
    return "Actif";
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getAvatarUrl = (user: User) => {
    // Use first real photo if available
    if (user.photo && user.photo.length > 0 && user.photo[0]) {
      const photo = user.photo[0];
      // If it's already a full URL, use it directly; otherwise prefix with API base
      return photo.startsWith('http') ? photo : `http://localhost:8000${photo}`;
    }
    // Fallback: generate initials placeholder
    const name = user.full_name || "?";
    const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    const colors = ['DAA520', '8B4513', 'CD853F', 'D2691E', 'B8860B'];
    const color = colors[name.length % colors.length];
    return `https://placehold.co/40x40/${color}/FFFFFF?text=${initials}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-adawi-brown">Gestion des Utilisateurs</h1>
          <p className="text-gray-600">Gérez vos clients, vendeurs et administrateurs</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter un utilisateur
        </button>
      </div>

      {/* Debug Info (en développement)
      {debug && process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-medium text-blue-800 mb-2">Debug Info:</h4>
          <pre className="text-xs text-blue-700 overflow-auto">
            {JSON.stringify(debug, null, 2)}
          </pre>
        </div>
      )} */}

      {/* Success Message */}
      {(success || actionData?.success) && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-green-700 font-medium">
              {success || "Utilisateur a été mis à jour avec succès"}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {(error || actionData?.error) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-red-700 font-medium">{error || actionData?.error}</p>
              {debug && (
                <details className="mt-2">
                  <summary className="text-red-600 text-sm cursor-pointer">Détails techniques</summary>
                  <pre className="text-xs text-red-600 mt-2 overflow-auto bg-red-100 p-2 rounded">
                    {JSON.stringify(debug, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              <p className="text-sm text-gray-600">Total Utilisateurs</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => {
                  const role = u.role || "";
                  return role.toLowerCase() === "client" || role.toLowerCase() === "customer";
                }).length}
              </p>
              <p className="text-sm text-gray-600">Clients</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg mr-3">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => {
                  const role = u.role || "";
                  return role.toLowerCase() === "seller" || role.toLowerCase() === "vendeur";
                }).length}
              </p>
              <p className="text-sm text-gray-600">Vendeurs</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg mr-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => {
                  const role = u.role || "";
                  return role.toLowerCase() === "admin";
                }).length}
              </p>
              <p className="text-sm text-gray-600">Administrateurs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="sm:w-48">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
            >
              <option value="all">Tous les rôles</option>
              <option value="client">Clients</option>
              <option value="seller">Vendeurs</option>
              <option value="admin">Administrateurs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!error && users.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun utilisateur trouvé
          </h3>
          <p className="text-gray-600 mb-6">
            Commencez par ajouter votre premier utilisateur.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-6 py-3 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold-light transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un utilisateur
          </button>
        </div>
      )}

      {/* Users Table */}
      {!error && users.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Utilisateur</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Rôle</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date d'inscription</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Dernière mise à jour</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <img
                          src={getAvatarUrl(user)}
                          alt={user.full_name || "User"}
                          className="w-10 h-10 rounded-full mr-3 object-cover"
                          onError={(e) => {
                            // Fallback to initials placeholder if image fails to load
                            const name = user.full_name || "?";
                            const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                            const colors = ['DAA520', '8B4513', 'CD853F', 'D2691E', 'B8860B'];
                            const color = colors[name.length % colors.length];
                            (e.target as HTMLImageElement).src = `https://placehold.co/40x40/${color}/FFFFFF?text=${initials}`;
                          }}
                        />
                        <div>
                          <p className="font-medium text-gray-900">{user.full_name || "Nom non disponible"}</p>
                          <p className="text-sm text-gray-500">ID: {user.id ? user.id.slice(-8) : "N/A"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {user.email || "Email non disponible"}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user)}`}>
                        {getStatusLabel(user)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {formatDate(user.updated_at)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Voir détails"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                          title="Modifier le profil"
                          onClick={() => handleUpdateUserProfile(user)}
                        >
                          <User className="w-4 h-4" />
                        </button>

                        <button
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="Modifier le rôle"
                          onClick={() => handleEditRole(user)}
                          disabled={isSubmitting}
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/*  Bouton Ban / Unban */}
                        <button
                          className={`p-2 transition-colors ${user.is_banned ? "text-green-600 hover:text-green-800" : "text-red-600 hover:text-red-800"}`}
                          title={user.is_banned ? "Débannir l'utilisateur" : "Bannir l'utilisateur"}
                          onClick={() =>
                            submit(
                              { intent: "toggleBan", userId: user.id, ban: (!user.is_banned).toString() },
                              { method: "post" }
                            )
                          }
                          disabled={isSubmitting}
                        >
                          {user.is_banned ? (
                            <CheckCircle className="w-4 h-4" /> //  Débannir
                          ) : (
                            <AlertCircle className="w-4 h-4" /> //  Bannir
                          )}
                        </button>

                        <button
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Supprimer"
                          onClick={() => {
                            if (confirm(`Voulez-vous vraiment supprimer ${user.full_name || "cet utilisateur"} ?`)) {
                              submit(
                                { intent: "deleteUser", userId: user.id },
                                { method: "post" }
                              );
                            }
                          }}
                          disabled={isSubmitting}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {/* <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors" title="Plus d'options">
                          <MoreVertical className="w-4 h-4" />
                        </button> */}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!error && filteredUsers.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Affichage de <span className="font-medium">1</span> à <span className="font-medium">{filteredUsers.length}</span> sur <span className="font-medium">{users.length}</span> utilisateurs
          </p>

          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Précédent
            </button>
            <button className="px-3 py-2 text-sm bg-adawi-gold text-white rounded-lg">
              1
            </button>
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              2
            </button>
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit Role Modal */}
      {/* Edit Role Modal */}
      <EditRoleModal
        key={modalKey} // Force le re-render du modal
        isOpen={isEditRoleModalOpen}
        onClose={() => {
          setIsEditRoleModalOpen(false);
          setSelectedUser(null);
          setSuccessMessage(null);
        }}
        user={selectedUser}
        onUpdateRole={updateUserRole}
        successMessage={successMessage}
      />

      <ViewUserModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        user={selectedUser}
      />

      {/* Update User Profile Modal */}
      {selectedUser && (
        <UpdateUserModal
          userId={selectedUser.id}
          isOpen={isUpdateUserModalOpen}
          onClose={() => {
            setIsUpdateUserModalOpen(false);
            setSelectedUser(null);
          }}
        />
      )}

    </div>
  );
}
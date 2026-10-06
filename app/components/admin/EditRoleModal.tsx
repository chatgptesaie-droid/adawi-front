import { useState, useEffect } from "react";
import { X, Check, Loader2 } from "lucide-react";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdateRole: (userId: string, role: string) => Promise<void>;
  successMessage?: string | null;
}

export default function EditRoleModal({ isOpen, onClose, user, onUpdateRole, successMessage }: EditRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<string>(user?.role || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Réinitialiser le rôle sélectionné quand l'utilisateur change
  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
      setError(null); // Réinitialiser l'erreur quand on change d'utilisateur
    }
  }, [user]);

  // Réinitialiser les états quand le modal s'ouvre/se ferme
  useEffect(() => {
    if (isOpen && user) {
      setSelectedRole(user.role);
      setError(null);
      setIsSubmitting(false);
    } else if (!isOpen) {
      // Réinitialiser complètement quand le modal se ferme
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      setError("Veuillez sélectionner un rôle");
      return;
    }

    if (selectedRole === user.role) {
      setError("Le rôle sélectionné est identique au rôle actuel");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onUpdateRole(user.id, selectedRole);
      // Succès : ne pas fermer automatiquement le modal
      setIsSubmitting(false);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la mise à jour du rôle");
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError(null);
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Modifier le rôle</h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* User Info */}
          <div className="mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-adawi-gold/20 rounded-full flex items-center justify-center">
                <span className="text-adawi-brown font-semibold">
                  {(user.full_name || "").split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{user.full_name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs text-gray-400">Rôle actuel: {user.role}</p>
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Nouveau rôle
            </label>
            <div className="space-y-3">
              {[
                { value: "client", label: "Client", description: "Accès aux commandes et au profil" },
                { value: "seller", label: "Vendeur", description: "Gestion des produits et commandes" },
                { value: "admin", label: "Administrateur", description: "Accès complet au système" }
              ].map((role) => (
                <label
                  key={role.value}
                  className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedRole === role.value
                      ? 'border-adawi-gold bg-adawi-gold/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={selectedRole === role.value}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="mt-1 text-adawi-gold focus:ring-adawi-gold"
                    disabled={isSubmitting}
                  />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">{role.label}</div>
                    <div className="text-sm text-gray-500">{role.description}</div>
                  </div>
                  {selectedRole === role.value && (
                    <Check className="w-5 h-5 text-adawi-gold ml-auto mt-0.5" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
  type="submit"
  disabled={isSubmitting || !selectedRole || selectedRole === user.role}
  className="flex items-center px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isSubmitting ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin text-white" />
      Mise à jour...
    </>
  ) : (
    "Mettre à jour"
  )}
</button>

          </div>
        </form>
      </div>
    </div>
  );
}
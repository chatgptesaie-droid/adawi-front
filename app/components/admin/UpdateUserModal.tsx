import { useState, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';

interface Measurements {
  height: number;
  weight: number;
  shoulder_width: number;
  chest: number;
  waist_length: number;
  ventral_circumference: number;
  hips: number;
  corsage_length: number;
  belt: number;
  skirt_length: number;
  dress_length: number;
  sleeve_length: number;
  sleeve_circumference: number;
  pants_length: number;
  short_dress_length: number;
  thigh_circumference: number;
  knee_length: number;
  knee_circumference: number;
  bottom: number;
  inseam: number;
  other_measurements: string;
}

interface Address {
  street: string;
  city: string;
  postal_code: string;
  country: string;
  phone: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'client' | 'admin' | 'seller';
  is_banned: boolean;
  is_active: boolean;
  is_deleted: boolean;
  measurements: Measurements;
  size: string;
  address: Address;
  photo: string[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface UserProfileModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function UpdateUserModal({ userId, isOpen, onClose }: UserProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fetcher = useFetcher();
  const updateFetcher = useFetcher();

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // États dérivés des fetchers
  const loading = fetcher.state === "loading";
  const updating = updateFetcher.state === "submitting";

  useEffect(() => {
    if (isOpen && userId) {
      // Utiliser le fetcher pour récupérer les données utilisateur
      fetcher.load(`/admin/users?intent=getUserProfile&userId=${userId}`);
    }
  }, [isOpen, userId]);

  // Gérer la réponse du fetcher pour le chargement des données
  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.error) {
        setError(fetcher.data.error);
        setUserData(null);
      } else {
        setUserData(fetcher.data);
        setError(null);
      }
    }
  }, [fetcher.data]);

  // Gérer la réponse de la mise à jour
  useEffect(() => {
    if (updateFetcher.data) {
      if (updateFetcher.data.error) {
        setError(updateFetcher.data.error);
      } else if (updateFetcher.data.success) {
        // Recharger les données après mise à jour
        fetcher.load(`/admin/users?intent=getUserProfile&userId=${userId}`);
        setIsEditing(false);
        setError(null);
      }
    }
  }, [updateFetcher.data, userId]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append('intent', 'updateProfile');
    formData.append('userId', userId);

    // Utiliser le fetcher pour soumettre les données
    updateFetcher.submit(formData, {
      method: 'post',
      action: '/admin/users',
      encType: 'multipart/form-data'
    });
  };

  const handleClose = () => {
    setIsEditing(false);
    setError(null);
    setUserData(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Modifier le profil' : 'Profil utilisateur'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            disabled={updating}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-adawi-gold"></div>
              <span className="ml-3 text-gray-600">Chargement des données...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
              {error.includes('Session expirée') && (
                <p className="mt-2 text-sm">
                  <button 
                    onClick={() => window.location.reload()} 
                    className="underline hover:no-underline"
                  >
                    Cliquez ici pour recharger la page
                  </button>
                </p>
              )}
            </div>
          ) : userData ? (
            <form onSubmit={handleSubmit}>
              {/* Informations de base */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Informations générales</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{userData.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Nom complet</label>
                    <p className="text-gray-900">{userData.full_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Rôle</label>
                    <p className="text-gray-900 capitalize">{userData.role}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Statut</label>
                    <p className="text-gray-900">
                      {userData.is_active ? '✓ Actif' : '✗ Inactif'}
                      {userData.is_banned && ' | Banni'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Taille */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Taille</h3>
                <div className="bg-gray-50 p-4 rounded">
                  {isEditing ? (
                    <select
                      name="size"
                      defaultValue={userData.size}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-adawi-gold"
                      disabled={updating}
                    >
                      {sizeOptions.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900 font-medium">{userData.size || 'Non défini'}</p>
                  )}
                </div>
              </div>

              {/* Mensurations */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Mensurations (cm)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded">
                  {userData.measurements && Object.entries(userData.measurements).map(([key, value]) => {
                    if (key === 'other_measurements') {
                      return (
                        <div key={key} className="col-span-2 md:col-span-3">
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Autres mesures
                          </label>
                          {isEditing ? (
                            <textarea
                              name={`measurements.${key}`}
                              defaultValue={value as string}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-adawi-gold"
                              rows={2}
                              disabled={updating}
                            />
                          ) : (
                            <p className="text-gray-900">{value || '-'}</p>
                          )}
                        </div>
                      );
                    }
                    
                    const label = key.replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());
                    return (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          {label}
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.1"
                            name={`measurements.${key}`}
                            defaultValue={value as number}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-adawi-gold"
                            disabled={updating}
                          />
                        ) : (
                          <p className="text-gray-900">{value || '-'}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Adresse */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Adresse</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                  {userData.address && Object.entries(userData.address).map(([key, value]) => {
                    const label = key.replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());
                    return (
                      <div key={key} className={key === 'street' ? 'col-span-2' : ''}>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          {label}
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name={`address.${key}`}
                            defaultValue={value}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-adawi-gold"
                            disabled={updating}
                          />
                        ) : (
                          <p className="text-gray-900">{value || '-'}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Photos */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Photos</h3>
                <div className="bg-gray-50 p-4 rounded">
                  {userData.photo && userData.photo.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {userData.photo.map((photo, idx) => (
                        <img
                          key={idx}
                          src={photo}
                          alt={`Photo ${idx + 1}`}
                          className="w-full h-32 object-cover rounded"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 mb-4">Aucune photo</p>
                  )}
                  {isEditing && (
                    <input
                      type="file"
                      name="photos"
                      multiple
                      accept="image/*"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-adawi-gold"
                      disabled={updating}
                    />
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition disabled:opacity-50"
                      disabled={updating}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-white bg-adawi-gold rounded hover:bg-adawi-gold/90 transition disabled:opacity-50 flex items-center"
                      disabled={updating}
                    >
                      {updating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Enregistrement...
                        </>
                      ) : (
                        'Enregistrer'
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 text-white bg-adawi-gold rounded hover:bg-adawi-gold/90 transition"
                    disabled={loading}
                  >
                    Modifier
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucune donnée utilisateur trouvée</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
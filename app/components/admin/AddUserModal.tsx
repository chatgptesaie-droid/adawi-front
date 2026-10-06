import { useState } from "react";
import { X, Upload, Loader2, CheckCircle, User, MapPin, Ruler, Eye, EyeOff } from "lucide-react";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export default function AddUserModal({ isOpen, onClose }: AddUserModalProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'measurements' | 'address'>('basic');
  const [showPassword, setShowPassword] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    // Informations de base
    full_name: "",
    email: "",
    role: "",
    password: "",
    size: "M",
    is_active: true,
    is_banned: false,
    is_deleted: false,
    
    // Mensurations
    measurements: {
      height: 0,
      weight: 0,
      shoulder_width: 0,
      chest: 0,
      waist_length: 0,
      ventral_circumference: 0,
      hips: 0,
      corsage_length: 0,
      belt: 0,
      skirt_length: 0,
      dress_length: 0,
      sleeve_length: 0,
      sleeve_circumference: 0,
      pants_length: 0,
      short_dress_length: 0,
      thigh_circumference: 0,
      knee_length: 0,
      knee_circumference: 0,
      bottom: 0,
      inseam: 0,
      other_measurements: ""
    } as Measurements,
    
    // Adresse
    address: {
      street: "",
      city: "",
      postal_code: "",
      country: "",
      phone: ""
    } as Address,
    
    // Photos
    photo: [] as string[]
  });

  const roles = [
    { value: "client", label: "Client" },
    { value: "vendeur", label: "Vendeur" },
    { value: "admin", label: "Admin" }
  ];

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  // Validation des champs requis
  const validateForm = () => {
    const requiredFields = ['full_name', 'email', 'role', 'password'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      console.log("Champs manquants:", missingFields);
      setErrorMessage(`Champs manquants: ${missingFields.join(', ')}`);
      return false;
    }
    
    if (formData.password.length < 6) {
      console.log("Mot de passe trop court");
      setErrorMessage("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Réinitialiser les messages
    setSuccessMessage(null);
    setErrorMessage(null);

    // Validation côté client
    if (!validateForm()) {
      console.log("Validation échouée");
      return;
    }

    setIsSubmitting(true);

    // Préparer les données pour l'API
    const userData = {
      email: formData.email,
      full_name: formData.full_name,
      role: formData.role,
      password: formData.password,
      size: formData.size,
      is_active: formData.is_active,
      is_banned: formData.is_banned,
      is_deleted: formData.is_deleted,
      measurements: formData.measurements,
      address: formData.address,
      photo: formData.photo
    };

    console.log("Envoi des données utilisateur:", userData);

    // Envoyer directement à l'API
    try {
      const response = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Utilisateur créé avec succès:", data);
        setSuccessMessage("Utilisateur créé avec succès!");
        
        // Réinitialiser le formulaire
        setTimeout(() => {
          setFormData({
            full_name: "",
            email: "",
            role: "",
            password: "",
            size: "M",
            is_active: true,
            is_banned: false,
            is_deleted: false,
            measurements: {
              height: 0,
              weight: 0,
              shoulder_width: 0,
              chest: 0,
              waist_length: 0,
              ventral_circumference: 0,
              hips: 0,
              corsage_length: 0,
              belt: 0,
              skirt_length: 0,
              dress_length: 0,
              sleeve_length: 0,
              sleeve_circumference: 0,
              pants_length: 0,
              short_dress_length: 0,
              thigh_circumference: 0,
              knee_length: 0,
              knee_circumference: 0,
              bottom: 0,
              inseam: 0,
              other_measurements: ""
            },
            address: {
              street: "",
              city: "",
              postal_code: "",
              country: "",
              phone: ""
            },
            photo: []
          });
          setPhotoPreview([]);
          setActiveTab('basic');
          setShowPassword(false);
          setSuccessMessage(null);
          onClose();
        }, 2000);
      } else {
        console.error("Erreur API:", data);
        const errorMsg = data.detail 
          ? (Array.isArray(data.detail) 
              ? data.detail.map((e: any) => e.msg).join(', ')
              : data.detail)
          : 'Une erreur est survenue';
        setErrorMessage(`Erreur: ${errorMsg}`);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      setErrorMessage("Erreur de connexion à l'API");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('measurements.')) {
      const measurementKey = name.split('.')[1] as keyof Measurements;
      setFormData(prev => ({
        ...prev,
        measurements: {
          ...prev.measurements,
          [measurementKey]: type === 'number' ? parseFloat(value) || 0 : value
        }
      }));
    } else if (name.startsWith('address.')) {
      const addressKey = name.split('.')[1] as keyof Address;
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressKey]: value
        }
      }));
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({
          ...prev,
          photo: [...prev.photo, base64String]
        }));
        setPhotoPreview(prev => [...prev, base64String]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photo: prev.photo.filter((_, i) => i !== index)
    }));
    setPhotoPreview(prev => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Ajouter un nouvel utilisateur</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Success Display */}
        {successMessage && (
          <div className="px-6 py-3 bg-green-50 border-l-4 border-green-400 text-green-700">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {errorMessage && (
          <div className="px-6 py-3 bg-red-50 border-l-4 border-red-400 text-red-700">
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'basic'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-4 h-4 mr-2" />
            Informations de base
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('measurements')}
            className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'measurements'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Ruler className="w-4 h-4 mr-2" />
            Mensurations
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('address')}
            className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'address'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <MapPin className="w-4 h-4 mr-2" />
            Adresse
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6">
            {/* Onglet Informations de base */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nom complet */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      required
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                      placeholder="Ex: Kofi Asante"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                      placeholder="kofi.asante@email.com"
                    />
                  </div>

                  {/* Rôle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rôle *
                    </label>
                    <select
                      name="role"
                      required
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                    >
                      <option value="">Sélectionner un rôle</option>
                      {roles.map(role => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Taille */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Taille
                    </label>
                    <select
                      name="size"
                      value={formData.size}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                    >
                      {sizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Mot de passe avec icône Eye */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                      placeholder="Au moins 6 caractères"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Le mot de passe doit contenir au moins 6 caractères</p>
                </div>

                {/* Options de statut */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Compte actif
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_banned"
                      checked={formData.is_banned}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Utilisateur banni
                    </label>
                  </div>
                </div>

                {/* Upload des photos */}
                <div className="pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photos de profil
                  </label>
                  <div className="space-y-3">
                    {/* Zone de téléchargement */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-yellow-500 transition-colors">
                      <input
                        type="file"
                        id="photo-upload"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="photo-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload className="w-10 h-10 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          Cliquez pour télécharger des photos
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          PNG, JPG ou JPEG jusqu'à 10MB
                        </span>
                      </label>
                    </div>

                    {/* Prévisualisation des photos */}
                    {photoPreview.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {photoPreview.map((photo, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={photo}
                              alt={`Photo ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Mensurations */}
            {activeTab === 'measurements' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(formData.measurements).map(([key, value]) => {
                    if (key === 'other_measurements') {
                      return (
                        <div key={key} className="md:col-span-2 lg:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Autres mesures
                          </label>
                          <textarea
                            name={`measurements.${key}`}
                            value={value as string}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                            placeholder="Autres mesures spécifiques..."
                          />
                        </div>
                      );
                    }

                    const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    return (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {label} (cm)
                        </label>
                        <input
                          type="number"
                          name={`measurements.${key}`}
                          value={value as number}
                          onChange={handleInputChange}
                          step="1"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                          placeholder="0"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Onglet Adresse */}
            {activeTab === 'address' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Rue */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse
                    </label>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                      placeholder="123 Rue de la Paix"
                    />
                  </div>

                  {/* Ville */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                      placeholder="Abidjan"
                    />
                  </div>

                  {/* Code postal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code postal
                    </label>
                    <input
                      type="text"
                      name="address.postal_code"
                      value={formData.address.postal_code}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                      placeholder="00225"
                    />
                  </div>

                  {/* Pays */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pays
                    </label>
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                      placeholder="Côte d'Ivoire"
                    />
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="address.phone"
                      value={formData.address.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                      placeholder="+225 01 02 03 04 05"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
              <div className="flex space-x-2">
                {activeTab !== 'basic' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === 'measurements') setActiveTab('basic');
                      if (activeTab === 'address') setActiveTab('measurements');
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Précédent
                  </button>
                )}
                {activeTab !== 'address' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === 'basic') setActiveTab('measurements');
                      if (activeTab === 'measurements') setActiveTab('address');
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Suivant
                  </button>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? "Création..." : "Créer l'utilisateur"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
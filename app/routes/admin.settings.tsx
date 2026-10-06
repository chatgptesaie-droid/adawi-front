import { useState, useRef, useEffect } from "react";
import { 
  Save, 
  Store, 
  Bell, 
  Shield, 
  CreditCard, 
  Truck, 
  Palette,
  Globe,
  Mail,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  Upload,
  Check,
  X,
  AlertCircle
} from "lucide-react";

interface GeneralSettings {
  storeName: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  description: string;
}

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  orders: boolean;
  stock: boolean;
  reviews: boolean;
  pollingInterval: number; // en secondes
}

interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
}

interface PaymentSettings {
  moovNumber: string;
  togocelNumber: string;
  cashOnDelivery: boolean;
}

interface ShippingSettings {
  standardPrice: number;
  standardDelay: number;
  freeShippingThreshold: number;
  expressPrice: number;
  expressDelay: number;
  zones: {
    lomeCenter: boolean;
    lomeBanlieue: boolean;
    otherRegions: boolean;
  };
}

interface AppearanceSettings {
  logo: string;
  primaryColor: string;
  banner: string;
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // États pour chaque section
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    storeName: "Adawi Fashion",
    email: "contact@adawi.com",
    phone: "+228 90 00 00 00",
    website: "https://adawi.com",
    address: "Carrefour Bodiona, Lomé, Togo",
    description: "Adawi Fashion est votre destination pour la mode africaine authentique et moderne. Nous proposons une large gamme de vêtements traditionnels et contemporains pour toute la famille."
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    sms: false,
    push: true,
    orders: true,
    stock: true,
    reviews: false,
    pollingInterval: 3 // valeur par défaut, remplacée par useEffect
  });

  // Lire les préférences sauvegardées depuis localStorage après le montage
  useEffect(() => {
    const savedInterval = localStorage.getItem('adminNotifPollingInterval');
    if (savedInterval) {
      setNotifications(prev => ({
        ...prev,
        pollingInterval: parseInt(savedInterval)
      }));
    }
  }, []);

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    moovNumber: "+228 90 00 00 00",
    togocelNumber: "+228 70 00 00 00",
    cashOnDelivery: true
  });

  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({
    standardPrice: 2000,
    standardDelay: 3,
    freeShippingThreshold: 50000,
    expressPrice: 5000,
    expressDelay: 24,
    zones: {
      lomeCenter: true,
      lomeBanlieue: true,
      otherRegions: false
    }
  });

  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    logo: "/ADAWI _ LOGO FOND BLANC.jpg",
    primaryColor: "#DAA520",
    banner: ""
  });

  const tabs = [
    { id: "general", label: "Général", icon: Store },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Sécurité", icon: Shield },
    { id: "payment", label: "Paiement", icon: CreditCard },
    { id: "shipping", label: "Livraison", icon: Truck },
    { id: "appearance", label: "Apparence", icon: Palette },
  ];

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Persister l'intervalle de polling dans localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('adminNotifPollingInterval', String(notifications.pollingInterval));
      }

      console.log('Saving settings:', {
        general: generalSettings,
        notifications,
        security: securitySettings,
        payment: paymentSettings,
        shipping: shippingSettings,
        appearance: appearanceSettings
      });

      showMessage('success', 'Paramètres sauvegardés avec succès !');
    } catch (error) {
      showMessage('error', 'Erreur lors de la sauvegarde des paramètres');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleImageUpload = (type: 'logo' | 'banner', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setAppearanceSettings(prev => ({
        ...prev,
        [type]: result
      }));
    };
    reader.readAsDataURL(file);
  };

  const validateSecurity = (): boolean => {
    if (securitySettings.newPassword && securitySettings.newPassword !== securitySettings.confirmPassword) {
      showMessage('error', 'Les mots de passe ne correspondent pas');
      return false;
    }
    if (securitySettings.newPassword && securitySettings.newPassword.length < 8) {
      showMessage('error', 'Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600">Gérez les paramètres de votre boutique</p>
        </div>

        <button 
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>

      {/* Message de feedback */}
      {message && (
        <div className={`flex items-center p-4 rounded-lg ${ 
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <Check className="w-5 h-5 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          {message.text}
          <button 
            onClick={() => setMessage(null)}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${ 
                    activeTab === tab.id
                      ? 'border-adawi-gold text-adawi-gold'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Général */}
          {activeTab === "general" && (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de la boutique</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de la boutique *
                    </label>
                    <input
                      type="text"
                      required
                      value={generalSettings.storeName}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, storeName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email de contact *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="email"
                        required
                        value={generalSettings.email}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="tel"
                        required
                        value={generalSettings.phone}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site web
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="url"
                        value={generalSettings.website}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, website: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <textarea
                      rows={3}
                      required
                      value={generalSettings.address}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description de la boutique
                  </label>
                  <textarea
                    rows={4}
                    value={generalSettings.description}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                  />
                </div>
              </div>
            </form>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Préférences de notification</h3>
                
                <div className="space-y-4">
                  {[
                    { key: 'email' as keyof NotificationSettings, title: 'Notifications par email', desc: 'Recevoir les notifications importantes par email' },
                    { key: 'sms' as keyof NotificationSettings, title: 'Notifications SMS', desc: 'Recevoir les alertes urgentes par SMS' },
                    { key: 'orders' as keyof NotificationSettings, title: 'Nouvelles commandes', desc: 'Être notifié des nouvelles commandes' },
                    { key: 'stock' as keyof NotificationSettings, title: 'Alertes de stock', desc: 'Être alerté quand le stock est faible' },
                    { key: 'reviews' as keyof NotificationSettings, title: 'Nouveaux avis', desc: 'Être notifié des nouveaux avis clients' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications[item.key] as boolean}
                          onChange={() => handleNotificationChange(item.key)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-adawi-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-adawi-gold"></div>
                      </label>
                    </div>
                  ))}

                  {/* Intervalle de polling */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Fréquence d'actualisation</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Définir à quelle fréquence le tableau de bord vérifie les nouvelles notifications.
                          Une valeur plus basse est plus réactive mais génère plus de requêtes.
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <select
                            value={notifications.pollingInterval}
                            onChange={(e) =>
                              setNotifications(prev => ({
                                ...prev,
                                pollingInterval: Number(e.target.value)
                              }))
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent bg-white text-sm"
                          >
                            <option value={2}>2 secondes</option>
                            <option value={3}>3 secondes</option>
                            <option value={5}>5 secondes</option>
                            <option value={10}>10 secondes</option>
                            <option value={30}>30 secondes</option>
                            <option value={60}>1 minute</option>
                          </select>
                          <span className="text-sm text-gray-500">
                            Actuel : <span className="font-medium text-adawi-gold">{notifications.pollingInterval}s</span>
                          </span>
                        </div>
                      </div>
                      <Bell className="w-5 h-5 text-adawi-gold mt-1 flex-shrink-0" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sécurité */}
          {activeTab === "security" && (
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              if (validateSecurity()) handleSave(); 
            }} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sécurité du compte</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe actuel
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={securitySettings.currentPassword}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={securitySettings.newPassword}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={securitySettings.confirmPassword}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Authentification à deux facteurs</h4>
                        <p className="text-sm text-gray-600">Ajouter une couche de sécurité supplémentaire</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
                        className={`px-4 py-2 rounded-lg transition-colors ${ 
                          securitySettings.twoFactorEnabled 
                            ? 'bg-red-600 text-white hover:bg-red-700' 
                            : 'bg-adawi-gold text-white hover:bg-adawi-gold/90'
                        }`}
                      >
                        {securitySettings.twoFactorEnabled ? 'Désactiver' : 'Activer'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Paiement */}
          {activeTab === "payment" && (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Méthodes de paiement</h3>
                
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Mobile Money</h4>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Actif</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Accepter les paiements via Moov Money et Togocel Cash</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Numéro Moov Money
                        </label>
                        <input
                          type="tel"
                          value={paymentSettings.moovNumber}
                          onChange={(e) => setPaymentSettings(prev => ({ ...prev, moovNumber: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Numéro Togocel Cash
                        </label>
                        <input
                          type="tel"
                          value={paymentSettings.togocelNumber}
                          onChange={(e) => setPaymentSettings(prev => ({ ...prev, togocelNumber: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Paiement à la livraison</h4>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={paymentSettings.cashOnDelivery}
                          onChange={(e) => setPaymentSettings(prev => ({ ...prev, cashOnDelivery: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-adawi-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-adawi-gold"></div>
                      </label>
                    </div>
                    <p className="text-sm text-gray-600">Permettre aux clients de payer lors de la réception</p>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Livraison */}
          {activeTab === "shipping" && (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Options de livraison</h3>
                
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Livraison standard</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prix (F CFA)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={shippingSettings.standardPrice}
                          onChange={(e) => setShippingSettings(prev => ({ ...prev, standardPrice: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Délai (jours)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={shippingSettings.standardDelay}
                          onChange={(e) => setShippingSettings(prev => ({ ...prev, standardDelay: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Gratuite à partir de (F CFA)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={shippingSettings.freeShippingThreshold}
                          onChange={(e) => setShippingSettings(prev => ({ ...prev, freeShippingThreshold: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Livraison express</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prix (F CFA)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={shippingSettings.expressPrice}
                          onChange={(e) => setShippingSettings(prev => ({ ...prev, expressPrice: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Délai (heures)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={shippingSettings.expressDelay}
                          onChange={(e) => setShippingSettings(prev => ({ ...prev, expressDelay: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Zones de livraison</h4>
                    <div className="space-y-2">
                      {[
                        { key: 'lomeCenter' as keyof typeof shippingSettings.zones, label: 'Lomé Centre' },
                        { key: 'lomeBanlieue' as keyof typeof shippingSettings.zones, label: 'Banlieue de Lomé' },
                        { key: 'otherRegions' as keyof typeof shippingSettings.zones, label: 'Autres régions du Togo' }
                      ].map((zone) => (
                        <div key={zone.key} className="flex items-center">
                          <input 
                            type="checkbox" 
                            id={zone.key}
                            checked={shippingSettings.zones[zone.key]}
                            onChange={(e) => setShippingSettings(prev => ({
                              ...prev,
                              zones: {
                                ...prev.zones,
                                [zone.key]: e.target.checked
                              }
                            }))}
                            className="mr-2 h-4 w-4 text-adawi-gold focus:ring-adawi-gold border-gray-300 rounded" 
                          />
                          <label htmlFor={zone.key} className="text-sm cursor-pointer">{zone.label}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Apparence */}
          {activeTab === "appearance" && (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personnalisation de la boutique</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo de la boutique
                    </label>
                    <input
                      type="file"
                      ref={logoInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload('logo', file);
                      }}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <img 
                          src={appearanceSettings.logo} 
                          alt="Logo" 
                          className="w-full h-full object-cover rounded" 
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Changer le logo
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Couleur principale
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="color"
                        value={appearanceSettings.primaryColor}
                        onChange={(e) => setAppearanceSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={appearanceSettings.primaryColor}
                          onChange={(e) => setAppearanceSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                          placeholder="#DAA520"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bannière d'accueil
                    </label>
                    <input
                      type="file"
                      ref={bannerInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload('banner', file);
                      }}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    {appearanceSettings.banner ? (
                      <div className="relative">
                        <img 
                          src={appearanceSettings.banner} 
                          alt="Bannière" 
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => bannerInputRef.current?.click()}
                            className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Upload className="w-4 h-4 inline mr-2" />
                            Changer la bannière
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => bannerInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-adawi-gold transition-colors cursor-pointer"
                      >
                        <div className="space-y-2">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="text-sm text-gray-600">
                            <span className="text-adawi-gold hover:text-adawi-gold/80">Télécharger une image</span> ou glisser-déposer
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG jusqu'à 2MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

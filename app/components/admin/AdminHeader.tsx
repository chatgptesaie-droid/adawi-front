import { Search, Bell, ChevronDown, Menu, Volume2, VolumeX } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import NotificationDropdown from "./NotificationDropdown";
import NotificationDetailsModal from "./NotificationDetailsModal";
import { Link } from "@remix-run/react";

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  order_id?: string;
  product_id?: string;
  ticket_id?: string;
  refund_id?: string;
  created_at: string;
  read: boolean;
  order_details?: object;
  product_details?: object;
  ticket_details?: object;
  refund_details?: object;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  // Ref miroir pour éviter les stale closures dans les callbacks async/interval
  const isSoundEnabledRef = useRef(true);

  // États pour le modal
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const prevNotifIdsRef = useRef<Set<string>>(new Set());
  // AudioContext pour Web Audio API — pas de fichier, pas de blocage autoplay
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Charger la préférence son au démarrage
  useEffect(() => {
    const saved = localStorage.getItem('adminSoundEnabled');
    const enabled = saved !== null ? saved === 'true' : true;
    setIsSoundEnabled(enabled);
    isSoundEnabledRef.current = enabled;
  }, []);

  // Créer/réutiliser l'AudioContext (doit être créé après une interaction utilisateur)
  const getAudioCtx = (): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch {
        return null;
      }
    }
    // Reprendre si suspendu (politique autoplay)
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Jouer un double bip via Web Audio API — aucun fichier requis
  const playNotificationSound = () => {
    if (!isSoundEnabledRef.current) return;
    const ctx = getAudioCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const beeps = [
      { freq: 880,  start: now,        dur: 0.12 },
      { freq: 1174, start: now + 0.17, dur: 0.18 },
    ];

    beeps.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      // Fade in / fade out pour un son doux
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.4, start + 0.02);
      gain.gain.setValueAtTime(0.4, start + dur - 0.03);
      gain.gain.linearRampToValueAtTime(0, start + dur);

      osc.start(start);
      osc.stop(start + dur);
    });
  };

  const toggleSound = () => {
    const next = !isSoundEnabledRef.current;
    isSoundEnabledRef.current = next;
    setIsSoundEnabled(next);
    localStorage.setItem('adminSoundEnabled', String(next));
    // Bip de confirmation immédiat quand on réactive
    if (next) {
      // Forcer la création du contexte lors du clic (interaction utilisateur)
      setTimeout(() => playNotificationSound(), 0);
    }
  };

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Récupérer les notifications via notre API locale
  const fetchNotifications = async (isInitialLoad = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/notifications?limit=100&offset=0');

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur API locale:', errorData);
        setError(errorData.error || `Erreur ${response.status}`);
        return;
      }

      const data: Notification[] = await response.json();

      // Détecter les nouvelles notifications non lues
      if (!isInitialLoad && prevNotifIdsRef.current.size > 0) {
        const newOnes = data.filter(
          (n) => !n.read && !prevNotifIdsRef.current.has(n.id)
        );
        if (newOnes.length > 0) {
          playNotificationSound();
        }
      }

      // Mettre à jour le set des IDs connus
      prevNotifIdsRef.current = new Set(data.map((n) => n.id));
      setNotifications(data);
    } catch (err) {
      console.error('Erreur lors de la récupération des notifications:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  // Marquer une notification comme lue
  const markAsRead = async (notificationId: string) => {
    try {
      const formData = new FormData();
      formData.append('notificationId', notificationId);

      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
      } else {
        const errorData = await response.json();
        console.error('Erreur lors du marquage:', errorData);
      }
    } catch (err) {
      console.error('Erreur lors du marquage de la notification:', err);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    setIsNotificationOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  // Chargement initial + polling toutes les 30s
  // Chargement initial + polling dynamique selon les settings
  useEffect(() => {
    fetchNotifications(true);

    // Lire l'intervalle depuis localStorage (défaut 3s)
    const savedInterval = parseInt(localStorage.getItem('adminNotifPollingInterval') || '3');
    const intervalMs = Math.max(2, savedInterval) * 1000;

    const interval = setInterval(() => fetchNotifications(false), intervalMs);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(notif => !notif.read).length;

  const handleNotificationToggle = () => {
    setIsNotificationOpen(!isNotificationOpen);
    if (!isNotificationOpen) {
      fetchNotifications(false);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center flex-1">
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mr-2"
                aria-label="Ouvrir le menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-4 ml-4">
            <Link
              to="/admin/panier"
              className="hidden sm:inline-flex text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 rounded-full hover:bg-adawi-beige/50 relative"
            >
              <svg className="w-6 h-6 hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2 4h12m-8 4a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </Link>

            {/* Icône Son — clic crée l'AudioContext dans une interaction utilisateur */}
            <button
              onClick={toggleSound}
              title={isSoundEnabled ? "Désactiver le son des notifications" : "Activer le son des notifications"}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isSoundEnabled ? (
                <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-adawi-gold" />
              ) : (
                <VolumeX className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={handleNotificationToggle}
                className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] sm:text-xs">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              <NotificationDropdown
                isOpen={isNotificationOpen}
                notifications={notifications}
                isLoading={isLoading}
                error={error}
                onMarkAsRead={markAsRead}
                onRefresh={() => fetchNotifications(false)}
                onNotificationClick={handleNotificationClick}
                onClose={() => setIsNotificationOpen(false)}
              />
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-adawi-gold rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-xs sm:text-sm">AP</span>
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">Admin Principal</p>
                <p className="text-xs text-gray-500">admin@adawi.com</p>
              </div>
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      <NotificationDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        notification={selectedNotification}
        onMarkAsRead={markAsRead}
      />
    </>
  );
}
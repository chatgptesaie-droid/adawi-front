import React, { useState, useEffect, useRef } from 'react';
import { Bell, Volume2, VolumeX } from 'lucide-react';
import NotificationDropdown from '~/components/admin/NotificationDropdown';
import NotificationDetailsModal from '~/components/admin/NotificationDetailsModal';
import { Link } from '@remix-run/react';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  order_id?: string;
  created_at: string;
  read: boolean;
}

interface SellerHeaderProps {
  onMenuClick: () => void;
  userName?: string;
}

const SellerHeader: React.FC<SellerHeaderProps> = ({ onMenuClick, userName }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  const isSoundEnabledRef = useRef(true);
  const prevNotifIdsRef = useRef<Set<string>>(new Set());
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Lire la préférence son depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sellerSoundEnabled');
    const enabled = saved !== null ? saved === 'true' : true;
    setIsSoundEnabled(enabled);
    isSoundEnabledRef.current = enabled;
  }, []);

  const getAudioCtx = (): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch {
        return null;
      }
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

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
    localStorage.setItem('sellerSoundEnabled', String(next));
    if (next) setTimeout(() => playNotificationSound(), 0);
  };

  const fetchNotifications = async (isInitialLoad = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/notifications?limit=100&offset=0');
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || `Erreur ${response.status}`);
        return;
      }
      const data: Notification[] = await response.json();

      // Détecter les nouvelles notifs non lues
      if (!isInitialLoad && prevNotifIdsRef.current.size > 0) {
        const newOnes = data.filter(
          (n) => !n.read && !prevNotifIdsRef.current.has(n.id)
        );
        if (newOnes.length > 0) playNotificationSound();
      }

      prevNotifIdsRef.current = new Set(data.map((n) => n.id));
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const formData = new FormData();
      formData.append('notificationId', notificationId);
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
      }
    } catch (err) {
      console.error('Erreur marquage notification:', err);
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

  // Chargement initial + polling dynamique selon les settings
  useEffect(() => {
    fetchNotifications(true);
    const savedInterval = parseInt(localStorage.getItem('adminNotifPollingInterval') || '3');
    const intervalMs = Math.max(2, savedInterval) * 1000;
    const interval = setInterval(() => fetchNotifications(false), intervalMs);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <button onClick={onMenuClick} className="p-2 text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="text-lg font-semibold hidden sm:block">{userName}</div>

            {/* Icône Son */}
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

            {/* Panier */}
            <Link
              to="/seller/panier"
              className="hidden sm:inline-flex text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 rounded-full hover:bg-adawi-beige/50 relative"
            >
              <svg className="w-6 h-6 hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2 4h12m-8 4a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </Link>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  if (!isNotificationOpen) fetchNotifications(false);
                }}
                className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
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
};

export default SellerHeader;

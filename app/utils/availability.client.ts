export interface TimeSlot {
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  is_available: boolean;
  vendor_id: string;
  vendor_name: string;
}

export interface AvailabilityCheckResult {
  available: boolean;
  message?: string;
}

/** 
 * Récupérer les créneaux disponibles pour une période
 */
export async function getAvailableSlots(
  token: string,
  startDate: string,
  endDate: string
): Promise<TimeSlot[]> {
  const url = `http://localhost:8000/availability/slots?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Erreur lors de la récupération des créneaux");
  }

  return response.json();
}

/** 
 * Vérifier la disponibilité d'un créneau spécifique
 */
export async function checkSlotAvailability(
  token: string,
  date: string,
  durationMinutes: number = 60
): Promise<string> {
  const url = `http://localhost:8000/availability/check?date=${encodeURIComponent(date)}&duration_minutes=${durationMinutes}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Erreur lors de la vérification");
  }

  return response.json();
}

/** 
 * Formater une date pour l'affichage
 */
export function formatDisplayDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/** 
 * Formater une heure pour l'affichage
 */
export function formatDisplayTime(timeStr: string): string {
  return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/** 
 * Grouper les créneaux par date
 */
export function groupSlotsByDate(slots: TimeSlot[]): { [date: string]: TimeSlot[] } {
  return slots.reduce((grouped, slot) => {
    const date = slot.date;
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(slot);
    return grouped;
  }, {} as { [date: string]: TimeSlot[] });
}

/** 
 * Obtenir les dates d'une semaine
 */
export function getWeekDates(weekOffset: number = 0): string[] {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    weekDates.push(date.toISOString().split('T')[0]);
  }
  return weekDates;
}

/** 
 * Filtrer les créneaux disponibles
 */
export function filterAvailableSlots(
  slots: TimeSlot[],
  searchTerm: string = "",
  vendorFilter: string = "all"
): TimeSlot[] {
  return slots.filter(slot => {
    const matchesSearch = slot.vendor_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVendor = vendorFilter === "all" || slot.vendor_name === vendorFilter;
    const matchesAvailability = slot.is_available;

    return matchesSearch && matchesVendor && matchesAvailability;
  });
}

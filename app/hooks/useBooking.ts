import { useState, useEffect, useMemo } from "react";
import { useFetcher } from "@remix-run/react";

export interface TimeSlot {
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  is_available: boolean;
  vendor_id: string;
  vendor_name: string;
}

/**
 * Grouper les créneaux par date
 */
function groupSlotsByDate(slots: TimeSlot[]): { [date: string]: TimeSlot[] } {
  console.log("Grouping slots:", slots); // Debug
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
function getWeekDates(weekOffset: number = 0): string[] {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    weekDates.push(date.toISOString().split('T')[0]);
  }
  console.log("Week dates:", weekDates); // Debug
  return weekDates;
}

/**
 * Filtrer les créneaux disponibles
 */
function filterAvailableSlots(
  slots: TimeSlot[],
  searchTerm: string = "",
  vendorFilter: string = "all"
): TimeSlot[] {
  const filtered = slots.filter(slot => {
    const matchesSearch = slot.vendor_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVendor = vendorFilter === "all" || slot.vendor_name === vendorFilter;
    const matchesAvailability = slot.is_available;

    return matchesSearch && matchesVendor && matchesAvailability;
  });
  console.log("Filtered slots:", filtered); // Debug
  return filtered;
}

export function useBooking(initialSlots: TimeSlot[]) {
  const fetcher = useFetcher();

  console.log("Initial slots received:", initialSlots); // Debug

  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [currentWeek, setCurrentWeek] = useState(0);
  const [checkingSlot, setCheckingSlot] = useState<string | null>(null);

  // Grouper les créneaux par date
  const slotsByDate = useMemo(() => {
    const grouped = groupSlotsByDate(initialSlots);
    console.log("Slots by date:", grouped); // Debug
    return grouped;
  }, [initialSlots]);

  // Obtenir les vendeurs uniques
  const vendors = useMemo(() => {
    const uniqueVendors = new Set(initialSlots.map(slot => slot.vendor_name));
    const vendorArray = Array.from(uniqueVendors);
    console.log("Unique vendors:", vendorArray); // Debug
    return vendorArray;
  }, [initialSlots]);

  // Filtrer les créneaux
  const filteredSlots = useMemo(() => {
    const filtered = filterAvailableSlots(initialSlots, searchTerm, vendorFilter);
    console.log("Filtered slots result:", filtered); // Debug
    return filtered;
  }, [initialSlots, searchTerm, vendorFilter]);

  // Obtenir les dates de la semaine courante
  const weekDates = useMemo(() => {
    return getWeekDates(currentWeek);
  }, [currentWeek]);

  // Gérer les actions
  const handleSlotClick = (slot: TimeSlot) => {
    console.log("Slot clicked:", slot); // Debug
    setSelectedSlot(slot);
    setIsBookingModalOpen(true);
  };

  const handleCheckAvailability = (slot: TimeSlot) => {
    console.log("Checking availability for slot:", slot); // Debug
    setCheckingSlot(`${slot.date}-${slot.start_time}`);

    const formData = new FormData();
    formData.append("_action", "check_availability");
    formData.append("date", `${slot.date}T${slot.start_time}:00`);
    formData.append("duration_minutes", slot.duration_minutes.toString());

    fetcher.submit(formData, { method: "post" });
  };

  const handleBookSlot = (formData: FormData) => {
    console.log("Booking slot with form data:", formData); // Debug
    formData.append("_action", "book_slot");
    fetcher.submit(formData, { method: "post" });
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedSlot(null);
  };

  // Navigation semaine
  const goToPreviousWeek = () => setCurrentWeek(currentWeek - 1);
  const goToNextWeek = () => setCurrentWeek(currentWeek + 1);

  // Gérer les réponses du fetcher
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      console.log("Fetcher data received:", fetcher.data); // Debug
      if ((fetcher.data as any).success) {
        if ((fetcher.data as any).appointment) {
          closeBookingModal();
          alert("Rendez-vous réservé avec succès!");
          // Recharger les créneaux
          window.location.reload();
        }
      } else if ((fetcher.data as any).error) {
        alert(`Erreur: ${(fetcher.data as any).error}`);
      }
      setCheckingSlot(null);
    }
  }, [fetcher]);

  return {
    // State
    selectedSlot,
    isBookingModalOpen,
    searchTerm,
    vendorFilter,
    currentWeek,
    checkingSlot,

    // Computed values
    slotsByDate,
    vendors,
    filteredSlots,
    weekDates,

    // Actions
    handleSlotClick,
    handleCheckAvailability,
    handleBookSlot,
    closeBookingModal,
    goToPreviousWeek,
    goToNextWeek,
    setSearchTerm,
    setVendorFilter,

    // Fetcher state
    isLoading: fetcher.state !== "idle",
    fetcherData: fetcher.data
  };
}

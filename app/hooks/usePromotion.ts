import { useEffect, useState } from "react";

interface Promotion {
  id: string;
  name: string;
  description: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  status: string;
}

export function usePromotion() {
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching promotion from /api/promotions/active");
        
        const response = await fetch('/api/promotions/active', {
          method: 'GET',
          credentials: 'include', // Important pour Remix sessions
          headers: {
            'Accept': 'application/json',
          }
        });

        console.log("Response status:", response.status);
        console.log("Response ok:", response.ok);

        if (response.ok) {
          const data = await response.json();
          console.log("Data received:", data);
          
          if (data && !data.error) {
            setPromotion(data);
            console.log("Promotion set:", data);
          } else {
            console.log("No promotion or error in data");
            setPromotion(null);
          }
        } else if (response.status === 401) {
          console.log("Authentication required");
          setError('Non authentifié');
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.log("Error response:", errorData);
          setError(errorData.error || 'Erreur lors de la récupération');
        }
      } catch (err) {
        console.error('Network error:', err);
        setError('Erreur réseau');
      } finally {
        setLoading(false);
      }
    };

    fetchPromotion();
  }, []);

  return { promotion, loading, error };
}

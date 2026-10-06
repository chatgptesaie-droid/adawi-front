import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  full_name: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  role: string;
  is_active: boolean;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Faire un appel à une route Remix qui récupère l'utilisateur depuis la session
        const response = await fetch('/api/user', {
          credentials: 'include' // Important pour inclure les cookies
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else if (response.status === 401) {
          // Non authentifié
          setUser(null);
        } else {
          setError('Erreur lors de la récupération des données utilisateur');
        }
      } catch (err) {
        setError('Erreur réseau');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
}

// refundService.ts - Version corrigée avec authentification
export interface Refund {
    order_id: string;
    reason: "other" | "damaged" | "defective" | "not_as_described" | string;
    comment: string;
    items: string[];
    id: string;
    user_id: string;
    amount: number;
    status: "pending" | "approved" | "rejected" | "processed";
    created_at: string;
    updated_at: string;
    admin_comment: string | null;
}

export const fetchRefunds = async (
    token: string, //  Token maintenant requis
    status?: string | null,
    skip: number = 0,
    limit: number = 50
): Promise<Refund[]> => {
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    queryParams.append('skip', skip.toString());
    queryParams.append('limit', limit.toString());

    const url = `http://localhost:8000/refunds/?${queryParams.toString()}`;
    
    console.log(' Fetching URL:', url);
    
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "accept": "application/json",
                "Authorization": `Bearer ${token}`, //  Token requis selon la doc
            },
            // Supprimé credentials: "include" car on utilise Bearer token
            signal: AbortSignal.timeout(30000)
        });

        console.log(' Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(" Error response:", errorText);
            
            // Gestion spécifique des erreurs d'auth
            if (response.status === 401) {
                throw new Error('Token d\'authentification invalide ou expiré');
            }
            if (response.status === 403) {
                throw new Error('Accès refusé - permissions insuffisantes');
            }
            
            throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
        }

        const data = await response.json();
        console.log(' Success! Data received:', data);
        return data;

    } catch (error) {
        console.error(' Fetch error:', error);

        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            throw new Error('Erreur réseau: Impossible de se connecter au serveur. Le serveur pourrait être en veille.');
        }

        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Timeout: Le serveur met trop de temps à répondre.');
        }

        throw error;
    }
};

// Fonction pour tester si le token fonctionne
export const testAuth = async (token: string): Promise<boolean> => {
    try {
        await fetchRefunds(token, null, 0, 1);
        return true;
    } catch (error) {
        console.error('Auth test failed:', error);
        return false;
    }
};

// Version alternative pour développement (sans auth si nécessaire)
export const fetchRefundsNoAuth = async (
    token: string,
    status?: string | null,
    skip: number = 0,
    limit: number = 50
): Promise<Refund[]> => {
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    queryParams.append('skip', skip.toString());
    queryParams.append('limit', limit.toString());

    const url = `http://localhost:8000/refunds/?${queryParams.toString()}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "accept": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
        throw new Error(`API Error (${response.status}): ${await response.text()}`);
    }

    return await response.json();
};

// Get single refund details
export const fetchRefundDetails = async (token: string, refundId: string): Promise<Refund> => {
    const url = `http://localhost:8000/refunds/${refundId}`;

    console.log(' Fetching refund details URL:', url);

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "accept": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            signal: AbortSignal.timeout(30000)
        });

        console.log(' Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(" Error response:", errorText);

            if (response.status === 401) {
                throw new Error('Token d\'authentification invalide ou expiré');
            }
            if (response.status === 403) {
                throw new Error('Accès refusé - permissions insuffisantes');
            }
            if (response.status === 404) {
                throw new Error('Remboursement non trouvé');
            }

            throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
        }

        const data = await response.json();
        console.log(' Success! Refund details received:', data);
        return data;

    } catch (error) {
        console.error(' Fetch refund details error:', error);

        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            throw new Error('Erreur réseau: Impossible de se connecter au serveur. Le serveur pourrait être en veille.');
        }

        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Timeout: Le serveur met trop de temps à répondre.');
        }

        throw error;
    }
};

// Update refund status and admin comment
export const updateRefund = async (
    token: string,
    refundId: string,
    updateData: { status?: "pending" | "approved" | "rejected" | "processed"; admin_comment?: string }
): Promise<Refund> => {
    const url = `http://localhost:8000/refunds/${refundId}`;

    console.log(' Updating refund URL:', url);
    console.log(' Update data:', updateData);

    try {
        const response = await fetch(url, {
            method: "PATCH",
            headers: {
                "accept": "application/json",
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
            signal: AbortSignal.timeout(30000)
        });

        console.log(' Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(" Error response:", errorText);

            if (response.status === 401) {
                throw new Error('Token d\'authentification invalide ou expiré');
            }
            if (response.status === 403) {
                throw new Error('Accès refusé - permissions insuffisantes');
            }
            if (response.status === 404) {
                throw new Error('Remboursement non trouvé');
            }
            if (response.status === 422) {
                throw new Error('Données de mise à jour invalides');
            }

            throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
        }

        const data = await response.json();
        console.log(' Success! Refund updated:', data);
        return data;

    } catch (error) {
        console.error(' Update refund error:', error);

        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            throw new Error('Erreur réseau: Impossible de se connecter au serveur. Le serveur pourrait être en veille.');
        }

        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Timeout: Le serveur met trop de temps à répondre.');
        }

        throw error;
    }
};

// Get refund statistics summary
export const fetchRefundStats = async (token: string): Promise<any> => {
    const url = `http://localhost:8000/refunds/stats/summary`;

    console.log(' Fetching refund stats URL:', url);

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "accept": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            signal: AbortSignal.timeout(30000)
        });

        console.log(' Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(" Error response:", errorText);

            if (response.status === 401) {
                throw new Error('Token d\'authentification invalide ou expiré');
            }
            if (response.status === 403) {
                throw new Error('Accès refusé - permissions insuffisantes');
            }

            throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
        }

        const data = await response.json();
        console.log(' Success! Refund stats received:', data);
        return data;

    } catch (error) {
        console.error(' Fetch refund stats error:', error);

        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            throw new Error('Erreur réseau: Impossible de se connecter au serveur. Le serveur pourrait être en veille.');
        }

        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Timeout: Le serveur met trop de temps à répondre.');
        }

        throw error;
    }
};

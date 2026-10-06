// import { useState, useEffect } from "react";

// interface CartItem {
//     id: string;
//     user_id: string;
//     session_id: string;
//     created_at: string;
//     updated_at: string;
//     total: number;
// }

// interface Cart {
//     items: CartItem[];
//     id: string;
//     user_id: string;
//     session_id: string;
//     created_at: string;
//     updated_at: string;
//     total: number;
// }

// export function useCart() {
//     const [cart, setCart] = useState<Cart | null>(null);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     // Fonction pour charger le panier depuis l'API
//     const loadCart = async () => {
//         setIsLoading(true);
//         setError(null);

//         try {
//             const response = await fetch('/api/cart', {
//                 credentials: 'include',
//             });

//             const data = await response.json();
//             console.log(" Réponse API panier:", data);

//             if (data.success) {
//                 setCart(data.cart);
//             } else {
//                 setError(data.error || "Erreur lors du chargement du panier");
//             }
//         } catch (err) {
//             console.error(" Erreur chargement panier:", err);
//             setError("Erreur de connexion");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Charger le panier au montage du composant
//     useEffect(() => {
//         loadCart();
//     }, []);

//     return {
//         cart,
//         isLoading,
//         error,
//         loadCart,
//         itemsCount: cart?.items?.length || 0,
//         total: cart?.total || 0
//     };
// }

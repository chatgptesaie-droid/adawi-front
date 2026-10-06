import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import type { Product } from '~/components/boutique/ProductGrid';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  sessionId?: string;
  cartId?: string;
  error?: string;
  isLoading?: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number; size: string; color: string } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'INCREASE_ITEM_COUNT'; payload: { amount: number } }
  | { type: 'DECREASE_ITEM_COUNT'; payload: { amount: number } }
  | { type: 'SET_ITEM_COUNT'; payload: { count: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART'; payload: { items: any[]; total: number; itemCount: number; cartId?: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  refreshCart: () => Promise<void>;
  addToCart: (product: Product, size: string, color: string, quantity: number) => Promise<boolean>;
} | null>(null);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity, size, color } = action.payload;
      const itemId = `${product.id}-${size}-${color}`;

      const existingItemIndex = state.items.findIndex(item => item.id === itemId);

      let newItems: CartItem[];
      if (existingItemIndex >= 0) {
        // Mettre à jour la quantité si l'article existe déjà
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Ajouter un nouvel article
        const newItem: CartItem = {
          id: itemId,
          product,
          quantity,
          selectedSize: size,
          selectedColor: color,
        };
        newItems = [...state.items, newItem];
      }

      const total = newItems.reduce((sum, item) => {
        const price = parseFloat(item.product.price.replace(/[^0-9.]/g, ''));
        return sum + (price * item.quantity);
      }, 0);

      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        items: newItems,
        total,
        itemCount,
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload.id);
      const total = newItems.reduce((sum, item) => {
        const price = parseFloat(item.product.price.replace(/[^0-9.]/g, ''));
        return sum + (price * item.quantity);
      }, 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        items: newItems,
        total,
        itemCount,
      };
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { id } });
      }

      const newItems = state.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      );

      const total = newItems.reduce((sum, item) => {
        const price = parseFloat(item.product.price.replace(/[^0-9.]/g, ''));
        return sum + (price * item.quantity);
      }, 0);

      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        items: newItems,
        total,
        itemCount,
      };
    }

    case 'CLEAR_CART':
      return {
        items: [],
        total: 0,
        itemCount: 0,
      };

    case 'SET_CART':
      return {
        ...state,
        items: action.payload.items,
        total: action.payload.total,
        itemCount: action.payload.itemCount,
        cartId: action.payload.cartId,
        isLoading: false,
        error: undefined,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'INCREASE_ITEM_COUNT':
      return {
        ...state,
        itemCount: state.itemCount + action.payload.amount,
      };

    case 'DECREASE_ITEM_COUNT':
      return {
        ...state,
        itemCount: Math.max(0, state.itemCount - action.payload.amount),
      };

    case 'SET_ITEM_COUNT':
      return {
        ...state,
        itemCount: action.payload.count,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
    isLoading: true,
  });

  const fetchCart = async () => {
    try {
      console.log('CartContext: Starting to fetch cart');
      dispatch({ type: 'SET_LOADING', payload: true });

      // Get session data
      const sessionResponse = await fetch('/api/session', {
        credentials: 'include',
      });

      console.log('CartContext: Session response status:', sessionResponse.status);

      if (!sessionResponse.ok) {
        console.log('CartContext: Session fetch failed');
        dispatch({ type: 'SET_ERROR', payload: 'Not authenticated' });
        return;
      }

      const sessionData = await sessionResponse.json();
      console.log('CartContext: Session data:', sessionData);

      if (!sessionData.session_id) {
        console.log('CartContext: No session ID');
        dispatch({ type: 'SET_ERROR', payload: 'No session ID' });
        return;
      }

      // Fetch cart from local proxy to avoid browser CORS issues
      console.log('CartContext: Fetching cart from local proxy /api/cart');
      const cartResponse = await fetch('/api/cart', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('CartContext: Cart response status:', cartResponse.status);

      if (!cartResponse.ok) {
        console.log('CartContext: Cart fetch failed');
        if (cartResponse.status === 401) {
          dispatch({ type: 'SET_ERROR', payload: 'Not authenticated' });
        } else {
          dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch cart' });
        }
        return;
      }

      const cartData = await cartResponse.json();
      console.log('CartContext: Cart data received:', cartData);

      // Transform items to local format if needed
      const items: CartItem[] = cartData.items?.map((item: any) => ({
        id: item.product_id,
        product: {
          id: item.product_id,
          name: item.name,
          price: item.price.toString(),
          images: item.images || [],
          // Add other required fields with defaults
          description: '',
          category: '',
          stock: item.stock || 0,
          sizes: [],
          colors: [],
          isActive: true,
        },
        quantity: item.quantity,
        selectedSize: item.size,
        selectedColor: item.color,
      })) || [];

      console.log('CartContext: Setting cart with itemCount:', cartData.item_count);

      dispatch({
        type: 'SET_CART',
        payload: {
          items,
          total: cartData.total || 0,
          itemCount: cartData.item_count || 0,
          cartId: cartData.id,
        },
      });
    } catch (error) {
      console.error('CartContext: Error fetching cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Network error' });
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const refreshCart = async () => {
    await fetchCart();
  };

  const addToCart = async (product: Product, size: string, color: string, quantity: number) => {
    try {
      // Get session data first
      const sessionResponse = await fetch('/api/session', { credentials: 'include' });
      if (!sessionResponse.ok) {
        throw new Error('Not authenticated');
      }
      const sessionData = await sessionResponse.json();

      // Add item to cart via local proxy to avoid browser CORS issues
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
          size,
          color,
          quantity,
          session_id: sessionData.session_id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      // Refresh cart to get updated data from server
      await refreshCart();
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };

  return (
    <CartContext.Provider value={{ state, dispatch, refreshCart, addToCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

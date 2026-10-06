import { useCart } from "~/contexts/CartContext";
import { ShoppingCart } from "lucide-react";

export default function CartCounter() {
  const { state } = useCart();
  
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="relative">
      <ShoppingCart className="w-6 h-6" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-adawi-gold text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </div>
  );
}

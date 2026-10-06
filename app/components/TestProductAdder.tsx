import { useState } from "react";
import { useCart } from "~/contexts/CartContext";

export default function TestProductAdder() {
    const { addToCart } = useCart();
    const [isAdding, setIsAdding] = useState(false);

    const testProducts = [
        {
            id: "test-1",
            name: "T-shirt Test",
            price: 25.99,
            images: ["/placeholder-product.png"],
            category: { name: "Vêtements" }
        },
        {
            id: "test-2", 
            name: "Pantalon Test",
            price: 45.50,
            images: ["/placeholder-product.png"],
            category: { name: "Vêtements" }
        },
        {
            id: "test-3",
            name: "Chaussures Test",
            price: 89.99,
            images: ["/placeholder-product.png"],
            category: { name: "Chaussures" }
        }
    ];

    const handleAddProduct = async (product: any) => {
        setIsAdding(true);
        try {
            const success = await addToCart(product, "M", "Bleu", 1);
            if (success) {
                alert(`${product.name} ajouté au panier !`);
            } else {
                alert("Erreur lors de l'ajout");
            }
        } catch (error) {
            alert("Erreur lors de l'ajout");
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Ajouter des produits de test</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {testProducts.map((product) => (
                    <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-adawi-gold font-bold">{product.price} F CFA</p>
                        <button
                            onClick={() => handleAddProduct(product)}
                            disabled={isAdding}
                            className="mt-2 w-full px-3 py-2 bg-adawi-gold text-white rounded hover:bg-adawi-gold/90 transition-colors disabled:opacity-50"
                        >
                            {isAdding ? "Ajout..." : "Ajouter"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

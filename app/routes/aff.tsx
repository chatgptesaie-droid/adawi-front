import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  description: string;
  parent_id: string | null;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category: Category;
}

export default function MesProduits() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("http://localhost:8000/products/");
        if (!res.ok) throw new Error("Erreur API");
        const data = await res.json();

        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error("Réponse inattendue :", data);
        }
      } catch (error) {
        console.error("Erreur lors du fetch :", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {products.length === 0 ? (
        <p>Aucun produit disponible.</p>
      ) : (
        products.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg shadow p-4 flex flex-col"
          >
            {/* Image du produit */}
            {product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-40 object-cover rounded"
              />
            ) : (
              <div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded">
                <span className="text-gray-500">Pas d'image</span>
              </div>
            )}

            {/* Infos produit */}
            <h2 className="text-lg font-bold mt-2">{product.name}</h2>
            <p className="text-sm text-gray-600 flex-grow">
              {product.description}
            </p>
            <p className="text-sm text-gray-500">
              Catégorie : {product.category?.name || "N/A"}
            </p>
            <p className="text-green-600 font-semibold">
              {product.price} CFA
            </p>
            <p className="text-xs text-gray-400">
              Stock : {product.stock}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { useState, useMemo } from "react";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import ProductModal from "~/components/boutique/ProductModal";
import ImageModal from "~/components/ImageModal";
import type { Product } from "~/components/boutique/ProductGrid";
import { readToken } from "~/utils/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Résultats de recherche - Adawi" },
    { name: "description", content: "Résultats de recherche sur le site Adawi" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";

  try {
    // Token optionnel — la recherche est publique
    const token = await readToken(request).catch(() => null);

    const apiUrl = new URL("http://localhost:8000/products/");
    if (query) apiUrl.searchParams.set("search", query);
    apiUrl.searchParams.set("skip", "0");
    apiUrl.searchParams.set("limit", "100");

    const headers: Record<string, string> = { "accept": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }

    const apiProducts = await response.json();

    // Transformer les données API en format Product
    const results: Product[] = apiProducts.map((product: any) => ({
      id: product.id,
      name: product.name,
      price: `${product.price.toLocaleString()} F CFA`,
      priceValue: product.price,
      discounted_price: product.discounted_price,
      discount_amount: product.discount_amount,
      image: product.images && product.images.length > 0 ? product.images[0] : "/placeholder.png",
      hoverImage: product.hover_images && product.hover_images.length > 0 ? product.hover_images[0] : undefined,
      image1: product.hover_images && product.hover_images.length > 1 ? product.hover_images[1] : undefined,
      image2: product.hover_images && product.hover_images.length > 2 ? product.hover_images[2] : undefined,
      date: new Date(product.created_at),
      category: product.category?.name?.toLowerCase() as any || "vedette",
      size: product.sizes && product.sizes.length > 0 ? product.sizes[0].toLowerCase() as any : undefined,
      sizes: product.sizes?.join(",") || "",
      color: product.colors && product.colors.length > 0 ? product.colors[0].toLowerCase() as any : undefined,
      colors: product.colors?.join(",") || "",
      stock: product.stock,
      inStock: product.is_active && product.stock > 0,
    }));

    return { query, results, apiProducts };
  } catch (error) {
    console.error("Erreur lors de la recherche:", error);
    // En cas d'erreur, retourner des résultats vides
    return { query, results: [] };
  }
}

export default function Search() {
  const { query, results, apiProducts } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filtre côté client — se synchronise avec ?q= dans l'URL
  const localQuery = searchParams.get("q") || "";

  const filteredResults = useMemo(() => {
    if (!localQuery.trim()) return results;
    const q = localQuery.toLowerCase();
    return results.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.category?.toLowerCase().includes(q)
    );
  }, [localQuery, results]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // État pour gérer la modale d'image
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageAlt, setSelectedImageAlt] = useState<string>("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Fonction pour vérifier si un produit est nouveau (moins de 15 jours)
  const isNewProduct = (date: Date) => {
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 15;
  };

  // Fonction pour obtenir le niveau de stock
  const getStockLevel = (stock: number | undefined) => {
    if (!stock || stock <= 0) return 'out';
    if (stock <= 3) return 'low';
    return 'available';
  };

  // Fonction pour ouvrir la modale produit
  const handleOpenProductModal = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  // Fonction pour fermer la modale produit
  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
  };

  // Fonction pour ouvrir la modale d'image
  const handleOpenImageModal = (imageUrl: string, imageAlt: string) => {
    setSelectedImage(imageUrl);
    setSelectedImageAlt(imageAlt);
    setIsImageModalOpen(true);
  };

  // Fonction pour fermer la modale d'image
  const handleCloseImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
    setSelectedImageAlt("");
  };

  // CSS personnalisé amélioré pour la grille de résultats de recherche
  const searchResultsStyles = `
    .search-results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      animation: fadeIn 0.5s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .search-result-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      height: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .search-result-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .search-result-image-container {
      position: relative;
      overflow: hidden;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      aspect-ratio: 1;
    }

    .search-result-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      padding: 0.75rem;
    }

    .search-result-card:hover .search-result-image {
      transform: scale(1.05);
    }

    .product-badges {
      position: absolute;
      top: 8px;
      left: 8px;
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .badge-new {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      padding: 3px 6px;
      border-radius: 12px;
      font-size: 9px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
      animation: pulse 2s infinite;
    }

    .badge-out-of-stock {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      padding: 3px 6px;
      border-radius: 12px;
      font-size: 9px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
    }

    .badge-low-stock {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
      padding: 3px 6px;
      border-radius: 12px;
      font-size: 9px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      box-shadow: 0 2px 6px rgba(245, 158, 11, 0.3);
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .product-info {
      padding: 1rem;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .product-category {
      display: inline-flex;
      align-items: center;
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      color: white;
      padding: 3px 8px;
      border-radius: 8px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 6px;
      width: fit-content;
      box-shadow: 0 1px 4px rgba(251, 191, 36, 0.2);
    }

    .product-name {
      font-size: 13px;
      font-weight: 600;
      color: #1f2937;
      line-height: 1.3;
      margin-bottom: 6px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .product-price {
      font-size: 14px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 8px;
    }

    .stock-info {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 8px;
      font-size: 11px;
    }

    .stock-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    .stock-dot.available {
      background: #10b981;
      box-shadow: 0 0 4px rgba(16, 185, 129, 0.4);
    }

    .stock-dot.low {
      background: #f59e0b;
      box-shadow: 0 0 4px rgba(245, 158, 11, 0.4);
    }

    .stock-dot.out {
      background: #ef4444;
      box-shadow: 0 0 4px rgba(239, 68, 68, 0.4);
    }

    .product-actions {
      margin-top: auto;
      display: flex;
      gap: 6px;
    }

    .btn-view-details {
      flex: 1;
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .btn-view-details:hover {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      transform: translateY(-1px);
      box-shadow: 0 3px 8px rgba(251, 191, 36, 0.3);
    }

    .btn-view-image {
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid #e5e7eb;
      padding: 6px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      backdrop-filter: blur(10px);
    }

    .btn-view-image:hover {
      background: white;
      border-color: #fbbf24;
      transform: translateY(-1px);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      animation: fadeIn 0.6s ease-in-out;
    }

    .empty-state-icon {
      width: 80px;
      height: 80px;
      color: #9ca3af;
      margin: 0 auto 2rem;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 1rem;
    }

    .empty-state p {
      color: #6b7280;
      font-size: 1rem;
      max-width: 400px;
      margin: 0 auto;
    }

    /* Responsive Design pour 5-6 produits */
    @media (max-width: 640px) {
      .search-results-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 0.75rem;
      }

      .product-info {
        padding: 0.75rem;
      }

      .product-category {
        font-size: 9px;
        padding: 2px 6px;
      }

      .product-name {
        font-size: 12px;
      }

      .product-price {
        font-size: 13px;
      }

      .btn-view-details {
        padding: 6px 10px;
        font-size: 10px;
      }
    }

    @media (min-width: 641px) and (max-width: 768px) {
      .search-results-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }
    }

    @media (min-width: 769px) and (max-width: 1024px) {
      .search-results-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 1.25rem;
      }
    }

    @media (min-width: 1025px) and (max-width: 1280px) {
      .search-results-grid {
        grid-template-columns: repeat(5, 1fr);
        gap: 1.5rem;
      }
    }

    @media (min-width: 1281px) {
      .search-results-grid {
        grid-template-columns: repeat(6, 1fr);
        gap: 1.5rem;
      }
    }
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <TopBanner />
      <Header />

      {/* Section des résultats */}
      <section className="bg-gradient-to-br from-gray-50 to-white px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          {/* En-tête des résultats */}
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full"></div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Résultats de recherche
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900">{filteredResults.length}</span> produit{filteredResults.length > 1 ? "s" : ""}
                {localQuery && <> pour "<span className="font-semibold text-gray-900">{localQuery}</span>"</>}
              </p>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
            </div>
          </div>

          {/* Styles CSS personnalisés */}
          <style dangerouslySetInnerHTML={{ __html: searchResultsStyles }} />

          {/* Résultats */}
          {filteredResults.length > 0 ? (
              <div className="search-results-grid">
                {filteredResults.map((result, index) => {
                  const stockLevel = getStockLevel(result.stock);
                  const isNew = isNewProduct(result.date);

                  return (
                    <div
                      key={result.id}
                      className="search-result-card"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="search-result-image-container">
                        {/* Badges */}
                        <div className="product-badges">
                          {isNew && (
                            <span className="badge-new">Nouveau</span>
                          )}
                          {stockLevel === 'out' && (
                            <span className="badge-out-of-stock">Épuisé</span>
                          )}
                          {stockLevel === 'low' && (
                            <span className="badge-low-stock">Stock faible</span>
                          )}
                        </div>

                        {/* Image */}
                        <img
                          src={result.image}
                          alt={result.name}
                          className="search-result-image"
                          onClick={() => handleOpenImageModal(result.image, result.name)}
                        />
                      </div>

                      <div className="product-info">
                        <div className="product-category">
                          {result.category}
                        </div>

                        <h3 className="product-name">
                          {result.name}
                        </h3>

                        <div className="product-price">
                          {result.discounted_price && result.discounted_price < result.priceValue ? (
                            <div className="flex items-center gap-2">
                              <span className="text-adawi-gold font-bold">
                                {result.discounted_price.toLocaleString()} F CFA
                              </span>
                              <span className="text-gray-500 line-through text-sm">
                                {result.priceValue.toLocaleString()} F CFA
                              </span>
                            </div>
                          ) : (
                            <span>{result.price}</span>
                          )}
                        </div>

                        {/* Stock info */}
                        <div className="stock-info">
                          <div className={`stock-dot ${stockLevel}`}></div>
                          <span className="text-gray-600">
                            {stockLevel === 'out' ? 'Rupture de stock' :
                             stockLevel === 'low' ? `Stock faible (${result.stock})` :
                             `En stock (${result.stock})`}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="product-actions">
                          <button
                            onClick={() => handleOpenProductModal(result)}
                            className="btn-view-details"
                          >
                            Voir détails
                          </button>
                          <button
                            onClick={() => handleOpenImageModal(result.image, result.name)}
                            className="btn-view-image"
                            title="Voir l'image en grand"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4m-6-4l4-4-4-4m6 4H3"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3>Aucun résultat trouvé</h3>
                <p>
                  Aucun produit ne correspond à "{localQuery}". Essayez avec d'autres mots-clés.
                </p>
              </div>
            )}
        </div>
      </section>

      {/* Modale de produit */}
      <ProductModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={handleCloseProductModal}
        apiProducts={apiProducts}
      />

      {/* Modale d'image */}
      <ImageModal
        imageUrl={selectedImage}
        imageAlt={selectedImageAlt}
        isOpen={isImageModalOpen}
        onClose={handleCloseImageModal}
      />

      <Footer />
    </div>
  );
}

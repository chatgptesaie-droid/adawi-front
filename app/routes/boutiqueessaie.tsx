import { useState, useEffect } from "react";
import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams, useNavigation } from "@remix-run/react";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import ProductGrid, { Product, ProductCategory, ProductSize, ProductColor } from "~/components/boutique/ProductGrid";
import AddToCartModal from "~/components/AddToCartModal";
import SidebarEssaie from "~/components/SidebarEssaie";
import { ToastProvider } from "~/contexts/ToastContext";
import { useToast } from "~/contexts/ToastContext";
import { Search, Filter, Grid, List, RefreshCw, AlertCircle, Package, ShoppingCart, Check, X, SlidersHorizontal } from "lucide-react";
import { readToken } from "~/utils/session.server";

export const meta: MetaFunction = () => {
    return [
        { title: "Boutique Test - Adawi" },
        { name: "description", content: "Découvrez notre collection de produits depuis la base de données." },
    ];
};

// Interface pour les produits de l'API
interface ApiProduct {
    id: string;
    name: string;
    description: string;
    price: number;
    cost_price: number;
    currency: string;
    category_id: string;
    sizes: string[];
    colors: string[];
    stock: number;
    low_stock_threshold: number;
    images: string[];
    hover_images: string[];
    tags: string[];
    seller_id: string;
    created_at: string;
    updated_at: string;
    is_active: boolean;
    category?: {
        id: string;
        name: string;
        description: string;
        parent_id: string;
    };
    profit: number;
    margin_percent: number;
}

// Interface pour AddToCartModal
interface CartProduct {
    id: string;
    name: string;
    price: number;
    currency: string;
    sizes: string[];
    colors: string[];
    images: string[];
    stock: number;
}

interface Category {
    id: string;
    name: string;
    description: string;
    parent_id: string | null;
    children?: string[];
}

export const loader: LoaderFunction = async ({ request }) => {
    try {
        // Vérifier l'authentification
        const token = await readToken(request);
        const isLoggedIn = !!token;

        // Charger les catégories pour les filtres
        const categoriesResponse = await fetch("http://localhost:8000/products/categories/");
        let categories: Category[] = [];

        if (categoriesResponse.ok) {
            categories = await categoriesResponse.json();
        }

        return json({ categories, isLoggedIn });
    } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        return json({ categories: [], isLoggedIn: false });
    }
};

// Composant wrapper qui utilise useToast
function BoutiqueContent({ categories, isLoggedIn }: { categories: Category[], isLoggedIn: boolean }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const { showToast } = useToast();

    // États existants
    const [products, setProducts] = useState<Product[]>([]);
    const [apiProducts, setApiProducts] = useState<ApiProduct[]>([]); // Stocker les produits originaux de l'API
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category_id") || "");
    const [selectedSizes, setSelectedSizes] = useState<string[]>(searchParams.getAll("sizes"));
    const [selectedColors, setSelectedColors] = useState<string[]>(searchParams.getAll("colors"));
    const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
    const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);

    // États pour mobile sidebar
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // États pour AddToCartModal
    const [selectedProductForCart, setSelectedProductForCart] = useState<CartProduct | null>(null);
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [selectedSize, setSelectedSize] = useState<ProductSize | undefined>(undefined);
    const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(undefined);

    // Catégories prédéfinies pour la barre de filtres
    const filterCategories = [
        { id: "vedette", label: "Voir produits en vedette" },
        { id: "nouveaute", label: "Nouveauté" },
        { id: "homme", label: "Homme" },
        { id: "femme", label: "Femme" },
        { id: "enfant", label: "Enfant" },
        { id: "montre", label: "Montre" }
    ];

    // État pour la catégorie active dans la barre de filtres
    const [activeFilterCategory, setActiveFilterCategory] = useState<ProductCategory>("homme");

    // Fonction pour mapper les produits de l'API vers le format ProductGrid
    const mapApiProductToProduct = (apiProduct: ApiProduct): Product => {
        // Déterminer la catégorie basée sur le nom de la catégorie ou des tags
        let category: ProductCategory = "vedette";
        if (apiProduct.category?.name) {
            const categoryName = apiProduct.category.name.toLowerCase();
            if (categoryName.includes("homme") || categoryName.includes("men")) {
                category = "homme";
            } else if (categoryName.includes("femme") || categoryName.includes("women")) {
                category = "femme";
            } else if (categoryName.includes("enfant") || categoryName.includes("kids") || categoryName.includes("children")) {
                category = "enfant";
            } else if (categoryName.includes("montre") || categoryName.includes("watch")) {
                category = "montre";
            }
        }

        return {
            id: apiProduct.id, // Garder l'ID original de l'API (string)
            name: apiProduct.name,
            price: `${apiProduct.price} ${apiProduct.currency.toLowerCase()}`,
            priceValue: apiProduct.price,
            image: apiProduct.images[0] || "/placeholder.jpg",
            hoverImage: apiProduct.hover_images?.[0] || apiProduct.images[1],
            image1: apiProduct.images[1],
            image2: apiProduct.images[2],
            date: new Date(apiProduct.created_at),
            category: category,
            size: apiProduct.sizes[0] as ProductSize,
            sizes: apiProduct.sizes.join(","),
            color: apiProduct.colors[0] as ProductColor,
            colors: apiProduct.colors.join(","),
        };
    };

    // Fonction pour mapper Product vers CartProduct
    const mapProductToCartProduct = (product: Product): CartProduct => {
        // Trouver le produit API original pour obtenir les vraies données
        const apiProduct = apiProducts.find(p => p.id === product.id);

        return {
            id: product.id, // Utiliser l'ID original (string)
            name: product.name,
            price: product.priceValue,
            currency: apiProduct?.currency || "F CFA",
            sizes: product.sizes ? product.sizes.split(",").map(s => s.trim()).filter(Boolean) : [],
            colors: product.colors ? product.colors.split(",").map(c => c.trim()).filter(Boolean) : [],
            images: [product.image, product.hoverImage, product.image1, product.image2].filter(Boolean) as string[],
            stock: apiProduct?.stock || 10
        };
    };

    // Fonction pour filtrer par catégorie principale
    const handleFilterCategoryChange = (categoryId: string) => {
        setActiveFilterCategory(categoryId as ProductCategory);

        // Si c'est une catégorie spéciale (vedette, nouveauté)
        if (categoryId === "vedette") {
            setSelectedCategory("");
        } else if (categoryId === "nouveaute") {
            setSelectedCategory("");
            // La logique pour les nouveautés sera appliquée lors du filtrage
        } else {
            // Trouver la catégorie correspondante dans les catégories de l'API
            const matchingCategory = categories.find(cat => 
                cat.name.toLowerCase().includes(categoryId.toLowerCase())
            );

            if (matchingCategory) {
                setSelectedCategory(matchingCategory.id);
            }
        }

        setCurrentPage(1);
    };

    // Filtrer les produits en fonction de la catégorie active
    const filterProductsByCategory = (products: Product[]) => {
        if (activeFilterCategory === "vedette") {
            return products;
        } else if (activeFilterCategory === "nouveaute") {
            const now = new Date();
            return products.filter(product => {
                const createdDate = new Date(product.date);
                const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
                return daysDiff <= 30; // Produits des 30 derniers jours
            });
        } else {
            return products.filter(product => {
                if (!product.category) return false;
                return product.category === activeFilterCategory;
            });
        }
    };

    // Fonction pour charger les produits
    const loadProducts = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Construire les paramètres de requête
            const params = new URLSearchParams();

            const skip = (currentPage - 1) * itemsPerPage;
            params.set("skip", skip.toString());
            params.set("limit", itemsPerPage.toString());

            if (searchTerm) params.set("search", searchTerm);
            if (selectedCategory) params.set("category_id", selectedCategory);
            if (minPrice) params.set("min_price", minPrice);
            if (maxPrice) params.set("max_price", maxPrice);

            selectedSizes.forEach(size => params.append("sizes", size));
            selectedColors.forEach(color => params.append("colors", color));

            const response = await fetch(`/api/products?${params.toString()}`);

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const responseData = await response.json();

            // Gérer différents formats de réponse
            let fetchedApiProducts: ApiProduct[];

            if (Array.isArray(responseData)) {
                fetchedApiProducts = responseData;
            } else if (responseData && Array.isArray(responseData.products)) {
                fetchedApiProducts = responseData.products;
            } else if (responseData && Array.isArray(responseData.data)) {
                fetchedApiProducts = responseData.data;
            } else {
                console.error('Format de réponse inattendu:', responseData);
                throw new Error('Format de réponse API inattendu');
            }

            // Filtrer seulement les produits actifs
            const activeProducts = fetchedApiProducts.filter(product => product.is_active);

            // Stocker les produits API originaux
            setApiProducts(activeProducts);

            // Mapper les produits vers le format attendu par ProductGrid
            const mappedProducts = activeProducts.map(mapApiProductToProduct);

            setProducts(mappedProducts);
            setTotal(mappedProducts.length);

            console.log(` ${mappedProducts.length} produits chargés`);
        } catch (err) {
            console.error("Erreur:", err);
            setError(err instanceof Error ? err.message : "Erreur de connexion au serveur");

            // Fallback vers les données statiques en cas d'erreur
            const fallbackProducts = [
                {
                    id: "1",
                    name: "Polo vert",
                    price: "10000 F CFA",
                    priceValue: 10000,
                    image: "/polo_homme.jpg",
                    hoverImage: "/6.png",
                    image1: "/8.png",
                    image2: "/9.png",
                    date: new Date(2023, 5, 15),
                    category: "homme" as ProductCategory,
                    size: "xxl" as ProductSize,
                    sizes: "xxl,xl,l,m,s",
                    color: "rouge" as ProductColor,
                    colors: "rouge,vert,noir"
                },
                {
                    id: "2",
                    name: "Robe élégante",
                    price: "15000 F CFA",
                    priceValue: 15000,
                    image: "/robe_femme.jpg",
                    hoverImage: "/7.png",
                    image1: "/10.png",
                    image2: "/11.png",
                    date: new Date(2023, 6, 10),
                    category: "femme" as ProductCategory,
                    size: "m" as ProductSize,
                    sizes: "xl,l,m,s",
                    color: "noir" as ProductColor,
                    colors: "noir,blanc,rouge"
                },
                {
                    id: "3",
                    name: "T-shirt enfant",
                    price: "5000 F CFA",
                    priceValue: 5000,
                    image: "/tshirt_enfant.jpg",
                    hoverImage: "/12.png",
                    image1: "/13.png",
                    image2: "/14.png",
                    date: new Date(2023, 7, 5),
                    category: "enfant" as ProductCategory,
                    size: "s" as ProductSize,
                    sizes: "l,m,s",
                    color: "blanc" as ProductColor,
                    colors: "blanc,noir,rouge"
                }
            ];
            setProducts(fallbackProducts);
        } finally {
            setIsLoading(false);
        }
    };

    // Fonction pour ajouter au panier via l'API
    const handleAddToCart = async (productId: string, quantity: number, size: string, color: string) => {
        setIsAddingToCart(true);

        try {
            // Trouver le produit pour obtenir les détails
            const product = products.find(p => p.id === productId);
            if (!product) {
                throw new Error('Produit non trouvé');
            }

            // Préparer les données pour l'API
            const cartData = {
                product_id: productId, // Utiliser l'ID original de l'API
                quantity: quantity,
                size: size || "",
                color: color || "",
                images: [product.image].filter(Boolean),
                price: product.priceValue,
                name: product.name
            };

            console.log('Données envoyées à l\'API:', cartData);

            // Appel à l'API avec credentials pour utiliser les cookies HTTP-only
            const response = await fetch('/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important pour les cookies HTTP-only
                body: JSON.stringify(cartData)
            });

            // Log de la réponse brute pour le débogage
            const responseText = await response.text();
            console.log('Réponse brute de l\'API:', responseText);

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${responseText}`);
            }

            const result = JSON.parse(responseText);
            console.log('Réponse parsée de l\'API:', result);

            showToast(`${quantity} ${product.name} ajouté(e)s au panier `, "success");

            // Optionnel : déclencher un événement pour mettre à jour le compteur du panier
            window.dispatchEvent(new CustomEvent('cartUpdated', {
                detail: {
                    total: result.total || 0,
                    itemCount: result.items?.length || 0
                }
            }));

            // Fermer le modal
            setIsCartModalOpen(false);
        } catch (error) {
            console.error('Erreur lors de l\'ajout au panier:', error);
            showToast(
                error instanceof Error 
                    ? `Erreur: ${error.message}` 
                    : 'Erreur lors de l\'ajout au panier',
                "error"
            );
        } finally {
            setIsAddingToCart(false);
        }
    };

    // Charger les produits au montage et quand les filtres changent
    useEffect(() => {
        loadProducts();
    }, [currentPage, searchTerm, selectedCategory, selectedSizes, selectedColors, minPrice, maxPrice]);

    // Mettre à jour l'URL avec les paramètres de filtrage
    useEffect(() => {
        const params = new URLSearchParams();

        if (searchTerm) params.set("search", searchTerm);
        if (selectedCategory) params.set("category_id", selectedCategory);
        if (minPrice) params.set("min_price", minPrice);
        if (maxPrice) params.set("max_price", maxPrice);

        selectedSizes.forEach(size => params.append("sizes", size));
        selectedColors.forEach(color => params.append("colors", color));

        setSearchParams(params, { replace: true });
    }, [searchTerm, selectedCategory, selectedSizes, selectedColors, minPrice, maxPrice, setSearchParams]);

    // Fonctions de gestion des filtres
    const handleSizeToggle = (size: string) => {
        setSelectedSizes(prev => 
            prev.includes(size) 
                ? prev.filter(s => s !== size)
                : [...prev, size]
        );
        setCurrentPage(1);
    };

    const handleColorToggle = (color: string) => {
        setSelectedColors(prev => 
            prev.includes(color) 
                ? prev.filter(c => c !== color)
                : [...prev, color]
        );
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCategory("");
        setSelectedSizes([]);
        setSelectedColors([]);
        setMinPrice("");
        setMaxPrice("");
        setCurrentPage(1);
    };

    // Handlers pour le sidebar
    const handleMinPriceChange = (value: string) => {
        setMinPrice(value);
        setCurrentPage(1);
    };

    const handleMaxPriceChange = (value: string) => {
        setMaxPrice(value);
        setCurrentPage(1);
    };

    // Handlers pour ProductGrid et AddToCartModal
    const handleProductClick = (product: Product) => {
        // Convertir Product vers CartProduct pour AddToCartModal
        const cartProduct = mapProductToCartProduct(product);
        setSelectedProductForCart(cartProduct);
        setIsCartModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsCartModalOpen(false);
        setSelectedProductForCart(null);
    };

    const handleSizeChange = (size: ProductSize | undefined) => {
        setSelectedSize(size);
    };

    const handleColorChange = (color: ProductColor | undefined) => {
        setSelectedColor(color);
    };

    // Filtrer les produits pour ProductGrid
    const filteredProducts = filterProductsByCategory(products);

    return (
        <>
            <TopBanner />
            <Header />

            <main className="max-w-7xl mx-auto px-4 py-6">
                {/* Barre de filtres catégories horizontale */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {filterCategories.map(category => (
                        <button
                            key={category.id}
                            onClick={() => handleFilterCategoryChange(category.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${ 
                                activeFilterCategory === category.id
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>

                {/* Titre de la catégorie active */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {filterCategories.find(c => c.id === activeFilterCategory)?.label || "Homme"}
                    </h1>
                </div>

                {/* Layout principal */}
                <div className="flex gap-6">
                    {/* Sidebar filtres - Desktop */}
                    <div className="hidden md:block flex-shrink-0">
                        <SidebarEssaie
                            activeFilterCategory={activeFilterCategory}
                            onFilterCategoryChange={handleFilterCategoryChange}
                            minPrice={minPrice}
                            maxPrice={maxPrice}
                            onMinPriceChange={handleMinPriceChange}
                            onMaxPriceChange={handleMaxPriceChange}
                            selectedSizes={selectedSizes}
                            selectedColors={selectedColors}
                            onSizeToggle={handleSizeToggle}
                            onColorToggle={handleColorToggle}
                        />
                    </div>

                    {/* Contenu principal */}
                    <div className="flex-1">
                        {error ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-red-800 mb-2">Erreur de chargement</h3>
                                <p className="text-red-600 mb-4">{error}</p>
                                <button
                                    onClick={loadProducts}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Réessayer
                                </button>
                            </div>
                        ) : isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-3 text-gray-600">Chargement des produits...</span>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-12">
                                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
                                <p className="text-gray-600 mb-4">
                                    Essayez de modifier vos critères de recherche ou vos filtres.
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                                >
                                    Effacer les filtres
                                </button>
                            </div>
                        ) : (
                            <div>
                                {/* Utilisation de ProductGrid */}
                                <ProductGrid
                                    products={filteredProducts}
                                    selectedSize={selectedSize}
                                    selectedColor={selectedColor}
                                    onProductClick={handleProductClick}
                                />

                                {/* Pagination */}
                                {filteredProducts.length > 0 && total > itemsPerPage && (
                                    <div className="flex items-center justify-center mt-8 space-x-4">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Précédent
                                        </button>
                                        <span className="text-gray-600">
                                            Page {currentPage} sur {Math.ceil(total / itemsPerPage)}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(prev => prev + 1)}
                                            disabled={currentPage >= Math.ceil(total / itemsPerPage)}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Suivant
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar mobile */}
                {isMobileSidebarOpen && (
                    <div className="fixed inset-0 z-50 md:hidden">
                        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileSidebarOpen(false)} />
                        <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl">
                            <SidebarEssaie
                                isMobile={true}
                                onClose={() => setIsMobileSidebarOpen(false)}
                                activeFilterCategory={activeFilterCategory}
                                onFilterCategoryChange={handleFilterCategoryChange}
                                minPrice={minPrice}
                                maxPrice={maxPrice}
                                onMinPriceChange={handleMinPriceChange}
                                onMaxPriceChange={handleMaxPriceChange}
                                selectedSizes={selectedSizes}
                                selectedColors={selectedColors}
                                onSizeToggle={handleSizeToggle}
                                onColorToggle={handleColorToggle}
                            />
                        </div>
                    </div>
                )}

                {/* Bouton filtres mobile */}
                <button
                    onClick={() => setIsMobileSidebarOpen(true)}
                    className="md:hidden fixed bottom-4 right-4 bg-orange-500 text-white p-3 rounded-full shadow-lg hover:bg-orange-600 transition-colors z-40"
                >
                    <SlidersHorizontal className="w-6 h-6" />
                </button>
            </main>

            {/* Modal d'ajout au panier */}
            <AddToCartModal
                product={selectedProductForCart}
                isOpen={isCartModalOpen}
                onClose={handleCloseModal}
                onAddToCart={handleAddToCart}
                isAdding={isAddingToCart}
            />

            <Footer />
        </>
    );
}

export default function BoutiqueEssaie() {
    const { categories, isLoggedIn } = useLoaderData<{ categories: Category[], isLoggedIn: boolean }>();

    return (
        <div className="min-h-screen bg-gray-50">
            <ToastProvider>
                <BoutiqueContent categories={categories} isLoggedIn={isLoggedIn} />
            </ToastProvider>
        </div>
    );
}

import { useState, useEffect, useMemo } from "react";
import type { MetaFunction } from "@remix-run/node";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import FilterBar from "~/components/boutique/FilterBar";
import SidebarFilters from "~/components/boutique/SidebarFilters";
import ProductGrid, { Product, ProductCategory, ProductSize, ProductColor } from "~/components/boutique/ProductGrid";
import SortButton from "~/components/boutique/SortButton";
import ProductModal from "~/components/boutique/ProductModal";
import Pagination from "~/components/boutique/Pagination";
import { Outlet } from "@remix-run/react";
import { ToastProvider } from "~/contexts/ToastContext";
import { getUserProfile } from "~/utils/auth.server";

export const meta: MetaFunction = () => {
    return [
        { title: "Boutique - Adawi" },
        { name: "description", content: "Découvrez notre collection de vêtements élégants pour homme, femme et enfant." },
    ];
};

type SortOption = "featured" | "newest" | "price-low" | "price-high";

// Interface pour les produits de l'API
interface ApiProduct {
    id: string;
    name: string;
    description: string;
    price: number;
    discounted_price?: number | null;
    discount_amount?: number | null;
    cost_price?: number;
    currency: string;
    category_id: string;
    sizes: string[];
    colors: string[];
    stock: number;
    low_stock_threshold?: number;
    images: string[];
    hover_images?: string[];
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
    profit?: number;
    margin_percent?: number;
}

export default function Boutique() {
    const [activeCategory, setActiveCategory] = useState<ProductCategory>("vedette");
    const [selectedSize, setSelectedSize] = useState<ProductSize | undefined>(undefined);
    const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(undefined);
    const [sortOption, setSortOption] = useState<SortOption>("featured");

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // États pour l'API
    const [products, setProducts] = useState<Product[]>([]);
    const [apiProducts, setApiProducts] = useState<ApiProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // États pour la pagination
    const [currentPage, setCurrentPage] = useState(1);
    const PRODUCTS_PER_PAGE = 50;

    // Fonction pour normaliser les URLs d'images
    const normalizeImageUrl = (imagePath: string | undefined): string => {
        if (!imagePath) return "/placeholder.jpg";

        // Si l'URL est déjà absolue (commence par http ou https), l'utiliser telle quelle
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }

        // Sinon, construire l'URL complète en évitant les doubles slashes
        const backendUrl = "http://localhost:8000";
        const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
        return `${backendUrl}/${cleanPath}`;
    };

    // Fonction pour mapper les produits de l'API vers le format attendu
    const mapApiProductToProduct = (apiProduct: ApiProduct): Product => {
        let category: ProductCategory = "vedette";
        if (apiProduct.category?.name) {
            const categoryName = apiProduct.category.name.toLowerCase();
            if (categoryName.includes("homme") || categoryName.includes("men")) {
                category = "homme";
            } else if (categoryName.includes("femme") || categoryName.includes("women")) {
                category = "femme";
            } else if (categoryName.includes("enfant") || categoryName.includes("kids") || categoryName.includes("children")) {
                category = "enfant";
            } else if (categoryName.includes("couple") || categoryName.includes("couples")) {
                category = "couple";
            }
        }

        return {
            id: apiProduct.id, // Garder l'ID original (string)
            name: apiProduct.name,
            price: `${apiProduct.price} ${apiProduct.currency.toLowerCase()}`,
            priceValue: apiProduct.price,
            discounted_price: apiProduct.discounted_price,
            discount_amount: apiProduct.discount_amount,
            image: normalizeImageUrl(apiProduct.images[0]),
            hoverImage: normalizeImageUrl(apiProduct.hover_images?.[0] || apiProduct.images[1]),
            image1: normalizeImageUrl(apiProduct.hover_images?.[1] || apiProduct.images[1]),
            image2: normalizeImageUrl(apiProduct.hover_images?.[2] || apiProduct.images[2]),
            date: new Date(apiProduct.created_at),
            category: category,
            size: apiProduct.sizes.length > 0 ? apiProduct.sizes[0] as ProductSize : undefined,
            sizes: apiProduct.sizes.join(","),
            color: apiProduct.colors.length > 0 ? apiProduct.colors[0] as ProductColor : undefined,
            colors: apiProduct.colors.join(","),
            stock: apiProduct.stock, // Ajout de l'information de stock
            inStock: apiProduct.stock > 0, // Indicateur si le produit est en stock
        };
    };

    // Fonction pour récupérer les produits depuis l'API
    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const params = new URLSearchParams();
            params.append('limit', '100');

            const response = await fetch(`/api/products?${params.toString()}`);
            if (!response.ok) throw new Error(`Erreur ${response.status}: ${response.statusText}`);

            const responseData = await response.json();
            console.log(" API Response:", responseData); // Debug log
            let apiProducts: ApiProduct[];

            if (Array.isArray(responseData)) {
                apiProducts = responseData;
            } else if (responseData && Array.isArray(responseData.products)) {
                apiProducts = responseData.products;
            } else if (responseData && Array.isArray(responseData.data)) {
                apiProducts = responseData.data;
            } else {
                throw new Error('Format de réponse API inattendu');
            }

            console.log(" API Products:", apiProducts); // Debug log

            const activeProducts = apiProducts.filter(product => product.is_active);
            setApiProducts(activeProducts); // Stocker les produits API originaux
            setProducts(activeProducts.map(mapApiProductToProduct));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
            setProducts([
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
                    category: "homme",
                    size: "xxl",
                    sizes: "s,m,l,xl,xxl",
                    color: "rouge",
                    colors: "rouge,vert,noir",
                    stock: 10,
                    inStock: true
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
                    category: "femme",
                    size: "m",
                    sizes: "s,m,l,xl",
                    color: "noir",
                    colors: "noir,blanc,rouge",
                    stock: 0,
                    inStock: false
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
                    category: "enfant",
                    size: "s",
                    sizes: "xs,s,m",
                    color: "blanc",
                    colors: "blanc,noir,vert",
                    stock: 5,
                    inStock: true
                },
                {
                    id: "4",
                    name: "T-shirt COUPLE",
                    price: "5000 F CFA",
                    priceValue: 5000,
                    image: "/tshirt_enfant.jpg",
                    hoverImage: "/12.png",
                    image1: "/13.png",
                    image2: "/14.png",
                    date: new Date(2023, 7, 5),
                    category: "couple",
                    size: "s",
                    sizes: "xs,s,m",
                    color: "blanc",
                    colors: "blanc,noir,vert",
                    stock: 5,
                    inStock: true
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    const allProducts = [...products];
    const filteredByCategory = allProducts.filter(product => {
        if (activeCategory === "vedette") return true;
        if (activeCategory === "nouveaute") {
            const today = new Date();
            const productDate = new Date(product.date);
            const daysDiff = Math.floor((today.getTime() - productDate.getTime()) / (1000 * 60 * 60 * 24));
            return daysDiff <= 15;
        }
        return product.category === activeCategory;
    });

    // Filtrage par taille et couleur côté client
    const filteredProducts = filteredByCategory.filter(product => {
        console.log(" Filtering product:", product.name, {
            selectedSize: selectedSize,
            productSize: product.size,
            productSizes: product.sizes,
            selectedColor: selectedColor,
            productColor: product.color,
            productColors: product.colors
        });

        const sizeMatch = !selectedSize ||
                          (product.size && product.size.toLowerCase() === selectedSize?.toLowerCase()) ||
                          (product.sizes && product.sizes.length > 0 && product.sizes.split(',').some(s => 
                              s.trim().toLowerCase() === selectedSize?.toLowerCase()
                          ));

        const colorMatch = !selectedColor ||
                           (product.color && product.color.toLowerCase() === selectedColor?.toLowerCase()) ||
                           (product.colors && product.colors.length > 0 && product.colors.split(',').some(c => 
                               c.trim().toLowerCase() === selectedColor?.toLowerCase()
                           ));

        console.log(" Filter result for", product.name, ":", { sizeMatch, colorMatch, final: sizeMatch && colorMatch });

        return sizeMatch && colorMatch;
    });

    const sortProducts = (products: Product[], option: SortOption) => {
        const sortedProducts = [...products];
        switch (option) {
            case "newest": return sortedProducts.sort((a, b) => b.date.getTime() - a.date.getTime());
            case "price-low": return sortedProducts.sort((a, b) => a.priceValue - b.priceValue);
            case "price-high": return sortedProducts.sort((a, b) => b.priceValue - a.priceValue);
            case "featured":
            default: return sortedProducts;
        }
    };

    const sortedProducts = sortProducts(filteredProducts, sortOption);

    // Calcul des produits paginés
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
        const endIndex = startIndex + PRODUCTS_PER_PAGE;
        return sortedProducts.slice(startIndex, endIndex);
    }, [sortedProducts, currentPage]);

    // Calcul du nombre total de pages
    const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);

    // Réinitialiser la page courante quand les filtres changent
    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory, selectedSize, selectedColor, sortOption]);

    const handleCategoryChange = (category: ProductCategory) => {
        setActiveCategory(category);
        setSelectedSize(undefined);
        setSelectedColor(undefined);
    };

    const handleSizeChange = (size: ProductSize | undefined) => setSelectedSize(size);
    const handleColorChange = (color: ProductColor | undefined) => setSelectedColor(color);
    const handleSortChange = (option: SortOption) => setSortOption(option);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // Scroll vers le haut de la grille des produits
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };
    const handleCloseModal = () => setIsModalOpen(false);

    return (
        <div className="min-h-screen bg-white">
            <ToastProvider>
                <TopBanner />
                <Header />
                <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
                    <div className="flex justify-center mb-4 sm:mb-6 overflow-x-auto">
                        <FilterBar activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />
                    </div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black text-center mb-6 sm:mb-8 px-2">
                        {activeCategory === "vedette"
                            ? "Tout"
                            : activeCategory === "nouveaute"
                                ? "Nouveautés"
                                : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
                    </h1>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
                            <p>Erreur lors du chargement des produits: {error}</p>
                            <button
                                onClick={fetchProducts}
                                className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                            >
                                Réessayer
                            </button>
                        </div>
                    )}
                    {isLoading && (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-adawi-gold"></div>
                            <span className="ml-3 text-gray-600">Chargement des produits...</span>
                        </div>
                    )}
                    {!isLoading && (
                        <div className="flex flex-col md:flex-row gap-4 lg:gap-6">
                            <div className="w-full md:w-1/3 lg:w-1/4 xl:w-1/5 md:min-w-[220px] flex-shrink-0 md:sticky md:top-4 md:self-start">
                                <div className="mb-4">
                                    <SortButton onSort={handleSortChange} currentSort={sortOption} />
                                </div>
                                <SidebarFilters
                                    activeCategory={activeCategory}
                                    selectedSize={selectedSize}
                                    selectedColor={selectedColor}
                                    onCategoryChange={handleCategoryChange}
                                    onSizeChange={handleSizeChange}
                                    onColorChange={handleColorChange}
                                />
                            </div>
                            <div className="w-full md:w-2/3 lg:w-3/4 xl:w-4/5">
                                {sortedProducts.length === 0 && !isLoading ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500 text-lg">Aucun produit trouvé pour cette sélection.</p>
                                    </div>
                                ) : (
                                    <>
                                        <ProductGrid
                                            products={paginatedProducts}
                                            selectedSize={selectedSize}
                                            selectedColor={selectedColor}
                                            onProductClick={handleProductClick}
                                        />
                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="mt-8">
                                                <Pagination
                                                    currentPage={currentPage}
                                                    totalPages={totalPages}
                                                    onPageChange={handlePageChange}
                                                />
                                            </div>
                                        )}
                                        {/* Informations sur la pagination */}
                                        <div className="mt-4 text-center text-sm text-gray-600">
                                            <p>
                                                Affichage de {Math.min((currentPage - 1) * PRODUCTS_PER_PAGE + 1, sortedProducts.length)} à {Math.min(currentPage * PRODUCTS_PER_PAGE, sortedProducts.length)} sur {sortedProducts.length} produits
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </main>
                {/* Modal produit - on passe les produits API originaux */}
                <ProductModal
                    product={selectedProduct}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    apiProducts={apiProducts}
                />
                <Outlet />
                <Footer />
            </ToastProvider>
        </div>
    );
}

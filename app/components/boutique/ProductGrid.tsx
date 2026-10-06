import React from "react";
import { Link } from "@remix-run/react";
import { useState } from "react";

// Types d'attributs pour les produits
export type ProductSize = "xxl" | "xl" | "l" | "m" | "s" | "xs" | "unique";
export type ProductColor = "blanc" | "noir" | "rouge" | "vert" | "marron";
export type ProductCategory = "vedette" | "nouveaute" | "homme" | "femme" | "enfant" | "couple";

// Interface complète pour un produit avec attributs
export interface Product {
  id: string;
  name: string;
  price: string;
  priceValue: number;
  discounted_price?: number | null;
  discount_amount?: number | null;
  image: string;
  hoverImage?: string; // Image qui apparaît au survol
  image1?: string;     // Nouvelle image supplémentaire 1
  image2?: string;     // Nouvelle image supplémentaire 2
  date: Date;
  category: ProductCategory;
  size?: ProductSize;  // Ancien format (gardé pour compatibilité)
  sizes?: string;      // Nouveau format: "s,m,l,xl,xxl"
  color?: ProductColor; // Ancien format (gardé pour compatibilité)
  colors?: string;     // Nouveau format: "rouge,marron,noir"
  stock?: number;      // Quantité en stock
  inStock?: boolean;   // Indicateur si le produit est en stock
}

interface ProductGridProps {
  products: Product[];
  selectedSize?: ProductSize;
  selectedColor?: ProductColor;
  onProductClick?: (product: Product) => void; // Fonction pour gérer le clic
}

const ProductGrid = ({ products, selectedSize, selectedColor, onProductClick }: ProductGridProps) => {
  // Fonction pour obtenir la couleur de fond basée sur la couleur du produit
  const getColorBadgeStyle = (color: string) => {
    const colorMap: Record<string, string> = {
      blanc: "bg-gray-100 text-gray-800",
      noir: "bg-gray-900 text-white",
      rouge: "bg-red-500 text-white",
      vert: "bg-green-500 text-white",
      marron: "bg-amber-700 text-white"
    };
    return colorMap[color] || "bg-gray-100 text-gray-800";
  };

  function isNewProduct(productDate: Date | string): boolean {
    const today = new Date();
    const date = new Date(productDate);
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 15;
  }

  // CSS personnalisé pour les styles complexes
  const customStyles = `\n    .product-grid-custom {\n      display: grid;\n      gap: 0.75rem;\n      grid-template-columns: repeat(2, 1fr);\n    }\n\n    .product-card-custom {\n      transition: all 0.3s ease;\n    }\n\n    .product-card-custom:hover {\n      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);\n    }\n\n    .product-image-hover-custom {\n      opacity: 0;\n      transition: opacity 0.3s ease;\n    }\n\n    .product-card-custom:hover .product-image-main-custom {\n      opacity: 0;\n    }\n\n    .product-card-custom:hover .product-image-hover-custom {\n      opacity: 1;\n    }\n\n    @media (min-width: 640px) {\n      .product-grid-custom {\n        grid-template-columns: repeat(2, 1fr);\n        gap: 1rem;\n      }\n    }\n\n    @media (min-width: 768px) {\n      .product-grid-custom {\n        grid-template-columns: repeat(3, 1fr);\n        gap: 1.25rem;\n      }\n    }\n\n    @media (min-width: 1024px) {\n      .product-grid-custom {\n        grid-template-columns: repeat(4, 1fr);\n      }\n    }\n\n    @media (min-width: 1280px) {\n      .product-grid-custom {\n        grid-template-columns: repeat(5, 1fr);\n      }\n    }\n\n    @media (max-width: 480px) {\n      .product-grid-custom {\n        gap: 0.5rem;\n      }\n    }\n  `;

  // Si aucun produit ne correspond aux filtres
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-lg shadow-sm">
        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xl font-medium text-adawi-brown mb-2">Aucun produit trouvé</h3>
        <p className="text-gray-600 text-center max-w-md">
          Aucun produit ne correspond à votre sélection. Veuillez modifier vos filtres ou essayer une autre catégorie.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Styles CSS personnalisés */}
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />

      <div className="product-grid-custom">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => onProductClick?.(product)}
            className="product-card-custom group flex flex-col bg-white overflow-hidden rounded-lg cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onProductClick?.(product);
              }
            }}
            aria-label={`Voir les détails de ${product.name}`}
          >
            {/* Image du produit avec effet de survol */}
            <div className="relative w-full overflow-hidden mx-1 my-1.5 sm:mx-3 sm:my-2 xl:mx-2 xl:my-3 rounded">
              {/* LIGNES EN HAUT - masquées sur mobile */}
              <div className="hidden sm:flex absolute top-2 left-1/2 transform -translate-x-1/2 space-x-2 z-10">
                <span className="w-6 h-0.5 bg-gray-300 rounded-full"></span>
                <span className="w-6 h-0.5 bg-gray-300 rounded-full"></span>
                <span className="w-6 h-0.5 bg-gray-300 rounded-full"></span>
              </div>

              {/* Conteneur d'image avec aspect ratio fixe */}
              <div className="w-full aspect-square sm:aspect-[4/5] md:aspect-[3/4]">
                {/* IMAGE PRINCIPALE */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-image-main-custom w-full h-full object-contain sm:object-cover transition-opacity duration-300 p-2 sm:p-0"
                />

                {/* IMAGE DE SURVOL */}
                {product.hoverImage && (
                  <img
                    src={product.hoverImage}
                    alt={`${product.name} - vue alternative`}
                    className="product-image-hover-custom absolute inset-0 w-full h-full object-contain sm:object-cover p-2 sm:p-0"
                  />
                )}
              </div>

              {/* Badge "Nouveau" */}
              {isNewProduct(product.date) && (
                <span className="absolute bottom-2 right-2 z-20 bg-adawi-gold-light text-red-500 text-[10px] sm:text-xs font-semibold px-2 py-1 rounded shadow-md uppercase">
                  NEW
                </span>
              )}
            </div>

            {/* Informations du produit - optimisées pour mobile */}
            <div className="px-2 pb-3 sm:px-4 sm:pb-4 flex-1 flex flex-col items-center text-center">
              <h3 className="text-xs sm:text-sm font-medium text-black mb-1 transition-colors duration-300 line-clamp-2 leading-tight">
                {product.name}
              </h3>
              <div className="flex items-center space-x-2">
                {product.discounted_price && product.discounted_price < product.priceValue ? (
                  <>
                    <p className="text-sm sm:text-base font-bold text-red-600">
                      {product.discounted_price.toLocaleString()} F CFA
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 line-through">
                      {product.priceValue.toLocaleString()} F CFA
                    </p>
                  </>
                ) : (
                  <p className="text-sm sm:text-base font-bold text-black">
                    {product.price}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
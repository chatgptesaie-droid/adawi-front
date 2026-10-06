import { json, type LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
    try {
        const url = new URL(request.url);

        // Récupérer les paramètres de filtrage depuis l'URL
        const skip = url.searchParams.get("skip") || "0";
        const limit = url.searchParams.get("limit") || "50";
        const category_id = url.searchParams.get("category_id");
        const min_price = url.searchParams.get("min_price");
        const max_price = url.searchParams.get("max_price");
        const sizes = url.searchParams.getAll("sizes");
        const colors = url.searchParams.getAll("colors");
        const search = url.searchParams.get("search");
        const name = url.searchParams.get("name");

        // Construire l'URL de l'API backend avec les paramètres
        const apiUrl = new URL("http://localhost:8000/products/");
        
        apiUrl.searchParams.set("skip", skip);
        apiUrl.searchParams.set("limit", limit);
        
        if (category_id) apiUrl.searchParams.set("category_id", category_id);
        if (min_price) apiUrl.searchParams.set("min_price", min_price);
        if (max_price) apiUrl.searchParams.set("max_price", max_price);
        if (search) apiUrl.searchParams.set("search", search);
        if (name) apiUrl.searchParams.set("name", name);
        
        // Ajouter les tailles (array)
        sizes.forEach(size => {
            apiUrl.searchParams.append("sizes", size);
        });
        
        // Ajouter les couleurs (array)
        colors.forEach(color => {
            apiUrl.searchParams.append("colors", color);
        });

        console.log(" Appel API produits:", apiUrl.toString());

        // Appeler l'API backend (pas besoin d'authentification car c'est public)
        const response = await fetch(apiUrl.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(" Erreur API produits:", response.status, errorData);
            
            return json({ 
                success: false, 
                error: errorData.detail || `Erreur ${response.status}`,
                products: []
            }, { status: response.status });
        }

        const products = await response.json();
        
        console.log(" Produits récupérés:", products.length || 0);
        
        return json({ 
            success: true, 
            products: products || [],
            total: products.length || 0
        });

    } catch (error) {
        console.error(" Erreur lors de la récupération des produits:", error);
        return json({ 
            success: false, 
            error: "Erreur de connexion au serveur",
            products: []
        }, { status: 500 });
    }
};

import { useState, useEffect } from "react";
import type { MetaFunction } from "@remix-run/node";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import Newsletter from "~/components/Newsletter";
import BlogGrid from "~/components/blog/BlogGrid";
import Pagination from "~/components/blog/Pagination";
import { Outlet } from "@remix-run/react";


export const meta: MetaFunction = () => {
  return [
    { title: "Blog - Adawi" },
    {
      name: "description",
      content: "Découvrez nos articles de mode et conseils vestimentaires.",
    },
  ];
};

// API response
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image?: string;
  author_name: string;
  published_at: string;
}

export default function Blog() {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 16;
  const [allBlogPosts, setAllBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const skip = (currentPage - 1) * postsPerPage;

        const res = await fetch(`/api/blog/posts?skip=${skip}&limit=${postsPerPage}`);

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Erreur lors de la récupération des articles");
        }

        const data = await res.json();
        setAllBlogPosts(data.posts || []);
      } catch (err: any) {
        setError(err.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />

      {/* Espacement après le header */}
      <div className="bg-adawi-beige-dark">
        <br />
        <br />
      </div>
      <div className="bg-gray-200">
        <br />
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <p className="text-center">Chargement des articles...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <>
            <BlogGrid posts={allBlogPosts} />

            <Pagination
              currentPage={currentPage}
              totalPages={10 /* à ajuster si l'API donne le total */}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </main>
      <Outlet />
      <Newsletter />
      <Footer />
    </div>
  );
}

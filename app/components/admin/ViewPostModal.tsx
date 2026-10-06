import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";

interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  tags: string[];
  status: string;
  author_name: string;
  created_at: string;
}

interface ViewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string | null;
  token: string;
}

export default function ViewPostModal({ isOpen, onClose, slug, token }: ViewPostModalProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || !isOpen || !token) return;

    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `http://localhost:8000/admin/content/blog/posts/${slug}`, // URL corrigée
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setPost(data);
      } catch (err) {
        console.error("Erreur chargement post :", err);
        setError(err instanceof Error ? err.message : "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, isOpen, token]);

  // Réinitialiser l'état quand le modal se ferme
  useEffect(() => {
    if (!isOpen) {
      setPost(null);
      setError(null);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-500">Chargement...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Fermer
              </button>
            </div>
          ) : post ? (
            <div>
              <Dialog.Title className="text-2xl font-bold mb-4">{post.title}</Dialog.Title>
              
              {post.cover_image && (
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              
              <div className="mb-4">
                <p className="text-gray-700 text-lg leading-relaxed">{post.excerpt}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-2">Contenu :</h3>
                <div className="text-gray-800 whitespace-pre-line leading-relaxed border-l-4 border-blue-200 pl-4">
                  {post.content}
                </div>
              </div>
              
              {post.tags && post.tags.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Tags :</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Auteur : <strong>{post.author_name}</strong></span>
                  <span>Créé le : {new Date(post.created_at).toLocaleString()}</span>
                </div>
                <div className="mt-2 text-sm">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    post.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {post.status === 'published' ? 'Publié' : 'Brouillon'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun post trouvé</p>
            </div>
          )}
          
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
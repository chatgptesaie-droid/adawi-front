import {
  json,
  redirect,
  type LoaderFunction,
  type ActionFunction,
} from "@remix-run/node";
import {
  useLoaderData,
  useNavigation,
  useActionData,
} from "@remix-run/react";
import { useState } from "react";
import { Plus, Eye, Trash2, Edit } from "lucide-react";
import { readToken } from "~/utils/session.server";
import CreatePostModal from "~/components/admin/CreatePostModal";
import ViewPostModal from "~/components/admin/ViewPostModal";
import UpdatePostModal from "~/components/admin/UpdatePostModal";
import { requireVendor } from "~/utils/auth.server";
import SellerLayout from "~/components/seller/SellerLayout";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image?: string;
  tags: string[];
  author_name: string;
  published_at?: string;
  views_count: number;
}

interface LoaderData {
  posts: BlogPost[];
  token: string;
  error?: string;
}

interface ActionData {
  error?: string;
  success?: boolean;
  message?: string;
}

/* =======================
   LOADER : liste des posts
   ======================= */
export const loader: LoaderFunction = async ({ request }) => {
  try {
    const token = await readToken(request);
    await requireVendor(request);
    if (!token) throw new Response("Non autorisé", { status: 401 });

    const res = await fetch(
      "http://localhost:8000/admin/content/blog/posts?limit=20&skip=0",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      throw new Error("Erreur lors de la récupération des posts");
    }

    const posts: BlogPost[] = await res.json();
    return json<LoaderData>({ posts, token });
  } catch (error: any) {
    console.error("Erreur loader blog:", error);
    return json<LoaderData>({
      posts: [],
      token: "",
      error: error.message || "Erreur serveur",
    });
  }
};

/* =======================
   ACTION : création de post
   ======================= */
export const action: ActionFunction = async ({ request }) => {
  try {
    const token = await readToken(request);
    await requireVendor(request);

    if (!token) {
      return json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "delete") {
      const slug = formData.get("slug");

      const res = await fetch(
        `http://localhost:8000/admin/content/blog/posts/${slug}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        return json({ error: errorText }, { status: res.status });
      }

      return json({ success: true, message: "Post supprimé avec succès" });
    }

    // Création de post (existant)
    const backendFormData = new FormData();
    formData.forEach((value, key) => {
      if (key !== "intent") {
        // Exclure le champ intent
        backendFormData.append(key, value);
      }
    });

    const res = await fetch(
      "http://localhost:8000/admin/content/blog/posts",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: backendFormData,
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      return json({ error: errorText }, { status: res.status });
    }

    return json({ success: true, message: "Post créé avec succès" });
  } catch (err: any) {
    console.error("Erreur action:", err);
    return json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
};

/* =======================
   COMPONENT
   ======================= */
export default function SellerBlog() {
  const { posts, token, error } = useLoaderData<LoaderData>();
  const navigation = useNavigation();
  const actionData = useActionData<ActionData>();
  const [openModal, setOpenModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const handleDelete = (slug: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      const form = new FormData();
      form.append("intent", "delete");
      form.append("slug", slug);

      // Soumettre le formulaire
      const formElement = document.createElement("form");
      formElement.method = "POST";
      formElement.style.display = "none";

      form.forEach((value, key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value.toString();
        formElement.appendChild(input);
      });

      document.body.appendChild(formElement);
      formElement.submit();
    }
  };

  const handleUpdateSuccess = () => {
    // Recharger la page pour voir les modifications
    window.location.reload();
  };

  return (
    <SellerLayout userName="Nom du Vendeur"> {/* Replace with actual seller name */}

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Gestion des articles de blog</h1>
          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-adawi-gold hover:bg-adawi-brown text-white rounded-lg shadow transition-colors"
          >
            <Plus size={18} /> Créer un post
          </button>
        </div>

        {/* Messages de succès/erreur */}
        {actionData?.error && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
            {actionData.error}
          </div>
        )}

        {actionData?.success && (
          <div className="p-4 mb-4 text-green-700 bg-green-100 rounded-lg">
            {actionData.message || "Opération réussie"}
          </div>
        )}

        {error && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">{error}</div>
        )}

        {posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">Aucun post trouvé.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border rounded-lg shadow">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Titre</th>
                  <th className="px-4 py-3">Auteur</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Publié le</th>
                  <th className="px-4 py-3">Vues</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <img
                        src={post.cover_image || "/placeholder.jpg"}
                        alt={post.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 max-w-xs truncate">
                        {post.title}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{post.author_name}</td>
                    <td className="px-4 py-3">
                      {post.published_at ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                          Publié
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">
                          Brouillon
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString("fr-FR")
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {post.views_count.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedSlug(post.slug);
                            setOpenViewModal(true);
                          }}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="Voir le post"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSlug(post.slug);
                            setOpenUpdateModal(true);
                          }}
                          className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                          title="Modifier le post"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(post.slug)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Supprimer le post"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal création */}
        <CreatePostModal isOpen={openModal} onClose={() => setOpenModal(false)} />

        {/* Modal visualisation */}
        <ViewPostModal
          isOpen={openViewModal}
          onClose={() => setOpenViewModal(false)}
          slug={selectedSlug}
          token={token}
        />

        {/* Modal modification */}
        <UpdatePostModal
          isOpen={openUpdateModal}
          onClose={() => setOpenUpdateModal(false)}
          slug={selectedSlug}
          token={token}
          onSuccess={handleUpdateSuccess}
        />
      </div>
    </SellerLayout>
  );
}

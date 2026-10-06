import { useEffect, useState, useRef } from "react";
import { Dialog } from "@headlessui/react";
import { X, Upload, Tag, Save } from "lucide-react";
import { compressImage } from "~/utils/imageCompression";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  tags: string[];
  status: "draft" | "published";
  author_name: string;
  created_at: string;
  updated_at?: string;
  published_at?: string;
}

interface UpdatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string | null;
  token: string;
  onSuccess?: () => void;
}

export default function UpdatePostModal({
  isOpen,
  onClose,
  slug,
  token,
  onSuccess
}: UpdatePostModalProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTag, setNewTag] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'ok' | 'error' | null>(null);

  // États du formulaire
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    cover_image: "",
    tags: [] as string[],
    status: "draft" as "draft" | "published"
  });

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Test de connexion à l'API
  const testConnection = async () => {
    if (!token) return;

    setConnectionStatus('checking');
    try {
      const response = await fetch(
        'http://localhost:8000/admin/content/blog/posts?limit=1&skip=0',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        setConnectionStatus('ok');
        setTimeout(() => setConnectionStatus(null), 3000);
      } else {
        setConnectionStatus('error');
      }
    } catch (err) {
      setConnectionStatus('error');
    }
  };

  // Charger le post existant
  useEffect(() => {
    if (!slug || !isOpen || !token) return;

    const fetchPost = async () => {
      setLoading(true);
      setError(null);

      try {
        // Ajouter un timeout et une meilleure gestion d'erreur
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(
          `http://localhost:8000/admin/content/blog/posts/${slug}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorMessage = `Erreur ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || errorMessage;
          } catch {
            errorMessage = `${errorMessage}: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        setPost(data);

        // Pré-remplir le formulaire avec des valeurs par défaut sécurisées
        setFormData({
          title: data.title || "",
          excerpt: data.excerpt || "",
          content: data.content || "",
          cover_image: data.cover_image || "",
          tags: Array.isArray(data.tags) ? data.tags : [],
          status: data.status || "draft"
        });
      } catch (err) {
        console.error("Erreur chargement post :", err);
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            setError("Timeout - Le serveur met trop de temps à répondre");
          } else if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
            setError("Erreur de connexion - Vérifiez votre connexion internet");
          } else {
            setError(err.message);
          }
        } else {
          setError("Erreur lors du chargement du post");
        }
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
      setNewTag("");
      setCoverImageFile(null);
      setCoverImagePreview(null);
      setFormData({
        title: "",
        excerpt: "",
        content: "",
        cover_image: "",
        tags: [],
        status: "draft"
      });
    }
  }, [isOpen]);

  // Gérer les changements de formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Ajouter un tag
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  // Supprimer un tag
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Gérer le clic sur le bouton upload
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Gérer la sélection de fichier avec compression
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Compresser l'image avant de la stocker
      const compressedFile = await compressImage(file);

      setCoverImageFile(compressedFile);

      // Créer une URL d'aperçu pour le fichier compressé
      const previewUrl = URL.createObjectURL(compressedFile);
      setCoverImagePreview(previewUrl);
      setFormData(prev => ({
        ...prev,
        cover_image: previewUrl
      }));
    } catch (error) {
      console.error('Erreur lors de la compression de l\'image:', error);
      // En cas d'erreur, utiliser le fichier original
      setCoverImageFile(file);

      const previewUrl = URL.createObjectURL(file);
      setCoverImagePreview(previewUrl);
      setFormData(prev => ({
        ...prev,
        cover_image: previewUrl
      }));
    }
  };

  // Soumettre les modifications
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !token) return;

    setSaving(true);
    setError(null);

    try {
      // Validation côté client
      if (!formData.title.trim() || !formData.excerpt.trim() || !formData.content.trim()) {
        throw new Error("Les champs titre, résumé et contenu sont obligatoires");
      }

      // Préparer les données à envoyer en multipart/form-data
      const formPayload = new FormData();
      formPayload.append('title', formData.title.trim());
      formPayload.append('excerpt', formData.excerpt.trim());
      formPayload.append('content', formData.content.trim());
      formPayload.append('status', formData.status);
      formData.tags.filter(tag => tag.trim() !== "").forEach(tag => {
        formPayload.append('tags', tag);
      });

      if (coverImageFile) {
        formPayload.append('cover_image', coverImageFile);
      } else if (formData.cover_image.trim() === '') {
        // If cover_image URL is empty string, send null to clear it
        formPayload.append('cover_image', '');
      }

      console.log('Tentative de mise à jour avec FormData');

      let response;
      let attempt = 1;
      const maxAttempts = 3;

      while (attempt <= maxAttempts) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

          console.log(`Tentative ${attempt}/${maxAttempts} de mise à jour...`);

          response = await fetch(
            `http://localhost:8000/admin/content/blog/posts/${slug}`,
            {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                // Do NOT set Content-Type header for multipart/form-data; browser sets it automatically with boundary
                'Accept': 'application/json'
              },
              body: formPayload,
              signal: controller.signal
            }
          );

          clearTimeout(timeoutId);
          break; // Sortir de la boucle si la requête réussit
        } catch (fetchError: any) {
          console.error(`Échec tentative ${attempt}:`, fetchError);

          if (attempt === maxAttempts) {
            throw fetchError; // Relancer l'erreur à la dernière tentative
          }

          // Attendre avant la prochaine tentative
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
          attempt++;
        }
      }

      if (!response) {
        throw new Error('Impossible de contacter le serveur après plusieurs tentatives');
      }

      console.log('Réponse reçue:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}`;
        try {
          const errorData = await response.json();
          console.error('Détail de l\'erreur:', errorData);
          errorMessage = errorData.detail || errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = `${errorMessage}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      let updatedPost;
      try {
        updatedPost = await response.json();
        console.log('Post mis à jour avec succès:', updatedPost);
      } catch (parseError) {
        console.warn('Impossible de parser la réponse JSON, mais la requête semble avoir réussi');
        // Si on ne peut pas parser le JSON mais que le status est OK, on considère que ça a marché
        updatedPost = { ...post, ...formData };
      }

      setPost(updatedPost);

      // Appeler le callback de succès si fourni
      if (onSuccess) {
        onSuccess();
      }

      // Fermer le modal après un court délai
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (err) {
      console.error("Erreur mise à jour post :", err);
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError("Timeout - L'opération a pris trop de temps. Vérifiez votre connexion et réessayez.");
        } else if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
          setError("Erreur de connexion - Vérifiez votre connexion internet et réessayez.");
        } else if (err.message.includes('fetch')) {
          setError("Impossible de contacter le serveur. Vérifiez que l'API est accessible.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Erreur inconnue lors de la mise à jour");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-lg">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <Dialog.Title className="text-xl font-bold">
              {loading ? "Chargement..." : "Modifier l'article"}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-500">Chargement du post...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={testConnection}
                    disabled={connectionStatus === 'checking'}
                    className={`px-4 py-2 rounded-md text-white ${
                      connectionStatus === 'checking'
                        ? 'bg-gray-400 cursor-not-allowed'
                        : connectionStatus === 'ok'
                        ? 'bg-green-600 hover:bg-green-700'
                        : connectionStatus === 'error'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {connectionStatus === 'checking' && ' Test...'}
                    {connectionStatus === 'ok' && ' Connexion OK'}
                    {connectionStatus === 'error' && ' Connexion échouée'}
                    {!connectionStatus && ' Tester la connexion'}
                  </button>
                  <button
                    onClick={() => {
                      setError(null);
                      // Relancer le chargement si c'est une erreur de chargement
                      if (!post && slug && token) {
                        setLoading(true);
                        // Relancer useEffect
                        const event = new CustomEvent('retry-fetch');
                        window.dispatchEvent(event);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Réessayer
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Fermer
                  </button>
                </div>

                {/* Informations de diagnostic */}
                <div className="mt-4 p-3 bg-gray-50 rounded text-left text-sm">
                  <p><strong>Diagnostic:</strong></p>
                  <p>• URL API: http://localhost:8000</p>
                  <p>• Slug du post: {slug}</p>
                  <p>• Token présent: {token ? 'Oui' : 'Non'}</p>
                  <p>• Navigateur en ligne: {navigator.onLine ? 'Oui' : 'Non'}</p>
                </div>
              </div>
            ) : post ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Titre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    maxLength={200}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Titre de l'article"
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Résumé *
                  </label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    required
                    maxLength={500}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Résumé de l'article"
                  />
                </div>

                {/* Contenu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenu *
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contenu complet de l'article"
                  />
                </div>

                {/* Image de couverture */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image de couverture (URL ou fichier)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      name="cover_image"
                      value={formData.cover_image}
                      onChange={handleChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                    <button
                      type="button"
                      onClick={handleUploadClick}
                      className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      title="Upload image"
                    >
                      <Upload size={18} />
                    </button>
                  </div>
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {formData.cover_image && (
                    <div className="mt-2">
                      <img
                        src={formData.cover_image}
                        alt="Aperçu"
                        className="w-32 h-20 object-cover rounded-md border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden text-sm text-gray-500 mt-1">
                        Impossible de charger l'image
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ajouter un tag"
                      maxLength={50}
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      <Tag size={18} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="draft">Brouillon</option>
                    <option value="published">Publié</option>
                  </select>
                </div>

                {/* Messages d'erreur */}
                {error && (
                  <div className="p-4 text-red-700 bg-red-100 rounded-lg border border-red-200">
                    <div className="flex items-start gap-2">
                      <span className="text-red-500"></span>
                      <div className="flex-1">
                        <p className="font-medium">Erreur de sauvegarde</p>
                        <p className="text-sm mt-1">{error}</p>
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={testConnection}
                            disabled={connectionStatus === 'checking'}
                            className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            {connectionStatus === 'checking' ? 'Test...' : 'Tester connexion'}
                          </button>
                          {connectionStatus === 'ok' && (
                            <span className="text-xs text-green-600"> API accessible</span>
                          )}
                          {connectionStatus === 'error' && (
                            <span className="text-xs text-red-600"> API inaccessible</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Boutons d'action */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={saving || loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save size={18} />
                    {saving ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucun post trouvé</p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

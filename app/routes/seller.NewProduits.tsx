import React, { useState, useEffect, useRef } from "react";
import { Upload, X, Trash2, Eye, Plus, Image as ImageIcon } from "lucide-react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { readToken } from "~/utils/session.server";
import { requireVendor } from "~/utils/auth.server";
import SellerLayout from "~/components/seller/SellerLayout";
import { compressImage } from "~/utils/imageCompression";

interface UserPhoto {
  image_url: string;
  description: string;
  _id: string;
  user_id: string;
  created_at: string;
}

interface PhotoUpload {
  file: File;
  description: string;
  preview: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const token = await readToken(request);
  await requireVendor(request);

  if (!token) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return json({ token });
}

const SellerNewProduits: React.FC = () => {
  const { token } = useLoaderData<typeof loader>();
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadFiles, setUploadFiles] = useState<PhotoUpload[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger toutes les photos (vendeur)
  const fetchAllPhotos = async () => {
    try {
      setLoading(true);

      const response = await fetch('http://localhost:8000/user-photos/admin/all?skip=0&limit=100', {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data: UserPhoto[] = await response.json();
      const sortedPhotos = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setPhotos(sortedPhotos);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      console.error('Erreur API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPhotos();
  }, []);

  // Gestion du drag & drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const remainingSlots = 10 - uploadFiles.length;
    const filesToAdd = imageFiles.slice(0, remainingSlots);

    for (const file of filesToAdd) {
      try {
        const compressedFile = await compressImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          const newPhoto: PhotoUpload = {
            file: compressedFile,
            description: '',
            preview: e.target?.result as string
          };
          setUploadFiles(prev => [...prev, newPhoto]);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Erreur de compression:', error);
        // Fallback to original file
        const reader = new FileReader();
        reader.onload = (e) => {
          const newPhoto: PhotoUpload = {
            file,
            description: '',
            preview: e.target?.result as string
          };
          setUploadFiles(prev => [...prev, newPhoto]);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeUploadFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateDescription = (index: number, description: string) => {
    setUploadFiles(prev => prev.map((item, i) => 
      i === index ? { ...item, description } : item
    ));
  };

  // Upload des photos
  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;

    try {
      setUploading(true);
      
      const formData = new FormData();
      
      // Ajouter les fichiers
      uploadFiles.forEach((item, index) => {
        formData.append('photos', item.file);
      });
      
      // Ajouter les descriptions
      const descriptions = uploadFiles.map(item => item.description || '');
      formData.append('descriptions', JSON.stringify(descriptions));

      const response = await fetch('http://localhost:8000/user-photos/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const newPhotos: UserPhoto[] = await response.json();
      setPhotos(prev => [...newPhotos, ...prev]);
      setUploadFiles([]);
      setError(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload');
      console.error('Erreur upload:', err);
    } finally {
      setUploading(false);
    }
  };

  // Supprimer une photo
  const deletePhoto = async (photoId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) return;

    try {
      
      const response = await fetch(`http://localhost:8000/user-photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      setPhotos(prev => prev.filter(photo => photo._id !== photoId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      console.error('Erreur suppression:', err);
    }
  };

  return (
    <SellerLayout>
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Photos - Vendeur</h1>
          <p className="text-gray-600">Gérez vos photos de produits et nouveautés</p>
        </div>

        {/* Section Upload */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Upload className="w-5 h-5 mr-2 text-adawi-gold" />
            Ajouter des Photos
          </h2>

          {/* Zone de drop */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-adawi-gold bg-adawi-gold/5' 
                : 'border-gray-300 hover:border-adawi-gold/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Glissez-déposez vos photos ici
            </p>
            <p className="text-gray-500 mb-4">
              ou cliquez pour sélectionner (max 10 photos)
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-adawi-gold text-white px-6 py-2 rounded-lg hover:bg-adawi-gold/90 transition-colors"
            >
              Sélectionner des fichiers
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {/* Prévisualisation des fichiers à uploader */}
          {uploadFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Photos à uploader ({uploadFiles.length}/10)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {uploadFiles.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="relative mb-3">
                      <img
                        src={item.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeUploadFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Description de la photo..."
                      value={item.description}
                      onChange={(e) => updateDescription(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Uploader {uploadFiles.length} photo{uploadFiles.length > 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 text-sm mt-2"
            >
              Fermer
            </button>
          </div>
        )}

        {/* Section Mes Photos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <ImageIcon className="w-5 h-5 mr-2 text-adawi-gold" />
              Mes Photos ({photos.length})
            </h2>
            <button
              onClick={fetchAllPhotos}
              disabled={loading}
              className="text-adawi-gold hover:text-adawi-gold/80 transition-colors"
            >
              Actualiser
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-adawi-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des photos...</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Aucune photo trouvée</p>
              <p className="text-gray-500">Commencez par uploader vos premières photos</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
              {photos.map((photo) => (
                <div key={photo._id} className="break-inside-avoid bg-gray-50 rounded-lg overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={photo.image_url}
                      alt={photo.description}
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <button
                        onClick={() => window.open(photo.image_url, '_blank')}
                        className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
                        title="Voir en grand"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deletePhoto(photo._id)}
                        className="bg-red-500/80 backdrop-blur-sm text-white p-2 rounded-full hover:bg-red-600/80 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-800 font-medium mb-2 line-clamp-2">
                      {photo.description || "Sans description"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(photo.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
    </SellerLayout>
  );
};

export default SellerNewProduits;

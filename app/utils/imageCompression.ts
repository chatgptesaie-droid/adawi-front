import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  quality?: number;
}

/**
 * Compresse une image en utilisant browser-image-compression
 * @param file - Le fichier image à compresser
 * @param options - Options de compression
 * @returns Promise<File> - Le fichier compressé
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const defaultOptions: CompressionOptions = {
    maxSizeMB: 1, // Taille maximale de 1MB
    maxWidthOrHeight: 1920, // Dimension maximale de 1920px
    useWebWorker: true, // Utilise un web worker pour ne pas bloquer l'UI
    quality: 0.8, // Qualité de 80%
    ...options
  };

  try {
    console.log(` Compression de l'image: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    const compressedFile = await imageCompression(file, defaultOptions);

    console.log(` Image compressée: ${compressedFile.name} (${(compressedFile.size / 1024 / 1024).toFixed(2)}MB)`);
    console.log(` Réduction: ${(((file.size - compressedFile.size) / file.size) * 100).toFixed(1)}%`);

    return compressedFile;
  } catch (error) {
    console.error(' Erreur lors de la compression:', error);
    // En cas d'erreur, retourner le fichier original
    return file;
  }
}

/**
 * Compresse plusieurs images en parallèle
 * @param files - Tableau de fichiers à compresser
 * @param options - Options de compression
 * @returns Promise<File[]> - Tableau des fichiers compressés
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<File[]> {
  const compressionPromises = files.map(file => compressImage(file, options));
  return Promise.all(compressionPromises);
}

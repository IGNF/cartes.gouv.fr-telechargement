import JSZip from "jszip";
import { saveAs } from "file-saver";
import { File } from "../assets/@types/types";

/**
 * Nombre maximal de téléchargements simultanés
 * Limiter à 6 optimise la bande passante et évite de surcharger le serveur
 */
const MAX_CONCURRENT_DOWNLOADS = 6;

/**
 * Gestionnaire de file d'attente pour téléchargements avec limite de concurrence
 * 
 * @template T - Type des éléments à télécharger
 * @param items - Liste des éléments à traiter
 * @param downloadFn - Fonction asynchrone qui traite chaque élément
 * @param maxConcurrent - Nombre maximum de téléchargements parallèles (défaut: 6)
 * 
 * Fonctionnement:
 * - Traite jusqu'à `maxConcurrent` éléments en parallèle
 * - Démarre automatiquement les éléments en attente quand un se termine
 * - Utilise Promise.race pour gérer efficacement les promesses
 */
async function downloadWithConcurrencyLimit<T>(
  items: T[],
  downloadFn: (item: T, index: number) => Promise<void>,
  maxConcurrent: number = MAX_CONCURRENT_DOWNLOADS
) {
  // Copie la liste des éléments à traiter
  const queue = [...items];
  // Ensemble contenant les promesses actuellement en cours
  const inProgress = new Set<Promise<void>>();

  /**
   * Traite les éléments de la file d'attente
   * S'exécute récursivement jusqu'à ce que tout soit traité
   */
  const processNext = async () => {
    // Arrête si la file est vide et aucun téléchargement en cours
    if (queue.length === 0 && inProgress.size === 0) {
      return;
    }

    // Lance les téléchargements jusqu'à atteindre la limite de concurrence
    while (inProgress.size < maxConcurrent && queue.length > 0) {
      // Récupère le prochain élément de la file
      const item = queue.shift();
      if (!item) break;

      // Récupère l'index original de l'élément dans la liste
      const index = items.indexOf(item);
      
      // Crée la promesse de téléchargement et l'ajoute au suivi
      const promise = downloadFn(item, index).then(() => {
        // Retire la promesse du suivi quand elle est terminée
        inProgress.delete(promise);
        // Traite les éléments en attente
        return processNext();
      });

      inProgress.add(promise);
    }

    // Si des téléchargements sont en cours, attend qu'un se termine
    if (inProgress.size > 0) {
      // Promise.race attend que la première promesse se termine
      await Promise.race(inProgress);
      // Traite les éléments suivants
      return processNext();
    }
  };

  // Lance le traitement de la file d'attente
  await processNext();
}

/**
 * Télécharge et compresse des fichiers en archive ZIP
 * 
 * @param files - Tableau des fichiers à télécharger
 * @param onProgress - Callback optionnel pour suivre la progression (0-100)
 * 
 * Processus:
 * 1. Récupère les tailles des fichiers (requêtes HEAD rapides)
 * 2. Télécharge les fichiers avec contrôle de concurrence
 * 3. Compresse tout en archive ZIP
 * 4. Sauvegarde le fichier téléchargé
 */
export async function downloadZip(
  files: File[],
  onProgress?: (progress: number) => void,
) {
  // Crée une instance JSZip pour construire l'archive
  const zip = new JSZip();
  
  // Compteurs pour le suivi de la progression
  let totalBytes = 0;      // Taille totale de tous les fichiers
  let loadedBytes = 0;     // Taille actuellement téléchargée
  const startTime = Date.now();
  
  // Map pour stocker les tailles de fichiers connus
  const fileSizes = new Map<string, number>();

  /**
   * Phase 1: Pré-chargement des tailles de fichiers
   * Utilise des requêtes HEAD (plus rapides que GET) pour récupérer les en-têtes
   * Permet d'avoir une barre de progression précise dès le départ
   */
  const sizePromises = files.map(async (file) => {
    try {
      // Requête HEAD: récupère seulement les headers, pas le contenu
      const response = await fetch(file.url, { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      
      // Convertit la taille en nombre et l'ajoute au total
      const fileSize = contentLength ? parseInt(contentLength, 10) : 0;
      fileSizes.set(file.name, fileSize);
      totalBytes += fileSize;
    } catch (e) {
      // Log les erreurs mais continue le téléchargement
      console.warn(`Could not get size for ${file.name}:`, e);
    }
  });

  // Attend que toutes les tailles soient récupérées
  await Promise.all(sizePromises);

  /**
   * Phase 2: Téléchargement des fichiers avec limite de concurrence
   * Utilise la fonction downloadWithConcurrencyLimit pour gérer
   * jusqu'à 6 téléchargements simultanés
   */
  await downloadWithConcurrencyLimit(
    files,
    async (file) => {
      try {
        // Lance le téléchargement du fichier
        const response = await fetch(file.url);

        // Vérifie que la requête a réussi
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        /**
         * Récupère la taille du fichier depuis la réponse
         * (au cas où HEAD aurait échoué)
         */
        if (!fileSizes.has(file.name)) {
          const contentLength = response.headers.get('content-length');
          const fileSize = contentLength ? parseInt(contentLength, 10) : 0;
          fileSizes.set(file.name, fileSize);
          totalBytes += fileSize;
        }

        /**
         * Récupère un lecteur pour streamer le contenu par chunks
         * Évite de charger tout le fichier en mémoire d'un coup
         */
        const reader = response.body?.getReader();
        if (!reader) {
          // Fallback si le streaming n'est pas disponible
          const blob = await response.blob();
          zip.file(file.name, blob);
          loadedBytes += blob.size;
          updateProgress();
          return;
        }

        /**
         * Lit le fichier par chunks (morceaux)
         * Chaque chunk est environ 64KB par défaut
         * Cela permet un suivi de progression plus fluide
         */
        const chunks: Uint8Array[] = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Ajoute le chunk à la liste
          chunks.push(value);
          // Met à jour le compteur de bytes téléchargés
          loadedBytes += value.length;
          // Notifie la progression
          updateProgress();
        }

        /**
         * Crée un Blob à partir de tous les chunks
         * et l'ajoute à l'archive ZIP
         */
        const blob = new Blob(chunks);
        zip.file(file.name, blob);
      } catch (error) {
        // Log l'erreur et la propage (pour un possible traitement)
        console.error(`Error downloading ${file.name}:`, error);
        throw error;
      }
    },
    MAX_CONCURRENT_DOWNLOADS
  );

  /**
   * Fonction interne pour mettre à jour la progression
   * Calcule le pourcentage et appelle le callback si fourni
   */
  function updateProgress() {
    if (totalBytes > 0) {
      // Calcule le pourcentage (0-100)
      const progress = (loadedBytes / totalBytes) * 100;
      // Limite à 99% jusqu'à la génération du ZIP (qui fait passer à 100%)
      onProgress?.(Math.min(progress, 99));
    }
  }

  /**
   * Phase 3: Génération et sauvegarde de l'archive ZIP
   * Marque la progression à 100%
   */
  onProgress?.(100);
  
  /**
   * Génère le fichier ZIP blob avec tous les fichiers
   * type: "blob" produit un Blob directement utilisable
   */
  const zipBlob = await zip.generateAsync({ type: "blob" });
  
  /**
   * Sauvegarde le fichier ZIP sur l'ordinateur de l'utilisateur
   * Utilise l'API FileSaver.js
   */
  saveAs(zipBlob, "export.zip");
}

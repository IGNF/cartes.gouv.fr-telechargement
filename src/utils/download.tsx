import JSZip from "jszip";
import { saveAs } from "file-saver";
import { File } from "../assets/@types/types";

/**
 * Nombre maximal de téléchargements simultanés.
 * Limiter à 6 évite de surcharger le serveur et optimise la bande passante.
 */
const MAX_CONCURRENT_DOWNLOADS = 6;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Étend le type `File` avec les métadonnées optionnelles d'un produit.
 * Les métadonnées sont déjà parsées (objet) contrairement à l'API qui
 * les renvoie sous forme de string JSON.
 */
export interface FileWithMetadata extends File {
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// getFileSizes
// ---------------------------------------------------------------------------

/**
 * Tente de récupérer la taille d'un fichier via Range ou HEAD.
 * Retourne `null` si la taille ne peut pas être déterminée de manière fiable.
 *
 * @param file - Fichier dont on veut connaître la taille.
 */
async function fetchFileSize(file: File): Promise<number | null> {
  try {
    // Stratégie 1 : Range request — demande 1 byte pour lire Content-Range
    const rangeRes = await fetch(file.url, { headers: { Range: "bytes=0-0" } });
    if (rangeRes.status === 206) {
      const match = rangeRes.headers.get("content-range")?.match(/\/(\d+)$/);
      if (match) return parseInt(match[1], 10);
    }

    // Stratégie 2 : HEAD request
    const headRes = await fetch(file.url, { method: "HEAD" });
    const contentLength = headRes.headers.get("content-length");
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      if (size > 0) return size;
    }
  } catch (e) {
    console.warn(`Impossible de récupérer la taille de ${file.name}:`, e);
  }

  return null;
}

/**
 * Récupère les tailles de plusieurs fichiers en parallèle.
 * Les fichiers dont la taille est inconnue sont associés à `null`.
 *
 * @param files - Liste des fichiers.
 * @returns Map `name → taille en bytes | null`.
 */
export async function getFileSizes(
  files: File[]
): Promise<Map<string, number | null>> {
  const entries = await Promise.all(
    files.map(async (file) => {
      const size = await fetchFileSize(file);
      return [file.name, size] as [string, number | null];
    })
  );
  return new Map(entries);
}

// ---------------------------------------------------------------------------
// Concurrency limiter
// ---------------------------------------------------------------------------

/**
 * Exécute une liste de tâches asynchrones avec une limite de concurrence.
 *
 * @param items       - Éléments à traiter.
 * @param fn          - Tâche asynchrone appliquée à chaque élément.
 * @param maxConcurrent - Nombre maximum de tâches parallèles.
 */
async function withConcurrencyLimit<T>(
  items: T[],
  fn: (item: T) => Promise<void>,
  maxConcurrent: number
): Promise<void> {
  const queue = [...items];
  const running = new Set<Promise<void>>();

  const runNext = async (): Promise<void> => {
    if (queue.length === 0) return;

    const item = queue.shift()!;
    const task = fn(item).finally(() => {
      running.delete(task);
    });

    running.add(task);

    // Si la limite est atteinte, attend qu'une tâche se libère
    if (running.size >= maxConcurrent) {
      await Promise.race(running);
    }

    return runNext();
  };

  // Lance jusqu'à maxConcurrent tâches en parallèle
  const initialBatch = Array.from(
    { length: Math.min(maxConcurrent, items.length) },
    () => runNext()
  );

  await Promise.all(initialBatch);
  // Attend la fin de toutes les tâches encore en cours
  await Promise.all(running);
}

// ---------------------------------------------------------------------------
// downloadZip
// ---------------------------------------------------------------------------

/**
 * Télécharge une liste de fichiers et les compresse dans une archive ZIP.
 *
 * **Structure du ZIP avec métadonnées :**
 * ```
 * export.zip
 * ├── LHD_FXX_0656_6861/
 * │   ├── LHD_FXX_0656_6861.laz
 * │   └── LHD_FXX_0656_6861.json
 * └── LHD_FXX_0657_6862/
 *     ├── LHD_FXX_0657_6862.laz
 *     └── LHD_FXX_0657_6862.json
 * ```
 *
 * **Sans métadonnées :** les fichiers sont placés à la racine du ZIP.
 *
 * **Progression :**
 * - Si toutes les tailles sont connues : progression en bytes (précise).
 * - Si certaines tailles sont inconnues : progression en nombre de fichiers
 *   terminés (approximative).
 *
 * @param files      - Fichiers à télécharger (avec métadonnées optionnelles).
 * @param onProgress - Callback de progression (0–100).
 * @param fileSizes  - Tailles pré-calculées (optionnel, évite un aller-réseau).
 */
export async function downloadZip(
  files: FileWithMetadata[],
  onProgress?: (progress: number) => void,
  fileSizes?: Map<string, number | null>
): Promise<void> {
  const zip = new JSZip();

  // Récupère les tailles si non fournies
  const sizeMap = fileSizes ?? (await getFileSizes(files));

  // Détermine si on peut faire une progression en bytes
  const knownSizes = files
    .map((f) => sizeMap.get(f.name) ?? null)
    .filter((s): s is number => s !== null);

  const allSizesKnown =
    knownSizes.length === files.length && knownSizes.every((s) => s > 0);

  const totalBytes = allSizesKnown
    ? knownSizes.reduce((a, b) => a + b, 0)
    : 0;

  let loadedBytes = 0;
  let completedFiles = 0;

  /**
   * Met à jour la progression.
   * - Mode bytes : progression précise basée sur les bytes téléchargés.
   * - Mode fichiers : progression basée sur le nombre de fichiers terminés.
   */
  const updateProgress = (chunkSize = 0) => {
    if (!onProgress) return;

    if (allSizesKnown && totalBytes > 0) {
      loadedBytes += chunkSize;
      // Plafonne à 99% — le dernier % est réservé à la génération du ZIP
      onProgress(Math.min((loadedBytes / totalBytes) * 100, 99));
    } else {
      onProgress(Math.min((completedFiles / files.length) * 99, 99));
    }
  };

  // ---------------------------------------------------------------------------
  // Téléchargement des fichiers
  // ---------------------------------------------------------------------------

  await withConcurrencyLimit(
    files,
    async (file) => {
      const response = await fetch(file.url);

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status} pour ${file.name}`
        );
      }

      // Détermine le chemin dans le ZIP
      const hasMetadata = file.metadata != null;
      const zipFolder = hasMetadata ? zip.folder(file.name)! : zip;

      // Lecture en streaming par chunks
      const reader = response.body?.getReader();

      let blob: Blob;

      if (reader) {
        const chunks: Uint8Array[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          updateProgress(value.length);
        }

        blob = new Blob(chunks);
      } else {
        // Fallback sans streaming (pas de progression granulaire)
        blob = await response.blob();
        updateProgress(blob.size);
      }

      // Fichier de données dans le (sous-)dossier
      zipFolder.file(file.name, blob);

      // Fichier JSON de métadonnées dans le même sous-dossier
      if (hasMetadata) {
        zipFolder.file(
          `${file.name}.json`,
          JSON.stringify(
            { name: file.name, url: file.url, metadata: file.metadata },
            null,
            2
          )
        );
      }

      completedFiles++;

      // En mode fichiers, met à jour après chaque fichier terminé
      if (!allSizesKnown) {
        updateProgress();
      }
    },
    MAX_CONCURRENT_DOWNLOADS
  );

  // ---------------------------------------------------------------------------
  // Génération et sauvegarde du ZIP
  // ---------------------------------------------------------------------------

  onProgress?.(100);
  const zipBlob = await zip.generateAsync({ type: "blob" });
  saveAs(zipBlob, "export.zip");
}

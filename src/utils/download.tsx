import JSZip from "jszip";
import { saveAs } from "file-saver";
import { File } from "../assets/@types/types";

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

/** Nombre maximum de téléchargements simultanés. */
const MAX_CONCURRENT = 6;

/**
 * Nombre maximum de requêtes par seconde autorisées par le serveur.
 * Au-delà, le serveur retourne 429. On découpe les téléchargements en
 * fenêtres d'1 seconde et on s'assure de ne pas dépasser cette limite.
 */
const MAX_REQUESTS_PER_SECOND = 10;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Étend `File` avec les métadonnées optionnelles d'un produit (déjà parsées).
 */
export interface FileWithMetadata extends File {
  metadata?: Record<string, unknown>;
}

/**
 * Phase courante du téléchargement, utilisée pour afficher un label précis.
 *
 * - `idle`        : aucun téléchargement en cours
 * - `preparing`   : récupération des tailles de fichiers
 * - `downloading` : téléchargement des fichiers
 * - `compressing` : génération de l'archive ZIP
 */
export type DownloadPhase = "idle" | "preparing" | "downloading" | "compressing";

// ---------------------------------------------------------------------------
// getFileSizes
// ---------------------------------------------------------------------------

/**
 * Tente de récupérer la taille d'un fichier via Range puis HEAD.
 * Retourne `null` si la taille ne peut pas être déterminée.
 */
async function fetchFileSize(
  file: File,
  signal: AbortSignal
): Promise<number | null> {
  try {
    const rangeRes = await fetch(file.url, {
      headers: { Range: "bytes=0-0" },
      signal,
    });
    if (rangeRes.status === 206) {
      const match = rangeRes.headers.get("content-range")?.match(/\/(\d+)$/);
      if (match) return parseInt(match[1], 10);
    }

    const headRes = await fetch(file.url, { method: "HEAD", signal });
    const contentLength = headRes.headers.get("content-length");
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      if (size > 0) return size;
    }
  } catch (e) {
    if ((e as Error).name !== "AbortError") {
      console.warn(`Impossible de récupérer la taille de ${file.name}:`, e);
    }
  }
  return null;
}

/**
 * Récupère les tailles de plusieurs fichiers en parallèle.
 *
 * @param files  - Fichiers à mesurer.
 * @param signal - Signal d'annulation.
 * @returns Map `name → taille en bytes | null`.
 */
export async function getFileSizes(
  files: File[],
  signal?: AbortSignal
): Promise<Map<string, number | null>> {
  const ctrl = signal ? null : new AbortController();
  const sig = signal ?? ctrl!.signal;

  const entries = await Promise.all(
    files.map(async (file) => {
      const size = await fetchFileSize(file, sig);
      return [file.name, size] as [string, number | null];
    })
  );
  return new Map(entries);
}

// ---------------------------------------------------------------------------
// Rate-limited concurrency runner
// ---------------------------------------------------------------------------

/**
 * Exécute des tâches asynchrones avec :
 * - une limite de concurrence (`maxConcurrent`)
 * - une limite de débit (`maxPerSecond` requêtes lancées par fenêtre d'1s)
 *
 * Algorithme : on découpe les items en fenêtres de `maxPerSecond` éléments.
 * Pour chaque fenêtre, on lance les tâches avec la limite de concurrence et
 * on attend au moins 1 seconde avant de passer à la fenêtre suivante.
 *
 * @param items         - Éléments à traiter.
 * @param fn            - Tâche asynchrone par élément.
 * @param maxConcurrent - Téléchargements simultanés max.
 * @param maxPerSecond  - Requêtes lancées max par seconde.
 * @param signal        - Signal d'annulation.
 */
async function runRateLimited<T>(
  items: T[],
  fn: (item: T) => Promise<void>,
  maxConcurrent: number,
  maxPerSecond: number,
  signal: AbortSignal
): Promise<void> {
  // Découpe en fenêtres de maxPerSecond éléments
  const windows: T[][] = [];
  for (let i = 0; i < items.length; i += maxPerSecond) {
    windows.push(items.slice(i, i + maxPerSecond));
  }

  for (const window of windows) {
    if (signal.aborted) throw new DOMException("Annulé", "AbortError");

    const windowStart = Date.now();

    // Traite la fenêtre avec la limite de concurrence
    await runConcurrent(window, fn, maxConcurrent, signal);

    // Attend le reste de la seconde si la fenêtre s'est terminée trop vite
    const elapsed = Date.now() - windowStart;
    const remaining = 1000 - elapsed;
    if (remaining > 0 && windows.indexOf(window) < windows.length - 1) {
      await sleep(remaining, signal);
    }
  }
}

/**
 * Exécute des tâches avec une limite de concurrence stricte.
 */
async function runConcurrent<T>(
  items: T[],
  fn: (item: T) => Promise<void>,
  maxConcurrent: number,
  signal: AbortSignal
): Promise<void> {
  const queue = [...items];
  const running = new Set<Promise<void>>();

  const runNext = async (): Promise<void> => {
    if (queue.length === 0 || signal.aborted) return;

    const item = queue.shift()!;
    const task: Promise<void> = fn(item).finally(() => {
      running.delete(task);
    });
    running.add(task);

    if (running.size >= maxConcurrent) {
      await Promise.race(running);
    }

    return runNext();
  };

  const initialBatch = Array.from(
    { length: Math.min(maxConcurrent, items.length) },
    () => runNext()
  );

  await Promise.all(initialBatch);
  await Promise.all(running);
}

/**
 * Attend `ms` millisecondes, sauf si le signal est annulé.
 */
function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException("Annulé", "AbortError"));
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Annulé", "AbortError"));
    });
  });
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
 * **Sans métadonnées :** fichiers à la racine du ZIP.
 *
 * **Progression :**
 * - Mode bytes si toutes les tailles sont connues (précis).
 * - Mode fichiers sinon (approximatif : x/N fichiers).
 *
 * **Rate-limiting :** max `MAX_REQUESTS_PER_SECOND` requêtes par seconde,
 * avec une pause automatique entre les fenêtres.
 *
 * @param files          - Fichiers à télécharger.
 * @param onProgress     - Callback de progression (0–100).
 * @param onPhaseChange  - Callback de changement de phase.
 * @param fileSizes      - Tailles pré-calculées (optionnel).
 * @param signal         - Signal d'annulation (AbortController).
 */
export async function downloadZip(
  files: FileWithMetadata[],
  onProgress?: (progress: number) => void,
  onPhaseChange?: (phase: DownloadPhase) => void,
  fileSizes?: Map<string, number | null>,
  signal?: AbortSignal
): Promise<void> {
  const zip = new JSZip();

  // --- Phase : préparation ---
  onPhaseChange?.("preparing");

  const sizeMap = fileSizes ?? (await getFileSizes(files, signal));

  const knownSizes = files
    .map((f) => sizeMap.get(f.name) ?? null)
    .filter((s): s is number => s !== null && s > 0);

  const allSizesKnown = knownSizes.length === files.length;
  const totalBytes = allSizesKnown
    ? knownSizes.reduce((a, b) => a + b, 0)
    : 0;

  let loadedBytes = 0;
  let completedFiles = 0;

  /**
   * Met à jour la progression en mode bytes (tailles connues).
   */
  const updateProgressBytes = (chunkSize: number) => {
    if (!onProgress) return;
    loadedBytes += chunkSize;
    onProgress(Math.min((loadedBytes / totalBytes) * 100, 99));
  };

  /**
   * Démarre un ticker de progression simulée pour un fichier dont la taille
   * est inconnue (ex: WMS). La barre avance de façon logarithmique jusqu'à
   * ce que stop() soit appelé, indiquant une activité visible sans bloquer.
   *
   * Algorithme : à chaque tick (300ms), on avance de 8% du reste alloué au
   * fichier — progression rapide au début, de plus en plus lente, sans jamais
   * atteindre le plafond avant la fin réelle.
   *
   * @returns stop — à appeler quand le fichier est entièrement reçu.
   */
  const startSimulatedTicker = (): (() => void) => {
    if (!onProgress) return () => {};

    const fileShare = 1 / files.length; // fraction du total allouée à ce fichier
    let simulatedProgress = 0; // progression simulée (0–1) dans la part du fichier
    let stopped = false;

    const tick = () => {
      if (stopped) return;
      const remaining = 1 - simulatedProgress;
      simulatedProgress += remaining * 0.08;
      const global = ((completedFiles + simulatedProgress) / files.length) * 99;
      onProgress(Math.min(global, 99));
      setTimeout(tick, 300);
    };

    setTimeout(tick, 300);

    return () => {
      stopped = true;
      completedFiles += 1;
      onProgress(Math.min((completedFiles / files.length) * 99, 99));
    };
  };

  /**
   * Lit tous les chunks d'un ReadableStreamDefaultReader et retourne un Blob.
   */
  const readAllChunks = async (
    reader: ReadableStreamDefaultReader<Uint8Array>
  ): Promise<Blob> => {
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    return new Blob(chunks);
  };

  // --- Phase : téléchargement ---
  onPhaseChange?.("downloading");

  await runRateLimited(
    files,
    async (file) => {
      if (signal?.aborted) throw new DOMException("Annulé", "AbortError");

      const response = await fetch(file.url, { signal });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} pour ${file.name}`);
      }

      const hasMetadata = file.metadata != null;
      const zipFolder = hasMetadata ? zip.folder(file.name)! : zip;
      const knownSize = sizeMap.get(file.name);
      const hasKnownSize = knownSize != null && knownSize > 0;
      const reader = response.body?.getReader();
      let blob: Blob;

      if (hasKnownSize) {
        // Taille connue : progression précise par chunks
        if (reader) {
          const chunks: Uint8Array[] = [];
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            updateProgressBytes(value.length);
          }
          blob = new Blob(chunks);
        } else {
          blob = await response.blob();
          updateProgressBytes(blob.size);
        }
        completedFiles++;
      } else {
        // Taille inconnue (WMS) : ticker simulé pendant l'attente du blob
        const stopTicker = startSimulatedTicker();
        blob = reader ? await readAllChunks(reader) : await response.blob();
        stopTicker();
      }

      zipFolder.file(file.name, blob);

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
    },
    MAX_CONCURRENT,
    MAX_REQUESTS_PER_SECOND,
    signal ?? new AbortController().signal
  );

  // --- Phase : compression ---
  onPhaseChange?.("compressing");
  onProgress?.(99);

  const zipBlob = await zip.generateAsync({ type: "blob" });

  if (signal?.aborted) throw new DOMException("Annulé", "AbortError");

  saveAs(zipBlob, "export.zip");
  onProgress?.(100);
  onPhaseChange?.("idle");
}

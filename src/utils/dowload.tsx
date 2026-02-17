import JSZip from "jszip";
import { saveAs } from "file-saver";
import { File } from "../assets/@types/types";

// Limit concurrent downloads to optimize bandwidth and avoid overwhelming the server
const MAX_CONCURRENT_DOWNLOADS = 6;

// Simple queue manager for concurrent downloads
async function downloadWithConcurrencyLimit<T>(
  items: T[],
  downloadFn: (item: T, index: number) => Promise<void>,
  maxConcurrent: number = MAX_CONCURRENT_DOWNLOADS
) {
  const queue = [...items];
  const inProgress = new Set<Promise<void>>();

  const processNext = async () => {
    if (queue.length === 0 && inProgress.size === 0) {
      return;
    }

    while (inProgress.size < maxConcurrent && queue.length > 0) {
      const item = queue.shift();
      if (!item) break;

      const index = items.indexOf(item);
      const promise = downloadFn(item, index).then(() => {
        inProgress.delete(promise);
        return processNext();
      });

      inProgress.add(promise);
    }

    if (inProgress.size > 0) {
      await Promise.race(inProgress);
      return processNext();
    }
  };

  await processNext();
}

export async function downloadZip(
  files: File[],
  onProgress?: (progress: number) => void,
) {
  const zip = new JSZip();
  let totalBytes = 0;
  let loadedBytes = 0;
  const startTime = Date.now();
  const fileSizes = new Map<string, number>();

  // Pre-fetch file sizes first to show accurate progress
  const sizePromises = files.map(async (file) => {
    try {
      const response = await fetch(file.url, { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      const fileSize = contentLength ? parseInt(contentLength, 10) : 0;
      fileSizes.set(file.name, fileSize);
      totalBytes += fileSize;
    } catch (e) {
      console.warn(`Could not get size for ${file.name}:`, e);
    }
  });

  await Promise.all(sizePromises);

  // Download files with concurrency limit
  await downloadWithConcurrencyLimit(
    files,
    async (file) => {
      try {
        const response = await fetch(file.url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        // Get file size from response if not already known
        if (!fileSizes.has(file.name)) {
          const contentLength = response.headers.get('content-length');
          const fileSize = contentLength ? parseInt(contentLength, 10) : 0;
          fileSizes.set(file.name, fileSize);
          totalBytes += fileSize;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          const blob = await response.blob();
          zip.file(file.name, blob);
          loadedBytes += blob.size;
          updateProgress();
          return;
        }

        // Collect chunks and add to zip
        const chunks: Uint8Array[] = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          chunks.push(value);
          loadedBytes += value.length;
          updateProgress();
        }

        const blob = new Blob(chunks);
        zip.file(file.name, blob);
      } catch (error) {
        console.error(`Error downloading ${file.name}:`, error);
        throw error;
      }
    },
    MAX_CONCURRENT_DOWNLOADS
  );

  function updateProgress() {
    if (totalBytes > 0) {
      const progress = (loadedBytes / totalBytes) * 100;
      onProgress?.(Math.min(progress, 99));
    }
  }

  onProgress?.(100);
  const zipBlob = await zip.generateAsync({ type: "blob" });
  saveAs(zipBlob, "export.zip");
}

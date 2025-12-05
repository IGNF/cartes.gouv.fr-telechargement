import { formatBytes } from "./formatters";

/**
 * Résultat renvoyé par getRemoteFileSize
 */
export type RemoteFileSize = {
  bytes: number | null;
  human: string | null; // ex: "1.23 MB" ou "456 KB"
};

/**
 * Récupère la taille (en octets) d'un fichier distant via son URL.
 * - Essaye HEAD -> Content-Length
 * - Si absent, essuie GET avec Range: bytes=0-0 -> Content-Range
 *
 * Retourne un objet { bytes, human } où bytes est le nombre d'octets ou null,
 * et human est la représentation formatée (Ko/Mo) ou null si impossible.
 *
 * Note: le serveur doit autoriser les requêtes CORS et exposer les en-têtes nécessaires.
 */
export async function getRemoteFileSize(
  url: string,
  opts?: { timeoutMs?: number }
): Promise<RemoteFileSize> {
  const timeoutMs = opts?.timeoutMs ?? 10000;

  const doFetch = async (input: RequestInfo, init?: RequestInit) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(input, { ...init, signal: controller.signal });
      return res;
    } finally {
      clearTimeout(id);
    }
  };

  const parseAndReturn = (n: number | null): RemoteFileSize => {
    return {
      bytes: n,
      human: n && n > 0 ? formatBytes(n) : null,
    };
  };

  // 1) HEAD request -> content-length
  try {
    const head = await doFetch(url, { method: "HEAD", cache: "no-cache" });
    if (head && head.ok) {
      const cl = head.headers.get("content-length");
      if (cl) {
        const n = parseInt(cl, 10);
        if (!Number.isNaN(n)) return parseAndReturn(n);
      }
    }
  } catch (e) {
    // ignore and try fallback
  }

  // 2) GET with Range -> Content-Range (ex: "bytes 0-0/12345")
  try {
    const get = await doFetch(url, {
      method: "GET",
      headers: { Range: "bytes=0-0" },
      cache: "no-cache",
    });
    if (get && (get.ok || get.status === 206)) {
      const cr = get.headers.get("content-range");
      if (cr) {
        const m = cr.match(/\/(\d+)$/);
        if (m) {
          const total = parseInt(m[1], 10);
          if (!Number.isNaN(total)) return parseAndReturn(total);
        }
      }
      // fallback : content-length (may be 1 here, but try anyway)
      const cl2 = get.headers.get("content-length");
      if (cl2) {
        const n2 = parseInt(cl2, 10);
        if (!Number.isNaN(n2)) return parseAndReturn(n2);
      }
    }
  } catch (e) {
    // ignore
  }

  return parseAndReturn(null);
}
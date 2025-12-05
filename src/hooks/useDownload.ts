import { useEffect, useState, useCallback } from "react";
import { getConnectionSpeed, formatBytes } from "../utils/formatters";

export interface DalleInfo {
  url: string;
  name?: string;
}

export function useDownload(urls: string[], estimate = false) {
  const [sizesMap, setSizesMap] = useState<Record<string, number>>({});
  const [totalSize, setTotalSize] = useState<number>(0);
  const [estimatedTime, setEstimatedTime] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSizes = useCallback(async (shouldEstimate = estimate) => {
    if (!urls || urls.length === 0) {
      setSizesMap({});
      setTotalSize(0);
      setEstimatedTime("");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const connectionSpeed = getConnectionSpeed();
      const map: Record<string, number> = {};
      let total = 0;

      await Promise.all(
        urls.map(async (u) => {
          try {
            const res = await fetch(u, { method: "HEAD" });
            const size = parseInt(res.headers.get("content-length") || "0", 10) || 0;
            map[u] = size;
            total += size;
          } catch {
            map[u] = 0;
          }
        })
      );

      setSizesMap(map);
      setTotalSize(total);

      if (shouldEstimate) {
        const seconds = connectionSpeed > 0 ? total / connectionSpeed : 0;
        if (seconds === 0) setEstimatedTime("impossible d'estimer");
        else if (seconds < 60) setEstimatedTime(`environ ${Math.ceil(seconds)} s`);
        else if (seconds < 3600) setEstimatedTime(`environ ${Math.ceil(seconds / 60)} min`);
        else {
          const h = Math.floor(seconds / 3600);
          const m = Math.ceil((seconds % 3600) / 60);
          setEstimatedTime(`environ ${h}h${m}min`);
        }
      } else {
        setEstimatedTime("");
      }
    } catch (err: any) {
      setError(err);
      setSizesMap({});
      setTotalSize(0);
      setEstimatedTime("");
    } finally {
      setLoading(false);
    }
  }, [urls, estimate]);

  useEffect(() => {
    fetchSizes(estimate);
  }, [fetchSizes, estimate]);

  return {
    sizesMap,
    totalSize,
    formattedTotal: formatBytes(totalSize),
    estimatedTime,
    loading,
    error,
    refresh: () => fetchSizes(true),
  };
}
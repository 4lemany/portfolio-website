import { useState, useEffect, useCallback, useRef } from "react";
import { DailyPaperItem, CachedDailyPapers } from "../types/papers";

interface UseDailyPapersOptions {
  date?: string; // Optional 'YYYY-MM-DD'
  ttlMinutes?: number; // Cache time-to-live in minutes (default: 45)
  autoFetch?: boolean;
}

interface UseDailyPapersReturn {
  papers: DailyPaperItem[];
  loading: boolean;
  error: string | null;
  lastSync: Date | null;
  isCached: boolean;
  refetch: (force?: boolean) => Promise<void>;
}

const STORAGE_KEY_PREFIX = "hf_daily_papers_cache_v2_";
const DEFAULT_TTL_MINUTES = 45;

/**
 * Safe storage helper that falls back gracefully if localStorage/sessionStorage is unavailable or full.
 */
const safeGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSetItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    try {
      sessionStorage.setItem(key, value);
    } catch {
      // Storage unavailable, ignore safely
    }
  }
};

export const useDailyPapers = (
  options: UseDailyPapersOptions = {}
): UseDailyPapersReturn => {
  const {
    date,
    ttlMinutes = DEFAULT_TTL_MINUTES,
    autoFetch = true,
  } = options;

  const [papers, setPapers] = useState<DailyPaperItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isCached, setIsCached] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const cacheKey = `${STORAGE_KEY_PREFIX}${date || "latest"}`;
  const ttlMs = ttlMinutes * 60 * 1000;

  const fetchPapers = useCallback(
    async (force: boolean = false) => {
      // 1. Check local cache first if not forced
      if (!force) {
        const cachedRaw = safeGetItem(cacheKey);
        if (cachedRaw) {
          try {
            const cached: CachedDailyPapers = JSON.parse(cachedRaw);
            const now = Date.now();
            const age = now - cached.timestamp;

            if (age < ttlMs && Array.isArray(cached.papers) && cached.papers.length > 0) {
              setPapers(cached.papers);
              setLastSync(new Date(cached.timestamp));
              setIsCached(true);
              setLoading(false);
              setError(null);
              return;
            }
          } catch {
            // Malformed cache, proceed to fetch
          }
        }
      }

      // 2. Prepare network fetch
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // 12-second safety timeout for non-blocking execution
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      setLoading(true);
      setError(null);

      try {
        const url = new URL("https://huggingface.co/api/daily_papers");
        if (date) {
          url.searchParams.set("date", date);
        }

        const response = await fetch(url.toString(), {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(
            `Error al conectar con Hugging Face (código ${response.status}: ${response.statusText})`
          );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Respuesta inválida de la API de Hugging Face");
        }

        // Validate and clean paper data items
        const validPapers: DailyPaperItem[] = data.filter(
          (item) => item && item.paper && item.paper.id && item.paper.title
        );

        const now = Date.now();
        const cachePayload: CachedDailyPapers = {
          timestamp: now,
          dateKey: date || "latest",
          papers: validPapers,
        };

        safeSetItem(cacheKey, JSON.stringify(cachePayload));

        setPapers(validPapers);
        setLastSync(new Date(now));
        setIsCached(false);
        setError(null);
      } catch (err: unknown) {
        clearTimeout(timeoutId);

        if (err instanceof Error && err.name === "AbortError") {
          // If aborted by user action or timeout
          setError("Tiempo de espera agotado al conectar con Hugging Face. Por favor, reintenta.");
        } else {
          const errorMessage =
            err instanceof Error
              ? err.message
              : "No se pudieron obtener los papers en vivo.";
          setError(errorMessage);
        }

        // Fallback: If network failed, check if we have any stale cache to still show something!
        const staleRaw = safeGetItem(cacheKey);
        if (staleRaw) {
          try {
            const stale: CachedDailyPapers = JSON.parse(staleRaw);
            if (Array.isArray(stale.papers) && stale.papers.length > 0) {
              setPapers(stale.papers);
              setLastSync(new Date(stale.timestamp));
              setIsCached(true);
            }
          } catch {
            // Ignore
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [cacheKey, date, ttlMs]
  );

  useEffect(() => {
    if (autoFetch) {
      fetchPapers(false);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [autoFetch, fetchPapers]);

  return {
    papers,
    loading,
    error,
    lastSync,
    isCached,
    refetch: fetchPapers,
  };
};

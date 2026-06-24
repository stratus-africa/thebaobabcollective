import { useEffect, useRef, useState } from "react";

export type AutosaveState<T> = {
  draft: T | null;
  hasDraft: boolean;
  save: (data: T) => void;
  clear: () => void;
  dismissNotice: () => void;
  showRestoredNotice: boolean;
};

const STORAGE_PREFIX = "lovable.draft.";

function readDraft<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Treat empty / expired drafts as missing
    if (parsed && typeof parsed === "object" && "data" in parsed) {
      const age = Date.now() - (parsed.savedAt ?? 0);
      // Drafts expire after 14 days
      if (age > 14 * 24 * 60 * 60 * 1000) {
        window.localStorage.removeItem(STORAGE_PREFIX + key);
        return null;
      }
      return parsed.data as T;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Persists a form's values to localStorage with a debounce.
 * Pass `enabled={false}` to opt out entirely.
 */
export function useFormAutosave<T>(opts: {
  key: string;
  enabled?: boolean;
  debounceMs?: number;
}): AutosaveState<T> {
  const { key, enabled = true, debounceMs = 600 } = opts;
  const [draft, setDraft] = useState<T | null>(null);
  const [showRestoredNotice, setShowRestoredNotice] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const existing = readDraft<T>(key);
    if (existing) {
      setDraft(existing);
      setShowRestoredNotice(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  const save = (data: T) => {
    if (!enabled || typeof window === "undefined") return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      try {
        window.localStorage.setItem(
          STORAGE_PREFIX + key,
          JSON.stringify({ data, savedAt: Date.now() }),
        );
      } catch {
        /* quota or disabled storage — ignore */
      }
    }, debounceMs);
  };

  const clear = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDraft(null);
    setShowRestoredNotice(false);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_PREFIX + key);
      } catch {
        /* ignore */
      }
    }
  };

  const dismissNotice = () => setShowRestoredNotice(false);

  return { draft, hasDraft: !!draft, save, clear, dismissNotice, showRestoredNotice };
}

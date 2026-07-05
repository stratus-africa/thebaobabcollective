// Client-side preview override store. When the site is loaded inside the
// admin preview iframe (with ?__preview=1), the parent posts draft page
// content via postMessage. Components use `usePreviewMerge` to overlay it
// on top of their real props for a live preview experience.
import { useEffect, useState } from "react";

type OverrideMap = Record<string, Record<string, any>>;

let overrides: OverrideMap = {};
const subscribers = new Set<() => void>();
let installed = false;

function notify() {
  for (const cb of subscribers) cb();
}

export function isPreviewMode(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("__preview");
}

export function installPreviewListener() {
  if (installed || typeof window === "undefined") return;
  if (!isPreviewMode()) return;
  installed = true;
  window.addEventListener("message", (event) => {
    const data = event.data;
    if (!data || data.__baobabPreview !== true) return;
    if (data.type === "set") {
      overrides = { ...overrides, [data.key]: data.value ?? {} };
      notify();
    } else if (data.type === "bulk") {
      overrides = { ...(data.values ?? {}) };
      notify();
    }
  });
  // Signal readiness to parent so it can send initial draft.
  try {
    window.parent?.postMessage({ __baobabPreview: true, type: "ready" }, "*");
  } catch {}
  // Hide interactive noise (navigation) while in preview? keep visible.
  document.documentElement.setAttribute("data-preview", "true");
}

export function usePreviewMerge<T extends object>(key: string, base: T | null | undefined): T {
  const [, force] = useState(0);
  useEffect(() => {
    if (!isPreviewMode()) return;
    const cb = () => force((n) => n + 1);
    subscribers.add(cb);
    return () => {
      subscribers.delete(cb);
    };
  }, []);
  if (!isPreviewMode()) return (base ?? ({} as T)) as T;
  const ov = overrides[key];
  return { ...(base ?? ({} as any)), ...(ov ?? {}) } as T;
}

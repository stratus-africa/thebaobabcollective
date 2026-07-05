import { useEffect, useRef, useState } from "react";
import { Monitor, Smartphone, Tablet, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

type Device = "desktop" | "tablet" | "mobile";

const WIDTHS: Record<Device, string> = {
  desktop: "100%",
  tablet: "820px",
  mobile: "390px",
};

export interface PageLivePreviewProps {
  /** URL path to load (e.g. "/", "/about"). */
  path: string;
  /** Map of page-content key -> draft override object. */
  drafts: Record<string, Record<string, any>>;
  /** ms debounce for pushing drafts. */
  debounceMs?: number;
}

export function PageLivePreview({ path, drafts, debounceMs = 250 }: PageLivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [ready, setReady] = useState(false);
  const [nonce, setNonce] = useState(0);

  const previewUrl = `${path}${path.includes("?") ? "&" : "?"}__preview=1`;

  // Listen for the iframe's "ready" handshake.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const d = e.data;
      if (d?.__baobabPreview === true && d.type === "ready") setReady(true);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [nonce]);

  // Push drafts (debounced) whenever they change.
  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => {
      const win = iframeRef.current?.contentWindow;
      if (!win) return;
      win.postMessage({ __baobabPreview: true, type: "bulk", values: drafts }, "*");
    }, debounceMs);
    return () => window.clearTimeout(t);
  }, [drafts, ready, debounceMs]);

  // Also push once as soon as ready flips true.
  useEffect(() => {
    if (!ready) return;
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage({ __baobabPreview: true, type: "bulk", values: drafts }, "*");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return (
    <div className="flex flex-col h-full min-h-[600px] border border-border bg-muted/30">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border bg-background">
        <div className="text-[11px] tracking-[0.2em] uppercase text-foreground/60 truncate">
          Live preview · {path}
        </div>
        <div className="flex items-center gap-1">
          <ToolbarBtn active={device === "desktop"} onClick={() => setDevice("desktop")} title="Desktop">
            <Monitor className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn active={device === "tablet"} onClick={() => setDevice("tablet")} title="Tablet">
            <Tablet className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn active={device === "mobile"} onClick={() => setDevice("mobile")} title="Mobile">
            <Smartphone className="w-4 h-4" />
          </ToolbarBtn>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setReady(false);
              setNonce((n) => n + 1);
            }}
            title="Reload"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" asChild title="Open in new tab">
            <a href={path} target="_blank" rel="noreferrer">
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-3 flex justify-center">
        <iframe
          key={nonce}
          ref={iframeRef}
          title="Live preview"
          src={previewUrl}
          style={{ width: WIDTHS[device], maxWidth: "100%" }}
          className="h-full min-h-[600px] w-full bg-background border border-border shadow-sm"
        />
      </div>
    </div>
  );
}

function ToolbarBtn({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active ? "bg-forest text-forest-foreground" : "text-foreground/60 hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

import { useEffect, useRef, useState } from "react";
import { Bold, Italic, List, ListOrdered, Heading2, Link as LinkIcon, Undo2, Quote } from "lucide-react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  autosaveKey?: string;
  placeholder?: string;
  minHeight?: number;
};

/**
 * Lightweight rich text editor based on contentEditable + execCommand.
 * - Stores HTML in `value`
 * - Autosaves to localStorage under `autosaveKey` (debounced)
 * - Restores on mount if a draft exists and differs from value
 */
export function RichTextEditor({
  value,
  onChange,
  autosaveKey,
  placeholder = "Write your story…",
  minHeight = 180,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [showRestored, setShowRestored] = useState(false);
  const initial = useRef(value);

  // Initialize content once
  useEffect(() => {
    if (!ref.current) return;
    let html = value ?? "";
    if (autosaveKey) {
      try {
        const draft = localStorage.getItem(autosaveKey);
        if (draft && draft !== html) {
          html = draft;
          setShowRestored(true);
          onChange(draft);
        }
      } catch {}
    }
    if (ref.current.innerHTML !== html) ref.current.innerHTML = html;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep DOM in sync if value updates externally (e.g. switching record)
  useEffect(() => {
    if (!ref.current) return;
    if (initial.current !== value && ref.current.innerHTML !== (value ?? "")) {
      ref.current.innerHTML = value ?? "";
      initial.current = value;
    }
  }, [value]);

  // Debounced autosave
  useEffect(() => {
    if (!autosaveKey) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(autosaveKey, value ?? "");
        setSavedAt(Date.now());
      } catch {}
    }, 500);
    return () => clearTimeout(t);
  }, [value, autosaveKey]);

  function exec(cmd: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    if (ref.current) onChange(ref.current.innerHTML);
  }

  function onInput() {
    if (ref.current) onChange(ref.current.innerHTML);
  }

  function clearDraft() {
    if (autosaveKey) {
      try { localStorage.removeItem(autosaveKey); } catch {}
    }
    setShowRestored(false);
  }

  return (
    <div className="border border-border bg-background">
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-border bg-cream/40">
        <ToolbarBtn onClick={() => exec("bold")} title="Bold"><Bold className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => exec("italic")} title="Italic"><Italic className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => exec("formatBlock", "<h2>")} title="Heading"><Heading2 className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => exec("formatBlock", "<blockquote>")} title="Quote"><Quote className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => exec("insertUnorderedList")} title="Bullet list"><List className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => exec("insertOrderedList")} title="Numbered list"><ListOrdered className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn
          onClick={() => {
            const url = prompt("Link URL");
            if (url) exec("createLink", url);
          }}
          title="Link"
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <div className="ml-auto flex items-center gap-2 text-[10px] text-foreground/50">
          {showRestored && (
            <button type="button" onClick={clearDraft} className="underline hover:text-foreground">
              Restored draft · clear
            </button>
          )}
          {savedAt && !showRestored && <span>Autosaved</span>}
        </div>
      </div>
      <div
        ref={ref}
        contentEditable
        onInput={onInput}
        onBlur={onInput}
        suppressContentEditableWarning
        className="p-3 text-sm leading-relaxed outline-none prose-sm max-w-none [&_h2]:font-serif [&_h2]:text-lg [&_h2]:mt-3 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-gold [&_blockquote]:pl-3 [&_blockquote]:italic"
        data-placeholder={placeholder}
        style={{ minHeight }}
      />
      <style>{`[contenteditable][data-placeholder]:empty:before{content:attr(data-placeholder);color:hsl(var(--muted-foreground));opacity:.5}`}</style>
    </div>
  );
}

function ToolbarBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className="p-1.5 rounded hover:bg-background text-foreground/70 hover:text-foreground"
    >
      {children}
    </button>
  );
}

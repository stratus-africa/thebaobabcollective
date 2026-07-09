import DOMPurify from "dompurify";

/** Tags/attributes allowed in stored rich-text content. */
const CONFIG = {
  ALLOWED_TAGS: [
    "p", "br", "strong", "b", "em", "i", "u", "s", "sup", "sub",
    "h1", "h2", "h3", "h4",
    "ul", "ol", "li",
    "blockquote", "hr",
    "a", "img", "figure", "figcaption",
    "span", "div",
  ],
  ALLOWED_ATTR: [
    "href", "target", "rel", "title",
    "src", "alt", "width", "height", "loading",
    "class",
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|\/|#)/i,
  FORBID_TAGS: ["script", "style", "iframe", "object", "embed"],
  FORBID_ATTR: ["onerror", "onclick", "onload", "onmouseover", "onfocus"],
};

/** Sanitize untrusted HTML for both storage and render. Safe on SSR. */
export function sanitizeHtml(input: string): string {
  if (!input) return "";
  if (typeof window === "undefined") {
    // On server, strip everything conservatively — text only.
    return String(input).replace(/<[^>]*>/g, "");
  }
  const clean = DOMPurify.sanitize(input, CONFIG) as unknown as string;
  // Force external links to be safe.
  const wrap = document.createElement("div");
  wrap.innerHTML = clean;
  wrap.querySelectorAll("a[target=_blank]").forEach((a) => {
    a.setAttribute("rel", "noopener noreferrer");
  });
  return wrap.innerHTML;
}

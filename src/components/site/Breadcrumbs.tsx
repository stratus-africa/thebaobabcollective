import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

export type Crumb = {
  label: string;
  to?: string;
  params?: Record<string, string>;
};

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`max-w-[1440px] mx-auto px-6 lg:px-10 pt-6 ${className ?? ""}`}
    >
      <ol className="flex flex-wrap items-center gap-1.5 text-xs tracking-wide text-foreground/65">
        <li className="flex items-center gap-1.5">
          <Link to="/" className="inline-flex items-center gap-1 hover:text-gold transition-colors">
            <Home className="w-3 h-3" aria-hidden="true" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {items.map((c, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-foreground/40" aria-hidden="true" />
              {isLast || !c.to ? (
                <span aria-current={isLast ? "page" : undefined} className="text-foreground/90 truncate max-w-[60vw]">
                  {c.label}
                </span>
              ) : (
                <Link
                  to={c.to as any}
                  params={c.params as any}
                  className="hover:text-gold transition-colors"
                >
                  {c.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function BaobabLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="22" r="11" fill="oklch(0.78 0.14 70)" opacity="0.85" />
      <path
        d="M32 60 V36 M32 36 C24 32 18 28 14 22 M32 36 C40 32 46 28 50 22 M32 36 C28 30 24 24 22 18 M32 36 C36 30 40 24 42 18 M32 36 C32 30 32 24 32 16"
        stroke="oklch(0.3 0.05 60)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M28 60 Q32 56 36 60" stroke="oklch(0.3 0.05 60)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

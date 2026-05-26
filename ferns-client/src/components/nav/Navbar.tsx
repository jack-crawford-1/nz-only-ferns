import { Link, useLocation } from "react-router";

const NAV = [
  { label: "Index", path: "/", match: (p: string) => p === "/" || p.startsWith("/ferns") },
  { label: "Identify", path: "/identify", match: (p: string) => p.startsWith("/identify") || p.startsWith("/key") },
  { label: "Habitats", path: "/habitats", match: (p: string) => p.startsWith("/habitats") },
  { label: "Conservation", path: "/status", match: (p: string) => p.startsWith("/status") },
  { label: "About", path: "/about", match: (p: string) => p.startsWith("/about") },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-2.5 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 md:px-8">
        <Link to="/" className="group flex items-baseline gap-2.5">
          <span className="h-3 w-3 translate-y-px bg-fern" aria-hidden />
          <span className="text-[15px] font-extrabold uppercase tracking-[-0.01em] text-ink">
            Pteridophyta
          </span>
          <span className="label hidden sm:inline">Ferns of Aotearoa</span>
        </Link>

        <nav className="-mx-1 flex items-center gap-x-4 gap-y-1 overflow-x-auto px-1 md:gap-x-5">
          {NAV.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`shrink-0 border-b-2 pb-0.5 font-mono text-[12px] uppercase tracking-[0.04em] transition-colors ${
                  active
                    ? "border-fern text-ink"
                    : "border-transparent text-ink-3 hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

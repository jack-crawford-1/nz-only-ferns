import { useNavigate, useLocation } from "react-router";

type NavbarProps = {
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
};

export default function Navbar({
  searchQuery = "",
  onSearchChange,
}: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: "Ferns", path: "/ferns" },
    { label: "Habitats", path: "/habitats" },
    { label: "Status", path: "/status" },
  ];

  return (
    <div className="fixed top-0 left-0 z-50 w-full bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0f4fa4]">
              <a href="/">NZ Only Ferns</a>
            </span>
            <span className="text-lg font-bold text-gray-900">
              <a href="/">Fern Library</a>
            </span>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-700 shadow-inner sm:flex">
          {menuItems.map(({ label, path }) => {
            const isActive =
              (path === "/ferns" && location.pathname.startsWith("/ferns")) ||
              location.pathname === path;

            return (
              <button
                key={label}
                onClick={() => navigate(path)}
                className={`rounded-full px-3 py-1 font-medium transition-colors ${
                  isActive
                    ? "bg-white text-[#1e60d4] shadow-sm"
                    : "text-gray-600 hover:bg-white hover:text-gray-900"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="relative w-full max-w-xs">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange?.(event.target.value)}
              placeholder="Search ferns, families, or status"
              className="w-full rounded-full border border-transparent bg-[#f3f6ff] px-9 py-2 text-sm text-gray-800 shadow-inner ring-1 ring-transparent transition focus:border-[#1e60d4] focus:ring-[#c6d9ff]"
              aria-label="Filter fern rows"
              disabled={!onSearchChange}
            />
          </div>
        </div>
      </nav>
      <div
        className="h-px w-full bg-gradient from-transparent via-[#c9d8ff] to-transparent"
        aria-hidden
      />
    </div>
  );
}

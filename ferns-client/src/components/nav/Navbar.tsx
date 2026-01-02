import { useNavigate, useLocation } from "react-router";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: "Ferns", path: "/ferns" },
    { label: "Key", path: "/key" },
    { label: "Habitats", path: "/habitats" },
    { label: "Status", path: "/status" },
  ];

  return (
    <div className="fixed top-0 left-0 z-50 w-full bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col leading-tight">
            <span
              className="text-xs font-semibold uppercase tracking-[0.2em] text-[#143324]"
              style={{ fontFamily: "Cormorant Garamond" }}
            >
              <a href="/">NZ Only Ferns</a>
            </span>
            <span className="text-md font-bold text-gray-900">
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
                    ? "bg-white text-[#1f4d3a] shadow-sm"
                    : "text-gray-600 hover:bg-white hover:text-gray-900"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-1 items-center justify-end gap-3" />
      </nav>
      <div className="h-px w-full bg-[#d6e2d9]" aria-hidden />
    </div>
  );
}

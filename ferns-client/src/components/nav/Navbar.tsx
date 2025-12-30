import { useNavigate, useLocation } from "react-router";
import { convertToCSV, downloadCSV } from "../../utils/csv";
import type { FernRecord } from "../../types/Ferns";

type NavbarProps = {
  ferns: FernRecord[];
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
};

export default function Navbar({ ferns, searchQuery = "", onSearchChange }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleExport = () => {
    const csv = convertToCSV(ferns);
    const today = new Date().toLocaleDateString().split("T")[0];
    downloadCSV(csv, `ferns-${today}.csv`);
  };

  const menuItems = [
    { label: "Endemic List", path: "/ferns" },
    { label: "About", path: "/" },
    { label: "Families", path: "/families" },
    { label: "Habitats", path: "/habitats" },
    { label: "Status", path: "/status" },
    { label: "Tools", path: "/tools" },
    { label: "Export.csv", action: handleExport },
  ];

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <div className="bg-[#f8f9fa] border-b border-gray-300 flex items-center justify-between px-3 py-2 text-sm text-gray-700">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-[#0f9d58] rounded-sm flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">OF</span>
            </div>
            <span className="font-semibold">NZ ONLY FERNS</span>
          </div>

          <div className="flex items-center space-x-2">
            {menuItems.map(({ label, path, action }) => (
              <span
                key={label}
                onClick={() => {
                  if (path) {
                    navigate(path);
                  } else if (action) {
                    action();
                  }
                }}
                className={`px-2 py-1 cursor-pointer border-b-2 transition-colors duration-150
                ${
                  location.pathname === path ||
                  (path === "/ferns" && location.pathname.startsWith("/ferns"))
                    ? "border-[#1967d2] text-[#1967d2] font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 rounded-full border border-gray-400" />
          <div className="px-4 py-1 rounded-full bg-[#c2e7ff] text-[#1967d2] font-medium text-sm">
            Share
          </div>
          <div className="w-6 h-6 rounded-full border border-gray-400 bg-black" />
        </div>
      </div>

      <div className="bg-[#f8f9fa] border-b border-gray-300 flex items-center justify-start px-3 py-2 text-gray-600 text-sm space-x-3">
        <div className="flex items-center space-x-1">
          <div className="w-5 h-5 bg-gray-400/10 rounded-sm border border-gray-300"></div>
          <div className="w-5 h-5 bg-gray-400/30 rounded-sm border border-gray-300"></div>
          <div className="w-5 h-5 bg-gray-400/60 rounded-sm border border-gray-300"></div>
        </div>
        <div className="border-l border-gray-300 h-4 mx-2" />
        <span>100%</span>
        <div className="border-l border-gray-300 h-4 mx-2" />
        <span>$</span>
        <span>%</span>
        <span>123</span>
        <div className="border-l border-gray-300 h-4 mx-2" />
        <span className="text-gray-500">Default</span>
        <div className="border border-gray-300 px-1 rounded text-gray-600 text-xs">
          10
        </div>
        <span className="font-bold">B</span>
        <span className="italic">I</span>
        <span className="underline">U</span>
      </div>

      <div className="bg-[#f8f9fa] border-b border-gray-300 flex items-center px-3 py-2 text-sm text-gray-600">
        <div className="px-3 py-1 bg-white border border-gray-300 rounded-l-md font-mono text-gray-700">
          A201
        </div>
        <div className="px-3 py-1 flex items-center border border-gray-300 border-l-0 bg-white w-full">
          <span className="text-gray-500 mr-2 font-semibold">fx</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder="Search ferns..."
            className="w-full focus:outline-none"
            aria-label="Filter fern rows"
            disabled={!onSearchChange}
          />
        </div>
      </div>
    </div>
  );
}

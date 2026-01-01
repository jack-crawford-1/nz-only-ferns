import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router";
import { fetchFerns } from "../api/fetchFerns";
import type { FernRecord } from "../types/Ferns";
import Navbar from "../components/nav/Navbar";
import LoadingScreen from "../components/LoadingScreen";
import Footer from "../components/Footer";
import { convertToCSV, downloadCSV } from "../utils/csv";

type ColumnId =
  | "image"
  | "scientificName"
  | "isEndemic"
  | "commonNames"
  | "family"
  | "conservationStatus";

type ColumnDefinition = {
  id: ColumnId;
  header: string;
  width: string;
  align?: "left" | "center";
  renderCell: (fern: FernRecord) => ReactNode;
};

const COLUMN_DEFINITIONS: ColumnDefinition[] = [
  {
    id: "image",
    header: "Image",
    width: "120px",
    renderCell: (fern) =>
      fern.imageUrl ? (
        <img
          src={fern.imageUrl}
          alt={fern.scientificName}
          className="h-20 w-20 object-cover rounded-md border border-gray-200 shadow-sm"
        />
      ) : (
        <div className="h-20 w-20 flex items-center justify-center bg-gray-200 text-gray-500 text-xs rounded-md">
          No image
        </div>
      ),
  },
  {
    id: "scientificName",
    header: "Scientific Name",
    width: "240px",
    renderCell: (fern) => (
      <Link
        to={`/ferns/${encodeURIComponent(fern.scientificName)}`}
        className="text-[#20624a] hover:underline"
      >
        {fern.scientificName}
      </Link>
    ),
  },
  {
    id: "isEndemic",
    header: "Endemic",
    width: "120px",
    align: "center",
    renderCell: (fern) => (fern.isEndemic ? "Yes" : "No"),
  },
  {
    id: "commonNames",
    header: "Common Names",
    width: "240px",
    renderCell: (fern) =>
      fern.commonNames.length > 0 ? fern.commonNames.join(", ") : "—",
  },
  {
    id: "family",
    header: "Family",
    width: "200px",
    renderCell: (fern) => fern.family,
  },
  {
    id: "conservationStatus",
    header: "Conservation Status",
    width: "240px",
    renderCell: (fern) => fern.conservationStatus || "Unknown",
  },
];

const ROW_NUMBER_WIDTH = "52px";

export default function FernList() {
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get("status") || "";
  const [ferns, setFerns] = useState<FernRecord[]>([]);
  const [filteredFerns, setFilteredFerns] = useState<FernRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEndemicOnly, setShowEndemicOnly] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(statusParam);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [columnOrder, setColumnOrder] = useState<ColumnId[]>(
    COLUMN_DEFINITIONS.map((column) => column.id)
  );
  const [dropTargetId, setDropTargetId] = useState<ColumnId | null>(null);

  const columnsById = useMemo(
    () =>
      COLUMN_DEFINITIONS.reduce((acc, column) => {
        acc[column.id] = column;
        return acc;
      }, {} as Record<ColumnId, ColumnDefinition>),
    []
  );

  const orderedColumns = columnOrder.map((id) => columnsById[id]);

  const familyOptions = useMemo(
    () => Array.from(new Set(ferns.map((fern) => fern.family))).sort(),
    [ferns]
  );
  const statusOptions = useMemo(() => {
    const statuses = ferns.map((fern) => fern.conservationStatus || "Unknown");
    return Array.from(new Set(statuses)).sort();
  }, [ferns]);

  useEffect(() => {
    setSelectedStatus(statusParam);
  }, [statusParam]);

  useEffect(() => {
    fetchFerns()
      .then((data) => {
        setFerns(data);
        setFilteredFerns(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();

    setFilteredFerns(
      ferns.filter((fern) => {
        if (showEndemicOnly && !fern.isEndemic) return false;

        if (selectedFamily && fern.family !== selectedFamily) return false;

        const statusLabel = fern.conservationStatus || "Unknown";
        if (selectedStatus && statusLabel !== selectedStatus) return false;

        if (!query) return true;

        const searchableValues = [
          fern.scientificName,
          fern.commonNames.join(" "),
          fern.family,
          fern.conservationStatus || "",
          fern.isEndemic ? "yes" : "no",
        ]
          .join(" ")
          .toLowerCase();

        return searchableValues.includes(query);
      })
    );
  }, [ferns, searchQuery, showEndemicOnly, selectedFamily, selectedStatus]);

  const handleDragStart = (
    event: React.DragEvent<HTMLElement>,
    columnId: ColumnId
  ) => {
    event.dataTransfer.setData("text/plain", columnId);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (
    event: React.DragEvent<HTMLElement>,
    targetId: ColumnId
  ) => {
    event.preventDefault();
    const draggedId = event.dataTransfer.getData("text/plain") as ColumnId;

    if (!draggedId || draggedId === targetId) {
      setDropTargetId(null);
      return;
    }

    setColumnOrder((prev) => {
      const withoutDragged = prev.filter((id) => id !== draggedId);
      const targetIndex = withoutDragged.indexOf(targetId);

      if (targetIndex === -1) return prev;

      const updated = [...withoutDragged];
      updated.splice(targetIndex, 0, draggedId);
      return updated;
    });
    setDropTargetId(null);
  };

  const handleDragOver = (
    event: React.DragEvent<HTMLElement>,
    columnId: ColumnId
  ) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropTargetId((prev) => (prev === columnId ? prev : columnId));
  };

  const handleDragEnd = () => {
    setDropTargetId(null);
  };

  if (error) return <p className="text-red-500 text-center">Error: {error}</p>;
  if (isLoading)
    return (
      <LoadingScreen title="Loading fern library" description="..........." />
    );

  const handleExport = () => {
    const csv = convertToCSV(ferns);
    const today = new Date().toLocaleDateString().split("T")[0];
    downloadCSV(csv, `ferns-${today}.csv`);
  };

  return (
    <div className="min-h-screen bg-[#22342606]">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pb-12 pt-32">
        <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-white/80 p-6 shadow-lg ring-1 ring-gray-100 backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-gray-900">
                Explore Aotearoa’s native ferns
              </h1>
              <div className="relative w-full max-w-md">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  🔍
                </span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search ferns, families, or status"
                  className="w-full rounded-full border border-transparent bg-[#f3f7f4] px-9 py-2 text-sm text-gray-800 shadow-inner ring-1 ring-transparent transition focus:border-[#1f4d3a] focus:ring-[#c7d9cf]"
                  aria-label="Filter fern rows"
                />
              </div>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 rounded-full bg-[#1f4d3a] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-[#143324] hover:shadow-xl"
            >
              <span>Export to CSV</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-10 items-center justify-center rounded-full bg-[#e2f0e8] font-semibold text-[#1f4d3a] ">
                {filteredFerns.length}
              </span>
              <span className="font-medium">Ferns visible</span>
            </div>
            <span
              className="hidden h-4 w-px bg-gray-200 sm:inline-block"
              aria-hidden
            />
            <button
              type="button"
              onClick={() => setShowEndemicOnly((prev) => !prev)}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
                showEndemicOnly
                  ? "bg-[#1f4d3a] text-white shadow-sm"
                  : "bg-white text-[#1f4d3a] shadow-sm ring-1 ring-[#c7d9cf]"
              }`}
            >
              Endemic only
            </button>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                Status
              </label>
              <select
                className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1f4d3a] shadow-sm ring-1 ring-[#c7d9cf]"
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)}
              >
                <option value="">All</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                Family
              </label>
              <select
                className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1f4d3a] shadow-sm ring-1 ring-[#c7d9cf]"
                value={selectedFamily}
                onChange={(event) => setSelectedFamily(event.target.value)}
              >
                <option value="">All</option>
                {familyOptions.map((family) => (
                  <option key={family} value={family}>
                    {family}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-100">
          <div className="overflow-x-auto">
            <table
              className="min-w-full text-sm text-gray-800 "
              style={{ tableLayout: "fixed" }}
            >
              <colgroup>
                <col style={{ width: ROW_NUMBER_WIDTH }} />
                {orderedColumns.map((column) => (
                  <col key={column.id} style={{ width: column.width }} />
                ))}
              </colgroup>

              <thead className="border-b border-[#e7ecf5] bg-[#f8faff]">
                <tr>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                    #
                  </th>
                  {orderedColumns.map((column) => {
                    const isDropTarget = dropTargetId === column.id;

                    return (
                      <th
                        key={column.id}
                        draggable
                        onDragStart={(event) =>
                          handleDragStart(event, column.id)
                        }
                        onDrop={(event) => handleDrop(event, column.id)}
                        onDragOver={(event) => handleDragOver(event, column.id)}
                        onDragEnd={handleDragEnd}
                        className={`group relative cursor-grab px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-600 transition-colors hover:bg-[#e6efe9] active:cursor-grabbing ${
                          isDropTarget ? "bg-[#e6efe9]" : ""
                        } ${column.align === "center" ? "text-center" : ""}`}
                        title="Drag to reorder"
                      >
                        {isDropTarget && (
                          <span
                            className="pointer-events-none absolute inset-1 rounded-xl shadow-[0_0_0_3px_rgba(30,96,212,0.25)]"
                            aria-hidden
                          />
                        )}
                        <div className="relative z-10 flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2">
                            <span className="inline-flex h-4 w-4 items-center justify-center text-[#94a3b8]">
                              <svg
                                viewBox="0 0 16 16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                aria-hidden
                              >
                                <path d="M3.5 4.5h9M3.5 8h9M3.5 11.5h9" />
                              </svg>
                            </span>
                            <span>{column.header}</span>
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2f8]">
                {filteredFerns.length === 0 && (
                  <tr>
                    <td
                      colSpan={orderedColumns.length + 1}
                      className="px-4 py-10"
                    >
                      <div className="rounded-xl bg-[#f3f7f4] px-4 py-6 text-center text-sm text-gray-600 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1f4d3a]">
                          No results
                        </p>
                        <p className="mt-2">
                          No ferns match your search yet. Try another name or
                          status.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
                {filteredFerns.map((fern, index) => (
                  <tr
                    key={fern.scientificName}
                    className="odd:bg-white even:bg-[#fbfcff] transition-colors hover:bg-[#f1f6ff]"
                  >
                    <td className="px-3 py-3 text-left text-xs font-semibold text-gray-500">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f3f7f4] text-gray-700 shadow-inner">
                        {index + 1}
                      </span>
                    </td>
                    {orderedColumns.map((column) => (
                      <td
                        key={column.id}
                        className={`px-4 py-3 align-middle text-sm text-gray-800 ${
                          column.align === "center" ? "text-center" : ""
                        }`}
                      >
                        {column.renderCell(fern)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}

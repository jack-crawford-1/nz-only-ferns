import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { fetchFerns } from "../api/fetchFerns";
import type { FernRecord } from "../types/Ferns";
import Navbar from "../components/nav/Navbar";

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
        className="text-[#1967d2] hover:underline"
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
  const [ferns, setFerns] = useState<FernRecord[]>([]);
  const [filteredFerns, setFilteredFerns] = useState<FernRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [columnOrder, setColumnOrder] = useState<ColumnId[]>(
    COLUMN_DEFINITIONS.map((column) => column.id)
  );

  const columnsById = useMemo(
    () =>
      COLUMN_DEFINITIONS.reduce((acc, column) => {
        acc[column.id] = column;
        return acc;
      }, {} as Record<ColumnId, ColumnDefinition>),
    []
  );

  const orderedColumns = columnOrder.map((id) => columnsById[id]);

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

    if (!query) {
      setFilteredFerns(ferns);
      return;
    }

    setFilteredFerns(
      ferns.filter((fern) => {
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
  }, [ferns, searchQuery]);

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

    if (!draggedId || draggedId === targetId) return;

    setColumnOrder((prev) => {
      const withoutDragged = prev.filter((id) => id !== draggedId);
      const targetIndex = withoutDragged.indexOf(targetId);

      if (targetIndex === -1) return prev;

      const updated = [...withoutDragged];
      updated.splice(targetIndex, 0, draggedId);
      return updated;
    });
  };

  const handleDragOver = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  if (error) return <p className="text-red-500 text-center">Error: {error}</p>;
  if (isLoading) return <p className="text-center">Loading ferns...</p>;

  return (
    <div className="min-h-screen bg-linear from-[#e9f3ff] via-white to-[#f6f8fb]">
      <Navbar
        ferns={ferns}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <main className="mx-auto max-w-6xl px-4 pb-12 pt-32">
        <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-white/80 p-6 shadow-lg ring-1 ring-gray-100 backdrop-blur">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1967d2]">
                Learning library
              </p>
              <h1 className="text-3xl font-bold text-gray-900">
                Explore Aotearoa’s native ferns
              </h1>
              <p className="max-w-3xl text-sm text-gray-600">
                Reorder columns to focus on the details that matter, and use the
                search to instantly filter by name, whānau, status, or
                endemicity. Each record links to a deeper profile for classroom
                projects.
              </p>
            </div>
            <div className="rounded-xl bg-[#e4f0ff] px-4 py-3 text-sm text-[#0f4fa4] shadow-inner">
              <p className="font-semibold">Tip</p>
              <p>
                Drag column headers to rearrange your view. Results update live
                as you type.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#e0edff] font-semibold text-[#1e60d4]">
                {filteredFerns.length}
              </span>
              <span className="font-medium">Ferns visible</span>
            </div>
            <span
              className="hidden h-4 w-px bg-gray-200 sm:inline-block"
              aria-hidden
            />
            <span className="text-gray-500">Column guide</span>
            <div className="flex flex-wrap gap-2" aria-label="Column letters">
              {orderedColumns.map((column, index) => (
                <span
                  key={column.id}
                  className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-700 shadow-sm"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-gray-800 shadow-inner">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {column.header}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-100">
          <div className="overflow-x-auto">
            <table
              className="min-w-full text-sm"
              style={{ tableLayout: "fixed" }}
            >
              <colgroup>
                <col style={{ width: ROW_NUMBER_WIDTH }} />
                {orderedColumns.map((column) => (
                  <col key={column.id} style={{ width: column.width }} />
                ))}
              </colgroup>

              <thead className="bg-[#f3f6ff]">
                <tr>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                    #
                  </th>
                  {orderedColumns.map((column) => (
                    <th
                      key={column.id}
                      draggable
                      onDragStart={(event) => handleDragStart(event, column.id)}
                      onDrop={(event) => handleDrop(event, column.id)}
                      onDragOver={handleDragOver}
                      className={`group relative px-4 py-3 text-left text-xs font-semibold text-gray-800 transition-colors hover:bg-[#e6edff] ${
                        column.align === "center" ? "text-center" : ""
                      }`}
                      title="Drag to reorder"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{column.header}</span>
                        <span className="hidden h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#1e60d4] shadow-sm group-hover:inline-flex">
                          {String.fromCharCode(
                            65 + columnOrder.indexOf(column.id)
                          )}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFerns.length === 0 && (
                  <tr>
                    <td
                      colSpan={orderedColumns.length + 1}
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      No ferns match your search yet. Try another name or
                      status.
                    </td>
                  </tr>
                )}
                {filteredFerns.map((fern, index) => (
                  <tr
                    key={fern.scientificName}
                    className="bg-white transition-colors hover:bg-[#f7faff]"
                  >
                    <td className="px-3 py-3 text-left text-xs font-semibold text-gray-500">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700 shadow-inner">
                        {index + 1}
                      </span>
                    </td>
                    {orderedColumns.map((column) => (
                      <td
                        key={column.id}
                        className={`px-4 py-3 align-middle text-gray-800 ${
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
      </main>
    </div>
  );
}

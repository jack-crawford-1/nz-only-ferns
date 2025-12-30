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

const ROW_NUMBER_WIDTH = "48px";

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
      COLUMN_DEFINITIONS.reduce(
        (acc, column) => {
          acc[column.id] = column;
          return acc;
        },
        {} as Record<ColumnId, ColumnDefinition>
      ),
    []
  );

  const orderedColumns = columnOrder.map((id) => columnsById[id]);

  const gridTemplateColumns = useMemo(() => {
    const columnWidths = orderedColumns.map((column) => column.width || "1fr");
    return [ROW_NUMBER_WIDTH, ...columnWidths].join(" ");
  }, [orderedColumns]);

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

  const handleDragStart = (event: React.DragEvent<HTMLElement>, columnId: ColumnId) => {
    event.dataTransfer.setData("text/plain", columnId);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (event: React.DragEvent<HTMLElement>, targetId: ColumnId) => {
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
    <div className="bg-[#f1f3f4] min-h-screen flex justify-center">
      <Navbar
        ferns={ferns}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="bg-white w-[95%] max-w-8xl border border-gray-300 rounded-t-lg shadow-sm overflow-hidden mt-[140px]">
        <div className="overflow-x-auto">
          <div
            className="grid text-sm bg-[#f8f9fa] border-b border-gray-300 text-gray-600"
            style={{ gridTemplateColumns }}
          >
            <div className="text-center text-gray-500 text-xs py-2 border-r border-gray-300 select-none">
              #
            </div>
            {orderedColumns.map((column, index) => (
              <div
                key={column.id}
                draggable
                onDragStart={(event) => handleDragStart(event, column.id)}
                onDrop={(event) => handleDrop(event, column.id)}
                onDragOver={handleDragOver}
                className="flex items-center justify-center py-2 font-medium border-r border-gray-300 cursor-move select-none"
                title="Drag to reorder"
              >
                {String.fromCharCode(65 + index)}
              </div>
            ))}
          </div>

          <table
            className="min-w-full border-collapse text-sm"
            style={{ tableLayout: "fixed" }}
          >
            <colgroup>
              <col style={{ width: ROW_NUMBER_WIDTH }} />
              {orderedColumns.map((column) => (
                <col key={column.id} style={{ width: column.width }} />
              ))}
            </colgroup>

            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="text-gray-500 font-normal text-xs text-center border-r border-gray-300"></th>
                {orderedColumns.map((column) => (
                  <th
                    key={column.id}
                    draggable
                    onDragStart={(event) => handleDragStart(event, column.id)}
                    onDrop={(event) => handleDrop(event, column.id)}
                    onDragOver={handleDragOver}
                    className={`px-4 py-2 font-semibold border-r border-gray-300 text-left cursor-move ${
                      column.align === "center" ? "text-center" : ""
                    }`}
                    title="Drag to reorder"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredFerns.length === 0 && (
                <tr>
                  <td
                    colSpan={orderedColumns.length + 1}
                    className="text-center py-6 text-gray-500"
                  >
                    No ferns match your search.
                  </td>
                </tr>
              )}
              {filteredFerns.map((fern, index) => (
                <tr
                  key={fern.scientificName}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="text-center bg-[#f8f9fa] text-gray-500 text-xs border-r border-gray-300 select-none">
                    {index + 1}
                  </td>
                  {orderedColumns.map((column) => (
                    <td
                      key={column.id}
                      className={`px-4 py-2 border-t border-gray-300 ${
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
    </div>
  );
}

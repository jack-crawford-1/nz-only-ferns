import { useEffect, useState } from "react";
import { fetchFerns } from "../api/fetchFerns";
import type { FernRecord } from "../types/Ferns";
import Navbar from "../components/nav/Navbar";

export default function FernList() {
  const [ferns, setFerns] = useState<FernRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFerns()
      .then(setFerns)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-red-500 text-center">Error: {error}</p>;
  if (ferns.length === 0)
    return <p className="text-center">Loading ferns...</p>;

  return (
    <div className="bg-[#f1f3f4] min-h-screen flex justify-center">
      <Navbar />

      <div className="bg-white w-[95%] max-w-8xl border border-gray-300 rounded-t-lg shadow-sm overflow-hidden mt-[140px]">
        <div className="flex text-sm bg-[#f8f9fa] border-b border-gray-300 text-gray-600">
          <div className="w-10 bg-[#f8f9fa] border-r border-gray-300 text-center text-gray-500 text-xs py-2 select-none">
            #
          </div>
          {["A", "B", "C", "D", "E"].map((col) => (
            <div
              key={col}
              className="flex-1 text-center py-2 font-medium border-r border-gray-300"
            >
              {col}
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="w-10 bg-[#f8f9fa] text-gray-500 font-normal text-xs text-center border-r border-gray-300"></th>

                <th className="px-4 py-2 text-left font-semibold border-r border-gray-300">
                  Scientific Name
                </th>
                <th className="px-4 py-2 text-left font-semibold border-r border-gray-300">
                  Endemic
                </th>
                <th className="px-4 py-2 text-left font-semibold border-r border-gray-300">
                  Common Names
                </th>
                <th className="px-4 py-2 text-left font-semibold border-r border-gray-300">
                  Family
                </th>

                <th className="px-4 py-2 text-left font-semibold border-gray-300">
                  Conservation Status
                </th>
              </tr>
            </thead>
            <tbody>
              {ferns.map((fern, index) => (
                <tr
                  key={fern.scientificName}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="w-10 text-center bg-[#f8f9fa] text-gray-500 text-xs border-r border-gray-300 select-none">
                    {index + 1}
                  </td>

                  <td className="px-4 py-2 border-t border-gray-300">
                    {fern.scientificName}
                  </td>
                  <td className="px-4 py-2 border-t border-gray-300 text-center">
                    {fern.isEndemic ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-2 border-t border-gray-300">
                    {fern.commonNames.length > 0
                      ? fern.commonNames.join(", ")
                      : "—"}
                  </td>
                  <td className="px-4 py-2 border-t border-gray-300">
                    {fern.family}
                  </td>
                  <td className="px-4 py-2 border-t border-gray-300">
                    {fern.conservationStatus || "Unknown"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

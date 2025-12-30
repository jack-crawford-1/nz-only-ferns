import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { fetchFernByName } from "../api/fetchFernByName";
import type { FernRecord } from "../types/Ferns";
import Navbar from "../components/nav/Navbar";

export default function FernDetail() {
  const { name } = useParams();
  const decodedName = name ? decodeURIComponent(name) : "";

  const [fern, setFern] = useState<FernRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!decodedName) return;

    fetchFernByName(decodedName)
      .then((data) => setFern(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [decodedName]);

  if (loading) return <p className="text-center mt-10">Loading fern...</p>;
  if (error)
    return <p className="text-red-500 text-center mt-10">Error: {error}</p>;
  if (!fern) return <p className="text-center mt-10">Fern not found.</p>;

  return (
    <div className="bg-[#f1f3f4] min-h-screen flex justify-center">
      <Navbar ferns={[fern]} />

      <div className="bg-white w-[95%] max-w-4xl border border-gray-300 rounded-lg shadow-sm overflow-hidden mt-[140px]">
        <div className="flex items-center justify-between bg-[#f8f9fa] border-b border-gray-300 px-6 py-4">
          <div>
            <p className="text-xs uppercase text-gray-500">Scientific name</p>
            <h1 className="text-2xl font-semibold text-gray-800">
              {fern.scientificName}
            </h1>
          </div>
          <Link
            to="/ferns"
            className="text-sm text-[#1967d2] font-medium hover:underline"
          >
            ← Back to ferns list
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
          <div className="md:col-span-1 flex justify-center">
            {fern.imageUrl ? (
              <img
                src={fern.imageUrl}
                alt={fern.scientificName}
                className="h-56 w-56 object-cover rounded-md border border-gray-200 shadow-sm"
              />
            ) : (
              <div className="h-56 w-56 flex items-center justify-center bg-gray-200 text-gray-500 text-sm rounded-md">
                No image available
              </div>
            )}
          </div>

          <div className="md:col-span-2 space-y-4">
            <div>
              <p className="text-xs uppercase text-gray-500">Common names</p>
              <p className="text-gray-800 text-lg">
                {fern.commonNames.length > 0
                  ? fern.commonNames.join(", ")
                  : "Not recorded"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-md p-4 bg-[#f8f9fa]">
                <p className="text-xs uppercase text-gray-500">Family</p>
                <p className="text-gray-800 font-semibold">{fern.family}</p>
              </div>

              <div className="border border-gray-200 rounded-md p-4 bg-[#f8f9fa]">
                <p className="text-xs uppercase text-gray-500">
                  Conservation status
                </p>
                <p className="text-gray-800 font-semibold">
                  {fern.conservationStatus || "Unknown"}
                </p>
              </div>

              <div className="border border-gray-200 rounded-md p-4 bg-[#f8f9fa]">
                <p className="text-xs uppercase text-gray-500">
                  Endemic to NZ?
                </p>
                <p className="text-gray-800 font-semibold">
                  {fern.isEndemic ? "Yes" : "No"}
                </p>
              </div>

              <div className="border border-gray-200 rounded-md p-4 bg-[#f8f9fa]">
                <p className="text-xs uppercase text-gray-500">Native to NZ?</p>
                <p className="text-gray-800 font-semibold">
                  {fern.isNative ? "Yes" : "No"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-sm text-gray-600">
              <Link
                to={fern.links?.collection ? "/ferns" : "/ferns"}
                className="text-[#1967d2] hover:underline"
              >
                View all ferns
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

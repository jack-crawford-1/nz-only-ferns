export async function fetchRegions() {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/regions`);
  if (!response.ok) throw new Error("Failed to fetch regions");
  return response.json();
}

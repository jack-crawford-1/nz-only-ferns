export async function fetchFerns() {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ferns`);
  if (!response.ok) throw new Error("Failed to fetch ferns");
  return response.json();
}

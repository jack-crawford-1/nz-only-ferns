export async function fetchFerns() {
  const response = await fetch("/api/ferns");
  if (!response.ok) throw new Error("Failed to fetch ferns");
  return response.json();
}

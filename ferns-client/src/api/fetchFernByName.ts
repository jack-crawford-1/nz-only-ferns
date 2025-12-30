export async function fetchFernByName(name: string) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/ferns/${encodeURIComponent(name)}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch fern");
  }

  return response.json();
}

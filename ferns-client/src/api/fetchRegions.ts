let regionsCache: any = null;
let regionsRequest: Promise<any> | null = null;

export async function fetchRegions() {
  if (regionsCache) return regionsCache;
  if (regionsRequest) return regionsRequest;

  regionsRequest = fetch(`${import.meta.env.VITE_API_URL}/api/regions`)
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch regions");
      return response.json();
    })
    .then((data) => {
      regionsCache = data;
      regionsRequest = null;
      return data;
    })
    .catch((error) => {
      regionsRequest = null;
      throw error;
    });

  return regionsRequest;
}

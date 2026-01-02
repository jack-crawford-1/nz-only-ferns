const WIKI_API = "https://commons.wikimedia.org/w/api.php";
const HEADERS = {
  "User-Agent": "NZFernsApp/1.0 (developer contact unavailable)",
};
const MAX_IMAGES = 32;
const IMAGE_WIDTH = "600";
const SEARCH_FILTER = "filetype:bitmap";

export async function fetchFernImages(scientificName) {
  try {
    const searchUrl = new URL(WIKI_API);
    searchUrl.search = new URLSearchParams({
      action: "query",
      format: "json",
      list: "search",
      srsearch: `"${scientificName}" ${SEARCH_FILTER}`,
      srnamespace: "6",
      srlimit: String(MAX_IMAGES),
    }).toString();

    const searchRes = await fetch(searchUrl, { headers: HEADERS });
    const searchData = await searchRes.json();

    const results = searchData.query?.search || [];
    if (results.length === 0) return [];

    const titles = results.map((result) => result.title);

    const imageUrl = new URL(WIKI_API);
    imageUrl.search = new URLSearchParams({
      action: "query",
      format: "json",
      titles: titles.join("|"),
      prop: "imageinfo",
      iiprop: "url",
      iiurlwidth: IMAGE_WIDTH,
    }).toString();

    const imgRes = await fetch(imageUrl, { headers: HEADERS });
    const imgData = await imgRes.json();

    const pages = imgData.query?.pages || {};
    const pageByTitle = new Map(
      Object.values(pages).map((page) => [page.title, page])
    );

    const urls = [];
    for (const title of titles) {
      const page = pageByTitle.get(title);
      const info = page?.imageinfo?.[0];
      const url = info?.thumburl || info?.url;
      if (url && !urls.includes(url)) {
        urls.push(url);
      }
    }

    return urls;
  } catch (err) {
    console.error(`Error fetching images for ${scientificName}:`, err.message);
    return [];
  }
}

const WIKI_API = "https://commons.wikimedia.org/w/api.php";
const HEADERS = {
  "User-Agent": "NZFernsApp/1.0 (developer contact unavailable)",
};

export async function fetchFernImage(scientificName) {
  try {
    const searchUrl = new URL(WIKI_API);
    searchUrl.search = new URLSearchParams({
      action: "query",
      format: "json",
      list: "search",
      srsearch: scientificName,
      srnamespace: "6",
      srlimit: "1",
    }).toString();

    const searchRes = await fetch(searchUrl, { headers: HEADERS });
    const searchData = await searchRes.json();

    const results = searchData.query?.search || [];
    if (results.length === 0) return null;

    const fileTitle = results[0].title;

    const imageUrl = new URL(WIKI_API);
    imageUrl.search = new URLSearchParams({
      action: "query",
      format: "json",
      titles: fileTitle,
      prop: "imageinfo",
      iiprop: "url",
      iiurlwidth: "400",
    }).toString();

    const imgRes = await fetch(imageUrl, { headers: HEADERS });
    const imgData = await imgRes.json();

    const pages = imgData.query.pages;
    const firstPage = Object.values(pages)[0];

    return firstPage.imageinfo?.[0]?.thumburl || null;
  } catch (err) {
    console.error(`Error fetching image for ${scientificName}:`, err.message);
    return null;
  }
}

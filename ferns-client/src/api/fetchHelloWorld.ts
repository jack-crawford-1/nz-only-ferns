export async function fetchHelloWorld() {
  const response = await fetch("/api");

  if (!response.ok) {
    throw new Error("Network response not ok");
  }
  return response.text();
}

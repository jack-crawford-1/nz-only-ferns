import { useEffect, useState } from "react";
import { fetchHelloWorld } from "../api/fetchHelloWorld";

export type HelloWorld = string;

export function useHelloWorld() {
  const [helloWorld, setHelloWorld] = useState<HelloWorld | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchHelloWorld();
        setHelloWorld(data);
      } catch (err) {
        console.error("Error fetching Chuck Norris joke", err);
      }
    };

    fetchData();
  }, []);

  return helloWorld;
}

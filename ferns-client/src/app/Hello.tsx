import { useHelloWorld } from "../hooks/useFetchHelloWorld.ts";

export default function Hello() {
  const helloWorld = useHelloWorld();

  return (
    <div className=" h-screen w-screen bg-gray-700 m-0 flex flex-col justify-center items-center">
      <h3 className="text-gray-400">Hello World Text:</h3>
      <div className=" text-white">{helloWorld}</div>
    </div>
  );
}

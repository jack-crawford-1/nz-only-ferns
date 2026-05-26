import Layout from "./Layout";

type LoadingScreenProps = {
  title?: string;
  description?: string;
};

export default function LoadingScreen({
  title = "Loading the archive",
  description = "Retrieving species records.",
}: LoadingScreenProps) {
  return (
    <Layout>
      <div className="border-b border-line py-10">
        <span className="label">Pteridophyta · Loading</span>
      </div>
      <div className="py-16">
        <h1 className="max-w-2xl text-3xl font-extrabold tracking-[-0.02em] md:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-md text-[14px] text-ink-3">{description}</p>
        <div className="mt-10 flex items-center gap-2" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="h-6 w-1 animate-pulse bg-fern"
              style={{ animationDelay: `${i * 120}ms`, opacity: 0.35 + i * 0.13 }}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}

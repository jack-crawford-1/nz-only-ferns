export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-[1400px] gap-6 px-5 py-10 md:grid-cols-[1fr_auto] md:px-8">
        <div className="max-w-md">
          <div className="flex items-baseline gap-2.5">
            <span className="h-2.5 w-2.5 translate-y-px bg-fern" aria-hidden />
            <span className="text-[14px] font-extrabold uppercase tracking-[-0.01em]">
              Pteridophyta
            </span>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-3">
            A working archive of the native and endemic ferns and lycophytes of
            Aotearoa New Zealand. Data compiled from public botanical sources.
          </p>
        </div>
        <div className="flex flex-col gap-1 text-[13px] md:items-end">
          <span className="label">Colophon</span>
          <a
            href="https://jackcrawford.co.nz"
            target="_blank"
            rel="noopener noreferrer"
            className="link-ink mt-1 font-medium text-ink"
          >
            jackcrawford.co.nz
          </a>
          <span className="font-mono text-[12px] text-ink-3">
            № {year} · Aotearoa
          </span>
        </div>
      </div>
    </footer>
  );
}

import { getStatusMeta, type StatusTier } from "../utils/format";

export const TIER_COLOR: Record<StatusTier, string> = {
  threatened: "var(--color-alert)",
  "at-risk": "var(--color-warn)",
  stable: "var(--color-fern)",
  unknown: "var(--color-ink-3)",
};

export function StatusDot({
  tier,
  size = 8,
}: {
  tier: StatusTier;
  size?: number;
}) {
  return (
    <span
      aria-hidden
      className="inline-block shrink-0"
      style={{ background: TIER_COLOR[tier], width: size, height: size }}
    />
  );
}

type Props = {
  status: string | null | undefined;
  variant?: "code" | "full";
  className?: string;
};

export default function StatusTag({
  status,
  variant = "full",
  className = "",
}: Props) {
  const meta = getStatusMeta(status);
  const color = TIER_COLOR[meta.tier];

  if (variant === "code") {
    return (
      <span
        title={meta.label}
        className={`inline-flex items-center gap-1.5 border border-line px-1.5 py-[3px] font-mono text-[11px] leading-none tracking-wide text-ink ${className}`}
      >
        <span aria-hidden className="h-1.5 w-1.5" style={{ background: color }} />
        {meta.code}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span aria-hidden className="h-2 w-2" style={{ background: color }} />
      <span className="text-[13px] leading-snug text-ink-2">{meta.label}</span>
    </span>
  );
}

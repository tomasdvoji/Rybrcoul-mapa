import { useEffect, useRef } from "react";
import { getProgramStatus, formatTime } from "../lib/program.js";

// Program jednoho místa uspořádaný kolem současnosti:
// nahoře budoucnost (vzdálenější výš), uprostřed „Právě hraje“,
// dole minulost (nejnovější hned pod středem).
// Po otevření se seznam automaticky sroluje na aktuální položku.
export default function ProgramList({ items, now }) {
  const anchorRef = useRef(null);

  useEffect(() => {
    anchorRef.current?.scrollIntoView({ block: "center" });
  }, [items]);

  if (!items || items.length === 0) {
    return (
      <p className="py-6 text-center font-serif italic text-ink-soft">
        Pro toto místo zatím není program.
      </p>
    );
  }

  const sorted = [...items].sort(
    (a, b) => new Date(a.start) - new Date(b.start)
  );
  const withStatus = sorted.map((item) => ({
    item,
    status: getProgramStatus(item, now, sorted),
  }));

  // chronologicky: první koncert nahoře, poslední dole
  const current = withStatus.find((e) => e.status === "now") || null;

  // kotva pro vycentrování: aktuální koncert, jinak nejbližší budoucí
  const anchorEntry =
    current ||
    withStatus.find((e) => e.status === "next") ||
    withStatus[withStatus.length - 1];

  const minutesLeft = current
    ? Math.max(1, Math.round((new Date(current.item.end) - now) / 60000))
    : null;

  const renderRow = ({ item, status }) => (
    <li
      key={item.start + item.title}
      ref={anchorEntry && anchorEntry.item === item ? anchorRef : null}
      className={[
        "rounded-xl border p-3 transition-colors",
        status === "now"
          ? "border-brand-gold bg-brand-gold/20 shadow-sm"
          : status === "next"
          ? "border-brand-red/50 bg-brand-red/10"
          : status === "past"
          ? "border-parch-3/60 bg-parch-2/40 opacity-55"
          : "border-parch-3 bg-parch-2/70",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {status === "now" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-gold px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-ink">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink" />
                Právě hraje
              </span>
            )}
            {status === "next" && (
              <span className="rounded-full bg-brand-red px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-parch-2">
                Následuje
              </span>
            )}
          </div>
          <h4 className="mt-1 truncate font-display text-lg font-bold leading-tight text-ink lg:text-2xl">
            {item.title}
          </h4>
          {item.description && (
            <p className="truncate font-serif text-sm italic text-ink-soft lg:text-base">
              {item.description}
            </p>
          )}
          {status === "now" && minutesLeft !== null && (
            <p className="mt-0.5 font-serif text-sm italic text-ink-soft lg:text-base">
              končí za {minutesLeft} min
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <div className="font-display text-base font-bold tabular-nums text-ink lg:text-2xl">
            {formatTime(item.start)}
          </div>
          <div className="text-xs tabular-nums text-ink-soft lg:text-base">
            {formatTime(item.end)}
          </div>
        </div>
      </div>
    </li>
  );

  return <ul className="space-y-2">{withStatus.map(renderRow)}</ul>;
}

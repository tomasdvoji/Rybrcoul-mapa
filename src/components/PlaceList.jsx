import { getNowPlaying, getNextItem } from "../lib/program.js";

// Číslovaný rejstřík všech míst pod mapou. Klepnutím se otevře detail.
// U míst, kde právě hraje, ukáže aktuální kapelu; jinak nejbližší následující.
export default function PlaceList({ places, now, selectedId, onSelect }) {
  if (places.length === 0) {
    return (
      <p className="py-8 text-center font-serif italic text-ink-soft">
        Nic nenalezeno.
      </p>
    );
  }

  return (
    <ul className="space-y-1.5">
      {places.map((p) => {
        const nowItem = getNowPlaying(p.program || [], now);
        const nextItem = nowItem ? null : getNextItem(p.program || [], now);
        return (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => onSelect(p)}
              className={[
                "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left shadow-sm transition-colors",
                selectedId === p.id
                  ? "border-brand-red bg-brand-red/10"
                  : "border-parch-3 bg-parch-2 active:bg-parch-3/40",
              ].join(" ")}
            >
              <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-red font-display text-sm lg:h-10 lg:w-10 lg:text-lg font-bold text-parch-2">
                {p.number}
                {nowItem && (
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-parch-2 bg-green-600" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display font-bold text-ink lg:text-xl">
                  {p.name}
                </span>
                {nowItem ? (
                  <span className="block truncate font-serif text-sm italic text-brand-gold lg:text-base">
                    ● hraje: {nowItem.title}
                  </span>
                ) : nextItem ? (
                  <span className="block truncate font-serif text-sm italic text-ink-soft lg:text-base">
                    následuje: {nextItem.title}
                  </span>
                ) : (
                  p.stage && (
                    <span className="block truncate font-serif text-sm italic text-ink-soft">
                      {p.stage}
                    </span>
                  )
                )}
              </span>
              <svg
                className="shrink-0 text-ink/30"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

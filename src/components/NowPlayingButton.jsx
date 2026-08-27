import { getPlacesPlayingNow } from "../lib/program.js";

// Tlačítko „Co hraje právě teď“ + vysouvací seznam míst s aktuálním programem.
export default function NowPlayingButton({ places, now, open, onToggle, onPick }) {
  const playing = getPlacesPlayingNow(places, now);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gold py-3 font-display text-base lg:py-4 lg:text-xl font-bold tracking-wide text-ink shadow-md active:scale-[0.98]"
      >
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-ink" />
        Co hraje právě teď
        <span className="rounded-full bg-ink/15 px-2 py-0.5 text-sm lg:text-lg tabular-nums">
          {playing.length}
        </span>
      </button>

      {open && (
        <div className="paper absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border-2 border-parch-3 bg-parch shadow-2xl">
          {playing.length === 0 ? (
            <p className="p-4 text-center font-serif text-sm italic text-ink-soft">
              Teď zrovna nikde nic nehraje.
            </p>
          ) : (
            <ul className="max-h-[50vh] divide-y divide-parch-3/60 overflow-y-auto">
              {playing.map(({ place, item }) => (
                <li key={place.id}>
                  <button
                    type="button"
                    onClick={() => onPick(place)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-parch-3/40"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-red font-display text-sm font-bold text-parch-2">
                      {place.number}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-ink">
                        {place.name}
                      </span>
                      <span className="block truncate text-sm font-semibold text-brand-red">
                        {item.title}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

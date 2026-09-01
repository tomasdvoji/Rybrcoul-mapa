// Očíslovaný marker na mapě (mapa sama čísla nemá – kreslí je aplikace,
// stejným stylem jako původní grafika: červený čtvereček s bílým číslem).
// Na mobilu jsou markery menší, aby se v hustém centru nepřekrývaly
// a dalo se klikat na každý zvlášť; na PC jsou větší.
// Vybraný podnik se zvětší a zmodrá, tam kde právě hraje, pulzuje kroužek.
export default function MapPoint({ place, active, playing, onClick }) {
  const { x, y } = place.mapPosition;

  return (
    <button
      type="button"
      onClick={() => onClick(place)}
      aria-label={`${place.number} – ${place.name}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      className="absolute z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 touch-manipulation items-center justify-center lg:h-11 lg:w-11"
    >
      <span
        className={[
          "flex items-center justify-center rounded-[4px] border font-display font-bold leading-none text-white shadow-md transition-all",
          active
            ? "z-20 h-7 w-7 scale-110 border-white bg-[#1a73e8] text-xs lg:h-10 lg:w-10 lg:text-lg"
            : "h-5 w-5 border-white/80 bg-brand-red text-[10px] lg:h-9 lg:w-9 lg:text-base",
          playing && !active ? "animate-pulse-ring" : "",
        ].join(" ")}
      >
        {place.number}
      </span>
    </button>
  );
}

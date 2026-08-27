// Očíslovaný marker na mapě (mapa sama čísla nemá – kreslí je aplikace,
// stejným stylem jako původní grafika: červený čtvereček s bílým číslem).
// Vybraný podnik se zvětší a zmodrá, tam kde právě hraje, pulzuje kroužek.
export default function MapPoint({ place, active, playing, onClick }) {
  const { x, y } = place.mapPosition;

  return (
    <button
      type="button"
      onClick={() => onClick(place)}
      aria-label={`${place.number} – ${place.name}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      className="absolute z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 touch-manipulation items-center justify-center"
    >
      <span
        className={[
          "flex items-center justify-center rounded-[5px] border font-display font-bold leading-none text-white shadow-md transition-all",
          active
            ? "z-20 h-10 w-10 scale-110 border-white bg-[#1a73e8] text-lg shadow-lg"
            : "h-9 w-9 border-white/80 bg-brand-red text-base",
          playing && !active ? "animate-pulse-ring" : "",
        ].join(" ")}
      >
        {place.number}
      </span>
    </button>
  );
}

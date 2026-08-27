import MapPoint from "./MapPoint.jsx";
import mapImg from "../assets/map.jpg";

// Obrázek mapy s absolutně pozicovanými klikacími body.
// Celá mapa se vejde na šířku displeje (všechny body jsou vidět najednou).
// Pro detail jde mapa přiblížit pinch-zoomem.
export default function EventMap({ places, selectedId, playingIds, onSelect }) {
  return (
    <div className="no-scrollbar w-full overflow-auto overscroll-contain rounded-xl border-2 border-parch-3 bg-parch-2 shadow-inner ring-1 ring-ink/10">
      <div className="relative w-full select-none">
        <img
          src={mapImg}
          alt="Mapa akce Rybrcoul – Otevřené hospody 2025"
          className="block w-full"
          draggable={false}
        />
        <div className="absolute inset-0">
          {places.map((place) => (
            <MapPoint
              key={place.id}
              place={place}
              active={place.id === selectedId}
              playing={playingIds.has(place.id)}
              onClick={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

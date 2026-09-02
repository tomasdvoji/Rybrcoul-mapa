import { useRef, useState } from "react";
import MapPoint from "./MapPoint.jsx";
import mapImg from "../assets/map.jpg";

// Obrázek mapy s absolutně pozicovanými klikacími body.
// Mapa jde přiblížit gestem dvou prstů (pinch) i tlačítky +/− ;
// přiblížená mapa se posouvá prstem/scrollem uvnitř rámečku.
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

export default function EventMap({ places, selectedId, playingIds, onSelect }) {
  const [zoom, setZoom] = useState(1);
  const scrollRef = useRef(null);
  const pinchRef = useRef(null); // {dist, zoom} na začátku gesta

  const clamp = (z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

  // Zoom se zachováním bodu uprostřed výřezu
  const applyZoom = (newZoom) => {
    const sc = scrollRef.current;
    const z = clamp(newZoom);
    if (!sc || z === zoom) return;
    const f = z / zoom;
    const cx = sc.scrollLeft + sc.clientWidth / 2;
    const cy = sc.scrollTop + sc.clientHeight / 2;
    setZoom(z);
    requestAnimationFrame(() => {
      sc.scrollLeft = cx * f - sc.clientWidth / 2;
      sc.scrollTop = cy * f - sc.clientHeight / 2;
    });
  };

  const touchDist = (e) => {
    const [a, b] = e.touches;
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  };

  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      pinchRef.current = { dist: touchDist(e), zoom };
    }
  };
  const onTouchMove = (e) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      applyZoom(pinchRef.current.zoom * (touchDist(e) / pinchRef.current.dist));
    }
  };
  const onTouchEnd = (e) => {
    if (e.touches.length < 2) pinchRef.current = null;
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: "pan-x pan-y" }}
        className="no-scrollbar max-h-[80vh] w-full overflow-auto overscroll-contain rounded-xl border-2 border-parch-3 bg-parch-2 shadow-inner ring-1 ring-ink/10"
      >
        <div
          className="relative select-none"
          style={{ width: `${zoom * 100}%` }}
        >
          <img
            src={mapImg}
            alt="Mapa akce Otevřené hospody 2026"
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

      {/* Tlačítka zoomu */}
      <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-2">
        <button
          type="button"
          aria-label="Přiblížit"
          onClick={() => applyZoom(zoom * 1.5)}
          className="h-10 w-10 rounded-full border border-parch-3 bg-forest font-display text-xl font-bold text-parch-2 shadow-md active:scale-95"
        >
          +
        </button>
        <button
          type="button"
          aria-label="Oddálit"
          onClick={() => applyZoom(zoom / 1.5)}
          className="h-10 w-10 rounded-full border border-parch-3 bg-forest font-display text-xl font-bold text-parch-2 shadow-md active:scale-95"
        >
          −
        </button>
      </div>
    </div>
  );
}

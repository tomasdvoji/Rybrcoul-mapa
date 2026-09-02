import { useEffect, useRef, useState } from "react";
import MapPoint from "./MapPoint.jsx";
import mapImg from "../assets/map.jpg";

// Obrázek mapy s absolutně pozicovanými klikacími body.
// Pinch-zoom dvěma prsty je plynulý: během gesta se šířka mapy mění přímo
// v DOM (bez čekání na React) a zoom se kotví k bodu mezi prsty.
const MIN_ZOOM = 1;
const MAX_ZOOM = 5;

export default function EventMap({ places, selectedId, playingIds, onSelect }) {
  const [zoom, setZoom] = useState(1);
  const scrollRef = useRef(null);
  const innerRef = useRef(null);
  const zoomRef = useRef(1);

  const clamp = (z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

  // Nastaví zoom a udrží bod (ax, ay) v souřadnicích výřezu na místě
  const setZoomAt = (newZoom, ax, ay, commit) => {
    const sc = scrollRef.current;
    const inner = innerRef.current;
    const z = clamp(newZoom);
    if (!sc || !inner || z === zoomRef.current) return;
    const f = z / zoomRef.current;
    const cx = sc.scrollLeft + ax;
    const cy = sc.scrollTop + ay;
    zoomRef.current = z;
    inner.style.width = `${z * 100}%`;
    sc.scrollLeft = cx * f - ax;
    sc.scrollTop = cy * f - ay;
    if (commit) setZoom(z);
  };

  // Nativní touch listenery (passive: false, aby šlo zrušit scroll stránky)
  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;
    let pinch = null; // {dist, zoom}

    const dist = (e) =>
      Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    const mid = (e) => {
      const r = sc.getBoundingClientRect();
      return [
        (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left,
        (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top,
      ];
    };

    const onStart = (e) => {
      if (e.touches.length === 2) {
        pinch = { dist: dist(e), zoom: zoomRef.current };
        e.preventDefault();
      }
    };
    const onMove = (e) => {
      if (e.touches.length === 2 && pinch) {
        e.preventDefault();
        const [ax, ay] = mid(e);
        setZoomAt(pinch.zoom * (dist(e) / pinch.dist), ax, ay, false);
      }
    };
    const onEnd = (e) => {
      if (pinch && e.touches.length < 2) {
        pinch = null;
        setZoom(zoomRef.current); // srovnat React stav po gestu
      }
    };

    sc.addEventListener("touchstart", onStart, { passive: false });
    sc.addEventListener("touchmove", onMove, { passive: false });
    sc.addEventListener("touchend", onEnd);
    sc.addEventListener("touchcancel", onEnd);
    return () => {
      sc.removeEventListener("touchstart", onStart);
      sc.removeEventListener("touchmove", onMove);
      sc.removeEventListener("touchend", onEnd);
      sc.removeEventListener("touchcancel", onEnd);
    };
  }, []);

  const buttonZoom = (factor) => {
    const sc = scrollRef.current;
    if (!sc) return;
    setZoomAt(zoomRef.current * factor, sc.clientWidth / 2, sc.clientHeight / 2, true);
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        style={{ touchAction: "pan-x pan-y" }}
        className="no-scrollbar max-h-[80vh] w-full overflow-auto overscroll-contain rounded-xl border-2 border-parch-3 bg-parch-2 shadow-inner ring-1 ring-ink/10"
      >
        <div
          ref={innerRef}
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
          onClick={() => buttonZoom(1.5)}
          className="h-10 w-10 rounded-full border border-parch-3 bg-forest font-display text-xl font-bold text-parch-2 shadow-md active:scale-95"
        >
          +
        </button>
        <button
          type="button"
          aria-label="Oddálit"
          onClick={() => buttonZoom(1 / 1.5)}
          className="h-10 w-10 rounded-full border border-parch-3 bg-forest font-display text-xl font-bold text-parch-2 shadow-md active:scale-95"
        >
          −
        </button>
      </div>
    </div>
  );
}

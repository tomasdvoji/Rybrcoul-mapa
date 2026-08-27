import { useEffect, useMemo, useState } from "react";
import placesData from "./data/places.json";
import EventMap from "./components/EventMap.jsx";
import PlaceBottomSheet from "./components/PlaceBottomSheet.jsx";
import NowPlayingButton from "./components/NowPlayingButton.jsx";
import SearchBar from "./components/SearchBar.jsx";
import PlaceList from "./components/PlaceList.jsx";
import { getPlacesPlayingNow } from "./lib/program.js";
import stag from "./assets/rybrcoul-logo.svg";

// Demo čas = uprostřed festivalu. Slouží k vyzkoušení zvýraznění „Právě hraje“
// před začátkem akce (19. 9. 2026). V den akce přepněte na reálný čas.
const DEMO_TIME = new Date("2026-09-19T18:20:00+02:00");

export default function App() {
  const [realNow, setRealNow] = useState(() => new Date());
  const [demo, setDemo] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [nowOpen, setNowOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setRealNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const now = demo ? DEMO_TIME : realNow;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return placesData;
    return placesData.filter((p) => {
      if (p.name.toLowerCase().includes(q)) return true;
      if (p.stage && p.stage.toLowerCase().includes(q)) return true;
      return (p.program || []).some(
        (it) =>
          it.title.toLowerCase().includes(q) ||
          (it.description || "").toLowerCase().includes(q)
      );
    });
  }, [query]);

  const playingIds = useMemo(
    () => new Set(getPlacesPlayingNow(placesData, now).map((e) => e.place.id)),
    [now]
  );

  const selectedPlace = placesData.find((p) => p.id === selectedId) || null;

  const handleSelect = (place) => {
    setSelectedId(place.id);
    setNowOpen(false);
  };

  return (
    <div className="paper mx-auto flex min-h-full max-w-md flex-col lg:max-w-none lg:px-4">
      {/* Hlavička – brand „duch hor“ */}
      <header className="sticky top-0 z-20 border-b-2 border-parch-3 bg-forest px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] text-parch-2 shadow-md">
        <div className="flex items-center gap-3">
          <img src={stag} alt="" className="stag-light h-9 w-auto" />
          <div className="flex-1">
            <h1 className="font-display text-xl font-black leading-none tracking-[0.12em] text-parch-2 lg:text-4xl">
              OTEVŘENÉ HOSPODY
            </h1>
            <p className="font-display text-[10px] font-medium uppercase tracking-[0.42em] text-brand-gold">
              Trutnov
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDemo((d) => !d)}
            className={[
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              demo
                ? "border-brand-gold/70 bg-brand-gold/20 text-brand-gold"
                : "border-parch-2/30 bg-white/5 text-parch-2/70",
            ].join(" ")}
          >
            {demo ? "Demo čas" : "Reálný čas"}
          </button>
        </div>
        <p className="mt-2 font-serif text-sm italic text-parch-2/80 lg:text-xl">
          Rýbrcoul &amp; sousedé · sobota 19. září 2026
        </p>

        <p className="mt-1 hidden text-center text-3xl font-bold text-brand-gold lg:block" style={{ fontFamily: '"Caveat", cursive' }}>
          Klikni na číslo na mapě a zjisti více!
        </p>

        <div className="mt-3 space-y-2">
          <SearchBar
            value={query}
            onChange={setQuery}
            resultCount={filtered.length}
          />
          <NowPlayingButton
            places={placesData}
            now={now}
            open={nowOpen}
            onToggle={() => setNowOpen((o) => !o)}
            onPick={handleSelect}
          />
        </div>
      </header>

      {/* Mapa (na PC velká vlevo, seznam vpravo) */}
      <main className="flex-1 px-2 py-3 lg:grid lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start lg:gap-8 lg:px-6 lg:py-6">
        <div className="lg:flex lg:items-start lg:gap-6">
          {/* PC: detail jako lišta ve volném prostoru vlevo od mapy */}
          {selectedPlace && (
            <div className="hidden lg:sticky lg:top-[17rem] lg:block lg:min-w-0 lg:flex-1">
              <PlaceBottomSheet
                place={selectedPlace}
                now={now}
                onClose={() => setSelectedId(null)}
                variant="panel"
              />
            </div>
          )}
          <div className="lg:ml-auto lg:w-[min(100%,calc(100vh-13rem))] lg:shrink-0">
            <EventMap
              places={filtered}
              selectedId={selectedId}
              playingIds={playingIds}
              onSelect={handleSelect}
            />

            <p className="px-2 py-3 text-center font-serif text-sm italic text-ink-soft lg:text-base">
              Klepni na číslo na mapě nebo v seznamu a objeví se program.
            </p>
          </div>
        </div>

        {/* Rejstřík všech míst */}
        <div className="lg:sticky lg:top-[17rem] lg:max-h-[calc(100vh-18rem)] lg:overflow-y-auto lg:pr-1">
          <div className="mt-1 flex items-center gap-3 px-1 pb-2">
            <span className="h-px flex-1 bg-parch-3" />
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-ink-soft">
              {query ? "Nalezená místa" : "Všechna místa"}
            </h2>
            <span className="h-px flex-1 bg-parch-3" />
          </div>
          <PlaceList
            places={filtered}
            now={now}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </div>
      </main>

      {/* Mobil: spodní vysouvací panel */}
      <div className="lg:hidden">
        <PlaceBottomSheet
          place={selectedPlace}
          now={now}
          onClose={() => setSelectedId(null)}
        />
      </div>
    </div>
  );
}

# Otevřené hospody 2026 (Trutnov) – interaktivní mapa

Mobilní webová aplikace: mapa akce + klikací očíslované body 1–28 + program
+ „Právě hraje“ + navigace přes Google Maps. React + Vite + Tailwind, bez backendu,
data v JSONu. Vychází z aplikace Rýbrcoul 2025, s mapou a programem ročníku 2026.

## Spuštění (vývoj)

```bash
npm install
npm run dev      # vývoj (http://localhost:5173)
npm run build    # produkční build do dist/
```

## Nasazení (pro IT správce)

Obsah složky `dist/` nahrajte na web, např. do `https://vase-domena.cz/mapa/`.
Build používá relativní cesty, podadresář nevadí. Nic se neinstaluje, žádný server.

## Co kde upravit

- **Místa a program** → `src/data/places.json`
  (po úpravě znovu `npm run build`)
- **Pozice bodů na mapě** → pole `mapPosition` v každém místě
  (procenta: `x` zleva, `y` shora)
- **GPS podniků** → doplňte `"lat"` a `"lng"` k místu; dokud chybí,
  navigace použije `address`
- **Obrázek mapy** → `src/assets/map.jpg`
- **Demo čas** → `DEMO_TIME` v `src/App.jsx` (tlačítko „Demo čas“ v hlavičce
  přepíná mezi demo a reálným časem; v den akce se používá reálný čas)

## Struktura jednoho místa

```json
{
  "id": 1,
  "number": 1,
  "name": "Pohoda",
  "stage": "HELION STAGE",
  "address": "Tržnice, Trutnov",
  "lat": 50.5609,
  "lng": 15.9123,
  "mapPosition": { "x": 43.3, "y": 43.5 },
  "program": [
    { "start": "2026-09-19T13:30:00+02:00", "end": "2026-09-19T14:30:00+02:00",
      "title": "Pjet Samyc", "description": "babský music gang" }
  ]
}
```

Poznámka: u vystoupení „do vyčerpání“ / bez uvedeného konce jsou konce odhadnuté.
Program se zobrazuje kolem současnosti: nahoře co bude, uprostřed „Právě hraje“,
dole co už bylo — panel se po otevření sám vycentruje na teď.

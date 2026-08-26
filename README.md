# Trutnov otevřené hospody – interaktivní mapa

Statická webová aplikace (HTML + CSS + vanilla JS + Leaflet). **Žádný backend, žádná databáze, žádné API klíče.**

## Pro IT správce webu

1. Vezměte obsah složky `dist/`.
2. Nahrajte ho na web, například do `https://vase-domena.cz/mapa/`.
3. Hotovo. Nic se neinstaluje, nic neběží na serveru.

Důležité: web musí běžet přes **HTTPS**, jinak prohlížeče nepovolí geolokaci („Moje poloha“).

## Editace dat (bez znalosti programování)

| Co chci změnit | Soubor |
|---|---|
| Názvy podniků, čísla, GPS souřadnice, pozice čísla na obrázku | `data/venues.json` |
| Interpreti a časy programu | `data/program.json` |
| Kalibrace GPS ↔ obrázek, rozměry obrázku, DEBUG režim | `js/config.js` |
| Obrázek mapy | `assets/mapa.jpg` (přepsat stejným názvem) |

Časy v `program.json` pište jako plné ISO s časovou zónou, např. `"2026-09-19T18:00:00+02:00"`.

### Doplnění GPS podniků
V `data/venues.json` nahraďte `"latitude": 0, "longitude": 0` skutečnými souřadnicemi (např. z Google Maps – pravý klik na místo → souřadnice). Bez nich nefunguje tlačítko Navigovat a vzdálenosti.

### Kalibrace polohy uživatele na obrázku
1. V `js/config.js` nastavte `const DEBUG = true;`.
2. Otevřete mapu a klikejte na místa – dole se zobrazí `imageX`/`imageY`. Takto ověříte i pozice červených čísel (hotspotů).
3. Vyberte 3–6 dobře rozprostřených bodů (rohy náměstí, křižovatky), zjistěte jejich skutečné GPS a pixelové souřadnice a zapište je do `calibrationPoints` v `js/config.js`.
4. Vraťte `DEBUG = false;` pro produkci.

Dokud kalibrace není vyplněná, aplikace polohu na mapě nezobrazuje (ale navigace do Google Maps funguje).

### Rozšířená mapa (volitelně)
Pokud vznikne rozšířená varianta mapy s dokresleným okolím (`assets/mapa-extended.webp`, originál uvnitř nesmí být změněn):

1. Nahrajte soubor do `assets/mapa-extended.webp`.
2. V `js/config.js` nastavte `USE_EXTENDED_MAP = true` a vyplňte `EXTENDED_WIDTH`, `EXTENDED_HEIGHT` a `EXTENDED_OFFSET_X/Y` (o kolik pixelů je originální mapa posunutá od levého horního rohu rozšířeného obrázku).
3. Hotspoty ani kalibraci není třeba přepočítávat – zadávají se pořád v pixelech originálu, posun se přičítá automaticky.

Přepnutí zpět: `USE_EXTENDED_MAP = false`. Když rozšířený soubor chybí nebo se nenačte, aplikace automaticky použije `mapa.jpg`.

## Lokální testování

Ve složce projektu spusťte jednoduchý server (kvůli `fetch` JSON souborů nestačí otevřít soubor přímo):

```bash
python -m http.server 8000
```

a otevřete `http://localhost:8000/`. Geolokace na `localhost` funguje i bez HTTPS.

## Sestavení dist/

`dist/` je prostá kopie produkčních souborů. Po úpravách ji obnovte zkopírováním: `index.html`, `sw.js`, `css/`, `js/`, `data/`, `assets/`, `vendor/`.

# Otevřené hospody 2026 – mapa: návod k nasazení

## Co to je
Statická webová aplikace (HTML + CSS + JS). Žádný server, žádná databáze,
žádné API klíče.

## Nasazení
1. Obsah této složky nahrajte na web, např. do `https://vase-domena.cz/mapa/`.
2. Hotovo. Aplikace používá relativní cesty, podadresář nevadí.
3. Web musí běžet přes HTTPS (kvůli budoucí geolokaci; dnes standard).

## Změny programu / dat
Data (podniky, program, pozice na mapě) jsou zabudovaná v buildu.
Změny se dělají ve zdrojovém projektu v souboru `src/data/places.json`
a poté se spustí `npm run build` – vznikne nová verze této složky.
Zdrojový projekt má správce aplikace (repozitář Rybrcoul mapa).

## Kontakt
Aplikace pro akci Trutnov – Otevřené hospody, sobota 19. září 2026.

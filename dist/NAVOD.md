# Otevřené hospody 2026 – mapa: návod k nasazení

## Co to je
Statická webová aplikace (HTML + CSS + JS). Žádný server, žádná databáze,
žádné API klíče, žádná instalace.

## Nasazení
1. Obsah této složky (index.html + složka assets) nahrajte na web,
   např. do `https://vase-domena.cz/mapa/`.
2. Hotovo. Aplikace používá relativní cesty, takže podadresář nevadí.
3. Web má běžet přes HTTPS (dnes standard).

## Změny programu / dat
Data (podniky, program, pozice na mapě) jsou zabudovaná v buildu.
Změny se dělají ve zdrojovém projektu v souboru `src/data/places.json`
a poté se spustí `npm run build` – vznikne nová verze této složky,
kterou stačí znovu nahrát.

Akce: Trutnov – Otevřené hospody, sobota 19. září 2026.

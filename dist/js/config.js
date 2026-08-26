// ====================================================================
// KONFIGURACE – tady se mění vše, co není program/podniky (ty jsou v
// data/venues.json a data/program.json).
// ====================================================================

// Zapnout vývojářský režim: klik do mapy vypíše imageX/imageY,
// zobrazí kalibrační body a loguje kalibrační chybu.
const DEBUG = false;

// Rozměry originálního obrázku assets/mapa.jpg v pixelech.
const IMAGE_WIDTH = 1254;
const IMAGE_HEIGHT = 1254;

// ====================================================================
// ROZŠÍŘENÁ MAPA (volitelná)
// --------------------------------------------------------------------
// Pokud existuje assets/mapa-extended.webp (originální mapa + dokreslené
// okolí) a USE_EXTENDED_MAP je true, použije se místo mapa.jpg.
// Když soubor chybí nebo se nenačte, aplikace automaticky spadne zpět
// na mapa.jpg – nic se nerozbije.
// EXTENDED_OFFSET_X/Y = kolik pixelů je originální mapa odsazená od
// levého horního rohu rozšířeného obrázku. Všechny souřadnice
// (hotspoty ve venues.json i kalibrační body) se zadávají POŘÁD
// v pixelech originálního obrázku – odsazení se přičítá automaticky.
// ====================================================================
// Nová mapa už okolí obsahuje, rozšířená varianta není potřeba.
const USE_EXTENDED_MAP = false;
const EXTENDED_MAP_FILE = "assets/mapa-extended.webp";
const EXTENDED_WIDTH = 2868;   // šířka rozšířeného obrázku v px
const EXTENDED_HEIGHT = 2868;  // výška rozšířeného obrázku v px
const EXTENDED_OFFSET_X = 410; // posun originálu uvnitř rozšířeného obrázku
const EXTENDED_OFFSET_Y = 410;

// Datum a čas akce (plné ISO, Europe/Prague):
const EVENT_START = "2026-09-19T10:00:00+02:00";
const EVENT_END   = "2026-09-19T23:59:00+02:00";

// ====================================================================
// KALIBRACE GPS -> OBRÁZEK
// --------------------------------------------------------------------
// Sem doplňte alespoň 3 (ideálně 4–6) bodů, u kterých znáte skutečné
// GPS souřadnice I pozici na obrázku (x, y v pixelech originálu).
// Pozici na obrázku zjistíte v DEBUG režimu kliknutím do mapy.
// Dokud je pole prázdné nebo má méně než 3 body, poloha uživatele se
// na festivalové mapě nezobrazuje (jen navigace do Google Maps).
// ====================================================================
const calibrationPoints = [
  // { lat: 50.561000, lng: 15.912800, x: 1060, y: 1261 }, // Krakonošovo náměstí
  // { lat: 50.564500, lng: 15.906900, x: 556,  y: 377  }, // UFFO
  // { lat: 50.559800, lng: 15.917900, x: 1435, y: 566  }, // Sokolovna
];

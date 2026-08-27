// Pomocné funkce pro práci s programem a navigací.

/**
 * Stav jedné položky programu vůči aktuálnímu času.
 * Vrací: "now" | "next" | "past" | "future"
 *
 * Pozn.: "next" se vyhodnocuje vůči celému programu místa, proto funkce
 * potřebuje znát i ostatní položky. Pokud je předáš, najde nejbližší
 * budoucí položku a označí ji jako "next". Bez kontextu vrací jen
 * now/past/future.
 */
export function getProgramStatus(programItem, currentTime, allItems = null) {
  const now = currentTime instanceof Date ? currentTime : new Date(currentTime);
  const start = new Date(programItem.start);
  const end = new Date(programItem.end);

  if (now >= start && now < end) return "now";
  if (now >= end) return "past";

  // Položka je v budoucnu. Je to nejbližší budoucí (= "Následuje")?
  if (allItems && allItems.length) {
    const nextItem = getNextItem(allItems, now);
    if (nextItem && nextItem.start === programItem.start) return "next";
  }
  return "future";
}

/** Najde nejbližší budoucí položku (první, která ještě nezačala). */
export function getNextItem(items, currentTime) {
  const now = currentTime instanceof Date ? currentTime : new Date(currentTime);
  return (
    [...items]
      .filter((it) => new Date(it.start) > now)
      .sort((a, b) => new Date(a.start) - new Date(b.start))[0] || null
  );
}

/** Najde právě probíhající položku programu místa (nebo null). */
export function getNowPlaying(items, currentTime) {
  const now = currentTime instanceof Date ? currentTime : new Date(currentTime);
  return (
    items.find((it) => now >= new Date(it.start) && now < new Date(it.end)) ||
    null
  );
}

/** Seznam všech míst, kde právě něco hraje. */
export function getPlacesPlayingNow(places, currentTime) {
  return places
    .map((place) => ({
      place,
      item: getNowPlaying(place.program || [], currentTime),
    }))
    .filter((entry) => entry.item !== null);
}

/** Formátování času HH:MM z ISO stringu. */
export function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("cs-CZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Otevře Google Maps na místo.
 * Preferuje GPS (lat/lng), jinak použije adresu.
 */
export function openNavigation(place) {
  let query;
  if (typeof place.lat === "number" && typeof place.lng === "number") {
    query = `${place.lat},${place.lng}`;
  } else {
    query = place.address || place.name;
  }
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query
  )}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

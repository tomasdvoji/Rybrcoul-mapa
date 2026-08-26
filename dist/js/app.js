/* Trutnov otevřené hospody – aplikační logika.
 * Data se NEmění tady, ale v:
 *   data/venues.json  – názvy, čísla, GPS a pozice hotspotů na obrázku
 *   data/program.json – interpreti a časy
 *   js/config.js      – DEBUG, rozměry obrázku, kalibrace GPS
 */
(function () {
  "use strict";

  var venues = [];
  var program = [];
  var youMarker = null;
  var userPos = null;          // {lat, lng} – jen v prohlížeči, nikam se neodesílá
  var openVenueId = null;
  var sortNearest = false;

  // ---------- pomocné ----------
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  }); }

  function toast(msg, retryFn) {
    var t = $("toast");
    t.innerHTML = esc(msg) + (retryFn ? ' <button id="toast-retry">Zkusit znovu</button>' : "");
    t.hidden = false;
    if (retryFn) $("toast-retry").onclick = function () { t.hidden = true; retryFn(); };
    else setTimeout(function () { t.hidden = true; }, 4000);
  }

  function fmtTime(d) {
    return d.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Prague" });
  }

  function minutesUntil(date, now) { return Math.round((date - now) / 60000); }

  function relLabel(mins) {
    if (mins < 1) return "Za chvíli";
    if (mins < 60) return "Za " + mins + " min";
    if (mins >= 1440) return "19. 9.";
    var h = Math.floor(mins / 60), m = mins % 60;
    return "Za " + h + " h" + (m ? " " + m + " min" : "");
  }

  // Program podniku, chronologicky, s Date objekty
  function venueProgram(venueId) {
    return program
      .filter(function (p) { return p.venueId === venueId; })
      .map(function (p) { return { artist: p.artist, start: new Date(p.start), end: new Date(p.end) }; })
      .filter(function (p) { return !isNaN(p.start) && !isNaN(p.end); })
      .sort(function (a, b) { return a.start - b.start; });
  }

  // Stav podniku: {current, next, all}
  function venueState(venueId, now) {
    var items = venueProgram(venueId);
    var current = null, next = null;
    items.forEach(function (p) {
      if (p.start <= now && now < p.end) current = p;
      else if (p.start > now && !next) next = p;
    });
    return { current: current, next: next, all: items };
  }

  // Haversine (metry)
  function distMeters(a, b) {
    var R = 6371000, rad = Math.PI / 180;
    var dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
    var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(a.lat * rad) * Math.cos(b.lat * rad) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(s));
  }

  function venueDistance(v) {
    if (!userPos || !v.latitude || !v.longitude) return null;
    return distMeters(userPos, { lat: v.latitude, lng: v.longitude });
  }

  function fmtDist(m) {
    return m < 1000 ? Math.round(m) + " m od vás" : (m / 1000).toFixed(1) + " km od vás";
  }

  // ---------- kalibrace: afinní best-fit GPS -> pixely obrázku ----------
  // x = a*lat + b*lng + c ; y = d*lat + e*lng + f (nejmenší čtverce, >=3 body)
  var affine = null;
  function computeAffine(points) {
    if (!points || points.length < 3) return null;
    function solve(target) {
      var S = [[0,0,0],[0,0,0],[0,0,0]], T = [0,0,0];
      points.forEach(function (p) {
        var row = [p.lat, p.lng, 1], t = p[target];
        for (var i = 0; i < 3; i++) {
          T[i] += row[i] * t;
          for (var j = 0; j < 3; j++) S[i][j] += row[i] * row[j];
        }
      });
      // Gaussova eliminace 3x3
      var A = S.map(function (r, i) { return r.concat([T[i]]); });
      for (var c = 0; c < 3; c++) {
        var piv = c;
        for (var r = c + 1; r < 3; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
        if (Math.abs(A[piv][c]) < 1e-12) return null;
        var tmp = A[c]; A[c] = A[piv]; A[piv] = tmp;
        for (r = 0; r < 3; r++) {
          if (r === c) continue;
          var f = A[r][c] / A[c][c];
          for (var k = c; k < 4; k++) A[r][k] -= f * A[c][k];
        }
      }
      return [A[0][3] / A[0][0], A[1][3] / A[1][1], A[2][3] / A[2][2]];
    }
    var X = solve("x"), Y = solve("y");
    if (!X || !Y) return null;
    var fn = function (lat, lng) {
      return { x: X[0]*lat + X[1]*lng + X[2], y: Y[0]*lat + Y[1]*lng + Y[2] };
    };
    if (DEBUG) {
      var err = 0;
      points.forEach(function (p) {
        var q = fn(p.lat, p.lng);
        err = Math.max(err, Math.hypot(q.x - p.x, q.y - p.y));
      });
      console.log("[DEBUG] Kalibrace: max chyba " + err.toFixed(1) + " px na " + points.length + " bodech");
    }
    return fn;
  }

  // ---------- mapa: obrázek + absolutně pozicované hotspoty ----------
  // Aktivní podklad (originál, nebo rozšířená varianta s odsazením).
  // Souřadnice v datech jsou vždy v pixelech ORIGINÁLU; offset je posun
  // originálu uvnitř rozšířeného obrázku.
  var mapW = IMAGE_WIDTH, mapH = IMAGE_HEIGHT, offX = 0, offY = 0;

  function pctPos(el, x, y) {
    el.style.left = ((x + offX) / mapW * 100) + "%";
    el.style.top = ((y + offY) / mapH * 100) + "%";
  }

  // Zkusí rozšířenou mapu, při chybě zůstane originál. Vrací Promise.
  function chooseMap() {
    var img = $("map-img");
    if (!USE_EXTENDED_MAP || !EXTENDED_WIDTH || !EXTENDED_HEIGHT) {
      return Promise.resolve();
    }
    return new Promise(function (resolve) {
      var test = new Image();
      test.onload = function () {
        img.src = EXTENDED_MAP_FILE;
        mapW = EXTENDED_WIDTH; mapH = EXTENDED_HEIGHT;
        offX = EXTENDED_OFFSET_X; offY = EXTENDED_OFFSET_Y;
        resolve();
      };
      test.onerror = function () { resolve(); }; // fallback: mapa.jpg
      test.src = EXTENDED_MAP_FILE;
    });
  }

  function initMap() {
    var wrap = $("map-wrap");
    venues.forEach(function (v) {
      var b = document.createElement("button");
      b.className = "hotspot";
      b.id = "hs-" + v.id;
      b.setAttribute("aria-label", v.id + " " + v.name);
      b.innerHTML = '<span class="dot"></span>';
      pctPos(b, v.imageX, v.imageY);
      b.addEventListener("click", function () { openVenue(v.id); });
      wrap.appendChild(b);
    });

    if (DEBUG) {
      var badge = document.createElement("div");
      badge.className = "debug-badge";
      badge.textContent = "DEBUG: klikni do mapy pro imageX/imageY";
      document.body.appendChild(badge);
      $("map-img").addEventListener("click", function (e) {
        var r = e.target.getBoundingClientRect();
        var x = Math.round((e.clientX - r.left) / r.width * mapW - offX);
        var y = Math.round((e.clientY - r.top) / r.height * mapH - offY);
        badge.textContent = 'DEBUG  "imageX": ' + x + ', "imageY": ' + y;
        console.log("[DEBUG] imageX:", x, "imageY:", y);
      });
      calibrationPoints.forEach(function (p) {
        var m = document.createElement("div");
        m.className = "calib-marker";
        m.title = "Kalibrační bod " + p.lat + ", " + p.lng;
        pctPos(m, p.x, p.y);
        wrap.appendChild(m);
      });
    }
  }

  // Mapa je celá vidět; při výběru podniku jen sroluje stránku k mapě.
  function scrollToVenue(v) {
    $("map-frame").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ---------- detail podniku ----------
  function openVenue(id) {
    openVenueId = id;
    renderSheet();
    $("sheet").hidden = false;
    var v = venues.find(function (x) { return x.id === id; });
    if (v) scrollToVenue(v);
  }

  function closeSheet() { $("sheet").hidden = true; openVenueId = null; }

  function navUrl(v) {
    var dest = v.latitude + "," + v.longitude;
    var u = "https://www.google.com/maps/dir/?api=1&destination=" + dest + "&travelmode=walking";
    if (userPos) u += "&origin=" + userPos.lat + "," + userPos.lng;
    return u;
  }

  function renderSheet() {
    if (openVenueId === null) return;
    var v = venues.find(function (x) { return x.id === openVenueId; });
    if (!v) return;
    var now = new Date();
    var st = venueState(v.id, now);
    var html = '<h2><span class="venue-num">' + v.id + "</span>" + esc(v.name) + "</h2>";

    var d = venueDistance(v);
    if (d !== null) html += '<div class="dist">' + fmtDist(d) + "</div>";

    if (st.current) {
      html += '<div class="status-block live"><div class="label">🟢 PRÁVĚ HRAJE</div>' +
        '<div class="artist">' + esc(st.current.artist) + "</div>" +
        '<div class="time">' + fmtTime(st.current.start) + "–" + fmtTime(st.current.end) +
        " · Končí za " + Math.max(1, minutesUntil(st.current.end, now)) + " min</div></div>";
    }
    if (st.next) {
      html += '<div class="status-block next"><div class="label">🟡 NÁSLEDUJE</div>' +
        '<div class="artist">' + esc(st.next.artist) + "</div>" +
        '<div class="time">' + fmtTime(st.next.start) + "–" + fmtTime(st.next.end) +
        " · " + relLabel(minutesUntil(st.next.start, now)) + "</div></div>";
    }
    if (!st.current && !st.next && st.all.length) {
      html += '<p class="empty-note">Dnešní program v tomto podniku už skončil.</p>';
    }

    if (st.all.length) {
      html += "<h3>Program</h3><ul class=\"program-list\">";
      st.all.forEach(function (p) {
        var cls = "", mark = "";
        if (p.end <= now) { cls = "past"; mark = "✓ "; }
        else if (p.start <= now) { cls = "now"; mark = "▶ "; }
        html += '<li class="' + cls + '">' + mark + fmtTime(p.start) + "–" + fmtTime(p.end) +
          " " + esc(p.artist) + "</li>";
      });
      html += "</ul>";
    } else {
      html += '<p class="empty-note">Tento podnik nemá vypsaný program.</p>';
    }

    if (v.latitude && v.longitude) {
      html += '<a class="btn-nav" target="_blank" rel="noopener" href="' + navUrl(v) + '">Navigovat</a>';
    } else {
      html += '<p class="empty-note">GPS souřadnice podniku zatím nejsou doplněny.</p>';
    }
    $("sheet-content").innerHTML = html;
  }

  // ---------- tečky stavu na mapě ----------
  function updateDots(now) {
    var liveCount = 0;
    venues.forEach(function (v) {
      var el = document.getElementById("hs-" + v.id);
      if (!el) return;
      var dot = el.querySelector(".dot");
      var st = venueState(v.id, now);
      dot.className = "dot";
      if (st.current) { dot.classList.add("live"); liveCount++; }
      else if (st.next && minutesUntil(st.next.start, now) <= 60) dot.classList.add("soon");
      else if (st.all.length) dot.classList.add("idle");
    });
    var nc = $("now-count");
    if (now < new Date(EVENT_START)) nc.textContent = "Festival ještě nezačal";
    else if (now > new Date(EVENT_END)) nc.textContent = "Festival už skončil";
    else if (liveCount) nc.textContent = "Právě hraje na " + liveCount + " místech";
    else nc.textContent = "";
  }

  // ---------- seznam podniků ----------
  function renderList() {
    var q = $("list-search").value.trim().toLowerCase();
    var now = new Date();
    var rows = venues.slice();

    if (q) {
      rows = rows.filter(function (v) {
        if (v.name.toLowerCase().indexOf(q) !== -1) return true;
        return venueProgram(v.id).some(function (p) {
          return p.artist.toLowerCase().indexOf(q) !== -1;
        });
      });
    }
    if (sortNearest && userPos) {
      rows.sort(function (a, b) {
        return (venueDistance(a) || 1e9) - (venueDistance(b) || 1e9);
      });
    } else {
      rows.sort(function (a, b) { return a.id - b.id; });
    }

    $("list-title").textContent = q ? "Nalezená místa" : "Všechna místa";
    var html = rows.map(function (v) {
      var st = venueState(v.id, now);
      var sub = "";
      if (st.current) sub += '<span class="live">🟢 ' + esc(st.current.artist) + " právě hraje</span><br>";
      if (st.next) sub += esc(st.next.artist) + " " + relLabel(minutesUntil(st.next.start, now)).toLowerCase();
      if (!sub) sub = st.all.length ? "program skončil" : "bez programu";
      var d = venueDistance(v);
      return '<div class="list-row" data-id="' + v.id + '">' +
        '<span class="venue-num">' + v.id + "</span>" +
        '<div class="info"><div class="name">' + esc(v.name) + '</div><div class="sub">' + sub + "</div></div>" +
        (d !== null ? '<span class="row-dist">' + fmtDist(d).replace(" od vás", "") + "</span>" : "") +
        "</div>";
    }).join("");
    $("list-items").innerHTML = html || '<p class="empty-note" style="padding:16px">Nic nenalezeno.</p>';
  }

  // ---------- geolokace ----------
  function startGeo() {
    if (!("geolocation" in navigator)) { toast("GPS není v tomto zařízení dostupná."); return; }
    toast("Povolit polohu pro zobrazení vaší pozice na mapě a navigaci k podnikům.");
    // Poloha se načítá jednorázově (žádný live tracking / watchPosition).
    navigator.geolocation.getCurrentPosition(function (pos) {
      userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      if (DEBUG) console.log("[DEBUG] GPS:", userPos, affine ? affine(userPos.lat, userPos.lng) : "(nekalibrováno)");
      if (affine) {
        var p = affine(userPos.lat, userPos.lng);
        if (p.x >= -offX - 100 && p.x <= mapW - offX + 100 &&
            p.y >= -offY - 100 && p.y <= mapH - offY + 100) {
          if (!youMarker) {
            youMarker = document.createElement("div");
            youMarker.className = "you-marker";
            youMarker.title = "Vy jste zde";
            $("map-wrap").appendChild(youMarker);
          }
          pctPos(youMarker, p.x, p.y);
        } else {
          toast("Jste mimo oblast festivalové mapy.");
        }
      } else {
        toast("Zobrazení polohy na festivalové mapě zatím není zkalibrované.");
      }
      if (openVenueId !== null) renderSheet();
    }, function (err) {
      userPos = null;
      if (err.code === err.PERMISSION_DENIED) {
        toast("Poloha není povolena.", startGeo);
      } else {
        toast("GPS není momentálně dostupná.", startGeo);
      }
    }, { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 });
  }

  // ---------- hodiny + periodická aktualizace ----------
  function tick() {
    var now = new Date();
    $("clock").textContent = fmtTime(now);
    updateDots(now);
    if (openVenueId !== null) renderSheet();
    renderList();
  }

  // ---------- start ----------
  function loadJson(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error(url);
      return r.json();
    });
  }

  Promise.all([loadJson("data/venues.json"), loadJson("data/program.json")])
    .then(function (res) {
      venues = res[0];
      program = res[1];
      affine = computeAffine(calibrationPoints);
      return chooseMap();
    })
    .then(function () {
      initMap();
      tick();
      setInterval(tick, 30000); // aktualizace každých 30 s

      $("btn-locate").onclick = startGeo;
      $("sheet-close").onclick = closeSheet;
      $("list-search").oninput = renderList;
      $("list-nearest").onclick = function () {
        if (!userPos) { startGeo(); }
        sortNearest = !sortNearest;
        $("list-nearest").classList.toggle("on", sortNearest);
        renderList();
      };
      $("list-items").onclick = function (e) {
        var row = e.target.closest(".list-row");
        if (!row) return;
        openVenue(parseInt(row.dataset.id, 10));
      };
    })
    .catch(function (e) {
      console.error(e);
      document.body.innerHTML =
        '<div style="padding:40px 20px;text-align:center;font-family:sans-serif">' +
        "<h2>Nepodařilo se načíst data mapy</h2><p>Zkuste stránku obnovit.</p>" +
        '<button onclick="location.reload()" style="padding:12px 24px;font-size:16px">Obnovit</button></div>';
    });

  // service worker – cache statických souborů pro špatný signál (nepovinné)
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").catch(function () { /* app funguje i bez něj */ });
  }
})();

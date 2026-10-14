// Contact page map: OpenStreetMap tiles + walking routes (src/assets/map/dojazd.geojson).
// Without JS the page still has the text directions and a link to openstreetmap.org.
(() => {
  const el = document.getElementById("map");
  if (!el || !window.L) return;
  const css = getComputedStyle(document.documentElement);
  const color = { tunel: css.getPropertyValue("--lab").trim(), sobieskiego: css.getPropertyValue("--workshop").trim() };

  const map = L.map(el, { scrollWheelZoom: false, tap: false }).setView([53.5931, 19.5662], 17);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  fetch(el.dataset.src)
    .then((r) => r.json())
    .then((data) => {
      const layer = L.geoJSON(data, {
        style: (f) =>
          f.properties.kind === "building"
            ? { color: "#1d2320", weight: 2, fillColor: color.tunel, fillOpacity: 0.35 }
            : { color: color[f.properties.id] || "#333", weight: 5, opacity: 0.9, dashArray: f.properties.id === "sobieskiego" ? "10 7" : null },
        pointToLayer: (f, latlng) =>
          L.circleMarker(latlng, { radius: 8, color: "#fff", weight: 3, fillColor: "#c0262d", fillOpacity: 1 }),
        onEachFeature: (f, l) => {
          const p = f.properties;
          l.bindPopup(`<strong>${p.name}</strong>${p.length ? `<br>${p.length} pieszo` : ""}`);
          if (p.kind === "entrance") l.bindTooltip("Wejście", { permanent: true, direction: "top", offset: [0, -8] });
        },
      }).addTo(map);
      map.fitBounds(layer.getBounds(), { padding: [24, 24] });
    })
    .catch(() => {});

  // Let keyboard users enable wheel zoom by focusing the map; mouse users by clicking it.
  el.addEventListener("click", () => map.scrollWheelZoom.enable());
  el.addEventListener("mouseleave", () => map.scrollWheelZoom.disable());
})();

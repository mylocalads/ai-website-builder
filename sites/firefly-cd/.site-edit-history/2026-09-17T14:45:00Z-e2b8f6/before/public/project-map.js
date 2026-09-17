/* project-map — map + filter engine.
 *
 * Plain ES5-style IIFE with no build step, no framework, and no Astro coupling.
 * That is what makes the phase-2 paste-anywhere embed cheap: phase 1 calls
 * mount() with same-origin relative paths, phase 2 calls the identical function
 * with absolute ones. There is no second code path to write.
 *
 *   window.MLAProjectMap.mount({
 *     root:        '#project-map',              // selector or element
 *     dataUrl:     '/projects.json',            // OR data: <payload object>
 *     leafletBase: '/vendor/leaflet/1.9.4',
 *   });
 *
 * KEEP IN LOCKSTEP WITH ProjectMap.astro — renderRow() and renderCard() below
 * must emit the same markup the component renders server-side. Phase 1 sets
 * data-pm-ssr="true" on the root and this file skips rendering entirely; phase 2
 * omits the attribute and this file renders the list and grid itself.
 */

(function () {
  'use strict';

  // Provider switch is this one line. OSM's tile policy prohibits heavy or
  // commercial use; if a client site takes real traffic, move to MapTiler,
  // Stadia, or Carto here.
  var TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  var TILE_ATTRIB = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  var TILE_MAX_ZOOM = 19;

  // Above this many pins, revisit clustering (leaflet.markercluster). Below it,
  // plain markers are imperceptible and clustering actively hurts — the whole
  // point of the page is "look how many jobs we have done in your town".
  var CLUSTER_THRESHOLD = 150;

  var FACETS = ['type', 'product', 'place'];

  function slugify(value) {
    return String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, ms);
    };
  }

  /* ---- Leaflet loading -------------------------------------------------
   * One code path for both phases. A host page that already has Leaflet does
   * not get a second copy. */

  function ensureLeaflet(base) {
    return new Promise(function (resolve, reject) {
      if (window.L && window.L.map) return resolve(window.L);

      if (!document.querySelector('link[data-pm-leaflet]')) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = base + '/leaflet.css';
        link.setAttribute('data-pm-leaflet', '');
        document.head.appendChild(link);
      }

      var existing = document.querySelector('script[data-pm-leaflet]');
      if (existing) {
        existing.addEventListener('load', function () { resolve(window.L); });
        existing.addEventListener('error', reject);
        return;
      }

      var s = document.createElement('script');
      s.src = base + '/leaflet.js';
      s.async = true;
      s.setAttribute('data-pm-leaflet', '');
      s.onload = function () { resolve(window.L); };
      s.onerror = function () { reject(new Error('leaflet failed to load')); };
      document.head.appendChild(s);
    });
  }

  /* ---- Pins -----------------------------------------------------------
   * divIcon rather than L.Icon.Default: Leaflet resolves default marker images
   * relative to the URL of the stylesheet that loaded, which 404s in every
   * non-standard layout. An inline SVG also inherits the client's brand colour
   * and stays crisp at any DPI, with zero image requests. */

  function pinIcon(L, accent) {
    return L.divIcon({
      className: 'pm-pin',
      iconSize: [26, 36],
      iconAnchor: [13, 36],
      popupAnchor: [0, -32],
      html:
        '<svg width="26" height="36" viewBox="0 0 26 36" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<path d="M13 0C5.82 0 0 5.82 0 13c0 9.75 13 23 13 23s13-13.25 13-23C26 5.82 20.18 0 13 0z" fill="' + accent + '"/>' +
        '<circle cx="13" cy="13" r="5" fill="#fff"/>' +
        '</svg>',
    });
  }

  function popupHtml(p) {
    var photo = p.photos && p.photos[0];
    // City and state only. Never a street address, never a house number,
    // never a day-level date.
    return (
      '<div class="pm-popup">' +
      (photo ? '<img src="' + esc(photo.url) + '" alt="' + esc(photo.alt) + '" loading="lazy">' : '') +
      '<div class="pm-popup-body">' +
      '<h3>' + esc(p.title) + '</h3>' +
      '<p>' + esc(p.completed_label) + ' &middot; ' + esc(p.project_type) + '</p>' +
      '</div></div>'
    );
  }

  /* ---- Markup (phase-2 only; must match ProjectMap.astro) ------------- */

  function renderRow(p) {
    var photo = p.photos && p.photos[0];
    return (
      '<li><button type="button" class="pm-row" data-project-id="' + esc(p.id) + '">' +
      (photo ? '<img src="' + esc(photo.url) + '" alt="' + esc(photo.alt) + '" loading="lazy">' : '<span></span>') +
      '<span><h3>' + esc(p.title) + '</h3>' +
      '<p class="pm-meta">' + esc(p.completed_label) + ' &middot; ' + esc(p.project_type) + '</p>' +
      '</span></button></li>'
    );
  }

  function renderCard(p) {
    var photo = p.photos && p.photos[0];
    return (
      '<figure class="pm-card" data-project-id="' + esc(p.id) + '">' +
      (photo ? '<img src="' + esc(photo.url) + '" alt="' + esc(photo.alt) + '" loading="lazy">' : '') +
      '<figcaption><h3>' + esc(p.title) + '</h3>' +
      '<p class="pm-meta">' + esc(p.completed_label) + ' &middot; ' + esc(p.project_type) +
      (p.products_used && p.products_used.length ? ' &middot; ' + esc(p.products_used.join(', ')) : '') +
      '</p>' +
      (p.description ? '<p class="pm-desc">' + esc(p.description) + '</p>' : '') +
      '</figcaption></figure>'
    );
  }

  /* ---- Filter state in the URL hash -----------------------------------
   * Hash, not query string: never touches the canonical URL, never creates a
   * duplicate-content variant for the sitemap, no server round-trip. */

  function readHash(state) {
    var m = /(?:^|#|&)pm=([^&]*)/.exec(window.location.hash || '');
    FACETS.forEach(function (f) { state.facets[f] = Object.create(null); state.counts[f] = 0; });
    if (!m) return;
    decodeURIComponent(m[1]).split(';').forEach(function (group) {
      var parts = group.split(':');
      if (parts.length !== 2) return;
      var key = parts[0];
      if (FACETS.indexOf(key) === -1) return;
      parts[1].split(',').forEach(function (v) {
        if (!v) return;
        state.facets[key][v] = true;
        state.counts[key]++;
      });
    });
  }

  function writeHash(state) {
    var parts = [];
    FACETS.forEach(function (f) {
      var vals = Object.keys(state.facets[f]);
      if (vals.length) parts.push(f + ':' + vals.join(','));
    });
    var hash = parts.length ? '#pm=' + parts.join(';') : '';
    // replaceState, not pushState — toggling a filter must not hijack Back.
    if ((window.location.hash || '') !== hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search + hash);
    }
  }

  function matches(p, state) {
    return (
      (state.counts.type === 0 || !!state.facets.type[slugify(p.project_type)]) &&
      (state.counts.place === 0 || !!state.facets.place[slugify(p.place)]) &&
      (state.counts.product === 0 ||
        (p.products_used || []).some(function (x) { return !!state.facets.product[slugify(x)]; }))
    );
  }

  /* ---- Apply ----------------------------------------------------------
   * One function owns visibility for the list, the grid, and the map, all keyed
   * on the same [data-project-id]. Sync is structural, not maintained. */

  function apply(state) {
    var visible = Object.create(null);
    var shown = 0;

    state.payload.projects.forEach(function (p) {
      var ok = matches(p, state);
      visible[p.id] = ok;
      if (ok) shown++;
    });

    // The `hidden` attribute, not a display:none class — filtered-out cards
    // must leave the accessibility tree so screen readers agree with sighted
    // users about what is on the page.
    Array.prototype.forEach.call(state.root.querySelectorAll('[data-project-id]'), function (el) {
      var on = !!visible[el.dataset.projectId];
      if (el.tagName === 'BUTTON' && el.parentElement && el.parentElement.tagName === 'LI') {
        el.parentElement.hidden = !on;
      }
      el.hidden = !on;
    });

    if (state.map) {
      var pts = [];
      Object.keys(state.markers).forEach(function (id) {
        var m = state.markers[id];
        if (visible[id]) {
          if (!state.layer.hasLayer(m)) state.layer.addLayer(m);
          pts.push(m.getLatLng());
        } else if (state.layer.hasLayer(m)) {
          state.layer.removeLayer(m);
        }
      });
      if (pts.length) {
        state.map.fitBounds(state.L.latLngBounds(pts).pad(0.15), { animate: false });
      }
    }

    var count = state.root.querySelector('[data-pm-count]');
    if (count) {
      var total = state.payload.projects.length;
      count.textContent = shown === total
        ? 'Showing all ' + total + (total === 1 ? ' project' : ' projects')
        : 'Showing ' + shown + ' of ' + total + ' projects';
    }

    var empty = state.root.querySelector('[data-pm-empty]');
    if (empty) empty.hidden = shown !== 0;

    var reset = state.root.querySelector('[data-pm-reset]');
    if (reset) {
      reset.hidden = !FACETS.some(function (f) { return state.counts[f] > 0; });
    }

    writeHash(state);
  }

  function syncChips(state) {
    Array.prototype.forEach.call(state.root.querySelectorAll('[data-pm-facet]'), function (chip) {
      var f = chip.dataset.pmFacet;
      var v = chip.dataset.pmValue;
      chip.setAttribute('aria-pressed', state.facets[f] && state.facets[f][v] ? 'true' : 'false');
    });
  }

  /* ---- Map init -------------------------------------------------------- */

  function initMap(state) {
    var L = state.L;
    var wrap = state.root.querySelector('[data-pm-map]');
    if (!wrap) return;

    var withCoords = state.payload.projects.filter(function (p) {
      return typeof p.lat === 'number' && typeof p.lng === 'number';
    });
    // A map with no pins is worse than no map. Projects without coordinates
    // still appear in the list and grid.
    if (!withCoords.length) return;

    if (withCoords.length > CLUSTER_THRESHOLD && window.console) {
      console.info('[project-map] ' + withCoords.length + ' pins — consider marker clustering.');
    }

    wrap.hidden = false;
    wrap.removeAttribute('aria-hidden');

    var el = wrap.querySelector('.pm-map');
    var map = L.map(el, {
      // Off at init or the map swallows page scroll on mobile, which is the
      // single most common complaint about embedded maps. Re-enabled on click.
      scrollWheelZoom: false,
      keyboard: true,
    });

    L.tileLayer(TILE_URL, { attribution: TILE_ATTRIB, maxZoom: TILE_MAX_ZOOM }).addTo(map);
    map.once('click', function () { map.scrollWheelZoom.enable(); });

    var accent = getComputedStyle(state.root).getPropertyValue('--pm-accent').trim() || '#00cfd1';
    var icon = pinIcon(L, accent);
    var layer = L.layerGroup().addTo(map);

    state.map = map;
    state.layer = layer;

    withCoords.forEach(function (p) {
      var marker = L.marker([p.lat, p.lng], { icon: icon, title: p.title, alt: p.title });
      marker.bindPopup(popupHtml(p));
      marker.on('click', function () {
        var row = state.root.querySelector('.pm-row[data-project-id="' + p.id + '"]');
        if (!row) return;
        Array.prototype.forEach.call(state.root.querySelectorAll('.pm-row.is-active'), function (r) {
          r.classList.remove('is-active');
        });
        row.classList.add('is-active');
        row.scrollIntoView({ block: 'nearest' });
      });
      state.markers[p.id] = marker;
      layer.addLayer(marker);
    });

    var center = state.payload.map && state.payload.map.center;
    if (center) map.setView([center.lat, center.lng], center.zoom);
    else map.fitBounds(L.latLngBounds(withCoords.map(function (p) { return [p.lat, p.lng]; })).pad(0.15));

    // Leaflet renders a clipped tile grid if the container was hidden or
    // resized after init.
    map.invalidateSize();
    window.addEventListener('resize', debounce(function () { map.invalidateSize(); }, 150));
  }

  /* ---- Wiring ---------------------------------------------------------- */

  function wire(state) {
    state.root.addEventListener('click', function (ev) {
      var chip = ev.target.closest('[data-pm-facet]');
      if (chip) {
        var f = chip.dataset.pmFacet;
        var v = chip.dataset.pmValue;
        if (state.facets[f][v]) { delete state.facets[f][v]; state.counts[f]--; }
        else { state.facets[f][v] = true; state.counts[f]++; }
        syncChips(state);
        apply(state);
        return;
      }

      if (ev.target.closest('[data-pm-reset]')) {
        FACETS.forEach(function (k) { state.facets[k] = Object.create(null); state.counts[k] = 0; });
        syncChips(state);
        apply(state);
        return;
      }

      var row = ev.target.closest('.pm-row');
      if (row) {
        var marker = state.markers[row.dataset.projectId];
        Array.prototype.forEach.call(state.root.querySelectorAll('.pm-row.is-active'), function (r) {
          r.classList.remove('is-active');
        });
        row.classList.add('is-active');
        // Coordless projects simply have no marker — a no-op, with no guard
        // clause anyone could forget to write.
        if (marker && state.map) {
          state.map.panTo(marker.getLatLng());
          marker.openPopup();
        }
      }
    });

    window.addEventListener('hashchange', function () {
      readHash(state);
      syncChips(state);
      apply(state);
    });
  }

  function render(state) {
    if (state.root.dataset.pmSsr === 'true') return; // phase 1: markup already served
    var list = state.root.querySelector('[data-pm-list]');
    var grid = state.root.querySelector('[data-pm-grid]');
    if (list) list.innerHTML = state.payload.projects.map(renderRow).join('');
    if (grid) grid.innerHTML = state.payload.projects.map(renderCard).join('');
  }

  function start(state) {
    render(state);

    var filters = state.root.querySelector('[data-pm-filters]');
    if (filters) filters.hidden = false;

    readHash(state);
    syncChips(state);
    wire(state);

    ensureLeaflet(state.leafletBase)
      .then(function (L) {
        state.L = L;
        initMap(state);
        apply(state);
      })
      .catch(function () {
        // Map is an enhancement. Filters, list, and grid keep working.
        apply(state);
      });
  }

  function mount(opts) {
    opts = opts || {};
    var root = typeof opts.root === 'string' ? document.querySelector(opts.root) : opts.root;
    if (!root) return;

    var state = {
      root: root,
      leafletBase: opts.leafletBase || '/vendor/leaflet/1.9.4',
      payload: null,
      L: null,
      map: null,
      layer: null,
      markers: Object.create(null),
      facets: { type: Object.create(null), product: Object.create(null), place: Object.create(null) },
      counts: { type: 0, product: 0, place: 0 },
    };

    function accept(payload) {
      if (!payload || payload.v !== 1) {
        if (window.console) console.warn('[project-map] unsupported payload version', payload && payload.v);
        return;
      }
      state.payload = payload;
      start(state);
    }

    if (opts.data) return accept(opts.data);
    if (window.MLA_PROJECT_MAP) return accept(window.MLA_PROJECT_MAP);

    fetch(opts.dataUrl || '/projects.json', { credentials: 'omit' })
      .then(function (r) { return r.json(); })
      .then(accept)
      .catch(function () { /* SSR markup stays as served */ });
  }

  window.MLAProjectMap = { mount: mount, version: 1 };
})();

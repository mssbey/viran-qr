/* VİRAN CAFE — Dijital Menü uygulaması (bağımlılıksız) */
(() => {
  'use strict';

  const DATA = window.VIRAN_MENU;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } },
  };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  const pad = (n) => String(n).padStart(2, '0');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const price = (p) => (p == null ? '<span class="price-ask">Sorunuz</span>' : `${p.toLocaleString('tr-TR')}<span class="cur">₺</span>`);
  const priceText = (p) => (p == null ? '—' : `${p.toLocaleString('tr-TR')} ₺`);
  const imgTag = (src, cls = '', eager = false) => (src ? `<img src="${src}" alt="" class="${cls}" ${eager ? '' : 'loading="lazy"'} decoding="async">` : '');

  /* ---------- Index all items ---------- */
  const cats = [];
  const items = new Map();
  DATA.chapters.forEach((ch, ci) => {
    ch.index = ci;
    ch.cats.forEach((c) => {
      c.chapter = ch;
      c.no = cats.length + 1;
      cats.push(c);
      (c.items || []).forEach((it, i) => { it.key = `${c.id}:${i}`; it.cat = c; items.set(it.key, it); });
      (c.tiers || []).forEach((t, i) => {
        t.key = `${c.id}:t${i}`; t.cat = c; t.isTier = true;
        t.desc = t.flavors.length ? `${t.flavors.length} aroma seçeneği` : 'Doğal tütün ile özel hazırlanır.';
        items.set(t.key, t);
      });
    });
  });
  const minPrice = (it) => {
    if (!it.sizes) return it.price;
    const ps = it.sizes.map((s) => s.p).filter((p) => p != null);
    return ps.length ? Math.min(...ps) : null;
  };

  /* ---------- Hero (time-aware) ---------- */
  function renderHero() {
    const h = new Date().getHours();
    const slot =
      h >= 6 && h < 11 ? { k: 'morning', t: 'Günaydın.', l: 'Serpme kahvaltımız ve demlenmiş çayımız sizi bekliyor.', cta: 'Kahvaltıya göz atın', to: 'kahvalti' } :
      h >= 11 && h < 17 ? { k: 'day', t: 'İyi günler.', l: 'Bir fincan kahve ve vitrinimizin en yeni tatlıları.', cta: 'Pastaneyi keşfedin', to: 'tatlilar' } :
      h >= 17 && h < 22 ? { k: 'evening', t: 'İyi akşamlar.', l: 'Közün dumanı, sıcak bir sofra ve tatlı bir final.', cta: 'Izgaralara göz atın', to: 'izgaralar' } :
                          { k: 'night', t: 'İyi geceler.', l: 'Gece yarısı bir dilim tatlı, sıcak bir kahve. Biz buradayız.', cta: 'Tatlılara göz atın', to: 'tatlilar' };
    const img = $('#heroImg');
    img.onload = () => img.classList.add('ready');
    img.src = DATA.hero[slot.k];
    $('#heroTitle').textContent = slot.t;
    $('#heroLead').textContent = slot.l;
    const cta = $('#heroCta');
    cta.textContent = slot.cta;
    cta.href = `#${slot.to}`;
    const tick = () => {
      const d = new Date();
      $('#heroClock').textContent = `Şu an ${pad(d.getHours())}:${pad(d.getMinutes())} · Açığız`;
    };
    tick();
    setInterval(tick, 20000);
  }

  /* ---------- Signatures ---------- */
  function renderSignatures() {
    const order = ['Fıstıklı Tart', 'San Sebastian', 'Serpme Kahvaltı', 'Golden Bull', 'Kuzu Lokum', 'Lotus Cheesecake', 'Viran Et Burger', 'Künefe', 'Damla Sakızlı Türk Kahvesi', 'Marlenka Pasta', 'Dana Bonfile', 'Viran Çift Göz'];
    const sigs = [...items.values()].filter((i) => i.sig && i.img).sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
    $('#sigTrack').innerHTML = sigs.map((it, i) => `
      <button class="sig" data-open="${it.key}">
        <div class="sig__frame">${imgTag(it.img)}<span class="sig__no">No. ${pad(i + 1)}</span></div>
        <div class="sig__meta">
          <div><div class="sig__name">${esc(it.name)}</div><div class="sig__cat">${esc(it.cat.name)}</div></div>
          <div class="sig__price">${price(it.price)}</div>
        </div>
      </button>`).join('');
  }

  /* ---------- Chapter index ---------- */
  function renderIndex() {
    $('#chapterIndex').innerHTML = DATA.chapters.map((ch) => `
      <div class="chapter reveal">
        <div class="chapter__head">
          <span class="chapter__num">${roman[ch.index]}</span>
          <h3 class="chapter__name">${esc(ch.name)}</h3>
          <span class="chapter__tag">${esc(ch.tagline)}</span>
        </div>
        <div class="tiles">
          ${ch.cats.map((c) => `
            <a class="tile" href="#${c.id}">
              ${imgTag(c.cover)}
              <span class="tile__idx">${pad(c.no)}</span>
              <span class="tile__body">
                <span class="tile__name">${esc(c.name)}</span>
                <span class="tile__count">${countLabel(c)}</span>
              </span>
            </a>`).join('')}
        </div>
      </div>`).join('');
  }
  function countLabel(c) {
    if (c.tiers) return `${c.tiers.reduce((n, t) => n + t.flavors.length, 0)} aroma`;
    return `${c.items.length} çeşit`;
  }

  /* ---------- Sticky nav ---------- */
  function renderNav() {
    $('#catnavList').innerHTML = cats.map((c) => `<a class="chip" href="#${c.id}" data-cat="${c.id}">${esc(c.name)}</a>`).join('');
  }

  /* ---------- Menu body ---------- */
  function row(it) {
    const hasImg = !!it.img;
    const desc = it.desc || it.vol || '';
    return `
      <button class="row${hasImg ? '' : ' row--text'}" data-open="${it.key}">
        ${hasImg ? `<span class="row__img">${imgTag(it.img)}</span>` : ''}
        <span class="row__text">
          ${it.sig ? '<span class="sig-badge">İmza</span>' : ''}
          <span class="row__name">${esc(it.name)}${!hasImg && it.vol ? ` <span class="row__vol">${esc(it.vol)}</span>` : ''}</span>
          ${hasImg && desc ? `<span class="row__desc">${esc(desc)}</span>` : ''}
        </span>
        <span class="row__price">${price(minPrice(it))}</span>
      </button>`;
  }

  function spirit(it) {
    return `
      <button class="spirit" data-open="${it.key}">
        <span class="spirit__img">${imgTag(it.img)}</span>
        <span>
          <span class="spirit__name" style="display:block">${esc(it.name)}</span>
          <span class="sizes">${it.sizes.map((s) => `<span class="size"><span class="size__l">${esc(s.l)}</span><span class="size__p">${price(s.p)}</span></span>`).join('')}</span>
        </span>
      </button>`;
  }

  function catBody(c) {
    if (c.id === 'kahvalti') {
      return `<div class="feature">${c.items.map((it) => `
        <button class="fcard" data-open="${it.key}">
          <div class="fcard__img">${imgTag(it.img)}</div>
          <div class="fcard__body">
            ${it.sig ? '<span class="sig-badge">İmza</span>' : ''}
            <div class="fcard__top"><span class="fcard__name">${esc(it.name)}</span><span class="fcard__price">${price(it.price)}</span></div>
            <p class="fcard__desc">${esc(it.desc)}</p>
            <div class="fcard__ing">${esc(it.ingredients.join(' · '))}</div>
            <div class="fcard__more">İçeriğin tamamı →</div>
          </div>
        </button>`).join('')}</div>`;
    }
    if (c.groups) {
      return c.groups.map((g) => {
        const list = c.items.filter((i) => i.group === g);
        const withSizes = list.every((i) => i.sizes);
        return `<div class="bar-group"><h4 class="group-title">${esc(g)}</h4>
          <div class="items items--fixed">${list.map((it) => (withSizes ? spirit(it) : row(it))).join('')}</div></div>`;
      }).join('');
    }
    if (c.tiers) {
      return `<div class="tiers">${c.tiers.map((t) => `
        <button class="tier${t.sig ? ' tier--sig' : ''}" data-open="${t.key}" style="text-align:left;width:100%">
          <div class="tier__head"><span class="tier__name">${esc(t.name)}</span><span class="tier__price">${price(t.price)}</span></div>
          ${t.flavors.length ? `<div class="flavors">${t.flavors.map((f) => `<span class="flavor">${esc(f)}</span>`).join('')}</div>` : `<p class="tier__desc">${esc(t.desc)}</p>`}
        </button>`).join('')}</div>
        ${c.extras.map((e) => `<div class="extras"><span>${esc(e.name)}</span><span>${price(e.price)}</span></div>`).join('')}`;
    }
    return `<div class="items">${c.items.map(row).join('')}</div>`;
  }

  function renderMenu() {
    $('#menuBody').innerHTML = cats.map((c) => `
      <section class="cat" id="${c.id}" data-cat="${c.id}">
        ${c.cover ? `
          <div class="cat__banner reveal">
            ${imgTag(c.cover)}
            <div class="cat__banner-body">
              <div class="cat__chapter">${esc(c.chapter.name)} · ${pad(c.no)}</div>
              <h2 class="cat__title">${esc(c.name)}</h2>
            </div>
          </div>` : `
          <div class="cat__head--plain reveal">
            <div class="cat__chapter">${esc(c.chapter.name)} · ${pad(c.no)}</div>
            <h2 class="cat__title">${esc(c.name)}</h2>
          </div>`}
        ${c.tagline ? `<p class="cat__tagline">${esc(c.tagline)}</p>` : ''}
        ${c.notes.length ? `<ul class="cat__notes">${c.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
        ${catBody(c)}
      </section>`).join('');
  }

  /* ---------- Overlays (sheet / tray / search) with back-button support ---------- */
  const stack = [];
  let skipPop = 0;
  function openOverlay(el) {
    el.hidden = false;
    void el.offsetWidth;
    el.classList.add('open');
    stack.push(el);
    document.body.classList.add('locked');
    history.pushState({ overlay: stack.length }, '');
  }
  function hideOverlay(el) {
    el.classList.remove('open');
    const done = () => { if (!el.classList.contains('open')) el.hidden = true; };
    if (el.id === 'search' || reduceMotion) done(); else setTimeout(done, 500);
    if (!stack.length) document.body.classList.remove('locked');
  }
  function closeTop() {
    const el = stack.pop();
    if (!el) return;
    hideOverlay(el);
    skipPop++;
    history.back();
  }
  window.addEventListener('popstate', () => {
    if (skipPop) { skipPop--; return; }
    const el = stack.pop();
    if (el) hideOverlay(el);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && stack.length) closeTop(); });
  $$('.sheet').forEach((sheet) => {
    sheet.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeTop(); });
    enableDrag(sheet);
  });

  // Drag the sheet down to dismiss
  function enableDrag(sheet) {
    const panel = $('.sheet__panel', sheet);
    const body = $('.sheet__body', sheet);
    let y0 = null, dy = 0;
    panel.addEventListener('touchstart', (e) => {
      if (body.scrollTop > 0) return;
      y0 = e.touches[0].clientY; dy = 0;
    }, { passive: true });
    panel.addEventListener('touchmove', (e) => {
      if (y0 == null) return;
      dy = e.touches[0].clientY - y0;
      if (dy > 0 && body.scrollTop <= 0) {
        panel.style.transition = 'none';
        panel.style.transform = `translateY(${dy}px)`;
      } else { dy = 0; panel.style.transform = ''; }
    }, { passive: true });
    panel.addEventListener('touchend', () => {
      if (y0 == null) return;
      panel.style.transition = '';
      panel.style.transform = '';
      if (dy > 110) closeTop();
      y0 = null;
    });
  }

  /* ---------- Item sheet ---------- */
  let current = null;
  function openItem(key) {
    const it = items.get(key);
    if (!it) return;
    current = { it, qty: 1, opt: it.sizes ? (it.sizes.find((s) => s.p != null) || it.sizes[0]).l : it.flavors && it.flavors.length ? it.flavors[0] : null };
    const c = it.cat;
    const note = c.groups || c.tiers ? '' : (c.notes[0] || '');
    $('#sheetBody').innerHTML = `
      ${it.img ? `<div class="d-img">${imgTag(it.img, '', true)}</div>` : '<div style="height:48px"></div>'}
      <div class="d-body">
        <div class="d-cat">${esc(c.chapter.name)} · ${esc(c.name)}</div>
        <h3 class="d-name" id="sheetTitle">${esc(it.name)}</h3>
        ${it.sig ? '<span class="sig-badge">İmza Lezzet</span>' : ''}
        ${it.desc && !it.isTier ? `<p class="d-desc">${esc(it.desc)}</p>` : ''}
        ${it.vol ? `<p class="d-desc">${esc(it.vol)}</p>` : ''}
        ${it.ingredients ? `<div class="d-ing">${it.ingredients.map((x) => `<span>${esc(x)}</span>`).join('')}</div>` : ''}
        ${it.sizes ? `<div class="d-sizes">${it.sizes.map((s) => `
          <button class="d-size${s.l === current.opt ? ' active' : ''}" data-opt="${esc(s.l)}" ${s.p == null ? 'disabled' : ''}>
            <div class="size__l">${esc(s.l)}</div><div class="size__p">${price(s.p)}</div>
          </button>`).join('')}</div>` : ''}
        ${it.flavors && it.flavors.length ? `<p class="d-cat" style="margin-bottom:10px">Aromanızı seçin</p><div class="flavors" style="margin-bottom:18px">${it.flavors.map((f) => `
          <button class="flavor d-flavor${f === current.opt ? ' active' : ''}" data-opt="${esc(f)}">${esc(f)}</button>`).join('')}</div>` : ''}
        ${it.isTier && !it.flavors.length ? `<p class="d-desc">${esc(it.desc)}</p>` : ''}
        ${note ? `<p class="d-note">${esc(note)}</p>` : ''}
      </div>
      <div class="d-foot">
        <span class="d-price" id="dPrice"></span>
        <span class="stepper"><button data-step="-1" aria-label="Azalt">−</button><span id="dQty">1</span><button data-step="1" aria-label="Arttır">+</button></span>
        <button class="add-btn" id="dAdd">Ekle</button>
      </div>`;
    updateSheetPrice();
    if (!$('#sheet').classList.contains('open')) openOverlay($('#sheet'));
    $('#sheetBody').scrollTop = 0;
  }
  const optPrice = (it, opt) => (it.sizes ? (it.sizes.find((s) => s.l === opt) || {}).p ?? null : it.price);
  function updateSheetPrice() {
    const p = optPrice(current.it, current.opt);
    $('#dPrice').innerHTML = p == null ? price(null) : price(p * current.qty);
    $('#dQty').textContent = current.qty;
  }
  $('#sheetBody').addEventListener('click', (e) => {
    const opt = e.target.closest('[data-opt]');
    if (opt) {
      current.opt = opt.dataset.opt;
      $$('[data-opt]', $('#sheetBody')).forEach((b) => b.classList.toggle('active', b === opt));
      updateSheetPrice();
      return;
    }
    const step = e.target.closest('[data-step]');
    if (step) { current.qty = Math.max(1, Math.min(20, current.qty + Number(step.dataset.step))); updateSheetPrice(); return; }
    if (e.target.closest('#dAdd')) {
      addToTray(current.it.key, current.opt, current.qty);
      toast(`${current.it.name} seçimlerinize eklendi`);
      closeTop();
    }
  });
  // color for active flavor pills inside sheet
  const style = document.createElement('style');
  style.textContent = '.d-flavor.active{border-color:var(--gold);color:var(--ink);background:var(--surface-2)}';
  document.head.appendChild(style);

  /* ---------- Selections tray ---------- */
  let tray = store.get('viran-tray', []).filter((l) => items.has(l.key));
  function addToTray(key, opt, qty) {
    const line = tray.find((l) => l.key === key && l.opt === opt);
    if (line) line.qty = Math.min(20, line.qty + qty); else tray.push({ key, opt, qty });
    saveTray(true);
  }
  function saveTray(bump) {
    tray = tray.filter((l) => l.qty > 0);
    store.set('viran-tray', tray);
    const n = tray.reduce((s, l) => s + l.qty, 0);
    const badge = $('#trayCount');
    badge.hidden = !n;
    badge.textContent = n;
    if (bump) { badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump'); }
    markRows();
  }
  function markRows() {
    const counts = {};
    tray.forEach((l) => { counts[l.key] = (counts[l.key] || 0) + l.qty; });
    $$('[data-open]').forEach((el) => {
      const box = $('.row__img, .spirit__img, .fcard__img, .sig__frame', el);
      if (!box) return;
      let tag = $('.in-tray', box);
      const n = counts[el.dataset.open];
      if (n) { if (!tag) { tag = document.createElement('span'); tag.className = 'in-tray'; box.appendChild(tag); } tag.textContent = n; } else if (tag) tag.remove();
    });
  }
  function renderTray() {
    if (!tray.length) {
      $('#trayBody').innerHTML = `
        <div class="t-head"><p class="eyebrow">Seçimlerim</p></div>
        <div class="t-empty"><svg><use href="#emblem"/></svg>
        <p>Henüz bir seçim yapmadınız. Beğendiğiniz lezzetleri ekleyin, garsonunuza tek ekranda gösterin.</p></div>`;
      return;
    }
    let total = 0, unknown = false;
    const rows = tray.map((l, i) => {
      const it = items.get(l.key);
      const p = optPrice(it, it.sizes ? l.opt : null);
      if (p == null) unknown = true; else total += p * l.qty;
      return `<div class="t-row">
        ${it.img ? `<span class="row__img">${imgTag(it.img)}</span>` : '<span></span>'}
        <div><div class="t-name">${esc(it.name)}</div><div class="t-sub">${l.opt ? esc(l.opt) + ' · ' : ''}${p == null ? 'Fiyat için sorunuz' : priceText(p)}</div></div>
        <span class="stepper"><button data-tstep="-1" data-i="${i}" aria-label="Azalt">−</button><span>${l.qty}</span><button data-tstep="1" data-i="${i}" aria-label="Arttır">+</button></span>
      </div>`;
    }).join('');
    $('#trayBody').innerHTML = `
      <div class="t-head"><p class="eyebrow">Seçimlerim</p><h3 class="t-title" id="trayTitle">Sofranız</h3>
        <p class="t-lead">Siparişinizi vermek için bu ekranı garsonunuza gösterebilirsiniz.</p></div>
      <div class="t-list">${rows}</div>
      <div class="t-total"><span>Tahmini toplam</span><strong>${price(total)}</strong></div>
      ${unknown ? '<p class="t-lead" style="padding:0 22px">Fiyatı belirtilmeyen ürünler toplama dahil değildir.</p>' : ''}
      <div class="t-hint">Bu liste yalnızca sizin içindir; sipariş garsonunuz tarafından alınır.</div>
      <button class="t-clear" id="tClear">Listeyi temizle</button>`;
  }
  $('#trayBody').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tstep]');
    if (b) { tray[b.dataset.i].qty += Number(b.dataset.tstep); saveTray(); renderTray(); return; }
    if (e.target.closest('#tClear')) { tray = []; saveTray(); renderTray(); }
  });
  $('#openTray').addEventListener('click', () => { renderTray(); openOverlay($('#tray')); });

  /* ---------- Search ---------- */
  const TR = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u', é: 'e', ñ: 'n', '’': "'" };
  const norm = (s) => String(s).toLocaleLowerCase('tr').replace(/[çğıöşüâîûéñ’]/g, (m) => TR[m]);
  const index = [...items.values()].map((it) => ({ it, hay: norm([it.name, it.desc, it.vol, it.cat.name, (it.flavors || []).join(' '), (it.ingredients || []).join(' ')].filter(Boolean).join(' | ')), name: norm(it.name) }));
  function mark(text, q) {
    const i = norm(text).indexOf(q);
    if (i < 0 || !q) return esc(text);
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
  }
  function runSearch(raw) {
    const q = norm(raw.trim());
    const out = $('#searchResults');
    if (!q) {
      const ideas = ['Cheesecake', 'Fıstık', 'Türk kahvesi', 'Kuzu', 'Sakız', 'Rakı', 'Frozen', 'Şeftali'];
      out.innerHTML = `<div class="s-hint">Ne arzu edersiniz?<div class="flavors">${ideas.map((x) => `<button class="flavor" data-q="${x}">${x}</button>`).join('')}</div></div>`;
      return;
    }
    const terms = q.split(/\s+/);
    const hits = index.filter((x) => terms.every((t) => x.hay.includes(t)))
      .sort((a, b) => (b.name.startsWith(terms[0]) - a.name.startsWith(terms[0])) || (b.name.includes(terms[0]) - a.name.includes(terms[0])));
    if (!hits.length) { out.innerHTML = `<div class="s-empty">“${esc(raw)}” için sonuç bulamadık.</div>`; return; }
    const groups = new Map();
    hits.forEach((h) => { const k = h.it.cat; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(h.it); });
    out.innerHTML = [...groups].map(([c, list]) => `<p class="s-group">${esc(c.name)}</p><div class="items items--fixed">${list.map((it) => {
      const html = row(it);
      return html.replace(`<span class="row__name">${esc(it.name)}`, `<span class="row__name">${mark(it.name, terms[0])}`);
    }).join('')}</div>`).join('');
  }
  $('#openSearch').addEventListener('click', () => {
    openOverlay($('#search'));
    $('#searchInput').value = '';
    runSearch('');
    setTimeout(() => $('#searchInput').focus(), 60);
  });
  $('#closeSearch').addEventListener('click', closeTop);
  $('#searchInput').addEventListener('input', (e) => runSearch(e.target.value));
  $('#searchResults').addEventListener('click', (e) => {
    const q = e.target.closest('[data-q]');
    if (q) { $('#searchInput').value = q.dataset.q; runSearch(q.dataset.q); }
  });

  /* ---------- Global open handler ---------- */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-open]');
    if (el && !e.target.closest('.sheet__body')) { $('#searchInput').blur(); openItem(el.dataset.open); }
  });

  /* ---------- Toast ---------- */
  let toastT;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('show'), 2200);
  }

  /* ---------- Theme & view ---------- */
  const metaTheme = $('meta[name="theme-color"]');
  const applyThemeColor = () => { metaTheme.content = document.documentElement.dataset.theme === 'light' ? '#f5efe3' : '#0c0906'; };
  applyThemeColor();
  $('#themeToggle').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('viran-theme', next); } catch (e) { /* ignore */ }
    applyThemeColor();
    toast(next === 'light' ? 'Gündüz görünümü' : 'Gece görünümü');
  });
  function setView(v) {
    document.body.classList.toggle('view-grid', v === 'grid');
    $$('.view-btn').forEach((b) => b.classList.toggle('active', b.dataset.view === v));
    store.set('viran-view', v);
  }
  $$('.view-btn').forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));

  /* ---------- Scroll behaviours ---------- */
  function setupScroll() {
    const topbar = $('#topbar');
    const hero = $('.hero');
    const onScroll = () => topbar.classList.toggle('solid', window.scrollY > hero.offsetHeight - 120);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    $('#toTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

    // scroll-spy for chips
    const scroller = $('#catnavList');
    let active = null;
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const id = en.target.dataset.cat;
        if (id === active) return;
        active = id;
        $$('.chip', scroller).forEach((c) => {
          const on = c.dataset.cat === id;
          c.classList.toggle('active', on);
          if (on) scroller.scrollTo({ left: c.offsetLeft - scroller.clientWidth / 2 + c.clientWidth / 2, behavior: reduceMotion ? 'auto' : 'smooth' });
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    $$('.cat').forEach((s) => spy.observe(s));

    // reveal on scroll
    const rev = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); rev.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach((el) => rev.observe(el));
  }

  /* ---------- Intro ---------- */
  function intro() {
    const el = $('#intro');
    const hero = $('.hero');
    let seen = false;
    try { seen = sessionStorage.getItem('viran-intro') === '1'; sessionStorage.setItem('viran-intro', '1'); } catch (e) { /* ignore */ }
    if (seen || reduceMotion) { el.remove(); hero.classList.add('live'); return; }
    document.body.classList.add('locked');
    const done = () => {
      if (el.classList.contains('out')) return;
      el.classList.add('out');
      document.body.classList.remove('locked');
      setTimeout(() => hero.classList.add('live'), 250);
      setTimeout(() => el.remove(), 1000);
    };
    el.addEventListener('click', done);
    setTimeout(done, 2700);
  }

  /* ---------- Boot ---------- */
  renderHero();
  renderSignatures();
  renderIndex();
  renderNav();
  renderMenu();
  setView(store.get('viran-view', 'list'));
  saveTray(false);
  setupScroll();
  intro();
})();

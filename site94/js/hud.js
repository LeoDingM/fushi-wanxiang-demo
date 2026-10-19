/* 《浮世万象》PC HUD v2 — one overlay design system around the full-window canvas (styles: js/hud.css).
   - top-left player card: collapsed strip (avatar · name · hand chip · health · money · low-need dot) that expands
     (chevron / I key) to the full card with the four needs (icon + bar + value, labels in tooltips) and rent.
   - top-right clock: time, phase, date, day N, season / weather icons, speed control 暂停 / 1× / 2× / 3× (SP.timeScale,
     honoured by main.js step(); Space toggles pause).
   - bottom-right dock: collapsed to pinned 交谈 + 手机 + a round menu button (M key); expands with animation into labelled
     groups; auto-collapses on outside click. 更多 popover, 调试 panel (` key, hidden by default), 操作说明 (F1).
   - contextual interaction prompt with key caps above 李默's head; JS tooltips with key hints.
   - every original #bar control keeps its element, id and handler: nodes are MOVED, never re-created; buttons another
     module appends to #bar later are adopted automatically (MutationObserver + poll fallback).
   - desktop only: body.mobile (phone / touch / narrow), ?shot=1 and ?hud=0 keep the previous layout.
   Layout state (card / dock expanded) is remembered in localStorage 'fushi.hud.layout.v1'. */
(function (root) {
  'use strict';
  const SP = root.SP, D = root.document;
  if (!SP || !D || !D.body || typeof D.createElement !== 'function') return;
  const Q = new URLSearchParams(root.location && root.location.search || '');
  if (Q.get('hud') === '0') return;

  const svg = (inner, fill) => 'url("data:image/svg+xml,' + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='" + (fill ? '#000' : 'none') + "' stroke='#000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>" + inner + '</svg>') + '")';
  const I = {
    talk: svg("<path d='M20.5 11.5a8 8 0 0 1-11.7 7.1L4 19.8l1.3-4.4A8 8 0 1 1 20.5 11.5z'/><path d='M8.5 11.5h.01M12.5 11.5h.01M16.5 11.5h.01' stroke-width='2.6'/>"),
    bag: svg("<path d='M5 10.5a7 7 0 0 1 14 0v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5z'/><path d='M9.5 4.2a2.5 2.5 0 0 1 5 0'/><rect x='8.5' y='13.5' width='7' height='4.5' rx='1'/>"),
    phone: svg("<rect x='6.5' y='2.5' width='11' height='19' rx='2.8'/><path d='M10.5 18.5h3'/>"),
    save: svg("<path d='M5 3.5h11l3.5 3.5v12a1.5 1.5 0 0 1-1.5 1.5H6.5A1.5 1.5 0 0 1 5 19z'/><path d='M8 3.5v5h7v-5M8 20.5v-6h8v6'/>"),
    book: svg("<path d='M4.5 5.5a2 2 0 0 1 2-2h13v15h-13a2 2 0 0 0-2 2z'/><path d='M4.5 20.5v-15M8.5 7.5h7M8.5 11h5'/>"),
    more: svg("<circle cx='5.5' cy='12' r='1.7'/><circle cx='12' cy='12' r='1.7'/><circle cx='18.5' cy='12' r='1.7'/>", true),
    help: svg("<circle cx='12' cy='12' r='9'/><path d='M9.6 9.4a2.5 2.5 0 1 1 3.4 2.4c-.7.3-1 .8-1 1.6v.3'/><path d='M12 17h.01' stroke-width='2.6'/>"),
    wrench: svg("<path d='M14.5 6a4.2 4.2 0 0 0-5.3 5.4L3.5 17.1l3.4 3.4 5.7-5.7A4.2 4.2 0 0 0 18 9.5l-2.6 2.6-3-.5-.5-3z'/>"),
    heart: svg("<path d='M12 20s-7.5-4.5-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.5 12 20 12 20z'/>", true),
    hand: svg("<path d='M8 12V6.5a1.5 1.5 0 0 1 3 0V11M11 10.5V5a1.5 1.5 0 0 1 3 0v5.5M14 10.5V6.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.5A5.5 5.5 0 0 1 4 15.5V12a1.5 1.5 0 0 1 3 0v1.5'/>"),
    branch: svg("<path d='M4 20L19 5M11 13l-5-1.5M14.5 9.5L15.5 4.5M16 8l4 .5'/>"),
    knife: svg("<path d='M3.5 20.5l7-7M10.5 13.5l9.5-9.5c.6 3.8-.6 7.6-3.5 10.3l-2.2 1.7z'/>"),
    coin: svg("<circle cx='12' cy='12' r='9'/><path d='M9 7.5l3 4 3-4M12 11.5V17M9.3 12.6h5.4M9.3 15h5.4'/>"),
    home: svg("<path d='M4 11l8-7 8 7'/><path d='M6.5 9.5V20h11V9.5M10 20v-5h4v5'/>"),
    sun: svg("<circle cx='12' cy='12' r='4'/><path d='M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4'/>"),
    dusk: svg("<path d='M3 18h18M6.5 18a5.5 5.5 0 0 1 11 0M12 5v3.5M5 10.5l1.8 1.5M19 10.5l-1.8 1.5M8 21.5h8'/>"),
    dawn: svg("<path d='M3 18h18M6.5 18a5.5 5.5 0 0 1 11 0M12 9.5V4M9.5 6.5L12 4l2.5 2.5'/>"),
    moon: svg("<path d='M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z'/>", true),
    clear: svg("<circle cx='12' cy='12' r='4'/><path d='M12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21M5.6 5.6l1.1 1.1M17.3 17.3l1.1 1.1M5.6 18.4l1.1-1.1M17.3 6.7l1.1-1.1'/>"),
    rain: svg("<path d='M7 15.5h10a4 4 0 0 0 .4-8A6 6 0 0 0 6 8.5a3.5 3.5 0 0 0 1 7z'/><path d='M8 19l-1 2M12.5 19l-1 2M17 19l-1 2'/>"),
    snow: svg("<path d='M7 14.5h10a4 4 0 0 0 .4-8A6 6 0 0 0 6 7.5a3.5 3.5 0 0 0 1 7z'/><path d='M8 18.5h.01M12 20.5h.01M16 18.5h.01M10 21.5h.01M14 21.5h.01' stroke-width='2.4'/>"),
    fog: svg("<path d='M4 9h16M3 13h13M7 17h14M5 21h10'/>"),
    leaf: svg("<path d='M5 19.5c0-8.5 6-14.5 15-14.5 0 9-6 15-14.5 15'/><path d='M5 19.5l8.5-8.5'/>"),
    bowl: svg("<path d='M3 11.5h18a9 9 0 0 1-18 0z'/><path d='M8.5 7.5c0-1.2 1.3-1.3 1.3-2.5M12.5 7.5c0-1.2 1.3-1.3 1.3-2.5M16.5 7.5c0-1.2 1.3-1.3 1.3-2.5'/>"),
    bolt: svg("<path d='M13.5 2.5L4.5 14h7l-1 7.5L19.5 10h-7z'/>", true),
    drop: svg("<path d='M12 3s6.5 6.6 6.5 11.3a6.5 6.5 0 0 1-13 0C5.5 9.6 12 3 12 3z'/>"),
    smile: svg("<circle cx='12' cy='12' r='9'/><path d='M8.5 14.3a4.5 4.5 0 0 0 7 0M9 9.8h.01M15 9.8h.01' stroke-width='2.2'/>"),
    clinic: svg("<rect x='4' y='4' width='16' height='16' rx='4'/><path d='M12 8.5v7M8.5 12h7'/>"),
    contract: svg("<path d='M6 3.5h8.5L19 8v12.5H6z'/><path d='M14 3.5V8h5M9 12.5h6M9 16h4'/>"),
    reading: svg("<path d='M3 6.5c3-1.3 6-1.3 9 .8 3-2.1 6-2.1 9-.8V19c-3-1.3-6-1.3-9 .8-3-2.1-6-2.1-9-.8z'/><path d='M12 7.3v12.5'/>"),
    swap: svg("<path d='M4 8h14M14.5 4.5L18 8l-3.5 3.5M20 16H6M9.5 12.5L6 16l3.5 3.5'/>"),
    bike: svg("<circle cx='6' cy='16.5' r='3.5'/><circle cx='18' cy='16.5' r='3.5'/><path d='M6 16.5l4-8h5l3 8M10 8.5L12.5 16.5M14 6h2.5'/>"),
    box: svg("<path d='M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z'/><path d='M3.5 7.5L12 12l8.5-4.5M12 12v9'/>"),
    people: svg("<circle cx='9' cy='8' r='3.2'/><path d='M3 19.5a6 6 0 0 1 12 0'/><circle cx='17' cy='9' r='2.6'/><path d='M16 14.2a5 5 0 0 1 5.5 5.3'/>"),
    ear: svg("<path d='M7 9a5.5 5.5 0 0 1 11 0c0 3.5-3.5 4.5-3.5 7.5a3 3 0 0 1-5.5 1.7'/><path d='M10 9.5a2.5 2.5 0 0 1 5 0c0 1.2-1 1.7-1.7 2.3'/>"),
    umbrella: svg("<path d='M3 12a9 9 0 0 1 18 0z'/><path d='M12 12v6.5a2 2 0 0 1-4 0M12 3v-.5'/>"),
    kick: svg("<path d='M8 3.5l1.5 7L6 15.5l1.5 2 5-4 6 1.5.5-2.5-5.5-2.5-1.5-6.5z'/><path d='M4 21h8'/>"),
    zin: svg("<circle cx='10.5' cy='10.5' r='6.5'/><path d='M15.5 15.5L20.5 20.5M10.5 7.8v5.4M7.8 10.5h5.4'/>"),
    zout: svg("<circle cx='10.5' cy='10.5' r='6.5'/><path d='M15.5 15.5L20.5 20.5M7.8 10.5h5.4'/>"),
    calendar: svg("<rect x='3.5' y='5' width='17' height='15.5' rx='2.5'/><path d='M3.5 10h17M8 3v4M16 3v4'/><path d='M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01' stroke-width='2.4'/>"),
    spring: svg("<circle cx='12' cy='12' r='2.2'/><path d='M12 9.8c-2.2-3.2-.6-6.3 0-6.8.6.5 2.2 3.6 0 6.8zM14.1 11.3c1.2-3.7 4.6-4.3 5.4-4.1-.1.8-1.5 4-5.4 4.1zM13.3 13.9c3.8.3 5.2 3.4 5.2 4.2-.8.2-4.2-.3-5.2-4.2zM10.7 13.9c-1 3.9-4.4 4.4-5.2 4.2 0-.8 1.4-3.9 5.2-4.2zM9.9 11.3c-3.9-.1-5.3-3.3-5.4-4.1.8-.2 4.2.4 5.4 4.1z'/>"),
    summer: svg("<circle cx='12' cy='12' r='4.2'/><path d='M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6'/>"),
    autumn: svg("<path d='M12 21v-6M12 15l-6.5-3.5 2-1-2.5-4 4 1 1-3.5 2 2.5 2-2.5 1 3.5 4-1-2.5 4 2 1z'/>"),
    winter: svg("<path d='M12 2.5v19M3.8 7.2l16.4 9.6M3.8 16.8l16.4-9.6M9.5 4l2.5 2 2.5-2M9.5 20l2.5-2 2.5 2M4.3 10.4l3.1-.5-1-3M19.7 13.6l-3.1.5 1 3M4.3 13.6l3.1.5-1 3M19.7 10.4l-3.1-.5 1-3'/>"),
    pause: svg("<rect x='6.5' y='5' width='3.8' height='14' rx='1.2'/><rect x='13.7' y='5' width='3.8' height='14' rx='1.2'/>", true),
    grid: svg("<rect x='4' y='4' width='6.5' height='6.5' rx='1.8'/><rect x='13.5' y='4' width='6.5' height='6.5' rx='1.8'/><rect x='4' y='13.5' width='6.5' height='6.5' rx='1.8'/><rect x='13.5' y='13.5' width='6.5' height='6.5' rx='1.8'/>"),
    close: svg("<path d='M6.5 6.5l11 11M17.5 6.5l-11 11'/>"),
    chevdown: svg("<path d='M6.5 9.5l5.5 5.5 5.5-5.5'/>"),
    chevup: svg("<path d='M6.5 14.5L12 9l5.5 5.5'/>"),
    dot: svg("<circle cx='12' cy='12' r='3'/>", true),
    keyboard: svg("<rect x='2.5' y='6' width='19' height='12' rx='2.5'/><path d='M6.5 10h.01M10 10h.01M13.5 10h.01M17 10h.01M7.5 14h9' stroke-width='2.2'/>")
  };
  const MORE_ICON = [[/健康/, 'clinic'], [/租房|合同/, 'contract'], [/阅读|约定/, 'reading'], [/协商|借还/, 'swap'], [/共享出行|单车/, 'bike'], [/到货|门店/, 'box'], [/合租|邀请/, 'people'], [/听附近|交谈/, 'ear']];
  const ACTION_EV = { umbrella: ['umbrella', 'U'], kick: ['kick', null], zoomin: ['zin', '='], zoomout: ['zout', '−'] };
  const DEBUG_KEY = { broken_window: '1', fire: '2', crash: '3', reset: '0', time: null, season: 'Y', weather: 'R', debug: '' };
  const NEED_ICON = { '饱腹': 'bowl', '精力': 'bolt', '清洁': 'drop', '心情': 'smile' };
  const WEAPON = { '徒手': 'hand', '树枝': 'branch', '厨房刀': 'knife' };
  const LAYOUT_KEY = 'fushi.hud.layout.v1';
  const keyLabel = (a, d) => { try { return SP.keybindings && SP.keybindings.label(a) || d; } catch (_) { return d; } };
  const boundToAction = (k) => { try { const b = SP.keybindings && SP.keybindings.snapshot(); return !!b && Object.values(b).includes(k); } catch (_) { return false; } };

  const el = (tag, cls, parent, text) => { const e = D.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; if (parent) parent.appendChild(e); return e; };
  const setIco = (node, name) => { if (node && node.style && node.style.setProperty) node.style.setProperty('--ico', I[name] || I.dot); };
  const ico = (name, parent, cls) => { const s = el('i', 'hud-ico' + (cls ? ' ' + cls : ''), parent); setIco(s, name); return s; };
  const label = (n) => String(n.textContent || '').replace(/\s+/g, ' ').trim();
  const tipOf = (n, text, key, sub) => { n.setAttribute('data-tip', text); if (key) n.setAttribute('data-hk', key); else n.removeAttribute && n.removeAttribute('data-hk'); if (sub) n.setAttribute('data-sub', sub); };
  const loadLayout = () => { try { const v = JSON.parse(root.localStorage.getItem(LAYOUT_KEY) || '{}'); return v && typeof v === 'object' ? v : {}; } catch (_) { return {}; } };
  const saveLayout = () => { try { root.localStorage.setItem(LAYOUT_KEY, JSON.stringify({ card: cardOpen, dock: dockOpen })); } catch (_) {} };

  let built = false, hud, card, cardToggle, healthBar, healthNum, healthRow, weaponIco, weaponTxt, moneyEl, warnDot, alertEl, cardBody, clock, ck = {}, dock, dockToggle,
    more, moreLife, moreAct, debug, debugGrid, debugTail, help, moreBtn, helpBtn, debugBtn, tip, prompt, promptKeys = '', speedBtns = [];
  let cardOpen = false, dockOpen = false;
  const isActive = () => !!hud && !D.body.classList.contains('mobile') && !D.body.classList.contains('shot');

  function build() {
    if (built) return true;
    const wrap = D.getElementById('wrap'), bar = D.getElementById('bar');
    if (!wrap || !bar) return false;
    built = true;
    const L = loadLayout(); cardOpen = L.card === true; dockOpen = L.dock === true;
    const style = el('style', '', D.head);
    style.textContent = Object.entries(NEED_ICON).map(([t, i]) => `html body.hud-pc #needs .nd[title="${t}"]{--ico:${I[i]}}`).join('') +
      `html body.hud-pc #needs .nd{--ico:${I.dot}}html body.hud-pc #needs .rent{--ico:${I.home}}`;
    hud = el('div', '', wrap); hud.id = 'hud';

    // ---- player card ----
    card = el('section', 'hud-panel', hud); card.id = 'hud-player'; card.setAttribute('aria-label', '人物状态');
    const strip = el('div', 'hp-strip', card);
    const av = el('div', 'hp-avatar', strip, '李'); av.setAttribute('aria-hidden', 'true'); warnDot = el('i', 'hp-dot', av);
    const mid = el('div', 'hp-mid', strip), nm = el('div', 'hp-name', mid); el('b', '', nm, '李默');
    const chip = el('span', 'hp-chip', nm); weaponIco = ico('hand', chip); weaponTxt = el('span', '', chip, '徒手'); tipOf(chip, '手持 / 装备', null, '装备与拾取在「随身与互动」');
    healthRow = el('div', 'hp-health', mid); ico('heart', healthRow); healthBar = el('i', '', el('div', 'bar', healthRow)); healthNum = el('span', '', healthRow, '100'); tipOf(healthRow, '生命', null, '受伤会降低；就医或休息恢复');
    moneyEl = el('div', 'hp-money', nm); ico('coin', moneyEl); const mv = el('span', '', moneyEl, '¥0'); moneyEl._v = mv; tipOf(moneyEl, '零钱余额', null, '手机 → 银行 查看流水');
    cardToggle = el('button', 'hp-toggle', strip); cardToggle.type = 'button'; cardToggle.id = 'hud-player-toggle'; ico('chevdown', cardToggle);
    cardToggle.onclick = (e) => { e.stopPropagation && e.stopPropagation(); setCard(!cardOpen); };
    strip.onclick = (e) => { if (!cardOpen && !(e.target && e.target.closest && e.target.closest('.hp-toggle'))) setCard(true); };
    cardBody = el('div', 'hp-body', card); const inner = el('div', 'hp-inner', cardBody);
    alertEl = el('div', 'hp-alert', inner);
    inner._needsSlot = inner;
    card._inner = inner;

    // ---- clock ----
    clock = el('section', 'hud-panel', hud); clock.id = 'hud-clock'; clock.setAttribute('aria-label', '时间与天气');
    const ckTop = el('div', 'ck-top', clock);
    ck.sky = el('div', 'ck-sky', ckTop); ck.skyIco = ico('sun', ck.sky);
    const ckMain = el('div', 'ck-main', ckTop), tl = el('div', 'ck-tline', ckMain); ck.time = el('span', 'ck-time', tl, '--:--'); ck.phase = el('span', 'ck-phase', tl);
    const dl = el('div', 'ck-date', ckMain); ico('calendar', dl); ck.date = el('span', '', dl); ck.dayN = el('span', 'ck-dayn', dl);
    const row = el('div', 'ck-row', clock);
    ck.season = el('span', 'ck-pill', row); ck.seasonIco = ico('summer', ck.season); ck.seasonTxt = el('span', '', ck.season); tipOf(ck.season, '季节');
    ck.weather = el('span', 'ck-pill', row); ck.weatherIco = ico('clear', ck.weather); ck.weatherTxt = el('span', '', ck.weather); tipOf(ck.weather, '天气');
    ck.tag = el('span', 'ck-pill tag', row); ck.tag.hidden = true;
    const sp = el('div', 'ck-speed', clock); sp.setAttribute('role', 'group'); sp.setAttribute('aria-label', '游戏速度');
    for (const [v, txt, t] of [[0, '', '暂停'], [1, '1×', '正常速度'], [2, '2×', '2 倍速'], [3, '3×', '3 倍速']]) {
      const b = el('button', '', sp, txt); b.type = 'button'; b.dataset.speed = String(v); if (!v) { ico('pause', b); b.setAttribute('aria-label', '暂停'); }
      tipOf(b, t, v === 0 ? 'Space' : null, v === 0 ? '暂停时镜头和界面仍可操作' : v > 1 ? '人物、车流与时间一起加速' : null);
      b.onclick = () => setSpeed(v === 0 && speed() === 0 ? 1 : v); speedBtns.push(b);
    }
    ck.ff = el('span', 'ck-ff', sp, '快进中'); ck.ff.hidden = true;

    // ---- dock ----
    dock = el('nav', 'hud-panel', hud); dock.id = 'hud-dock'; dock.setAttribute('aria-label', '常用操作');
    moreBtn = el('button', '', dock, '更多'); moreBtn.id = 'hud-more-btn'; moreBtn.type = 'button'; prep(moreBtn, 'more', '更多', 60, '更多操作', null, '生活服务、社交与视角');
    sepAt(25); sepAt(55); sepAt(70);
    helpBtn = el('button', '', dock, '说明'); helpBtn.id = 'hud-help-btn'; helpBtn.type = 'button'; prep(helpBtn, 'help', '说明', 80, '操作说明', 'F1');
    debugBtn = el('button', '', dock, '调试'); debugBtn.id = 'hud-debug-btn'; debugBtn.type = 'button'; prep(debugBtn, 'wrench', '调试', 90, '调试与测试', '`', '开发验证工具，默认隐藏');
    dockToggle = el('button', 'dk-toggle', dock); dockToggle.id = 'hud-dock-toggle'; dockToggle.type = 'button'; dockToggle.dataset.order = '100'; dockToggle._ico = ico('grid', dockToggle);
    dockToggle.onclick = (e) => { e.stopPropagation && e.stopPropagation(); setDock(!dockOpen); };

    // ---- popovers ----
    more = el('div', 'hud-panel hud-pop', hud); more.id = 'hud-more'; more.hidden = true; more.setAttribute('role', 'menu');
    popTitle(more, '更多操作', null, () => showMore(false));
    el('div', 'pop-sec', more, '生活与社交'); moreLife = el('div', 'pop-list', more);
    el('div', 'pop-sec', more, '动作与视角'); moreAct = el('div', 'pop-list', more);
    debug = el('div', 'hud-panel hud-pop', hud); debug.id = 'hud-debug'; debug.hidden = true; debug.setAttribute('aria-label', '调试工具');
    popTitle(debug, '调试与测试', '`', () => showDebug(false));
    debugGrid = el('div', 'pop-grid', debug); debugTail = el('div', '', debug);
    el('div', 'pop-note', debug, '仅供开发验证：事件、时间、季节天气、叠加层与上帝模式。');
    help = el('div', '', D.body); help.id = 'hud-help'; help.hidden = true; help.setAttribute('role', 'dialog'); help.setAttribute('aria-label', '操作说明');
    help.onclick = (e) => { if (e.target === help) showHelp(false); };
    tip = el('div', '', hud); tip.id = 'hud-tip'; tip.setAttribute('role', 'tooltip');
    prompt = el('div', '', hud); prompt.id = 'hud-prompt'; prompt.setAttribute('aria-live', 'polite');

    moreBtn.onclick = () => showMore(more.hidden);
    helpBtn.onclick = () => showHelp(help.hidden);
    debugBtn.onclick = () => showDebug(debug.hidden);
    if (D.addEventListener) {
      D.addEventListener('click', (e) => {
        const t = e.target; if (!t || !t.closest) return;
        const inDock = t.closest('#hud-dock') || t.closest('#hud-more') || t.closest('#hud-debug');
        if (!more.hidden && !t.closest('#hud-more') && !t.closest('#hud-more-btn')) showMore(false);
        const cm = D.getElementById('conflict-actions-menu'); if (cm && cm.open && !t.closest('#conflict-actions-menu')) cm.open = false;
        if (dockOpen && !inDock && !t.closest('#hud-help')) setDock(false);
      }, true);
      D.addEventListener('mouseover', onTipOver, true); D.addEventListener('mouseout', onTipOut, true);
      D.addEventListener('mousedown', () => hideTip(), true);
    }
    for (const n of Array.from(bar.children || [])) route(n);
    if (typeof root.MutationObserver === 'function') {
      new root.MutationObserver((list) => { for (const m of list) for (const n of m.addedNodes) if (n.parentNode === bar) route(n); }).observe(bar, { childList: true });
      const needs = D.getElementById('needs'); if (needs) new root.MutationObserver(annotateNeeds).observe(needs, { childList: true });
    }
    setCard(cardOpen, true); setDock(dockOpen, true);
    return true;
  }
  function popTitle(box, text, key, onClose) {
    const t = el('div', 'pop-title', box), s = el('span', '', t, text + ' '); if (key) el('kbd', '', s, key);
    const x = el('button', 'pop-x', t); x.type = 'button'; x.setAttribute('aria-label', '关闭'); ico('close', x); x.onclick = onClose;
  }
  function sepAt(order) { const s = el('span', 'dk-sep dk-x', dock); s.dataset.order = String(order); }
  function prep(n, icon, short, order, tipText, key, sub) {
    n.classList && n.classList.add('hud-btn'); setIco(n, icon); n.dataset.order = String(order); n.setAttribute('data-label', short);
    if (tipText) tipOf(n, tipText, key, sub); n.setAttribute('aria-label', tipText || short);
    if (!n.classList.contains('dk-pin')) n.classList.add('dk-x');
  }
  function sortDock() { const kids = Array.from(dock.children || []).sort((a, b) => (+a.dataset.order || 0) - (+b.dataset.order || 0)); for (const k of kids) dock.appendChild(k); }
  function toDock(n, icon, short, order, tipText, key, sub, pin) { if (pin) n.classList.add('dk-pin'); prep(n, icon, short, order, tipText, key, sub); dock.appendChild(n); sortDock(); }

  // ---------- routing of #bar children ----------
  function route(n) {
    if (!n || n.nodeType !== 1 || n._hudRouted) return;
    const ev = n.dataset && n.dataset.ev;
    if (n.id === 'status') { n._hudRouted = true; debugTail.appendChild(n); return; }
    if (n.tagName === 'B' || n.tagName === 'SPAN') return;            // title + legacy one-line help stay in the hidden #bar
    n._hudRouted = true;
    if (ev && ACTION_EV[ev]) {
      const [icon, key] = ACTION_EV[ev], txt = label(n).replace(/^\S+\s+/, '');
      n.textContent = txt; setIco(n, icon); n.setAttribute('data-key', ev === 'kick' ? keyLabel('kick', 'T') : key); n.setAttribute('role', 'menuitem'); moreAct.appendChild(n); return;
    }
    if (ev) {
      const raw = label(n), txt = ev === 'debug' ? '调试叠加层' : raw.replace(/^\S+\s+/, '');
      n.textContent = txt; const key = ev === 'time' ? keyLabel('time', ']') : DEBUG_KEY[ev];
      if (key) n.setAttribute('data-key', key); else n.removeAttribute && n.removeAttribute('data-key');
      if (ev === 'debug') n.title = '碰撞盒、排序、坐标与 FPS 叠加显示';
      debugGrid.appendChild(n); return;
    }
    const t = label(n);
    if (n.id === 'conflict-actions-menu') {
      const s = n.querySelector && n.querySelector('summary');
      if (s) { setIco(s, 'bag'); s.setAttribute('data-label', '随身'); tipOf(s, '随身与互动', keyLabel('attack', 'Q') + ' 攻击 · H 配合', '装备、拾取、攻击与配合警员'); s.setAttribute('aria-label', '随身与互动'); }
      n.classList.add('dk-x'); n.dataset.order = '20'; dock.appendChild(n); sortDock(); return;
    }
    if (n.id === 'social-live-launch') return toDock(n, 'talk', '交谈', 10, '交谈', null, '与附近居民交谈', true);
    if (n.id === 'phone-launch') return toDock(n, 'phone', '手机', 30, '生活手机', 'P', '微信、地图、银行、外卖…', true);
    if (t === '人生档案') return toDock(n, 'book', '档案', 40, '人生档案', null, '经历、关系与事件记录');
    if (t === '存档') return toDock(n, 'save', '存档', 50, '存档', null, '保存 / 读取 / 导出 JSON');
    if (n.id === 'dev-god-launch') { n.classList.add('wide'); n.setAttribute('data-key', 'F8'); n.textContent = '上帝模式'; debugGrid.appendChild(n); return; }
    const m = MORE_ICON.find(([re]) => re.test(t)); setIco(n, m ? m[1] : 'dot'); n.setAttribute('role', 'menuitem'); moreLife.appendChild(n);
  }

  // ---------- states ----------
  function setCard(on, quiet) { cardOpen = !!on; if (!card) return; card.setAttribute('data-state', cardOpen ? 'open' : 'closed'); setIco(cardToggle.firstChild, cardOpen ? 'chevup' : 'chevdown');
    tipOf(cardToggle, cardOpen ? '收起人物卡' : '展开人物卡', 'I'); cardToggle.setAttribute('aria-expanded', String(cardOpen)); if (!quiet) saveLayout(); }
  function setDock(on, quiet) { dockOpen = !!on; if (!dock) return; dock.setAttribute('data-state', dockOpen ? 'open' : 'closed'); setIco(dockToggle._ico, dockOpen ? 'close' : 'grid');
    tipOf(dockToggle, dockOpen ? '收起操作栏' : '展开全部操作', 'M'); dockToggle.setAttribute('aria-expanded', String(dockOpen));
    if (!dockOpen) { showMore(false); const cm = D.getElementById('conflict-actions-menu'); if (cm) cm.open = false; } if (!quiet) saveLayout(); }
  function showMore(on) { if (!more) return; more.hidden = !on; moreBtn.classList.toggle('on', !!on); if (on) showDebug(false); }
  function showDebug(on) { if (!debug) return; debug.hidden = !on; debugBtn.classList.toggle('on', !!on); if (on) showMore(false); }
  function showHelp(on) { if (!help) return; if (on) renderHelp(); help.hidden = !on; helpBtn.classList.toggle('on', !!on); if (on) { showMore(false); hideTip(); SP.touchRelease && SP.touchRelease(); root.dispatchEvent && root.Event && root.dispatchEvent(new root.Event('blur')); } }
  const speed = () => SP.timeScale == null ? 1 : SP.timeScale;
  function setSpeed(v) { SP.timeScale = v; if (root.dispatchEvent && root.Event && v === 0) root.dispatchEvent(new root.Event('blur')); lastClock = ''; updateClock(); }

  function renderHelp() {
    help.textContent = '';
    const box = el('div', 'hud-panel hud-help', help);
    popTitle(box, '操作说明', null, () => showHelp(false)); box.firstChild.className = 'pop-title help-title';
    el('p', 'help-sub', box, '浮世万象 · 45° 斜视城市生活。动作键可在 手机 → 更多 中改键；下方按当前键位显示。');
    const cols = el('div', 'help-cols', box);
    const sec = (t) => el('h3', '', cols, t), row = (name, ...keys) => { const r = el('div', 'help-row', cols); el('span', '', r, name); const k = el('span', '', r); for (const key of keys) el('kbd', '', k, key); };
    const K = (a, d) => keyLabel(a, d).replace(/^TAB$/, 'Tab');
    sec('移动与镜头'); row('移动', 'W', 'A', 'S', 'D'); row('奔跑（按住 / 切换）', 'Shift', 'Caps'); row('缩放', '=', '−', '滚轮'); row('镜头回到人物', 'C', 'Home'); row('平移镜头', '鼠标拖动'); row('暂停 / 继续', 'Space');
    sec('互动'); row('交互', K('interact', 'E')); row('进出门 / 上下车', K('transit', 'F')); row('附近对象列表', K('cycle', 'Tab')); row('攻击', K('attack', 'Q')); row('踢腿', K('kick', 'T')); row('配合警员', 'H'); row('跳过行程（公交 / 押送）', K('skip', 'G')); row('撑伞', 'U'); row('菜单选择 / 关闭', '1–9', 'Esc');
    sec('界面'); row('生活手机', 'P'); row('人物卡 展开 / 收起', 'I'); row('操作栏 展开 / 收起', 'M'); row('事件日志', 'L'); row('操作说明', 'F1'); row('调试面板', '`');
    sec('调试与测试'); row('破窗 / 起火 / 撞车', '1', '2', '3'); row('重置场景', '0'); row('时间快进 / 下一天', K('time', ']'), 'N'); row('季节 / 天气', 'Y', 'R'); row('上帝模式', 'F8');
    el('div', 'help-foot', box, '按 F1 或 Esc 关闭。');
  }

  // ---------- tooltips ----------
  let tipTimer = 0, tipFor = null;
  function onTipOver(e) {
    if (!isActive()) return; const t = e.target && e.target.closest && e.target.closest('[data-tip]');
    if (!t || !hud.contains(t) || t === tipFor) return; tipFor = t; root.clearTimeout(tipTimer); tipTimer = root.setTimeout(() => showTip(t), tip.classList.contains('on') ? 30 : 280);
  }
  function onTipOut(e) { const t = e.target && e.target.closest && e.target.closest('[data-tip]'); if (t && t === tipFor && !(e.relatedTarget && t.contains(e.relatedTarget))) hideTip(); }
  function hideTip() { root.clearTimeout(tipTimer); tipFor = null; if (tip) tip.classList.remove('on'); }
  function showTip(t) {
    if (tipFor !== t || !t.isConnected) return;
    tip.textContent = ''; const h = el('div', 'tp-h', tip); el('span', '', h, t.getAttribute('data-tip'));
    const hk = t.getAttribute('data-hk'); if (hk) for (const k of hk.split(' · ')) { const parts = k.split(' '); const kb = el('kbd', '', h, parts[0]); if (parts[1]) el('span', 'tp-k', h, parts.slice(1).join(' ')); kb.title = ''; }
    const sub = t.getAttribute('data-sub'); if (sub) el('div', 'tp-s', tip, sub);
    const z = zoom(), r = t.getBoundingClientRect(), wr = D.getElementById('wrap').getBoundingClientRect();
    tip.style.left = '0px'; tip.style.top = '0px'; tip.classList.add('measure');
    const tw = tip.offsetWidth * z, th = tip.offsetHeight * z; tip.classList.remove('measure');
    const below = r.top - wr.top < th + 24; let x = r.left + r.width / 2 - tw / 2 - wr.left, y = below ? r.bottom - wr.top + 10 : r.top - wr.top - th - 10;
    x = Math.max(8, Math.min(wr.width - tw - 8, x));
    tip.style.left = (x / z) + 'px'; tip.style.top = (y / z) + 'px'; tip.dataset.side = below ? 'below' : 'above'; tip.classList.add('on');
  }

  // ---------- live values ----------
  let lastBanner = null, lastClock = '', lastNeeds = '';
  function annotateNeeds() {
    const needs = D.getElementById('needs'); if (!needs || !needs.querySelectorAll) return;
    let worst = 'ok';
    for (const n of needs.querySelectorAll('.nd')) {
      const b = n.querySelector('b'), v = b ? Math.round(parseFloat(b.style.width) || 0) : 0, t = n.getAttribute('title') || '';
      if (n.getAttribute('data-v') !== String(v)) n.setAttribute('data-v', String(v));
      const lv = n.classList.contains('critical') ? 'critical' : n.classList.contains('warn') ? 'warn' : 'ok';
      tipOf(n, t + ' ' + v, null, lv === 'critical' ? '很低，需要尽快处理' : lv === 'warn' ? '偏低' : '状态良好');
      if (lv === 'critical' || (lv === 'warn' && worst === 'ok')) worst = lv;
    }
    const m = needs.querySelector('.money'); if (m && moneyEl._v.textContent !== m.textContent) moneyEl._v.textContent = m.textContent;
    const cond = needs.querySelector('.cond'); if (cond && worst === 'ok') worst = 'warn';
    card.setAttribute('data-alert', worst);
  }
  function updateCard() {
    const needs = D.getElementById('needs'), key = needs ? needs.innerHTML : '';
    if (key !== lastNeeds) { lastNeeds = key; annotateNeeds(); }
    const b = D.getElementById('conflict-hud'), txt = b ? String(b.textContent || '') : '';
    if (txt === lastBanner) return; lastBanner = txt;
    const m = txt.match(/生命\s*(\d+)/), parts = txt.split(' · ');
    healthRow.hidden = !m; if (m) { const v = Math.max(0, Math.min(100, +m[1])); healthBar.style.width = v + '%'; healthNum.textContent = String(v); healthRow.classList.toggle('low', v < 40); }
    const w = (parts[1] || '徒手').trim(); weaponTxt.textContent = w; setIco(weaponIco, WEAPON[w] || 'hand');
    alertEl.textContent = parts.slice(2).join(' · '); card.classList.toggle('has-alert', !!alertEl.textContent);
  }
  function updateClock() {
    const C = SP.clock; if (!C || !C.clockLabel) return;
    const m = C.min, phase = m < 300 ? 'night' : m < 420 ? 'dawn' : m < 1020 ? 'day' : m < 1170 ? 'dusk' : 'night';
    const w = C.weather !== 'clear' && C.intensity > 0.05 ? C.weather : C.target !== 'clear' ? C.target : 'clear';
    const fast = !!C.ff || !!(SP.communityBus && SP.communityBus.accelerating && SP.communityBus.accelerating()), s = speed();
    let date = ''; try { date = C.dateLabel(); } catch (_) {}
    const key = C.clockLabel() + '|' + date + '|' + phase + '|' + w + '|' + C.season + '|' + fast + '|' + s;
    if (key === lastClock) return; lastClock = key;
    ck.time.textContent = C.clockLabel(); ck.phase.textContent = C.phaseName ? C.phaseName() : '';
    clock.setAttribute('data-phase', phase); setIco(ck.skyIco, phase === 'night' ? 'moon' : phase === 'dusk' ? 'dusk' : phase === 'dawn' ? 'dawn' : 'sun');
    const parts = date.split(' · '), dayN = parts.length > 1 && /^第\d+天$/.test(parts[parts.length - 1]) ? parts.pop() : '', first = parts.shift() || '';
    ck.date.textContent = first; ck.dayN.textContent = dayN;
    const tag = parts.join(' · '); ck.tag.hidden = !tag; ck.tag.textContent = tag;
    ck.seasonTxt.textContent = (C.seasonName() || '') + '季'; setIco(ck.seasonIco, I[C.season] ? C.season : 'leaf');
    ck.weatherTxt.textContent = C.weatherName(w) || ''; setIco(ck.weatherIco, I[w] ? w : 'clear');
    for (const b of speedBtns) b.classList.toggle('on', +b.dataset.speed === s);
    ck.ff.hidden = !fast; clock.classList.toggle('paused', s === 0); clock.classList.toggle('fast', fast || s > 1);
  }
  function updateActive() {
    const pl = D.getElementById('phone-launch'); if (pl) pl.classList.toggle('on', !!(SP.phone && SP.phone.isOpen && SP.phone.isOpen()));
    const sv = D.getElementById('progress-save-panel'), sb = sv && Array.from(dock.children).find(b => b.getAttribute('data-label') === '存档'); if (sb) sb.classList.toggle('on', sv.style.display === 'block');
    helpBtn.classList.toggle('on', !help.hidden); debugBtn.classList.toggle('on', !debug.hidden); moreBtn.classList.toggle('on', !more.hidden);
  }
  // contextual prompt: main.js writes #prompt ("E 和学生交谈  ·  T 踢   附近 3 个对象（Tab 列表）"); we show it as key caps above 李默.
  function updatePrompt() {
    const src = D.getElementById('prompt'), txt = src ? String(src.textContent || '') : '';
    if (txt !== promptKeys) {
      promptKeys = txt; prompt.textContent = '';
      if (txt) {
        const extra = txt.match(/\s{2,}(附近\s*\d+\s*个对象.*)$/), main = (extra ? txt.slice(0, extra.index) : txt).trim();
        const row = el('div', 'pr-row', prompt);
        for (const seg of main.split(/\s+·\s+/)) { const mm = seg.match(/^(\S{1,5})\s+(.+)$/); const it = el('span', 'pr-it', row); if (mm && /^[A-Z0-9\]\[`=\-]{1,3}$|^TAB$|^Tab$/.test(mm[1])) { el('kbd', '', it, mm[1]); el('span', '', it, mm[2]); } else el('span', '', it, seg); }
        if (extra) { const ex = el('div', 'pr-ex', prompt); el('span', '', ex, extra[1].replace(/（Tab 列表）/, '')); el('kbd', '', ex, 'Tab'); }
      }
      prompt.classList.toggle('on', !!txt);
    }
    if (!txt) return;
    // anchor above the player's head in canvas space -> CSS px
    const cv = D.getElementById('game'), cam = SP.cam || (root.__proto && root.__proto.cam), p = SP.player, z = zoom();
    let x = null, y = null;
    if (cv && cam && p && p.screen && !(SP.cbd && SP.cbd.active) && !SP.metroActive) {
      try { const [X, Y] = p.screen(), k = cv.clientWidth / cv.width, zz = cam.zoom, cx = Math.round(cam.x * zz) / zz, cy = Math.round(cam.y * zz) / zz;
        x = (X - cx) * zz * k; y = (Y - 84 - (SP.camOffsetY || 0) * 0 - cy) * zz * k - 14; } catch (_) { x = null; }
    }
    const W = cv ? cv.clientWidth : 1280, H = cv ? cv.clientHeight : 720;
    if (x == null || !isFinite(x) || y < 90 || y > H - 40 || x < 40 || x > W - 40) { prompt.classList.add('docked'); prompt.style.left = ''; prompt.style.top = ''; return; }
    prompt.classList.remove('docked'); prompt.style.left = (x / z).toFixed(1) + 'px'; prompt.style.top = (y / z).toFixed(1) + 'px';
  }
  let ticks = 0, lastZoom = 0;
  const zoom = () => lastZoom || 1;
  const put = (parent, n, ref) => { if (ref && ref.parentNode === parent && typeof parent.insertBefore === 'function') parent.insertBefore(n, ref); else parent.appendChild(n); };
  function homeNeeds(on) {
    const needs = D.getElementById('needs'), wrap = D.getElementById('wrap'); if (!needs || !wrap) return;
    if (on && needs.parentNode !== card._inner) put(card._inner, needs, alertEl);
    else if (!on && needs.parentNode === card._inner) { const fb = D.getElementById('floorbadge'); put(wrap, needs, fb); }
  }
  function tick(frame) {
    if (!built) return;
    try { // never let the HUD break the game loop (fake DOMs in tests, odd module states)
    const on = isActive(); D.body.classList.toggle('hud-pc', on);
    homeNeeds(on);
    if (!on) return;
      const z = Math.round(Math.max(1, Math.min(1.4, (root.innerHeight || 800) / 860)) * 20) / 20;
      if (z !== lastZoom && D.body.style && D.body.style.setProperty) { lastZoom = z; D.body.style.setProperty('--hud-zoom', String(z)); }
      updatePrompt();
      if (frame && (ticks++ & 7)) return;
      updateClock(); updateCard(); updateActive();
    } catch (e) { root.console && root.console.warn && root.console.warn('hud tick', e); }
  }

  // ---------- keys ----------
  function keydown(e) {
    if (!isActive()) return;
    const typing = !!(e.target && e.target.closest && e.target.closest('input,textarea,select,[contenteditable="true"]'));
    if (e.key === 'F1') { e.preventDefault(); e.stopImmediatePropagation(); showHelp(help.hidden); return; }
    if (e.key === 'Escape' && (!help.hidden || !more.hidden || dockOpen && !(SP.phone && SP.phone.isOpen && SP.phone.isOpen()))) {
      if (!help.hidden) showHelp(false); else if (!more.hidden) showMore(false); else { setDock(false); return; }
      e.preventDefault(); e.stopImmediatePropagation(); return;
    }
    const free = !typing && !e.ctrlKey && !e.metaKey && !e.altKey && !(SP.cbd && SP.cbd.active) && !SP.metroActive && !(SP.keyboardBlocked && SP.keyboardBlocked(e));
    if (!free) return;
    const k = String(e.key || '').toLowerCase();
    if (e.key === '`') { e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) showDebug(debug.hidden); return; }
    if (e.repeat) return;
    if (k === ' ' && !(SP.game && SP.game.menu)) { e.preventDefault(); e.stopImmediatePropagation(); setSpeed(speed() === 0 ? 1 : 0); return; }
    if (k === 'i' && !boundToAction('i')) { e.preventDefault(); setCard(!cardOpen); return; }
    if (k === 'm' && !boundToAction('m')) { e.preventDefault(); setDock(!dockOpen); return; }
  }

  function init() {
    try {
      if (!build()) return;
      root.addEventListener && root.addEventListener('keydown', keydown, true);
      root.addEventListener && root.addEventListener('resize', () => { hideTip(); tick(); });
      if (SP.game && typeof SP.game.hud === 'function') { const h0 = SP.game.hud; SP.game.hud = function () { const r = h0.apply(this, arguments); tick(true); return r; }; }
      root.setInterval && root.setInterval(() => tick(false), 250);
      root.setInterval && root.setInterval(() => { const bar = D.getElementById('bar'); if (bar) for (const n of Array.from(bar.children || [])) route(n); }, 1500);
      tick(false);
      SP.hud = { tick, showMore, showDebug, showHelp, setCard, setDock, setSpeed, speed,
        isOpen: () => ({ more: !more.hidden, debug: !debug.hidden, help: !help.hidden, card: cardOpen, dock: dockOpen }) };
    } catch (e) { root.console && root.console.warn && root.console.warn('hud init failed', e); }
  }
  if (D.readyState === 'loading' && D.addEventListener) D.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})(window);

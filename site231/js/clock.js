/* scene-proto-45 · clock.js (ported 1:1 from the front-view line scene-proto/js/clock.js; same scene.json
   `calendar` / `weather` data): in-game calendar + clock, seasons, weather state machine (clear / rain / snow / fog),
   accumulation (wet ground, puddles, snow cover) and the ambient light colour used by the lightmap.
   Time is in game minutes; by default 1 real second = 1 game minute (a day = 24 real minutes). */
(function (SP) {
  "use strict";
  const hm = (s) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
  SP.hm = hm;
  const C = (SP.clock = {
    min: 465, day: 0, scale: 1, ff: null, season: "spring", weather: "clear", target: "clear", intensity: 0, tInt: 0,
    wet: 0, snow: 0, fog: 0, ambient: [255, 255, 255], dark: 0, lampsOn: false, wind: 0.3, manualDay: -1, shadow: 0.36,
    daysPerSeason: 5, order: ["spring", "summer", "autumn", "winter"], seasonLock: null,
  });
  C.TIMES = { morning: 450, day: 720, afternoon: 1010, dusk: 1110, night: 1350 };
  const NAMES = { spring: "春", summer: "夏", autumn: "秋", winter: "冬" };
  const WNAMES = { clear: "晴", rain: "雨", snow: "雪", fog: "雾" };
  C.seasonName = (s) => NAMES[s || C.season];
  C.weatherName = (w) => WNAMES[w || C.weather];
  C.abs = () => C.day * 1440 + C.min;
  C.seasonOf = (day) => C.order[Math.floor(day / C.daysPerSeason) % 4];
  /** Pure seasonal prior, not a guarantee or a hidden future weather draw.
   * Returns null for unknown/invalid finite rules. The fingerprint versions only
   * forecast inputs (season schedule + ordered chances), never clock state.
   * No weather mutation, hash/random sampling, log, or time advancement occurs.
   */
  C.forecast = function (options = {}) {
    if (!options || typeof options !== "object" || Array.isArray(options) || Object.keys(options).some(k => k !== "targetDay")) return null;
    const targetDay = options.targetDay === undefined ? C.day + 1 : options.targetDay;
    if (!Number.isSafeInteger(targetDay) || targetDay < 0 || targetDay > 1e7 ||
        !Number.isSafeInteger(C.daysPerSeason) || C.daysPerSeason < 1 || C.daysPerSeason > 1e7 ||
        !Array.isArray(C.order) || C.order.length !== 4 || new Set(C.order).size !== 4 || C.order.some(s => !Object.hasOwn(NAMES, s))) return null;
    const chances = C.wcfg?.chances;
    if (!chances || typeof chances !== "object" || Array.isArray(chances) || Object.keys(chances).length !== 4 || Object.keys(chances).some(s => !C.order.includes(s))) return null;
    const normalized = [];
    for (const season of C.order) {
      const row = chances[season];
      if (!row || typeof row !== "object" || Array.isArray(row)) return null;
      const entries = Object.entries(row);
      if (!entries.length || entries.length > 4 || entries.some(([k,p]) => !Object.hasOwn(WNAMES,k) || !Number.isFinite(p) || p < 0 || p > 1) || Math.abs(entries.reduce((sum,[,p]) => sum+p,0)-1) > 1e-9) return null;
      normalized.push([season,entries]);
    }
    const season = C.seasonOf(targetDay), distribution = { clear: 0, rain: 0, snow: 0, fog: 0 };
    for (const [key,value] of chances[season] ? Object.entries(chances[season]) : []) distribution[key] = value;
    const text = JSON.stringify({ version: 1, daysPerSeason: C.daysPerSeason, order: C.order, chances: normalized });
    let hash = 2166136261;
    for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
    return { ok: true, targetDay, season, method: "season-prior", rulesFingerprint: "season-prior-v1:" + (hash >>> 0).toString(16).padStart(8,"0"), distribution, fogProbability: distribution.fog };
  };
  C.init = function (data, Q) {
    const cal = (C.cal = data.calendar), W = (C.wcfg = data.weather);
    C.daysPerSeason = cal.days_per_season; C.order = cal.season_order;
    C.min = hm(cal.start_clock); C.day = cal.start_day || 0;
    if (Q.get("day")) C.day = Math.max(0, +Q.get("day") | 0);
    const s = Q.get("season");
    if (s && C.order.includes(s)) C.day = C.order.indexOf(s) * C.daysPerSeason + (C.day % C.daysPerSeason);
    C.season = C.seasonOf(C.day);
    const t = Q.get("time");
    if (t) C.min = C.TIMES[t] ?? (t.includes(":") ? hm(t) : C.min);
    if (Q.get("scale")) C.scale = +Q.get("scale");
    const w = Q.get("weather");
    C.weather = C.target = "clear"; C.intensity = C.tInt = 0; C.wet = C.snow = C.fog = 0;
    if (w && WNAMES[w]) { C.setWeather(w, Q.get("wi") ? +Q.get("wi") : 0.8, true, true); }
    else if (W.start_weather) C.setWeather(W.start_weather, W.start_weather === "clear" ? 0 : 0.8, true, true);   // first day fixed (captures / tests), later days roll
    else rollWeather(true);
    if (Q.get("snow")) C.snow = +Q.get("snow");
    if (Q.get("wet")) C.wet = +Q.get("wet");
    C.ff = null; C.computeAmbient();
  };
  function rollWeather(instant) {
    const ch = C.wcfg.chances[C.season] || { clear: 1 };
    const r = SP.hash(C.day * 7919 + 13, 4242);
    let acc = 0, pick = "clear";
    for (const [k, p] of Object.entries(ch)) { acc += p; if (r < acc) { pick = k; break; } }
    const inten = pick === "clear" ? 0 : 0.45 + 0.5 * SP.hash(C.day * 31 + 7, 99);
    C.setWeather(pick, inten, false, instant);
  }
  /** set weather type + intensity (0..1); manual locks it for the rest of the in-game day */
  C.setWeather = function (type, intensity, manual, instant) {
    C.target = type; C.tInt = type === "clear" ? 0 : (intensity == null ? 0.8 : intensity);
    if (manual) C.manualDay = C.day;
    if (instant) {
      C.weather = type; C.intensity = C.tInt;
      if (type === "rain") { C.wet = Math.max(C.wet, 0.9 * C.tInt + 0.1); }
      if (type === "snow") { C.snow = Math.max(C.snow, 0.85 * C.tInt + 0.1); }
      if (type === "fog") C.fog = C.tInt;
    }
    SP.world && SP.world.logEvent && SP.world.logEvent(`天气：${WNAMES[type]}${type !== "clear" ? (C.tInt > 0.85 ? "（大）" : C.tInt < 0.5 ? "（小）" : "") : ""}`);
  };
  C.cycleWeather = function () {
    const order = ["clear", "rain", "snow", "fog"];
    const next = order[(order.indexOf(C.target) + 1) % order.length];
    C.setWeather(next, next === "clear" ? 0 : 0.8, true);
  };
  C.setSeason = function (s) {
    if (!C.order.includes(s)) return;
    C.day = C.order.indexOf(s) * C.daysPerSeason + Math.floor(C.day / (C.daysPerSeason * 4)) * C.daysPerSeason * 4;
    C.season = s;
    if (C.manualDay !== C.day) rollWeather(false);
    SP.world && SP.world.applySeason && SP.world.applySeason();
  };
  C.cycleSeason = function () { C.setSeason(C.order[(C.order.indexOf(C.season) + 1) % 4]); };
  /** fast-forward to a clock minute (next occurrence) over `dur` real seconds -> everything transitions smoothly */
  C.skipTo = function (clockMin, dur) {
    let d = clockMin - C.min; if (d <= 0) d += 1440;
    C.ff = { left: d, rate: d / (dur || 1.6) };
  };
  C.cycleTime = function () {
    const stops = [450, 720, 1010, 1110, 1350];
    const nxt = stops.find((s) => s > C.min + 5) ?? stops[0];
    C.skipTo(nxt, 1.6);
  };
  /** jump (instant) or fast-forward to a named time of day (morning / day / afternoon / dusk / night) */
  C.setTimeName = function (name, instant) {
    const m = C.TIMES[name]; if (m == null) return;
    if (instant) { C.min = m; C.ff = null; C.computeAmbient(); } else C.skipTo(m, 1.6);
  };
  C.timeName = function () { const m = C.min; return m < 600 ? "morning" : m < 960 ? "day" : m < 1080 ? "afternoon" : m < 1185 ? "dusk" : "night"; };
  C.nextDay = function () { C.skipTo(450, 2.2); };
  C.phaseName = function () {
    const m = C.min;
    return m < 300 ? "深夜" : m < 510 ? "清晨" : m < 1020 ? "白天" : m < 1170 ? "黄昏" : "夜晚";
  };
  C.clockLabel = function () {
    const h = Math.floor(C.min / 60), m = Math.floor(C.min % 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };
  C.dateLabel = function () {
    const GR = SP.game && SP.game.rules;
    if (GR) {   // real calendar from shared-rules: weekday, weekend / 法定节假日 / 调休上班 (visual seasons stay demo-compressed)
      const d = GR.date(C.abs()), tag = d.holiday ? ` · ${d.holiday}${d.statutory ? "（三倍工资）" : "假期"}` : d.makeup ? " · 调休上班" : d.weekend ? " · 周末" : "";
      return `${d.label}${tag} · 第${C.day + 1}天`;
    }
    const ss = C.cal.season_start[C.season], i = C.day % C.daysPerSeason, yr = C.cal.start[0] + Math.floor(C.day / (C.daysPerSeason * 4)) + (C.season === "winter" && ss[0] < 3 ? 1 : 0);
    const d = new Date(yr, ss[0] - 1, ss[1] + Math.round(i * 90 / C.daysPerSeason));
    return `${d.getMonth() + 1}月${d.getDate()}日 周${"日一二三四五六"[d.getDay()]} · 第${C.day + 1}天`;
  };
  /** advance by dt real seconds; returns game minutes elapsed */
  C.update = function (dt) {
    let gm = C.scale * dt;
    if (C.ff) { const k = Math.min(C.ff.left, C.ff.rate * dt); gm = k; C.ff.left -= k; if (C.ff.left <= 1e-6) C.ff = null; }
    C.min += gm;
    while (C.min >= 1440) {
      C.min -= 1440; C.day++;
      const ns = C.seasonOf(C.day);
      if (ns !== C.season) { C.season = ns; SP.world && SP.world.applySeason && SP.world.applySeason(); }
      if (C.manualDay !== C.day) rollWeather(false);
      SP.world && SP.world.logEvent && SP.world.logEvent(`新的一天：${C.dateLabel()}`);
    }
    // weather type change: fade the old one out, then the new one in (~4 real s each way, or by game time in a skip)
    const rs = dt + gm / 30;
    if (C.weather !== C.target) {
      C.intensity = Math.max(0, C.intensity - rs * 0.35);
      if (C.intensity <= 0) C.weather = C.target;
    } else C.intensity += SP.clamp(C.tInt - C.intensity, -rs * 0.3, rs * 0.3);
    const W = C.wcfg, I = C.intensity;
    if (C.weather === "rain" && I > 0.05) C.wet = Math.min(1, C.wet + gm / W.wet_rise_min * (0.4 + I));
    else C.wet = Math.max(0, C.wet - gm / W.dry_min);
    if (C.weather === "snow" && I > 0.05) C.snow = Math.min(1, C.snow + gm / W.snow_full_min * (0.3 + I));
    else C.snow = Math.max(0, C.snow - gm / (W.melt_min[C.season] || 120) * (C.weather === "rain" ? 3 : 1));
    if (C.weather === "rain") C.snow = Math.max(0, C.snow - gm / 30);
    C.fog = SP.lerp(C.fog, C.weather === "fog" ? I : 0, Math.min(1, rs * 0.5));
    C.wind = 0.25 + (C.weather === "rain" ? 0.55 * I : C.weather === "snow" ? 0.3 * I : 0) + 0.15 * Math.sin(SP.now * 0.37) * Math.sin(SP.now * 0.11 + 1);
    SP.snowAmt = C.snow;
    C.computeAmbient();
    return gm;
  };
  // ambient keyframes by hour: [hour, r, g, b]
  const KEYS = [[0, 46, 56, 104], [4.8, 52, 62, 110], [5.8, 150, 130, 150], [6.8, 236, 206, 186], [8.2, 255, 252, 246], [16.4, 255, 252, 244],
                [17.4, 255, 212, 160], [18.4, 240, 150, 104], [19.3, 112, 100, 150], [20.5, 58, 68, 120], [24, 46, 56, 104]];
  const SEASON_MUL = { spring: [1, 1, 0.99], summer: [1, 0.99, 0.94], autumn: [1, 0.96, 0.88], winter: [0.93, 0.96, 1.0] };
  C.computeAmbient = function () {
    const h = C.min / 60;
    let i = 0; while (i < KEYS.length - 2 && KEYS[i + 1][0] <= h) i++;
    const a = KEYS[i], b = KEYS[i + 1], t = SP.smooth(SP.clamp((h - a[0]) / (b[0] - a[0]), 0, 1));
    const amb = C.ambient;
    for (let k = 0; k < 3; k++) amb[k] = SP.lerp(a[k + 1], b[k + 1], t);
    const sm = SEASON_MUL[C.season], I = C.intensity;
    const wm = C.weather === "rain" ? [1 - 0.34 * I, 1 - 0.3 * I, 1 - 0.22 * I] : C.weather === "snow" ? [1 - 0.12 * I, 1 - 0.1 * I, 1 - 0.05 * I] :
               C.weather === "fog" ? [1 - 0.14 * I, 1 - 0.13 * I, 1 - 0.12 * I] : [1, 1, 1];
    for (let k = 0; k < 3; k++) amb[k] = Math.round(SP.clamp(amb[k] * sm[k] * wm[k], 0, 255));
    const lum = (0.3 * amb[0] + 0.59 * amb[1] + 0.11 * amb[2]) / 255;
    C.dark = SP.clamp(1 - lum, 0, 1);
    if (!C.lampsOn && C.dark > 0.3) C.lampsOn = true; else if (C.lampsOn && C.dark < 0.24) C.lampsOn = false;
    // ground-shadow strength: hard sun in clear daylight (harsher in summer), soft/no shadows when overcast or dark
    const sun = SP.clamp((lum - 0.55) / 0.4, 0, 1) * (C.weather === "clear" ? 1 : 1 - 0.75 * I);
    C.shadow = 0.1 + 0.3 * sun * (C.season === "summer" ? 1.25 : C.season === "winter" ? 0.85 : 1);
  };
})(window.SP);

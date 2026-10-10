/* 《浮世万象》租房生活切片 · 主循环 / 输入 / 交互 */
(function (FW) {
  "use strict";
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const W = FW.W, H = FW.H;
  const params = new URLSearchParams(location.search);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const st = (FW.state = {
    scene: "exterior", time: FW.TIME_PRESETS.day, stamina: 72, mood: 58, hunger: 45, money: 1280,
    panel: null, // 'lease' | 'order' | 'sleep'
    near: null, clockRun: true, cycleIdx: 0, sleep: null, freezeAnim: false,
    weather: "clear", weatherLock: false, wet: 0, weatherSeed: 0,
    quest: { eat: false, job: false, sleep: false }, // portrait dock "今日" list
  });
  const keys = Object.create(null);
  const player = new FW.LiMo();
  const fx = new FW.FX();
  const npcs = new FW.NPCs();
  FW.player = player; FW.fx = fx; FW.npcs = npcs;

  // ---------- helpers ----------
  function inPoly(x, y, poly) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  }
  function walkable(x, y) {
    if (!inPoly(x, y, FW.SCENES[st.scene].walk)) return false;
    // NPC foot ellipses: blocked when stepping into one (moving away from an overlap is always allowed, never stuck)
    if (st.scene === "exterior") for (const b of npcs.blockers()) {
      const dn = Math.hypot(x - b.x, (y - b.y) * 1.6);
      if (dn < b.r && dn <= Math.hypot(player.x - b.x, (player.y - b.y) * 1.6)) return false;
    }
    return true;
  }
  function setScene(name, x, y, dir) {
    st.scene = name;
    const sp = FW.SCENES[name].spawn;
    player.x = x != null ? x : sp[0];
    player.y = y != null ? y : sp[1];
    if (dir) player.setDir(dir);
    fx.steam.length = 0;
  }

  // ---------- input ----------
  const isDown = (...ks) => ks.some((k) => keys[k]);
  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "w", "a", "s", "d", "e", "t", "r"].includes(k)) e.preventDefault();
    keys[k] = true;
    if (e.repeat) return;
    if (st.panel === "order") {
      if (k === "e" || k === "enter") confirmOrder();
      if (k === "escape") closePanel();
      return;
    }
    if (k === "escape") closePanel();
    if (k === "e") pressE();
    if (k === "t") cycleTime();
    if (k === "r") toggleWeather();
    if (k === "u") toggleUmbrella();
    if (k === "p") { st.clockRun = !st.clockRun; FW.UI.toast(st.clockRun ? "时钟继续" : "时钟暂停"); }
  });
  window.addEventListener("keyup", (e) => (keys[e.key.toLowerCase()] = false));
  window.addEventListener("blur", () => { for (const k in keys) keys[k] = false; });

  /** E / 互动: confirm order, close lease, otherwise interact */
  function pressE() {
    if (st.panel === "order") confirmOrder();
    else if (st.panel === "lease") closePanel();
    else interact();
  }
  /** R / 天气 (testing): flip tonight's weather and lock it; the plate + rain crossfade over ~2.5 s */
  function toggleWeather() {
    st.weatherLock = true;
    st.weather = st.weather === "rain" ? "clear" : "rain";
    const dark = FW.extWeights(st.time, 0).dark > 0.3;
    FW.UI.toast(st.weather === "rain" ? (dark ? "天气 → 夜雨" : "天气 → 今晚有雨") : "天气 → 晴", 1600);
  }
  function updateWeather(dt) {
    if (!st.weatherLock) st.weather = FW.weatherForDay(FW.dayIndex(st.time), st.weatherSeed);
    const target = st.weather === "rain" ? 1 : 0;
    const rate = st.sleep ? 3 : 0.4; // ~2.5 s crossfade; instant-ish while the screen is black
    st.wet += clamp(target - st.wet, -rate * dt, rate * dt);
    FW.wet = st.wet;
  }

  function cycleTime() {
    st.cycleIdx = (st.cycleIdx + 1) % FW.TIME_CYCLE.length;
    const name = FW.TIME_CYCLE[st.cycleIdx];
    const to = FW.TIME_PRESETS[name];
    st.timeAnim = { from: st.time, add: FW.wrapMin(to - st.time), t: 0, dur: 1.4 };
    FW.UI.toast(`时间 → ${FW.fmtClock(to)}（${FW.phaseName(to)}）`, 1600);
  }

  // ---------- interactions ----------
  function closePanel() {
    st.panel = null;
    FW.UI.show("lease-panel", false);
    FW.UI.show("order-panel", false);
  }
  function openOrder() {
    st.panel = "order";
    const night = FW.nightFactor(st.time) > 0.6;
    FW.UI.el["order-title"].textContent = night ? "王阿姨早点摊 · 宵夜也卖" : "王阿姨早点摊";
    FW.UI.show("order-panel", true);
  }
  function confirmOrder() {
    if (st.money < 8) { FW.UI.toast("钱不够了……"); closePanel(); return; }
    closePanel();
    // 李默 hands the money over, 王阿姨 turns and hands the bag back; effects land when the bag is received
    npcs.serveTo(player.x, player.y);
    playAction("buy", { fps: 6, at: { 4: () => {
      st.money -= 8;
      st.hunger = clamp(st.hunger + 28, 0, 100);
      st.mood = clamp(st.mood + 3, 0, 100);
      st.time += 12;
      st.quest.eat = true;
      FW.UI.toast("「豆浆油条，拿好！」饱腹 +28，心情 +3，金钱 -¥8", 2800);
    } }, hold: 0.5 });
  }
  function startSleep() {
    const m = FW.wrapMin(st.time);
    const toNight = m >= 360 && m < 1020; // daytime nap -> evening; otherwise sleep to morning
    const target = toNight ? 19 * 60 + 40 : 7 * 60;
    let add = FW.wrapMin(target - m);
    if (add < 30) add += 1440;
    st.panel = "sleep";
    st.timeAnim = null;
    st.sleep = { t: 0, add, from: st.time, caption: toNight ? "小睡一会儿……醒来已是夜里" : "睡到明天早上……" };
  }
  function updateSleep(dt) {
    const s = st.sleep;
    s.t += dt;
    // 0-0.9 fade out | 0.9-2.6 storyboard card, clock fast-forwards | 2.6-3.6 fade in
    let a;
    if (s.t < 0.9) a = s.t / 0.9;
    else if (s.t < 2.6) a = 1;
    else a = 1 - (s.t - 2.6) / 1.0;
    const k = FW.smooth(clamp((s.t - 0.9) / 1.7, 0, 1));
    st.time = s.from + s.add * k;
    FW.UI.fade(clamp(a, 0, 1), s.caption);
    if (s.t >= 3.6) {
      FW.UI.fade(0);
      const hrs = s.add / 60;
      st.stamina = clamp(st.stamina + hrs * 6, 0, 100);
      st.hunger = clamp(st.hunger - hrs * 2.5, 0, 100);
      st.mood = clamp(st.mood + 4, 0, 100);
      st.panel = null; st.sleep = null; st.quest.sleep = true; st.slept = true;
      FW.UI.toast(`睡了 ${hrs.toFixed(1)} 小时 · 体力↑ 饱腹↓ · 现在 ${FW.fmtClock(st.time)}`, 3000);
    }
  }

  // ---------- interaction actions: walk to the spot, face the target, play a 3D clip (input locked) ----------
  // st.action = { id, clip, dir, fps, phase: walk|turn|play|hold|reverse|done, i, t, at{frame: fn}, hold, onEnd, pos }
  st.actionLog = [];
  function startAction(hs, clip, opts) {
    const A = Object.assign({ id: hs.id, clip, fps: 8, hold: 0, at: {}, phase: "walk", i: 0, t: 0, frames: FW.LIMO_ACTIONS[clip].frames }, opts || {});
    const spot = hs.spot || [player.x, player.y];
    A.spot = spot; A.face = hs.face || player.dir;
    st.action = A;
    return A;
  }
  /** play a clip right here (already in place: e.g. buy after the order panel, umbrella) */
  function playAction(clip, opts) {
    const A = startAction({ id: clip, spot: [player.x, player.y], face: player.dir }, clip, opts);
    A.phase = "play"; A.dir = player.dir; st.actionLog.push(clip);
    return A;
  }
  function updateAction(dt, sc) {
    const A = st.action;
    if (A.phase === "walk") {
      const dx = A.spot[0] - player.x, dy = A.spot[1] - player.y, d = Math.hypot(dx, dy / FW.WALK_Y);
      const sp = 100 * (sc / 0.5) * 0.75 + 25;
      if (d < 1.5) { player.x = A.spot[0]; player.y = A.spot[1]; player.update(dt, false, A.face, 0, 0, sc); A.phase = "turn"; return; }
      const k = Math.min(1, (sp * 0.85 * dt) / d), px0 = player.x, py0 = player.y;
      player.x += dx * k; player.y += dy * k;
      player.nominal = sp;
      player.update(dt, true, FW.dirFromVec(dx, dy / FW.WALK_Y), player.x - px0, player.y - py0, sc);
      return;
    }
    if (A.phase === "turn") {
      player.update(dt, false, A.face, 0, 0, sc);
      A.t += dt;
      if (player.dir === A.face && (!player.settle || A.t > 0.4)) { A.phase = "play"; A.t = 0; A.i = 0; A.dir = A.face; st.actionLog.push(A.clip); if (A.at[0]) A.at[0](); }
      return;
    }
    player.update(dt, false, null, 0, 0, sc);
    A.t += dt;
    const step = 1 / A.fps;
    if (A.phase === "play") {
      while (A.t >= step && A.phase === "play") {
        A.t -= step;
        if (A.i + 1 >= (A.playTo != null ? A.playTo + 1 : A.frames)) { A.phase = A.hold > 0 || A.holdUntil ? "hold" : A.reverse ? "reverse" : "done"; A.ht = 0; }
        else { A.i++; if (A.at[A.i]) A.at[A.i](); }
      }
    } else if (A.phase === "hold") {
      A.ht += dt;
      if (A.loop) A.i = A.loop[0] + (Math.floor(A.ht * A.fps) % (A.loop[1] - A.loop[0] + 1));
      if (A.onHold && !A.holdFired) { A.holdFired = true; A.onHold(); }
      const done = A.holdUntil ? A.holdUntil() : A.ht >= A.hold;
      if (done) { A.phase = A.reverse ? "reverse" : "done"; A.t = 0; if (A.reverseFrom != null) A.i = A.reverseFrom; }
    } else if (A.phase === "reverse") {
      while (A.t >= step && A.phase === "reverse") { A.t -= step; if (A.i <= 0) A.phase = "done"; else A.i--; }
    }
    if (A.phase === "done") { st.action = null; player.t = 0; if (A.onEnd) A.onEnd(); }
  }
  function actionFrame() {
    const A = st.action;
    if (!A || A.phase === "walk" || A.phase === "turn") return null;
    const d = A.clip === "lie" ? "BED" : A.dir;
    return FW.img[`${A.clip}_${d}_${A.i}`];
  }
  function raining() { return st.scene === "exterior" && FW.extWeights(st.time).rain > 0.3; }
  /** umbrella: open in the rain (U / 互动 with nothing in reach), close again */
  function toggleUmbrella() {
    if (st.action || st.panel) return;
    if (!st.umbrella && !raining()) { FW.UI.toast("没下雨，不用撑伞。"); return; }
    if (!st.umbrella) playAction("umbrella", { fps: 8, onEnd: () => { st.umbrella = true; player.set = "u"; } });
    else { player.set = ""; st.umbrella = false; const A = playAction("umbrella", { fps: 10 }); A.i = 3; A.phase = "reverse"; }
  }

  function interact() {
    if (st.panel || st.action) return;
    const hs = st.near;
    if (!hs) { if (raining() || st.umbrella) toggleUmbrella(); return; }
    switch (hs.id) {
      case "door":
        startAction(hs, "door", { fps: 9, onEnd: () => { st.umbrella = false; player.set = ""; setScene("interior", null, null, "N"); FW.UI.toast("推开防盗门——2F-02"); } }); break;
      case "stall": startAction(hs, "buy", { fps: 8, playTo: 0, onEnd: () => openOrder() }); break;   // step up, then the menu
      case "exit": startAction(hs, "door", { fps: 9, onEnd: () => { setScene("exterior", 618, 560, "S"); FW.UI.toast("下楼回到井槐里街口。"); } }); break;
      case "sleep":
        // lie down on the bed (clip drawn at the bed), sleep (fade), then sit up again
        startAction(hs, "lie", { fps: 5, holdUntil: () => !st.sleep && st.slept, onHold: () => { st.slept = false; startSleep(); }, reverse: true, reverseFrom: 2,
          onEnd: () => { st.slept = false; } });
        break;
      case "locker": {
        const today = FW.dayIndex(st.time), got = st.parcelDay === today;
        startAction(hs, "mail", { fps: 7, hold: 0.6, at: { 3: () => {
          if (got) FW.UI.toast("快递柜里没有你的件了。");
          else { st.parcelDay = today; st.mood = clamp(st.mood + 4, 0, 100); FW.UI.toast("取到快递：妈妈寄来的一箱零食。心情 +4", 2600); }
        } } });
        break;
      }
      case "computer":
        startAction(hs, "sit", { fps: 6, playTo: 1, hold: 2.4, loop: [2, 5], reverse: true, reverseFrom: 1, onHold: () => {
          st.mood = clamp(st.mood - 2, 0, 100); st.time += 20; st.quest.job = true;
          FW.UI.toast("电脑嗡嗡启动——招聘网站：外卖骑手 / 便利店夜班 / 外包画手……");
        } });
        break;
      case "cook":
        st.hunger = clamp(st.hunger + 30, 0, 100); st.stamina = clamp(st.stamina - 5, 0, 100);
        st.money = Math.max(0, st.money - 12); st.time += 15;
        fx.extraSteam.push({ x: 948, y: 400, rate: 14, spread: 14, ttl: 4, scale: 1.6 });
        FW.UI.toast("煮了泡面。饱腹 +30，金钱 -¥12"); break;
      case "lease":
        st.panel = "lease"; FW.UI.show("lease-panel", true); break;
    }
  }

  // ---------- update ----------
  function update(dt) {
    if (st.sleep) updateSleep(dt);
    else if (st.timeAnim) {
      // T key: smooth 1.4s fast-forward (lighting/bg crossfade visibly sweeps)
      const a = st.timeAnim;
      a.t += dt;
      const k = FW.smooth(clamp(a.t / a.dur, 0, 1));
      st.time = a.from + a.add * k;
      if (a.t >= a.dur) st.timeAnim = null;
    } else if (st.clockRun && !st.panel) st.time += dt * FW.GAME_MIN_PER_SEC;

    updateWeather(dt);

    let dx = 0, dy = 0, speedK = 1;
    if (st.umbrella && (st.scene !== "exterior" || FW.extWeights(st.time).rain < 0.05) && !st.action) { st.umbrella = false; player.set = ""; }
    if (st.action) {
      const sc0 = FW.SCENES[st.scene].actorScale;
      updateAction(dt, sc0);
    } else if (!st.panel) {
      if (isDown("w", "arrowup")) dy -= 1;
      if (isDown("s", "arrowdown")) dy += 1;
      if (isDown("a", "arrowleft")) dx -= 1;
      if (isDown("d", "arrowright")) dx += 1;
      // touch joystick (only when no key is held): snapped to the 8 sprite directions, analog speed
      const J = FW.touchInput;
      if (!dx && !dy && J && J.m > 0) {
        const a = Math.round(Math.atan2(J.y, J.x) / (Math.PI / 4)) * (Math.PI / 4);
        dx = Math.round(Math.cos(a) * 1000) / 1000; dy = Math.round(Math.sin(a) * 1000) / 1000;
        speedK = 0.35 + 0.65 * clamp(J.m / 0.75, 0, 1);
      }
    }
    const moving = !!(dx || dy);
    const sc = FW.SCENES[st.scene].actorScale;
    // walk speed: brisk walk (~1.6-1.8 strides/s); animation is driven by the distance actually moved
    const sp = 100 * (sc / 0.5) * 0.75 + 25;
    player.nominal = sp * speedK;
    const px0 = player.x, py0 = player.y;
    if (moving) {
      const len = Math.hypot(dx, dy);
      const vx = (dx / len) * sp * speedK * dt, vy = (dy / len) * sp * speedK * dt * FW.WALK_Y;
      if (walkable(player.x + vx, player.y + vy)) { player.x += vx; player.y += vy; }
      else if (walkable(player.x + vx, player.y)) player.x += vx;
      else if (walkable(player.x, player.y + vy)) player.y += vy;
    }
    // facing: keep a diagonal if the two keys were released a few frames apart
    let dir = moving ? FW.dirFromVec(dx, dy) : null;
    if (dir) {
      if (dir.length === 2) { st.lastDiag = dir; st.lastDiagT = 0; }
      else st.lastDiagT = (st.lastDiagT || 0) + dt;
    } else if (player.moving && st.lastDiag && st.lastDiagT < 0.12 && st.lastDiag.includes(player.target)) {
      dir = st.lastDiag;
    }
    if (!moving) st.lastDiagT = 9;
    if (!st.freezeAnim && !st.action) player.update(dt, moving || !!st.forceWalk, dir, player.x - px0, player.y - py0, sc);

    if (st.scene === "exterior") npcs.update(dt, st.time, fx);
    fx.update(dt, st.scene, st.time);

    // nearest hotspot
    st.near = null;
    if (!st.panel && !st.action) {
      let best = 1e9;
      for (const h of FW.SCENES[st.scene].hotspots) {
        const d = Math.hypot(player.x - h.x, (player.y - h.y) * 1.3);
        if (d < h.r && d < best) { best = d; st.near = h; }
      }
    }
    updateCam(dt);
    FW.UI.prompt(st.near ? st.near.label : null, (player.x - cam.x) * cam.zoom, (player.y - 178 * sc - 34 - cam.y) * cam.zoom + 34 * (cam.zoom - 1));
    FW.UI.tick(dt);
    FW.UI.hud(st);
  }

  // ---------- camera ----------
  // zoom 1 = whole 1280x720 plate (desktop / landscape). Portrait phones zoom in and follow Li Mo so he
  // stays readable on a ~390 px wide canvas (?zoom=N overrides).
  const cam = (FW.cam = { zoom: 1, x: 0, y: 0, ready: false });
  function updateCam(dt) {
    const zq = +params.get("zoom");
    const CW = canvas.width, CH = canvas.height;
    let z;
    if (CW === W && CH === H) z = zq > 0 ? zq : 1;               // desktop / landscape: whole plate (or ?zoom=)
    else {
      // portrait tall viewport: show PORTRAIT_VIEW_H world px vertically (crop/follow around Li Mo), never more than the plate
      const viewH = FW.PORTRAIT_VIEW_H / (zq > 0 ? zq : 1);
      z = Math.max(CH / Math.min(viewH, H), CW / W);
    }
    const k = cam.ready ? Math.min(1, dt * 5) : 1;
    cam.zoom += (z - cam.zoom) * k;
    if (Math.abs(z - cam.zoom) < 1e-3) cam.zoom = z;
    const vw = CW / cam.zoom, vh = CH / cam.zoom;
    const tx = clamp(player.x - vw / 2, 0, W - vw), ty = clamp(player.y - 40 * FW.SCENES[st.scene].actorScale * 2 - vh / 2, 0, H - vh);
    cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * k;
    cam.ready = true;
  }
  const worldXf = () => ctx.setTransform(cam.zoom, 0, 0, cam.zoom, -cam.x * cam.zoom, -cam.y * cam.zoom);
  const screenXf = () => ctx.setTransform(1, 0, 0, 1, 0, 0);

  // ---------- draw ----------
  function drawBG(im, alpha) {
    if (alpha <= 0.002 || !FW.ok(im)) return;
    ctx.globalAlpha = alpha;
    ctx.drawImage(im, 0, 0, W, H);
    ctx.globalAlpha = 1;
  }
  function drawHotspot(h) {
    const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 260);
    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.scale(1, 0.45);
    ctx.strokeStyle = h.accent;
    ctx.globalAlpha = 0.55 + 0.35 * pulse;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([7, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, h.r * 0.75, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.10 + 0.08 * pulse;
    ctx.fillStyle = h.accent;
    ctx.fill();
    ctx.restore();
  }
  function nameplate(x, y, text) {
    ctx.save();
    ctx.font = '600 13px "PingFang SC","Microsoft YaHei","Noto Sans CJK SC",sans-serif';
    const tw = ctx.measureText(text).width + 14;
    ctx.fillStyle = "rgba(14,16,22,0.72)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x - tw / 2, y - 10, tw, 19, 4); else ctx.rect(x - tw / 2, y - 10, tw, 19);
    ctx.fill();
    ctx.fillStyle = "#e8e4d9";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function draw() {
    const S = FW.SCENES[st.scene];
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    screenXf();
    ctx.fillStyle = "#0b0d12";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    worldXf();
    const n = FW.nightFactor(st.time);
    if (st.scene === "exterior") {
      const w = FW.extWeights(st.time);
      // layered crossfade day -> dusk -> clear night -> rain night. Layer k is drawn with alpha
      // w_k / (w_0 + .. + w_k), so the final mix has exactly the weights w (no double-fade dip / ghosting bias)
      let acc = w.day;
      drawBG(FW.img["bg.ext_day"], 1);
      for (const [key, wk] of [["ext_dusk", w.dusk], ["ext_night", w.night], ["ext_rain", w.rain]]) {
        acc += wk;
        if (wk > 0.002) drawBG(FW.img["bg." + key], wk / acc);
      }
    } else {
      // day -> clear night (window: calm sky + city) / rain night (window: rain), layered exactly like the street:
      // weights day 1-n, clear n(1-wet), rain n*wet ; the window rain FX follows the same wet amount
      const wet = FW.wet, wc = n * (1 - wet), wr = n * wet;
      drawBG(FW.img["bg.int_day"], 1);
      if (wc > 0.002) drawBG(FW.img["bg.int_night_clear"] || FW.img["bg.int_night"], wc / (1 - n + wc));
      if (wr > 0.002) drawBG(FW.img["bg.int_night"], wr);
      fx.drawWindowRain(ctx, wr);
    }
    if (st.near) drawHotspot(st.near);

    // actors, depth sorted by foot y
    const scale = S.actorScale;
    const light = FW.actorLight(st.time, st.scene);
    const items = [];
    const warm = st.scene === "exterior" ? n * Math.max(0, 1 - Math.hypot(player.x - 520, player.y - 640) / 260) * 0.35 : n * 0.15;
    const af = actionFrame();
    if (af) {
      const A = st.action, pos = A.clip === "lie" ? FW.SCENES.interior.bedSpot : [player.x, player.y];
      items.push({ y: pos[1], draw: () => {
        if (A.clip !== "lie") FW.drawShadow(ctx, Math.round(pos[0]), Math.round(pos[1]) - 1, 26 * scale, 8 * scale, 0.42);
        FW.drawFrame(ctx, af, Math.round(pos[0]), Math.round(pos[1]), { scale, fx: FW.LIMO.foot[0], fy: FW.LIMO.foot[1], light, warm });
      } });
    } else items.push({ y: player.y, draw: () => player.draw(ctx, scale, light, warm) });
    if (st.scene === "exterior") items.push(...npcs.items(scale, light, st.time));
    items.sort((a, b) => a.y - b.y);
    for (const it of items) it.draw(ctx);

    fx.drawSteam(ctx, st.time);
    screenXf();
    FW.applyGrade(ctx, st.time, n);
    worldXf();
    fx.drawLights(ctx, st.scene, st.time);
    fx.drawRain(ctx);
    screenXf();
    // wet-night cool sheen
    if (st.scene === "exterior") {
      const w = FW.extWeights(st.time);
      if (w.rain > 0.01) {
        ctx.fillStyle = `rgba(40,60,110,${0.06 * w.rain})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
    worldXf();
    if (!(st.action && st.action.clip === "lie" && st.action.phase !== "walk" && st.action.phase !== "turn")) nameplate(player.x, player.y - 178 * scale - 6, "李默");
    // ?npcnames=1: schedule debug labels (name · current scheduled activity)
    if (st.scene === "exterior" && params.get("npcnames") === "1") {
      const ACT = { cook: "做早点", setup: "出摊", packup: "收摊", walk: "走路", chat: "坐着聊天", stop: "送餐", ride: "送外卖", idle: "歇一会儿", route: "晨练" };
      for (const n of npcs.list) if (n.alpha > 0.5) {
        const a = ACT[n.sched.act] || n.sched.act;
        nameplate(n.x, n.y - (n.def.trips ? 112 : 100) * scale * 2 * 0.86 - 4, `${n.def.name} · ${a}`);
      }
    }
    screenXf();
  }

  // ---------- loop ----------
  let last = performance.now();
  const manual = params.get("manual") === "1"; // capture tools step the game themselves (deterministic GIFs)
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!manual) { update(dt); draw(); }
    requestAnimationFrame(frame);
  }
  function step(dt, held) {
    for (const k in keys) keys[k] = false;
    for (const k of held || []) keys[k] = true;
    update(dt); draw();
  }

  // ---------- boot & URL params (screenshots) ----------
  function parseTime(v) {
    if (!v) return null;
    if (FW.TIME_PRESETS[v] != null) return FW.TIME_PRESETS[v];
    const m = /^(\d{1,2}):?(\d{2})$/.exec(v);
    return m ? +m[1] * 60 + +m[2] : null;
  }
  function boot() {
    FW.UI.init();
    document.getElementById("lease-close").onclick = closePanel;
    document.getElementById("order-ok").onclick = confirmOrder;
    document.getElementById("order-cancel").onclick = closePanel;
    const t = parseTime(params.get("time"));
    if (t != null) st.time = t;
    if (params.get("clock") === "stop") st.clockRun = false;
    // weather: ?weather=rain|clear locks it (?time=rain implies rain); otherwise random per day (day 1 clear)
    const wq = params.get("weather") || (params.get("time") === "rain" ? "rain" : null);
    if (wq === "rain" || wq === "clear") { st.weather = wq; st.weatherLock = true; }
    if (params.get("seed")) st.weatherSeed = +params.get("seed");
    if (!st.weatherLock) st.weather = FW.weatherForDay(FW.dayIndex(st.time), st.weatherSeed);
    st.wet = FW.wet = st.weather === "rain" ? 1 : 0;
    const scene = params.get("scene") === "interior" ? "interior" : "exterior";
    setScene(scene);
    const near = params.get("near");
    if (near) {
      const h = FW.SCENES[st.scene].hotspots.find((x) => x.id === near);
      if (h) { player.x = h.x + (near === "stall" ? 28 : 0); player.y = h.y + (near === "door" ? 26 : 10); }
    }
    if (params.get("x")) player.x = +params.get("x");
    if (params.get("y")) player.y = +params.get("y");
    if (params.get("face")) player.setDir(params.get("face").toUpperCase());
    if (params.get("walk")) { st.forceWalk = true; player.moving = true; }
    if (params.get("frame")) {
      const f = +params.get("frame");
      if (st.forceWalk) { player.phase = f / FW.LIMO.walkFrames; player.frame = f % FW.LIMO.walkFrames; }
      else { player.t = f / FW.LIMO.idleFps + 0.001; player.frame = f % FW.LIMO.idleFrames; }
    }
    if (params.get("freeze") === "1") st.freezeAnim = true;
    if (params.get("order") === "1") setTimeout(openOrder, 50);
    if (params.get("lease") === "1") setTimeout(() => { st.panel = "lease"; FW.UI.show("lease-panel", true); }, 50);
    if (params.get("ui") === "0") document.body.classList.add("noui");
    if (params.get("toast") !== "0") FW.UI.toast(st.scene === "exterior" ? (FW.isTouch ? "井槐里。左下摇杆走动 · 互动 键交互 · ⏩ 切换时间" : "井槐里。WASD 走动 · E 交互 · T 切换时间 · R 天气") : "2F-02 室内", 2600);
    FW.UI.hud(st);
    // warm up particles so a fresh screenshot already has steam / rain in flight
    for (let i = 0; i < 90; i++) { if (st.scene === "exterior") npcs.update(1 / 30, st.time, fx); fx.update(1 / 30, st.scene, st.time); }
    // NPC placement params applied after warm-up so captures are deterministic
    // NPCs follow their schedules (js/schedule.js); old ?uncle= / ?rider= placement params are gone
    requestAnimationFrame(frame);
  }

  const bar = document.getElementById("loading");
  FW.loadAssets((d, n) => { if (bar) bar.textContent = `加载美术资源 ${d}/${n}`; }).then(() => {
    if (bar) bar.remove();
    FW.buildDerived();
    boot();
    window.__fushiReady = true;
  });

  window.__fushiDemo = { state: st, player, npcs, fx, setScene, interact, pressE, cycleTime, toggleWeather, toggleUmbrella, openOrder, confirmOrder, startSleep, step };
})(window.FW);

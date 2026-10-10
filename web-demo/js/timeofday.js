/* Time of day: clock, background weights, colour grade */
(function (FW) {
  "use strict";
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => t * t * (3 - 2 * t);
  const ramp = (x, a, b) => smooth(Math.max(0, Math.min(1, (x - a) / (b - a))));
  FW.lerp = lerp; FW.smooth = smooth; FW.ramp = ramp;

  FW.wrapMin = (m) => ((m % 1440) + 1440) % 1440;
  FW.fmtClock = (mins) => {
    const m = Math.floor(FW.wrapMin(mins));
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  };

  /** weather: FW.wet is the smoothed rain amount 0..1 (game.js eases it toward the day's weather).
      Rain only shows at night (the rain plate is a night plate); clear nights use ext_night. */
  FW.wet = 0;
  /** exterior bg weights {day, dusk, night, rain} summing to 1; dark = night + rain */
  FW.extWeights = function (mins, wet) {
    const m = FW.wrapMin(mins);
    const r = wet != null ? wet : FW.wet;
    // dusk rises 16:30-18:00, holds to 18:45, night 18:45-20:00 ; dawn 05:00-06:30 back to day
    let dark = 0, dusk = 0;
    if (m >= 990 && m < 1080) dusk = ramp(m, 990, 1080);
    else if (m >= 1080 && m < 1125) dusk = 1;
    else if (m >= 1125 && m < 1200) { dusk = 1 - ramp(m, 1125, 1200); dark = ramp(m, 1125, 1200); }
    else if (m >= 1200 || m < 300) dark = 1;
    else if (m >= 300 && m < 390) dark = 1 - ramp(m, 300, 390);
    return { day: Math.max(0, 1 - dusk - dark), dusk, night: dark * (1 - r), rain: dark * r, dark };
  };
  /** 0 = full day, 1 = full night (interior day/night crossfade, lights) */
  FW.nightFactor = function (mins) {
    const w = FW.extWeights(mins);
    return Math.min(1, w.dark + w.dusk * 0.55);
  };
  /** deterministic per-day weather: day 0 is clear, later days rain ~35% of nights */
  FW.dayIndex = (mins) => Math.floor((mins - 300) / 1440); // a "day" runs 05:00 -> 05:00
  FW.weatherForDay = function (day, seed) {
    if (day <= 0) return "clear";
    let h = Math.imul((day | 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(seed | 0, 0x27d4eb2f);
    h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
    return (h >>> 0) / 4294967296 < 0.35 ? "rain" : "clear";
  };
  FW.phaseName = function (mins) {
    const m = FW.wrapMin(mins);
    if (m < 300) return "深夜";
    if (m < 420) return "清晨";
    if (m < 690) return "上午";
    if (m < 810) return "正午";
    if (m < 990) return "下午";
    if (m < 1125) return "黄昏";
    if (m < 1320) return "夜晚";
    return "深夜";
  };

  FW.gradeAt = function (mins) {
    const m = FW.wrapMin(mins);
    const K = FW.GRADE_KEYS;
    let i = 0;
    while (i < K.length - 2 && K[i + 1].t <= m) i++;
    const a = K[i], b = K[i + 1];
    const t = smooth((m - a.t) / (b.t - a.t));
    const mix = (x, y) => x.map((v, j) => lerp(v, y[j], t));
    return { mul: mix(a.mul, b.mul), add: mix(a.add, b.add), vig: lerp(a.vig, b.vig, t) };
  };

  /** apply full-screen grade (after world, before UI) */
  FW.applyGrade = function (ctx, mins, extraNight) {
    const g = FW.gradeAt(mins);
    const W = ctx.canvas.width, H = ctx.canvas.height; // screen space (portrait canvas is taller than 16:9)
    ctx.save();
    if (g.mul[3] > 0.001) {
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = g.mul[3];
      ctx.fillStyle = `rgb(${g.mul[0] | 0},${g.mul[1] | 0},${g.mul[2] | 0})`;
      ctx.fillRect(0, 0, W, H);
    }
    if (g.add[3] > 0.001) {
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = g.add[3];
      ctx.fillStyle = `rgb(${g.add[0] | 0},${g.add[1] | 0},${g.add[2] | 0})`;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    const v = g.vig + (extraNight || 0) * 0.1;
    const vg = ctx.createRadialGradient(W / 2, H * 0.55, H * 0.32, W / 2, H / 2, H * 0.95);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, `rgba(4,6,14,${v.toFixed(3)})`);
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  };
})(window.FW);

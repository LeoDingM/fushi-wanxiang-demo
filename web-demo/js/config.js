/* 《浮世万象》Web Demo · 场景数据 / 坐标（全部为 1280x720 画布像素，对齐 img/bg 概念图） */
(function (FW) {
  "use strict";
  FW.W = 1280;
  FW.H = 720;

  FW.SPRITE = { box: [144, 204], foot: [72, 200] }; // NPC export box (uncle)
  // Li Mo: 3D-rendered pixel sprites (art-pack/sprites3d, see img/sprites/li_mo/palette.json)
  FW.LIMO = {
    box: [144, 204],
    foot: [72, 189],          // ground-contact origin of the 3D rig (feet land ~row 189-203 depending on facing/step)
    walkFrames: 12,
    idleFrames: 4,
    idleFps: 2.6,             // gentle breathing loop
    stride: 113.3,            // ground distance per walk cycle, sprite px at scale 1 (two steps)
    groundY: 0.4695,          // sin(28 deg camera pitch): screen-y foreshortening of the ground plane in the sprites
    turnStep: 0.045,          // s per 45 deg when turning (smooth facing change)
    settleStep: 0.05,         // s per frame of the stop transition (walk -> contact -> blend -> idle 0)
  };
  FW.PORTRAIT_VIEW_H = 600;   // portrait phones: world px shown vertically in the tall camera window (crop + follow)
  // Li Mo action clips (art-pack/sprites3d/li_mo_actions.json -> img/sprites/li_mo/<clip>_<DIR>_<i>.png); walk/idle unchanged
  FW.LIMO_ACTIONS = { door: { frames: 6 }, buy: { frames: 6 }, sit: { frames: 6 }, lie: { frames: 4, dirs: ["BED"] }, mail: { frames: 6 }, umbrella: { frames: 4 },
    uwalk: { frames: 12 }, uidle: { frames: 4 } };
  FW.WALK_Y = 0.55;           // vertical screen speed factor for movement (close to the sprites' ground foreshortening)
  FW.DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

  FW.ASSETS = {
    bg: {
      ext_day: "img/bg/ext_day.jpg",
      ext_dusk: "img/bg/ext_dusk.jpg",
      ext_night: "img/bg/ext_night.jpg", // clear night: day plate graded + light lifted from ext_rain (tools/build_night.py)
      ext_rain: "img/bg/ext_rain.jpg",
      int_day: "img/bg/int_day.jpg",
      int_night: "img/bg/int_night.jpg",         // rain night (rain streaks on the window glass)
      // clear night = int_night + this pane-only patch (tools/build_int_night_clear.py), composited at load into
      // FW.img["bg.int_night_clear"]; pixel-identical to int_night outside the four glass panes
      int_night_clear_win: "img/bg/int_night_clear_window.png",
    },
    story: { order: "img/story/order.jpg", sleep: "img/story/sleep.jpg" },
  };
  // Li Mo frames
  for (const c in FW.LIMO_ACTIONS)
    for (const d of FW.LIMO_ACTIONS[c].dirs || FW.DIRS)
      for (let i = 0; i < FW.LIMO_ACTIONS[c].frames; i++) FW.ASSETS[`${c}_${d}_${i}`] = `img/sprites/li_mo/${c}_${d}_${i}.png`;
  for (const d of FW.DIRS) {
    for (let i = 0; i < FW.LIMO.idleFrames; i++) FW.ASSETS[`idle_${d}_${i}`] = `img/sprites/li_mo/idle_${d}_${i}.png`;
    for (let i = 0; i < FW.LIMO.walkFrames; i++) FW.ASSETS[`walk_${d}_${i}`] = `img/sprites/li_mo/walk_${d}_${i}.png`;
  }
  // NPC frames are registered by js/npc.js (img/sprites/npc3d/<id>/, 3D pipeline); old 4-frame AI NPCs retired

  FW.SCENES = {
    exterior: {
      name: "井槐里 · 街口",
      actorScale: 0.5, // 180px art -> ~90px (matches baked Li Mo in L1 art)
      // walkable plaza polygon (sidewalk between 12号 steps, stall and curb)
      walk: [
        [548, 548], [585, 512], [652, 512], [706, 552], [790, 560], [880, 556],
        [935, 590], [655, 712], [585, 712], [566, 640], [560, 590],
      ],
      spawn: [618, 590],
      hotspots: [
        // spot / face: where Li Mo walks to and which way he faces for the action clip
        { id: "door", x: 618, y: 528, r: 46, label: "按 E 进入 12号", accent: "#c9a66b", spot: [618, 546], face: "N" },
        { id: "stall", x: 628, y: 680, r: 58, label: "按 E 点单 · 豆浆油条 ¥8", accent: "#e0a060", spot: [654, 686], face: "E" },
        { id: "locker", x: 744, y: 556, r: 40, label: "按 E 取快递", accent: "#6ec8c4", spot: [742, 562], face: "N" },
      ],
      steam: [
        { x: 498, y: 628, rate: 7, spread: 26 }, // stall pots (in art)
      ],
      // NPCs: see js/schedule.js (waypoint graph + daily schedules)
      windows: [ // lit windows in dusk/rain art -> flicker glow
        [224, 120, 26], [331, 163, 24], [436, 181, 26], [541, 247, 24], [737, 162, 24],
        [621, 312, 22], [444, 388, 24], [728, 230, 22], [598, 448, 30], [1100, 188, 60],
      ],
      lamps: [[728, 377, 90], [1016, 305, 110], [329, 556, 80], [583, 607, 70]],
      groundY: 470, // rain splashes below this line
    },
    interior: {
      name: "井槐里12号 · 2F-02",
      actorScale: 0.98,
      walk: [
        [470, 432], [528, 344], [668, 336], [748, 404], [868, 468], [908, 560],
        [820, 610], [610, 620], [520, 570],
      ],
      spawn: [612, 420],
      hotspots: [
        { id: "sleep", x: 490, y: 440, r: 60, label: "按 E 睡觉", accent: "#8ab0c8", spot: [486, 446], face: "NW" },
        { id: "computer", x: 690, y: 365, r: 58, label: "按 E 使用电脑", accent: "#6ec8c4", spot: [694, 384], face: "NE" },
        { id: "cook", x: 880, y: 500, r: 60, label: "按 E 做饭", accent: "#c86e6e" },
        { id: "lease", x: 540, y: 575, r: 50, label: "按 E 查看租约", accent: "#c9a66b" },
        { id: "exit", x: 640, y: 612, r: 50, label: "按 E 离开房间", accent: "#c9a66b", spot: [640, 606], face: "S" },
      ],
      steam: [], // kettle steam only when cooking (spawned by game)
      lampDesk: [662, 214],
      monitor: [738, 232],
      windowBeam: [380, 150],
      windowPatch: [318, 71],
      bedSpot: [322, 424],      // ground point under Li Mo's hips when the lie clip is drawn on the bed   // top-left of int_night_clear_window.png on the plate (= glass panes bbox)
    },
  };

  // Time-of-day keyframes (minutes). mul: multiply tint, add: additive lift, vig: vignette strength
  // bg weights computed separately in timeofday.js
  FW.GRADE_KEYS = [
    { t: 0, mul: [80, 92, 160, 0.30], add: [20, 30, 70, 0.02], vig: 0.55 },
    { t: 300, mul: [90, 100, 165, 0.26], add: [40, 40, 80, 0.02], vig: 0.5 },
    { t: 360, mul: [200, 180, 210, 0.16], add: [255, 160, 110, 0.10], vig: 0.35 },
    { t: 480, mul: [255, 245, 230, 0.04], add: [255, 225, 170, 0.07], vig: 0.25 },
    { t: 720, mul: [255, 255, 255, 0.0], add: [255, 250, 235, 0.06], vig: 0.2 },
    { t: 960, mul: [255, 225, 190, 0.08], add: [255, 190, 110, 0.07], vig: 0.25 },
    { t: 1080, mul: [235, 175, 150, 0.10], add: [255, 140, 80, 0.07], vig: 0.35 },
    { t: 1170, mul: [150, 140, 190, 0.14], add: [120, 80, 120, 0.04], vig: 0.45 },
    { t: 1260, mul: [110, 125, 190, 0.18], add: [50, 70, 130, 0.03], vig: 0.5 },
    { t: 1440, mul: [80, 92, 160, 0.30], add: [20, 30, 70, 0.02], vig: 0.55 },
  ];

  // T key cycles these presets (also ?time=)
  FW.TIME_PRESETS = { dawn: 6 * 60 + 10, day: 8 * 60 + 15, noon: 12 * 60 + 30, dusk: 18 * 60 + 15, night: 21 * 60 + 40, rain: 22 * 60 + 30, late: 1 * 60 + 30 };
  FW.TIME_CYCLE = ["day", "noon", "dusk", "night", "late", "dawn"];
  FW.GAME_MIN_PER_SEC = 1.0; // 1 real second = 1 game minute
})((window.FW = window.FW || {}));

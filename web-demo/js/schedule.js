/* NPC daily schedules — PURE DATA (no code, no DOM), engine-agnostic so it can move to the Godot WorldCore as-is.
   Times are clock "HH:MM"; a schedule day runs 05:00 -> 05:00. Coordinates are exterior canvas px (1280x720 plate).
   Driven by the in-game clock + weather through js/npcbrain.js (planner/sampler) — not random wandering.

   graph:   waypoint nodes + undirected edges; NPCs path between nodes (shortest path).
   npcs.X:  sprite set, walk speed (px per game minute; 1 game min = 1 real s), start node, blocks[].
   block:   { from, to, act, at | route, face, wait, unless: { weather: "rain" | "dark" } , instead: {...} }
     act:   "inside"  walk to `at`, then hidden (inside a building / off-screen)
            "cook" | "setup" | "packup" | "chat" | "idle"   walk to `at`, then do that action until `to`
            "route"   walk the node list `route`, pausing `wait` min at each node, looping until `to`
   trips:   (rider) deliveries generated per time window: { from, to, every (min) , jitter } along `path`,
            stopping `stop` min at `stopAt`. Mostly at meal peaks, rarely at night. */
(function (root) {
  "use strict";
  const SCHEDULE = {
    version: 1,
    graph: {
      nodes: {
        door_in: [612, 506],      // just inside 12号 (hidden)
        door: [616, 534],
        plaza: [650, 588],
        locker: [742, 552],
        gate_seat: [572, 566],    // uncle's stool by the entrance steps
        stall_cook: [694, 668],   // vendor's spot behind the cart, right of the stall
        stall_back: [742, 700],
        corner: [880, 586],
        road_edge: [1010, 600],
        exit_e: [1330, 500],      // off-screen (east, along the lower road)
        curb_s: [628, 706],
        exit_s: [560, 790],       // off-screen (south)
        // road (rider)
        road_e: [1345, 470],
        road_mid: [1120, 568],
        drop: [928, 650],         // stop at the curb in front of 12号
        road_sw: [690, 812],
      },
      edges: [
        ["door_in", "door"], ["door", "plaza"], ["door", "gate_seat"], ["gate_seat", "plaza"], ["plaza", "locker"],
        ["plaza", "stall_back"], ["stall_back", "stall_cook"], ["plaza", "curb_s"], ["curb_s", "exit_s"], ["locker", "corner"],
        ["plaza", "corner"], ["corner", "road_edge"], ["road_edge", "exit_e"], ["stall_back", "curb_s"],
        ["road_e", "road_mid"], ["road_mid", "drop"], ["drop", "road_sw"],
      ],
    },
    npcs: {
      vendor: {
        name: "王阿姨", sprite: "vendor", speed: 42, start: "exit_s",
        blocks: [
          { from: "05:30", to: "06:00", act: "setup", at: "stall_cook", face: "S" },     // arrives, sets the cart up
          { from: "06:00", to: "10:30", act: "cook", at: "stall_cook", face: "S" },      // cooks / serves
          { from: "10:30", to: "10:50", act: "packup", at: "stall_cook", face: "S" },
          { from: "10:50", to: "05:30", act: "inside", at: "exit_s" },                   // goes home (south)
        ],
        cart: { at: "stall_cook", from: "05:30", to: "10:50" },  // cart visible (fades in/out during setup/packup)
      },
      uncle: {
        name: "巡逻大爷", sprite: "uncle", speed: 30, start: "door_in",
        blocks: [
          { from: "07:00", to: "08:30", act: "route", route: ["door", "plaza", "corner", "road_edge", "corner", "locker", "plaza", "curb_s", "plaza"], wait: 2,
            unless: { weather: "rain" } },                                               // morning walk (stays in when it rains)
          { from: "08:30", to: "14:00", act: "inside", at: "door_in" },
          { from: "14:00", to: "18:00", act: "chat", at: "gate_seat", face: "SE", unless: { weather: "rain" } },  // sits by the gate
          { from: "18:00", to: "07:00", act: "inside", at: "door_in" },                  // home at dusk, in all night
        ],
      },
      office: {
        name: "上班族", sprite: "office", speed: 50, start: "door_in",
        blocks: [
          { from: "07:55", to: "19:00", act: "inside", at: "exit_s" },                   // leaves for work ~08:00
          { from: "19:00", to: "07:55", act: "inside", at: "door_in" },                  // back ~19:00
        ],
      },
      student: {
        name: "学生", sprite: "student", speed: 48, start: "door_in",
        blocks: [
          { from: "07:20", to: "17:10", act: "inside", at: "exit_e" },                   // to school
          { from: "17:10", to: "07:20", act: "inside", at: "door_in" },                  // home
        ],
      },
      rider: {
        name: "外卖骑手", sprite: "rider", speed: 150, start: "road_e",
        trips: {
          path: ["road_e", "road_mid", "drop", "road_sw"], stopAt: "drop", stop: 1.5, face: "SW",
          windows: [
            { from: "07:00", to: "11:00", every: 40, jitter: 10 },
            { from: "11:00", to: "13:00", every: 9, jitter: 3 },     // lunch peak
            { from: "13:00", to: "17:00", every: 35, jitter: 10 },
            { from: "17:00", to: "20:00", every: 10, jitter: 3 },    // dinner peak
            { from: "20:00", to: "22:00", every: 30, jitter: 8 },
            { from: "22:00", to: "07:00", every: 150, jitter: 20 },  // rare late-night orders
          ],
        },
      },
    },
  };
  if (typeof module !== "undefined" && module.exports) module.exports = SCHEDULE;
  else (root.FW = root.FW || {}).SCHEDULE = SCHEDULE;
})(typeof window !== "undefined" ? window : globalThis);

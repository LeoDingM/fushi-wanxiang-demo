# shared-rules — engine-agnostic gameplay rules for 浮世万象

Used by the front-view line (`scene-proto/js/game.js`) and written so the 45° line (`scene-proto-45/`) and the future
Godot WorldCore can reuse it 1:1. **Pure data + pure functions over a plain-JSON state**: no DOM, no canvas, no engine, no
randomness, no wall-clock time. The engine owns rendering, the clock and "where is the player"; the rules own needs,
money, items, rent and what an action does.

| file | |
|---|---|
| `rules.json` | all tunables (needs, conditions, items/prices, rent, actions). Edit this, not the code. |
| `rules.js` | UMD module: `window.FushiRules` in the browser, `require("./rules.js")` in node. |
| `rules.data.js` | `rules.json` wrapped as `window.FUSHI_RULES_DATA` so `file://` pages can load it without fetch. Regenerate: `python3 build.py`. |
| `test_rules.js` | `node test_rules.js` — 11 unit tests (decay, sleep, cooking, shopping, rent paid/owed, conditions, a solvent week, serialize). |

## Time
All times are **absolute game minutes**: `abs = day * 1440 + minuteOfDay`. Weekday = `(calendar.start_weekday + floor(abs/1440)) % 7`
(0 = Sunday). The engine's calendar must use the same formula (scene-proto: `SP.clock.weekday()`), because the compressed
season calendar skips dates while rent is weekly.

## Using it
```js
const R = FushiRules.create(window.FUSHI_RULES_DATA);       // or require("./rules.js").create(require("./rules.json"))
let s = R.newState(clock.abs());                            // plain JSON player state
// every sim step (or every few game minutes):
const evs = R.tick(s, gameMinutesElapsed, { abs: clock.abs(), outdoors, weather: "rain", umbrella: true, activity: runningSleepId });
// at an interactable: what can I do here?
R.actionsAt(s, "stove", { abs, flags })   // -> [{id:"cook_noodles", label, ok, reason, minutes, cost}, ...]
const r = R.perform(s, "cook_noodles", { abs, flags, place: "stove" });
// r = {ok, id, label, minutes, activity, text, events} — the engine then plays the activity and fast-forwards
// r.minutes of game time, calling R.tick(..., {activity: r.activity}) meanwhile (sleep gains energy per hour).
R.status(s, ctx)                          // HUD view: {needs:[{id,label,icon,value,level:"ok|warn|critical"}], money, owed, rentDue, conditions:[labels], speedMul, moodLabel}
```

## API (all functions take the state `s` and mutate it in place; none keep hidden state)
| call | returns | notes |
|---|---|---|
| `create(data)` | rules object `R` | `R.data`, `R.needs` (need ids in order) |
| `R.newState(abs, overrides?)` | state | `{v, needs{}, money, items{}, owed, rentDue, rentPaid, flags{}, log[], stats{actions, spent, earned}}` |
| `R.tick(s, minutes, ctx)` | events[] | decay (or sleep `per_h`), condition effects, rent at `rentDue` (auto-paid if affordable, else `owed` + mood hit). `ctx.abs` = time **after** the step. |
| `R.check(s, id, ctx)` | `{ok, reason, label, minutes, cost}` | time window (sleep), `requires` (energy_below, flag), money, items, place |
| `R.actionsAt(s, place, ctx)` | `[{id, ...check}]` | every action whose `place` matches |
| `R.perform(s, id, ctx)` | `{ok, minutes, activity, text, events}` or the failed check | pays, consumes, applies `set` then `effects` immediately |
| `R.minutes(id, abs)` | minutes | sleep actions run until `wake_min` |
| `R.conditions(s, ctx)` | condition defs | active now (need thresholds, weather outdoors w/o umbrella, owing) |
| `R.status(s, ctx)` | HUD view | see above; `speedMul` = min of active conditions' `speed_mul` (tired → slower walk) |
| `R.weekday(abs)`, `R.nextRentDue(abs)` | number | |
| `R.addItem(s, item, n)`, `R.earn(s, amt, why, abs)`, `R.spend(s, amt, why, abs)` | – / event / event or null | for shops, jobs (stage 2.3), damage costs (2.5) |
| `R.serialize(s)`, `R.load(str)` | string / state | state is plain JSON; save files are just this |

Events (also appended to `s.log`, last 60): `{type:"need_low", need, level}`, `{type:"rent_paid", amount, late?}`,
`{type:"rent_owed", amount, owed}`, `{type:"action", id}`, `{type:"earn"|"spend", amount, why}` — each with `t` (abs).

## Data (`rules.json`)
- `needs.<id>`: `label, icon, start, decay_per_h, sleep_decay_per_h, warn, critical` — hunger 饱腹, energy 精力, hygiene 清洁, mood 心情 (0..100).
- `conditions[]`: `{id, label, when:{need, below} | {weather, outdoors, no_umbrella} | {owing}, per_h:{need:delta}, speed_mul}`.
- `money.start`, `items.<id>: {label, price}`, `start_items`.
- `rent`: `{amount, every_days, due_weekday, due_min, late_mood, landlord}` (¥450 every Sunday 20:00).
- `actions.<id>`: `{label, place, minutes | kind:"sleep" + wake_min + allowed_from/to, per_h, cost, consume{}, set{}, effects{}, requires{energy_below, flag}, text}`.
  Places used now: `bed, stove, fridge, shower, basin, toilet, wardrobe, pc, shelf, window, stall, vending, any`.
  `flags` the engine passes in ctx: `vendor_open` (breakfast stall staffed), `bed_messy`.

## Engine contract (what scene-proto does, the 45° line should mirror it)
1. Map each interactable's `interact` kind to a rules `place` (scene-proto: `PLACE` table in `js/game.js`).
2. Call `R.tick` every frame with the game minutes that passed (including fast-forward during activities).
3. On use: `actionsAt` → 1 option: `perform`; several: show a menu. While an activity runs, lock movement, set object
   visual states (stove `cooking`, bed `messy`, shower `running`, PC `on`), fast-forward the clock by `minutes`.
4. Show `status()` in the HUD; apply `speedMul` to walking speed; toast `events`.

"""Stage 3 interiors playtest (also imported by playtest.py): street door -> stairwell, rapid up/down/up cycles on the
switchback flights (triggers re-arm; spawns outside every rect), held stick across a transition (no instant bounce),
floor-select menu incl. the ROOFTOP, roof -> 2F, home door -> 2F-02, walk-out through the flat door, stair collision."""
import sys, time, json, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import cdp

def run(c, log):
    E = c.eval
    def ok(name, cond, info=""):
        log.append(("PASS " if cond else "FAIL ") + name + (" — " + str(info) if info != "" else "")); return cond
    E("SP.actions.reset && SP.actions.reset()")
    # street unit door
    E("SP.player.x=1.5; SP.player.y=11.95; SP.actions.idle(0.1)")
    near = E("SP.state.near && SP.state.near.id")
    E("SP.actions.interact(); SP.actions.idle(0.7)")
    ok("interiors: E at the 12号 unit door enters the 1F stairwell", E("SP.place.where()") == "stair_1f", near)
    # rapid cycles 2F <-> 3F
    E("SP.actions.go('stair_2f', [7.0, 0.34, 'N']); SP.actions.idle(0.2)")
    seq = []
    for i in range(3):
        seq.append(E("SP.actions.walk(0,1,0.8)")); E("SP.actions.idle(0.4)")
        E("SP.actions.walk(0,-1,0.12)")
        seq.append(E("SP.actions.walk(0,1,0.9)")); E("SP.actions.idle(0.4)")
        E("SP.actions.walk(0,-1,0.12)")
    ok("interiors: rapid up/down/up cycle (6 transits, triggers re-arm every time)", seq == ["stair_3f", "stair_2f"] * 3, seq)
    # held stick: arriving on 4F while still pushing north must not bounce straight back down
    E("SP.actions.go('stair_3f', [7.0, 0.34, 'N']); SP.actions.idle(0.2)")
    a = E("SP.actions.walk(0,1,0.75)"); b = E("SP.actions.walk(0,1,0.25)")
    ok("interiors: stick held through a transition does not bounce back instantly", a == "stair_4f" and b == "stair_4f", [a, b])
    c2 = E("SP.actions.walk(0,1,1.3)")
    ok("interiors: ...but a deliberate long push into the down flight still goes (never a dead trigger)", c2 == "stair_3f", c2)
    # floor menu
    E("SP.actions.go('stair_4f'); SP.player.x=7.0; SP.player.y=0.4; SP.actions.idle(0.1)")
    near = E("SP.state.near && SP.state.near.id")
    opts = json.loads(E("SP.actions.interact(); JSON.stringify(SP.game.menu ? SP.game.menu.opts.map(o=>o.label) : [])") or "[]")
    ok("interiors: Interact at the stairs opens the floor menu (1F-6F + 天台)", len(opts) == 6 and any("天台" in o for o in opts), [near, opts])
    E("SP.game.pick(SP.game.menu.opts.findIndex(o=>o.label.includes('天台'))); SP.actions.idle(0.8)")
    ok("interiors: floor menu -> rooftop (street world, z 18 m)", E("SP.place.where()") == "roof" and E("SP.player.z") == 18)
    E("SP.actions.walk(1,0,2.0)"); E("SP.actions.walk(0,-1,6)")
    pos = json.loads(E("JSON.stringify([SP.player.x, SP.player.y])"))
    ok("interiors: rooftop parapets hold (walk into the south edge)", pos[1] > 13.3 and SP_ok(pos), pos)
    E("SP.player.x=-1.1; SP.player.y=18.4; SP.actions.idle(0.1)")
    E("SP.actions.interact()")
    E("SP.game.pick(SP.game.menu.opts.findIndex(o=>o.label.includes('2F'))); SP.actions.idle(0.8)")
    ok("interiors: roof -> 2F via the menu", E("SP.place.where()") == "stair_2f")
    E("SP.player.x=4.3; SP.player.y=3.55; SP.actions.idle(0.1); SP.actions.interact(); SP.actions.idle(0.8)")
    ok("interiors: 2F-02 door -> the flat", E("SP.place.where()") == "room_2f02")
    E("SP.actions.walk(0,-1,0.3)")
    w = E("SP.actions.walk(1,0,1.5)")
    ok("interiors: walking out through the flat door returns to the 2F corridor", w == "stair_2f", w)
    # stair collision: the flights are entered from the open (south) side only; railings / well block
    E("SP.actions.go('stair_3f', [4.6, 2.5, 'E'])"); E("SP.actions.walk(1,0,1.5)")
    x = E("SP.player.x")
    ok("interiors: stair well / railings block from the side (no walking onto the flights from the west)", x < 4.7, round(x, 2))
    # room-layout runtime check (every interior scene): flood fill from the spawn with 李默's radius (interior doors
    # opened), every interactable within 1 m of a reachable spot, nothing standing in a door's swing
    rep = json.loads(E("""(() => { const out = {};
      for (const id of Object.keys(SP.scenes)) { if (!SP.scenes[id].interior) continue; SP.actions.go(id);
        const W = SP.world, P = SP.player, B = W.data.bounds, c = 0.1; W._mover = P;
        for (const o of W.objects) if (o.interact === "idoor") o.state = "open"; W.rebuildColliders();
        const nx = Math.ceil((B.x1 - B.x0) / c), ny = Math.ceil((B.y1 - B.y0) / c), seen = new Uint8Array(nx * ny), st = [];
        const ok = (i, j) => i >= 0 && j >= 0 && i < nx && j < ny && !W.blockedStatic(B.x0 + i * c, B.y0 + j * c, 0.22);
        const si = Math.round((P.x - B.x0) / c), sj = Math.round((P.y - B.y0) / c); if (ok(si, sj)) { seen[si * ny + sj] = 1; st.push([si, sj]); }
        const pts = []; while (st.length) { const [i, j] = st.pop(); pts.push([B.x0 + i * c, B.y0 + j * c]);
          for (const [a, b] of [[1,0],[-1,0],[0,1],[0,-1]]) { const k = (i + a) * ny + j + b; if (!seen[k] && ok(i + a, j + b)) { seen[k] = 1; st.push([i + a, j + b]); } } }
        const bad = [];
        for (const o of W.objects) if (o.interact) { const ps = o.reach ? (Array.isArray(o.reach[0]) ? o.reach : [o.reach]) : [[o.x, o.y]]; for (const p of ps) if (!pts.some(([x, y]) => Math.hypot(x - p[0], y - p[1]) <= 1.0)) { bad.push(o.id); break; } }
        for (const q of W.portals) if (!pts.some(([x, y]) => x >= q.rect[0] && x <= q.rect[2] && y >= q.rect[1] && y <= q.rect[3])) bad.push("portal " + q.id);
        for (const o of W.objects) if (o.interact === "idoor") o.state = "closed"; W.rebuildColliders();
        out[id] = { cells: pts.length, bad };
      } return JSON.stringify(out); })()"""))
    ok("layout: every interactable + portal reachable on foot in every interior (runtime flood fill)", all(not v["bad"] for v in rep.values()), {k: v["bad"] for k, v in rep.items() if v["bad"]} or {k: v["cells"] for k, v in rep.items()})
    # bathroom door: closed blocks, Interact opens, walk in, toilet reachable
    E("SP.actions.go('room_2f02'); SP.player.x=5.45; SP.player.y=1.45; SP.actions.idle(0.1)")
    blocked = E("SP.actions.walk(0,1,1.2); SP.player.y")
    E("SP.player.x=5.45; SP.player.y=1.6; SP.actions.idle(0.1)")
    near = E("SP.state.near && SP.state.near.id")
    E("SP.actions.interact(); SP.actions.idle(0.2)")
    st = E("SP.world.byId.bath_door.state")
    y = E("SP.actions.walk(0,1,1.4); SP.player.y")
    ok("layout: bathroom door is real (closed blocks, Interact opens, walk in)", blocked < 1.8 and near == "bath_door" and st == "open" and y > 2.3, [round(blocked, 2), near, st, round(y, 2)])
    # Stage 4: home actions drive the needs + use the right poses; knock replies; 声控灯; pay cards; real calendar
    r4 = json.loads(E("""(() => { const G=SP.game, W=SP.world, P=SP.player, o={};
      SP.actions.go('room_2f02'); G.ps.items.noodles=2; G.ps.items.egg=4; G.ps.needs.hunger=30; G.ps.needs.hygiene=30;
      P.x=1.1; P.y=1.25; SP.actions.idle(0.1); G.start('cook_noodles', W.byId.kitchen); o.cook=P.homeClip; SP.actions.idle(4); o.meal=W.byId.table.state; o.h1=G.ps.needs.hunger;
      P.x=2.0; P.y=0.5; SP.actions.idle(0.1); G.start('eat_home', W.byId.table); o.eat=P.homeClip; o.eatAt=[P.x,P.y]; SP.actions.idle(4); o.cleared=W.byId.table.state;
      W.setState(W.byId.bath_door,'open'); W.rebuildColliders(); P.x=5.3; P.y=2.7; SP.actions.idle(0.1);
      G.start('shower', W.byId.shower); o.frost=P.frosted && !P.hidden; o.doorShut=W.byId.bath_door.state; SP.actions.idle(4); o.hy=G.ps.needs.hygiene; o.back=[+P.x.toFixed(2),+P.y.toFixed(2)];
      const m0=G.ps.money; G.start('order_hmj', W.byId.desk); o.paid=m0-G.ps.money; o.cards=document.getElementById('paystack').children.length; SP.actions.idle(4);
      SP.actions.go('stair_4f'); SP.clock.min=23*60; const L=W.byId.hall_light_4f; SP.actions.idle(30); o.l0=L.state; window.__proto.kick ? 0 : 0;
      G.noise(P.x,P.y,'stomp'); SP.actions.idle(0.2); o.l1=L.state; SP.actions.idle(27); o.l2=L.state;
      SP.clock.min=14*60; P.x=4.3; P.y=3.6; const d=W.byId.door_4f02; G.knocks={}; G.knock(d); SP.actions.idle(1.5); o.knock=W.log.slice(-1)[0].text;
      SP.actions.go('stair_5f'); P.x=2.1; P.y=3.6; G.knock(W.byId.door_5f01); SP.actions.idle(1.5); o.knock5=W.log.slice(-1)[0].text; o.open5=W.byId.door_5f01.state;
      const GR=G.rules; o.nd=GR.date(GR.dayOf(2026,10,1)*1440+600); o.wk=GR.date(GR.dayOf(2026,3,28)*1440).weekend;
      return JSON.stringify(o); })()"""))
    ok("home: cook pose at the stove -> meal on the table, hunger up", r4["cook"] == "cook" and r4["meal"] == "meal" and r4["h1"] > 60, r4)
    ok("home: sit on the stool and eat (eat pose), dishes cleared after", r4["eat"] == "eat" and r4["eatAt"] == [2.0, 0.8] and r4["cleared"] == "default", [r4["eat"], r4["eatAt"], r4["cleared"]])
    ok("home: shower = frosted silhouette behind the shut bathroom door, hygiene restored, back out after", r4["frost"] and r4["doorShut"] == "closed" and r4["hy"] > 95 and r4["back"] == [5.3, 2.7], [r4["frost"], r4["doorShut"], r4["hy"], r4["back"]])
    ok("pay: takeout charged via 微信支付 with a payment card", r4["paid"] == 18 and r4["cards"] >= 1, [r4["paid"], r4["cards"]])
    ok("声控灯: dark corridor stays off until a stomp, on after it, off again ~25 s later", r4["l0"] == "off" and r4["l1"] == "on" and r4["l2"] == "off", [r4["l0"], r4["l1"], r4["l2"]])
    ok("neighbour doors: knock replies (away / at home, door opens)", "牛奶" in r4["knock"] and "老陈" in r4["knock5"] and r4["open5"] == "open", [r4["knock"], r4["knock5"], r4["open5"]])
    ok("calendar: 国庆 statutory holiday + weekends from shared-rules", r4["nd"]["holiday"] == "国庆节" and r4["nd"]["statutory"] and r4["wk"], r4["nd"])
    # ---- hotfix 1: reset in every place, then enter every interior: no street cars / bus / NPCs drawn indoors
    bad = []
    for place in ["street", "stair_2f", "room_2f02", "roof"]:
        E(f"SP.actions.go('{place}'); SP.actions.idle(0.3); SP.actions.reset(); SP.actions.idle(4)")
        for sc in ["stair_1f", "stair_2f", "stair_3f", "stair_4f", "stair_5f", "stair_6f", "room_2f02"]:
            r = json.loads(E(f"(() => {{ SP.actions.go('{sc}'); SP.clock.setTimeName('night', true); SP.actions.idle(0.2); window.__proto.render(); const k = SP.state.dynKinds || {{}};"
                             f" return JSON.stringify({{w: SP.place.where(), car: k.car || 0, npc: k.npc || 0, actors: SP.actors.list.length, carLights: SP.env.lights(SP.state.view, 1).filter(l => l.flat && l.r === 3).length }}); }})()"))
            if r["w"] != sc or r["car"] or r["npc"] or r["actors"] != 1: bad.append([place, sc, r])
    ok("hotfix: reset in street / interior / roof, then every interior: no outdoor cars / NPCs drawn, only 李默", not bad, bad[:3] or "4 resets × 7 interiors")
    E("SP.actions.go('street'); SP.actions.reset(); SP.actions.idle(1)")
    # ---- hotfix 2: street light pools never light the roof (per-elevation light layer)
    rr = json.loads(E("""(() => { SP.actions.go('roof'); SP.clock.setTimeName('night', true); SP.actions.idle(0.5);
      const R = SP.world.data.roof, x = (R.rect[0] + R.rect[2]) / 2, y = (R.rect[1] + R.rect[3]) / 2, t = R.z * SP.PZ / (2 * SP.KY);
      const g0 = SP.traffic.glows, px = () => { window.__proto.render(); const cv = document.querySelector('canvas'), c2 = cv.getContext('2d'), z = SP.cam.zoom;
        const cx = Math.round(SP.cam.x * z) / z, cy = Math.round(SP.cam.y * z) / z, X = Math.round((SP.sx(x, y) - cx) * z), Y = Math.round((SP.sy(x, y, R.z) - cy) * z);
        const d = c2.getImageData(X - 3, Y - 3, 6, 6).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += d[i] + d[i + 1] + d[i + 2]; return s / 36; };
      SP.traffic.glows = () => []; const a = px();
      SP.traffic.glows = () => [{ x: x + t, y: y + t, z: 0, r: 4, c: [255, 240, 200], a: 1.0, flat: true }]; const b = px();
      SP.traffic.glows = g0; return JSON.stringify({ a, b, masked: SP.env.roofMasked || 0 }); })()"""))
    ok("hotfix: a headlight pool on the street right under the roof does not light the roof deck", abs(rr["b"] - rr["a"]) < 6 and rr["masked"] > 0, rr)
    E("SP.actions.go('street'); SP.clock.setTimeName('day', true)")
    # ---- hotfix 3: every interactable can be targeted from its approach spot(s) (cycling if several are in reach); bed -> sleep / nap
    miss = []; tot = 0
    for sc in ["stair_1f", "stair_2f", "stair_3f", "stair_6f", "room_2f02"]:
        r = json.loads(E(f"""(() => {{ SP.actions.go('{sc}'); SP.actions.idle(0.2); const W = SP.world, P = SP.player, out = [], st = SP.state; let n = 0;
          for (const o of W.objects) {{ if (!o.interact || o.interact === 'portal' && !o.reach || !(W.actionFor(o, 'use') || W.actionFor(o, 'kick'))) continue;
            const pts = o.reach ? (Array.isArray(o.reach[0]) ? o.reach : [o.reach]) : [W.reachPt(o)];
            for (const p of pts) {{ n++; P.x = p[0]; P.y = p[1]; P.setDir(SP.dirFromWorld(o.x - p[0], o.y - p[1])); SP.actions.idle(0.05);
              let hit = false; for (let k = 0; k < 6 && !hit; k++) {{ hit = st.near === o; if (!hit) SP.cycleTarget(); SP.actions.idle(0.02); }}
              if (!hit) out.push(o.id + '@' + p.map(v => v.toFixed(2))); }} }}
          return JSON.stringify({{ n, out }}); }})()"""))
        tot += r["n"]; miss += [sc + ":" + m for m in r["out"]]
    ok("hotfix: every interactable is targetable from each approach spot (facing it, ⇄ cycle when several)", not miss, miss[:6] or f"{tot} spots")
    rb = json.loads(E("""(() => { SP.actions.go('room_2f02'); const W = SP.world, P = SP.player; SP.clock.setTimeName('night', true); SP.actions.idle(0.3);
      P.x = 0.8; P.y = 2.62; P.setDir('N'); SP.actions.idle(0.1); let k = 0; while (SP.state.near !== W.byId.bed && k++ < 6) { SP.cycleTarget(); SP.actions.idle(0.02); }
      const lab = SP.state.near && W.actionFor(SP.state.near, 'use'); SP.actions.interact(); SP.actions.idle(0.1);
      const m = SP.game.menu ? SP.game.menu.opts.map(o => o.label + (o.ok ? '' : '×')) : null, act = SP.game.activity && SP.game.activity.id;
      if (SP.game.menu) SP.game.pick(SP.game.menu.opts.findIndex(o => o.ok && /睡/.test(o.label)));
      SP.actions.idle(0.3); const a2 = SP.game.activity && SP.game.activity.id; SP.actions.idle(8);
      return JSON.stringify({ near: SP.state.near && SP.state.near.id, lab: lab && lab.label, menu: m, act: act || a2 }); })()"""))
    ok("hotfix: bed targeted from its open long side, sleep reachable at night", rb["act"] in ("sleep", "nap"), rb)
    E("SP.clock.setTimeName('day', true)")
    E("SP.actions.go('street')")
    ok("interiors: back on the street, NPCs + traffic restored", E("SP.actors.list.length") > 3 and E("SP.place.where()") == "street", E("SP.actors.list.length"))

def SP_ok(p): return -5.8 < p[0] < 8.8

if __name__ == "__main__":
    p, prof, ws = cdp.start(); c = cdp.CDP(ws); c.call("Runtime.enable")
    c.call("Page.navigate", url=cdp.BASE + "?manual=1")
    for _ in range(100):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady"): break
    log = []
    try: run(c, log)
    finally:
        errs = [l for l in c.logs if l.get("method") == "Runtime.exceptionThrown"]
        log.append(("PASS" if not errs else "FAIL") + " interiors: no JS errors " + (json.dumps(errs[0])[:400] if errs else ""))
        print("\n".join(log)); p.kill()

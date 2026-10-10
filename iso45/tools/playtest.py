"""Automated playtest of scene-proto-45 (45-degree 2:1 dimetric prototype). Headless Chrome via CDP (own profile, free
   port), file://, deterministic manual stepping. Includes the 穿模 / clipping audit (3 simulated hours by default).
   python3 tools/playtest.py [--hours 3]      -> PASS/FAIL lines + summary (exit 1 on failure)
   Keys are SCREEN directions: w = up the screen (world NE), w+a = world N, w+d = world E, s+d = world S, s+a = world W."""
import os, sys, time, json, shutil, subprocess, argparse
sys.path.insert(0, os.path.dirname(__file__))
from cdp import start, CDP, BASE

P = "window.__proto"
N_, E_, S_, W_ = ["w", "a"], ["w", "d"], ["s", "d"], ["s", "a"]
results = []
def check(name, cond, info=""):
    results.append((name, bool(cond), info)); print(("PASS " if cond else "FAIL ") + name, ("— " + str(info)) if info != "" else "", flush=True)

def main(hours):
    p, prof, ws = start()
    try:
        c = CDP(ws); c.call("Runtime.enable")
        c.call("Emulation.setDeviceMetricsOverride", width=1280, height=720, deviceScaleFactor=1, mobile=False)
        c.call("Page.navigate", url=BASE + "?manual=1&shot=1")
        for _ in range(150):
            time.sleep(0.1)
            if c.eval("!!window.__protoReady"): break
        g = c.eval
        step = lambda s, dt=1 / 30: g(f"{P}.step({dt},{max(1, int(round(s / dt)))})")
        hold = lambda ks: g(f"window.SP.input={json.dumps({k: True for k in ks})}")
        place = lambda x, y, d="N": g(f"{P}.place({x},{y},'{d}')")
        pos = lambda: g(f"[{P}.player.x,{P}.player.y]")
        scr = lambda: g(f"{P}.player.screen()")
        idx = lambda name: g(f"{P}.order().indexOf('{name}')")
        def walk(x, y, keys, secs, d="N"):
            place(x, y, d); hold(keys); step(secs); hold([]); step(0.1); return pos()
        # quiet street for the deterministic checks: NPCs parked far away, re-enabled for the NPC / audit section
        park = lambda: g(f"window.SP.npcs.list.forEach((a,i)=>{{a.x=-11+i*0.8;a.y=-11;a.brain.dwell=1e9}});true")
        unpark = lambda: g(f"{P}.reset();true")

        nf = g("Object.keys(window.SP.K.frames).length")
        check("45° kit atlas + manifest loaded (2:1 dimetric projection)", nf > 150 and g("window.SP.img.atlas.naturalWidth") == 2048 and g("window.SP.K.projection.yaw_deg") == 45 and g("window.SP.K.projection.px_y_per_m") * 2 == g("window.SP.K.projection.px_x_per_m"), f"{nf} frames")
        na = g("Object.entries(window.ACTORS).map(([k,v])=>k+':'+Object.keys(v.frames).length).join(' ')")
        check("李默 + 5 NPC sprite sets (out45) loaded", g("Object.keys(window.ACTORS).every(k=>window.SP.img['actor_'+k] ? window.SP.img['actor_'+k].naturalWidth>0 : /^(clerk_|li_mo_uniform|li_mo_bar)/.test(k))") and g("Object.keys(window.ACTORS.li_mo.frames).length") >= 128, na)
        check("scene objects instantiated from scene.json", g(f"{P}.world.objects.length") > 400, g(f"{P}.world.objects.length"))
        park()
        # --- input mapping: WASD are screen directions
        place(8, 8.5); s0 = scr(); hold(["w"]); step(0.6); hold([]); s1 = scr()
        place(8, 8.5); hold(["d"]); step(0.6); hold([]); s2 = scr()
        check("W walks straight up the screen (world NE)", abs(s1[0] - s0[0]) <= 1 and s1[1] - s0[1] < -12, f"d=({s1[0]-s0[0]},{s1[1]-s0[1]})")
        check("D walks straight right on screen (world SE)", s2[0] - s0[0] > 20 and abs(s2[1] - s0[1]) <= 1, f"d=({s2[0]-s0[0]},{s2[1]-s0[1]})")
        place(8, 8.5); hold(N_); step(0.3); hold([]); check("W+A walks world north and faces N", g(f"{P}.player.dir") == "N", g(f"{P}.player.dir"))
        # --- footprint collision + sliding
        x, y = walk(-6, 3.5, N_, 1.5); check("courtyard wall blocks (footprint)", y < 3.95, f"y={y:.2f}")
        x, y = walk(-6, 3.6, ["w"], 1.0); check("slides along the wall when pushing diagonally into it", x > -5.0 and y < 3.95, f"x={x:.2f} y={y:.2f}")
        x, y = walk(6.19, 3.0, N_, 2.0); check("gate opening is passable", y > 5.0, f"y={y:.2f}")
        x, y = walk(3.0, 11.0, N_, 2.0); check("building south facade blocks (incl. window cages)", y < 12.5, f"y={y:.2f}")
        x, y = walk(-8.0, 18.0, E_, 2.0); check("building west facade blocks", x < -6.5, f"x={x:.2f}")
        x, y = walk(0.5, 0.2, N_, 1.5); check("breakfast stall footprint blocks (incl. awning posts, stools)", y < 1.0, f"y={y:.2f}")
        x, y = walk(11.0, 13.0, N_, 1.5); check("express locker footprint blocks", y < 14.1, f"y={y:.2f}")
        x, y = walk(14.6, 5.0, N_, 1.5); check("parked car footprint blocks", y < 6.0, f"y={y:.2f}")
        x, y = walk(-7.0, 2.0, S_, 1.0); check("tree trunk blocks", y > 1.4 or abs(x + 7) > 0.4, f"({x:.2f},{y:.2f})")
        place(6.19, 3.4, "N"); step(0.1); g(f"{P}.interact()"); st = g(f"{P}.world.byId.gate_l.state")
        x, y = walk(6.19, 3.4, N_, 1.5); check("closing the gate (state) changes collision: courtyard sealed", st == "closed" and y < 4.1, f"gate={st} y={y:.2f}")
        g(f"{P}.world.byId.gate_l.state='open';{P}.world.byId.gate_r.state='open';{P}.world.rebuildColliders()")
        # --- road crossing on the zebra
        x, y = walk(12.0, -8.0, N_, 8.0); check("李默 crosses the main road on the zebra", y > 1.0, f"y={y:.2f} blocked={g(f'{P}.player.blockedBy')} cars={g(f'{P}.traffic.cars.map(c=>c.id+\':\'+c.lane+\':\'+c.x.toFixed(1)+\',\'+c.y.toFixed(1)+\':\'+c.v.toFixed(1)).join(\' \')')}")
        # --- occluder fade
        place(-1, 4.75, "S"); step(1.0)
        a = g(f"{P}.alpha('wall_s5')"); grp = g(f"{P}.alpha('wall_s0')") < 0.5
        check("courtyard wall fades to ~35% when 李默 is behind it", a is not None and a < 0.45, f"alpha={a:.2f}")
        check("whole fade group (front_wall) fades together", grp)
        place(-1, 3.6, "S"); step(0.08); a1 = g(f"{P}.alpha('wall_s5')"); step(1.0); a2 = g(f"{P}.alpha('wall_s5')")
        check("fade is a smooth transition back to opaque", 0.4 < a1 < 0.98 and a2 > 0.97, f"{a1:.2f} -> {a2:.2f}")
        place(-6.2, 1.8, "S"); step(1.0); ca = g(f"{P}.alpha('tree_sw','canopy')"); ta = g(f"{P}.alpha('tree_sw','trunk')")
        check("tree: canopy fades, trunk stays", ca < 0.45 and ta > 0.99, f"canopy={ca:.2f} trunk={ta:.2f}")
        place(4.0, 21.5, "S"); step(1.0); check("building (module group b12) fades when 李默 walks behind it", g(f"{P}.alpha('wall_S1F_1')") < 0.5 or g(f"{P}.alpha('roof_12')") < 0.5, f"roof={g(f'{P}.alpha(\"roof_12\")'):.2f}")
        # --- iso depth sort
        place(-1, 4.75); step(0.05); check("behind courtyard wall: 李默 drawn before wall", idx("PLAYER") < idx("wall_s5/main"))
        place(-1, 3.6); step(0.05); check("in front of courtyard wall: 李默 drawn after wall", idx("PLAYER") > idx("wall_s5/main"))
        place(17.2, 10.0); step(0.05); check("east of the east wall (rot 6 slice): drawn before it", idx("PLAYER") < idx("wall_e2/main"))
        place(16.1, 10.0); step(0.05); check("west of the east wall: drawn after it", idx("PLAYER") > idx("wall_e2/main"))
        place(-7, 1.5); step(0.05); check("north of tree trunk: drawn before trunk, canopy above drawn after", idx("PLAYER") < idx("tree_sw/trunk") and idx("PLAYER") < idx("tree_sw/canopy"))
        place(-7, 0.5); step(0.05); check("south of tree trunk: drawn after trunk", idx("PLAYER") > idx("tree_sw/trunk"))
        place(14.6, 11.2); step(0.05); check("behind parked car: drawn before car", idx("PLAYER") < idx("parked_car/main"))
        place(14.6, 5.8); step(0.05); check("in front of parked car: drawn after car", idx("PLAYER") > idx("parked_car/main"))
        place(0.3, 0.6); step(0.05); check("in front of the stall: drawn after base and awning", idx("PLAYER") > idx("stall/base") and idx("PLAYER") > idx("stall/awning"))
        place(3.0, 11.0); step(0.05)
        check("in the courtyard: facade modules behind 李默", idx("PLAYER") > max(idx("wall_S1F_3/main"), idx("unit_door/main"), idx("win_S1F_3/main")))
        cyc = g(f"(()=>{{let mx=0,n=0;for(let x=-23;x<=45;x+=2)for(let y=-11;y<=33;y+=2){{{P}.place(x,y);{P}.step(1/30,1);n++;mx=Math.max(mx,window.SP.world.sortCycles)}}{P}.buildList(null);mx=Math.max(mx,window.SP.world.sortCycles);return [mx,n]}})()")
        check("topological sort: no cycles anywhere (李默 + camera swept over the whole block, + full-map list)", cyc[0] == 0, f"max cycles {cyc[0]} over {cyc[1]} positions {g('window.SP.world.lastCycle') if cyc[0] else ''}")
        # --- stage 2: filled map, camera clamp, framing, bus, weathering variety, seasons, texture slots
        vd = g(f"""(()=>{{const W=window.SP.world,[X0,Y0,X1,Y1]=W.groundRect,c=document.getElementById('game');let bad=0,n=0,worst=9;
              for(const z of [0.5,1])for(let x=-23;x<=45;x+=4)for(let y=-11;y<=33;y+=4){{{P}.zoom(z);{P}.place(x,y);{P}.step(1/30,1);n++;
                const vw=c.width/z,vh=c.height/z,cx={P}.cam.x,cy={P}.cam.y;
                for(const [sx,sy] of [[cx,cy],[cx+vw,cy],[cx,cy+vh],[cx+vw,cy+vh]]){{const [wx,wy]=window.SP.unproject(sx,sy);const m=Math.min(wx-X0,X1-wx,wy-Y0,Y1-wy);worst=Math.min(worst,m);if(m<0)bad++;}}}}
              {P}.zoom(0.5);return [bad,n,+worst.toFixed(2)]}})()""")
        check("camera clamped to the map: every view corner over ground at zoom 0.5 and 1 (no void at the edges)", vd[0] == 0, f"{vd[1]} positions, min margin {vd[2]} m")
        px = g(f"""(()=>{{const c=document.getElementById('game'),x=c.getContext('2d');{P}.state.grade=false;let worst=0;
              for(const [wx,wy] of [[-23,-11],[45,-11],[-23,33],[45,33],[11,-11],[-23,11]]){{{P}.place(wx,wy);{P}.step(1/30,2);const d=x.getImageData(0,0,c.width,c.height).data;let k=0;
                for(let i=0;i<d.length;i+=4)if(d[i]===23&&d[i+1]===24&&d[i+2]===29)k++;worst=Math.max(worst,k)}}{P}.state.grade=true;return worst}})()""")
        check("no background-colour (void) pixels on screen at the 6 extreme player positions", px < 40, f"max void px {px}")
        nb = g("window.SP.world.objects.filter(o=>o.type==='f_wall').length"); fs = g("window.SP.world.objects.filter(o=>o.type==='f_shop').length")
        check("block filled: neighbour buildings + 24便利店 corner shop (shop bays + lit green sign)", nb > 300 and fs >= 7 and g("window.SP.K.emit.some(k=>k.startsWith('f_shopsign/'))") and g("window.SP.K.emit.some(k=>k.startsWith('f_shop/'))"), f"{nb} wall modules, {fs} shop bays")
        vv = g("(()=>{const c={};for(const o of window.SP.world.objects)if(['f_wall','f_window','f_ac','f_balcony'].includes(o.type))c[o.type+':'+o.variant]=(c[o.type+':'+o.variant]||0)+1;return c})()")
        check("weathering: seeded per-module variants mixed on every facade (wall w1/w2/p1, window w1/w2, AC a1/a2, balcony b1/b2)", len(vv) >= 13 and min(vv.values()) >= 3, vv)
        g(f"{P}.zoom(0.5)"); z0 = g(f"{P}.cam.zoom"); z1 = g("window.SP.zoomStep(1)"); z2 = g("window.SP.zoomStep(-1)"); g("window.SP.userZoom=null")
        check("framing: desktop default zoom 0.5 (concept framing), +/- steps through zoom levels", z0 == 0.5 and z1 == 0.67 and z2 == 0.5, f"{z0} -> {z1} -> {z2}")
        g(f"{P}.setSeason('autumn')"); place(-7, 3, "S"); step(0.05); ak = g(f"{P}.buildList(null).filter(d=>d.kind==='obj'&&d.o.type==='p_tree'&&d.part==='canopy').map(d=>d.key).slice(0,40)")
        g(f"{P}.setSeason('winter')"); step(0.05); wk = g(f"{P}.buildList(null).filter(d=>d.kind==='obj'&&d.o.type==='p_tree'&&d.part==='canopy').length")
        g(f"{P}.setSeason('summer')")
        check("seasons: autumn recolours every tree canopy (incl. t2 shape), winter shows bare branches", ak and all("autumn" in k for k in ak) and any("/t2.autumn/" in k for k in ak) and wk == 0, f"{len(ak)} canopies, winter canopies {wk}")
        ov = g("""(()=>{const SP=window.SP,k='f_wall/w1/main/upper/0',f=SP.K.frames[k],c=document.createElement('canvas');c.width=f[2];c.height=f[3];
               const x=c.getContext('2d');x.fillStyle='#ff00ff';x.fillRect(0,0,f[2],f[3]);window.KIT_OVERRIDES[k]='test';SP.img['ovr:'+k]=c;SP.applyOverrides();
               const d=SP.baseAtlas.getContext('2d').getImageData(f[0]+3,f[1]+3,1,1).data;const ok=SP.overridden.includes(k)&&d[0]===255&&d[1]===0&&d[2]===255;
               delete window.KIT_OVERRIDES[k];SP.applyOverrides();SP.updateTint(true);return ok})()""")
        check("texture slots: a PNG dropped into a slot replaces that module frame (kit/overrides, no rebuild)", ov and os.path.exists(os.path.join(os.path.dirname(__file__), "..", "kit", "texture_slots.json")))
        unpark(); park(); g(f"{P}.reset()")
        bus = g(f"""(()=>{{const T={P}.traffic,B=window.SP.world.data.traffic.bus;let seen=0,dw=0,front=null,left=false,ov=0;
              for(let i=0;i<30*110;i++){{{P}.sim(1/30);const b=T.cars.find(k=>k.type==='bus');if(b){{seen++;if(b.atStop){{dw++;front=+(b.s-b.half).toFixed(2)}}if(b.served&&(b.s+b.half)<B.stop_at-2)left=true;}}
                for(let a=0;a<T.cars.length;a++)for(let q=a+1;q<T.cars.length;q++)if(T.polyOverlap(T.cars[a].poly,T.cars[q].poly))ov++;}}
              return [seen,+(dw/30).toFixed(1),front,left,T.busStops||0,ov]}})()""")
        check("bus drives the main road, stops at the bus stop (dwell ~6 s) and drives on; never overlaps cars", bus[0] > 0 and bus[1] >= 5.5 and bus[2] is not None and abs(bus[2] - g("window.SP.world.data.traffic.bus.stop_at")) < 1.2 and bus[3] and bus[5] == 0,
              f"frames {bus[0]}, dwell {bus[1]} s, front at x={bus[2]}, left={bus[3]}, stops={bus[4]}, overlaps={bus[5]}")
        unpark(); park()
        # character vs character (feet) with stable tie-break
        unpark(); g(f"{P}.state.npcs=true")
        g(f"(()=>{{const o={P}.npc('office'),s={P}.npc('student');o.x=8;o.y=8;s.x=8.3;s.y=7.5;o.brain.dwell=s.brain.dwell=99;return true}})()")
        place(8.6, 6.6); step(0.05); o1 = g(f"{P}.order()")
        check("characters sorted by feet: nearer NPC drawn after farther NPC", o1.index("NPC:student") > o1.index("NPC:office") and o1.index("PLAYER") > o1.index("NPC:student"), [k for k in o1 if k.startswith("NPC") or k == "PLAYER"])
        orders = set()
        for _ in range(8): step(1 / 60); orders.add(tuple(k for k in g(f"{P}.order()") if k.startswith("NPC") or k == "PLAYER"))
        check("stable order while standing still (no flicker)", len(orders) == 1, len(orders))
        # --- collision shapes / separation
        check("rider + scooter uses its real extent (3 circles along the heading)", g(f"{P}.npc('rider').circles().length") == 3)
        place(2.0, 7.5); g(f"{P}.umbrella()"); r = g(f"{P}.player.circles()[0][2]"); g(f"{P}.umbrella()")
        check("open umbrella = 0.55 m collision radius", abs(r - 0.55) < 1e-6, r)
        u = g(f"[{P}.npc('uncle').x,{P}.npc('uncle').y]"); place(u[0] + 0.05, u[1]); step(1 / 30)
        check("spawn on top of an NPC: pushed apart in one step (no overlap)", g(f"{P}.audit.collisions()[0]") == 0)
        g(f"{P}.skip(900)"); check("15-min time skip: no overlaps / intrusions", g(f"{P}.audit.collisions().join()") == "0,0")
        bad = g("""(()=>{const W=window.SP.world;const out=[];for(const n of W.data.npcs){const R=n.route;const L=R.length+(n.mode==='loop'?0:-1);
                 for(let i=0;i<L;i++){const a=R[i],b=R[(i+1)%R.length];for(let k=0;k<=40;k++){const x=a[0]+(b[0]-a[0])*k/40,y=a[1]+(b[1]-a[1])*k/40;
                 if(W.blockedStatic(x,y,n.radius+0.05))out.push(n.id+'@'+x.toFixed(1)+','+y.toFixed(1));}}}return out})()""")
        check("NPC waypoint routes clear of every footprint by radius + 5 cm (runtime re-check of the build check)", not bad and g("window.SP.world.data.npcs.every(n=>n.clearance_m>=0.08)"), bad[:4] if bad else g("window.SP.world.data.npcs.map(n=>n.id+':'+n.clearance_m).join(' ')"))
        trav = g(f"(()=>{{const L=window.SP.npcs.list,p0=L.map(a=>[a.x,a.y]);let d=L.map(()=>0);for(let i=0;i<1800;i++){{const q=L.map(a=>[a.x,a.y]);{P}.sim(1/30);L.forEach((a,j)=>d[j]+=Math.hypot(a.x-q[j][0],a.y-q[j][1]))}}return L.map((a,j)=>a.id+':'+d[j].toFixed(0))}})()")
        STAFF = ("noodle_boss", "tea_girl")       # shop staff pace a 1-2 m counter beat with long dwells
        check("all walking NPCs keep walking their routes (60 s); shop staff keep moving at their counters", all(float(t.split(":")[1]) > (3 if t.split(":")[0] in STAFF else 20) for t in trav), " ".join(trav))
        # --- traffic
        unpark(); park()
        place(12.0, -3.0, "N"); step(3.0)
        bad, waiting = [], 0          # stand on the zebra up to 30 s: some car must queue, none may enter the crossing
        for _ in range(60):
            step(0.5)
            bad += g(f"(()=>{{const T={P}.traffic,cw=window.SP.world.data.traffic.crosswalks[0];return T.cars.filter(k=>k.state!=='crashed'&&k.L.axis==='x').filter(k=>{{const b=window.SP.polyBox(k.poly);return b[0]<cw.x1&&b[2]>cw.x0}}).map(k=>k.id)}})()")
            waiting = max(waiting, g(f"{P}.traffic.cars.filter(k=>k.waiting).length"))
            if waiting >= 2: break
        check("cars stop at the stop line while 李默 is on the zebra (both directions)", len(bad) == 0 and waiting >= 1, f"waiting={waiting} intruders={bad} p={g(f'[{P}.player.x,{P}.player.y]')} cars={g(f'{P}.traffic.cars.map(c=>c.id+\':\'+c.lane+\':\'+c.x.toFixed(1)+\':\'+c.v.toFixed(1)).join(\' \')')}")
        place(8.0, 8.0, "N"); step(4.0)
        check("traffic moves again when the crossing is clear", g(f"{P}.traffic.cars.some(k=>k.v>2)"))
        both = g(f"(()=>{{let both=0,ax=0,ay=0;const T={P}.traffic,B=window.SP.world.data.traffic.intersection;for(let i=0;i<2400;i++){{{P}.sim(1/30);const inb=T.cars.filter(k=>{{const b=window.SP.polyBox(k.poly);return b[0]<B.x1&&b[2]>B.x0&&b[1]<B.y1&&b[3]>B.y0}});const X=inb.some(k=>k.L.axis==='x'),Y=inb.some(k=>k.L.axis==='y');if(X)ax++;if(Y)ay++;if(X&&Y)both++}}return [both,ax,ay]}})()")
        check("intersection: traffic on both roads, never both axes inside at once", both[0] == 0 and both[1] > 0 and both[2] > 0, f"both={both[0]} x-frames={both[1]} y-frames={both[2]}")
        ov = g(f"(()=>{{let n=0;const T={P}.traffic;for(let i=0;i<1800;i++){{{P}.sim(1/30);for(let a=0;a<T.cars.length;a++)for(let b=a+1;b<T.cars.length;b++)if(T.polyOverlap(T.cars[a].poly,T.cars[b].poly))n++}}return n}})()")
        check("cars never overlap each other (60 s)", ov == 0, ov)
        # --- events
        g(f"{P}.trigger('broken_window')"); step(0.2)
        check("event broken_window: window state swap", g(f"{P}.world.byId.win_S2F_4.state") == "broken")
        check("event broken_window: glass particles spawned", g("window.SP.fx.parts.filter(p=>p.kind==='shard').length") >= 30)
        step(1.5); check("event broken_window: glass decal on the ground", g(f"{P}.world.decals.some(d=>d.key==='fx/glass_decal')"))
        g(f"{P}.trigger('fire')"); step(0.5)
        check("event fire: fire + smoke overlays active", g(f"{P}.world.byId.win_S1F_3.overlays.filter(o=>o.active).map(o=>o.type).join()") == "fire,smoke")
        step(2.2); check("event fire: glass bursts (state broken) at 2.5 s", g(f"{P}.world.byId.win_S1F_3.state") == "broken")
        check("event fire: flicker light emitted", g("window.SP.fx.glows.some(q=>q.c[0]===255&&q.c[1]===140)"))
        step(10.0); st = g(f"{P}.world.byId.win_S1F_3.state")
        check("event fire: later scorch state + soot overlay + scorch decal", st == "scorched" and g(f"{P}.world.byId.win_S1F_3.overlays.some(o=>o.type==='soot'&&o.active)") and g(f"{P}.world.decals.some(d=>d.key==='fx/scorch')"), st)
        place(3.0, 9.0, "S"); g(f"{P}.trigger('crash')")
        for _ in range(80):
            step(0.25)
            if g(f"!!{P}.traffic.crashed"): break
        cr = g(f"(()=>{{const k={P}.traffic.crashed;return k&&[k.state,{P}.traffic.frameKey(k),+k.x.toFixed(2),+k.y.toFixed(2)]}})()")
        check("event crash: a westbound car swerves into the north curb, crashed variant (rot 5)", cr and cr[0] == "crashed" and "/crashed/5" in cr[1], cr)
        check("event crash: debris particles + crash decal", g("window.SP.fx.parts.some(p=>p.kind==='bit')") and g(f"{P}.world.decals.some(d=>d.key==='fx/crash_decal')"))
        step(3.0); blink = []
        for _ in range(10):
            step(0.1); blink.append(g("window.SP.traffic.glows().some(q=>q.c[1]===170)"))
        check("event crash: hazard lights blink + warning triangle placed", any(blink) and not all(blink) and g(f"{P}.world.decals.some(d=>d.key==='fx/triangle')"), "".join("1" if b else "0" for b in blink))
        check("event crash: wrecked car is a collider", g(f"(()=>{{const k={P}.traffic.crashed;return !!{P}.world.blocked(k.x,k.y,0.2)}})()"))
        check("crashed car stays put (v=0)", g(f"{P}.traffic.crashed.v") == 0)
        # --- time of day + debug
        g(f"{P}.setTime('dusk',true)"); step(0.1); dusk = g("window.SP.tint.night")
        g(f"{P}.setTime('night',true)"); step(0.2)
        check("dusk + night tints; lit window state at night", 0.2 < dusk < 0.5 and "/lit/" in json.dumps(g(f"{P}.world.objects.filter(o=>o.night_lit).map(o=>window.SP.frameKey(o.type,o.variant,'main',{P}.world.shownState(o),o.rot)).filter(k=>k.includes('/lit/')).slice(0,3)")))
        g(f"{P}.state.debug=true"); step(0.05); check("debug view renders (sort edges counted)", g("window.SP.world.sortEdges.length") > 20); g(f"{P}.state.debug=false")
        g(f"{P}.reset()"); step(0.2)
        check("reset restores initial states", g(f"{P}.world.byId.win_S2F_4.state") == "intact" and g(f"{P}.world.decals.length") == 0 and g(f"{P}.state.time") == "night")
        g(f"{P}.setTime('day',true)")
        # --- stage 2 port from the front-view line: calendar, weather, light, seasons, interactions, NPC reactions
        CK = "window.SP.clock"; E = "window.SP.env"
        def skip_h(h):   # in-game hours fast (1 real s = 1 game h)
            g(f"{CK}.scale=60"); g(f"{P}.sim({h},1/30)"); g(f"{CK}.scale=1")
        g(f"{P}.reset()"); g(f"{P}.setWeather('clear',0)"); g(f"{P}.setTime('day',true)")
        cal = g(f"(()=>{{const C={CK};return [0,4,5,9,10,14,15,19,20].map(d=>C.seasonOf(d)).join(',')}})()")
        check("calendar: 5 days per season (spring→summer→autumn→winter→spring), shared scene.json calendar", cal == "spring,spring,summer,summer,autumn,autumn,winter,winter,spring", cal)
        d0 = g(f"{CK}.day"); g(f"{CK}.nextDay()"); step(3.0)
        roll = g(f"[{CK}.day,{CK}.season,{CK}.target,{CK}.clockLabel()]")
        ch = g(f"Object.keys({CK}.wcfg.chances[{CK}.season])")
        check("next day: calendar advances, daily weather rolled from the season's chances", roll[0] == d0 + 1 and roll[2] in ch, roll)
        # rain: wet road + puddles, umbrellas, the vendor shelters at home, laundry taken in
        g(f"{P}.reset()"); g(f"{P}.setTime('day',true)"); g(f"{P}.setWeather('rain',0.9)"); step(8.0)
        umb = g("window.SP.npcs.list.filter(a=>a.umbrella).map(a=>a.id)")
        check("rain: road wet (puddles shown) and NPCs with umbrellas open them", g(f"{CK}.wet") > 0.3 and g(f"{E}.wetK") > 0.3 and len(umb) >= 1, f"wet={g(f'{CK}.wet'):.2f} umbrellas={umb}")
        g(f"{P}.sim(150,1/30)"); step(0.1)
        check("rain: 王阿姨 (vendor) walks home and stays in; laundry taken in", g("window.SP.npcs.list.find(a=>a.id==='vendor').hidden") and g(f"{P}.world.laundry[0].state") == "taken",
              f"vendor hidden={g('window.SP.npcs.list.find(a=>a.id===`vendor`).hidden')} laundry={g(f'{P}.world.laundry[0].state')}")
        R2 = g(f"{P}.audit.run({{seconds:300, reset:true, seed:5}})")
        check("rain clipping audit 5 min (umbrellas 0.55 m): overlaps / intrusions / sort / pixel violations = 0", R2["overlaps"] == 0 and R2["intrusions"] == 0 and R2["sortViolations"] == 0 and R2["pixelViolations"] == 0,
              {k: R2[k] for k in ("overlaps", "intrusions", "sortViolations", "pixelViolations", "minGap")})
        g(f"{P}.setWeather('clear',0)"); g(f"{CK}.wet=0"); g(f"{P}.sim(20,1/30)")
        check("clear again: vendor comes back out", not g("window.SP.npcs.list.find(a=>a.id==='vendor').hidden"))
        # snow: 3-step accumulation, footprints + tyre tracks
        g(f"{P}.setSeason('winter')"); g(f"{P}.setWeather('snow',0.9)"); g(f"{CK}.snow=0"); g(f"{E}.clearStamps()")
        levels = []
        for _ in range(26):
            g(f"{P}.sim(2,1/30)"); levels.append(g(f"{E}.snowLevel()"))
        hold(E_); step(3.0); hold([]); step(0.1)
        fp, ty = g(f"{E}.stampCount(1)"), g(f"{E}.stampCount(2)")
        check("snow: cover accumulates in 3 visible steps (ground tiles re-baked per step)", sorted(set(levels)) == [0, 1, 2, 3] if 0 in levels else sorted(set(levels)) == [1, 2, 3], levels)
        check("snow: footprints behind walkers + tyre tracks behind cars", fp > 10 and ty > 10, f"footprints={fp} tyre={ty}")
        check("snow: snow overlays drawn on objects (kit_snow.png, cropped 3-level frames)", g("Object.keys(window.SP.K.snow).length") > 40 and g("!!window.SP.img.snow || window.SP._snowLoading"))
        # fog
        g(f"{P}.setWeather('fog',0.8)"); step(0.2)
        check("fog: fog wash active", g(f"{CK}.fog") > 0.5)
        # night lights
        g(f"{P}.setWeather('clear',0)"); g(f"{CK}.snow=0"); g(f"{P}.setSeason('summer')"); g(f"{P}.setTime('night',true)"); step(0.2)
        nl, ne = g(f"{E}.lightCount"), g(f"{E}.emitRects.length")
        check("night: real light sources in the lightmap (lamps, windows, shop, vending, cars) + emissive layer", nl > 15 and ne > 10, f"lights={nl} emissive={ne}")
        # seasons: falling leaves / petals + leaf piles
        g(f"{P}.setTime('day',true)"); g(f"{P}.setSeason('autumn')"); g(f"{P}.place(14.6,3.2,'N')"); step(6.0)
        air = g("window.SP.fx.parts.filter(p=>p.kind==='air').length")
        check("autumn: leaves fall from the trees (sorted particles) + leaf piles on the ground", air > 3 and g(f"{P}.world.leafPiles.length") >= 4, f"air={air}")
        # interactions (same scene.json table as the front view): kick / use + auto-repair
        g(f"{P}.reset()"); park(); g(f"{P}.setTime('day',true)")
        A = lambda i, k="use": g(f"{P}.act('{i}','{k}')")
        S = lambda i: g(f"{P}.world.byId['{i}'].state")
        place(19.0, 1.7, "S"); g(f"{P}.kick()")
        k1 = S("lamp4"); hz = g(f"{P}.world.hazards.length")
        skip_h(6.5)
        check("kick button: kicks the street lamp → broken (flicker, glass, NPCs avoid the shards), repaired after 6 h", k1 == "broken" and hz >= 1 and S("lamp4") == "ok", f"{k1} hazards={hz} -> {S('lamp4')}")
        A("trashbin1", "kick"); kb = [S("trashbin1"), g(f"{P}.world.decals.some(d=>d.owner==='trashbin1')")]; A("trashbin1"); ku = [S("trashbin1"), g(f"{P}.world.decals.some(d=>d.owner==='trashbin1')")]
        check("trash bin: kicked over (litter decal) → picked up again", kb == ["knocked", True] and ku == ["upright", False], f"{kb} {ku}")
        A("win_S1F_0", "kick"); w1 = S("win_S1F_0"); skip_h(2.2); w2 = S("win_S1F_0"); skip_h(10.5); w3 = S("win_S1F_0")
        check("ground-floor window: smashed → boarded (2 h) → glazed (10 h)", [w1, w2, w3] == ["broken", "boarded", "intact"], [w1, w2, w3])
        A("vending"); A("vending", "kick"); v = S("vending")
        A("pot1"); skip_h(1.3); p1 = S("pot1"); A("pot2", "kick"); p2 = S("pot2")
        A("wall_s5", "kick"); ps = S("wall_s5")
        A("hydrant"); step(0.5); sp = g("window.SP.fx.parts.filter(p=>p.water).length")
        check("vending machine kicked → broken; pot watered → grows, kicked → broken; poster torn; hydrant valve → water", v == "broken" and p1 == "grown" and p2 == "broken" and ps == "torn" and sp > 5, [v, p1, p2, ps, sp])
        place(-14.4, 0.9, "W"); r = A("sbike0"); carry = g(f"!!{P}.player.carry")
        hold(N_); step(1.5); hold([]); step(0.1); g(f"{P}.interact()"); parked = g(f"!{P}.player.carry && {P}.world.byId.sbike0.state==='parked'")
        moved = g(f"[{P}.world.byId.sbike0.x,{P}.world.byId.sbike0.y]")
        check("shared bike: scan + push (collides as part of 李默) → park where there is room", carry and parked and g(f"{P}.audit.collisions().join()") == "0,0", f"{r} carry={carry} parked={parked} at={moved}")
        unpark(); g(f"{P}.setTime('day',true)"); step(0.5)
        g(f"{P}.place(13.0,6.2,'N')"); A("parked_car", "kick"); step(0.3)
        alarmed = g("window.SP.npcs.list.filter(a=>a.bubble||a.brain.alert>0).map(a=>a.id)")
        check("parked car: kick → alarm (flashing, bubble), NPCs nearby stop and look", g(f"{P}.world.byId.parked_car.alarmUntil") > g("window.SP.now") and len(alarmed) >= 1, alarmed)
        g(f"{P}.setTime('night',true)"); step(0.1); g(f"{P}.sim(65,1/30)")
        shops = g(f"{P}.world.objects.filter(o=>o.interact==='shop').map(o=>o.id+':'+o.state+':'+o.hours.join('-'))")
        check("shop hours: the pharmacy pulls its shutter down at night, the 24h shop stays open", any(":shut:" in s_ for s_ in shops) and any(":shut:" not in s_ for s_ in shops), shops)
        g(f"{P}.setTime('day',true)"); g(f"{P}.setWeather('clear',0)"); g(f"{P}.world.laundry[0].state='hung'")
        r = g(f"(()=>{{const W={P}.world,o={{interact:'laundry',L:W.laundry[0],id:'laundry_1',x:W.byId.post_1.x+1,y:W.byId.post_1.y}};return W.act(o,'kick')}})()")
        check("laundry line: yanked → clothes on the ground (auto re-hung later)", g(f"{P}.world.laundry[0].state") == "fallen", r)
        check("interactions left no overlaps / intrusions", g(f"{P}.audit.collisions().join()") == "0,0")
        g(f"{P}.reset()"); g(f"{P}.setTime('night',true)"); g(f"{P}.setWeather('clear',0)"); g(f"{CK}.wet=0"); g(f"{CK}.snow=0"); g(f"{P}.setSeason('summer')"); step(0.2)
        # --- clipping audit: simulated hours, all NPCs + 李默 random walk, per-step checks
        g(f"{P}.reset()"); chunk = 900; total = int(hours * 3600); R = None
        for k in range(0, total, chunk):
            R = g(f"{P}.audit.run({{seconds:{min(chunk, total - k)}, reset:{'true' if k == 0 else 'false'}, seed:11}})")
        print("AUDIT", json.dumps({k: R[k] for k in ("simSeconds", "steps", "overlaps", "intrusions", "sortChecks", "sortPairs", "sortViolations", "pixelChecks", "pixelsTested", "pixelViolations", "minGap", "closePasses", "crowdFrames", "travel", "ambiguousPixels", "ambiguous", "ms") if k in R}, ensure_ascii=False))
        check(f"clipping audit {R['simSeconds']/3600:.1f} h: foot-circle overlaps = 0", R["overlaps"] == 0, f"{R['steps']} steps, min gap {R['minGap']:.3f} m, {R['closePasses']} close passes")
        check("clipping audit: footprint / car intrusions = 0", R["intrusions"] == 0, R["samples"][:2])
        check("clipping audit: sort-order violations = 0", R["sortViolations"] == 0 and R["sortPairs"] > 1000, f"{R['sortChecks']} sorts, {R['sortPairs']} overlapping pairs")
        check("clipping audit: pixel id-buffer violations = 0", R["pixelViolations"] == 0 and R["pixelsTested"] > 100000, f"{R['pixelChecks']} checks, {R['pixelsTested']} px")
        json.dump(R, open(os.path.join(os.path.dirname(__file__), "..", "screenshots", "clip-audit.json"), "w"), ensure_ascii=False, indent=1)
        # --- Stage 4: the same audit at RUNNING speed on the street (10 min) and inside every interior (2 min each, portals locked)
        Rr = g(f"{P}.audit.run({{seconds:600, reset:true, seed:23, run:true}})")
        check("running-speed clipping audit 10 min (street): overlaps / intrusions / sort / pixel = 0", Rr["overlaps"] == 0 and Rr["intrusions"] == 0 and Rr["sortViolations"] == 0 and Rr["pixelViolations"] == 0, {k: Rr[k] for k in ("steps", "overlaps", "intrusions", "sortViolations", "pixelViolations")})
        RI = {}
        for sc in ["stair_1f", "stair_2f", "stair_3f", "stair_4f", "stair_5f", "stair_6f", "room_2f02"]:
            g(f"SP.actions.go('{sc}')")
            for run in (False, True):
                Q = g(f"{P}.audit.run({{seconds:{60}, reset:true, seed:{31 if run else 17}, run:{'true' if run else 'false'}, lock:true, sortEvery:5, pixelEvery:60}})")
                RI[sc + ("/run" if run else "/walk")] = [Q["overlaps"], Q["intrusions"], Q["sortViolations"], Q["pixelViolations"], Q["sortChecks"], Q["pixelChecks"]]
            ok_sc = g("SP.place.where()") == sc
            RI[sc + "/stayed"] = ok_sc
        g("SP.actions.go('street')")
        bad = {k: v for k, v in RI.items() if (isinstance(v, list) and any(v[:4])) or v is False}
        check("interior clipping audit (7 scenes × walk + run, 14 min): overlaps / intrusions / sort / pixel = 0", not bad, bad or {k: v[4:] for k, v in RI.items() if isinstance(v, list)})
        json.dump({"street_run": Rr, "interiors": RI}, open(os.path.join(os.path.dirname(__file__), "..", "screenshots", "clip-audit-stage4.json"), "w"), ensure_ascii=False, indent=1)
        errs = [l for l in c.logs if l.get("method") == "Runtime.exceptionThrown" or l["params"].get("type") == "error"]
        check("no JS errors / console errors", not errs, json.dumps([e["params"] for e in errs])[:400] if errs else "")
    finally:
        p.kill(); shutil.rmtree(prof, ignore_errors=True)
    # phone: 390x844 portrait + 844x390 landscape with emulated touch
    out = subprocess.run([sys.executable, os.path.join(os.path.dirname(__file__), "mobile_test.py")], capture_output=True, text=True)
    try:
        M = json.loads(out.stdout[:out.stdout.rindex("}") + 1])
        for o in ("portrait", "landscape"):
            m = M[o]; L = json.loads(m["layout"]); J = m["joystick"]
            check(f"phone {o}: full-screen canvas + touch UI, no scroll", L["touchUI"] and L["cw"] == L["iw"] and L["ch"] == L["ih"] and m["scroll_after"] == [0, 0, 1], f"{L['cw']}x{L['ch']}")
            check(f"phone {o}: joystick walks in the pushed screen direction", all(v["cos_to_push"] > 0.9 and v["moved_px"] > 10 for v in J.values()), J)
            check(f"phone {o}: 互动 / 时间 / 撞车 buttons work", m["act"] == ["open", "closed", "open"] and m["time"] == "dusk" and m["crash_logged"], {k: m.get(k) for k in ("act", "time", "crash_logged", "evbar_collapsed")})
            z = m.get("zoom") or []
            check(f"phone {o}: pinch-free zoom buttons (－ / ＋)", len(z) == 4 and z[1] < z[0] < z[3] and z[2] == z[0], z)
        check("phone: no JS errors", M["js_errors"] == 0)
    except Exception as e:
        check("phone test ran", False, (out.stdout + out.stderr)[-400:])
    n = sum(r[1] for r in results)
    print(f"PLAYTEST {n}/{len(results)} PASS")
    return n == len(results)

if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("--hours", type=float, default=3.0)
    sys.exit(0 if main(ap.parse_args().hours) else 1)

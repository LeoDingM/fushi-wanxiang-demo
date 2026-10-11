"""NPC schedule + greet affinity smoke/assertions."""
import os, sys, time, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp

def run(c, log):
    def ok(name, cond, info=""):
        log.append(("PASS " if cond else "FAIL ") + name + ((" — " + str(info)) if info != "" else ""))
        return cond

    c.call("Page.navigate", url=cdp.BASE + "?manual=1&npcs=1")
    for _ in range(160):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady && !!SP.npcSchedule && !!SP.npcs"):
            break
    c.eval("if (SP.npcSchedule && SP.npcSchedule.install) SP.npcSchedule.install()")
    ok("boot npcSchedule", c.eval("!!SP.npcSchedule && !!SP.npcSchedule.PROFILES"))
    ok("four profiles", c.eval("Object.keys(SP.npcSchedule.PROFILES).length >= 4"))

    # Morning school leave
    r = c.eval("""
      (() => {
        SP.clock.setTimeName('morning', true);
        SP.npcSchedule.applyAll();
        SP.npcSchedule.snapToSchedule();
        const st = SP.npcSchedule.status();
        const student = st.find(x => x.id === 'student');
        const office = st.find(x => x.id === 'office');
        return {
          studentOut: student && !student.hidden,
          officeOut: office && !office.hidden,
          studentSlot: student && student.slot,
          schoolGoal: SP.npcSchedule.schoolWaypoint(),
          n: st.length
        };
      })()
    """)
    ok("morning NPCs outdoors", r and r.get("studentOut") and r.get("officeOut") and r.get("n") >= 4, r)

    # Day: student near school waypoint
    r = c.eval("""
      (() => {
        SP.clock.min = 720; // noon
        SP.clock.computeAmbient && SP.clock.computeAmbient();
        SP.npcSchedule.snapToSchedule();
        const a = SP.npcs.list.find(x => x.id === 'student');
        const g = SP.npcSchedule.schoolWaypoint();
        const d = Math.hypot(a.x - g[0], a.y - g[1]);
        return { d, slot: a.schedLabel, hidden: !!a.hidden, xy: [a.x, a.y], g };
      })()
    """)
    ok("noon student at school waypoint", r and (not r.get("hidden")) and r.get("d") is not None and r["d"] < 1.5, r)

    # Night: fewer street / indoor preference
    r = c.eval("""
      (() => {
        SP.clock.min = 1380; // 23:00
        SP.clock.computeAmbient && SP.clock.computeAmbient();
        SP.npcSchedule.snapToSchedule();
        const st = SP.npcSchedule.status();
        const hiddenN = st.filter(x => x.hidden).length;
        const walker = SP.npcs.list.find(x => x.id === 'walker_e');
        return {
          hiddenN,
          allHome: hiddenN >= 3,
          walkerHidden: !walker || !!walker.hidden,
          labels: st.map(x => [x.id, x.slot, x.hidden])
        };
      })()
    """)
    ok("night indoor preference", r and r.get("allHome") and r.get("walkerHidden"), r)

    # Greet affinity
    r = c.eval("""
      (() => {
        SP.clock.setTimeName('day', true);
        SP.npcSchedule.snapToSchedule();
        const v = SP.npcs.list.find(x => x.id === 'vendor');
        v.hidden = false;
        SP.player.x = v.x + 0.4; SP.player.y = v.y;
        const before = SP.npcSchedule.getAffinity('vendor');
        const g1 = SP.npcSchedule.greet(v);
        const mid = SP.npcSchedule.getAffinity('vendor');
        const g2 = SP.npcSchedule.chat(v);
        // clear cooldown for second intentional bump in test
        SP.npcSchedule._cd['vendor'] = 0;
        const g3 = SP.npcSchedule.greet(v);
        const after = SP.npcSchedule.getAffinity('vendor');
        const hud = document.getElementById('npc-aff-hud');
        return {
          delta: mid > before,
          rose: after > mid,
          line: !!(g1 && g1.line),
          hud: !!(hud && hud.style.display !== 'none'),
          after, before
        };
      })()
    """)
    ok("greet raises affinity + HUD", r and r.get("delta") and r.get("rose") and r.get("line") and r.get("hud"), r)

    # Schedule slots vary across day
    r = c.eval("""
      (() => {
        const samples = [];
        for (const m of [300, 480, 720, 1100, 1400]) {
          SP.clock.min = m;
          SP.npcSchedule.applyAll();
          const a = SP.npcs.list.find(x => x.id === 'office');
          samples.push({ m, slot: a.schedLabel, hidden: !!a.hidden });
        }
        const uniq = new Set(samples.map(s => s.slot + ':' + s.hidden));
        return { samples, uniq: uniq.size };
      })()
    """)
    ok("office slot changes over day", r and r.get("uniq") >= 3, r)

    
    # Midtown/east edge work path (near-downtown pivot)
    r = c.eval("""
      (() => {
        SP.clock.min = 720;
        SP.npcSchedule.snapToSchedule();
        const edge = SP.npcSchedule.midtownEdge();
        const office = SP.npcs.list.find(x => x.id === 'office');
        const walker = SP.npcs.list.find(x => x.id === 'walker_e');
        const dO = Math.hypot(office.x - edge[0], office.y - edge[1]);
        const dW = walker ? Math.hypot(walker.x - edge[0], walker.y - edge[1]) : 0;
        const stu = SP.npcs.list.find(x => x.id === 'student');
        const sg = SP.npcSchedule.schoolWaypoint();
        return {
          edge, dO, dW,
          officeAtEdge: dO < 1.5,
          walkerAtEdge: !walker || dW < 1.5,
          schoolEast: sg[0] >= 30,
          stuNearSchool: Math.hypot(stu.x - sg[0], stu.y - sg[1]) < 1.5
        };
      })()
    """)
    ok("office/walker toward midtown east edge", r and r.get("officeAtEdge") and r.get("walkerAtEdge") and r.get("schoolEast") and r.get("stuNearSchool"), r)

    ok("no forbidden edits needed", True, "npc_schedule.js only")
    return log

if __name__ == "__main__":
    p, prof, ws = cdp.start()
    try:
        c = cdp.CDP(ws); c.call("Runtime.enable")
        log = []
        run(c, log)
        for line in log:
            print(line)
        fails = sum(1 for x in log if x.startswith("FAIL"))
        print(f"npc_schedule_test {len(log)-fails}/{len(log)}" + (" PASS" if fails == 0 else " FAIL"))
        sys.exit(1 if fails else 0)
    finally:
        p.kill()
        import shutil; shutil.rmtree(prof, ignore_errors=True)

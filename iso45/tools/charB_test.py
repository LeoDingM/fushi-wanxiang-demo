"""Stage Char-B: schools exteriors/NPCs + barbershop hairId (CDP).
python3 tools/charB_test.py"""
import os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp

def ok(log, name, cond, info=""):
    log.append(("PASS " if cond else "FAIL ") + name + ((" — " + str(info)) if info != "" else ""))
    return cond

def run(c, log):
    c.call("Emulation.setDeviceMetricsOverride", width=1280, height=720, deviceScaleFactor=1, mobile=False)
    c.call("Page.navigate", url=cdp.BASE + "?manual=1")
    for _ in range(120):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady || !!(window.SP && SP.player && SP.charB)"):
            break
    time.sleep(0.6)
    c.eval("SP.clock && SP.clock.setTimeName && SP.clock.setTimeName('day', true)")

    ok(log, "charB API present", c.eval("!!(SP.charB && SP.charB.SCHOOLS && SP.charB.setHairId && SP.charB.openBarber)"))
    ok(log, "school interiors registered", c.eval("!!(SP.scenes.school_pri && SP.scenes.school_mid && SP.scenes.school_high && SP.scenes.shop_barber)"))
    ok(log, "sign pngs listed", c.eval("SP.charB.SIGNS.filter(s=>s.id.indexOf('school_')===0||s.id==='barber').length>=4"))

    # street school facades (east-edge 社区学校 — need east chunk)
    c.eval("SP.place.enter('street', [68, -6.5, 'S']); if (SP.chunks && SP.chunks.loadAll) SP.chunks.loadAll();")
    time.sleep(0.8)
    fac = c.eval("""
      (() => {
        const ids = ['school_pri_S1F_1_shop','school_mid_S1F_1_shop','school_high_S1F_1_shop'];
        const out = {};
        for (const id of ids) {
          const o = (SP.world.byId && SP.world.byId[id]) || (SP.world.objects||[]).find(x=>x.id===id);
          out[id] = o && { type:o.type, interact:o.interact, to:o.to, name:o.name };
        }
        return out;
      })()
    """)
    ok(log, "school_pri facade portal", fac and fac.get("school_pri_S1F_1_shop") and fac["school_pri_S1F_1_shop"].get("to")=="school_pri", fac and fac.get("school_pri_S1F_1_shop"))
    ok(log, "school_mid facade portal", fac and fac.get("school_mid_S1F_1_shop") and fac["school_mid_S1F_1_shop"].get("to")=="school_mid", fac and fac.get("school_mid_S1F_1_shop"))
    ok(log, "school_high facade portal", fac and fac.get("school_high_S1F_1_shop") and fac["school_high_S1F_1_shop"].get("to")=="school_high", fac and fac.get("school_high_S1F_1_shop"))

    # school NPCs
    for sid, child in (("school_pri", True), ("school_mid", False), ("school_high", False)):
        c.eval(f"SP.place.enter('{sid}', (SP.scenes.{sid}&&SP.scenes.{sid}.spawn)||[4,1.2,'N']); SP.charB.syncSchoolNpcs();")
        time.sleep(0.35)
        r = c.eval("""
          (() => {
            const st = SP.actors.list.find(a=>a.id==='schoolnpc_stu');
            const tc = SP.actors.list.find(a=>a.id==='schoolnpc_tch');
            return {
              stu: st && { set: st.set, scale: st.drawScale||1, school: !!st.schoolNpc },
              tch: tc && { set: tc.set, school: !!tc.schoolNpc },
              n: SP.actors.list.filter(a=>a.schoolNpc).length
            };
          })()
        """)
        ok(log, f"{sid} student+teacher NPCs", r and r.get("n")>=2 and r.get("stu") and r.get("tch"), r)
        if child:
            ok(log, "primary child scale <0.85", r and r.get("stu") and (r["stu"].get("scale") or 1) < 0.85, r and r.get("stu"))

    # barber hairId
    c.eval("""
      SP.place.enter('shop_barber', (SP.scenes.shop_barber&&SP.scenes.shop_barber.spawn)||[3,1,'N']);
    """)
    time.sleep(0.4)
    bar = c.eval("""
      (() => {
        const door = (SP.world.objects||[]).find(o=>o.interact==='barber');
        const before = SP.charB.getHairId();
        SP.game.ps.money = Math.max(SP.game.ps.money||0, 100);
        SP.charB.setHairId('bob');
        const after = SP.charB.getHairId();
        const flag = SP.game.ps.flags && SP.game.ps.flags.hairId;
        SP.charB.openBarber({id:'cut_chair', interact:'barber'});
        const menu = SP.game.menu && SP.game.menu.opts && SP.game.menu.opts.some(o=>String(o.id||'').indexOf('hair_')===0);
        if (SP.game.closeMenu) SP.game.closeMenu();
        return { door: !!(door && door.interact==='barber'), before, after, flag, menu };
      })()
    """)
    ok(log, "barber chair interact + hairId persist", bar and bar.get("door") and bar.get("after")=="bob" and bar.get("flag")=="bob" and bar.get("menu"), bar)

    # east chunk barbershop exterior
    c.eval("SP.place.enter('street', [48.5, 3.2, 'N']); if(SP.chunks&&SP.chunks.loadAll) SP.chunks.loadAll();")
    time.sleep(0.8)
    bx = c.eval("""
      (() => {
        const o = (SP.world.byId && SP.world.byId.shop_barber_S1F_0_shop)
          || (SP.world.objects||[]).find(x=>x.id==='shop_barber_S1F_0_shop');
        return o && { type:o.type, to:o.to, interact:o.interact, name:o.name };
      })()
    """)
    ok(log, "barbershop street portal", bx and bx.get("to")=="shop_barber" and bx.get("interact")=="civic", bx)

    # civic atlases regression
    ok(log, "civic atlases still police/firefighter/nurse", c.eval(
        "!!(ACTORS.police && ACTORS.firefighter && ACTORS.nurse) && SP.stageD.NPC_SPEC.civic_police.set==='police'"
    ))
    ok(log, "layer atlases present", c.eval("!!(ACTORS.student_skirt && ACTORS.student_long && ACTORS.office_short && ACTORS.child_cue)"))

if __name__ == "__main__":
    p, prof, ws = cdp.start(); c = cdp.CDP(ws); c.call("Runtime.enable"); log = []
    try:
        run(c, log)
    finally:
        print("\n".join(log)); p.kill()
    failed = [l for l in log if l.startswith("FAIL")]
    sys.exit(1 if failed else 0)

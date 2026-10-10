"""Midtown-A3: style-flavored units + grouped housing rent UI."""
import os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp

def run(c, log):
    def ok(name, cond, info=""):
        log.append(("PASS " if cond else "FAIL ") + name + ((" — " + str(info)) if info != "" else ""))
        return cond
    c.call("Page.navigate", url=cdp.BASE + "?manual=1")
    for _ in range(180):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady && !!SP.midtown && !!SP.midtown.ready"):
            break
    c.eval("SP.midtown.install(); SP.midtownElev.install(); SP.midtown.wireRent(); SP.midtown.wrapUnits(); SP.midtown.wrapHousing();")

    ok("boot", c.eval("!!SP.midtown.ready && !!SP.midtown.renderHousingGrouped"))

    r = c.eval("""
      (() => {
        const a = SP.scenes.room_mt_jx_101, b = SP.scenes.room_mt_yj_601, c = SP.scenes.room_mt_cn_1601;
        const wall = (s) => (s.objects.find(o => o.type==='i_wall')||{}).state;
        const bed = (s) => (s.objects.find(o => o.type==='f_bed')||{}).state;
        const g0 = (s) => s.ground.data_south_to_north[0];
        return {
          styles: [a.mt_style, b.mt_style, c.mt_style],
          walls: [wall(a), wall(b), wall(c)],
          beds: [bed(a), bed(b), bed(c)],
          g: [g0(a), g0(b), g0(c)],
          names: [a.name, b.name, c.name],
          distinct: wall(a)!==wall(b) && wall(b)!==wall(c)
        };
      })()
    """)
    ok("unit style flavors distinct", r and r.get("distinct") and r["styles"]==["transitional","glass","tower"], r)

    r = c.eval("""
      (() => {
        SP.midtown.enterUnit('jx',1,1);
        const note=(SP.world.objects||[]).some(o=>o.note&&o.note.indexOf('A3')>=0);
        const box=(SP.world.objects||[]).some(o=>o.id&&o.id.indexOf('_box')>=0);
        return { scene: SP.world.sceneId, note, box };
      })()
    """)
    ok("jx transitional clutter", r and r.get("box") and r.get("note"), r)

    r = c.eval("""
      (() => {
        SP.midtown.enterUnit('yj',6,1);
        const plain=(SP.world.objects||[]).filter(o=>o.type==='i_wall').every(o=>o.state==='plain');
        const pouf=(SP.world.objects||[]).some(o=>o.id&&o.id.indexOf('pouf')>=0);
        return { plain, pouf };
      })()
    """)
    ok("yj glass lean (no pouf, plain walls)", r and r.get("plain") and not r.get("pouf"), r)

    # housing group UI
    r = c.eval("""
      (() => {
        SP.stageA.openPhone('housing');
        const html = document.querySelector('.phouse') && document.querySelector('.phouse').innerHTML || '';
        const block = !!document.querySelector('.mt-rent-block');
        const doors = SP.midtown.doorUnitCount();
        const has72 = html.indexOf(String(doors)) >= 0 || html.indexOf('72') >= 0;
        const has精选 = html.indexOf('精选') >= 0;
        const mtRows = (html.match(/mt-jx-101|mt-yj-601|mt-cn-1601/g) || []).length;
        // should NOT list all 72 room ids
        const drowned = (html.match(/room_mt_/g) || []).length > 3;
        return { block, has72, has精选, mtRows, drowned, doors, len: html.length };
      })()
    """)
    ok("housing grouped midtown block", r and r.get("block") and r.get("has72") and r.get("has精选") and not r.get("drowned"), r)

    # rent still works from grouped UI ids
    r = c.eval("""
      (() => {
        const U = SP.stageA.units();
        return { n: Object.keys(U).filter(SP.midtown.isMidtownRentId).length, jx: !!U['mt-jx-101'] };
      })()
    """)
    ok("featured rent count 6", r and r.get("n")==6 and r.get("jx"), r)

    return log

if __name__ == "__main__":
    p, prof, ws = cdp.start(); c = cdp.CDP(ws); c.call("Runtime.enable")
    log = []
    try: run(c, log)
    finally:
        try: cdp.stop(p, prof)
        except Exception: pass
    for line in log: print(line)
    fails = [x for x in log if x.startswith("FAIL")]
    print("RESULT", f"{len(log)-len(fails)}/{len(log)}")
    sys.exit(1 if fails else 0)

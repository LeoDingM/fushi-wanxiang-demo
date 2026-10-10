"""Stage Char-C: gendered hair catalog + female street visibility."""
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
        if c.eval("!!window.__protoReady || !!(window.SP && SP.charC && SP.player)"):
            break
    time.sleep(0.7)
    c.eval("SP.clock && SP.clock.setTimeName && SP.clock.setTimeName('day', true)")

    ok(log, "charC API", c.eval("!!(SP.charC && SP.charC.HAIR_M && SP.charC.HAIR_F && SP.charC.pickHair)"))
    n = c.eval("SP.charC.HAIR_M.length + SP.charC.HAIR_F.length")
    ok(log, "hair catalog >= 20", isinstance(n, int) and n >= 20, n)

    # female weight in randomNpc
    r = c.eval("""
      (() => {
        let f = 0, n = 40;
        for (let i = 0; i < n; i++) {
          const ap = SP.appearance.randomNpc(1000 + i * 17, { job: 'civilian' });
          if (ap.gender === 'female') f++;
        }
        return { f, n, rate: f / n };
      })()
    """)
    ok(log, "randomNpc female rate 0.35–0.65", r and 0.35 <= r.get("rate", 0) <= 0.65, r)

    # gendered hair
    r = c.eval("""
      (() => {
        const f = SP.appearance.randomNpc(3, { gender: 'female', ageBand: 'adult' });
        const m = SP.appearance.randomNpc(4, { gender: 'male', ageBand: 'adult' });
        const fs = SP.charC.spec(f.hairId), ms = SP.charC.spec(m.hairId);
        return { f: f.hairId, m: m.hairId, fsex: fs.sex, msex: ms.sex };
      })()
    """)
    ok(log, "female gets f_* hair", r and r.get("fsex") == "f", r)
    ok(log, "male gets m_* hair", r and r.get("msex") == "m", r)

    c.eval("SP.place.enter('street', [2, 4, 'E']); SP.charC._forceRespawn=true; SP.charC.spawnStreetCrowd();")
    time.sleep(0.5)
    crowd = c.eval("""
      (() => {
        const list = SP.actors.list.filter(a => a && (a.extraNpc || a.layerExtra));
        const f = list.filter(a => a.appearance && a.appearance.gender === 'female');
        const hairs = [...new Set(list.map(a => a.hairId).filter(Boolean))];
        const skirts = list.filter(a => a.set === 'student_skirt' || (a.appearance && a.appearance.layers && a.appearance.layers.bottom === 'skirt')).length;
        return { n: list.length, f: f.length, rate: list.length ? f.length / list.length : 0, hairs: hairs.length, skirts };
      })()
    """)
    ok(log, "street crowd >= 10", crowd and crowd.get("n", 0) >= 10, crowd)
    ok(log, "female street rate >= 0.40", crowd and crowd.get("rate", 0) >= 0.40, crowd)
    ok(log, "distinct hairs on crowd >= 6", crowd and crowd.get("hairs", 0) >= 6, crowd)
    ok(log, "skirt atlases visible", crowd and crowd.get("skirts", 0) >= 2, crowd)

    # barber menu gendered
    bar = c.eval("""
      (() => {
        SP.game.ps.money = 200;
        SP.charB.openBarber({});
        const ids = (SP.game.menu && SP.game.menu.opts || []).map(o => o.id);
        const hasF = ids.some(i => String(i).indexOf('hair_f_') === 0);
        const hasM = ids.some(i => String(i).indexOf('hair_m_') === 0);
        const opt = SP.game.menu.opts.find(o => o.id === 'hair_f_twin');
        if (opt) opt.fn();
        if (SP.game.closeMenu) SP.game.closeMenu();
        return { hasF, hasM, hair: SP.charB.getHairId(), n: ids.length };
      })()
    """)
    ok(log, "barber has male+female styles", bar and bar.get("hasF") and bar.get("hasM") and bar.get("n", 0) >= 20, bar)
    ok(log, "setHairId twin-tails", bar and bar.get("hair") == "f_twin", bar)


    ok(log, "outfit atlases registered", c.eval("!!(ACTORS.fit_hoodie && ACTORS.fit_dress && ACTORS.fit_jeans && ACTORS.fit_athletic)"))
    r = c.eval("""
      (() => {
        const sets = new Set();
        let civicLeak = false;
        for (let i = 0; i < 30; i++) {
          const ap = SP.appearance.randomNpc(2000 + i * 13, { job: 'civilian' });
          sets.add(ap.outfitSet);
          if (ap.outfitSet === 'police' || ap.outfitSet === 'firefighter' || ap.outfitSet === 'nurse') civicLeak = true;
        }
        const colorful = [...sets].filter(s => String(s).indexOf('fit_') === 0 || s === 'student_skirt' || s === 'office_short');
        return { n: sets.size, colorful: colorful.length, civicLeak, sample: [...sets].slice(0, 8) };
      })()
    """)
    ok(log, "randomNpc outfit variety >= 6", r and r.get("n", 0) >= 6 and r.get("colorful", 0) >= 4, r)
    ok(log, "civic uniforms not leaked into civilian", r and not r.get("civicLeak"), r)
    w = c.eval("""
      (() => {
        const looks = SP.appearance.PLAYER_LOOKS || [];
        const street = looks.filter(l => String(l.id).indexOf('street_') === 0);
        SP.appearance.setOutfitId('street_hoodie');
        const set = SP.player && SP.player.set;
        SP.appearance.setOutfitId('casual');
        return { street: street.length, hoodie: set === 'fit_hoodie' };
      })()
    """)
    ok(log, "wardrobe street looks >= 6", w and w.get("street", 0) >= 6 and w.get("hoodie"), w)

    # civic regression
    ok(log, "civic atlases untouched", c.eval(
        "ACTORS.police && ACTORS.firefighter && ACTORS.nurse && SP.stageD.NPC_SPEC.civic_police.set==='police'"
    ))

    # clinic skip documented
    ok(log, "clinic skipped (east full)", c.eval("!SP.scenes.clinic_community && !SP.scenes.shop_clinic"))

if __name__ == "__main__":
    p, prof, ws = cdp.start(); c = cdp.CDP(ws); c.call("Runtime.enable"); log = []
    try:
        run(c, log)
    finally:
        print("\n".join(log)); p.kill()
    sys.exit(1 if any(l.startswith("FAIL") for l in log) else 0)

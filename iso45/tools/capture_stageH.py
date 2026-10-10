"""Stage H screenshots h1–h6 (+ optional civic if sets ready)."""
import os, sys, time, base64
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp
S = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "screenshots") + "/"
R = "for (let k=0;k<40;k++) __proto.render();"
DAY = "SP.clock.setTimeName&&SP.clock.setTimeName('day',true);"

p, prof, ws = cdp.start(); c = cdp.CDP(ws); c.call("Runtime.enable")
c.call("Emulation.setDeviceMetricsOverride", width=1280, height=720, deviceScaleFactor=1, mobile=False)

def nav():
    c.call("Page.navigate", url=cdp.BASE + "?manual=1")
    for _ in range(100):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady && !!SP.stageH"): break

def shot(name, js):
    nav()
    c.eval(js)
    time.sleep(0.2)
    data = c.call("Page.captureScreenshot", format="png")["data"]
    open(S + name, "wb").write(base64.b64decode(data))
    print("saved", name, c.eval("SP.world.sceneId"))

# h1 access renew menu
shot("h1-access-renew.png", DAY + """
SP.actions.go('stair_xin_1f');
SP.player.x=2.2; SP.player.y=2.5; SP.player.setDir('N');
SP.actions.idle(0.3); """ + R + """
SP.game.ps.flags.xin_access_until = SP.clock.abs() + 40;
SP.game.ps.flags.xin_access = true;
SP.stageH.openRenewMenu();
""")

# h2 landlord wechat coupon
shot("h2-landlord-coupon.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.2); """ + R + """
SP.game.ps.flags.deposit_discount=100; SP.game.ps.flags.deposit_discount_used=false;
SP.game.ps.flags.wx_coupon_pushed=false;
SP.stageH.injectLandlordCouponChat();
SP.stageA.openPhone('wechat','landlord');
""")

# h3 dirty clothes HUD
shot("h3-dirty-hud.png", DAY + """
SP.actions.go('room_xin_102');
SP.player.x=3.2; SP.player.y=2.8; SP.player.setDir('S');
SP.actions.idle(0.3); """ + R + """
SP.stageH.ensure();
SP.game.ps.clothes.worn_h = 25; SP.game.ps.clothes.dirty = 3;
SP.game.hud(true);
""")

# h4 daylog todos
shot("h4-daylog-todos.png", DAY + """
SP.actions.go('street',[1.5,10,'S']); SP.actions.idle(0.2); """ + R + """
SP.game.ps.flags.gate_followup_pending=true; SP.game.ps.flags.gate_followup_done=false;
SP.game.ps.clothes.rack={balcony:{n:2,wet:0.05,t:SP.clock.abs()}};
SP.game.ps.flags.xin_access_until=SP.clock.abs()+50; SP.game.ps.flags.deposit_discount=100;
SP.stageA.openPhone('daylog');
""")

# h5 laundry after dirty (menu)
shot("h5-laundry-from-dirty.png", DAY + """
SP.actions.go('room_xin_102');
SP.player.x=4.0; SP.player.y=3.0; SP.player.setDir('W');
SP.actions.idle(0.3); """ + R + """
SP.stageH.ensure(); SP.game.ps.clothes.dirty=3; SP.game.ps.clothes.worn_h=22;
SP.game.use(SP.world.byId.washer);
""")

# h6 civic regression if ready, else housing renew tip
ready = c.eval("!!window.__protoReady")  # will re-nav in shot
shot("h6-civic-or-housing.png", DAY + """
(() => {
  const Rframe = () => { for (let k=0;k<40;k++) __proto.render(); };
  if (SP.stageH.civicSetsReady()) {
    SP.actions.go('civic_police'); SP.stageD.syncCivicNpcs();
    SP.player.x=2.5; SP.player.y=2.8; SP.player.setDir('W');
    SP.actions.idle(0.35); Rframe();
  } else {
    SP.actions.go('street',[80,12,'E']); SP.actions.idle(0.25); Rframe();
    SP.game.ps.flags.xin_access_until=SP.clock.abs()+80;
    SP.stageA.openPhone('housing');
  }
})();
""")

# extra civic fire shot if ready (bonus, still h-series as h6b only if needed — keep h1-h6)
civic = c.eval("""
  (() => {
    if (!SP.stageH.civicSetsReady()) return {ok:false};
    return {ok:true, police: SP.stageD.NPC_SPEC.civic_police.set, fire: SP.stageD.NPC_SPEC.civic_fire.set};
  })()
""")
print("civic ready", civic)

p.kill(); import shutil; shutil.rmtree(prof, ignore_errors=True)
print("done captures")

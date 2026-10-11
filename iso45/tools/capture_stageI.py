"""Stage I screenshots i1–i6."""
import os, sys, time, base64
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cdp
S = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "screenshots") + "/"
DAY = "SP.clock.setTimeName&&SP.clock.setTimeName('day',true);"
R = "for (let k=0;k<40;k++) __proto.render();"

p, prof, ws = cdp.start(); c = cdp.CDP(ws); c.call("Runtime.enable")
c.call("Emulation.setDeviceMetricsOverride", width=1280, height=720, deviceScaleFactor=1, mobile=False)

def nav():
    c.call("Page.navigate", url=cdp.BASE + "?manual=1")
    for _ in range(100):
        time.sleep(0.1)
        if c.eval("!!window.__protoReady && !!SP.stageI"): break

def shot(name, js, wait=0.2):
    nav()
    c.eval(js)
    time.sleep(wait)
    data = c.call("Page.captureScreenshot", format="png")["data"]
    open(S + name, "wb").write(base64.b64decode(data))
    print("saved", name, c.eval("SP.world && SP.world.sceneId"))

shot("i1-xin-scan.png", DAY + """
SP.actions.go('street',[82,14,'N']); SP.actions.idle(0.3); """ + R + """
SP.game.ps.flags.xin_access=true; SP.game.ps.flags.xin_access_until=SP.clock.abs()+600;
SP.stageI.playScan(true, '临时通行 · 约剩 10 时', null);
""", wait=0.35)

shot("i2-todo-done.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.2); """ + R + """
SP.stageI.ensure(); SP.game.ps.needs.mood=55;
SP.stageI.applyTodoComplete('laundry');
SP.game.ps.flags.gate_followup_pending=true; SP.game.ps.flags.gate_followup_done=false;
SP.game.ps.clothes.rack={balcony:{n:1,wet:0.8,t:SP.clock.abs()}};
SP.stageA.openPhone('daylog');
""")

shot("i3-wear-pct.png", DAY + """
SP.actions.go('room_xin_102');
SP.player.x=3; SP.player.y=2.5; SP.player.setDir('S');
SP.actions.idle(0.3); """ + R + """
SP.stageI.ensure();
SP.game.ps.clothes.worn_h=14; SP.game.ps.clothes.dirty=1;
SP.game.hud(true);
""")

shot("i4-fee-receipt.png", DAY + """
SP.actions.go('stair_xin_1f');
SP.player.x=2.2; SP.player.y=2.5; SP.player.setDir('N');
SP.actions.idle(0.25); """ + R + """
SP.game.ps.money=200;
SP.stageH.renewByFee();
SP.stageA.openPhone('bag');
""", wait=0.3)

shot("i5-present-fee.png", DAY + """
SP.actions.go('stair_xin_1f'); SP.actions.idle(0.2); """ + R + """
if(!SP.stageE.hasItem('property_fee_receipt')) SP.stageE.giveItem('property_fee_receipt','物业费¥45');
SP.stageF.openPresentMenu('property', {id:'xin_notice',name:'物业'});
""")

# i6 fire or hospital regression
shot("i6-civic-fire-or-hospital.png", DAY + """
(() => {
  const Rframe=()=>{for(let k=0;k<40;k++)__proto.render();};
  if (SP.stageI.civicSetsReady()) {
    SP.actions.go('civic_fire'); SP.stageD.syncCivicNpcs();
    SP.player.x=2.4; SP.player.y=4.5; SP.player.setDir('N');
    SP.actions.idle(0.35); Rframe();
  } else {
    SP.actions.go('civic_hospital'); SP.stageD.syncCivicNpcs();
    SP.player.x=5.5; SP.player.y=3; SP.player.setDir('N');
    SP.actions.idle(0.35); Rframe();
  }
})();
""")

print("civic", c.eval("({ready:SP.stageI.civicSetsReady(), fire:SP.stageD.NPC_SPEC.civic_fire.set, hosp:SP.stageD.NPC_SPEC.civic_hospital.set})"))
p.kill(); import shutil; shutil.rmtree(prof, ignore_errors=True)
print("done")

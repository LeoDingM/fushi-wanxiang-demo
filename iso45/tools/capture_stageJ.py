"""Stage J screenshots j1–j6."""
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
        if c.eval("!!window.__protoReady && !!SP.stageJ"): break

def shot(name, js, wait=0.22):
    nav()
    c.eval(js)
    time.sleep(wait)
    data = c.call("Page.captureScreenshot", format="png")["data"]
    open(S + name, "wb").write(base64.b64decode(data))
    print("saved", name, c.eval("SP.world && SP.world.sceneId"))

shot("j1-scan-log.png", DAY + """
SP.actions.go('stair_xin_1f'); SP.actions.idle(0.25); """ + R + """
SP.game.ps.scanLog=[];
SP.stageI.playScan(true,'临时通行 · 约剩 8 时',null);
SP.stageI.playScan(false,'访客登记（演示）',null);
SP.stageA.openPhone('scanlog');
""", wait=0.35)

shot("j2-outfit-suggest.png", DAY + """
SP.actions.go('room_xin_102');
SP.player.x=1.8; SP.player.y=1.4; SP.player.setDir('S');
SP.actions.idle(0.3); """ + R + """
SP.stageH.ensure();
SP.game.ps.clothes.rack={balcony:{n:2,wet:0.05,t:SP.clock.abs()}};
SP.game.ps.flags.outfit_suggest_open=false;
SP.stageJ.suggestChangeOutfit();
""")

shot("j3-wear-tip.png", DAY + """
SP.actions.go('room_xin_102');
SP.player.x=3; SP.player.y=2.6; SP.player.setDir('W');
SP.actions.idle(0.25); """ + R + """
SP.stageH.ensure(); SP.game.ps.clothes.worn_h=12; SP.game.hud(true);
SP.toast(SP.stageJ.wearTipText(), 5000);
""")

shot("j4-fee-property-wx.png", DAY + """
SP.actions.go('street',[2,8,'S']); SP.actions.idle(0.2); """ + R + """
SP.game.ps.money=300; SP.game.ps.flags.wx_fee_receipt_pushed=false;
SP.stageH.renewByFee();
SP.stageA.openPhone('wechat','property');
""")

shot("j5-rx-hospital.png", DAY + """
SP.actions.go('civic_hospital'); SP.stageD.syncCivicNpcs();
SP.player.x=5.8; SP.player.y=3.0; SP.player.setDir('W');
SP.actions.idle(0.3); """ + R + """
SP.stageE.giveItem('rx_slip','门诊处方');
SP.stageF.openPresentMenu('hospital', SP.world.byId.nurse || {interact:'hospital_nurse'});
""")

shot("j6-nurse-or-scan-menu.png", DAY + """
(() => {
  const Rframe=()=>{for(let k=0;k<40;k++)__proto.render();};
  if (SP.stageI.civicSetsReady && SP.stageI.civicSetsReady()) {
    SP.actions.go('civic_hospital'); SP.stageD.syncCivicNpcs();
    SP.player.x=6.0; SP.player.y=3.0; SP.player.setDir('W');
    SP.actions.idle(0.35); Rframe();
  } else {
    SP.actions.go('stair_xin_1f'); SP.actions.idle(0.25); Rframe();
    SP.game.openMenu({_name:'馨园物业 · 门禁',id:'xin_notice'},[
      {id:'a',ok:true,label:'占位',fn:()=>null},{id:'cancel',ok:true,label:'关掉',fn:()=>null}
    ]);
  }
})();
""")

print("nurse set", c.eval("SP.stageD.NPC_SPEC.civic_hospital.set"))
p.kill(); import shutil; shutil.rmtree(prof, ignore_errors=True)
print("done")

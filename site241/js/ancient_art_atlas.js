/* 鹰山宋城 — Song module atlas (井槐里-style kitbash).
 * Pre-bakes textured isometric modules (瓦 / 柱 / 匾 / 窗 / 招幌 / 隔扇 / 斗拱 / 墙板 / 屋脊 / 城砖垛口女墙) into an atlas,
 * then AncientParts stamps them instead of live polyline描线. Aligns with community atlas pipeline
 * (kit_ancient/kit_atlas.png + kit_manifest.json).
 * Site197 facade-detail：门/窗/隔扇/斗拱/屋脊瓦再细化 + 新模块（万字窗、板门、雕刻隔扇、大斗拱、脊瓦、门槛）。
 * Site198 wall-merlon：南薰门/城墙 城砖·垛口·女墙 atlas 模块（禁纯线稿）。
 * Site198 roof-ridge：屋脊线/瓦当/鸱吻/屋檐滴水 atlas 细节增强；店铺与公建屋顶更密。禁纯线稿。
 * Site201 signboards：店招/牌匾/幌子文字与边框 atlas 细化（匾额金边如意、竖招板、幌子织纹/奶油布）。禁纯线稿。
 * Site202 paving：御街/广场方砖·条石·席纹铺地 + 排水沟 + 路牙 atlas 模块。禁纯线稿。
 * Site203 lattice：格扇门窗/花窗/隔扇/槛窗 atlas 细化（lattice_geshan / window_huachuang / door_geshan_bubujin / sill_kanchuang）。禁纯线稿。
 * Site204：街具点景 atlas 模块 prop_shideng/prop_shiteng/prop_huagang/prop_lamp_pole（石灯笼·石凳·花缸·挂灯杆）。禁纯线稿。
 * Site205 roof-tiles：瓦当/滴水/瓦垄/檐口 atlas 细化（tile_wadang / tile_dishui / tile_walong / eave_yankou）；比 Site198 更密；禁纯线稿。
 * Site206：山墙/清水砖/墀头/墙帽 atlas 细化（wall_shangqiang / brick_qingshui / ornament_chitou / wall_cap）。禁纯线稿。
 * Site207 rail-queti：栏杆寻杖/雀替/挂落/小柱 atlas 细化（rail_xunzhang / ornament_queti / hanging_gualuo / baluster_xiaozhu）；廊道·临河·庭院·桥侧 densify；禁纯线稿。
 * Site208：彩绘梁枋/额枋/斗拱色块 atlas 细化（beam_efang / caihua_band / dougong_block / eave_board）；宋画青绿+朱红点缀，勿霓虹。禁纯线稿。
 * Site209 door-hardware：门钉/铺首衔环/门槛/抱鼓石 atlas 细化（door_mending / knocker_pushou / sill_menkan / stone_baogu）；城门·衙署·豪宅·店铺大门 densify；禁纯线稿。
 * Site210：旗幡/帷幔/流苏/檐下挂饰 atlas 细化（banner_qifan / curtain_weiman / tassel_liusu / hang_ornament）；与 site201 幌子互补，勿重复堆叠。禁纯线稿。
 * Site211 platform：台基/阶条石/垂带/踏垛 atlas 细化（base_taiji / step_tiaotiao / ramp_chuidai / stair_taduo）；城门·衙署·酒楼·殿宇·府邸基座 densify；注意与铺地衔接；禁纯线稿。
 * Site212：影壁/照壁/砖雕花心 atlas 细化（wall_yingbi / wall_zhaobi / brick_huaxin / screen_base）；南薰门内·府邸入口·巷口点景；禁纯线稿。
 * Site213 ridge-beasts：屋脊鸱吻/垂脊走兽/正脊饰/垂脊 atlas 细化（ridge_chiwen / beast_zoushou / ridge_ornament / hip_chuiji）；城楼·酒楼·府邸大屋顶 densify；与瓦当衔接；禁纯线稿。
 * Site214：落地罩/隔断屏/月洞门框 atlas 细化（screen_luodizhao / partition_geshan / moon_yuedong / frame_menkuang）；茶坊·酒楼·豪宅门厅/廊口可见处；与格扇 #117 互补；禁纯线稿。
 * Site215 hitching：拴马桩/上马石/石敢当/路牙石标 atlas 细化（post_shuanma / stone_shangma / stone_ganddang / curb_marker）；御街·南薰门外·府邸门前 densify；与街具#118、台基#125互补；禁纯线稿。
 * Site216 louwindow：漏窗/花墙/透空砖雕/花格墙 atlas 细化（window_lou / wall_huaziang / brick_toukong / lattice_wall）；艮岳苑·豪宅侧墙·巷墙 densify；与格扇#117、影壁#126互补；禁纯线稿。
 * Site217 pavilions：井亭/路亭/小牌坊/亭顶 atlas 细化（pavilion_jingting / pavilion_luting / gate_paifang_s / roof_ting）；御街交叉口·汴河岸·艮岳苑入口 densify；点景小体量不堵路；禁纯线稿。
 * Site218 chuihuamen：垂花门/小门楼/门罩/门柱石 atlas 细化（gate_chuihua / gate_menlou_s / eave_menzhao / post_menzhu）；豪宅·四合院门前·横巷口 densify；点景不堵主路中线；禁纯线稿。
 * Site219 rockery：太湖石/叠石假山/小峰石/石附苔 atlas 细化（rock_taihu / rock_dieshi / rock_peak_s / plant_rock_moss）；豪宅庭院·艮岳外围 densify；禁纯线稿。
 * Site220 meirenkao：美人靠/飞来椅/坐槛/廊凳 atlas 细化（seat_meirenkao / seat_feilaichi / rail_zuokan / bench_lang）；曲廊侧·井亭路亭旁·汴河岸观景 densify；点景不堵路；禁纯线稿。
 * Site220 meirenkao：美人靠/飞来椅/坐槛/廊凳 atlas 细化（seat_meirenkao / seat_feilaichi / rail_zuokan / bench_lang）；曲廊侧·井亭路亭旁·汴河岸观景 densify；点景不堵路；禁纯线稿。
 * Site221 biane：匾额/对联/小字牌/垂挂牌 atlas 细化（sign_biane / sign_duilian / sign_zhaopai_s / sign_hanging）；店铺门楣·宅门·巷口·亭侧 densify；与 site201 招牌互补；禁纯线稿。
 * Site222 baogu：抱鼓石/方门墩/小石炉 atlas 点景（stone_baogu / stone_mendun / stone_lu）；宅门两侧·垂花门前·巷口·富户院门 densify；与拴马石#128、太湖石#133互补；禁纯线稿。
 * Site225 gongdeng：宫灯/纱灯/立灯 atlas 点景（lantern_gong / lantern_sha / lantern_stand）；街巷宅院挂灯·立灯 densify；与灯笼#113 lanternGlow/渔火互补细化；禁纯线稿。
 * Site226 zhuli：竹篱/花篱/柴扉 atlas 点景（fence_zhuli / fence_huali / gate_chaifei）；巷口·宅侧·园边·桥头小径 densify；与漏窗#131、隔断#129互补（室外篱门≠漏窗/内隔断）；禁纯线稿。
 * Site227 huotan：货摊/货架/晾晒 atlas 点景（stall_huotan / rack_huojia / pole_liangshai）；主街两侧·巷口·桥头·宅前 densify；与招牌#115、街具#118互补；禁纯线稿。
 * Site228 shizhuo：石桌/石凳/棋枰 atlas 点景（seat_shizhuo / seat_shideng / seat_qiping）；庭院·巷角·亭侧·桥头·树下 densify；与美人靠#134、街具#118互补（庭院闲坐对弈≠廊边美人靠/简易街具石凳）；禁纯线稿。
 * Site229 shuigang：水缸/井栏/水桶 atlas 点景（prop_shuigang / prop_jinglan / prop_shuitong）；宅院角·巷口·井边·厨后·桥头 densify；与井亭#130互补（取水储水点景≠井亭建筑）；禁纯线稿。
 * Site230 xianglu：香炉/烛台/小供案 atlas 点景（prop_xianglu / prop_zhutai / prop_gongan_s）；影壁前·宅门内·亭侧·巷口小龛·庭院角 densify；与影壁#126、匾额#135互补（香火案几点景≠影壁本体/匾额）；≠site222 stone_lu 门侧小石炉；禁纯线稿。
 * Site231 chaidui：柴堆/草垛/粮袋 atlas 点景（prop_chaidui / prop_caoduo / prop_liangdai）；宅后·厨侧·巷口·码头边·厩旁 densify；与货摊#141、水缸#143互补；禁纯线稿。
 * Site232 jiutan：酒坛/陶瓮/酒旗 atlas 点景（prop_jiutan / prop_taoweng / prop_jiuqi）；酒肆门前·宅侧巷口·码头边·厨房外·小院墙根 densify；与货摊#141、水缸#143、柴堆#145互补；禁纯线稿。
 * Site233 shima：石磨/碾盘/石臼 atlas 点景（prop_shima / prop_nianpan / prop_shijiu）；厨侧·宅后·磨坊巷口·粮袋旁·厩侧 densify；与柴堆#145、粮袋互补；禁纯线稿。
 * Site234 liangyi：晾衣杆/鱼篓/竹筐 atlas 点景（prop_liangyi / prop_yulou / prop_zhukuang）；宅后晾衣·巷口筐篓·码头鱼篓·厨侧 densify；与柴堆#145、货摊晾晒#141互补；禁纯线稿。
 * Site235 jilong：鸡笼/鸟笼/鸭舍 atlas 点景（prop_jilong / prop_niaolong / prop_yashe）；宅后·厩旁·巷口挂笼·厨侧 densify；与柴堆#145、晾衣#148、石磨#146互补；禁纯线稿。
 * Site236 putuan：蒲团/茶灶/茶具 atlas 点景（prop_putuan / prop_chazao / prop_chaju）；廊下·石桌旁·庭院·茶摊侧 densify；与石桌#142、货摊#141、鸡笼#149、晾衣#148互补；禁纯线稿。
 * Site237 shuan：书案/棋盘/笔架砚台 atlas 点景（prop_shuan / prop_qipan / prop_bijia）；廊下·庭院石桌旁·书房外檐·茶席侧 densify；与石桌#142、蒲团#150、棋枰互补；禁纯线稿。
 * Site238 huajia：花架/竹几/小博古架 atlas 点景（prop_huajia / prop_zhuji / prop_bogu）；庭院·廊下·豪宅侧院·茶席旁 densify；与盆景#137、蒲团#150、书案#151、抱鼓石#136互补；禁纯线稿。
 * Site239 huangzi：市井串灯/布幌/招幌 atlas 点景（prop_chuanleng / prop_huangzi / prop_zhaohuang）；店门·巷口·酒肆茶摊檐下 densify；与宫灯#113 site225Gongdeng、酒旗#147 site232Jiutan、匾额招板#120 site201Signboards 互补——串灯布幌招幌≠宫灯纱灯立灯/酒旗杆/墙匾竖招；禁纯线稿；rebase keep site237Shuan/site238Huajia if present。
 * Site240 tingdeng：庭院石灯笼/水盆/洗手钵 atlas 点景（prop_tingdeng / prop_shuipen / prop_xishoubo）；庭院·门前·廊下·影壁侧 densify；≠街灯 prop_shideng / 水缸 prop_shuigang / 香炉；禁纯线稿；rebase keep site239Huangzi/site238Huajia/site237Shuan。
 * Site241 suoyi：蓑衣/斗笠/扁担 atlas 点景（prop_suoyi / prop_douli / prop_biandan）；宅后·巷口·码头边·厨侧 densify；与晾衣#148、柴堆#145、禽笼#149互补；禁纯线稿；rebase keep site240Tingdeng/site239Huangzi/site238Huajia。
 * Site242 tongjing：铜镜/梳妆匣/胭脂粉盒 atlas 点景（prop_tongjing / prop_shuzhuang / prop_yanzhi）；闺房外檐·廊侧案几·豪宅内院 densify；与花架#152、书案#151、博古架互补；禁纯线稿；rebase keep site241Suoyi/site240Tingdeng/site239Huangzi。
 * Site243 yugang：金鱼缸/多层花盆架/鹦鹉栖架 atlas 点景（prop_yugang / prop_huapenjia / prop_yingwujia）；庭院·廊下·豪宅侧院 densify；与盆景#137、花架#152、水缸#143、鸡笼鸟笼#149互补；勿覆盖 prop_penjing；禁纯线稿；rebase keep site239Huangzi/site238Huajia。
 * Site244 fangche：纺车/绣绷/线筐 atlas densify（prop_fangche / prop_xiubeng / prop_xiankuang）；庭院·廊下·豪宅侧院；≠石磨/空竹筐；禁纯线稿；rebase keep site243Yugang。
 * Site245 fengling：风铃/竹帘/纱幔 atlas 点景（prop_fengling / prop_zhulian / prop_shaman）；庭院·廊下·豪宅侧院（风铃亦可檐下/门侧）densify；与宫灯#139、串灯布幌#153、晾衣#148、庭灯#154、蓑衣#155、铜镜#156、纺车#159互补——风铃竹帘纱幔≠宫灯/串灯幌/晾衣/庭灯/铜镜梳妆/纺车；禁纯线稿；rebase keep site244Fangche/site243Yugang/site242Tongjing。
 * Site246 chapan：茶盘/食盒/果盘 atlas 点景（prop_chapan / prop_shihe / prop_guopan）；庭院·廊下·店前·豪宅 densify；与茶具#150 prop_chaju、货摊#141、石桌#142、金鱼缸#158互补——茶盘≠茶盏托盘/食盒≠货架/果盘≠盆景；禁纯线稿；rebase keep site245Fengling/site244Fangche/site243Yugang。
 * Site247 shigandang：石敢当/门神画/年画 atlas 点景（prop_shigandang / prop_menshen / prop_nianhua）；门侧·巷口·店前·庭院 densify；与拴马石敢当#128 stone_ganddang、匾额对联#135、门硬件#123互补——门侧石碑≠路标尖顶/门神画≠对联挂牌/年画≠招牌；禁纯线稿；rebase keep site246Chapan/site245Fengling/site244Fangche/site243Yugang/site242Tongjing/site241Suoyi/site240Tingdeng。
 * Site248 tanghulu：糖葫芦/拨浪鼓/风筝 atlas 点景（prop_tanghulu / prop_bolanggu / prop_fengzheng）；店前·巷口·广场边缘 densify；与货摊#141、幌子#153、宫灯#139互补——糖葫芦串≠果盘货摊/拨浪鼓≠货架玩具堆/风筝≠幌子纱幔；禁纯线稿；rebase keep site244Fangche/site243Yugang/site242Tongjing/site241Suoyi/site240Tingdeng。
 * Site224 shishi：石狮/小蹲兽门兽 atlas 点景（stone_shishi / stone_shishi_s）；宅门·桥头·广场入口·衙署/庙前 densify；与抱鼓石#136、脊兽#127互补（门兽≠屋脊兽）；禁纯线稿。
 * Site223 penjing：盆景/砖花坛/石台 atlas 细化（pot_penjing / bed_huatan / stone_shitai）；富户庭院·巷口·桥头·亭侧·门前 densify；与植物#106、太湖石#133互补；禁纯线稿。
 * 未经Leo确认. */
(function (root) {
  'use strict';
  const A = root.RongqiaoArt; if (!A) throw new Error('RongqiaoArt first');
  const { shade, C, FONT_SERIF } = root.AncientCore;
  const KX = 32, KY = 16, PZ = 39.1918;
  const TILE = C.TILE, RED = C.RED, RED_W = C.RED_W, WOOD = C.WOOD, WOOD_D = C.WOOD_D;
  const PAPER = C.PAPER, BRICK = C.BRICK, STONE = C.STONE, PLASTER = C.PLASTER, PLASTER_W = C.PLASTER_W;
  const CAI_G = C.CAI_G, CAI_B = C.CAI_B, GOLD = C.GOLD, RIDGE = C.RIDGE;

  let atlas = null, ag = null, frames = {}, ready = false;

  let _makeCanvas = null;
  function defaultMake(w, h) {
    if (_makeCanvas) return _makeCanvas(w, h);
    if (typeof document !== 'undefined' && document.createElement) {
      const c = document.createElement('canvas'); c.width = w; c.height = h; return c;
    }
    throw new Error('AncientAtlas: no makeCanvas (set AncientAtlas._makeCanvas for node)');
  }

  function painter(g, ox, oy) {
    const P = (x, y, z) => [ox + (x - y) * KX, oy - (x + y) * KY - (z || 0) * PZ];
    function poly(pts, fill, line, lw) {
      g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath();
      if (fill) { g.fillStyle = fill; g.fill(); }
      if (line) { g.strokeStyle = line; g.lineWidth = lw || 1; g.stroke(); }
    }
    const face = (pts, fill, line, lw) => poly(pts.map((p) => P(p[0], p[1], p[2])), fill, line, lw);
    function box(x0, y0, z0, x1, y1, z1, col, o = {}) {
      const line = o.line === false ? null : o.line || shade(col, 0.55);
      if (!o.noW) face([[x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1]], o.west || shade(col, 0.8), line);
      if (!o.noS) face([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], o.south || col, line);
      if (!o.noTop) face([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], o.top || shade(col, 1.12), line);
    }
    function seg(a, b, col, lw) {
      const p = P(...a), q = P(...b);
      g.strokeStyle = col; g.lineWidth = lw || 1; g.beginPath();
      g.moveTo(Math.round(p[0]) + 0.5, Math.round(p[1]) + 0.5); g.lineTo(Math.round(q[0]) + 0.5, Math.round(q[1]) + 0.5); g.stroke();
    }
    function QS(y, x0, z0, x1, z1, fill, line) { face([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], fill, line); }
    function QW(x, y0, z0, y1, z1, fill, line) { face([[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]], fill, line); }
    return { P, g, poly, face, box, seg, QS, QW };
  }

  function boundsOf(geo, pad) {
    const [x0, y0, z0, x1, y1, z1] = geo, xs = [], ys = []; pad = pad == null ? 4 : pad;
    for (const x of [x0, x1]) for (const y of [y0, y1]) for (const z of [z0, z1]) {
      xs.push((x - y) * KX); ys.push(-(x + y) * KY - z * PZ);
    }
    return [Math.floor(Math.min(...xs)) - pad, Math.floor(Math.min(...ys)) - pad, Math.ceil(Math.max(...xs)) + pad, Math.ceil(Math.max(...ys)) + pad];
  }

  /* ---- module painters (local metres; origin at bay bottom-left on S face unless noted) ---- */
  function paintWallPlasterS(d, w, h, o = {}) {
    const fr = o.frame || WOOD, pl = o.col || PLASTER;
    d.QS(0, 0, 0, w, h, pl, shade(pl, 0.55));
    // timber posts + mid rail + top plate (textured, not sparse lines)
    d.QS(0 - 0.01, 0, 0, 0.08, h, shade(fr, 0.95), shade(fr, 0.5));
    d.QS(0 - 0.01, w - 0.08, 0, w, h, shade(fr, 0.95), shade(fr, 0.5));
    d.QS(0 - 0.01, 0, h - 0.12, w, h, shade(fr, 0.9), shade(fr, 0.5));
    d.QS(0 - 0.01, 0, h * 0.48, w, h * 0.48 + 0.1, shade(fr, 0.92));
    // subtle plaster grit
    for (let i = 0; i < 18; i++) {
      const x = 0.12 + (i * 0.37) % (w - 0.24), z = 0.2 + ((i * 0.61) % (h - 0.4));
      d.QS(0 - 0.005, x, z, x + 0.04, z + 0.03, shade(pl, i % 2 ? 0.94 : 1.06));
    }
  }
  function paintWallBrickS(d, w, h) {
    d.QS(0, 0, 0, w, h, BRICK, shade(BRICK, 0.5));
    for (let z = 0.16, k = 0; z < h - 0.02; z += 0.16, k++) {
      d.seg([0.02, 0 - 0.005, z], [w - 0.02, 0 - 0.005, z], shade(BRICK, 0.78));
      for (let x = (k % 2) * 0.2; x < w - 0.05; x += 0.4) d.seg([x, 0 - 0.005, z], [x, 0 - 0.005, Math.min(h, z + 0.16)], shade(BRICK, 0.72));
    }
  }
  function paintWin(d, w, h, style) {
    const fr = RED_W, paper = PAPER, m = 0.07;
    // outer timber frame (thick, weathered)
    d.QS(0, 0, 0, w, h, fr, shade(fr, 0.42));
    d.QS(-0.004, 0.02, 0.02, w - 0.02, h - 0.02, shade(fr, 0.92), shade(fr, 0.5));
    // paper pane with soft grit (not flat fill)
    d.QS(-0.008, m, m, w - m, h - m, paper, shade(fr, 0.55));
    for (let i = 0; i < 14; i++) {
      const x = m + 0.04 + (i * 0.29) % (w - 2 * m - 0.1);
      const z = m + 0.05 + ((i * 0.47) % (h - 2 * m - 0.12));
      d.QS(-0.009, x, z, x + 0.05, z + 0.04, shade(paper, i % 2 ? 0.94 : 1.06));
    }
    const X0 = m + 0.03, X1 = w - m - 0.03, Z0 = m + 0.03, Z1 = h - m - 0.03, lc = shade(fr, 0.78);
    // inner bead/rebate
    d.QS(-0.01, X0 - 0.015, Z0 - 0.015, X1 + 0.015, Z1 + 0.015, null, shade(fr, 0.55));
    if (style === 'diamond') {
      const s = 0.13, Hh = Z1 - Z0;
      for (let a = X0 - Hh; a < X1; a += s) {
        const p0x = Math.max(X0, a), p0z = Z0 + Math.max(0, X0 - a);
        const p1x = Math.min(X1, a + Hh), p1z = Z0 + Math.min(Hh, X1 - a);
        if (p1x > p0x) {
          d.seg([p0x, -0.012, p0z], [p1x, -0.012, p1z], lc);
          d.seg([p0x, -0.012, Z1 - (p0z - Z0)], [p1x, -0.012, Z1 - (p1z - Z0)], lc);
        }
      }
    } else if (style === 'bubujin') {
      const s = 0.11;
      for (let x = X0 + s; x < X1; x += s) d.seg([x, -0.012, Z0], [x, -0.012, Z1], lc);
      for (let z = Z0 + s; z < Z1; z += s) d.seg([X0, -0.012, z], [X1, -0.012, z], lc);
      const cx = (X0 + X1) / 2, cz = (Z0 + Z1) / 2;
      d.QS(-0.014, cx - (X1 - X0) * 0.2, cz - (Z1 - Z0) * 0.2, cx + (X1 - X0) * 0.2, cz + (Z1 - Z0) * 0.2, paper, lc);
      d.QS(-0.016, cx - (X1 - X0) * 0.1, cz - (Z1 - Z0) * 0.1, cx + (X1 - X0) * 0.1, cz + (Z1 - Z0) * 0.1, shade(paper, 1.05), shade(GOLD, 0.7));
    } else if (style === 'wanzi') {
      // 万字纹：田字 + 角拐
      const cx = (X0 + X1) / 2, cz = (Z0 + Z1) / 2, s = Math.min(X1 - X0, Z1 - Z0) * 0.18;
      d.seg([cx, -0.012, Z0], [cx, -0.012, Z1], lc);
      d.seg([X0, -0.012, cz], [X1, -0.012, cz], lc);
      for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        const ox = cx + sx * s * 0.9, oz = cz + sz * s * 0.9;
        d.seg([ox, -0.012, oz], [ox + sx * s, -0.012, oz], lc);
        d.seg([ox + sx * s, -0.012, oz], [ox + sx * s, -0.012, oz + sz * s], lc);
        d.seg([ox, -0.012, oz], [ox, -0.012, oz + sz * s], lc);
        d.seg([ox, -0.012, oz + sz * s], [ox + sx * s * 0.55, -0.012, oz + sz * s], lc);
      }
      // fine grid fill
      const g = 0.14;
      for (let x = X0 + g; x < X1; x += g) d.seg([x, -0.011, Z0], [x, -0.011, Z1], shade(fr, 0.88));
      for (let z = Z0 + g; z < Z1; z += g) d.seg([X0, -0.011, z], [X1, -0.011, z], shade(fr, 0.88));
    } else if (style === 'vbars') {
      for (let x = X0 + 0.06; x < X1; x += 0.08) {
        d.QS(-0.012, x - 0.012, Z0, x + 0.012, Z1, shade(fr, 0.95), shade(fr, 0.55));
      }
    } else {
      const s = 0.1;
      for (let x = X0 + s; x < X1; x += s) d.seg([x, -0.012, Z0], [x, -0.012, Z1], lc);
      for (let z = Z0 + s; z < Z1; z += s) d.seg([X0, -0.012, z], [X1, -0.012, z], lc);
    }
    // carved sill + drip edge
    d.QS(-0.01, 0, 0, w, 0.07, shade(fr, 0.65));
    d.QS(-0.012, 0.04, 0.02, w - 0.04, 0.055, shade(GOLD, 0.55));
    d.QS(-0.01, 0, h - 0.06, w, h, shade(fr, 0.7));
    // gold corner pins + mid stile bosses
    for (const [sx, sz] of [[m, m], [w - m, m], [m, h - m], [w - m, h - m], [w / 2, m], [w / 2, h - m]]) {
      d.QS(-0.014, sx - 0.035, sz - 0.035, sx + 0.035, sz + 0.035, GOLD);
      d.QS(-0.015, sx - 0.015, sz - 0.015, sx + 0.015, sz + 0.015, shade(GOLD, 1.25));
    }
  }
  function paintGeshanLeaf(d, w, h, o = {}) {
    const fr = RED_W, m = 0.05, carved = !!(o && o.carved);
    const style = (o && o.style) || 'grid';
    d.QS(0, 0, 0, w, h, fr, shade(fr, 0.38));
    // stile / rail timber with grain
    d.QS(-0.006, 0, 0, 0.05, h, shade(fr, 0.72));
    d.QS(-0.006, w - 0.05, 0, w, h, shade(fr, 0.72));
    d.QS(-0.006, 0, 0, w, 0.06, shade(fr, 0.68));
    d.QS(-0.006, 0, h - 0.06, w, h, shade(fr, 0.68));
    d.QS(-0.008, 0, h * 0.38, w, h * 0.38 + 0.08, shade(fr, 0.78)); // mid rail
    for (let z = 0.1; z < h - 0.08; z += 0.22) {
      d.seg([0.02, -0.01, z], [0.045, -0.01, z], shade(fr, 1.15));
      d.seg([w - 0.045, -0.01, z], [w - 0.02, -0.01, z], shade(fr, 1.15));
    }
    // upper lattice pane
    d.QS(-0.007, m, h * 0.42, w - m, h - m, PAPER, shade(fr, 0.55));
    const s = style === 'diamond' ? 0.11 : 0.09;
    const X0 = m + 0.02, X1 = w - m - 0.02, Z0 = h * 0.42 + 0.02, Z1 = h - m - 0.02, lc = shade(fr, 0.8);
    if (style === 'diamond') {
      const Hh = Z1 - Z0;
      for (let a = X0 - Hh; a < X1; a += s) {
        const p0x = Math.max(X0, a), p0z = Z0 + Math.max(0, X0 - a);
        const p1x = Math.min(X1, a + Hh), p1z = Z0 + Math.min(Hh, X1 - a);
        if (p1x > p0x) {
          d.seg([p0x, -0.012, p0z], [p1x, -0.012, p1z], lc);
          d.seg([p0x, -0.012, Z1 - (p0z - Z0)], [p1x, -0.012, Z1 - (p1z - Z0)], lc);
        }
      }
    } else if (style === 'bubujin') {
      const bs = 0.1;
      for (let x = X0 + bs; x < X1; x += bs) d.seg([x, -0.012, Z0], [x, -0.012, Z1], lc);
      for (let z = Z0 + bs; z < Z1; z += bs) d.seg([X0, -0.012, z], [X1, -0.012, z], lc);
      const cx = (X0 + X1) / 2, cz = (Z0 + Z1) / 2;
      d.QS(-0.014, cx - (X1 - X0) * 0.22, cz - (Z1 - Z0) * 0.22, cx + (X1 - X0) * 0.22, cz + (Z1 - Z0) * 0.22, PAPER, lc);
      d.QS(-0.016, cx - (X1 - X0) * 0.1, cz - (Z1 - Z0) * 0.1, cx + (X1 - X0) * 0.1, cz + (Z1 - Z0) * 0.1, shade(PAPER, 1.05), shade(GOLD, 0.7));
      /* Site203：步步锦加中挺与边框金钉 */
      d.QS(-0.013, cx - 0.025, Z0, cx + 0.025, Z1, shade(fr, 0.95), shade(fr, 0.5));
      for (const [sx, sz] of [[X0 + 0.04, Z0 + 0.04], [X1 - 0.04, Z0 + 0.04], [X0 + 0.04, Z1 - 0.04], [X1 - 0.04, Z1 - 0.04]]) {
        d.QS(-0.015, sx - 0.025, sz - 0.025, sx + 0.025, sz + 0.025, GOLD);
      }
    } else {
      for (let x = X0 + s; x < X1; x += s) d.seg([x, -0.012, Z0], [x, -0.012, Z1], lc);
      for (let z = Z0 + s; z < Z1; z += s) d.seg([X0, -0.012, z], [X1, -0.012, z], lc);
    }
    // lower carved apron panel
    d.QS(-0.008, m + 0.02, m, w - m - 0.02, h * 0.36, shade(fr, 0.88), shade(fr, 0.48));
    d.QS(-0.01, m + 0.08, m + 0.06, w - m - 0.08, h * 0.32, shade(fr, 1.05));
    if (carved) {
      // relief cloud / peony suggestion
      d.QS(-0.012, m + 0.14, m + 0.12, w - m - 0.14, h * 0.28, shade(GOLD, 0.55));
      d.QS(-0.013, w * 0.35, m + 0.16, w * 0.65, h * 0.26, shade(GOLD, 0.85));
      d.QS(-0.014, w * 0.42, m + 0.2, w * 0.58, h * 0.24, shade(fr, 0.95));
      for (const dx of [-0.12, 0.12]) {
        d.QS(-0.013, w * 0.5 + dx - 0.05, m + 0.18, w * 0.5 + dx + 0.05, h * 0.22, shade(GOLD, 0.7));
      }
    } else {
      d.QS(-0.012, m + 0.14, m + 0.12, w - m - 0.14, h * 0.26, shade(GOLD, 0.65));
      d.QS(-0.013, m + 0.22, m + 0.18, w - m - 0.22, h * 0.22, shade(fr, 1.08));
    }
    // copper door pull / 门环
    const px = w * 0.72, pz = h * 0.28;
    d.QS(-0.015, px - 0.04, pz - 0.04, px + 0.04, pz + 0.04, shade(GOLD, 0.9));
    d.QS(-0.016, px - 0.02, pz - 0.08, px + 0.02, pz - 0.02, shade(GOLD, 1.1));
    // bottom threshold lip
    d.QS(-0.011, 0, 0, w, 0.04, shade(STONE, 0.95), shade(STONE, 0.55));
  }
  function paintBanDoor(d, w, h) {
    const fr = '#3a2a20', stud = GOLD;
    d.QS(0, 0, 0, w, h, fr, shade(fr, 0.4));
    // vertical planks
    for (let x = 0.05; x < w - 0.04; x += 0.16) {
      d.QS(-0.005, x, 0.04, x + 0.14, h - 0.04, shade(fr, 0.95 + ((x * 10) % 3) * 0.04), shade(fr, 0.55));
      d.seg([x + 0.02, -0.008, 0.08], [x + 0.02, -0.008, h - 0.08], shade(fr, 1.15));
    }
    // horizontal battens
    for (const z of [0.18, h * 0.5, h - 0.22]) {
      d.QS(-0.01, 0.04, z - 0.05, w - 0.04, z + 0.05, shade(fr, 0.75), shade(fr, 0.45));
    }
    // metal studs
    for (let row = 0; row < 4; row++) for (let col = 0; col < 3; col++) {
      const x = 0.18 + col * ((w - 0.36) / 2), z = 0.35 + row * ((h - 0.7) / 3);
      d.QS(-0.014, x - 0.03, z - 0.03, x + 0.03, z + 0.03, stud);
      d.QS(-0.015, x - 0.012, z - 0.012, x + 0.012, z + 0.012, shade(stud, 1.3));
    }
    // knocker
    d.QS(-0.016, w * 0.55 - 0.05, h * 0.55 - 0.05, w * 0.55 + 0.05, h * 0.55 + 0.05, shade(stud, 0.85));
    d.QS(-0.017, w * 0.55 - 0.02, h * 0.48, w * 0.55 + 0.02, h * 0.55, shade(stud, 1.1));
    d.QS(-0.01, 0, 0, w, 0.05, STONE, shade(STONE, 0.55));
  }
  function paintColumn(d, h, r) {
    const col = RED, gold = GOLD;
    const a = d.P(0, 0, 0), b = d.P(0, 0, h);
    const w = r * 45.25, L = Math.round(a[0] - w), R = Math.round(a[0] + w), T = Math.round(b[1]), Hh = Math.round(a[1] - b[1]);
    d.g.fillStyle = shade(col, 0.72); d.g.fillRect(L, T, R - L, Hh);
    d.g.fillStyle = col; d.g.fillRect(L, T, Math.max(1, Math.round((R - L) * 0.62)), Hh);
    d.g.fillStyle = shade(col, 1.28); d.g.fillRect(L + 1, T, 1, Hh);
    d.g.fillStyle = shade(col, 0.45); d.g.fillRect(L - 1, T, 1, Hh); d.g.fillRect(R, T, 1, Hh);
    // 金箍 bands
    for (const t of [0.12, 0.5, 0.88]) {
      const yy = Math.round(T + Hh * t);
      d.g.fillStyle = shade(gold, 0.85); d.g.fillRect(L, yy, R - L, 2);
      d.g.fillStyle = shade(gold, 1.35); d.g.fillRect(L + 1, yy, Math.max(1, R - L - 2), 1);
    }
    d.g.fillStyle = shade(gold, 1.1); d.g.fillRect(L - 1, T, R - L + 2, 2);
    d.g.fillStyle = CAI_B; d.g.fillRect(L, T + 2, R - L, 2);
    // stone base disc
    d.g.fillStyle = STONE; d.g.beginPath(); d.g.ellipse(a[0], a[1] - 2, w + 3, (w + 3) * 0.5, 0, 0, Math.PI * 2); d.g.fill();
    d.g.strokeStyle = shade(STONE, 0.6); d.g.lineWidth = 1; d.g.stroke();
  }
  /* Site201：宋风匾额边框 — 多层金边 + 如意角花 + 漆面/木面底（禁纯线稿） */
  function paintPlaqueFrame(d, w, ht, o = {}) {
    const style = o.style || 'dark';
    const fr = GOLD;
    const bg = style === 'wood' ? '#5a3a22' : '#1a2840';
    const bgLite = style === 'wood' ? shade(bg, 1.22) : shade(bg, 1.18);
    const bgDark = shade(bg, 0.55);
    /* outer dark rail */
    d.QS(0, -w / 2 - 0.12, -ht / 2 - 0.12, w / 2 + 0.12, ht / 2 + 0.12, shade(fr, 0.55), shade(fr, 0.32));
    /* mid gold frame */
    d.QS(-0.004, -w / 2 - 0.08, -ht / 2 - 0.08, w / 2 + 0.08, ht / 2 + 0.08, shade(fr, 0.85), shade(fr, 0.42));
    d.QS(-0.008, -w / 2 - 0.055, -ht / 2 - 0.055, w / 2 + 0.055, ht / 2 + 0.055, fr, shade(fr, 0.48));
    /* bright inner fillet */
    d.QS(-0.012, -w / 2 - 0.03, -ht / 2 - 0.03, w / 2 + 0.03, ht / 2 + 0.03, shade(fr, 1.28));
    /* lacquer / wood panel */
    d.QS(-0.016, -w / 2, -ht / 2, w / 2, ht / 2, bg, bgDark);
    /* subtle panel grain / sheen strips (atlas texture, not line art) */
    for (let i = 0; i < 5; i++) {
      const zx = -ht / 2 + 0.08 + i * (ht - 0.16) / 4;
      d.QS(-0.018, -w / 2 + 0.06, zx, w / 2 - 0.06, zx + 0.035, i % 2 ? bgLite : shade(bg, 0.92));
    }
    /* 如意角花 bosses */
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const px = sx * (w / 2 + 0.01), pz = sz * (ht / 2 + 0.01);
      d.QS(-0.01, px - 0.08, pz - 0.055, px + 0.08, pz + 0.055, shade(fr, 1.05), shade(fr, 0.5));
      d.QS(-0.014, px - 0.045, pz - 0.03, px + 0.045, pz + 0.03, shade(fr, 1.32));
      d.QS(-0.016, px - 0.02, pz - 0.015, px + 0.02, pz + 0.015, '#e8c868');
    }
    /* top rail jewels */
    for (const sx of [-0.35, 0, 0.35]) {
      const px = sx * w;
      d.QS(-0.01, px - 0.05, ht / 2 + 0.02, px + 0.05, ht / 2 + 0.09, shade(fr, 1.15));
      d.QS(-0.014, px - 0.025, ht / 2 + 0.04, px + 0.025, ht / 2 + 0.075, '#c8322c', shade('#c8322c', 0.5));
    }
    /* tassels */
    for (const s of [-1, 1]) {
      d.seg([s * (w / 2 + 0.09), -0.02, -ht / 2], [s * (w / 2 + 0.09), -0.02, -ht / 2 - 0.38], fr);
      d.QS(-0.01, s * (w / 2 + 0.04), -ht / 2 - 0.5, s * (w / 2 + 0.14), -ht / 2 - 0.36, '#c8322c', shade('#c8322c', 0.5));
      d.QS(-0.012, s * (w / 2 + 0.06), -ht / 2 - 0.46, s * (w / 2 + 0.12), -ht / 2 - 0.4, shade('#c8322c', 1.2));
    }
  }
  /* Site201：竖招木板边框 atlas（金边+木纹底） */
  function paintVsignBoard(d, w, ht) {
    const fr = GOLD, bg = '#2a1e16', wood = '#6a4a2a';
    d.QS(0, -w / 2 - 0.08, -ht / 2 - 0.08, w / 2 + 0.08, ht / 2 + 0.08, shade(fr, 0.65), shade(fr, 0.35));
    d.QS(-0.005, -w / 2 - 0.05, -ht / 2 - 0.05, w / 2 + 0.05, ht / 2 + 0.05, fr, shade(fr, 0.45));
    d.QS(-0.01, -w / 2 - 0.02, -ht / 2 - 0.02, w / 2 + 0.02, ht / 2 + 0.02, shade(fr, 1.22));
    d.QS(-0.014, -w / 2, -ht / 2, w / 2, ht / 2, bg, shade(bg, 0.45));
    /* vertical wood grain */
    for (let i = 0; i < 4; i++) {
      const x = -w / 2 + 0.06 + i * (w - 0.12) / 3;
      d.QS(-0.016, x, -ht / 2 + 0.06, x + 0.04, ht / 2 - 0.06, i % 2 ? wood : shade(wood, 0.85));
    }
    /* corner studs */
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const px = sx * (w / 2 - 0.02), pz = sz * (ht / 2 - 0.02);
      d.QS(-0.012, px - 0.04, pz - 0.03, px + 0.04, pz + 0.03, shade(fr, 1.18));
    }
    /* top hanging ring */
    d.QS(-0.008, -0.06, ht / 2 + 0.02, 0.06, ht / 2 + 0.1, shade(fr, 0.9));
    d.QS(-0.012, -0.03, ht / 2 + 0.04, 0.03, ht / 2 + 0.08, shade(fr, 1.25));
  }
  function paintBanner(d, w, L, col) {
    col = col || '#c8322c';
    /* cloth body with soft tip */
    d.face([[-w / 2, 0, 0], [w / 2, 0, 0], [w / 2 + 0.03, 0, -L], [w * 0.12, 0, -L - 0.22], [-w / 2 - 0.02, 0, -L]], col, shade(col, 0.48));
    /* weave / stripe texture */
    for (let i = 0; i < 6; i++) {
      const z0 = -0.14 - i * (L - 0.28) / 5;
      d.QS(-0.008, -w / 2 + 0.04, z0, w / 2 - 0.04, z0 - 0.05, i % 2 ? shade(col, 1.12) : shade(col, 0.88));
    }
    /* top hanging bar */
    d.QS(-0.01, -w / 2 - 0.02, -0.14, w / 2 + 0.02, 0.02, shade('#3a2a1a', 0.9), shade('#3a2a1a', 0.5));
    d.QS(-0.014, -w / 2 + 0.02, -0.11, w / 2 - 0.02, -0.01, GOLD);
    d.QS(-0.016, -w / 2 + 0.05, -0.09, w / 2 - 0.05, -0.03, shade(GOLD, 1.25));
    /* side gold piping */
    d.seg([-w / 2 + 0.02, -0.01, -0.12], [-w / 2 + 0.01, -0.01, -L + 0.08], shade(GOLD, 0.85));
    d.seg([w / 2 - 0.02, -0.01, -0.12], [w / 2 + 0.01, -0.01, -L + 0.08], shade(GOLD, 0.85));
    /* inner gold border */
    d.QS(-0.012, -w / 2 + 0.06, -L + 0.08, w / 2 - 0.06, -0.18, null, GOLD);
    /* fringe tassels denser */
    for (let k = 0; k < 6; k++) {
      const tx = -w / 2 + 0.05 + k * w * 0.18;
      d.seg([tx, 0, -L + 0.02], [tx, 0, -L - 0.2 - (k % 2) * 0.07], shade(col, 0.62));
      d.QS(-0.005, tx - 0.035, -L - 0.26 - (k % 2) * 0.07, tx + 0.035, -L - 0.18 - (k % 2) * 0.07, GOLD);
      d.QS(-0.008, tx - 0.018, -L - 0.24 - (k % 2) * 0.07, tx + 0.018, -L - 0.2 - (k % 2) * 0.07, shade(GOLD, 1.2));
    }
  }
  function paintLantern(d, r) {
    /* Site200：灯笼本体略增暖纸透光高光（白天可读，夜景 emit 叠层更贴） */
    const col = '#d83028', cord = 0.25;
    d.seg([0, 0, 0], [0, 0, -cord], '#2a1a12');
    const c = d.P(0, 0, -cord - r * 1.2), g = d.g;
    const cx = Math.round(c[0]), cy = Math.round(c[1]), rr = r * 45.25 * 0.8;
    g.fillStyle = '#3a2a1a'; g.fillRect(cx - Math.round(rr * 0.55), cy - Math.round(rr * 1.2), Math.max(3, Math.round(rr * 1.1)), 2);
    g.fillStyle = GOLD; g.fillRect(cx - Math.round(rr * 0.45), cy - Math.round(rr * 1.15), Math.max(2, Math.round(rr * 0.9)), 1);
    g.beginPath(); g.ellipse(c[0], c[1], rr, rr * 1.08, 0, 0, Math.PI * 2); g.fillStyle = col; g.fill();
    g.strokeStyle = shade(col, 0.45); g.lineWidth = 1; g.stroke();
    g.fillStyle = shade(col, 1.55); g.beginPath(); g.ellipse(c[0] - rr * 0.15, c[1] - rr * 0.1, rr * 0.5, rr * 0.58, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,220,150,0.35)'; g.beginPath(); g.ellipse(c[0], c[1], rr * 0.55, rr * 0.62, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = shade(col, 0.7);
    for (const f of [-0.6, -0.2, 0.2, 0.6]) g.fillRect(Math.round(c[0] + f * rr), Math.round(c[1] - rr * 0.85), 1, Math.round(rr * 1.7));
    g.fillStyle = '#3a2a1a'; g.fillRect(cx - Math.round(rr * 0.55), cy + Math.round(rr * 1.0), Math.max(3, Math.round(rr * 1.1)), 2);
    g.fillStyle = GOLD; g.fillRect(cx - Math.round(rr * 0.45), cy + Math.round(rr * 1.05), Math.max(2, Math.round(rr * 0.9)), 1);
    g.fillStyle = '#e8c050'; g.fillRect(cx, cy + Math.round(rr * 1.1) + 2, 1, 4);
    g.fillStyle = '#c8322c'; g.fillRect(cx - 1, cy + Math.round(rr * 1.1) + 6, 3, 2);
  }
  function paintTileStripS(d, w) {
    // one eave-course of 筒瓦 + 瓦当 + 滴水 — textured module ~1 m wide (Site198 denser motif)
    const col = TILE, lite = shade(col, 1.28), dark = shade(col, 0.5);
    d.QS(0, 0, 0, w, 0.34, col, dark);
    for (let x = 0.04; x < w; x += 0.16) {
      d.QS(-0.008, x, 0.02, x + 0.09, 0.32, lite, dark);
      d.QS(-0.01, x + 0.015, 0.04, x + 0.075, 0.3, shade(col, 1.42));
      d.seg([x + 0.045, -0.012, 0.02], [x + 0.045, -0.012, 0.32], shade(col, 0.72));
    }
    for (let x = 0.12; x < w; x += 0.16) d.QS(-0.004, x, 0.03, x + 0.07, 0.28, shade(col, 0.76));
    // 瓦当 discs denser + floral motif
    for (let x = 0.08; x < w; x += 0.16) {
      const q = d.P(x, -0.035, -0.02);
      const cx = Math.round(q[0]), cy = Math.round(q[1]) + 1;
      d.g.fillStyle = shade(col, 0.32); d.g.beginPath();
      d.g.ellipse(cx, cy, 3.6, 4.0, 0, 0, Math.PI * 2); d.g.fill();
      d.g.fillStyle = shade(col, 0.55); d.g.beginPath();
      d.g.ellipse(cx, cy, 2.5, 2.8, 0, 0, Math.PI * 2); d.g.fill();
      d.g.fillStyle = shade(GOLD, 0.85); d.g.beginPath();
      d.g.ellipse(cx, cy, 1.4, 1.5, 0, 0, Math.PI * 2); d.g.fill();
      d.g.fillStyle = shade(GOLD, 1.1); d.g.fillRect(cx - 1, cy - 1, 2, 2);
      d.g.fillStyle = shade(GOLD, 0.65); d.g.fillRect(cx, cy - 3, 1, 6); d.g.fillRect(cx - 3, cy, 6, 1);
    }
    // 滴水 denser
    for (let x = 0.16; x < w; x += 0.16) {
      const q = d.P(x, -0.055, -0.1);
      const cx = Math.round(q[0]), cy = Math.round(q[1]);
      d.g.fillStyle = shade(col, 0.48);
      d.g.beginPath(); d.g.moveTo(cx - 2.5, cy); d.g.lineTo(cx + 2.5, cy); d.g.lineTo(cx, cy + 5); d.g.closePath(); d.g.fill();
      d.g.fillStyle = lite; d.g.fillRect(cx - 1, cy, 2, 1);
      d.g.fillStyle = shade(GOLD, 0.55); d.g.fillRect(cx, cy + 1, 1, 2);
    }
  }
  function paintTileCourseS(d, w) {
    const col = TILE, lite = shade(col, 1.22), dark = shade(col, 0.58);
    d.QS(0, 0, 0, w, 0.2, col, dark);
    for (let x = 0.04; x < w; x += 0.16) {
      d.QS(-0.006, x, 0.015, x + 0.09, 0.185, lite, dark);
      d.seg([x + 0.045, -0.01, 0.015], [x + 0.045, -0.01, 0.185], shade(col, 0.7));
    }
    for (let x = 0.12; x < w; x += 0.16) d.QS(-0.003, x, 0.03, x + 0.07, 0.17, shade(col, 0.78));
  }
  function paintTileRidgeS(d, w) {
    const col = RIDGE, lite = shade(col, 1.28), dark = shade(col, 0.52);
    d.box(0, -0.1, 0, w, 0.1, 0.26, col, { line: dark, top: lite, south: shade(col, 0.95) });
    for (let x = 0.08; x < w; x += 0.22) {
      d.QS(-0.105, x - 0.07, 0.03, x + 0.07, 0.24, lite, dark);
      d.QS(-0.11, x - 0.04, 0.07, x + 0.04, 0.22, shade(GOLD, 0.55));
      d.QS(-0.112, x - 0.015, 0.1, x + 0.015, 0.2, shade(GOLD, 0.85));
    }
    d.QS(-0.115, 0, 0.2, w, 0.26, shade(col, 1.38));
    d.QS(-0.12, 0.05, 0.22, w - 0.05, 0.245, shade(GOLD, 0.45));
  }
  /** Site198：独立瓦当模块（圆当 + 兽面/宝相花纹） */
  function paintWadangS(d, w) {
    const col = TILE, dark = shade(col, 0.42), lite = shade(col, 1.3);
    d.QS(0, 0, 0, w, 0.22, col, dark);
    for (let x = 0.12; x < w; x += 0.28) {
      const q = d.P(x, -0.04, 0.08);
      const cx = Math.round(q[0]), cy = Math.round(q[1]);
      d.g.fillStyle = dark; d.g.beginPath(); d.g.ellipse(cx, cy, 5.2, 5.8, 0, 0, Math.PI * 2); d.g.fill();
      d.g.fillStyle = shade(col, 0.62); d.g.beginPath(); d.g.ellipse(cx, cy, 4.0, 4.4, 0, 0, Math.PI * 2); d.g.fill();
      d.g.fillStyle = lite; d.g.beginPath(); d.g.ellipse(cx, cy, 2.6, 2.8, 0, 0, Math.PI * 2); d.g.fill();
      d.g.fillStyle = shade(GOLD, 0.9); d.g.beginPath(); d.g.ellipse(cx, cy, 1.5, 1.6, 0, 0, Math.PI * 2); d.g.fill();
      d.g.fillStyle = shade(GOLD, 1.15); d.g.fillRect(cx - 1, cy - 1, 2, 2);
      d.g.fillStyle = shade(GOLD, 0.7);
      for (const a of [0, 45, 90, 135]) {
        const rad = a * Math.PI / 180, rr = 3.2;
        d.g.fillRect(cx + Math.round(Math.cos(rad) * rr) - 1, cy + Math.round(Math.sin(rad) * rr) - 1, 2, 2);
      }
    }
  }
  /** Site198：屋檐滴水模块（三角滴水 + 筒瓦接缝） */
  function paintDripS(d, w) {
    const col = TILE, lite = shade(col, 1.25), dark = shade(col, 0.48);
    d.QS(0, 0, 0.06, w, 0.28, col, dark);
    for (let x = 0.06; x < w; x += 0.18) {
      d.QS(-0.006, x, 0.08, x + 0.1, 0.26, lite, dark);
    }
    for (let x = 0.1; x < w; x += 0.18) {
      const q = d.P(x, -0.06, -0.02);
      const cx = Math.round(q[0]), cy = Math.round(q[1]);
      d.g.fillStyle = dark;
      d.g.beginPath(); d.g.moveTo(cx - 3, cy); d.g.lineTo(cx + 3, cy); d.g.lineTo(cx, cy + 7); d.g.closePath(); d.g.fill();
      d.g.fillStyle = lite; d.g.beginPath(); d.g.moveTo(cx - 2, cy); d.g.lineTo(cx + 2, cy); d.g.lineTo(cx, cy + 5); d.g.closePath(); d.g.fill();
      d.g.fillStyle = shade(GOLD, 0.55); d.g.fillRect(cx, cy + 1, 1, 3);
    }
  }
  /** Site198：鸱吻/正脊兽 atlas 模块（贴图拼装，非纯线稿） */
  function paintChiwenS(d, w, o = {}) {
    const flip = !!(o && o.flip);
    const col = RIDGE, lite = shade(col, 1.28), dark = shade(col, 0.48), gold = shade(GOLD, 0.85);
    const s = flip ? -1 : 1;
    // base seat
    d.box(0.05, -0.12, 0, w - 0.05, 0.12, 0.18, col, { line: dark, top: lite, south: shade(col, 0.95) });
    // rising body (fish-dragon silhouette as textured boxes)
    d.box(0.15, -0.14, 0.15, w * 0.55, 0.1, 0.55, col, { line: dark, top: lite, south: shade(col, 1.05) });
    d.box(w * 0.35, -0.16, 0.4, w * 0.72, 0.08, 0.85, col, { line: dark, top: shade(col, 1.2), south: lite });
    // snout / open mouth
    d.box(w * 0.55, -0.18, 0.7, w * 0.95, 0.06, 1.05, col, { line: dark, south: shade(col, 1.12), top: lite });
    d.QS(-0.18, w * 0.62, 0.78, w * 0.9, 0.98, shade(col, 0.7));
    d.QS(-0.185, w * 0.68, 0.82, w * 0.86, 0.94, shade('#1a120e', 0.9));
    // crest / fin
    d.QS(-0.2, w * 0.25, 0.55, w * 0.48, 0.95, gold);
    d.QS(-0.205, w * 0.3, 0.7, w * 0.42, 1.05, shade(GOLD, 1.1));
    // eye
    const eq = d.P(w * 0.48, -0.17, 0.72);
    d.g.fillStyle = '#f0e8c8'; d.g.beginPath();
    d.g.ellipse(Math.round(eq[0]), Math.round(eq[1]), 2.2, 2.4, 0, 0, Math.PI * 2); d.g.fill();
    d.g.fillStyle = '#1a120e'; d.g.fillRect(Math.round(eq[0]), Math.round(eq[1]), 1, 1);
    // scale beads
    for (let z = 0.22; z < 0.7; z += 0.1) {
      for (let x = 0.2; x < w * 0.5; x += 0.12) {
        d.QS(-0.15, x, z, x + 0.06, z + 0.05, shade(col, 1.15 + (z % 0.2) * 0.3));
      }
    }
    // tail curl toward ridge
    d.box(0.02, -0.1, 0.05, 0.22, 0.1, 0.35, col, { line: dark, south: shade(col, 0.9) });
    d.QS(-0.16, 0.04, 0.28, 0.18, 0.42, gold);
    void s;
  }

  /** Site205：更密瓦当（宝相/兽面金饰 + 重圈当缘；禁纯线稿）— 强化既有 tile_wadang_S */
  function paintWadangDenseS(d, w) {
    const col = TILE, dark = shade(col, 0.38), lite = shade(col, 1.35);
    d.QS(0, 0, 0, w, 0.24, col, dark);
    for (let x = 0.08; x < w; x += 0.22) {
      d.QS(-0.004, x - 0.02, 0.02, x + 0.14, 0.2, shade(col, 0.92), dark);
      const q = d.P(x + 0.05, -0.045, 0.1);
      const cx = Math.round(q[0]), cy = Math.round(q[1]);
      d.g.fillStyle = dark; d.g.beginPath(); d.g.ellipse(cx, cy, 6.0, 6.6, 0, 0, Math.PI * 2); d.g.fill();
      d.g.fillStyle = shade(col, 0.55); d.g.beginPath(); d.g.ellipse(cx, cy, 4.8, 5.2, 0, 0, Math.PI * 2); d.g.fill();
      d.g.fillStyle = lite; d.g.beginPath(); d.g.ellipse(cx, cy, 3.2, 3.4, 0, 0, Math.PI * 2); d.g.fill();
      d.g.fillStyle = shade(GOLD, 0.95); d.g.beginPath(); d.g.ellipse(cx, cy, 1.9, 2.0, 0, 0, Math.PI * 2); d.g.fill();
      d.g.fillStyle = shade(GOLD, 1.2); d.g.fillRect(cx - 1, cy - 1, 3, 3);
      d.g.fillStyle = shade(GOLD, 0.75);
      for (const a of [0, 30, 60, 90, 120, 150]) {
        const rad = a * Math.PI / 180, rr = 3.8;
        d.g.fillRect(cx + Math.round(Math.cos(rad) * rr) - 1, cy + Math.round(Math.sin(rad) * rr) - 1, 2, 2);
      }
      /* petal beads */
      for (const a of [15, 75, 135]) {
        const rad = a * Math.PI / 180, rr = 2.4;
        d.g.fillStyle = shade(GOLD, 1.05);
        d.g.fillRect(cx + Math.round(Math.cos(rad) * rr), cy + Math.round(Math.sin(rad) * rr), 1, 1);
      }
    }
  }
  /** Site205：滴水（如意尖头 + 筒瓦接缝 + 金点；比 tile_drip 更密） */
  function paintDishuiS(d, w) {
    const col = TILE, lite = shade(col, 1.3), dark = shade(col, 0.42);
    d.QS(0, 0, 0.04, w, 0.3, col, dark);
    for (let x = 0.04; x < w; x += 0.14) {
      d.QS(-0.006, x, 0.06, x + 0.09, 0.28, lite, dark);
      d.seg([x + 0.045, -0.012, 0.06], [x + 0.045, -0.012, 0.28], shade(col, 0.68));
    }
    for (let x = 0.07; x < w; x += 0.14) {
      const q = d.P(x, -0.07, -0.04);
      const cx = Math.round(q[0]), cy = Math.round(q[1]);
      d.g.fillStyle = dark;
      d.g.beginPath(); d.g.moveTo(cx - 3.5, cy); d.g.lineTo(cx + 3.5, cy); d.g.lineTo(cx + 1.2, cy + 5); d.g.lineTo(cx, cy + 8); d.g.lineTo(cx - 1.2, cy + 5); d.g.closePath(); d.g.fill();
      d.g.fillStyle = lite;
      d.g.beginPath(); d.g.moveTo(cx - 2.2, cy + 0.5); d.g.lineTo(cx + 2.2, cy + 0.5); d.g.lineTo(cx, cy + 6); d.g.closePath(); d.g.fill();
      d.g.fillStyle = shade(GOLD, 0.7); d.g.fillRect(cx - 1, cy + 1, 2, 3);
      d.g.fillStyle = shade(GOLD, 1.05); d.g.fillRect(cx, cy + 4, 1, 2);
    }
  }
  /** Site205：瓦垄（筒瓦垄脊 + 板瓦凹槽交替，屋顶坡面） */
  function paintWalongS(d, w) {
    const col = TILE, lite = shade(col, 1.32), dark = shade(col, 0.48), mid = shade(col, 0.78);
    d.QS(0, 0, 0, w, 0.26, col, dark);
    for (let x = 0.03; x < w; x += 0.13) {
      /* 筒瓦垄 */
      d.QS(-0.008, x, 0.01, x + 0.075, 0.25, lite, dark);
      d.QS(-0.01, x + 0.012, 0.04, x + 0.063, 0.22, shade(col, 1.45));
      d.seg([x + 0.038, -0.014, 0.02], [x + 0.038, -0.014, 0.24], shade(col, 0.7));
      /* 板瓦凹 */
      const bx = x + 0.075;
      if (bx + 0.05 < w) {
        d.QS(-0.003, bx, 0.03, bx + 0.05, 0.22, mid);
        d.QS(-0.004, bx + 0.01, 0.05, bx + 0.04, 0.2, shade(col, 0.62));
      }
    }
    /* 金边接缝点 */
    for (let x = 0.1; x < w; x += 0.26) {
      d.QS(-0.012, x - 0.02, 0.11, x + 0.02, 0.15, shade(GOLD, 0.5));
    }
  }
  /** Site205：檐口（木檐楣 + 瓦口线 + 滴水座） */
  function paintYankouS(d, w) {
    const wood = WOOD_D, lite = shade(wood, 1.35), dark = shade(wood, 0.45);
    const col = TILE;
    /* timber fascia */
    d.QS(0, 0, 0.08, w, 0.28, wood, dark);
    d.QS(-0.004, 0.02, 0.1, w - 0.02, 0.26, shade(wood, 1.08), dark);
    for (let x = 0.08; x < w; x += 0.22) {
      d.seg([x, -0.01, 0.1], [x, -0.01, 0.26], shade(wood, 0.7));
      d.QS(-0.008, x - 0.03, 0.14, x + 0.03, 0.22, lite);
    }
    /* tile mouth / 瓦口 */
    d.QS(-0.02, 0, 0.0, w, 0.1, col, shade(col, 0.5));
    for (let x = 0.05; x < w; x += 0.12) {
      d.QS(-0.025, x, 0.01, x + 0.07, 0.09, shade(col, 1.2), shade(col, 0.55));
    }
    /* gold trim beads along eave lip */
    for (let x = 0.1; x < w; x += 0.18) {
      d.QS(-0.03, x - 0.015, 0.02, x + 0.015, 0.05, shade(GOLD, 0.65));
    }
    /* small drip seats */
    for (let x = 0.14; x < w; x += 0.24) {
      const q = d.P(x, -0.05, -0.02);
      const cx = Math.round(q[0]), cy = Math.round(q[1]);
      d.g.fillStyle = shade(col, 0.45);
      d.g.beginPath(); d.g.moveTo(cx - 2, cy); d.g.lineTo(cx + 2, cy); d.g.lineTo(cx, cy + 4); d.g.closePath(); d.g.fill();
    }
  }

  /* Site203：密格隔心/横披 — 多重棂条 + 纸面颗粒（禁纯线稿） */
  function paintLatticeGeshan(d, w, h, o = {}) {
    const fr = RED_W, paper = PAPER, m = 0.06;
    d.QS(0, 0, 0, w, h, fr, shade(fr, 0.4));
    d.QS(-0.004, 0.025, 0.025, w - 0.025, h - 0.025, shade(fr, 0.92), shade(fr, 0.5));
    d.QS(-0.008, m, m, w - m, h - m, paper, shade(fr, 0.55));
    for (let i = 0; i < 16; i++) {
      const x = m + 0.03 + (i * 0.27) % (w - 2 * m - 0.08);
      const z = m + 0.04 + ((i * 0.43) % (h - 2 * m - 0.1));
      d.QS(-0.009, x, z, x + 0.045, z + 0.035, shade(paper, i % 2 ? 0.94 : 1.06));
    }
    const X0 = m + 0.02, X1 = w - m - 0.02, Z0 = m + 0.02, Z1 = h - m - 0.02;
    const lc = shade(fr, 0.78), s = 0.085;
    /* dense grid + mid stile/rail */
    for (let x = X0 + s; x < X1; x += s) d.seg([x, -0.012, Z0], [x, -0.012, Z1], lc);
    for (let z = Z0 + s; z < Z1; z += s) d.seg([X0, -0.012, z], [X1, -0.012, z], lc);
    d.QS(-0.011, (X0 + X1) / 2 - 0.03, Z0, (X0 + X1) / 2 + 0.03, Z1, shade(fr, 0.95), shade(fr, 0.5));
    d.QS(-0.011, X0, (Z0 + Z1) / 2 - 0.03, X1, (Z0 + Z1) / 2 + 0.03, shade(fr, 0.95), shade(fr, 0.5));
    /* gold corner pins */
    for (const [sx, sz] of [[m, m], [w - m, m], [m, h - m], [w - m, h - m]]) {
      d.QS(-0.014, sx - 0.03, sz - 0.03, sx + 0.03, sz + 0.03, GOLD);
      d.QS(-0.015, sx - 0.012, sz - 0.012, sx + 0.012, sz + 0.012, shade(GOLD, 1.25));
    }
  }
  /* Site203：花窗 — 外框雕刻如意/卷草 + 冰裂纹隔心 */
  function paintHuachuang(d, w, h) {
    const fr = RED_W, paper = PAPER, m = 0.09;
    d.QS(0, 0, 0, w, h, fr, shade(fr, 0.38));
    d.QS(-0.004, 0.03, 0.03, w - 0.03, h - 0.03, shade(fr, 0.9), shade(fr, 0.48));
    /* carved outer border bosses */
    for (let i = 0; i < 8; i++) {
      const t = i / 8, x = 0.08 + t * (w - 0.16), z = 0.05;
      d.QS(-0.01, x - 0.04, z, x + 0.04, z + 0.06, shade(GOLD, 0.7));
      d.QS(-0.01, x - 0.04, h - z - 0.06, x + 0.04, h - z, shade(GOLD, 0.7));
    }
    for (let i = 0; i < 5; i++) {
      const t = i / 5, z = 0.12 + t * (h - 0.24);
      d.QS(-0.01, 0.04, z - 0.035, 0.1, z + 0.035, shade(GOLD, 0.65));
      d.QS(-0.01, w - 0.1, z - 0.035, w - 0.04, z + 0.035, shade(GOLD, 0.65));
    }
    d.QS(-0.008, m, m, w - m, h - m, paper, shade(fr, 0.55));
    for (let i = 0; i < 12; i++) {
      const x = m + 0.04 + (i * 0.31) % (w - 2 * m - 0.1);
      const z = m + 0.05 + ((i * 0.49) % (h - 2 * m - 0.12));
      d.QS(-0.009, x, z, x + 0.05, z + 0.04, shade(paper, i % 2 ? 0.93 : 1.05));
    }
    /* 冰裂纹：不规则斜交棂（atlas 填面，非稀疏线稿） */
    const X0 = m + 0.04, X1 = w - m - 0.04, Z0 = m + 0.04, Z1 = h - m - 0.04, lc = shade(fr, 0.8);
    const segs = [
      [0.05, 0.08, 0.55, 0.22], [0.55, 0.22, 0.95, 0.1], [0.2, 0.08, 0.35, 0.45],
      [0.35, 0.45, 0.7, 0.35], [0.7, 0.35, 0.85, 0.7], [0.1, 0.4, 0.45, 0.55],
      [0.45, 0.55, 0.3, 0.9], [0.3, 0.9, 0.65, 0.85], [0.65, 0.85, 0.9, 0.55],
      [0.15, 0.65, 0.5, 0.75], [0.55, 0.1, 0.6, 0.5], [0.75, 0.15, 0.55, 0.55],
      [0.05, 0.5, 0.25, 0.75], [0.8, 0.4, 0.95, 0.8], [0.4, 0.7, 0.75, 0.95],
    ];
    const Ww = X1 - X0, Hh = Z1 - Z0;
    for (const [ax, az, bx, bz] of segs) {
      d.seg([X0 + ax * Ww, -0.012, Z0 + az * Hh], [X0 + bx * Ww, -0.012, Z0 + bz * Hh], lc);
    }
    /* thickened timber ribs as filled strips */
    d.QS(-0.011, X0 + Ww * 0.32, Z0, X0 + Ww * 0.38, Z1, shade(fr, 0.92), shade(fr, 0.5));
    d.QS(-0.011, X0, Z0 + Hh * 0.42, X1, Z0 + Hh * 0.48, shade(fr, 0.92), shade(fr, 0.5));
    /* corner peony suggestion */
    for (const [sx, sz] of [[m + 0.08, m + 0.08], [w - m - 0.08, m + 0.08], [m + 0.08, h - m - 0.08], [w - m - 0.08, h - m - 0.08]]) {
      d.QS(-0.014, sx - 0.05, sz - 0.05, sx + 0.05, sz + 0.05, shade(GOLD, 0.75));
      d.QS(-0.015, sx - 0.022, sz - 0.022, sx + 0.022, sz + 0.022, shade(GOLD, 1.2));
    }
  }
  /* Site203：槛窗 — 石槛 + 矮窗格 + 上披 */
  function paintKanchuang(d, w, h) {
    const fr = RED_W, paper = PAPER, sillH = Math.min(0.28, h * 0.22);
    /* stone sill base */
    d.QS(0, 0, 0, w, sillH, STONE, shade(STONE, 0.5));
    d.QS(-0.005, 0.04, 0.04, w - 0.04, sillH - 0.04, shade(STONE, 1.08));
    for (let x = 0.12; x < w; x += 0.28) d.seg([x, -0.008, 0.03], [x, -0.008, sillH - 0.03], shade(STONE, 0.72));
    d.QS(-0.008, 0, sillH - 0.04, w, sillH, shade(WOOD, 0.75));
    /* window frame above sill */
    const z0 = sillH, hh = h - sillH;
    d.QS(-0.002, 0, z0, w, h, fr, shade(fr, 0.4));
    d.QS(-0.006, 0.04, z0 + 0.04, w - 0.04, h - 0.04, shade(fr, 0.92), shade(fr, 0.5));
    const m = 0.08;
    d.QS(-0.01, m, z0 + m, w - m, h - m, paper, shade(fr, 0.55));
    for (let i = 0; i < 10; i++) {
      const x = m + 0.03 + (i * 0.33) % (w - 2 * m - 0.08);
      const z = z0 + m + 0.04 + ((i * 0.41) % (hh - 2 * m - 0.1));
      d.QS(-0.011, x, z, x + 0.045, z + 0.03, shade(paper, i % 2 ? 0.94 : 1.05));
    }
    const X0 = m + 0.02, X1 = w - m - 0.02, Z0 = z0 + m + 0.02, Z1 = h - m - 0.02, lc = shade(fr, 0.78);
    const s = 0.1;
    for (let x = X0 + s; x < X1; x += s) d.seg([x, -0.013, Z0], [x, -0.013, Z1], lc);
    for (let z = Z0 + s; z < Z1; z += s) d.seg([X0, -0.013, z], [X1, -0.013, z], lc);
    /* mid stile */
    d.QS(-0.012, (X0 + X1) / 2 - 0.025, Z0, (X0 + X1) / 2 + 0.025, Z1, shade(fr, 0.95), shade(fr, 0.5));
    /* top drip + gold pins */
    d.QS(-0.01, 0, h - 0.05, w, h, shade(fr, 0.7));
    for (const sx of [m, w / 2, w - m]) {
      d.QS(-0.014, sx - 0.03, h - 0.04, sx + 0.03, h - 0.01, GOLD);
    }
  }

  function paintThreshold(d, w) {
    d.QS(0, 0, 0, w, 0.18, STONE, shade(STONE, 0.5));
    d.QS(-0.005, 0.04, 0.04, w - 0.04, 0.14, shade(STONE, 1.08));
    for (let x = 0.15; x < w; x += 0.35) d.seg([x, -0.008, 0.02], [x, -0.008, 0.16], shade(STONE, 0.72));
    d.QS(-0.008, 0, 0, w, 0.03, shade(STONE, 0.7));
    d.QS(-0.008, 0, 0.15, w, 0.18, shade(WOOD, 0.75));
  }
  function paintDougong(d, o = {}) {
    const large = !!(o && o.large);
    const s = large ? 1.35 : 1;
    const c = '#7a4a2c', g1 = CAI_G, g2 = CAI_B, L = shade(c, 0.48);
    // 坐斗
    d.box(-0.18 * s, -0.06, 0, 0.18 * s, 0.32, 0.16 * s, c, { line: L, south: g1, top: shade(c, 1.15) });
    d.QS(-0.07, -0.14 * s, 0.12 * s, 0.14 * s, 0.15 * s, GOLD);
    // 华栱 / 横栱 layer 1
    d.box(-0.55 * s, -0.14, 0.16 * s, 0.55 * s, 0.28, 0.28 * s, c, { line: L, south: g2, top: shade(c, 1.1) });
    d.QS(-0.15, -0.5 * s, 0.18 * s, 0.5 * s, 0.2 * s, shade(g1, 1.15));
    // 昂 / 出跳
    d.box(-0.1 * s, -0.48 * s, 0.16 * s, 0.1 * s, 0.12, 0.34 * s, c, { line: L, south: shade(c, 1.12), top: shade(c, 1.2) });
    d.QS(-0.49 * s, -0.06 * s, 0.28 * s, -0.42 * s, 0.32 * s, shade(GOLD, 0.75)); // tip
    // 散斗 trio
    for (const k of [-1, 0, 1]) {
      d.box(k * 0.45 * s - 0.1 * s, -0.16 - (k === 0 ? 0.28 * s : 0), 0.28 * s, k * 0.45 * s + 0.1 * s, 0.22, 0.4 * s, c, { line: L, south: g1, top: shade(c, 1.12) });
      d.QS(-0.17 - (k === 0 ? 0.28 * s : 0), k * 0.45 * s - 0.06 * s, 0.36 * s, k * 0.45 * s + 0.06 * s, 0.38 * s, GOLD);
    }
    // upper 枋 / 挑檐枋
    d.box(-0.78 * s, -0.2, 0.4 * s, 0.78 * s, 0.22, 0.52 * s, c, { line: L, south: g2, top: shade(c, 1.18) });
    d.QS(-0.21, -0.72 * s, 0.48 * s, 0.72 * s, 0.52 * s, GOLD);
    d.QS(-0.21, -0.72 * s, 0.4 * s, 0.72 * s, 0.43 * s, shade(GOLD, 0.8));
    // second 昂 for large
    if (large) {
      d.box(-0.08 * s, -0.72 * s, 0.34 * s, 0.08 * s, -0.2, 0.52 * s, c, { line: L, south: shade(c, 1.18) });
      d.box(-0.95 * s, -0.24, 0.52 * s, 0.95 * s, 0.2, 0.62 * s, c, { line: L, south: g1, top: shade(c, 1.2) });
      d.QS(-0.25, -0.9 * s, 0.58 * s, 0.9 * s, 0.62 * s, GOLD);
      // caihua face panels
      d.QS(-0.22, -0.4 * s, 0.44 * s, -0.15 * s, 0.5 * s, g1);
      d.QS(-0.22, 0.15 * s, 0.44 * s, 0.4 * s, 0.5 * s, g1);
    } else {
      d.box(-0.08 * s, -0.62 * s, 0.34 * s, 0.08 * s, -0.18, 0.5 * s, c, { line: L, south: shade(c, 1.15) });
    }
    d.QS(-0.15, -0.48 * s, 0.16 * s, 0.48 * s, 0.18 * s, shade(g1, 1.2));
  }
  function paintEfangUnit(d, w) {
    const b = CAI_B, g = CAI_G, z0 = 0, z1 = 0.35;
    d.box(0, -0.04, z0, w, 0.2, z1, b, { line: shade(b, 0.45), west: shade(g, 0.8), top: shade(b, 0.8) });
    d.QS(-0.045, 0, z1 - 0.03, w, z1, GOLD);
    d.QS(-0.045, 0, z0, w, z0 + 0.03, shade(GOLD, 0.85));
    const m = w / 2, zh = (z0 + z1) / 2;
    d.QS(-0.045, 0.06, z0 + 0.04, w * 0.2, z1 - 0.04, g);
    d.QS(-0.045, w - w * 0.2, z0 + 0.04, w - 0.06, z1 - 0.04, g);
    d.QS(-0.05, w * 0.28, z0 + (z1 - z0) * 0.22, w - w * 0.28, z1 - (z1 - z0) * 0.22, '#e8d6a0', shade(GOLD, 0.55));
    d.QS(-0.052, m - 0.12, zh - 0.06, m + 0.12, zh + 0.06, g);
    d.QS(-0.054, m - 0.05, zh - 0.03, m + 0.05, zh + 0.03, GOLD);
  }
  /* ---- Site198：城墙灰砖 / 垛口 / 女墙（南薰门同色；禁纯线稿） ---- */
  const CITY = '#8a8680', CITY_W = '#6e6a64', CITY_TOP = '#a29e95';
  function paintCityBrickS(d, w, h) {
    d.QS(0, 0, 0, w, h, CITY, shade(CITY, 0.48));
    // thick mortar courses + running bond (城砖 atlas, not sparse coursesS lines)
    for (let z = 0.22, k = 0; z < h - 0.02; z += 0.22, k++) {
      d.QS(-0.004, 0.01, z - 0.02, w - 0.01, z, shade(CITY, 0.72));
      const ox = (k % 2) * 0.28;
      for (let x = ox; x < w - 0.04; x += 0.55) {
        d.seg([x, -0.006, z - 0.22], [x, -0.006, z], shade(CITY, 0.62));
        // brick face grit / weathering flecks
        d.QS(-0.007, x + 0.06, z - 0.16, x + 0.22, z - 0.08, shade(CITY, k % 3 ? 0.94 : 1.08));
      }
    }
    // occasional dark streak (雨渍)
    for (let i = 0; i < 4; i++) {
      const x = 0.18 + i * (w / 4.2);
      d.seg([x, -0.008, h * 0.15], [x, -0.008, h * (0.55 + (i % 2) * 0.2)], shade(CITY, 0.78));
    }
  }
  function paintCityBrickW(d, dpth, h) {
    d.QW(0, 0, 0, dpth, h, CITY_W, shade(CITY_W, 0.48));
    for (let z = 0.22, k = 0; z < h - 0.02; z += 0.22, k++) {
      d.seg([ -0.005, 0.02, z], [ -0.005, dpth - 0.02, z], shade(CITY_W, 0.72));
      for (let y = (k % 2) * 0.28; y < dpth - 0.04; y += 0.55) {
        d.seg([ -0.005, y, z - 0.22], [ -0.005, y, z], shade(CITY_W, 0.62));
      }
    }
  }
  function paintCityStoneS(d, w, h) {
    d.QS(0, 0, 0, w, h, STONE, shade(STONE, 0.5));
    for (let z = 0.4, k = 0; z < h - 0.02; z += 0.4, k++) {
      d.QS(-0.004, 0.02, z - 0.03, w - 0.02, z, shade(STONE, 0.78));
      for (let x = (k % 2) * 0.55; x < w - 0.05; x += 1.1) {
        d.seg([x, -0.006, z - 0.4], [x, -0.006, z], shade(STONE, 0.68));
        d.QS(-0.007, x + 0.12, z - 0.28, x + 0.55, z - 0.12, shade(STONE, 1.06));
      }
    }
  }
  /** 垛口（crenel tooth）：带射击孔的城垛块 */
  function paintMerlon(d, o = {}) {
    const w = o.w || 1.05, dpth = o.d || 0.55, h = o.h || 1.7;
    const slit = o.slit !== false;
    d.box(0, 0, 0, w, dpth, h, CITY, { line: shade(CITY, 0.45), west: CITY_W, top: shade(CITY, 1.18), south: shade(CITY, 0.98) });
    // brick courses on S + W
    for (let z = 0.22; z < h - 0.05; z += 0.22) {
      d.seg([0.04, -0.008, z], [w - 0.04, -0.008, z], shade(CITY, 0.7));
      d.seg([-0.008, 0.04, z], [-0.008, dpth - 0.04, z], shade(CITY_W, 0.7));
    }
    for (let x = 0.28; x < w - 0.05; x += 0.28) d.seg([x, -0.01, 0.05], [x, -0.01, h - 0.08], shade(CITY, 0.62));
    // coping cap
    d.box(-0.04, -0.04, h - 0.08, w + 0.04, dpth + 0.04, h + 0.06, shade(CITY, 1.12), { line: shade(CITY, 0.5), west: CITY_W, top: shade(CITY, 1.25) });
    // 射击孔
    if (slit) {
      const sx = w * 0.42, sz = h * 0.55;
      d.QS(-0.012, sx, sz, sx + 0.18, sz + 0.42, '#2a2622', shade(CITY, 0.4));
      d.QS(-0.014, sx + 0.03, sz + 0.06, sx + 0.15, sz + 0.36, '#1a1814');
    }
    // corner highlight
    d.QS(-0.006, 0.02, h - 0.18, 0.12, h - 0.04, shade(CITY, 1.15));
  }
  /** 垛口缺口（crenel / embrasure）矮段 */
  function paintCrenel(d, o = {}) {
    const w = o.w || 0.55, dpth = o.d || 0.55, h = o.h || 1.0;
    d.box(0, 0, 0, w, dpth, h, CITY, { line: shade(CITY, 0.45), west: CITY_W, top: shade(CITY, 1.15), south: shade(CITY, 0.95) });
    for (let z = 0.22; z < h - 0.04; z += 0.22) {
      d.seg([0.03, -0.008, z], [w - 0.03, -0.008, z], shade(CITY, 0.7));
    }
    d.box(-0.03, -0.03, h - 0.06, w + 0.03, dpth + 0.03, h + 0.04, shade(CITY, 1.1), { line: shade(CITY, 0.5), west: CITY_W, top: shade(CITY, 1.22) });
  }
  /** 女墙（parapet）：连续低墙段 */
  function paintParapet(d, o = {}) {
    const w = o.w || 1.6, dpth = o.d || 0.6, h = o.h || 1.1;
    d.box(0, 0, 0, w, dpth, h, CITY, { line: shade(CITY, 0.48), west: CITY_W, top: shade(CITY, 1.15), south: shade(CITY, 0.96) });
    for (let z = 0.22; z < h - 0.04; z += 0.22) {
      d.seg([0.04, -0.008, z], [w - 0.04, -0.008, z], shade(CITY, 0.7));
      const k = Math.round(z / 0.22);
      for (let x = (k % 2) * 0.28; x < w - 0.04; x += 0.55) d.seg([x, -0.01, z - 0.22], [x, -0.01, z], shade(CITY, 0.62));
    }
    // tile-ish coping
    d.box(-0.05, -0.05, h - 0.05, w + 0.05, dpth + 0.05, h + 0.1, shade(CITY, 1.08), { line: shade(CITY, 0.5), west: CITY_W, top: shade(CITY, 1.22) });
    d.QS(-0.06, 0.1, h + 0.02, w - 0.1, h + 0.08, shade(CITY, 1.28));
  }
  /** 城墙走道顶面砖 */
  function paintWalkTop(d, w, dpth) {
    d.box(0, 0, 0, w, dpth, 0.06, CITY_TOP, { line: shade(CITY, 0.5), west: shade(CITY_TOP, 0.85), top: shade(CITY_TOP, 1.08), south: shade(CITY_TOP, 0.95) });
    for (let x = 0.35; x < w; x += 0.7) d.seg([x, 0.02, 0.07], [x, dpth - 0.02, 0.07], shade(CITY, 0.78));
    for (let y = 0.35; y < dpth; y += 0.7) d.seg([0.02, y, 0.07], [w - 0.02, y, 0.07], shade(CITY, 0.82));
  }
  /* Site202 paving atlas kitbash — 方砖 / 条石 / 席纹 / 排水沟 / 路牙（禁纯线稿） */
  function paintPaveFangzhuan(d, w, dpth) {
    const col = '#a8a296', m = '#7a7468';
    d.box(0, 0, 0, w, dpth, 0.05, col, { line: shade(col, 0.5), west: shade(col, 0.82), top: shade(col, 1.1), south: shade(col, 0.95) });
    for (let x = 0.4; x < w; x += 0.5) d.seg([x, 0.02, 0.06], [x, dpth - 0.02, 0.06], shade(m, 0.95));
    for (let y = 0.4; y < dpth; y += 0.5) d.seg([0.02, y, 0.06], [w - 0.02, y, 0.06], shade(m, 1.05));
    for (let i = 0; i < 8; i++) {
      const x = 0.1 + (i * 0.37) % (w - 0.3), y = 0.12 + ((i * 0.53) % (dpth - 0.25));
      d.box(x, y, 0.05, x + 0.12, y + 0.09, 0.055, shade(col, i % 2 ? 0.9 : 1.08), { line: false, noW: true, noS: true });
    }
  }
  function paintPaveTiaoshi(d, w, dpth) {
    const col = '#8e887c', m = '#6a6458';
    d.box(0, 0, 0, w, dpth, 0.05, col, { line: shade(col, 0.48), west: shade(col, 0.8), top: shade(col, 1.08), south: shade(col, 0.94) });
    for (let x = 0.55; x < w; x += 0.7) d.seg([x, 0.02, 0.06], [x, dpth - 0.02, 0.06], shade(m, 0.9));
    for (let y = 0.9; y < dpth; y += 1.0) d.seg([0.02, y, 0.06], [w - 0.02, y, 0.06], shade(m, 1.05));
    d.QS(-0.01, 0.15, 0.055, w - 0.15, 0.06, 'rgba(220,210,190,0.28)');
  }
  function paintPaveXiewen(d, w, dpth) {
    const col = '#b0aa9c', m = '#7a7468';
    d.box(0, 0, 0, w, dpth, 0.05, col, { line: shade(col, 0.5), west: shade(col, 0.82), top: shade(col, 1.1), south: shade(col, 0.95) });
    for (let i = -2; i < 5; i++) {
      const x0 = i * 0.45;
      d.seg([x0, 0.05, 0.06], [x0 + dpth, dpth - 0.05, 0.06], shade(m, 0.92));
      d.seg([x0 + dpth, 0.05, 0.06], [x0, dpth - 0.05, 0.06], shade(m, 0.88));
    }
  }
  function paintDrainGutter(d) {
    const w = 0.7, dpth = 0.7;
    const ditch = '#5a554c', wet = '#3a4a52', curb = '#9a9488';
    d.box(0.08, 0.12, -0.05, w - 0.08, dpth - 0.12, 0.02, ditch, { line: shade(ditch, 0.5), top: wet, west: shade(ditch, 0.75), south: shade(ditch, 0.85) });
    d.box(0, 0.08, 0.02, 0.14, dpth - 0.08, 0.16, curb, { line: shade(curb, 0.48), west: shade(curb, 0.78), top: shade(curb, 1.12), south: shade(curb, 0.95) });
    d.box(w - 0.14, 0.08, 0.02, w, dpth - 0.08, 0.16, curb, { line: shade(curb, 0.48), west: shade(curb, 0.78), top: shade(curb, 1.12), south: shade(curb, 0.95) });
    for (let y = 0.22; y < dpth - 0.1; y += 0.28) {
      d.seg([0.02, y, 0.04], [0.02, y, 0.14], shade(curb, 0.7));
      d.seg([w - 0.02, y, 0.04], [w - 0.02, y, 0.14], shade(curb, 0.7));
    }
    /* wet glints — textured, not line-only */
    d.QS(-0.02, 0.18, 0.025, w - 0.18, 0.03, 'rgba(120,150,160,0.35)');
    d.box(0.2, 0.25, 0.02, 0.5, 0.45, 0.035, shade(wet, 1.15), { line: false, noW: true, noS: true });
  }
  function paintCurbStone(d) {
    const w = 0.95, dpth = 0.32, h = 0.22;
    const curb = '#9a9488';
    d.box(0, 0, 0, w, dpth, h, curb, { line: shade(curb, 0.48), west: shade(curb, 0.78), top: shade(curb, 1.14), south: shade(curb, 0.95) });
    for (let x = 0.28; x < w; x += 0.45) d.seg([x, -0.01, 0.02], [x, -0.01, h - 0.02], shade(curb, 0.68));
    d.box(0.05, -0.02, h - 0.04, w - 0.05, dpth + 0.02, h + 0.03, shade(curb, 1.08), { line: shade(curb, 0.5), top: shade(curb, 1.2), west: shade(curb, 0.85), south: shade(curb, 1.02) });
    for (let i = 0; i < 5; i++) {
      const x = 0.1 + i * 0.16;
      d.box(x, 0.04, h + 0.01, x + 0.08, 0.14, h + 0.025, shade(curb, i % 2 ? 0.92 : 1.1), { line: false, noW: true, noS: true });
    }
  }
  function paintWallW(d, dpth, h, brick) {

    const col = brick ? shade(BRICK, 0.85) : PLASTER_W, fr = shade(WOOD, 0.85);
    d.QW(0, 0, 0, dpth, h, col, shade(col, 0.55));
    if (brick) {
      for (let z = 0.16, k = 0; z < h; z += 0.16, k++) {
        d.seg([0 - 0.005, 0.02, z], [0 - 0.005, dpth - 0.02, z], shade(col, 0.78));
        for (let y = (k % 2) * 0.2; y < dpth; y += 0.4) d.seg([0 - 0.005, y, z], [0 - 0.005, y, Math.min(h, z + 0.16)], shade(col, 0.72));
      }
    } else {
      d.QW(-0.01, 0, 0, 0.08, h, fr);
      d.QW(-0.01, dpth - 0.08, 0, dpth, h, fr);
      d.QW(-0.01, 0, h - 0.12, dpth, h, fr);
      d.QW(-0.01, 0, h * 0.48, dpth, h * 0.48 + 0.1, fr);
    }
  }


  /* ---- Site204：宋风街具 atlas 模块（石灯笼/石凳/花缸/挂灯杆）禁纯线稿 ---- */
  function paintPropShideng(d) {
    const ST = '#8a8070', STW = '#6a6258', TOP = '#9a9080', GOLD = '#c8a040';
    // 基座
    d.box(-0.42, -0.42, 0, 0.42, 0.42, 0.28, ST, { line: shade(ST, 0.5), west: STW, top: shade(ST, 0.9) });
    for (let z = 0.1; z < 0.26; z += 0.1) {
      d.seg([-0.4, -0.425, z], [0.4, -0.425, z], shade(ST, 0.7));
      d.seg([-0.425, -0.4, z], [-0.425, 0.4, z], shade(STW, 0.7));
    }
    // 中柱
    d.box(-0.16, -0.16, 0.28, 0.16, 0.16, 0.95, shade(ST, 0.95), { line: shade(ST, 0.5), west: STW, top: TOP });
    for (let z = 0.4; z < 0.9; z += 0.14) d.seg([-0.17, -0.17, z], [0.17, -0.17, z], shade(ST, 0.75));
    // 灯室六角（贴图块 + 格栅）
    d.box(-0.34, -0.34, 0.95, 0.34, 0.34, 1.55, shade(ST, 1.02), { line: shade(ST, 0.48), west: STW, top: TOP });
    d.QS(-0.35, -0.22, 1.05, 0.22, 1.45, '#e8d090', shade(ST, 0.55));
    d.QS(-0.36, -0.16, 1.12, 0.16, 1.38, '#fff0b8');
    for (const x of [-0.14, 0, 0.14]) d.seg([x, -0.355, 1.05], [x, -0.355, 1.45], shade(ST, 0.55));
    for (const z of [1.18, 1.32]) d.seg([-0.22, -0.355, z], [0.22, -0.355, z], shade(ST, 0.55));
    // 宝顶屋顶
    d.box(-0.48, -0.48, 1.55, 0.48, 0.48, 1.68, shade(ST, 1.08), { line: shade(ST, 0.5), west: STW, top: shade(ST, 1.2) });
    d.box(-0.22, -0.22, 1.68, 0.22, 0.22, 1.88, shade(ST, 1.05), { line: shade(ST, 0.5), west: STW, top: TOP });
    d.box(-0.08, -0.08, 1.88, 0.08, 0.08, 2.12, GOLD, { line: shade(GOLD, 0.55), west: shade(GOLD, 0.8), top: '#e8c868' });
    // 隅石装饰
    for (const [x, y] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) {
      d.box(x - 0.08, y - 0.08, 0.28, x + 0.08, y + 0.08, 0.42, shade(ST, 0.9), { line: shade(ST, 0.5), west: STW, top: TOP });
    }
  }
  function paintPropShiteng(d) {
    const ST = '#8a8070', STW = '#6a6258';
    // 两条石腿
    d.box(-0.55, -0.22, 0, -0.32, 0.22, 0.38, ST, { line: shade(ST, 0.5), west: STW, top: shade(ST, 0.88) });
    d.box(0.32, -0.22, 0, 0.55, 0.22, 0.38, ST, { line: shade(ST, 0.5), west: STW, top: shade(ST, 0.88) });
    for (let z = 0.12; z < 0.36; z += 0.12) {
      d.seg([-0.54, -0.225, z], [-0.33, -0.225, z], shade(ST, 0.7));
      d.seg([0.33, -0.225, z], [0.54, -0.225, z], shade(ST, 0.7));
    }
    // 坐面厚板
    d.box(-0.72, -0.32, 0.38, 0.72, 0.32, 0.52, shade(ST, 1.02), { line: shade(ST, 0.48), west: STW, top: shade(ST, 1.15) });
    for (let x = -0.5; x < 0.55; x += 0.28) d.seg([x, -0.325, 0.52], [x, 0.325, 0.52], shade(ST, 0.78));
    d.seg([-0.7, -0.325, 0.45], [0.7, -0.325, 0.45], shade(ST, 0.72));
    // 端面装饰线
    d.QS(-0.73, -0.28, 0.4, 0.28, 0.5, shade(ST, 1.08), shade(ST, 0.55));
    d.QS(0.73, -0.28, 0.4, 0.28, 0.5, shade(STW, 1.05), shade(ST, 0.55));
  }
  function paintPropHuagang(d) {
    const CER = '#8a5a3a', CERW = '#6a4028', GLAZE = '#6a8a58', RIM = '#c8a878';
    // 缸身（略收腰）
    d.box(-0.38, -0.38, 0, 0.38, 0.38, 0.22, shade(CER, 0.9), { line: shade(CER, 0.5), west: CERW, top: shade(CER, 0.85) });
    d.box(-0.42, -0.42, 0.22, 0.42, 0.42, 0.72, CER, { line: shade(CER, 0.48), west: CERW, top: shade(CER, 0.95) });
    d.box(-0.36, -0.36, 0.72, 0.36, 0.36, 0.88, shade(CER, 1.05), { line: shade(CER, 0.5), west: CERW, top: RIM });
    // 釉带与浮雕环
    d.QS(-0.425, -0.35, 0.38, 0.35, 0.52, GLAZE, shade(CER, 0.55));
    d.QS(-0.425, -0.32, 0.58, 0.32, 0.66, shade(RIM, 0.95), shade(CER, 0.55));
    for (let z = 0.28; z < 0.7; z += 0.12) d.seg([-0.43, -0.43, z], [0.43, -0.43, z], shade(CER, 0.72));
    // 泥土 + 花叶簇
    d.box(-0.3, -0.3, 0.88, 0.3, 0.3, 0.96, '#4a3a28', { line: '#2a1a10', top: '#3a2a18', west: '#3a2a18' });
    for (const [dx, dy, zz, r, c1, c2] of [
      [-0.12, -0.08, 1.15, 0.18, '#6f9e46', '#466e30'],
      [0.14, 0.06, 1.28, 0.16, '#8ab850', '#5f8e3c'],
      [0.02, -0.14, 1.08, 0.14, '#c8322c', '#8a2010'],
      [-0.05, 0.12, 1.22, 0.12, '#e85a3a', '#a03018'],
      [0.18, -0.1, 1.18, 0.1, '#f0c850', '#a07020'],
    ]) {
      const g = d.g, p = d.P(dx, dy, zz);
      g.fillStyle = c1; g.beginPath(); g.ellipse(p[0], p[1], r * 28, r * 20, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = c2; g.beginPath(); g.ellipse(p[0] - 3, p[1] + 2, r * 14, r * 10, 0, 0, Math.PI * 2); g.fill();
    }
  }
  function paintPropLampPole(d) {
    const WOOD = '#5a2a1c', WOOD_D = '#2a0e08', ST = '#8a8070', STW = '#6a6258', GOLD = '#c8a040';
    // 石座
    d.box(-0.28, -0.28, 0, 0.28, 0.28, 0.36, ST, { line: shade(ST, 0.5), west: STW, top: shade(ST, 0.9) });
    for (let z = 0.12; z < 0.34; z += 0.12) d.seg([-0.26, -0.285, z], [0.26, -0.285, z], shade(ST, 0.7));
    // 木杆
    d.box(-0.09, -0.09, 0.36, 0.09, 0.09, 3.55, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.1) });
    for (let z = 0.7; z < 3.4; z += 0.35) d.seg([-0.1, -0.1, z], [0.1, -0.1, z], shade(WOOD, 1.15));
    // 横挑臂
    d.box(-0.08, -0.95, 3.25, 0.08, 0.12, 3.42, WOOD, { line: WOOD_D, west: shade(WOOD, 0.75), top: shade(WOOD, 1.08) });
    d.box(-0.12, -0.12, 3.5, 0.12, 0.12, 3.7, GOLD, { line: shade(GOLD, 0.55), west: shade(GOLD, 0.8), top: '#e8c868' });
    // 吊绳 + 挂灯（贴图块，非纯线）
    d.seg([0, -0.78, 3.28], [0, -0.78, 2.95], WOOD_D, 2);
    const g = d.g, c = d.P(0, -0.78, 2.55);
    g.fillStyle = '#5a2a1c'; g.fillRect(Math.round(c[0] - 2), Math.round(c[1] - 22), 4, 8);
    g.fillStyle = '#c8322c'; g.beginPath(); g.ellipse(c[0], c[1], 14, 18, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#e85840'; g.beginPath(); g.ellipse(c[0] - 3, c[1] - 2, 8, 12, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#c8a040'; g.fillRect(Math.round(c[0] - 12), Math.round(c[1] - 20), 24, 3);
    g.fillRect(Math.round(c[0] - 12), Math.round(c[1] + 16), 24, 3);
    g.fillStyle = '#c8322c'; g.fillRect(Math.round(c[0] - 1), Math.round(c[1] + 19), 2, 10);
  }


  /* ---- Site206：山墙 / 清水砖 / 墀头 / 墙帽（民居店铺侧墙；禁纯线稿） ---- */
  const QS_BRICK = '#9a9690', QS_BRICK_W = '#7e7a74', QS_MORTAR = '#b8b2a6';
  /** 硬山山墙面：密实清水砖 + 屋脊三角收分感（体积块，非描线） */
  function paintShangqiang(d, w, h) {
    d.QS(0, 0, 0, w, h, QS_BRICK, shade(QS_BRICK, 0.48));
    // dense running-bond brick courses
    for (let z = 0.12, k = 0; z < h - 0.02; z += 0.12, k++) {
      d.QS(-0.004, 0.01, z - 0.015, w - 0.01, z, shade(QS_MORTAR, 0.92));
      const ox = (k % 2) * 0.18;
      for (let x = ox; x < w - 0.03; x += 0.36) {
        d.seg([x, -0.006, z - 0.12], [x, -0.006, z], shade(QS_BRICK, 0.62));
        d.QS(-0.007, x + 0.04, z - 0.09, x + 0.18, z - 0.04, shade(QS_BRICK, k % 3 ? 0.94 : 1.1));
      }
    }
    // triangular gable taper hint (upper third denser coping bands)
    const peak = h * 0.72;
    for (let i = 0; i < 5; i++) {
      const t = i / 5, z0 = peak + t * (h - peak) * 0.85;
      const inset = t * w * 0.28;
      d.QS(-0.008, inset, z0, w - inset, Math.min(h - 0.02, z0 + 0.1), shade(QS_BRICK, 1.08), shade(QS_BRICK, 0.55));
    }
    // rain streaks / soot
    for (let i = 0; i < 5; i++) {
      const x = 0.15 + i * (w / 5.2);
      d.seg([x, -0.009, h * 0.12], [x, -0.009, h * (0.5 + (i % 2) * 0.18)], shade(QS_BRICK, 0.78));
    }
    // stone plinth strip
    d.QS(-0.01, 0, 0, w, 0.28, STONE, shade(STONE, 0.5));
    d.QS(-0.012, 0.05, 0.08, w - 0.05, 0.2, shade(STONE, 1.08));
  }
  /** 清水砖：比 wall_brick 更密更细的灰砖贴面 */
  function paintQingshuiBrick(d, w, h) {
    d.QS(0, 0, 0, w, h, QS_BRICK, shade(QS_BRICK, 0.5));
    for (let z = 0.11, k = 0; z < h - 0.01; z += 0.11, k++) {
      d.QS(-0.004, 0.01, z - 0.012, w - 0.01, z, shade(QS_MORTAR, 0.95));
      const ox = (k % 2) * 0.16;
      for (let x = ox; x < w - 0.02; x += 0.32) {
        d.seg([x, -0.006, z - 0.11], [x, -0.006, z], shade(QS_BRICK, 0.64));
        // brick face fleck (volume, not line-only)
        d.QS(-0.007, x + 0.03, z - 0.08, x + 0.14, z - 0.03, shade(QS_BRICK, (k + Math.floor(x * 10)) % 2 ? 0.92 : 1.08));
      }
    }
    for (let i = 0; i < 6; i++) {
      const x = 0.1 + (i * 0.41) % (w - 0.2), z = 0.15 + ((i * 0.53) % (h - 0.3));
      d.QS(-0.008, x, z, x + 0.08, z + 0.05, shade(QS_BRICK, i % 2 ? 0.85 : 1.12));
    }
  }
  /** 墀头：硬山端头砖叠涩饰（立体体积） */
  function paintChitou(d, o = {}) {
    const w = o.w || 0.7, dpth = o.d || 0.55, h = o.h || 0.95;
    const cap = '#a8a49c', body = QS_BRICK;
    // stepped corbel stack (dense boxes)
    d.box(0, 0, 0, w, dpth, h * 0.35, body, { line: shade(body, 0.45), west: QS_BRICK_W, top: shade(body, 1.08), south: shade(body, 0.98) });
    d.box(-0.04, -0.04, h * 0.32, w + 0.04, dpth + 0.04, h * 0.55, shade(body, 1.02), { line: shade(body, 0.48), west: QS_BRICK_W, top: shade(body, 1.12) });
    d.box(-0.08, -0.08, h * 0.52, w + 0.08, dpth + 0.08, h * 0.72, shade(body, 1.05), { line: shade(body, 0.5), west: QS_BRICK_W, top: shade(body, 1.15) });
    // ornamental brick tooth band
    for (let x = 0.05; x < w - 0.05; x += 0.12) {
      d.box(x, -0.02, h * 0.58, x + 0.08, 0.08, h * 0.68, shade(body, 0.88), { line: shade(body, 0.5), west: QS_BRICK_W, top: shade(body, 1.1) });
    }
    // stone/tile cap
    d.box(-0.1, -0.1, h * 0.7, w + 0.1, dpth + 0.1, h + 0.05, cap, { line: '#5a5650', west: shade(cap, 0.82), top: shade(cap, 1.18), south: shade(cap, 1.05) });
    d.QS(-0.12, 0.05, h + 0.02, w - 0.05, h + 0.06, shade(cap, 1.22));
    // side brick grit
    for (let z = 0.08; z < h * 0.5; z += 0.11) {
      d.seg([0.03, -0.01, z], [w - 0.03, -0.01, z], shade(body, 0.7));
      d.seg([-0.01, 0.05, z], [-0.01, dpth - 0.05, z], shade(QS_BRICK_W, 0.7));
    }
  }
  /** 墙帽：墙顶压顶石/瓦垄帽 */
  function paintWallCap(d, w, dpth) {
    const cap = '#a29e95', tile = '#6e6a64';
    d.box(0, 0, 0, w, dpth, 0.18, cap, { line: shade(cap, 0.5), west: shade(cap, 0.82), top: shade(cap, 1.12), south: shade(cap, 0.96) });
    // tile ridge bumps along length
    for (let x = 0.08; x < w - 0.05; x += 0.22) {
      d.box(x, -0.02, 0.14, x + 0.16, dpth + 0.02, 0.28, tile, { line: shade(tile, 0.55), west: shade(tile, 0.75), top: shade(tile, 1.15), south: shade(tile, 0.95) });
    }
    d.QS(-0.01, 0.06, 0.2, w - 0.06, 0.26, shade(cap, 1.2));
    // end stops
    d.box(-0.04, -0.04, 0.05, 0.1, dpth + 0.04, 0.32, shade(tile, 0.9), { line: shade(tile, 0.5), west: shade(tile, 0.7), top: shade(tile, 1.1) });
    d.box(w - 0.1, -0.04, 0.05, w + 0.04, dpth + 0.04, 0.32, shade(tile, 0.9), { line: shade(tile, 0.5), west: shade(tile, 0.7), top: shade(tile, 1.1) });
  }

  /* ---- Site207：栏杆寻杖 / 雀替 / 挂落 / 小柱（宋风木作；禁纯线稿） ---- */
  /** 寻杖栏杆段：望柱座 + 密排小柱 + 寻杖圆木顶 + 中枋（体积块，非描线） */
  function paintRailXunzhang(d, w) {
    const wood = WOOD, dark = shade(wood, 0.42), lite = shade(wood, 1.28), mid = shade(wood, 0.88);
    const red = RED_W, gold = shade(GOLD, 0.75);
    /* deck sill / 地栿 */
    d.QS(0, 0, 0, w, 0.14, shade(wood, 0.78), dark);
    d.QS(-0.004, 0.02, 0.04, w - 0.02, 0.12, lite);
    /* mid rail 中枋 */
    d.QS(-0.01, 0.02, 0.42, w - 0.02, 0.55, mid, dark);
    d.QS(-0.012, 0.04, 0.46, w - 0.04, 0.52, shade(wood, 1.12));
    for (let x = 0.1; x < w; x += 0.28) d.seg([x, -0.014, 0.44], [x, -0.014, 0.54], shade(wood, 0.65));
    /* dense baluster posts 望柱/小柱 */
    for (let x = 0.08; x < w - 0.05; x += 0.18) {
      d.QS(-0.008, x, 0.12, x + 0.07, 0.95, shade(wood, 0.95), dark);
      d.QS(-0.01, x + 0.015, 0.18, x + 0.055, 0.9, lite);
      /* grain flecks */
      d.QS(-0.011, x + 0.02, 0.35, x + 0.05, 0.42, shade(wood, 1.15));
      d.QS(-0.011, x + 0.02, 0.68, x + 0.05, 0.74, shade(wood, 0.8));
    }
    /* 寻杖 top rail — round timber feel via stacked strips + gold trim beads */
    d.QS(-0.02, 0, 0.92, w, 1.12, wood, dark);
    d.QS(-0.024, 0.02, 0.98, w - 0.02, 1.1, lite);
    d.QS(-0.026, 0.04, 1.02, w - 0.04, 1.08, shade(wood, 1.35));
    for (let x = 0.12; x < w; x += 0.22) {
      d.QS(-0.03, x - 0.03, 1.0, x + 0.03, 1.08, gold);
      d.QS(-0.032, x - 0.012, 1.02, x + 0.012, 1.06, shade(GOLD, 1.15));
    }
    /* end 望柱 caps */
    for (const x of [0.04, w - 0.14]) {
      d.QS(-0.015, x, 0.1, x + 0.1, 1.15, red, shade(red, 0.45));
      d.QS(-0.018, x + 0.015, 1.1, x + 0.085, 1.22, shade(red, 1.15));
      d.QS(-0.02, x + 0.03, 1.18, x + 0.07, 1.26, gold);
    }
  }
  /** 雀替：柱梁交角如意卷草/云头立体饰（贴图体积，非线稿） */
  function paintOrnamentQueti(d) {
    const c = '#7a4a2c', g1 = CAI_G, g2 = CAI_B, L = shade(c, 0.48);
    /* seat against column */
    d.box(0, -0.08, 0.35, 0.22, 0.28, 0.72, c, { line: L, south: shade(c, 1.05), top: shade(c, 1.15), west: shade(c, 0.85) });
    /* curved brace body stepping out */
    d.box(0.05, -0.14, 0.15, 0.55, 0.22, 0.48, c, { line: L, south: g1, top: shade(c, 1.12) });
    d.box(0.18, -0.18, 0.02, 0.85, 0.16, 0.32, c, { line: L, south: g2, top: shade(c, 1.18) });
    /* cloud / ruyi head tip */
    d.box(0.7, -0.2, 0.0, 1.05, 0.12, 0.22, c, { line: L, south: shade(c, 1.2), top: shade(c, 1.25) });
    d.QS(-0.21, 0.78, 0.06, 1.0, 0.18, shade(GOLD, 0.8));
    d.QS(-0.22, 0.85, 0.1, 0.96, 0.16, shade(GOLD, 1.15));
    /* carved volute beads */
    for (let i = 0; i < 5; i++) {
      const x = 0.25 + i * 0.12, z = 0.2 + (i % 2) * 0.08;
      d.QS(-0.16, x, z, x + 0.08, z + 0.08, shade(g1, 1.1 + (i % 2) * 0.1));
      d.QS(-0.165, x + 0.02, z + 0.02, x + 0.06, z + 0.06, shade(GOLD, 0.7));
    }
    /* upper tenon into beam */
    d.box(0.02, -0.1, 0.65, 0.35, 0.26, 0.78, c, { line: L, south: g1, top: shade(c, 1.2) });
    d.QS(-0.11, 0.05, 0.7, 0.32, 0.76, GOLD);
    /* underside shadow volume */
    d.QS(-0.05, 0.15, 0.05, 0.7, 0.12, shade(c, 0.7));
  }
  /** 挂落：柱间挂落透空棂格 + 花心 + 边框（密实贴图） */
  function paintHangingGualuo(d, w, h) {
    const fr = RED_W, paper = '#3a2a20', dark = shade(fr, 0.42), lite = shade(fr, 1.2);
    /* outer frame */
    d.QS(0, 0, 0, w, h, fr, dark);
    d.QS(-0.004, 0.04, 0.04, w - 0.04, h - 0.04, shade(fr, 0.92), dark);
    /* dark openwork ground */
    d.QS(-0.008, 0.08, 0.08, w - 0.08, h - 0.08, paper, shade(fr, 0.55));
    /* dense lattice / 万字节奏 */
    const step = 0.14;
    for (let x = 0.12; x < w - 0.1; x += step) {
      d.QS(-0.01, x, 0.1, x + 0.035, h - 0.1, lite);
      d.QS(-0.011, x + 0.008, 0.14, x + 0.027, h - 0.14, shade(fr, 1.05));
    }
    for (let z = 0.14; z < h - 0.1; z += step) {
      d.QS(-0.01, 0.1, z, w - 0.1, z + 0.035, lite);
    }
    /* diamond / flower centers */
    for (let xi = 0; xi < 3; xi++) {
      for (let zi = 0; zi < 2; zi++) {
        const cx = w * (0.22 + xi * 0.28), cz = h * (0.28 + zi * 0.38);
        d.QS(-0.014, cx - 0.08, cz - 0.08, cx + 0.08, cz + 0.08, shade(CAI_G, 1.05), shade(fr, 0.5));
        d.QS(-0.016, cx - 0.04, cz - 0.04, cx + 0.04, cz + 0.04, shade(GOLD, 0.85));
        d.QS(-0.017, cx - 0.015, cz - 0.015, cx + 0.015, cz + 0.015, shade(GOLD, 1.2));
      }
    }
    /* bottom apron scallops */
    for (let x = 0.15; x < w - 0.1; x += 0.2) {
      const q = d.P(x, -0.02, -0.02);
      const px = Math.round(q[0]), py = Math.round(q[1]);
      d.g.fillStyle = dark;
      d.g.beginPath(); d.g.moveTo(px - 4, py); d.g.lineTo(px + 4, py); d.g.lineTo(px, py + 6); d.g.closePath(); d.g.fill();
      d.g.fillStyle = lite;
      d.g.beginPath(); d.g.moveTo(px - 2, py); d.g.lineTo(px + 2, py); d.g.lineTo(px, py + 4); d.g.closePath(); d.g.fill();
    }
    /* gold edge beads */
    for (let x = 0.1; x < w; x += 0.24) {
      d.QS(-0.018, x - 0.02, h - 0.06, x + 0.02, h - 0.02, shade(GOLD, 0.7));
      d.QS(-0.018, x - 0.02, 0.02, x + 0.02, 0.06, shade(GOLD, 0.7));
    }
  }
  /** 小柱/望柱：栏杆端柱 + 莲瓣柱头（立体） */
  function paintBalusterXiaozhu(d) {
    const wood = WOOD, dark = shade(wood, 0.45), lite = shade(wood, 1.25), red = RED;
    /* base stone plinth */
    d.box(-0.14, -0.14, 0, 0.14, 0.14, 0.18, STONE, { line: shade(STONE, 0.5), top: shade(STONE, 1.12), west: shade(STONE, 0.82) });
    /* shaft */
    d.box(-0.09, -0.09, 0.16, 0.09, 0.09, 1.05, red, { line: shade(red, 0.45), south: shade(red, 1.05), top: shade(red, 1.15), west: shade(red, 0.85) });
    for (let z = 0.25; z < 1.0; z += 0.18) {
      d.QS(-0.1, -0.06, z, 0.06, z + 0.04, shade(red, 1.18));
      d.QS(-0.1, -0.04, z + 0.06, 0.04, z + 0.09, shade(red, 0.8));
    }
    /* neck ring */
    d.box(-0.12, -0.12, 1.0, 0.12, 0.12, 1.12, wood, { line: dark, top: lite, south: shade(wood, 1.05) });
    d.QS(-0.13, -0.08, 1.04, 0.08, 1.1, shade(GOLD, 0.7));
    /* lotus / 莲瓣 cap */
    d.box(-0.16, -0.16, 1.1, 0.16, 0.16, 1.22, wood, { line: dark, top: shade(wood, 1.3), south: lite });
    for (let a = 0; a < 8; a++) {
      const ang = a * Math.PI / 4;
      const dx = Math.cos(ang) * 0.1, dy = Math.sin(ang) * 0.06;
      d.QS(-0.17, dx - 0.03, 1.14, dx + 0.03, 1.2, shade(GOLD, 0.85));
    }
    /* finial bead */
    d.box(-0.05, -0.05, 1.2, 0.05, 0.05, 1.38, shade(GOLD, 0.95), { line: shade(GOLD, 0.55), top: shade(GOLD, 1.25), south: shade(GOLD, 1.1) });
    d.QS(-0.06, -0.03, 1.32, 0.03, 1.36, shade(GOLD, 1.3));
  }

  /* ---- Site208：彩绘梁枋 / 额枋带 / 斗拱色块 / 檐板（望川楼·茶坊·店铺檐下；禁纯线稿；青绿朱红克制） ---- */
  const CAIHUA_RED = '#a8342a', CAIHUA_CREAM = '#e8d6a0', CAIHUA_WOOD = '#6a4428';
  /** 梁底/额枋彩绘单元：密实青绿面板 + 朱红点缀如意（体积块） */
  function paintBeamEfang(d, w) {
    const b = CAI_B, g = CAI_G, z0 = 0, z1 = 0.42;
    d.box(0, -0.06, z0, w, 0.22, z1, b, { line: shade(b, 0.45), west: shade(g, 0.82), top: shade(b, 0.85), south: shade(b, 0.98) });
    // dense panel courses
    for (let x = 0.04; x < w - 0.04; x += 0.55) {
      const x1 = Math.min(w - 0.04, x + 0.48);
      d.QS(-0.05, x, z0 + 0.05, x1, z1 - 0.05, g, shade(g, 0.55));
      d.QS(-0.052, x + 0.06, z0 + 0.1, x1 - 0.06, z1 - 0.1, shade(g, 1.08));
      // 如意中心小块 + 朱红点缀
      const m = (x + x1) / 2, zh = (z0 + z1) / 2;
      d.QS(-0.054, m - 0.1, zh - 0.07, m + 0.1, zh + 0.07, CAIHUA_CREAM, shade(GOLD, 0.55));
      d.QS(-0.056, m - 0.04, zh - 0.03, m + 0.04, zh + 0.03, CAIHUA_RED);
      d.QS(-0.057, m - 0.018, zh - 0.015, m + 0.018, zh + 0.015, shade(GOLD, 1.15));
    }
    // gold edge rails
    d.QS(-0.048, 0.02, z1 - 0.035, w - 0.02, z1, GOLD);
    d.QS(-0.048, 0.02, z0, w - 0.02, z0 + 0.035, shade(GOLD, 0.85));
    // wood soffit strip under beam
    d.box(0.02, -0.02, z0 - 0.06, w - 0.02, 0.18, z0, CAIHUA_WOOD, { line: shade(CAIHUA_WOOD, 0.5), top: shade(CAIHUA_WOOD, 1.1), south: shade(CAIHUA_WOOD, 0.95) });
  }
  /** 彩画水平色带：青绿叠层 + 朱红分隔（檐下密实色块） */
  function paintCaihuaBand(d, w) {
    const z0 = 0, z1 = 0.28;
    d.box(0, -0.05, z0, w, 0.18, z1, CAI_G, { line: shade(CAI_G, 0.48), west: shade(CAI_B, 0.85), top: shade(CAI_G, 1.1), south: shade(CAI_G, 0.98) });
    // three-band Song palette
    d.QS(-0.05, 0.02, z0 + 0.02, w - 0.02, z0 + 0.09, CAI_B, shade(CAI_B, 0.55));
    d.QS(-0.05, 0.02, z0 + 0.1, w - 0.02, z0 + 0.18, CAI_G, shade(CAI_G, 0.55));
    d.QS(-0.05, 0.02, z0 + 0.19, w - 0.02, z1 - 0.02, shade(CAI_B, 0.92), shade(CAI_B, 0.5));
    // vermillion divider ticks (dense, not neon)
    for (let x = 0.12; x < w - 0.08; x += 0.42) {
      d.QS(-0.052, x, z0 + 0.04, x + 0.08, z1 - 0.04, CAIHUA_RED);
      d.QS(-0.053, x + 0.02, z0 + 0.08, x + 0.06, z0 + 0.16, GOLD);
    }
    d.QS(-0.048, 0.01, z1 - 0.03, w - 0.01, z1, shade(GOLD, 0.9));
  }
  /** 斗拱色块：坐斗/栱身青绿面 + 朱红散斗（立体体积，非描线） */
  function paintDougongBlock(d, o = {}) {
    const s = (o && o.large) ? 1.25 : 1;
    const wood = CAIHUA_WOOD, g1 = CAI_G, g2 = CAI_B, L = shade(wood, 0.48);
    // 坐斗 body
    d.box(-0.2 * s, -0.08, 0, 0.2 * s, 0.3, 0.18 * s, wood, { line: L, south: g1, top: shade(wood, 1.12), west: shade(wood, 0.85) });
    d.QS(-0.09, -0.12 * s, 0.1 * s, 0.12 * s, 0.16 * s, GOLD);
    // 华栱
    d.box(-0.52 * s, -0.16, 0.16 * s, 0.52 * s, 0.26, 0.3 * s, wood, { line: L, south: g2, top: shade(wood, 1.08) });
    d.QS(-0.17, -0.45 * s, 0.18 * s, 0.45 * s, 0.22 * s, shade(g1, 1.12));
    // 散斗 trio with 朱红 face
    for (const k of [-1, 0, 1]) {
      d.box(k * 0.42 * s - 0.1 * s, -0.18 - (k === 0 ? 0.22 * s : 0), 0.28 * s, k * 0.42 * s + 0.1 * s, 0.2, 0.42 * s, wood, { line: L, south: g1, top: shade(wood, 1.1) });
      d.QS(-0.19 - (k === 0 ? 0.22 * s : 0), k * 0.42 * s - 0.07 * s, 0.34 * s, k * 0.42 * s + 0.07 * s, 0.4 * s, CAIHUA_RED);
      d.QS(-0.2 - (k === 0 ? 0.22 * s : 0), k * 0.42 * s - 0.035 * s, 0.36 * s, k * 0.42 * s + 0.035 * s, 0.385 * s, GOLD);
    }
    // upper 枋
    d.box(-0.72 * s, -0.22, 0.4 * s, 0.72 * s, 0.2, 0.52 * s, wood, { line: L, south: g2, top: shade(wood, 1.15) });
    d.QS(-0.23, -0.65 * s, 0.46 * s, 0.65 * s, 0.52 * s, GOLD);
    // side caihua panels
    d.QS(-0.24, -0.35 * s, 0.42 * s, -0.12 * s, 0.5 * s, g1);
    d.QS(-0.24, 0.12 * s, 0.42 * s, 0.35 * s, 0.5 * s, g1);
  }
  /** 檐板/挑檐枋：木色底 + 青绿边 + 朱红端头 */
  function paintEaveBoard(d, w) {
    const z0 = 0, z1 = 0.32;
    d.box(0, -0.08, z0, w, 0.2, z1, CAIHUA_WOOD, { line: shade(CAIHUA_WOOD, 0.5), west: shade(CAIHUA_WOOD, 0.8), top: shade(CAIHUA_WOOD, 1.12), south: shade(CAIHUA_WOOD, 0.96) });
    // grain flecks (volume)
    for (let x = 0.08; x < w - 0.08; x += 0.28) {
      d.QS(-0.09, x, z0 + 0.06, x + 0.18, z1 - 0.06, shade(CAIHUA_WOOD, (Math.floor(x * 10) % 2) ? 0.9 : 1.08));
    }
    // 青绿边条
    d.QS(-0.095, 0.04, z1 - 0.08, w - 0.04, z1 - 0.02, CAI_G, shade(CAI_G, 0.55));
    d.QS(-0.095, 0.04, z0 + 0.02, w - 0.04, z0 + 0.07, CAI_B, shade(CAI_B, 0.55));
    // 朱红端头块
    d.box(0.02, -0.1, z0 + 0.04, 0.22, 0.05, z1 - 0.04, CAIHUA_RED, { line: shade(CAIHUA_RED, 0.55), top: shade(CAIHUA_RED, 1.1), south: shade(CAIHUA_RED, 0.95) });
    d.box(w - 0.22, -0.1, z0 + 0.04, w - 0.02, 0.05, z1 - 0.04, CAIHUA_RED, { line: shade(CAIHUA_RED, 0.55), top: shade(CAIHUA_RED, 1.1), south: shade(CAIHUA_RED, 0.95) });
    d.QS(-0.1, 0.06, z1 - 0.04, w - 0.06, z1, shade(GOLD, 0.85));
  }



  /* ---- Site209：门钉 / 铺首衔环 / 门槛 / 抱鼓石（宋风大门；禁纯线稿） ---- */
  /** 门钉面板：朱漆板门 + 密排铜钉（体积块，非描线） */
  function paintDoorMending(d, w, h) {
    const fr = '#6a1e16', dark = shade(fr, 0.42), lite = shade(fr, 1.18), stud = GOLD, studD = shade(GOLD, 0.55);
    d.QS(0, 0, 0, w, h, fr, dark);
    /* vertical planks denser */
    for (let x = 0.04; x < w - 0.03; x += 0.13) {
      d.QS(-0.004, x, 0.03, x + 0.115, h - 0.03, shade(fr, 0.92 + ((x * 17) % 3) * 0.05), shade(fr, 0.55));
      d.QS(-0.006, x + 0.02, 0.06, x + 0.04, h - 0.06, lite);
    }
    /* horizontal battens */
    for (const z of [0.14, h * 0.33, h * 0.66, h - 0.16]) {
      d.QS(-0.01, 0.03, z - 0.045, w - 0.03, z + 0.045, shade(fr, 0.72), dark);
      d.QS(-0.012, 0.05, z - 0.02, w - 0.05, z + 0.02, shade(fr, 1.05));
    }
    /* dense 门钉 grid 7x9 */
    const cols = 7, rows = 9;
    for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
      const x = 0.12 + col * ((w - 0.24) / (cols - 1));
      const z = 0.22 + row * ((h - 0.44) / (rows - 1));
      d.QS(-0.014, x - 0.035, z - 0.035, x + 0.035, z + 0.035, studD);
      d.QS(-0.016, x - 0.022, z - 0.022, x + 0.022, z + 0.022, stud);
      d.QS(-0.018, x - 0.01, z - 0.01, x + 0.01, z + 0.01, shade(stud, 1.35));
    }
    /* edge rail beads */
    for (let z = 0.18; z < h - 0.1; z += 0.22) {
      d.QS(-0.02, 0.02, z, 0.08, z + 0.06, shade(stud, 0.85));
      d.QS(-0.02, w - 0.08, z, w - 0.02, z + 0.06, shade(stud, 0.85));
    }
  }
  /** 铺首衔环：兽面铺首 + 圆环（立体贴图） */
  function paintKnockerPushou(d) {
    const br = '#8a6a28', dark = shade(br, 0.4), gold = GOLD, red = '#5a1810';
    /* back plate */
    d.box(-0.28, -0.08, -0.05, 0.28, 0.12, 0.55, shade(br, 0.85), { line: dark, south: shade(br, 1.05), top: shade(br, 1.2), west: shade(br, 0.75) });
    d.QS(-0.09, -0.22, 0.02, 0.22, 0.5, shade(gold, 0.7));
    /* beast face forehead / brows */
    d.box(-0.22, -0.1, 0.32, 0.22, 0.1, 0.52, shade(br, 1.05), { line: dark, south: shade(gold, 0.9), top: shade(gold, 1.15) });
    d.QS(-0.11, -0.12, 0.4, 0.12, 0.48, shade(gold, 1.25));
    /* eyes */
    for (const sx of [-1, 1]) {
      d.QS(-0.12, sx * 0.12 - 0.06, 0.28, sx * 0.12 + 0.06, 0.38, shade(red, 0.9), dark);
      d.QS(-0.13, sx * 0.12 - 0.03, 0.3, sx * 0.12 + 0.03, 0.36, shade(gold, 1.2));
    }
    /* snout / nose boss */
    d.box(-0.1, -0.12, 0.12, 0.1, 0.1, 0.3, shade(br, 1.1), { line: dark, south: shade(gold, 0.95), top: shade(gold, 1.2) });
    d.QS(-0.13, -0.05, 0.18, 0.05, 0.26, shade(gold, 1.3));
    /* fangs */
    for (const sx of [-1, 1]) {
      d.box(sx * 0.12 - 0.03, -0.1, 0.02, sx * 0.12 + 0.03, 0.06, 0.14, shade(gold, 1.05), { line: dark, south: shade(gold, 1.2) });
    }
    /* ring 衔环 — stacked torus feel */
    d.box(-0.18, -0.14, -0.22, 0.18, 0.08, 0.08, shade(gold, 0.85), { line: dark, south: shade(gold, 1.05), top: shade(gold, 1.15) });
    d.QS(-0.15, -0.14, -0.18, 0.14, 0.02, shade(gold, 1.2));
    d.QS(-0.16, -0.1, -0.14, 0.1, -0.04, shade(gold, 0.7));
    /* ring lower arc beads */
    for (let i = 0; i < 7; i++) {
      const t = i / 6, x = -0.14 + t * 0.28, z = -0.2 + Math.sin(t * Math.PI) * 0.12;
      d.QS(-0.15, x - 0.025, z - 0.025, x + 0.025, z + 0.025, shade(gold, 0.95 + (i % 2) * 0.15));
    }
    /* side ear flanges */
    for (const sx of [-1, 1]) {
      d.box(sx * 0.22 - 0.05, -0.06, 0.15, sx * 0.22 + 0.05, 0.1, 0.42, shade(br, 0.95), { line: dark, south: shade(gold, 0.8), top: shade(gold, 1.1) });
    }
  }
  /** 门槛：石质门槛 + 木槛面 + 铜角包（密实） */
  function paintSillMenkan(d, w) {
    const stone = STONE, wood = WOOD, dark = shade(stone, 0.48), lite = shade(stone, 1.15), gold = shade(GOLD, 0.8);
    /* stone body */
    d.box(0, -0.18, 0, w, 0.22, 0.28, stone, { line: dark, south: shade(stone, 1.05), top: lite, west: shade(stone, 0.82) });
    d.QS(-0.01, 0.04, 0.04, w - 0.04, 0.22, shade(stone, 1.12));
    /* wood tread strip */
    d.QS(-0.02, 0.06, 0.18, w - 0.06, 0.26, shade(wood, 0.95), shade(wood, 0.5));
    d.QS(-0.022, 0.1, 0.2, w - 0.1, 0.24, shade(wood, 1.18));
    /* joint seams */
    for (let x = 0.2; x < w; x += 0.28) {
      d.seg([x, -0.19, 0.02], [x, -0.19, 0.26], shade(stone, 0.65));
      d.QS(-0.015, x - 0.02, 0.08, x + 0.02, 0.14, shade(stone, 0.85));
    }
    /* brass corner wraps */
    for (const x of [0.02, w - 0.18]) {
      d.QS(-0.025, x, 0.02, x + 0.16, 0.26, gold);
      d.QS(-0.027, x + 0.03, 0.06, x + 0.13, 0.22, shade(GOLD, 1.2));
      d.QS(-0.028, x + 0.06, 0.1, x + 0.1, 0.18, shade(GOLD, 1.35));
    }
    /* front lip shadow */
    d.QS(-0.005, 0, 0, w, 0.04, shade(stone, 0.7));
  }
  /** 抱鼓石：门枕石鼓面 + 须弥座 + 兽纹（立体） */
  function paintStoneBaogu(d) {
    const stone = STONE, dark = shade(stone, 0.45), lite = shade(stone, 1.18), gold = shade(GOLD, 0.75);
    /* 须弥座 base */
    d.box(-0.42, -0.32, 0, 0.42, 0.32, 0.28, stone, { line: dark, south: shade(stone, 1.02), top: lite, west: shade(stone, 0.8) });
    d.QS(-0.02, -0.35, 0.08, 0.35, 0.22, shade(stone, 1.12));
    /* waist ring */
    d.box(-0.36, -0.28, 0.24, 0.36, 0.28, 0.38, shade(stone, 0.92), { line: dark, south: shade(stone, 1.08), top: lite });
    d.QS(-0.03, -0.3, 0.28, 0.3, 0.34, gold);
    /* drum body */
    d.box(-0.38, -0.3, 0.36, 0.38, 0.3, 1.05, stone, { line: dark, south: shade(stone, 1.05), top: shade(stone, 1.2), west: shade(stone, 0.85) });
    /* concentric drum face rings */
    for (const r of [0.32, 0.22, 0.12]) {
      d.QS(-0.32, -r, 0.55 - r * 0.15, r, 0.85 + r * 0.1, shade(stone, 1.08 + (0.32 - r)));
    }
    d.QS(-0.33, -0.08, 0.62, 0.08, 0.78, shade(stone, 1.25));
    d.QS(-0.34, -0.035, 0.66, 0.035, 0.74, gold);
    /* side bosses / 兽纹 beads */
    for (let i = 0; i < 8; i++) {
      const ang = i * Math.PI / 4;
      const dx = Math.cos(ang) * 0.28, dz = 0.7 + Math.sin(ang) * 0.22;
      d.QS(-0.31, dx - 0.04, dz - 0.04, dx + 0.04, dz + 0.04, shade(stone, 1.15));
      if (i % 2 === 0) d.QS(-0.32, dx - 0.02, dz - 0.02, dx + 0.02, dz + 0.02, gold);
    }
    /* top lotus / 莲瓣 cap */
    d.box(-0.34, -0.26, 1.0, 0.34, 0.26, 1.18, stone, { line: dark, south: lite, top: shade(stone, 1.28) });
    for (let a = 0; a < 6; a++) {
      const x = -0.26 + a * 0.1;
      d.QS(-0.27, x, 1.05, x + 0.07, 1.14, shade(stone, 1.2));
    }
    d.QS(-0.28, -0.12, 1.1, 0.12, 1.16, gold);
    /* pillow stone stub behind */
    d.box(-0.2, 0.2, 0.2, 0.2, 0.45, 0.55, shade(stone, 0.9), { line: dark, south: shade(stone, 1.0), top: lite });
  }


  /* ---- Site210：旗幡 / 帷幔 / 流苏 / 檐下挂饰（御街·酒楼·茶坊·南广场；与幌子/灯笼互补；禁纯线稿；色调克制） ---- */
  const QIFAN_RED = '#a8342a', QIFAN_CREAM = '#e8d6a0', QIFAN_TEAL = '#3a6a58', QIFAN_INK = '#2a3a48', QIFAN_WOOD = '#6a4428';
  /** 旗幡：燕尾锦幡体积（非店招幌子文字布）；密实布面叠层 + 金边 */
  function paintBannerQifan(d, o = {}) {
    const L = 1.55, w = 0.48;
    const col = o.col || QIFAN_RED, alt = o.alt || QIFAN_CREAM;
    // pole tip / hanging ring (volume)
    d.box(-0.04, -0.05, -0.02, 0.04, 0.05, 0.08, QIFAN_WOOD, { line: shade(QIFAN_WOOD, 0.5), top: shade(QIFAN_WOOD, 1.12) });
    d.QS(-0.06, -0.06, 0.02, 0.06, 0.07, GOLD);
    // cloth body (dense face + west depth)
    d.box(-w / 2, -0.04, -L + 0.15, w / 2, 0.06, 0.02, col, { line: shade(col, 0.48), west: shade(col, 0.78), top: shade(col, 1.08), south: shade(col, 0.96) });
    // weave courses
    for (let i = 0; i < 7; i++) {
      const z0 = -0.08 - i * (L - 0.35) / 6;
      d.QS(-0.05, -w / 2 + 0.04, z0, w / 2 - 0.04, z0 - 0.06, i % 2 ? shade(col, 1.1) : shade(col, 0.88));
    }
    // cream diagonal panel + teal tip band
    d.QS(-0.052, -w / 2 + 0.08, -0.35, w / 2 - 0.08, -0.55, alt, shade(alt, 0.55));
    d.QS(-0.054, -w / 2 + 0.1, -0.4, w / 2 - 0.1, -0.5, shade(GOLD, 0.95));
    d.QS(-0.052, -w / 2 + 0.06, -L + 0.35, w / 2 - 0.06, -L + 0.5, QIFAN_TEAL, shade(QIFAN_TEAL, 0.5));
    // swallowtail fork (volume wedges)
    d.box(-w / 2, -0.03, -L, -0.04, 0.04, -L + 0.22, shade(col, 0.92), { line: shade(col, 0.45), south: shade(col, 0.9) });
    d.box(0.04, -0.03, -L, w / 2, 0.04, -L + 0.22, shade(col, 0.92), { line: shade(col, 0.45), south: shade(col, 0.9) });
    d.QS(-0.055, -w / 2 + 0.02, -L - 0.02, -0.06, -L + 0.12, shade(col, 0.75));
    d.QS(-0.055, 0.06, -L - 0.02, w / 2 - 0.02, -L + 0.12, shade(col, 0.75));
    // gold piping + tip beads
    d.QS(-0.048, -w / 2 + 0.02, -0.02, -w / 2 + 0.06, -L + 0.25, shade(GOLD, 0.85));
    d.QS(-0.048, w / 2 - 0.06, -0.02, w / 2 - 0.02, -L + 0.25, shade(GOLD, 0.85));
    for (const sx of [-0.18, 0.18]) {
      d.QS(-0.056, sx - 0.04, -L - 0.08, sx + 0.04, -L - 0.02, GOLD);
      d.QS(-0.058, sx - 0.02, -L - 0.06, sx + 0.02, -L - 0.03, shade(GOLD, 1.2));
    }
  }
  /** 帷幔：檐下软幔叠层（褶皱体积块，非描线） */
  function paintCurtainWeiman(d, w) {
    const z0 = 0, z1 = 0.95;
    const cloth = '#c8a878', deep = '#8a6848', cream = QIFAN_CREAM;
    d.box(0, -0.06, z0 - 0.05, w, 0.14, z0 + 0.08, QIFAN_WOOD, { line: shade(QIFAN_WOOD, 0.5), top: shade(QIFAN_WOOD, 1.1), south: shade(QIFAN_WOOD, 0.95) });
    d.QS(-0.07, 0.02, z0 - 0.02, w - 0.02, z0 + 0.06, shade(GOLD, 0.9));
    // hanging folds as vertical volumes
    const n = Math.max(4, Math.round(w / 0.42));
    for (let i = 0; i < n; i++) {
      const x0 = 0.04 + i * (w - 0.08) / n;
      const x1 = x0 + (w - 0.08) / n - 0.04;
      const mid = (x0 + x1) / 2;
      const col = i % 2 ? cloth : shade(cloth, 0.9);
      d.box(x0, -0.08, z0 + 0.05, x1, 0.1, z1 - 0.08, col, { line: shade(deep, 0.55), west: shade(col, 0.78), top: shade(col, 1.05), south: shade(col, 0.96) });
      // fold ridge highlight
      d.QS(-0.09, mid - 0.04, z0 + 0.1, mid + 0.04, z1 - 0.12, shade(cream, 0.95));
      d.QS(-0.092, mid - 0.02, z0 + 0.18, mid + 0.02, z1 - 0.2, shade(cloth, 1.15));
      // bottom scallop volume
      d.box(x0 + 0.02, -0.09, z1 - 0.14, x1 - 0.02, 0.06, z1, shade(deep, 1.05), { line: shade(deep, 0.5), south: shade(cloth, 0.85), top: shade(cream, 0.9) });
      d.QS(-0.095, mid - 0.06, z1 - 0.06, mid + 0.06, z1 + 0.02, QIFAN_RED);
      d.QS(-0.096, mid - 0.03, z1 - 0.04, mid + 0.03, z1, GOLD);
    }
    // teal header band
    d.QS(-0.085, 0.04, z0 + 0.08, w - 0.04, z0 + 0.18, QIFAN_TEAL, shade(QIFAN_TEAL, 0.5));
    d.QS(-0.086, 0.08, z0 + 0.1, w - 0.08, z0 + 0.15, shade(GOLD, 0.9));
  }
  /** 流苏：密排穗球/穗绳体积（檐下点缀，非幌子底穗） */
  function paintTasselLiusu(d) {
    const cord = QIFAN_WOOD, ball = QIFAN_RED, tip = QIFAN_CREAM;
    d.box(-0.12, -0.05, 0.85, 0.12, 0.05, 0.95, cord, { line: shade(cord, 0.5), top: shade(GOLD, 0.95) });
    d.QS(-0.06, -0.1, 0.88, 0.1, 0.94, GOLD);
    // three hanging strands
    for (const sx of [-0.14, 0, 0.14]) {
      d.box(sx - 0.025, -0.04, 0.08, sx + 0.025, 0.04, 0.88, shade(cord, 0.92), { line: shade(cord, 0.5), south: shade(cord, 0.85) });
      // bead stack
      for (let k = 0; k < 4; k++) {
        const z = 0.72 - k * 0.12;
        const c = k % 2 ? ball : tip;
        d.box(sx - 0.05, -0.05, z, sx + 0.05, 0.05, z + 0.08, c, { line: shade(c, 0.5), top: shade(c, 1.15), south: shade(c, 0.95) });
        d.QS(-0.055, sx - 0.025, z + 0.02, sx + 0.025, z + 0.06, shade(GOLD, 1.1));
      }
      // fringe brush volume at tip
      d.box(sx - 0.07, -0.04, -0.02, sx + 0.07, 0.04, 0.12, shade(ball, 0.9), { line: shade(ball, 0.48), south: shade(ball, 0.85), top: shade(tip, 0.95) });
      for (let f = -2; f <= 2; f++) {
        d.QS(-0.05, sx + f * 0.022 - 0.012, -0.12, sx + f * 0.022 + 0.012, -0.02, shade(tip, 0.9 + (f & 1) * 0.1));
      }
      d.QS(-0.052, sx - 0.03, -0.08, sx + 0.03, -0.04, GOLD);
    }
  }
  /** 檐下挂饰：木环+玉璧/铃铎体积（非灯笼） */
  function paintHangOrnament(d) {
    const wood = QIFAN_WOOD, jade = '#7a9a78', bronze = '#8a6a3a';
    // hanging cord + ring
    d.box(-0.02, -0.02, 0.95, 0.02, 0.02, 1.15, wood, { line: shade(wood, 0.5) });
    d.box(-0.1, -0.05, 0.88, 0.1, 0.05, 0.98, bronze, { line: shade(bronze, 0.5), top: shade(GOLD, 0.9), south: shade(bronze, 0.95) });
    d.QS(-0.06, -0.06, 0.9, 0.06, 0.96, shade(GOLD, 1.15));
    // jade bi disc (volume ring via stacked boxes)
    d.box(-0.16, -0.06, 0.55, 0.16, 0.06, 0.85, jade, { line: shade(jade, 0.5), west: shade(jade, 0.78), top: shade(jade, 1.12), south: shade(jade, 0.96) });
    d.QS(-0.07, -0.08, 0.62, 0.08, 0.78, shade(jade, 1.15));
    d.box(-0.05, -0.04, 0.64, 0.05, 0.04, 0.76, shade(jade, 0.75), { line: shade(jade, 0.45), top: shade('#c8d8c0', 0.95) });
    // lower bronze bell / pendant
    d.box(-0.1, -0.05, 0.28, 0.1, 0.05, 0.55, bronze, { line: shade(bronze, 0.5), south: shade(bronze, 0.92), top: shade(bronze, 1.1) });
    d.QS(-0.06, -0.07, 0.4, 0.07, 0.5, shade(GOLD, 0.95));
    d.box(-0.07, -0.04, 0.12, 0.07, 0.04, 0.3, shade(bronze, 0.85), { line: shade(bronze, 0.48), south: shade(QIFAN_RED, 0.9), top: shade(bronze, 1.05) });
    d.QS(-0.055, -0.04, 0.18, 0.04, 0.26, GOLD);
    // tip bead
    d.box(-0.04, -0.03, 0.02, 0.04, 0.03, 0.12, QIFAN_RED, { line: shade(QIFAN_RED, 0.5), top: shade(QIFAN_RED, 1.12) });
    d.QS(-0.05, -0.02, 0.05, 0.02, 0.1, shade(GOLD, 1.15));
  }

  /* ---- Site211：台基 / 阶条石 / 垂带 / 踏垛（宋风石作；禁纯线稿；与铺地 kitbash 分面） ---- */
  /** 台基：须弥座式密实石层（圭脚·下枋·束腰·上枋·压面） */
  function paintBaseTaiji(d, w, h) {
    const stone = STONE, dark = shade(stone, 0.45), lite = shade(stone, 1.18), mid = shade(stone, 0.92);
    const gold = shade(GOLD, 0.55);
    /* 圭脚 plinth */
    d.box(0, -0.22, 0, w, 0.22, h * 0.18, stone, { line: dark, south: shade(stone, 1.02), top: lite, west: shade(stone, 0.8) });
    d.QS(-0.01, 0.04, 0.02, w - 0.04, h * 0.14, shade(stone, 1.1));
    /* 下枋 */
    d.box(-0.04, -0.18, h * 0.16, w + 0.04, 0.18, h * 0.32, mid, { line: dark, south: shade(stone, 1.05), top: lite, west: shade(stone, 0.78) });
    for (let x = 0.12; x < w; x += 0.28) {
      d.QS(-0.02, x - 0.04, h * 0.2, x + 0.08, h * 0.28, shade(stone, 1.12));
      d.QS(-0.022, x, h * 0.22, x + 0.04, h * 0.26, gold);
    }
    /* 束腰 waist — denser ashlar */
    d.box(0.02, -0.16, h * 0.3, w - 0.02, 0.16, h * 0.62, shade(stone, 0.95), { line: dark, south: shade(stone, 1.0), top: lite, west: shade(stone, 0.82) });
    for (let z = h * 0.34, k = 0; z < h * 0.6; z += 0.12, k++) {
      d.QS(-0.015, 0.06, z - 0.015, w - 0.06, z, shade(stone, 0.75));
      const ox = (k % 2) * 0.16;
      for (let x = 0.1 + ox; x < w - 0.12; x += 0.32) {
        d.QS(-0.018, x, z - 0.09, x + 0.22, z - 0.02, shade(stone, k % 3 ? 0.98 : 1.14));
        d.QS(-0.02, x + 0.06, z - 0.07, x + 0.14, z - 0.04, shade(stone, 1.22));
      }
    }
    /* 上枋 */
    d.box(-0.05, -0.2, h * 0.6, w + 0.05, 0.2, h * 0.78, mid, { line: dark, south: shade(stone, 1.06), top: lite, west: shade(stone, 0.8) });
    d.QS(-0.025, 0.05, h * 0.66, w - 0.05, h * 0.74, shade(stone, 1.15));
    /* 压面 / 阶条帽 */
    d.box(-0.08, -0.24, h * 0.76, w + 0.08, 0.24, h, stone, { line: dark, south: lite, top: shade(stone, 1.25), west: shade(stone, 0.85) });
    d.QS(-0.03, 0.08, h * 0.86, w - 0.08, h * 0.96, shade(stone, 1.2));
    /* joint beads */
    for (let x = 0.25; x < w; x += 0.45) d.seg([x, -0.25, h * 0.78], [x, -0.25, h - 0.02], shade(stone, 0.65));
  }
  /** 阶条石：台基顶缘长条压面石（密实体积） */
  function paintStepTiaotiao(d, w) {
    const stone = STONE, dark = shade(stone, 0.48), lite = shade(stone, 1.2);
    d.box(0, -0.28, 0, w, 0.32, 0.28, stone, { line: dark, south: shade(stone, 1.05), top: lite, west: shade(stone, 0.82) });
    d.QS(-0.02, 0.04, 0.06, w - 0.04, 0.22, shade(stone, 1.12));
    /* longitudinal seams */
    for (let x = 0.35; x < w; x += 0.55) {
      d.seg([x, -0.29, 0.02], [x, -0.29, 0.26], shade(stone, 0.68));
      d.QS(-0.025, x - 0.03, 0.1, x + 0.03, 0.18, shade(stone, 0.9));
    }
    /* front lip bevel */
    d.QS(-0.01, 0, 0, w, 0.05, shade(stone, 0.78));
    d.QS(-0.03, 0.08, 0.18, w - 0.08, 0.26, shade(stone, 1.22));
    /* corner wraps */
    for (const x of [0.02, w - 0.22]) {
      d.QS(-0.035, x, 0.02, x + 0.2, 0.26, shade(stone, 1.08));
      d.QS(-0.037, x + 0.04, 0.08, x + 0.16, 0.2, shade(stone, 1.28));
    }
  }
  /** 垂带：踏跺两侧斜帮石（立体） */
  function paintRampChuidai(d) {
    const stone = STONE, dark = shade(stone, 0.45), lite = shade(stone, 1.16), rail = shade(stone, 1.05);
    /* sloping cheek — stepped boxes approximating 垂带 slope */
    const steps = 6;
    for (let i = 0; i < steps; i++) {
      const t0 = i / steps, t1 = (i + 1) / steps;
      const z0 = t0 * 1.15, z1 = t1 * 1.15;
      const y0 = -0.35 - t0 * 1.1, y1 = 0.22;
      d.box(0, y0, z0, 0.42, y1, z1, shade(stone, 0.95 + (i % 2) * 0.06), {
        line: dark, south: shade(stone, 1.02), top: lite, west: shade(stone, 0.8),
      });
      d.QS(-0.02, 0.04, z0 + 0.04, 0.36, z1 - 0.02, shade(stone, 1.1));
    }
    /* outer molding rail */
    d.box(-0.04, -0.4, 0, 0.08, 0.25, 1.18, rail, { line: dark, south: lite, top: shade(stone, 1.22), west: shade(stone, 0.78) });
    /* decorative bosses along slope */
    for (let i = 0; i < 5; i++) {
      const t = (i + 0.5) / 5;
      const z = t * 1.05;
      d.QS(-0.03, 0.08, z, 0.28, z + 0.1, shade(stone, 1.18));
      d.QS(-0.032, 0.14, z + 0.02, 0.22, z + 0.08, shade(GOLD, 0.65));
    }
    /* base shoe */
    d.box(-0.06, -0.45, 0, 0.48, 0.28, 0.18, stone, { line: dark, south: shade(stone, 1.0), top: lite });
  }
  /** 踏垛：一级踏步密实石面（踏面+踢面） */
  function paintStairTaduo(d, w) {
    const stone = STONE, dark = shade(stone, 0.48), lite = shade(stone, 1.18);
    /* riser 踢面 */
    d.box(0, -0.22, 0, w, 0.22, 0.22, stone, { line: dark, south: shade(stone, 1.02), top: lite, west: shade(stone, 0.8) });
    d.QS(-0.01, 0.04, 0.04, w - 0.04, 0.18, shade(stone, 1.08));
    /* tread 踏面 overhang */
    d.box(-0.02, -0.28, 0.18, w + 0.02, 0.28, 0.32, shade(stone, 1.02), { line: dark, south: lite, top: shade(stone, 1.22), west: shade(stone, 0.85) });
    d.QS(-0.03, 0.05, 0.22, w - 0.05, 0.3, shade(stone, 1.2));
    /* tread seams */
    for (let x = 0.3; x < w; x += 0.4) {
      d.seg([x, -0.29, 0.2], [x, -0.29, 0.3], shade(stone, 0.7));
      d.QS(-0.025, x - 0.025, 0.08, x + 0.025, 0.14, shade(stone, 0.88));
    }
    /* nose bevel */
    d.QS(-0.015, 0, 0.16, w, 0.2, shade(stone, 0.82));
    d.QS(-0.035, 0.1, 0.26, w - 0.1, 0.31, shade(stone, 1.28));
  }

  /* ---- Site212：影壁 / 照壁 / 砖雕花心 / 须弥座基（宋风入口点景；禁纯线稿；密实体积） ---- */
  const YB_BRICK = '#9a8a72', YB_BRICK_D = '#6a5a48', YB_PLASTER = '#ddd5c4', YB_PLASTER_D = '#c8bfae';
  const YB_TILE = '#6a5a48', YB_RED = '#8a2a1e', YB_CREAM = '#e8dcc0', YB_TEAL = '#3a6a58';
  /** 影壁墙身：清水砖框 + 粉壁心 + 砖雕花心凹龛 + 瓦檐（体积块） */
  function paintWallYingbi(d, w, h) {
    const brick = YB_BRICK, dark = shade(brick, 0.48), lite = shade(brick, 1.12);
    const plas = YB_PLASTER, plasD = YB_PLASTER_D;
    /* thick screen body */
    d.box(0, -0.18, 0, w, 0.22, h, plas, { line: shade(plasD, 0.55), west: plasD, south: shade(plas, 0.98), top: shade(plas, 1.1) });
    /* brick frame rails */
    d.box(0, -0.2, 0, 0.22, 0.24, h, brick, { line: dark, west: YB_BRICK_D, south: lite, top: lite });
    d.box(w - 0.22, -0.2, 0, w, 0.24, h, brick, { line: dark, west: YB_BRICK_D, south: lite, top: lite });
    d.box(0, -0.2, h - 0.28, w, 0.24, h, brick, { line: dark, west: YB_BRICK_D, south: lite, top: shade(brick, 1.2) });
    d.box(0, -0.2, 0, w, 0.24, 0.32, brick, { line: dark, west: YB_BRICK_D, south: lite, top: lite });
    /* brick courses on frame */
    for (let z = 0.08; z < h - 0.05; z += 0.14) {
      d.QS(-0.21, 0.02, z, 0.2, z + 0.04, shade(brick, 0.78));
      d.QS(-0.21, w - 0.2, z, w - 0.02, z + 0.04, shade(brick, 0.78));
    }
    for (let x = 0.08; x < w - 0.05; x += 0.18) {
      d.QS(-0.21, x, 0.06, x + 0.14, 0.28, shade(brick, 0.88));
      d.QS(-0.21, x, h - 0.24, x + 0.14, h - 0.06, shade(brick, 0.88));
    }
    /* plaster field */
    d.QS(-0.22, 0.28, 0.38, w - 0.28, h - 0.34, shade(plas, 1.05), shade(plasD, 0.6));
    d.QS(-0.225, 0.34, 0.44, w - 0.34, h - 0.4, shade(plas, 0.96));
    /* recessed flower niche */
    const cx = w / 2, cz = h * 0.52;
    d.QS(-0.23, cx - 0.42, cz - 0.42, cx + 0.42, cz + 0.42, shade(plasD, 0.85), shade(brick, 0.55));
    d.QS(-0.235, cx - 0.36, cz - 0.36, cx + 0.36, cz + 0.36, shade(YB_CREAM, 0.95));
    /* brick flower petals (volume beads) */
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      const px = cx + Math.cos(a) * 0.22, pz = cz + Math.sin(a) * 0.22;
      d.QS(-0.24, px - 0.07, pz - 0.07, px + 0.07, pz + 0.07, shade(YB_RED, 0.85 + (i % 2) * 0.1));
      d.QS(-0.245, px - 0.04, pz - 0.04, px + 0.04, pz + 0.04, shade(GOLD, 0.9));
    }
    d.QS(-0.25, cx - 0.1, cz - 0.1, cx + 0.1, cz + 0.1, shade(YB_TEAL, 0.95));
    d.QS(-0.255, cx - 0.05, cz - 0.05, cx + 0.05, cz + 0.05, GOLD);
    /* tile coping */
    d.box(-0.06, -0.26, h - 0.06, w + 0.06, 0.28, h + 0.22, YB_TILE, { line: shade(YB_TILE, 0.45), west: shade(YB_TILE, 0.75), south: shade(YB_TILE, 0.95), top: shade(YB_TILE, 1.15) });
    for (let x = 0.05; x < w; x += 0.16) d.QS(-0.27, x, h + 0.02, x + 0.12, h + 0.18, shade(YB_TILE, 1.08));
    d.QS(-0.28, w / 2 - 0.12, h + 0.12, w / 2 + 0.12, h + 0.26, shade(GOLD, 0.75));
  }
  /** 照壁：更正式的入口对景墙（朱红边框 + 灰砖心 + 花心 + 琉璃瓦顶） */
  function paintWallZhaobi(d, w, h) {
    const brick = YB_BRICK, dark = shade(brick, 0.45), red = YB_RED, plas = '#cfc6b4';
    d.box(0, -0.2, 0, w, 0.24, h, plas, { line: shade(plas, 0.5), west: shade(plas, 0.78), south: shade(plas, 0.98), top: shade(plas, 1.08) });
    /* red lacquer frame */
    d.box(0, -0.22, 0, 0.28, 0.26, h, red, { line: shade(red, 0.45), west: shade(red, 0.7), south: shade(red, 1.05), top: shade(red, 1.15) });
    d.box(w - 0.28, -0.22, 0, w, 0.26, h, red, { line: shade(red, 0.45), west: shade(red, 0.7), south: shade(red, 1.05), top: shade(red, 1.15) });
    d.box(0, -0.22, h - 0.32, w, 0.26, h, red, { line: shade(red, 0.45), south: shade(red, 1.08), top: shade(red, 1.2) });
    d.box(0, -0.22, 0, w, 0.26, 0.36, red, { line: shade(red, 0.45), south: shade(red, 1.05), top: shade(red, 1.12) });
    /* gold pin beads on frame */
    for (let z = 0.5; z < h - 0.4; z += 0.35) {
      d.QS(-0.23, 0.06, z, 0.22, z + 0.08, GOLD);
      d.QS(-0.23, w - 0.22, z, w - 0.06, z + 0.08, GOLD);
    }
    /* brick field densify */
    d.QS(-0.23, 0.34, 0.42, w - 0.34, h - 0.38, shade(brick, 0.95), dark);
    for (let zz = 0.5; zz < h - 0.45; zz += 0.16) {
      for (let xx = 0.4; xx < w - 0.4; xx += 0.28) {
        d.QS(-0.235, xx, zz, xx + 0.24, zz + 0.12, shade(brick, 0.88 + ((xx + zz) * 13 % 3) * 0.04));
      }
    }
    /* central flower plaque */
    const cx = w / 2, cz = h * 0.55;
    d.box(cx - 0.48, -0.24, cz - 0.48, cx + 0.48, 0.2, cz + 0.48, shade(YB_CREAM, 0.95), { line: shade(brick, 0.5), south: shade(YB_CREAM, 1.05), top: shade(YB_CREAM, 1.12) });
    d.QS(-0.25, cx - 0.4, cz - 0.4, cx + 0.4, cz + 0.4, shade(YB_TEAL, 0.55));
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      const px = cx + Math.cos(a) * 0.24, pz = cz + Math.sin(a) * 0.24;
      d.QS(-0.255, px - 0.08, pz - 0.08, px + 0.08, pz + 0.08, shade(YB_RED, 0.9));
      d.QS(-0.26, px - 0.04, pz - 0.04, px + 0.04, pz + 0.04, GOLD);
    }
    d.QS(-0.265, cx - 0.1, cz - 0.1, cx + 0.1, cz + 0.1, shade(GOLD, 1.15));
    /* glazed tile roof */
    d.box(-0.1, -0.3, h - 0.08, w + 0.1, 0.3, h + 0.28, shade(YB_TEAL, 0.95), { line: shade(YB_TEAL, 0.45), west: shade(YB_TEAL, 0.7), south: shade(YB_TEAL, 1.05), top: shade(YB_TEAL, 1.2) });
    for (let x = 0.05; x < w; x += 0.18) d.QS(-0.31, x, h + 0.04, x + 0.14, h + 0.22, shade(YB_TEAL, 1.1));
    d.QS(-0.32, w / 2 - 0.15, h + 0.16, w / 2 + 0.15, h + 0.32, GOLD);
  }
  /** 砖雕花心：独立圆形砖雕团花（可贴壁心） */
  function paintBrickHuaxin(d) {
    const brick = YB_BRICK, dark = shade(brick, 0.45), cream = YB_CREAM;
    d.box(-0.55, -0.12, -0.55, 0.55, 0.14, 0.55, brick, { line: dark, west: YB_BRICK_D, south: shade(brick, 1.02), top: shade(brick, 1.15) });
    d.QS(-0.13, -0.48, -0.48, 0.48, 0.48, shade(cream, 0.92), dark);
    /* outer ring of brick bosses */
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6;
      const x = Math.cos(a) * 0.4, z = Math.sin(a) * 0.4;
      d.QS(-0.14, x - 0.06, z - 0.06, x + 0.06, z + 0.06, shade(brick, 1.05 + (i % 2) * 0.08));
    }
    /* petal layers */
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4 + 0.2;
      const x = Math.cos(a) * 0.24, z = Math.sin(a) * 0.24;
      d.QS(-0.15, x - 0.09, z - 0.09, x + 0.09, z + 0.09, shade(YB_RED, 0.82 + (i % 3) * 0.06));
      d.QS(-0.155, x - 0.05, z - 0.05, x + 0.05, z + 0.05, shade(GOLD, 0.95));
    }
    d.QS(-0.16, -0.14, -0.14, 0.14, 0.14, shade(YB_TEAL, 0.9));
    d.QS(-0.165, -0.08, -0.08, 0.08, 0.08, shade(GOLD, 1.2));
    d.QS(-0.17, -0.035, -0.035, 0.035, 0.035, shade(cream, 1.15));
    /* square frame corners */
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      d.QS(-0.145, sx * 0.46 - 0.06, sz * 0.46 - 0.06, sx * 0.46 + 0.06, sz * 0.46 + 0.06, GOLD);
    }
  }
  /** 须弥座/影壁基座：石质叠涩底座 */
  function paintScreenBase(d, w) {
    const stone = STONE, dark = shade(stone, 0.48), lite = shade(stone, 1.15), gold = shade(GOLD, 0.75);
    d.box(0, -0.35, 0, w, 0.35, 0.22, stone, { line: dark, west: shade(stone, 0.8), south: shade(stone, 1.02), top: lite });
    d.QS(-0.02, 0.04, 0.06, w - 0.04, 0.18, shade(stone, 1.1));
    /* waist */
    d.box(0.06, -0.28, 0.18, w - 0.06, 0.28, 0.38, shade(stone, 0.92), { line: dark, south: shade(stone, 1.05), top: lite });
    d.QS(-0.03, 0.1, 0.24, w - 0.1, 0.32, gold);
    /* upper plinth */
    d.box(0.02, -0.32, 0.34, w - 0.02, 0.32, 0.52, stone, { line: dark, west: shade(stone, 0.82), south: shade(stone, 1.04), top: shade(stone, 1.2) });
    for (let x = 0.15; x < w - 0.1; x += 0.22) {
      d.QS(-0.04, x, 0.38, x + 0.14, 0.48, shade(stone, 1.12));
      d.seg([x + 0.07, -0.33, 0.36], [x + 0.07, -0.33, 0.5], shade(stone, 0.7));
    }
    /* corner wraps */
    for (const x of [0.04, w - 0.2]) {
      d.QS(-0.05, x, 0.04, x + 0.16, 0.48, gold);
      d.QS(-0.055, x + 0.04, 0.12, x + 0.12, 0.4, shade(GOLD, 1.15));
    }
  }

  /* ---- Site213：鸱吻 / 垂脊走兽 / 正脊饰 / 垂脊（宋风脊饰；禁纯线稿；与瓦当 kitbash 分面） ---- */
  /** 鸱吻 densify：鱼龙吻座更密实体积 + 金鳞/须/张开吻口（强化既有 chiwen_S） */
  function paintRidgeChiwen(d, w, o = {}) {
    const flip = !!(o && o.flip);
    const col = RIDGE, lite = shade(col, 1.3), dark = shade(col, 0.42), gold = shade(GOLD, 0.9);
    const mid = shade(col, 0.95);
    // layered seat / 吻座
    d.box(0.02, -0.16, 0, w - 0.02, 0.16, 0.22, col, { line: dark, top: lite, south: shade(col, 0.98), west: shade(col, 0.78) });
    d.QS(-0.02, 0.08, 0.04, w - 0.08, 0.18, shade(col, 1.12));
    for (let x = 0.15; x < w - 0.1; x += 0.18) d.QS(-0.025, x, 0.08, x + 0.08, 0.16, gold);
    // rising body volumes
    d.box(0.1, -0.18, 0.18, w * 0.5, 0.12, 0.62, mid, { line: dark, top: lite, south: shade(col, 1.05) });
    d.box(w * 0.28, -0.2, 0.48, w * 0.68, 0.1, 0.92, col, { line: dark, top: shade(col, 1.22), south: lite });
    // open mouth / snout
    d.box(w * 0.52, -0.22, 0.78, w * 0.98, 0.08, 1.18, col, { line: dark, south: shade(col, 1.15), top: lite });
    d.QS(-0.2, w * 0.58, 0.86, w * 0.92, 1.1, shade(col, 0.65));
    d.QS(-0.205, w * 0.64, 0.9, w * 0.88, 1.06, shade('#1a120e', 0.92));
    // tongue / gold inner
    d.QS(-0.21, w * 0.7, 0.94, w * 0.84, 1.02, shade(GOLD, 0.75));
    // dorsal crest / fin (volume beads)
    for (let z = 0.55; z < 1.15; z += 0.1) {
      d.QS(-0.22, w * 0.22, z, w * 0.42, z + 0.08, gold);
      d.QS(-0.225, w * 0.28, z + 0.02, w * 0.38, z + 0.1, shade(GOLD, 1.15));
    }
    // eye
    const eq = d.P(w * 0.46, -0.2, 0.78);
    d.g.fillStyle = '#f0e8c8'; d.g.beginPath();
    d.g.ellipse(Math.round(eq[0]), Math.round(eq[1]), 2.6, 2.8, 0, 0, Math.PI * 2); d.g.fill();
    d.g.fillStyle = '#1a120e'; d.g.fillRect(Math.round(eq[0]), Math.round(eq[1]), 2, 2);
    d.g.fillStyle = shade(GOLD, 1.1); d.g.fillRect(Math.round(eq[0]) - 1, Math.round(eq[1]) - 1, 1, 1);
    // dense scale beads
    for (let z = 0.24; z < 0.78; z += 0.08) {
      for (let x = 0.14; x < w * 0.52; x += 0.1) {
        d.QS(-0.16, x, z, x + 0.055, z + 0.045, shade(col, 1.12 + ((x * 10 + z * 10) % 3) * 0.08));
      }
    }
    // whiskers / antennae volume tips
    d.box(w * 0.72, -0.14, 1.05, w * 0.9, 0.04, 1.22, gold, { line: shade(GOLD, 0.5), top: shade(GOLD, 1.2) });
    d.box(w * 0.78, -0.12, 1.12, w * 0.95, 0.03, 1.28, shade(GOLD, 1.1), { line: shade(GOLD, 0.55) });
    // tail curl toward ridge
    d.box(0.0, -0.12, 0.05, 0.28, 0.12, 0.42, col, { line: dark, south: shade(col, 0.88), top: lite });
    d.QS(-0.18, 0.04, 0.3, 0.22, 0.48, gold);
    void flip;
  }
  /** 垂脊走兽：蹲坐兽体积（狮形/龙形简化密实体） */
  function paintBeastZoushou(d) {
    const col = RIDGE, dark = shade(col, 0.45), lite = shade(col, 1.25), gold = shade(GOLD, 0.85);
    // pedestal
    d.box(-0.18, -0.16, 0, 0.18, 0.16, 0.14, col, { line: dark, top: lite, south: shade(col, 0.95) });
    d.QS(-0.02, -0.12, 0.04, 0.12, 0.12, shade(col, 1.1));
    // haunches / body
    d.box(-0.22, -0.18, 0.12, 0.22, 0.14, 0.55, shade(col, 0.98), { line: dark, top: lite, south: shade(col, 1.05), west: shade(col, 0.8) });
    d.QS(-0.03, -0.14, 0.28, 0.14, 0.48, shade(col, 1.15));
    // chest
    d.box(-0.16, -0.2, 0.4, 0.2, 0.1, 0.72, col, { line: dark, south: lite, top: shade(col, 1.2) });
    // head
    d.box(-0.14, -0.22, 0.65, 0.18, 0.08, 0.95, col, { line: dark, south: shade(col, 1.12), top: lite });
    d.QS(-0.2, -0.08, 0.72, 0.12, 0.9, shade(col, 0.7));
    // mane / crest gold beads
    for (let z = 0.7; z < 1.05; z += 0.08) {
      d.QS(-0.24, -0.1, z, 0.14, z + 0.06, gold);
    }
    // eye
    const eq = d.P(0.02, -0.22, 0.82);
    d.g.fillStyle = '#f0e8c8'; d.g.beginPath();
    d.g.ellipse(Math.round(eq[0]), Math.round(eq[1]), 1.8, 2.0, 0, 0, Math.PI * 2); d.g.fill();
    d.g.fillStyle = '#1a120e'; d.g.fillRect(Math.round(eq[0]), Math.round(eq[1]), 1, 1);
    // paws
    for (const x of [-0.16, 0.06]) {
      d.box(x, -0.2, 0.05, x + 0.1, 0.05, 0.2, shade(col, 0.9), { line: dark, top: lite });
    }
    // back ridge scales
    for (let z = 0.2; z < 0.6; z += 0.1) {
      d.QS(-0.18, -0.08, z, 0.08, z + 0.06, shade(col, 1.18));
      d.QS(-0.185, -0.04, z + 0.01, 0.04, z + 0.05, gold);
    }
  }
  /** 正脊饰：宝瓶/脊刹密实体积（正脊中段点缀） */
  function paintRidgeOrnament(d) {
    const col = RIDGE, dark = shade(col, 0.45), lite = shade(col, 1.28), gold = shade(GOLD, 0.95);
    // base plinth
    d.box(-0.28, -0.18, 0, 0.28, 0.18, 0.18, col, { line: dark, top: lite, south: shade(col, 0.98) });
    d.QS(-0.02, -0.2, 0.04, 0.2, 0.14, shade(col, 1.12));
    // bulbous vase body
    d.box(-0.22, -0.16, 0.15, 0.22, 0.16, 0.55, shade(col, 0.96), { line: dark, top: lite, south: shade(col, 1.06), west: shade(col, 0.8) });
    d.QS(-0.03, -0.14, 0.28, 0.14, 0.48, shade(col, 1.15));
    // neck ring
    d.box(-0.14, -0.12, 0.52, 0.14, 0.12, 0.68, col, { line: dark, south: lite, top: shade(col, 1.2) });
    d.QS(-0.04, -0.1, 0.56, 0.1, 0.64, gold);
    // finial orb
    d.box(-0.1, -0.1, 0.66, 0.1, 0.1, 0.9, shade(col, 1.05), { line: dark, top: lite, south: shade(col, 1.15) });
    d.QS(-0.05, -0.06, 0.74, 0.06, 0.86, shade(GOLD, 1.1));
    // tip bead
    d.box(-0.05, -0.06, 0.88, 0.05, 0.06, 1.05, gold, { line: shade(GOLD, 0.5), top: shade(GOLD, 1.25) });
    // side bosses
    for (const x of [-0.2, 0.12]) {
      d.QS(-0.06, x, 0.32, x + 0.08, 0.42, gold);
    }
  }
  /** 垂脊：斜脊筒瓦垄带（密实瓦体积） */
  function paintHipChuiji(d, w) {
    const col = RIDGE, lite = shade(col, 1.28), dark = shade(col, 0.48), mid = shade(TILE, 0.92);
    d.box(0, -0.14, 0, w, 0.14, 0.32, col, { line: dark, top: lite, south: shade(col, 1.02), west: shade(col, 0.8) });
    d.QS(-0.02, 0.04, 0.08, w - 0.04, 0.26, shade(col, 1.12));
    // tile barrels along hip
    for (let x = 0.06; x < w; x += 0.16) {
      d.QS(-0.03, x, 0.1, x + 0.1, 0.28, lite);
      d.seg([x + 0.05, -0.15, 0.06], [x + 0.05, -0.15, 0.3], shade(col, 0.65));
      d.QS(-0.035, x + 0.02, 0.16, x + 0.08, 0.24, shade(GOLD, 0.45));
    }
    // underside tile wash
    d.QS(0.01, 0, 0, w, 0.06, mid);
    // end boss
    d.box(w - 0.18, -0.16, 0.05, w + 0.02, 0.12, 0.38, shade(col, 1.05), { line: dark, top: lite, south: shade(col, 1.15) });
    d.QS(-0.04, w - 0.14, 0.18, w - 0.02, 0.32, goldish());
    function goldish() { return shade(GOLD, 0.8); }
  }
  /* ---- Site214：落地罩 / 隔扇屏 / 月洞 / 门框（室内外过渡；禁纯线稿；密实体积；与 Site203 格扇门窗互补） ---- */
  const SC_WOOD = '#7a4a2c', SC_WOOD_D = '#4a2a18', SC_RED = '#8a2a1e', SC_CREAM = '#e8dcc0';
  const SC_TEAL = '#3a6a58', SC_PAPER = '#d8cdb8', SC_STONE = '#9a9080';
  /** 落地罩：开敞间两侧通顶罩架（立柱+上枋花心+下裙板；门厅可见） */
  function paintScreenLuodizhao(d, w, h) {
    const wood = SC_WOOD, dark = shade(wood, 0.45), red = SC_RED, cream = SC_CREAM;
    /* thick posts */
    d.box(0, -0.18, 0, 0.28, 0.22, h, red, { line: shade(red, 0.42), west: shade(red, 0.7), south: shade(red, 1.05), top: shade(red, 1.15) });
    d.box(w - 0.28, -0.18, 0, w, 0.22, h, red, { line: shade(red, 0.42), west: shade(red, 0.7), south: shade(red, 1.05), top: shade(red, 1.15) });
    /* upper lintel / 罩枋 */
    d.box(0, -0.2, h - 0.55, w, 0.24, h, wood, { line: dark, west: SC_WOOD_D, south: shade(wood, 1.05), top: shade(wood, 1.2) });
    d.QS(-0.21, 0.08, h - 0.48, w - 0.08, h - 0.08, shade(wood, 1.12));
    /* gold pin beads on posts */
    for (let z = 0.4; z < h - 0.6; z += 0.38) {
      d.QS(-0.19, 0.06, z, 0.22, z + 0.08, GOLD);
      d.QS(-0.19, w - 0.22, z, w - 0.06, z + 0.08, GOLD);
    }
    /* upper openwork lattice band（密实格，非线稿） */
    d.QS(-0.16, 0.32, h - 1.35, w - 0.32, h - 0.58, shade(SC_PAPER, 0.75), dark);
    for (let x = 0.4; x < w - 0.35; x += 0.16) d.QS(-0.17, x, h - 1.3, x + 0.05, h - 0.62, shade(wood, 1.15));
    for (let z = h - 1.25; z < h - 0.65; z += 0.16) d.QS(-0.17, 0.38, z, w - 0.38, z + 0.05, shade(wood, 1.08));
    /* central flower plaque */
    const cx = w / 2, cz = h - 0.95;
    d.box(cx - 0.42, -0.22, cz - 0.32, cx + 0.42, 0.18, cz + 0.32, cream, { line: dark, south: shade(cream, 1.05), top: shade(cream, 1.12) });
    d.QS(-0.23, cx - 0.34, cz - 0.24, cx + 0.34, cz + 0.24, shade(SC_TEAL, 0.55));
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      const px = cx + Math.cos(a) * 0.18, pz = cz + Math.sin(a) * 0.16;
      d.QS(-0.24, px - 0.07, pz - 0.07, px + 0.07, pz + 0.07, shade(SC_RED, 0.9));
      d.QS(-0.245, px - 0.035, pz - 0.035, px + 0.035, pz + 0.035, GOLD);
    }
    d.QS(-0.25, cx - 0.08, cz - 0.08, cx + 0.08, cz + 0.08, shade(GOLD, 1.15));
    /* lower apron / 裙板 */
    d.box(0.28, -0.16, 0, w - 0.28, 0.2, 1.05, wood, { line: dark, west: SC_WOOD_D, south: shade(wood, 1.02), top: shade(wood, 1.12) });
    d.QS(-0.17, 0.38, 0.12, w - 0.38, 0.95, shade(cream, 0.92), dark);
    for (let x = 0.5; x < w - 0.45; x += 0.28) {
      d.QS(-0.18, x, 0.22, x + 0.18, 0.85, shade(wood, 0.95));
      d.QS(-0.185, x + 0.04, 0.35, x + 0.14, 0.72, shade(SC_TEAL, 0.7));
      d.QS(-0.19, x + 0.07, 0.48, x + 0.11, 0.6, GOLD);
    }
    /* mid rail */
    d.box(0.28, -0.18, 1.0, w - 0.28, 0.22, 1.22, red, { line: shade(red, 0.45), south: shade(red, 1.08), top: shade(red, 1.15) });
    d.QS(-0.19, 0.35, 1.06, w - 0.35, 1.16, GOLD);
    /* open middle void hint (dark recess) */
    d.QS(-0.12, 0.35, 1.28, w - 0.35, h - 1.4, shade('#2a1e16', 0.55));
  }
  /** 隔扇屏：门厅内隔断屏（多扇密格，立于廊口；非外立面门窗格扇） */
  function paintPartitionGeshan(d, w, h) {
    const wood = SC_WOOD, dark = shade(wood, 0.48), red = SC_RED, paper = SC_PAPER;
    const n = 4, leaf = w / n;
    d.box(0, -0.14, 0, w, 0.18, h, wood, { line: dark, west: SC_WOOD_D, south: shade(wood, 0.98), top: shade(wood, 1.1) });
    for (let i = 0; i < n; i++) {
      const x0 = i * leaf, x1 = x0 + leaf;
      /* stile */
      d.box(x0, -0.16, 0, x0 + 0.1, 0.2, h, red, { line: shade(red, 0.45), south: shade(red, 1.05), top: shade(red, 1.12) });
      if (i === n - 1) d.box(x1 - 0.1, -0.16, 0, x1, 0.2, h, red, { line: shade(red, 0.45), south: shade(red, 1.05), top: shade(red, 1.12) });
      /* upper lattice */
      d.QS(-0.17, x0 + 0.12, h * 0.42, x1 - 0.08, h - 0.12, shade(paper, 0.88), dark);
      for (let x = x0 + 0.18; x < x1 - 0.1; x += 0.12) d.QS(-0.175, x, h * 0.44, x + 0.035, h - 0.14, shade(wood, 1.12));
      for (let z = h * 0.46; z < h - 0.16; z += 0.12) d.QS(-0.175, x0 + 0.14, z, x1 - 0.1, z + 0.035, shade(wood, 1.05));
      /* diamond bosses */
      const cx = (x0 + x1) / 2, cz = h * 0.68;
      d.QS(-0.18, cx - 0.1, cz - 0.1, cx + 0.1, cz + 0.1, shade(SC_TEAL, 0.75));
      d.QS(-0.185, cx - 0.05, cz - 0.05, cx + 0.05, cz + 0.05, GOLD);
      /* lower solid panel */
      d.QS(-0.17, x0 + 0.12, 0.12, x1 - 0.08, h * 0.38, shade(SC_CREAM, 0.95), dark);
      d.QS(-0.175, x0 + 0.18, 0.2, x1 - 0.14, h * 0.34, shade(wood, 0.9));
      d.QS(-0.18, x0 + 0.28, 0.28, x1 - 0.24, h * 0.3, shade(SC_TEAL, 0.55));
    }
    /* top rail + feet */
    d.box(0, -0.18, h - 0.18, w, 0.22, h, red, { line: shade(red, 0.45), south: shade(red, 1.1), top: shade(red, 1.18) });
    d.QS(-0.19, 0.08, h - 0.14, w - 0.08, h - 0.04, GOLD);
    d.box(0.05, -0.2, 0, 0.35, 0.24, 0.18, SC_STONE, { line: shade(SC_STONE, 0.5), top: shade(SC_STONE, 1.15) });
    d.box(w - 0.35, -0.2, 0, w - 0.05, 0.24, 0.18, SC_STONE, { line: shade(SC_STONE, 0.5), top: shade(SC_STONE, 1.15) });
  }
  /** 月洞门框：圆形月洞 thr、红漆内环、砖拱外圈（廊口/门厅过渡） */
  function paintMoonYuedong(d, w, h) {
    const brick = '#9a8a72', dark = shade(brick, 0.48), red = SC_RED, plas = '#ddd5c4';
    /* wall field */
    d.box(0, -0.16, 0, w, 0.2, h, plas, { line: shade(plas, 0.55), west: shade(plas, 0.8), south: shade(plas, 0.98), top: shade(plas, 1.08) });
    /* brick surround densify */
    for (let z = 0.08; z < h - 0.05; z += 0.14) {
      for (let x = 0.06; x < w - 0.05; x += 0.26) {
        d.QS(-0.17, x, z, x + 0.22, z + 0.11, shade(brick, 0.88 + ((x + z) * 11 % 3) * 0.04));
      }
    }
    const cx = w / 2, cz = h * 0.48, R = Math.min(w, h) * 0.36;
    /* outer brick ring (volume beads approximating circle) */
    for (let i = 0; i < 24; i++) {
      const a = i * Math.PI / 12;
      const x = cx + Math.cos(a) * R, z = cz + Math.sin(a) * R;
      d.QS(-0.19, x - 0.1, z - 0.1, x + 0.1, z + 0.1, shade(brick, 1.02 + (i % 2) * 0.06));
      d.QS(-0.195, x - 0.06, z - 0.06, x + 0.06, z + 0.06, shade(brick, 0.85));
    }
    /* red lacquer inner ring */
    const R2 = R * 0.78;
    for (let i = 0; i < 20; i++) {
      const a = i * Math.PI / 10;
      const x = cx + Math.cos(a) * R2, z = cz + Math.sin(a) * R2;
      d.QS(-0.2, x - 0.08, z - 0.08, x + 0.08, z + 0.08, shade(red, 0.95));
      d.QS(-0.205, x - 0.04, z - 0.04, x + 0.04, z + 0.04, GOLD);
    }
    /* dark opening */
    const R3 = R * 0.62;
    d.QS(-0.21, cx - R3, cz - R3, cx + R3, cz + R3, shade('#1a120e', 0.92));
    d.QS(-0.215, cx - R3 * 0.85, cz - R3 * 0.85, cx + R3 * 0.85, cz + R3 * 0.85, shade('#2a1e16', 0.8));
    /* tile coping */
    d.box(-0.05, -0.22, h - 0.08, w + 0.05, 0.26, h + 0.22, shade(SC_TEAL, 0.9), { line: shade(SC_TEAL, 0.45), south: shade(SC_TEAL, 1.05), top: shade(SC_TEAL, 1.18) });
    for (let x = 0.08; x < w; x += 0.18) d.QS(-0.23, x, h + 0.02, x + 0.14, h + 0.18, shade(SC_TEAL, 1.1));
    d.QS(-0.24, cx - 0.12, h + 0.12, cx + 0.12, h + 0.26, GOLD);
  }
  /** 门框：朱红抱框+石门槛+金钉（开敞门厅口；与门钉轨互补） */
  function paintFrameMenkuang(d, w, h) {
    const red = SC_RED, wood = SC_WOOD, dark = shade(red, 0.42), stone = SC_STONE;
    /* posts */
    d.box(0, -0.2, 0, 0.32, 0.24, h, red, { line: dark, west: shade(red, 0.7), south: shade(red, 1.05), top: shade(red, 1.15) });
    d.box(w - 0.32, -0.2, 0, w, 0.24, h, red, { line: dark, west: shade(red, 0.7), south: shade(red, 1.05), top: shade(red, 1.15) });
    /* lintel */
    d.box(0, -0.22, h - 0.42, w, 0.26, h, wood, { line: shade(wood, 0.45), west: SC_WOOD_D, south: shade(wood, 1.05), top: shade(wood, 1.18) });
    d.QS(-0.23, 0.1, h - 0.34, w - 0.1, h - 0.08, shade(wood, 1.12));
    d.QS(-0.235, 0.2, h - 0.28, w - 0.2, h - 0.14, GOLD);
    /* gold pin beads */
    for (let z = 0.35; z < h - 0.5; z += 0.32) {
      d.QS(-0.21, 0.08, z, 0.24, z + 0.07, GOLD);
      d.QS(-0.21, w - 0.24, z, w - 0.08, z + 0.07, GOLD);
    }
    /* stone threshold */
    d.box(0.05, -0.28, 0, w - 0.05, 0.32, 0.28, stone, { line: shade(stone, 0.5), west: shade(stone, 0.8), south: shade(stone, 1.02), top: shade(stone, 1.15) });
    d.QS(-0.02, 0.15, 0.08, w - 0.15, 0.22, shade(stone, 1.1));
    /* corner fill volumes (雀替感) */
    for (const sx of [0.32, w - 0.85]) {
      d.box(sx, -0.18, h - 0.85, sx + 0.5, 0.16, h - 0.42, wood, { line: shade(wood, 0.5), south: shade(SC_TEAL, 0.85), top: shade(wood, 1.1) });
      d.QS(-0.19, sx + 0.08, h - 0.75, sx + 0.42, h - 0.5, shade(SC_TEAL, 0.7));
      d.QS(-0.195, sx + 0.18, h - 0.68, sx + 0.32, h - 0.55, GOLD);
    }
    /* dark opening */
    d.QS(-0.12, 0.38, 0.32, w - 0.38, h - 0.48, shade('#1a120e', 0.75));
  }



  /* ---- Site215：拴马桩/上马石/石敢当/路牙石标 atlas 模块（禁纯线稿、密实 kitbash） ---- */
  function paintPostShuanma(d) {
    const ST = '#8a8070', STW = '#6a6258', TOP = '#9a9080', GOLD = '#c8a040', DARK = '#5a5248';
    // 须弥座基
    d.box(-0.38, -0.38, 0, 0.38, 0.38, 0.22, ST, { line: shade(ST, 0.48), west: STW, top: shade(ST, 0.9) });
    d.box(-0.32, -0.32, 0.22, 0.32, 0.32, 0.38, shade(ST, 0.95), { line: shade(ST, 0.5), west: STW, top: TOP });
    for (let z = 0.08; z < 0.2; z += 0.08) d.seg([-0.36, -0.385, z], [0.36, -0.385, z], shade(ST, 0.7));
    // 桩身：方柱 + 鼓节 + 浮雕环带
    d.box(-0.18, -0.18, 0.38, 0.18, 0.18, 1.85, shade(ST, 1.0), { line: shade(ST, 0.48), west: STW, top: TOP });
    for (let z = 0.55; z < 1.8; z += 0.22) {
      d.box(-0.22, -0.22, z, 0.22, 0.22, z + 0.08, shade(ST, z % 0.44 < 0.22 ? 1.08 : 0.92), { line: shade(ST, 0.5), west: STW, top: TOP });
    }
    for (let z = 0.5; z < 1.8; z += 0.14) d.seg([-0.19, -0.185, z], [0.19, -0.185, z], shade(ST, 0.72));
    // 南面浮雕条（实体积块，非纯线）
    d.QS(-0.185, -0.12, 0.7, 0.12, 1.55, shade(ST, 1.12), shade(ST, 0.55));
    for (let i = 0; i < 5; i++) {
      const z = 0.85 + i * 0.14;
      d.box(-0.1, -0.2, z, 0.1, -0.185, z + 0.08, shade(DARK, 1.05), { line: false, noW: true, noS: true });
    }
    // 兽首顶（蹲兽简化密实体积）
    d.box(-0.28, -0.28, 1.85, 0.28, 0.28, 2.05, shade(ST, 1.05), { line: shade(ST, 0.48), west: STW, top: TOP });
    d.box(-0.22, -0.26, 2.05, 0.22, 0.22, 2.35, shade(ST, 1.08), { line: shade(ST, 0.5), west: STW, top: shade(ST, 1.15) });
    d.box(-0.14, -0.3, 2.18, 0.14, -0.18, 2.42, shade(ST, 0.95), { line: shade(ST, 0.5), west: STW, top: TOP }); // snout
    d.box(-0.18, -0.12, 2.35, -0.08, -0.02, 2.52, shade(ST, 1.1), { line: shade(ST, 0.5), west: STW, top: TOP }); // ear L
    d.box(0.08, -0.12, 2.35, 0.18, -0.02, 2.52, shade(ST, 1.1), { line: shade(ST, 0.5), west: STW, top: TOP }); // ear R
    d.QS(-0.27, -0.1, 2.12, 0.1, 2.28, shade(ST, 1.18), shade(ST, 0.55));
    // 金环拴马环（贴图块）
    d.box(-0.06, -0.32, 1.35, 0.06, -0.22, 1.55, GOLD, { line: shade(GOLD, 0.55), west: shade(GOLD, 0.8), top: '#e8c868' });
    d.box(-0.14, -0.36, 1.4, 0.14, -0.3, 1.5, shade(GOLD, 0.9), { line: shade(GOLD, 0.5), west: shade(GOLD, 0.75), top: GOLD });
  }
  function paintStoneShangma(d) {
    const ST = '#8a8070', STW = '#6a6258', TOP = '#9a9080', DARK = '#5a5248';
    // 三级上马石（密实体积）
    d.box(-0.7, -0.45, 0, 0.7, 0.45, 0.28, ST, { line: shade(ST, 0.48), west: STW, top: shade(ST, 0.92) });
    d.box(-0.55, -0.38, 0.28, 0.55, 0.38, 0.52, shade(ST, 1.0), { line: shade(ST, 0.5), west: STW, top: shade(ST, 1.05) });
    d.box(-0.38, -0.3, 0.52, 0.38, 0.3, 0.78, shade(ST, 1.05), { line: shade(ST, 0.48), west: STW, top: shade(ST, 1.15) });
    // 阶面缝与端面
    for (const [y0, y1, z] of [[-0.44, 0.44, 0.28], [-0.37, 0.37, 0.52], [-0.29, 0.29, 0.78]]) {
      d.seg([-0.65, y0, z], [0.65, y0, z], shade(ST, 0.7));
      d.seg([-0.65, y1, z], [0.65, y1, z], shade(ST, 0.7));
    }
    for (let x = -0.5; x < 0.55; x += 0.25) d.seg([x, -0.46, 0.28], [x, 0.46, 0.28], shade(ST, 0.75));
    // 侧面浮雕块
    d.QS(-0.71, -0.35, 0.06, 0.35, 0.24, shade(ST, 1.1), shade(ST, 0.55));
    d.QS(0.71, -0.35, 0.06, 0.35, 0.24, shade(STW, 1.05), shade(ST, 0.55));
    for (let i = 0; i < 3; i++) {
      const z = 0.1 + i * 0.18;
      d.box(-0.72, -0.18, z, -0.7, 0.18, z + 0.1, shade(DARK, 1.05), { line: false, noW: true, noS: true });
      d.box(0.7, -0.18, z, 0.72, 0.18, z + 0.1, shade(DARK, 1.05), { line: false, noW: true, noS: true });
    }
    // 顶面防滑纹理块
    for (let i = 0; i < 4; i++) {
      const x = -0.28 + i * 0.16;
      d.box(x, -0.18, 0.78, x + 0.1, 0.18, 0.8, shade(ST, i % 2 ? 0.92 : 1.12), { line: false, noW: true, noS: true });
    }
  }
  function paintStoneGanddang(d) {
    const ST = '#8a8070', STW = '#6a6258', TOP = '#9a9080', DARK = '#5a5248', INK = '#3a342c';
    // 基座
    d.box(-0.42, -0.28, 0, 0.42, 0.28, 0.26, ST, { line: shade(ST, 0.48), west: STW, top: shade(ST, 0.9) });
    d.box(-0.36, -0.22, 0.26, 0.36, 0.22, 0.38, shade(ST, 0.95), { line: shade(ST, 0.5), west: STW, top: TOP });
    // 碑身
    d.box(-0.32, -0.16, 0.38, 0.32, 0.16, 1.55, shade(ST, 1.02), { line: shade(ST, 0.48), west: STW, top: TOP });
    // 内凹铭文框（实体积）
    d.QS(-0.33, -0.22, 0.55, 0.22, 1.35, shade(ST, 1.14), shade(ST, 0.55));
    d.box(-0.24, -0.18, 0.58, 0.24, -0.14, 1.32, shade(DARK, 0.95), { line: shade(DARK, 0.5), west: INK, top: shade(DARK, 1.05) });
    // 「石敢当」字块暗示（密实方块，非描字线）
    const glyphs = [
      [-0.14, 0.7, 0.28, 0.18], [-0.14, 0.95, 0.28, 0.18], [-0.14, 1.2, 0.28, 0.18],
    ];
    for (const [gx, gz, gw, gh] of glyphs) {
      d.box(gx, -0.185, gz, gx + gw, -0.155, gz + gh, shade(INK, 1.1), { line: false, noW: true, noS: true });
      d.box(gx + 0.04, -0.19, gz + 0.04, gx + gw - 0.04, -0.16, gz + gh - 0.04, shade(ST, 1.15), { line: false, noW: true, noS: true });
    }
    // 碑帽尖顶
    d.box(-0.38, -0.2, 1.55, 0.38, 0.2, 1.68, shade(ST, 1.08), { line: shade(ST, 0.5), west: STW, top: shade(ST, 1.18) });
    d.box(-0.22, -0.14, 1.68, 0.22, 0.14, 1.82, shade(ST, 1.05), { line: shade(ST, 0.5), west: STW, top: TOP });
    d.box(-0.1, -0.1, 1.82, 0.1, 0.1, 1.95, shade(ST, 1.12), { line: shade(ST, 0.5), west: STW, top: shade(ST, 1.2) });
    for (let z = 0.5; z < 1.5; z += 0.16) d.seg([-0.31, -0.165, z], [0.31, -0.165, z], shade(ST, 0.7));
  }
  function paintCurbMarker(d) {
    const ST = '#8a8070', STW = '#6a6258', TOP = '#9a9080', DARK = '#5a5248';
    // 路牙石标：矮方柱 + 帽顶
    d.box(-0.28, -0.28, 0, 0.28, 0.28, 0.18, ST, { line: shade(ST, 0.48), west: STW, top: shade(ST, 0.9) });
    d.box(-0.2, -0.2, 0.18, 0.2, 0.2, 0.72, shade(ST, 1.0), { line: shade(ST, 0.5), west: STW, top: TOP });
    for (let z = 0.28; z < 0.7; z += 0.12) d.seg([-0.21, -0.205, z], [0.21, -0.205, z], shade(ST, 0.72));
    d.QS(-0.205, -0.14, 0.3, 0.14, 0.6, shade(ST, 1.12), shade(ST, 0.55));
    d.box(-0.08, -0.22, 0.4, 0.08, -0.2, 0.55, shade(DARK, 1.05), { line: false, noW: true, noS: true });
    d.box(-0.26, -0.26, 0.72, 0.26, 0.26, 0.82, shade(ST, 1.08), { line: shade(ST, 0.5), west: STW, top: shade(ST, 1.18) });
    d.box(-0.12, -0.12, 0.82, 0.12, 0.12, 0.95, shade(ST, 1.05), { line: shade(ST, 0.5), west: STW, top: TOP });
  }

  /* ---- Site217：井亭/路亭/小牌坊/亭顶 atlas 模块（禁纯线稿、密实 kitbash；点景小体量） ---- */
  function paintPavilionJingting(d) {
    const ST = '#8a8070', STW = '#6a6258', TOP = '#9a9080', WOOD = '#6a4a2c', WOOD_D = '#3a2214';
    const TILE = '#4a5560', TILE_L = '#6a7580', RED = '#a03830', RED_W = '#70241c';
    // 石台基
    d.box(-1.15, -1.15, 0, 1.15, 1.15, 0.22, ST, { line: shade(ST, 0.48), west: STW, top: shade(ST, 0.9) });
    d.box(-1.05, -1.05, 0.22, 1.05, 1.05, 0.38, shade(ST, 0.98), { line: shade(ST, 0.5), west: STW, top: TOP });
    for (let x = -0.9; x < 0.95; x += 0.3) d.seg([x, -1.06, 0.38], [x, 1.06, 0.38], shade(ST, 0.72));
    // 井口石栏（中心凹）
    d.box(-0.55, -0.55, 0.38, 0.55, 0.55, 0.72, shade(ST, 1.02), { line: shade(ST, 0.48), west: STW, top: shade(ST, 1.1) });
    d.box(-0.35, -0.35, 0.72, 0.35, 0.35, 0.78, '#2a3438', { line: shade(ST, 0.5), west: '#1a2428', top: '#1e2a30' });
    // 四柱
    for (const [x, y] of [[-0.85, -0.85], [0.85, -0.85], [-0.85, 0.85], [0.85, 0.85]]) {
      d.box(x - 0.12, y - 0.12, 0.38, x + 0.12, y + 0.12, 2.35, RED, { line: shade(RED, 0.5), west: RED_W, top: shade(RED, 1.1) });
      d.box(x - 0.16, y - 0.16, 0.38, x + 0.16, y + 0.16, 0.52, ST, { line: shade(ST, 0.5), west: STW, top: TOP });
    }
    // 额枋环圈（实体积）
    for (const [x0, y0, x1, y1] of [
      [-0.95, -0.95, 0.95, -0.78], [-0.95, 0.78, 0.95, 0.95],
      [-0.95, -0.95, -0.78, 0.95], [0.78, -0.95, 0.95, 0.95],
    ]) {
      d.box(x0, y0, 2.2, x1, y1, 2.42, '#2f5a86', { line: '#1a3a50', top: '#3f7a6a', west: '#244a6a' });
    }
    // 斗拱色块点缀
    for (const [x, y] of [[-0.85, -0.85], [0.85, -0.85], [-0.85, 0.85], [0.85, 0.85]]) {
      d.box(x - 0.22, y - 0.18, 2.42, x + 0.22, y + 0.18, 2.62, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.1) });
      d.box(x - 0.28, y - 0.1, 2.55, x + 0.28, y + 0.1, 2.72, shade(WOOD, 1.05), { line: WOOD_D, west: shade(WOOD, 0.85), top: shade(WOOD, 1.15) });
    }
    // 歇山顶密实（屋面块 + 瓦垄暗示）
    d.box(-1.35, -1.35, 2.72, 1.35, 1.35, 2.92, TILE, { line: shade(TILE, 0.5), west: shade(TILE, 0.75), top: TILE_L });
    d.box(-1.05, -1.05, 2.92, 1.05, 1.05, 3.35, shade(TILE, 1.05), { line: shade(TILE, 0.5), west: shade(TILE, 0.8), top: shade(TILE_L, 1.08) });
    d.box(-0.55, -0.55, 3.35, 0.55, 0.55, 3.72, shade(TILE, 1.1), { line: shade(TILE, 0.5), west: shade(TILE, 0.85), top: '#8a9098' });
    d.box(-0.2, -0.2, 3.72, 0.2, 0.2, 3.95, ST, { line: shade(ST, 0.5), west: STW, top: TOP });
    // 瓦垄条（实体积带，非纯线）
    for (let i = -4; i <= 4; i++) {
      const x = i * 0.26;
      d.box(x - 0.06, -1.32, 2.78, x + 0.06, 1.32, 2.9, shade(TILE, i % 2 ? 0.95 : 1.12), { line: false, noW: true, noS: true });
    }
    for (let z = 2.85; z < 3.3; z += 0.12) d.seg([-1.0, -1.06, z], [1.0, -1.06, z], shade(TILE, 0.7));
    // 正脊
    d.box(-1.1, -0.1, 3.55, 1.1, 0.1, 3.78, shade(TILE, 1.15), { line: shade(TILE, 0.5), west: shade(TILE, 0.85), top: '#9aa0a8' });
  }
  function paintPavilionLuting(d) {
    const ST = '#8a8070', STW = '#6a6258', TOP = '#9a9080', WOOD = '#6a4a2c', WOOD_D = '#3a2214';
    const TILE = '#4a5560', TILE_L = '#6a7580', RED = '#a03830', RED_W = '#70241c';
    // 台基稍扁（路亭）
    d.box(-1.35, -1.05, 0, 1.35, 1.05, 0.18, ST, { line: shade(ST, 0.48), west: STW, top: shade(ST, 0.9) });
    d.box(-1.25, -0.95, 0.18, 1.25, 0.95, 0.32, shade(ST, 0.98), { line: shade(ST, 0.5), west: STW, top: TOP });
    // 坐槛石条（两侧）
    d.box(-1.15, -0.95, 0.32, 1.15, -0.7, 0.72, ST, { line: shade(ST, 0.5), west: STW, top: shade(ST, 1.08) });
    d.box(-1.15, 0.7, 0.32, 1.15, 0.95, 0.72, ST, { line: shade(ST, 0.5), west: STW, top: shade(ST, 1.08) });
    for (let x = -1.0; x < 1.05; x += 0.35) {
      d.seg([x, -0.96, 0.72], [x, -0.7, 0.72], shade(ST, 0.7));
      d.seg([x, 0.7, 0.72], [x, 0.96, 0.72], shade(ST, 0.7));
    }
    // 四柱开敞
    for (const [x, y] of [[-1.05, -0.75], [1.05, -0.75], [-1.05, 0.75], [1.05, 0.75]]) {
      d.box(x - 0.11, y - 0.11, 0.32, x + 0.11, y + 0.11, 2.55, RED, { line: shade(RED, 0.5), west: RED_W, top: shade(RED, 1.1) });
      d.box(x - 0.15, y - 0.15, 0.32, x + 0.15, y + 0.15, 0.48, ST, { line: shade(ST, 0.5), west: STW, top: TOP });
    }
    // 额枋 + 雀替块
    for (const [x0, y0, x1, y1] of [
      [-1.15, -0.85, 1.15, -0.65], [-1.15, 0.65, 1.15, 0.85],
      [-1.15, -0.85, -0.95, 0.85], [0.95, -0.85, 1.15, 0.85],
    ]) {
      d.box(x0, y0, 2.4, x1, y1, 2.62, '#2f5a86', { line: '#1a3a50', top: '#3f7a6a', west: '#244a6a' });
    }
    for (const [x, y] of [[-1.05, -0.75], [1.05, -0.75], [-1.05, 0.75], [1.05, 0.75]]) {
      d.box(x - 0.28, y - 0.08, 2.28, x + 0.28, y + 0.08, 2.45, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.1) });
    }
    // 歇山亭顶
    d.box(-1.55, -1.25, 2.62, 1.55, 1.25, 2.82, TILE, { line: shade(TILE, 0.5), west: shade(TILE, 0.75), top: TILE_L });
    d.box(-1.2, -0.95, 2.82, 1.2, 0.95, 3.28, shade(TILE, 1.05), { line: shade(TILE, 0.5), west: shade(TILE, 0.8), top: shade(TILE_L, 1.08) });
    d.box(-0.5, -0.45, 3.28, 0.5, 0.45, 3.68, shade(TILE, 1.1), { line: shade(TILE, 0.5), west: shade(TILE, 0.85), top: '#8a9098' });
    for (let i = -5; i <= 5; i++) {
      const x = i * 0.26;
      d.box(x - 0.06, -1.22, 2.68, x + 0.06, 1.22, 2.8, shade(TILE, i % 2 ? 0.95 : 1.12), { line: false, noW: true, noS: true });
    }
    d.box(-1.25, -0.1, 3.48, 1.25, 0.1, 3.72, shade(TILE, 1.15), { line: shade(TILE, 0.5), west: shade(TILE, 0.85), top: '#9aa0a8' });
    d.box(-0.18, -0.18, 3.72, 0.18, 0.18, 3.95, ST, { line: shade(ST, 0.5), west: STW, top: TOP });
  }
  function paintGatePaifangS(d) {
    const ST = '#8a8070', STW = '#6a6258', TOP = '#9a9080', WOOD = '#6a4a2c', WOOD_D = '#3a2214';
    const TILE = '#4a5560', TILE_L = '#6a7580', RED = '#a03830', RED_W = '#70241c', GOLD = '#c8a040';
    // 夹杆石双柱底座
    for (const x of [-1.35, 1.35]) {
      d.box(x - 0.38, -0.35, 0, x + 0.38, 0.35, 0.55, ST, { line: shade(ST, 0.48), west: STW, top: shade(ST, 0.9) });
      d.box(x - 0.28, -0.28, 0.55, x + 0.28, 0.28, 0.72, shade(ST, 0.98), { line: shade(ST, 0.5), west: STW, top: TOP });
      // 石柱
      d.box(x - 0.18, -0.18, 0.72, x + 0.18, 0.18, 2.85, shade(ST, 1.02), { line: shade(ST, 0.48), west: STW, top: TOP });
      for (let z = 0.9; z < 2.8; z += 0.2) d.seg([x - 0.19, -0.185, z], [x + 0.19, -0.185, z], shade(ST, 0.72));
      d.QS(x - 0.185, -0.12, 1.1, 0.12, 2.5, shade(ST, 1.12), shade(ST, 0.55));
    }
    // 额枋横梁（单开间）
    d.box(-1.55, -0.22, 2.55, 1.55, 0.22, 2.85, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.1) });
    d.box(-1.45, -0.18, 2.85, 1.45, 0.18, 3.15, '#2f5a86', { line: '#1a3a50', west: '#244a6a', top: '#3f7a6a' });
    // 匾额色块
    d.box(-0.7, -0.2, 2.95, 0.7, -0.12, 3.35, '#1f2f4a', { line: GOLD, west: '#152238', top: '#2a4060' });
    d.box(-0.5, -0.22, 3.05, 0.5, -0.14, 3.25, shade(GOLD, 0.95), { line: false, noW: true, noS: true });
    // 斗拱块
    for (const x of [-1.35, 0, 1.35]) {
      d.box(x - 0.28, -0.28, 3.15, x + 0.28, 0.28, 3.4, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.12) });
      d.box(x - 0.35, -0.16, 3.32, x + 0.35, 0.16, 3.52, shade(WOOD, 1.05), { line: WOOD_D, west: shade(WOOD, 0.85), top: shade(WOOD, 1.15) });
    }
    // 小歇山顶
    d.box(-1.85, -0.55, 3.52, 1.85, 0.55, 3.72, TILE, { line: shade(TILE, 0.5), west: shade(TILE, 0.75), top: TILE_L });
    d.box(-1.45, -0.4, 3.72, 1.45, 0.4, 4.15, shade(TILE, 1.05), { line: shade(TILE, 0.5), west: shade(TILE, 0.8), top: shade(TILE_L, 1.08) });
    d.box(-0.55, -0.22, 4.15, 0.55, 0.22, 4.45, shade(TILE, 1.1), { line: shade(TILE, 0.5), west: shade(TILE, 0.85), top: '#8a9098' });
    for (let i = -6; i <= 6; i++) {
      const x = i * 0.26;
      d.box(x - 0.05, -0.52, 3.58, x + 0.05, 0.52, 3.7, shade(TILE, i % 2 ? 0.95 : 1.12), { line: false, noW: true, noS: true });
    }
    d.box(-1.5, -0.08, 4.28, 1.5, 0.08, 4.5, shade(TILE, 1.15), { line: shade(TILE, 0.5), west: shade(TILE, 0.85), top: '#9aa0a8' });
    // 脊端鸱吻简化块
    for (const x of [-1.45, 1.45]) {
      d.box(x - 0.18, -0.14, 4.35, x + 0.18, 0.14, 4.75, shade(TILE, 1.08), { line: shade(TILE, 0.5), west: shade(TILE, 0.8), top: TILE_L });
    }
  }
  function paintRoofTing(d) {
    const TILE = '#4a5560', TILE_L = '#6a7580', ST = '#8a8070', STW = '#6a6258', TOP = '#9a9080';
    // 可复用亭顶模块：檐口 + 屋面 + 正脊
    d.box(-1.4, -1.4, 0, 1.4, 1.4, 0.22, TILE, { line: shade(TILE, 0.5), west: shade(TILE, 0.75), top: TILE_L });
    d.box(-1.1, -1.1, 0.22, 1.1, 1.1, 0.7, shade(TILE, 1.05), { line: shade(TILE, 0.5), west: shade(TILE, 0.8), top: shade(TILE_L, 1.08) });
    d.box(-0.55, -0.55, 0.7, 0.55, 0.55, 1.15, shade(TILE, 1.1), { line: shade(TILE, 0.5), west: shade(TILE, 0.85), top: '#8a9098' });
    for (let i = -4; i <= 4; i++) {
      const x = i * 0.28;
      d.box(x - 0.06, -1.38, 0.06, x + 0.06, 1.38, 0.2, shade(TILE, i % 2 ? 0.95 : 1.12), { line: false, noW: true, noS: true });
    }
    d.box(-1.15, -0.1, 0.95, 1.15, 0.1, 1.22, shade(TILE, 1.15), { line: shade(TILE, 0.5), west: shade(TILE, 0.85), top: '#9aa0a8' });
    d.box(-0.18, -0.18, 1.22, 0.18, 0.18, 1.42, ST, { line: shade(ST, 0.5), west: STW, top: TOP });
    for (const x of [-1.1, 1.1]) {
      d.box(x - 0.16, -0.12, 1.05, x + 0.16, 0.12, 1.4, shade(TILE, 1.08), { line: shade(TILE, 0.5), west: shade(TILE, 0.8), top: TILE_L });
    }
  }







  /* ---- Site218：垂花门/小门楼/门罩/门柱石 atlas 模块（禁纯线稿、密实 kitbash；宅院入口点景） ---- */
  function paintGateChuihua(d) {
    const ST = '#8a8070', STW = '#6a6258', TOP = '#9a9080', WOOD = '#6a4a2c', WOOD_D = '#3a2214';
    const TILE = '#4a5560', TILE_L = '#6a7580', RED = '#a03830', RED_W = '#70241c', GOLD = '#c8a040';
    // 石台基 + 门槛
    d.box(-1.55, -0.55, 0, 1.55, 0.55, 0.28, ST, { line: shade(ST, 0.48), west: STW, top: shade(ST, 0.9) });
    d.box(-1.4, -0.42, 0.28, 1.4, 0.42, 0.48, shade(ST, 0.98), { line: shade(ST, 0.5), west: STW, top: TOP });
    d.box(-0.55, -0.35, 0.48, 0.55, 0.35, 0.62, WOOD_D, { line: shade(WOOD_D, 0.6), west: shade(WOOD_D, 0.8), top: shade(WOOD, 0.7) });
    for (let x = -1.25; x < 1.3; x += 0.35) d.seg([x, -0.43, 0.48], [x, 0.43, 0.48], shade(ST, 0.7));
    // 夹柱石墩
    for (const x of [-1.15, 1.15]) {
      d.box(x - 0.32, -0.38, 0.48, x + 0.32, 0.38, 0.78, ST, { line: shade(ST, 0.48), west: STW, top: TOP });
      d.box(x - 0.22, -0.28, 0.78, x + 0.22, 0.28, 0.92, shade(ST, 1.02), { line: shade(ST, 0.5), west: STW, top: shade(ST, 1.12) });
    }
    // 两红柱
    for (const x of [-1.15, 1.15]) {
      d.box(x - 0.14, -0.14, 0.92, x + 0.14, 0.14, 3.05, RED, { line: shade(RED, 0.5), west: RED_W, top: shade(RED, 1.1) });
      // 金箍环
      for (const z of [1.35, 2.35]) d.box(x - 0.16, -0.16, z, x + 0.16, 0.16, z + 0.08, GOLD, { line: shade(GOLD, 0.55), west: shade(GOLD, 0.8), top: shade(GOLD, 1.15) });
    }
    // 额枋 + 彩绘色块
    d.box(-1.35, -0.2, 2.85, 1.35, 0.2, 3.12, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.1) });
    d.box(-1.25, -0.16, 3.12, 1.25, 0.16, 3.35, '#2f5a86', { line: '#1a3a50', west: '#244a6a', top: '#3f7a6a' });
    d.box(-0.55, -0.18, 3.18, 0.55, -0.1, 3.42, '#1f2f4a', { line: GOLD, west: '#152238', top: '#2a4060' });
    // 垂花柱头（檐下悬花蕾实体块）
    for (const x of [-1.55, 1.55]) {
      d.box(x - 0.12, -0.12, 2.55, x + 0.12, 0.12, 3.05, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.1) });
      d.box(x - 0.18, -0.18, 2.35, x + 0.18, 0.18, 2.6, RED, { line: shade(RED, 0.5), west: RED_W, top: shade(RED, 1.12) });
      d.box(x - 0.14, -0.14, 2.2, x + 0.14, 0.14, 2.38, GOLD, { line: shade(GOLD, 0.55), west: shade(GOLD, 0.8), top: shade(GOLD, 1.15) });
      d.box(x - 0.1, -0.1, 2.05, x + 0.1, 0.1, 2.22, shade(RED, 1.05), { line: shade(RED, 0.5), west: RED_W, top: shade(RED, 1.15) });
    }
    // 雀替块
    for (const x of [-1.0, 1.0]) {
      d.box(x - 0.28, -0.1, 2.7, x + 0.28, 0.1, 2.92, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.1) });
    }
    // 小歇山顶 + 瓦垄
    d.box(-1.75, -0.55, 3.35, 1.75, 0.55, 3.55, TILE, { line: shade(TILE, 0.5), west: shade(TILE, 0.75), top: TILE_L });
    d.box(-1.35, -0.4, 3.55, 1.35, 0.4, 3.95, shade(TILE, 1.05), { line: shade(TILE, 0.5), west: shade(TILE, 0.8), top: shade(TILE_L, 1.08) });
    d.box(-0.5, -0.22, 3.95, 0.5, 0.22, 4.25, shade(TILE, 1.1), { line: shade(TILE, 0.5), west: shade(TILE, 0.85), top: '#8a9098' });
    for (let i = -6; i <= 6; i++) {
      const x = i * 0.25;
      d.box(x - 0.05, -0.52, 3.4, x + 0.05, 0.52, 3.52, shade(TILE, i % 2 ? 0.95 : 1.12), { line: false, noW: true, noS: true });
    }
    d.box(-1.4, -0.08, 4.1, 1.4, 0.08, 4.32, shade(TILE, 1.15), { line: shade(TILE, 0.5), west: shade(TILE, 0.85), top: '#9aa0a8' });
    for (const x of [-1.3, 1.3]) {
      d.box(x - 0.16, -0.12, 4.15, x + 0.16, 0.12, 4.48, shade(TILE, 1.08), { line: shade(TILE, 0.5), west: shade(TILE, 0.8), top: TILE_L });
    }
  }
  function paintGateMenlouS(d) {
    const ST = '#8a8070', STW = '#6a6258', TOP = '#9a9080', WOOD = '#6a4a2c', WOOD_D = '#3a2214';
    const TILE = '#4a5560', TILE_L = '#6a7580', RED = '#a03830', RED_W = '#70241c', GOLD = '#c8a040';
    // 台基
    d.box(-1.45, -0.7, 0, 1.45, 0.7, 0.32, ST, { line: shade(ST, 0.48), west: STW, top: shade(ST, 0.9) });
    d.box(-1.3, -0.55, 0.32, 1.3, 0.55, 0.52, shade(ST, 0.98), { line: shade(ST, 0.5), west: STW, top: TOP });
    // 砖墩墙裙（两侧，中空门洞）
    for (const x of [-1.05, 1.05]) {
      d.box(x - 0.35, -0.5, 0.52, x + 0.35, 0.5, 2.55, '#9a8a72', { line: shade('#9a8a72', 0.48), west: '#6a5e4c', top: shade('#9a8a72', 1.1) });
      for (let z = 0.65; z < 2.45; z += 0.18) {
        for (let yy = -0.4; yy < 0.45; yy += 0.22) {
          d.QS(x - 0.36, yy, z, yy + 0.18, z + 0.14, shade('#9a8a72', 0.9 + ((yy + z) * 7 % 3) * 0.04));
        }
      }
    }
    // 门洞额枋
    d.box(-0.75, -0.45, 2.35, 0.75, 0.45, 2.65, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.1) });
    d.box(-0.55, -0.42, 0.52, 0.55, -0.32, 2.35, WOOD_D, { line: shade(WOOD_D, 0.55), west: shade(WOOD_D, 0.75), top: shade(WOOD, 0.7) });
    // 上层小楼板 + 短柱
    d.box(-1.25, -0.55, 2.65, 1.25, 0.55, 2.85, ST, { line: shade(ST, 0.5), west: STW, top: TOP });
    for (const x of [-0.95, 0, 0.95]) {
      d.box(x - 0.1, -0.12, 2.85, x + 0.1, 0.12, 3.55, RED, { line: shade(RED, 0.5), west: RED_W, top: shade(RED, 1.1) });
    }
    d.box(-1.15, -0.18, 3.45, 1.15, 0.18, 3.7, '#2f5a86', { line: '#1a3a50', west: '#244a6a', top: '#3f7a6a' });
    d.box(-0.4, -0.2, 3.5, 0.4, -0.12, 3.75, '#1f2f4a', { line: GOLD, west: '#152238', top: '#2a4060' });
    // 门楼歇山顶
    d.box(-1.55, -0.7, 3.7, 1.55, 0.7, 3.9, TILE, { line: shade(TILE, 0.5), west: shade(TILE, 0.75), top: TILE_L });
    d.box(-1.15, -0.5, 3.9, 1.15, 0.5, 4.3, shade(TILE, 1.05), { line: shade(TILE, 0.5), west: shade(TILE, 0.8), top: shade(TILE_L, 1.08) });
    d.box(-0.45, -0.25, 4.3, 0.45, 0.25, 4.55, shade(TILE, 1.1), { line: shade(TILE, 0.5), west: shade(TILE, 0.85), top: '#8a9098' });
    for (let i = -5; i <= 5; i++) {
      const x = i * 0.26;
      d.box(x - 0.05, -0.65, 3.76, x + 0.05, 0.65, 3.88, shade(TILE, i % 2 ? 0.95 : 1.12), { line: false, noW: true, noS: true });
    }
    d.box(-1.2, -0.08, 4.4, 1.2, 0.08, 4.6, shade(TILE, 1.15), { line: shade(TILE, 0.5), west: shade(TILE, 0.85), top: '#9aa0a8' });
  }
  function paintEaveMenzhao(d) {
    const ST = '#8a8070', STW = '#6a6258', TOP = '#9a9080', WOOD = '#6a4a2c', WOOD_D = '#3a2214';
    const TILE = '#4a5560', TILE_L = '#6a7580', RED = '#a03830', RED_W = '#70241c', GOLD = '#c8a040';
    // 门罩：贴墙浅出檐（砖托 + 木枋 + 小瓦顶）
    d.box(-1.2, -0.15, 0, 1.2, 0.25, 0.35, ST, { line: shade(ST, 0.48), west: STW, top: TOP });
    // 两挑梁托
    for (const x of [-0.85, 0.85]) {
      d.box(x - 0.14, -0.2, 0.2, x + 0.14, 0.35, 1.15, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.1) });
      d.box(x - 0.22, -0.18, 1.0, x + 0.22, 0.32, 1.25, shade(WOOD, 1.05), { line: WOOD_D, west: shade(WOOD, 0.85), top: shade(WOOD, 1.15) });
      d.box(x - 0.1, -0.12, 0.85, x + 0.1, 0.28, 1.05, RED, { line: shade(RED, 0.5), west: RED_W, top: shade(RED, 1.1) });
    }
    // 横枋 + 金边匾托
    d.box(-1.15, -0.22, 1.15, 1.15, 0.38, 1.4, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.1) });
    d.box(-0.7, -0.24, 1.22, 0.7, -0.14, 1.48, '#1f2f4a', { line: GOLD, west: '#152238', top: '#2a4060' });
    // 小披檐瓦顶
    d.box(-1.4, -0.35, 1.4, 1.4, 0.45, 1.58, TILE, { line: shade(TILE, 0.5), west: shade(TILE, 0.75), top: TILE_L });
    d.box(-1.1, -0.25, 1.58, 1.1, 0.35, 1.9, shade(TILE, 1.05), { line: shade(TILE, 0.5), west: shade(TILE, 0.8), top: shade(TILE_L, 1.08) });
    for (let i = -5; i <= 5; i++) {
      const x = i * 0.24;
      d.box(x - 0.05, -0.32, 1.45, x + 0.05, 0.42, 1.56, shade(TILE, i % 2 ? 0.95 : 1.12), { line: false, noW: true, noS: true });
    }
    d.box(-1.15, -0.08, 1.82, 1.15, 0.12, 2.05, shade(TILE, 1.12), { line: shade(TILE, 0.5), west: shade(TILE, 0.85), top: '#9aa0a8' });
    // 滴水暗示块
    for (let x = -1.2; x <= 1.2; x += 0.3) {
      d.box(x - 0.06, -0.34, 1.35, x + 0.06, -0.28, 1.48, shade(TILE, 1.1), { line: false, noW: true, noS: true });
    }
  }
  function paintPostMenzhu(d) {
    const ST = '#8a8070', STW = '#6a6258', TOP = '#9a9080', GOLD = '#c8a040';
    // 须弥座
    d.box(-0.42, -0.42, 0, 0.42, 0.42, 0.28, ST, { line: shade(ST, 0.48), west: STW, top: shade(ST, 0.9) });
    d.box(-0.36, -0.36, 0.28, 0.36, 0.36, 0.48, shade(ST, 0.98), { line: shade(ST, 0.5), west: STW, top: TOP });
    // 方柱身密实石皮
    d.box(-0.28, -0.28, 0.48, 0.28, 0.28, 1.85, shade(ST, 1.02), { line: shade(ST, 0.48), west: STW, top: TOP });
    for (let z = 0.55; z < 1.8; z += 0.18) {
      d.seg([-0.29, -0.285, z], [0.29, -0.285, z], shade(ST, 0.7));
      d.QS(-0.29, -0.22, z + 0.02, 0.22, z + 0.1, shade(ST, 1.08));
    }
    // 柱帽 + 金钉
    d.box(-0.34, -0.34, 1.85, 0.34, 0.34, 2.05, ST, { line: shade(ST, 0.5), west: STW, top: shade(ST, 1.12) });
    d.box(-0.22, -0.22, 2.05, 0.22, 0.22, 2.22, shade(ST, 1.05), { line: shade(ST, 0.5), west: STW, top: TOP });
    d.box(-0.1, -0.1, 2.22, 0.1, 0.1, 2.35, GOLD, { line: shade(GOLD, 0.55), west: shade(GOLD, 0.8), top: shade(GOLD, 1.15) });
  }

  /* ---- Site216：漏窗 / 花墙 / 透空砖雕 / 花格墙 atlas 模块（禁纯线稿、密实 kitbash；与格扇/影壁互补） ---- */
  const LW_BRICK = '#9a8a72', LW_BRICK_D = '#6a5e4c', LW_PLAS = '#ddd5c4', LW_CREAM = '#e8dcc0';
  const LW_TEAL = '#3a6a58', LW_RED = '#8a2a1e', LW_WOOD = '#7a4a2c', LW_STONE = '#9a9080';
  /** 漏窗：墙面透空花窗（框+密实几何花心；非门窗格扇） */
  function paintWindowLou(d, w, h) {
    const brick = LW_BRICK, dark = shade(brick, 0.48), plas = LW_PLAS, cream = LW_CREAM;
    /* wall field */
    d.box(0, -0.16, 0, w, 0.2, h, plas, { line: shade(plas, 0.55), west: shade(plas, 0.8), south: shade(plas, 0.98), top: shade(plas, 1.08) });
    /* brick courses densify */
    for (let z = 0.06; z < h - 0.04; z += 0.14) {
      for (let x = 0.05; x < w - 0.04; x += 0.24) {
        d.QS(-0.17, x, z, x + 0.2, z + 0.11, shade(brick, 0.88 + ((x + z) * 11 % 3) * 0.04));
      }
    }
    /* outer frame */
    const m = 0.22;
    d.box(m, -0.2, m, w - m, 0.24, h - m, LW_WOOD, { line: shade(LW_WOOD, 0.45), west: shade(LW_WOOD, 0.7), south: shade(LW_WOOD, 1.05), top: shade(LW_WOOD, 1.15) });
    d.QS(-0.21, m + 0.06, m + 0.06, w - m - 0.06, h - m - 0.06, shade(cream, 0.55), dark);
    /* openwork geometric lattice (dense volumes, not linework) */
    const ix0 = m + 0.14, ix1 = w - m - 0.14, iz0 = m + 0.14, iz1 = h - m - 0.14;
    d.QS(-0.12, ix0, iz0, ix1, iz1, shade('#1a120e', 0.55));
    for (let x = ix0 + 0.08; x < ix1 - 0.05; x += 0.18) d.QS(-0.19, x, iz0 + 0.04, x + 0.06, iz1 - 0.04, shade(LW_WOOD, 1.12));
    for (let z = iz0 + 0.08; z < iz1 - 0.05; z += 0.18) d.QS(-0.19, ix0 + 0.04, z, ix1 - 0.04, z + 0.06, shade(LW_WOOD, 1.05));
    /* diamond flower bosses */
    const cx = w / 2, cz = h / 2;
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      const px = cx + Math.cos(a) * 0.42, pz = cz + Math.sin(a) * 0.38;
      d.QS(-0.2, px - 0.1, pz - 0.1, px + 0.1, pz + 0.1, shade(LW_TEAL, 0.75));
      d.QS(-0.205, px - 0.05, pz - 0.05, px + 0.05, pz + 0.05, shade(GOLD, 0.95));
    }
    d.QS(-0.21, cx - 0.14, cz - 0.14, cx + 0.14, cz + 0.14, shade(LW_RED, 0.85));
    d.QS(-0.215, cx - 0.07, cz - 0.07, cx + 0.07, cz + 0.07, shade(GOLD, 1.15));
    /* corner gold pins */
    for (const sx of [m + 0.08, w - m - 0.2]) for (const sz of [m + 0.08, h - m - 0.2]) {
      d.QS(-0.22, sx, sz, sx + 0.12, sz + 0.12, GOLD);
    }
  }
  /** 花墙：透空花墙段（砖框+多窗洞花心；园林墙面点缀） */
  function paintWallHuaziang(d, w, h) {
    const brick = LW_BRICK, dark = shade(brick, 0.48), plas = LW_PLAS;
    d.box(0, -0.18, 0, w, 0.22, h, plas, { line: shade(plas, 0.55), west: shade(plas, 0.78), south: shade(plas, 0.98), top: shade(plas, 1.1) });
    for (let z = 0.05; z < h - 0.04; z += 0.13) {
      for (let x = 0.04; x < w - 0.04; x += 0.22) {
        d.QS(-0.185, x, z, x + 0.18, z + 0.1, shade(brick, 0.9 + ((x * 7 + z * 5) % 3) * 0.05));
      }
    }
    /* tiled coping */
    d.box(-0.08, -0.22, h - 0.12, w + 0.08, 0.26, h + 0.28, shade(LW_TEAL, 0.95), { line: shade(LW_TEAL, 0.45), west: shade(LW_TEAL, 0.7), south: shade(LW_TEAL, 1.05), top: shade(LW_TEAL, 1.2) });
    for (let x = 0.05; x < w; x += 0.2) d.QS(-0.23, x, h + 0.02, x + 0.14, h + 0.22, shade(LW_TEAL, 1.1));
    /* three pierced openings with flower centers */
    const slots = [
      [w * 0.12, h * 0.22, w * 0.34, h * 0.72],
      [w * 0.38, h * 0.18, w * 0.62, h * 0.78],
      [w * 0.66, h * 0.22, w * 0.88, h * 0.72],
    ];
    for (const [x0, z0, x1, z1] of slots) {
      d.QS(-0.12, x0, z0, x1, z1, shade('#1a120e', 0.5));
      d.box(x0 - 0.06, -0.2, z0 - 0.06, x1 + 0.06, 0.24, z1 + 0.06, LW_WOOD, { line: shade(LW_WOOD, 0.45), south: shade(LW_WOOD, 1.05), top: shade(LW_WOOD, 1.12) });
      /* lattice densify inside opening */
      for (let x = x0 + 0.08; x < x1 - 0.05; x += 0.14) d.QS(-0.19, x, z0 + 0.06, x + 0.045, z1 - 0.06, shade(LW_WOOD, 1.1));
      for (let z = z0 + 0.08; z < z1 - 0.05; z += 0.14) d.QS(-0.19, x0 + 0.06, z, x1 - 0.06, z + 0.045, shade(LW_WOOD, 1.02));
      const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      d.QS(-0.2, cx - 0.12, cz - 0.12, cx + 0.12, cz + 0.12, shade(LW_TEAL, 0.7));
      d.QS(-0.205, cx - 0.06, cz - 0.06, cx + 0.06, cz + 0.06, GOLD);
    }
    /* base plinth */
    d.box(0.02, -0.2, 0, w - 0.02, 0.24, 0.28, LW_STONE, { line: shade(LW_STONE, 0.5), south: shade(LW_STONE, 1.05), top: shade(LW_STONE, 1.15) });
    d.QS(-0.21, 0.1, 0.08, w - 0.1, 0.2, shade(LW_STONE, 1.12));
  }
  /** 透空砖雕：独立透空砖雕面板（可贴墙/花墙花心） */
  function paintBrickToukong(d) {
    const brick = LW_BRICK, dark = shade(brick, 0.45), cream = LW_CREAM;
    d.box(-0.7, -0.14, -0.7, 0.7, 0.16, 0.7, brick, { line: dark, west: LW_BRICK_D, south: shade(brick, 1.02), top: shade(brick, 1.15) });
    d.QS(-0.15, -0.62, -0.62, 0.62, 0.62, shade(cream, 0.9), dark);
    /* openwork ring + petals as volume beads */
    for (let i = 0; i < 16; i++) {
      const a = i * Math.PI / 8;
      const x = Math.cos(a) * 0.48, z = Math.sin(a) * 0.48;
      d.QS(-0.16, x - 0.08, z - 0.08, x + 0.08, z + 0.08, shade(brick, 1.0 + (i % 2) * 0.08));
      d.QS(-0.165, x - 0.04, z - 0.04, x + 0.04, z + 0.04, shade(brick, 0.82));
    }
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4 + 0.2;
      const x = Math.cos(a) * 0.28, z = Math.sin(a) * 0.28;
      d.QS(-0.17, x - 0.1, z - 0.1, x + 0.1, z + 0.1, shade(LW_TEAL, 0.8));
      d.QS(-0.175, x - 0.05, z - 0.05, x + 0.05, z + 0.05, shade(GOLD, 0.95));
    }
    /* center void hint */
    d.QS(-0.12, -0.16, -0.16, 0.16, 0.16, shade('#1a120e', 0.65));
    d.QS(-0.18, -0.1, -0.1, 0.1, 0.1, shade(LW_RED, 0.9));
    d.QS(-0.185, -0.05, -0.05, 0.05, 0.05, shade(GOLD, 1.2));
    /* square frame corners */
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      d.QS(-0.155, sx * 0.58 - 0.08, sz * 0.58 - 0.08, sx * 0.58 + 0.08, sz * 0.58 + 0.08, GOLD);
    }
  }
  /** 花格墙：密实花格墙板（万字/冰裂纹体量；侧墙/巷墙贴面） */
  function paintLatticeWall(d, w, h) {
    const wood = LW_WOOD, dark = shade(wood, 0.48), cream = LW_CREAM, brick = LW_BRICK;
    d.box(0, -0.14, 0, w, 0.18, h, wood, { line: dark, west: shade(wood, 0.7), south: shade(wood, 0.98), top: shade(wood, 1.1) });
    /* outer brick surround */
    for (let z = 0.04; z < h - 0.04; z += 0.16) {
      d.QS(-0.15, 0.04, z, 0.18, z + 0.12, shade(brick, 0.95));
      d.QS(-0.15, w - 0.18, z, w - 0.04, z + 0.12, shade(brick, 0.95));
    }
    d.QS(-0.16, 0.2, 0.08, w - 0.2, h - 0.08, shade(cream, 0.72), dark);
    /* wanzi / ice-crack dense grid */
    for (let x = 0.28; x < w - 0.22; x += 0.2) d.QS(-0.17, x, 0.16, x + 0.07, h - 0.16, shade(wood, 1.12));
    for (let z = 0.22; z < h - 0.16; z += 0.2) d.QS(-0.17, 0.24, z, w - 0.24, z + 0.07, shade(wood, 1.05));
    /* diagonal volume beads (ice-crack hint) */
    for (let i = 0; i < 6; i++) {
      const x = 0.4 + i * 0.35;
      if (x > w - 0.4) break;
      d.QS(-0.175, x - 0.08, h * 0.35, x + 0.08, h * 0.35 + 0.55, shade(wood, 1.15));
      d.QS(-0.175, x - 0.08, h * 0.55, x + 0.08, h * 0.55 + 0.45, shade(wood, 1.08));
    }
    /* center teal plaque */
    const cx = w / 2, cz = h * 0.5;
    d.box(cx - 0.35, -0.2, cz - 0.28, cx + 0.35, 0.16, cz + 0.28, cream, { line: dark, south: shade(cream, 1.05), top: shade(cream, 1.12) });
    d.QS(-0.21, cx - 0.28, cz - 0.2, cx + 0.28, cz + 0.2, shade(LW_TEAL, 0.55));
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + 0.4;
      const px = cx + Math.cos(a) * 0.14, pz = cz + Math.sin(a) * 0.12;
      d.QS(-0.22, px - 0.06, pz - 0.06, px + 0.06, pz + 0.06, shade(LW_RED, 0.9));
      d.QS(-0.225, px - 0.03, pz - 0.03, px + 0.03, pz + 0.03, GOLD);
    }
    /* top/bottom rails */
    d.box(0, -0.16, h - 0.2, w, 0.2, h, LW_RED, { line: shade(LW_RED, 0.45), south: shade(LW_RED, 1.08), top: shade(LW_RED, 1.15) });
    d.QS(-0.17, 0.08, h - 0.14, w - 0.08, h - 0.06, GOLD);
    d.box(0, -0.16, 0, w, 0.2, 0.22, LW_STONE, { line: shade(LW_STONE, 0.5), south: shade(LW_STONE, 1.05), top: shade(LW_STONE, 1.12) });
  }



  /* ---- Site219：太湖石/叠石假山/小峰石/石附苔 atlas 模块（禁纯线稿、密实 kitbash；豪宅庭院·艮岳外围点景） ---- */
  function paintRockTaihu(d) {
    const ST = '#8a8680', STW = '#6a6660', TOP = '#9a9688', DARK = '#3a3834', HOLE = '#2a2824', MOSS = '#4a6a3a', MOSS2 = '#6a8a4a';
    // 基座丘
    d.box(-0.95, -0.75, 0, 0.95, 0.75, 0.42, ST, { line: shade(ST, 0.48), west: STW, top: shade(ST, 0.9) });
    d.box(-0.82, -0.62, 0.42, 0.82, 0.62, 0.72, shade(ST, 0.98), { line: shade(ST, 0.5), west: STW, top: TOP });
    // 太湖石主体：皱皱漏透 — 多层不规则体积 + 透空孔
    d.box(-0.7, -0.5, 0.72, 0.55, 0.48, 1.85, shade(ST, 1.02), { line: shade(ST, 0.48), west: STW, top: TOP });
    d.box(-0.35, -0.55, 1.4, 0.75, 0.35, 2.55, shade(ST, 1.05), { line: shade(ST, 0.5), west: STW, top: shade(ST, 1.12) });
    d.box(-0.55, -0.28, 2.2, 0.35, 0.45, 3.15, shade(ST, 1.0), { line: shade(ST, 0.48), west: STW, top: TOP });
    d.box(0.1, -0.4, 2.55, 0.62, 0.22, 3.55, shade(ST, 1.08), { line: shade(ST, 0.5), west: STW, top: shade(ST, 1.15) });
    // 侧枝石
    d.box(-0.95, -0.15, 1.1, -0.55, 0.35, 2.05, shade(ST, 0.95), { line: shade(ST, 0.5), west: STW, top: TOP });
    d.box(0.45, -0.1, 0.9, 0.95, 0.4, 1.75, shade(ST, 0.98), { line: shade(ST, 0.5), west: STW, top: TOP });
    // 透空孔（实体暗块，非纯线）
    for (const [x0, z0, x1, z1] of [
      [-0.35, 1.05, -0.05, 1.45], [0.05, 1.65, 0.38, 2.05], [-0.22, 2.45, 0.12, 2.85],
      [0.22, 2.85, 0.48, 3.2], [-0.72, 1.35, -0.48, 1.75], [0.55, 1.15, 0.78, 1.5],
    ]) {
      d.QS(-0.52, x0, z0, x1, z1, HOLE, shade(ST, 0.45));
      d.box(x0, -0.56, z0, x1, -0.48, z1, DARK, { line: false, noW: true, noS: true });
    }
    // 皱纹体积带
    for (let z = 0.9; z < 3.3; z += 0.22) {
      d.box(-0.55 + (z % 0.44) * 0.15, -0.58, z, 0.45 - (z % 0.44) * 0.1, -0.5, z + 0.08, shade(ST, z % 0.44 < 0.22 ? 1.12 : 0.9), { line: false, noW: true, noS: true });
    }
    for (let z = 0.85; z < 3.2; z += 0.18) d.seg([-0.6, -0.52, z], [0.5, -0.52, z], shade(ST, 0.7));
    // 石附苔点缀
    for (const [x, y, z] of [[-0.6, -0.4, 0.85], [0.4, 0.2, 1.5], [-0.2, 0.3, 2.3], [0.35, -0.25, 2.9], [-0.4, 0.15, 1.2]]) {
      d.box(x - 0.08, y - 0.08, z, x + 0.08, y + 0.08, z + 0.12, MOSS, { line: false, noW: true, noS: true });
      d.box(x - 0.05, y - 0.05, z + 0.1, x + 0.05, y + 0.05, z + 0.18, MOSS2, { line: false, noW: true, noS: true });
    }
  }
  function paintRockDieshi(d) {
    const ST = '#8a8070', STW = '#6a6258', TOP = '#9a9080', DARK = '#4a443c', MOSS = '#4a6a3a', MOSS2 = '#5a7a42';
    // 叠石组：三层错落堆叠（密实体积）
    const layers = [
      [-1.35, -1.0, 0, 1.35, 1.0, 0.55],
      [-1.1, -0.85, 0.55, 1.15, 0.9, 1.15],
      [-0.95, -0.55, 1.15, 0.55, 0.75, 1.85],
      [0.15, -0.7, 1.15, 1.2, 0.55, 2.05],
      [-0.55, -0.35, 1.85, 0.45, 0.55, 2.65],
      [0.25, -0.25, 2.05, 0.95, 0.4, 2.95],
      [-0.25, -0.15, 2.65, 0.55, 0.35, 3.45],
    ];
    for (let i = 0; i < layers.length; i++) {
      const [x0, y0, z0, x1, y1, z1] = layers[i];
      const col = shade(ST, 0.92 + (i % 3) * 0.06);
      d.box(x0, y0, z0, x1, y1, z1, col, { line: shade(ST, 0.48), west: STW, top: shade(TOP, 0.95 + (i % 2) * 0.08) });
      // 层缝
      d.seg([x0 + 0.05, y0 - 0.01, z0], [x1 - 0.05, y0 - 0.01, z0], shade(ST, 0.68));
    }
    // 缝隙暗块
    for (const [x0, z0, x1, z1] of [[-0.4, 0.7, -0.1, 1.0], [0.3, 1.4, 0.65, 1.7], [-0.15, 2.2, 0.2, 2.5]]) {
      d.box(x0, -0.9, z0, x1, -0.82, z1, DARK, { line: false, noW: true, noS: true });
    }
    // 苔斑密实
    for (let i = 0; i < 10; i++) {
      const x = -0.9 + (i % 5) * 0.4, y = -0.5 + ((i / 5) | 0) * 0.55, z = 0.35 + i * 0.28;
      d.box(x - 0.07, y - 0.07, z, x + 0.07, y + 0.07, z + 0.1, i % 2 ? MOSS : MOSS2, { line: false, noW: true, noS: true });
    }
    // 顶峰小石
    d.box(-0.12, -0.12, 3.45, 0.28, 0.22, 3.85, shade(ST, 1.1), { line: shade(ST, 0.5), west: STW, top: shade(ST, 1.18) });
  }
  function paintRockPeakS(d) {
    const ST = '#8a8070', STW = '#6a6258', TOP = '#9a9080', DARK = '#4a443c', MOSS = '#4a6a3a';
    // 小峰石：瘦高峰
    d.box(-0.55, -0.45, 0, 0.55, 0.45, 0.35, ST, { line: shade(ST, 0.48), west: STW, top: shade(ST, 0.9) });
    d.box(-0.42, -0.35, 0.35, 0.42, 0.35, 0.85, shade(ST, 0.98), { line: shade(ST, 0.5), west: STW, top: TOP });
    d.box(-0.32, -0.28, 0.85, 0.28, 0.28, 1.65, shade(ST, 1.02), { line: shade(ST, 0.48), west: STW, top: TOP });
    d.box(-0.22, -0.2, 1.65, 0.2, 0.2, 2.35, shade(ST, 1.05), { line: shade(ST, 0.5), west: STW, top: shade(ST, 1.12) });
    d.box(-0.14, -0.14, 2.35, 0.14, 0.14, 2.85, shade(ST, 1.08), { line: shade(ST, 0.5), west: STW, top: shade(ST, 1.15) });
    d.box(-0.08, -0.08, 2.85, 0.08, 0.08, 3.15, shade(ST, 1.1), { line: shade(ST, 0.5), west: STW, top: TOP });
    // 侧棱浮雕块
    d.QS(-0.33, -0.18, 1.0, 0.18, 1.5, shade(ST, 1.12), shade(ST, 0.55));
    d.QS(0.33, -0.15, 1.2, 0.15, 1.8, shade(STW, 1.05), shade(ST, 0.55));
    for (let z = 0.5; z < 2.8; z += 0.2) d.seg([-0.3, -0.29, z], [0.3, -0.29, z], shade(ST, 0.72));
    // 裂缝暗带
    for (let i = 0; i < 4; i++) {
      const z = 0.6 + i * 0.5;
      d.box(-0.05, -0.3, z, 0.05, -0.28, z + 0.25, DARK, { line: false, noW: true, noS: true });
    }
    // 苔
    for (const [x, z] of [[-0.25, 0.5], [0.2, 1.1], [-0.12, 1.9], [0.08, 2.5]]) {
      d.box(x - 0.06, -0.2, z, x + 0.06, -0.12, z + 0.1, MOSS, { line: false, noW: true, noS: true });
    }
  }
  function paintPlantRockMoss(d) {
    const ST = '#8a8070', STW = '#6a6258', TOP = '#9a9080';
    const MOSS = '#4a6a3a', MOSS2 = '#5a7a42', MOSS3 = '#3a5a2a', LEAF = '#6a8a48';
    // 小石基
    d.box(-0.55, -0.4, 0, 0.55, 0.4, 0.35, ST, { line: shade(ST, 0.48), west: STW, top: shade(ST, 0.92) });
    d.box(-0.4, -0.3, 0.35, 0.4, 0.3, 0.72, shade(ST, 1.0), { line: shade(ST, 0.5), west: STW, top: TOP });
    // 密实苔毯（多层体积，非线）
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const x = Math.cos(a) * 0.35, y = Math.sin(a) * 0.25;
      const col = i % 3 === 0 ? MOSS : i % 3 === 1 ? MOSS2 : MOSS3;
      d.box(x - 0.14, y - 0.12, 0.65, x + 0.14, y + 0.12, 0.95 + (i % 3) * 0.08, col, { line: false, noW: true, noS: true });
    }
    d.box(-0.28, -0.2, 0.9, 0.28, 0.2, 1.15, MOSS2, { line: shade(MOSS, 0.6), west: MOSS3, top: LEAF });
    // 小簇叶
    for (const [x, y, z] of [[-0.15, -0.05, 1.15], [0.12, 0.08, 1.2], [0.0, -0.12, 1.25], [0.2, -0.08, 1.1]]) {
      d.box(x - 0.08, y - 0.06, z, x + 0.08, y + 0.06, z + 0.22, LEAF, { line: false, noW: true, noS: true });
      d.box(x - 0.05, y - 0.04, z + 0.18, x + 0.05, y + 0.04, z + 0.32, shade(LEAF, 1.1), { line: false, noW: true, noS: true });
    }
    // 石面残留
    d.QS(-0.42, -0.25, 0.4, 0.25, 0.65, shade(ST, 1.1), shade(ST, 0.55));
  }

  /* ---- Site220：美人靠/飞来椅/坐槛/廊凳 atlas 模块（禁纯线稿、密实 kitbash；廊边亭边点景坐具） ---- */
  function paintSeatMeirenkao(d) {
    const WOOD = '#6a4a2c', WOOD_D = '#3a2214', WOOD_L = '#8a6a48', RED = '#a03830', RED_W = '#70241c';
    const ST = '#8a8070', STW = '#6a6258', GOLD = '#c8a040';
    // 石地栿
    d.box(-1.35, -0.38, 0, 1.35, 0.42, 0.18, ST, { line: shade(ST, 0.48), west: STW, top: shade(ST, 0.92) });
    for (let x = -1.1; x < 1.15; x += 0.28) d.seg([x, -0.39, 0.18], [x, 0.42, 0.18], shade(ST, 0.7));
    // 坐面厚板（临边微外挑）
    d.box(-1.28, -0.32, 0.18, 1.28, 0.36, 0.42, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.12) });
    d.box(-1.22, -0.28, 0.42, 1.22, 0.32, 0.52, shade(WOOD, 1.05), { line: WOOD_D, west: shade(WOOD, 0.85), top: WOOD_L });
    for (let x = -1.0; x < 1.05; x += 0.22) d.seg([x, -0.33, 0.52], [x, 0.33, 0.52], shade(WOOD, 0.75));
    // 望柱两端
    for (const x of [-1.2, 1.2]) {
      d.box(x - 0.12, -0.2, 0.18, x + 0.12, 0.28, 1.35, RED, { line: shade(RED, 0.5), west: RED_W, top: shade(RED, 1.1) });
      d.box(x - 0.14, -0.22, 1.3, x + 0.14, 0.3, 1.45, GOLD, { line: shade(GOLD, 0.55), west: shade(GOLD, 0.8), top: shade(GOLD, 1.15) });
    }
    // 鹅颈靠背（阶梯外挑实体块，非线稿）
    const steps = [
      [-1.05, 0.55, -0.05], [-0.75, 0.7, 0.08], [-0.4, 0.85, 0.18],
      [0.0, 0.95, 0.22], [0.4, 0.85, 0.18], [0.75, 0.7, 0.08], [1.05, 0.55, -0.05],
    ];
    for (const [x, z, oy] of steps) {
      d.box(x - 0.18, -0.18 + oy, 0.5, x + 0.18, 0.22 + oy, z, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.1) });
      d.box(x - 0.1, -0.12 + oy, z - 0.08, x + 0.1, 0.16 + oy, z + 0.12, shade(WOOD, 1.08), { line: WOOD_D, west: shade(WOOD, 0.85), top: WOOD_L });
    }
    // 寻杖横杆密实
    d.box(-1.15, -0.08, 1.05, 1.15, 0.18, 1.22, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.15) });
    for (let x = -0.95; x < 1.0; x += 0.2) d.QS(-0.1, x, 1.08, x + 0.08, 1.18, GOLD);
    // 竖棂密排
    for (let x = -0.95; x < 1.0; x += 0.16) {
      d.box(x - 0.035, -0.06, 0.52, x + 0.035, 0.12, 1.08, shade(WOOD, 0.95), { line: false, noW: true, noS: true });
    }
    // 坐面金钉装饰
    for (const x of [-0.8, -0.3, 0.3, 0.8]) d.QS(-0.34, x - 0.04, 0.44, x + 0.04, 0.5, GOLD);
  }
  function paintSeatFeilaichi(d) {
    const WOOD = '#6a4a2c', WOOD_D = '#3a2214', WOOD_L = '#8a6a48', RED = '#a03830', RED_W = '#70241c';
    const ST = '#8a8070', STW = '#6a6258', GOLD = '#c8a040';
    // 石础
    d.box(-0.55, -0.45, 0, 0.55, 0.45, 0.16, ST, { line: shade(ST, 0.48), west: STW, top: shade(ST, 0.92) });
    // 四腿
    for (const [x, y] of [[-0.38, -0.28], [0.38, -0.28], [-0.38, 0.28], [0.38, 0.28]]) {
      d.box(x - 0.08, y - 0.08, 0.16, x + 0.08, y + 0.08, 0.55, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.05) });
    }
    // 坐面
    d.box(-0.52, -0.4, 0.55, 0.52, 0.4, 0.72, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: WOOD_L });
    for (let x = -0.4; x < 0.42; x += 0.18) d.seg([x, -0.41, 0.72], [x, 0.41, 0.72], shade(WOOD, 0.75));
    // 飞来靠背：后腿上延 + 外挑弧背（阶梯实体）
    d.box(-0.42, 0.22, 0.72, 0.42, 0.38, 1.55, RED, { line: shade(RED, 0.5), west: RED_W, top: shade(RED, 1.1) });
    const arcs = [
      [-0.35, 0.85, 0.45], [-0.18, 1.05, 0.55], [0.0, 1.2, 0.62], [0.18, 1.05, 0.55], [0.35, 0.85, 0.45],
    ];
    for (const [x, z, oy] of arcs) {
      d.box(x - 0.12, 0.18 + oy * 0.15, 0.9, x + 0.12, 0.42 + oy * 0.15, z, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.12) });
    }
    d.box(-0.45, 0.35, 1.35, 0.45, 0.55, 1.52, WOOD, { line: WOOD_D, west: shade(WOOD, 0.85), top: WOOD_L });
    for (let x = -0.35; x < 0.38; x += 0.14) d.QS(-0.42, x, 1.38, x + 0.06, 1.48, GOLD);
    // 扶手
    for (const s of [-1, 1]) {
      d.box(s * 0.48 - 0.06, -0.25, 0.72, s * 0.48 + 0.06, 0.25, 0.95, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.1) });
      d.box(s * 0.48 - 0.08, 0.1, 0.9, s * 0.48 + 0.08, 0.4, 1.15, shade(WOOD, 1.05), { line: WOOD_D, west: shade(WOOD, 0.85), top: WOOD_L });
    }
    // 座前金钉
    for (const x of [-0.25, 0, 0.25]) d.QS(-0.41, x - 0.03, 0.62, x + 0.03, 0.68, GOLD);
  }
  function paintRailZuokan(d) {
    const WOOD = '#6a4a2c', WOOD_D = '#3a2214', WOOD_L = '#8a6a48';
    const ST = '#8a8070', STW = '#6a6258', GOLD = '#c8a040', RED = '#a03830';
    // 石槛座
    d.box(-1.2, -0.28, 0, 1.2, 0.32, 0.22, ST, { line: shade(ST, 0.48), west: STW, top: shade(ST, 0.92) });
    for (let x = -1.0; x < 1.05; x += 0.25) d.seg([x, -0.29, 0.22], [x, 0.32, 0.22], shade(ST, 0.7));
    // 木坐槛厚板（可坐）
    d.box(-1.15, -0.24, 0.22, 1.15, 0.28, 0.55, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: WOOD_L });
    d.box(-1.1, -0.2, 0.55, 1.1, 0.24, 0.68, shade(WOOD, 1.05), { line: WOOD_D, west: shade(WOOD, 0.85), top: shade(WOOD, 1.15) });
    for (let x = -0.95; x < 1.0; x += 0.2) d.seg([x, -0.25, 0.68], [x, 0.25, 0.68], shade(WOOD, 0.75));
    // 低靠背短棂
    for (let x = -0.95; x < 1.0; x += 0.18) {
      d.box(x - 0.04, 0.12, 0.68, x + 0.04, 0.26, 1.05, shade(WOOD, 0.95), { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.08) });
    }
    d.box(-1.05, 0.1, 1.0, 1.05, 0.28, 1.15, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.12) });
    for (let x = -0.85; x < 0.9; x += 0.22) d.QS(-0.12, x, 1.02, x + 0.08, 1.12, GOLD);
    // 端柱
    for (const x of [-1.1, 1.1]) {
      d.box(x - 0.1, -0.18, 0.22, x + 0.1, 0.28, 1.2, RED, { line: shade(RED, 0.5), west: shade(RED, 0.75), top: shade(RED, 1.1) });
      d.box(x - 0.12, -0.2, 1.15, x + 0.12, 0.3, 1.28, GOLD, { line: shade(GOLD, 0.55), west: shade(GOLD, 0.8), top: shade(GOLD, 1.15) });
    }
  }
  function paintBenchLang(d) {
    const WOOD = '#6a4a2c', WOOD_D = '#3a2214', WOOD_L = '#8a6a48';
    const ST = '#8a8070', STW = '#6a6258', GOLD = '#c8a040';
    // 双石腿
    d.box(-0.85, -0.28, 0, -0.55, 0.28, 0.42, ST, { line: shade(ST, 0.5), west: STW, top: shade(ST, 0.9) });
    d.box(0.55, -0.28, 0, 0.85, 0.28, 0.42, ST, { line: shade(ST, 0.5), west: STW, top: shade(ST, 0.9) });
    for (let z = 0.12; z < 0.4; z += 0.12) {
      d.seg([-0.84, -0.285, z], [-0.56, -0.285, z], shade(ST, 0.7));
      d.seg([0.56, -0.285, z], [0.84, -0.285, z], shade(ST, 0.7));
    }
    // 木坐面长板
    d.box(-1.05, -0.35, 0.42, 1.05, 0.35, 0.58, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: WOOD_L });
    d.box(-1.0, -0.3, 0.58, 1.0, 0.3, 0.68, shade(WOOD, 1.05), { line: WOOD_D, west: shade(WOOD, 0.85), top: shade(WOOD, 1.15) });
    for (let x = -0.85; x < 0.9; x += 0.22) d.seg([x, -0.36, 0.68], [x, 0.36, 0.68], shade(WOOD, 0.75));
    // 端面卷草块 + 金钉
    d.QS(-1.06, -0.28, 0.48, 0.28, 0.62, shade(WOOD, 1.1), WOOD_D);
    d.QS(1.06, -0.28, 0.48, 0.28, 0.62, shade(WOOD, 1.05), WOOD_D);
    for (const x of [-0.7, -0.25, 0.25, 0.7]) d.QS(-0.36, x - 0.04, 0.6, x + 0.04, 0.66, GOLD);
    // 中撑
    d.box(-0.1, -0.22, 0.1, 0.1, 0.22, 0.42, shade(ST, 0.95), { line: shade(ST, 0.5), west: STW, top: shade(ST, 1.05) });
  }




  /* ---- Site221：匾额/对联/小字牌/垂挂牌 atlas 模块（禁纯线稿、密实 kitbash；与 site201 plaque/vsign/banner 互补） ---- */
  function paintSignBiane(d) {
    /* 横匾：厚漆木匾身+金边如意角+浮雕字块实体（非线稿字） */
    const W = 2.6, H = 0.85;
    const BG = '#3a2418', BGW = '#2a1810', TOP = '#5a3a22', GOLD2 = '#d4a84a', RED2 = '#8a2820', CREAM = '#e8d8b0';
    d.box(-W / 2, -0.18, -H / 2, W / 2, 0.18, H / 2, BG, { line: shade(BG, 0.48), west: BGW, top: TOP });
    d.box(-W / 2 + 0.06, -0.2, -H / 2 + 0.06, W / 2 - 0.06, -0.12, H / 2 - 0.06, shade(BG, 1.08), { line: false, noW: true, noS: true });
    d.box(-W / 2 - 0.06, -0.14, -H / 2 - 0.06, W / 2 + 0.06, 0.14, -H / 2, GOLD2, { line: shade(GOLD2, 0.5), west: shade(GOLD2, 0.75), top: shade(GOLD2, 1.15) });
    d.box(-W / 2 - 0.06, -0.14, H / 2, W / 2 + 0.06, 0.14, H / 2 + 0.06, GOLD2, { line: shade(GOLD2, 0.5), west: shade(GOLD2, 0.75), top: shade(GOLD2, 1.15) });
    d.box(-W / 2 - 0.06, -0.14, -H / 2, -W / 2, 0.14, H / 2, GOLD2, { line: shade(GOLD2, 0.5), west: shade(GOLD2, 0.7), top: shade(GOLD2, 1.1) });
    d.box(W / 2, -0.14, -H / 2, W / 2 + 0.06, 0.14, H / 2, GOLD2, { line: shade(GOLD2, 0.5), west: shade(GOLD2, 0.7), top: shade(GOLD2, 1.1) });
    d.QS(-0.21, -W / 2 + 0.08, -H / 2 + 0.08, W / 2 - 0.08, -H / 2 + 0.14, shade(GOLD2, 1.25));
    d.QS(-0.21, -W / 2 + 0.08, H / 2 - 0.14, W / 2 - 0.08, H / 2 - 0.08, shade(GOLD2, 1.25));
    const chars = [-0.85, -0.28, 0.28, 0.85];
    for (let i = 0; i < chars.length; i++) {
      const cx = chars[i];
      d.box(cx - 0.2, -0.22, -0.22, cx + 0.2, -0.16, 0.22, CREAM, { line: shade(CREAM, 0.55), west: shade(CREAM, 0.85), top: shade(CREAM, 1.12) });
      d.box(cx - 0.12, -0.24, -0.12, cx + 0.12, -0.18, 0.12, shade(RED2, 1.05), { line: false, noW: true, noS: true });
      d.box(cx - 0.06, -0.245, -0.06, cx + 0.06, -0.19, 0.06, GOLD2, { line: false, noW: true, noS: true });
    }
    for (let i = 0; i < 4; i++) {
      const z = -H / 2 + 0.18 + i * 0.16;
      d.box(-W / 2 + 0.12, -0.19, z, W / 2 - 0.12, -0.17, z + 0.04, shade(BG, i % 2 ? 1.12 : 0.9), { line: false, noW: true, noS: true });
    }
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const px = sx * (W / 2 - 0.08), pz = sz * (H / 2 - 0.08);
      d.box(px - 0.1, -0.22, pz - 0.08, px + 0.1, -0.15, pz + 0.08, GOLD2, { line: shade(GOLD2, 0.5), west: shade(GOLD2, 0.75), top: shade(GOLD2, 1.2) });
      d.box(px - 0.05, -0.23, pz - 0.04, px + 0.05, -0.16, pz + 0.04, shade(GOLD2, 1.3), { line: false, noW: true, noS: true });
    }
    for (const sx of [-0.7, 0.7]) {
      d.box(sx - 0.06, -0.08, H / 2 + 0.02, sx + 0.06, 0.08, H / 2 + 0.14, shade(GOLD2, 0.9), { line: shade(GOLD2, 0.5), west: shade(GOLD2, 0.7), top: shade(GOLD2, 1.15) });
    }
  }
  function paintSignDuilian(d) {
    const W = 0.42, H = 2.35;
    const BG = '#2a1a12', BGW = '#1a1008', TOP = '#4a3020', GOLD2 = '#d4a84a', CREAM = '#e8d4a8', RED2 = '#7a2418';
    d.box(-W / 2, -0.12, 0, W / 2, 0.12, H, BG, { line: shade(BG, 0.48), west: BGW, top: TOP });
    d.box(-W / 2 - 0.04, -0.1, 0, -W / 2, 0.1, H, GOLD2, { line: shade(GOLD2, 0.5), west: shade(GOLD2, 0.7), top: shade(GOLD2, 1.1) });
    d.box(W / 2, -0.1, 0, W / 2 + 0.04, 0.1, H, GOLD2, { line: shade(GOLD2, 0.5), west: shade(GOLD2, 0.7), top: shade(GOLD2, 1.1) });
    d.box(-W / 2 - 0.04, -0.1, H, W / 2 + 0.04, 0.1, H + 0.05, GOLD2, { line: shade(GOLD2, 0.5), west: shade(GOLD2, 0.7), top: shade(GOLD2, 1.15) });
    d.box(-W / 2 - 0.04, -0.1, -0.05, W / 2 + 0.04, 0.1, 0, GOLD2, { line: shade(GOLD2, 0.5), west: shade(GOLD2, 0.7), top: shade(GOLD2, 1.1) });
    for (let i = 0; i < 5; i++) {
      const cz = 0.28 + i * 0.4;
      d.box(-0.12, -0.14, cz - 0.12, 0.12, -0.08, cz + 0.12, CREAM, { line: shade(CREAM, 0.55), west: shade(CREAM, 0.85), top: shade(CREAM, 1.1) });
      d.box(-0.07, -0.15, cz - 0.07, 0.07, -0.09, cz + 0.07, shade(RED2, 1.05), { line: false, noW: true, noS: true });
      d.box(-0.03, -0.155, cz - 0.03, 0.03, -0.095, cz + 0.03, GOLD2, { line: false, noW: true, noS: true });
    }
    for (let i = 0; i < 3; i++) {
      const x = -0.1 + i * 0.1;
      d.box(x, -0.125, 0.1, x + 0.03, -0.11, H - 0.1, shade(BG, i % 2 ? 1.12 : 0.88), { line: false, noW: true, noS: true });
    }
    d.box(-0.14, -0.14, H - 0.18, 0.14, 0.08, H - 0.02, RED2, { line: shade(RED2, 0.5), west: shade(RED2, 0.75), top: shade(RED2, 1.1) });
    d.box(-0.14, -0.14, 0.02, 0.14, 0.08, 0.16, RED2, { line: shade(RED2, 0.5), west: shade(RED2, 0.75), top: shade(RED2, 1.1) });
    d.box(-0.06, -0.06, H + 0.02, 0.06, 0.06, H + 0.14, GOLD2, { line: shade(GOLD2, 0.5), west: shade(GOLD2, 0.7), top: shade(GOLD2, 1.15) });
  }
  function paintSignZhaopaiS(d) {
    const W = 1.15, H = 0.55;
    const BG = '#4a3424', BGW = '#322418', TOP = '#6a4a32', GOLD2 = '#c89848', ST = '#8a8070', INK = '#1a1814';
    d.box(-W / 2 - 0.05, -0.1, -0.08, W / 2 + 0.05, 0.12, 0.06, ST, { line: shade(ST, 0.5), west: shade(ST, 0.75), top: shade(ST, 1.05) });
    d.box(-W / 2, -0.14, 0.06, W / 2, 0.1, H, BG, { line: shade(BG, 0.48), west: BGW, top: TOP });
    d.box(-W / 2 - 0.03, -0.12, 0.06, -W / 2, 0.08, H, GOLD2, { line: false, noW: true, noS: true });
    d.box(W / 2, -0.12, 0.06, W / 2 + 0.03, 0.08, H, GOLD2, { line: false, noW: true, noS: true });
    d.box(-W / 2 - 0.03, -0.12, H, W / 2 + 0.03, 0.08, H + 0.03, GOLD2, { line: false, noW: true, noS: true });
    for (const cx of [-0.32, 0, 0.32]) {
      d.box(cx - 0.14, -0.16, 0.18, cx + 0.14, -0.1, 0.42, shade('#e0d0a8', 1.0), { line: shade('#e0d0a8', 0.55), west: shade('#e0d0a8', 0.85), top: shade('#e0d0a8', 1.1) });
      d.box(cx - 0.08, -0.165, 0.24, cx + 0.08, -0.11, 0.36, INK, { line: false, noW: true, noS: true });
    }
    for (const [sx, sz] of [[-1, 0], [1, 0], [-1, 1], [1, 1]]) {
      const px = sx * (W / 2 - 0.08), pz = 0.12 + sz * (H - 0.2);
      d.box(px - 0.04, -0.15, pz - 0.03, px + 0.04, -0.11, pz + 0.03, GOLD2, { line: false, noW: true, noS: true });
    }
  }
  function paintSignHanging(d) {
    const W = 0.7, H = 1.55;
    const BG = '#5a3a22', BGW = '#3a2414', TOP = '#7a5232', GOLD2 = '#d4a84a', RED2 = '#a03028', CREAM = '#e8dcc0';
    d.box(-W / 2 - 0.08, -0.1, H - 0.08, W / 2 + 0.08, 0.1, H + 0.08, shade('#3a2a1a', 0.95), { line: shade('#3a2a1a', 0.5), west: shade('#3a2a1a', 0.7), top: GOLD2 });
    for (const sx of [-0.22, 0.22]) {
      d.box(sx - 0.03, -0.04, H - 0.55, sx + 0.03, 0.04, H - 0.05, GOLD2, { line: shade(GOLD2, 0.5), west: shade(GOLD2, 0.75), top: shade(GOLD2, 1.1) });
      for (let i = 0; i < 3; i++) {
        const z = H - 0.15 - i * 0.14;
        d.box(sx - 0.045, -0.05, z - 0.04, sx + 0.045, 0.05, z + 0.04, shade(GOLD2, 1.15), { line: false, noW: true, noS: true });
      }
    }
    d.box(-W / 2, -0.12, 0.15, W / 2, 0.12, H - 0.55, BG, { line: shade(BG, 0.48), west: BGW, top: TOP });
    d.box(-W / 2 - 0.04, -0.1, 0.15, -W / 2, 0.1, H - 0.55, GOLD2, { line: shade(GOLD2, 0.5), west: shade(GOLD2, 0.7), top: shade(GOLD2, 1.1) });
    d.box(W / 2, -0.1, 0.15, W / 2 + 0.04, 0.1, H - 0.55, GOLD2, { line: shade(GOLD2, 0.5), west: shade(GOLD2, 0.7), top: shade(GOLD2, 1.1) });
    for (let i = 0; i < 3; i++) {
      const cz = 0.35 + i * 0.28;
      d.box(-0.16, -0.14, cz - 0.1, 0.16, -0.08, cz + 0.1, CREAM, { line: shade(CREAM, 0.55), west: shade(CREAM, 0.85), top: shade(CREAM, 1.1) });
      d.box(-0.09, -0.145, cz - 0.06, 0.09, -0.09, cz + 0.06, RED2, { line: false, noW: true, noS: true });
    }
    for (let k = 0; k < 5; k++) {
      const tx = -W / 2 + 0.1 + k * (W - 0.2) / 4;
      d.box(tx - 0.04, -0.06, -0.05, tx + 0.04, 0.06, 0.18, RED2, { line: false, noW: true, noS: true });
      d.box(tx - 0.03, -0.05, -0.18, tx + 0.03, 0.05, -0.02, shade(GOLD2, 0.95), { line: false, noW: true, noS: true });
    }
    for (let i = 0; i < 4; i++) {
      const z = 0.25 + i * 0.2;
      d.box(-W / 2 + 0.08, -0.125, z, W / 2 - 0.08, -0.115, z + 0.04, shade(BG, i % 2 ? 1.12 : 0.88), { line: false, noW: true, noS: true });
    }
  }


  /* ---- Site222：抱鼓石/方门墩/小石炉（宅门·巷口点景；复用 site209 stone_baogu 画法并加方墩/石炉；禁纯线稿） ---- */
  /** 方门墩：须弥座 + 方石墩 + 鼓面浅雕 + 顶帽（比抱鼓更方正，民居/巷口常用） */
  function paintStoneMendun(d) {
    const stone = STONE, dark = shade(stone, 0.45), lite = shade(stone, 1.18), gold = shade(GOLD, 0.72);
    const moss = '#5a6a48';
    // 须弥座
    d.box(-0.48, -0.4, 0, 0.48, 0.4, 0.26, stone, { line: dark, south: shade(stone, 1.02), top: lite, west: shade(stone, 0.8) });
    d.QS(-0.02, -0.42, 0.06, 0.42, 0.2, shade(stone, 1.12));
    // 束腰
    d.box(-0.4, -0.34, 0.22, 0.4, 0.34, 0.36, shade(stone, 0.9), { line: dark, south: shade(stone, 1.06), top: lite });
    for (let x = -0.28; x < 0.3; x += 0.14) d.QS(-0.03, x, 0.26, x + 0.08, 0.32, gold);
    // 方墩身（密实石块 + 分面）
    d.box(-0.42, -0.36, 0.34, 0.42, 0.36, 1.05, stone, { line: dark, south: shade(stone, 1.04), top: shade(stone, 1.18), west: shade(stone, 0.82) });
    for (let z = 0.42; z < 1.0; z += 0.14) {
      d.seg([-0.4, -0.37, z], [0.4, -0.37, z], shade(stone, 0.72));
      d.seg([-0.43, -0.3, z], [-0.43, 0.3, z], shade(stone, 0.65));
    }
    for (let x = -0.28; x < 0.3; x += 0.18) d.seg([x, -0.37, 0.36], [x, -0.37, 1.02], shade(stone, 0.78));
    // 浅鼓面圆环（方墩上浅浮雕）
    for (const r of [0.26, 0.16, 0.08]) {
      d.QS(-0.37, -r, 0.58 - r * 0.12, r, 0.88 + r * 0.08, shade(stone, 1.1 + (0.26 - r) * 0.4));
    }
    d.QS(-0.38, -0.06, 0.68, 0.06, 0.8, shade(stone, 1.22));
    d.QS(-0.39, -0.03, 0.72, 0.03, 0.76, gold);
    // 角兽珠
    for (const [dx, dz] of [[-0.28, 0.48], [0.28, 0.48], [-0.28, 0.92], [0.28, 0.92]]) {
      d.QS(-0.36, dx - 0.05, dz - 0.05, dx + 0.05, dz + 0.05, shade(stone, 1.14));
    }
    // 顶帽莲瓣
    d.box(-0.38, -0.32, 1.0, 0.38, 0.32, 1.2, stone, { line: dark, south: lite, top: shade(stone, 1.26) });
    for (let a = 0; a < 5; a++) {
      const x = -0.24 + a * 0.12;
      d.QS(-0.3, x, 1.04, x + 0.08, 1.14, shade(stone, 1.18));
    }
    d.QS(-0.31, -0.1, 1.1, 0.1, 1.16, gold);
    // 苔点
    d.QS(-0.35, -0.3, 0.38, -0.18, 0.46, moss);
    d.QS(-0.34, 0.2, 0.9, 0.32, 0.98, shade(moss, 1.1));
  }
  /** 小石炉/香炉座：三足或方座 + 炉身 + 炉沿 + 轻烟孔（富户院门/巷口香火点景） */
  function paintStoneLu(d) {
    const stone = STONE, dark = shade(stone, 0.45), lite = shade(stone, 1.2), gold = shade(GOLD, 0.78);
    const ash = '#4a4038', ember = '#8a5030';
    // 方座
    d.box(-0.36, -0.3, 0, 0.36, 0.3, 0.22, stone, { line: dark, south: shade(stone, 1.02), top: lite, west: shade(stone, 0.8) });
    for (let x = -0.24; x < 0.26; x += 0.16) d.seg([x, -0.31, 0.22], [x, 0.3, 0.22], shade(stone, 0.7));
    // 三足（前二后一实体块）
    for (const [x, y] of [[-0.22, -0.18], [0.22, -0.18], [0, 0.2]]) {
      d.box(x - 0.07, y - 0.07, 0.18, x + 0.07, y + 0.07, 0.48, shade(stone, 0.92), { line: dark, west: shade(stone, 0.78), top: shade(stone, 1.08) });
    }
    // 炉身鼓腹
    d.box(-0.3, -0.26, 0.45, 0.3, 0.26, 0.95, stone, { line: dark, south: shade(stone, 1.05), top: shade(stone, 1.15), west: shade(stone, 0.84) });
    for (let z = 0.55; z < 0.9; z += 0.12) d.seg([-0.28, -0.27, z], [0.28, -0.27, z], shade(stone, 0.72));
    // 炉身浅纹环
    d.QS(-0.27, -0.22, 0.62, 0.22, 0.72, shade(stone, 1.12));
    d.QS(-0.28, -0.14, 0.64, 0.14, 0.7, gold);
    // 炉沿外翻
    d.box(-0.34, -0.3, 0.92, 0.34, 0.3, 1.08, stone, { line: dark, south: lite, top: shade(stone, 1.24), west: shade(stone, 0.85) });
    for (let a = 0; a < 8; a++) {
      const ang = a * Math.PI / 4;
      const dx = Math.cos(ang) * 0.22, dz = 1.0 + Math.sin(ang) * 0.04;
      d.QS(-0.31, dx - 0.04, dz - 0.04, dx + 0.04, dz + 0.04, shade(stone, 1.16));
    }
    // 炉口内灰 + 三足香孔
    d.box(-0.18, -0.14, 1.05, 0.18, 0.14, 1.12, ash, { line: shade(ash, 0.6), top: shade(ash, 1.1) });
    for (const x of [-0.1, 0, 0.1]) {
      d.QS(-0.16, x - 0.025, 1.08, x + 0.025, 1.14, ember);
      d.QS(-0.17, x - 0.012, 1.12, x + 0.012, 1.22, shade(ember, 1.15));
    }
    // 耳
    for (const s of [-1, 1]) {
      d.box(s * 0.32 - 0.05, -0.08, 0.7, s * 0.32 + 0.05, 0.08, 1.0, shade(stone, 0.95), { line: dark, west: shade(stone, 0.8), top: lite });
      d.QS(s * 0.34, -0.04, 0.78, 0.04, 0.92, gold);
    }
  }



  /* ---- Site223：盆景/砖花坛/石台 atlas 模块（禁纯线稿、密实 kitbash；宅院与街巷点景；与 site197Plants / site219Rockery 互补） ---- */
  function paintPotPenjing(d) {
    /* 盆景：釉陶盆 + 泥土丘 + 曲干小树 + 叶簇实体（非线稿） */
    const CER = '#7a4a32', CERW = '#5a3020', GLAZE = '#4a6a58', RIM = '#c8a878';
    const SOIL = '#4a3a28', TRUNK = '#5a3a28', TRUNK2 = '#3a2418';
    const LEAF = '#5a8a3a', LEAF2 = '#3a6a28', LEAF3 = '#7aaa48', FLOWER = '#c84838';
    // 盆座
    d.box(-0.42, -0.42, 0, 0.42, 0.42, 0.18, shade(CER, 0.88), { line: shade(CER, 0.5), west: CERW, top: shade(CER, 0.92) });
    // 盆身收腰
    d.box(-0.48, -0.48, 0.18, 0.48, 0.48, 0.55, CER, { line: shade(CER, 0.48), west: CERW, top: shade(CER, 0.95) });
    d.box(-0.44, -0.44, 0.55, 0.44, 0.44, 0.72, shade(CER, 1.05), { line: shade(CER, 0.5), west: CERW, top: RIM });
    d.QS(-0.485, -0.4, 0.32, 0.4, 0.48, GLAZE, shade(CER, 0.55));
    d.QS(-0.485, -0.36, 0.52, 0.36, 0.62, shade(RIM, 0.95), shade(CER, 0.55));
    for (let z = 0.22; z < 0.7; z += 0.1) d.seg([-0.49, -0.49, z], [0.49, -0.49, z], shade(CER, 0.7));
    // 泥土丘
    d.box(-0.34, -0.34, 0.72, 0.34, 0.34, 0.92, SOIL, { line: shade(SOIL, 0.55), west: shade(SOIL, 0.85), top: shade(SOIL, 1.08) });
    d.box(-0.22, -0.18, 0.92, 0.2, 0.2, 1.02, shade(SOIL, 1.05), { line: false, noW: true, noS: true });
    // 小石点缀
    d.box(-0.28, 0.1, 0.92, -0.14, 0.28, 1.08, '#8a8070', { line: shade('#8a8070', 0.5), west: '#6a6258', top: '#9a9080' });
    d.box(0.12, -0.28, 0.92, 0.28, -0.1, 1.05, '#7a7668', { line: shade('#7a7668', 0.5), west: '#5a5648', top: '#8a8678' });
    // 曲干（多段箱体）
    d.box(-0.06, -0.06, 1.0, 0.08, 0.08, 1.55, TRUNK, { line: TRUNK2, west: shade(TRUNK, 0.8), top: shade(TRUNK, 1.1) });
    d.box(0.02, -0.05, 1.45, 0.22, 0.08, 1.85, TRUNK, { line: TRUNK2, west: shade(TRUNK, 0.78), top: shade(TRUNK, 1.08) });
    d.box(-0.18, -0.04, 1.7, 0.05, 0.1, 2.15, shade(TRUNK, 0.95), { line: TRUNK2, west: shade(TRUNK, 0.75), top: shade(TRUNK, 1.1) });
    d.box(0.08, -0.02, 1.95, 0.28, 0.1, 2.35, shade(TRUNK, 1.02), { line: TRUNK2, west: shade(TRUNK, 0.8), top: shade(TRUNK, 1.12) });
    for (let z = 1.1; z < 2.2; z += 0.18) d.seg([-0.07, -0.07, z], [0.09, -0.07, z], shade(TRUNK, 1.15));
    // 叶簇实体（椭圆填充叠箱）
    for (const [dx, dy, zz, sx, sy, sz, c1, c2] of [
      [-0.15, -0.05, 2.2, 0.35, 0.28, 0.45, LEAF, LEAF2],
      [0.2, 0.05, 2.35, 0.32, 0.26, 0.4, LEAF3, LEAF],
      [0.05, -0.15, 2.5, 0.28, 0.22, 0.35, LEAF, LEAF2],
      [-0.05, 0.12, 2.55, 0.25, 0.2, 0.3, LEAF3, LEAF],
      [0.18, -0.08, 2.65, 0.22, 0.18, 0.28, LEAF, LEAF3],
    ]) {
      d.box(dx - sx / 2, dy - sy / 2, zz, dx + sx / 2, dy + sy / 2, zz + sz, c1, { line: shade(c1, 0.55), west: c2, top: shade(c1, 1.12) });
      d.box(dx - sx / 3, dy - sy / 3, zz + sz * 0.35, dx + sx / 3, dy + sy / 3, zz + sz * 0.85, shade(c1, 1.08), { line: false, noW: true, noS: true });
    }
    // 点花
    for (const [dx, dy, zz] of [[-0.1, 0.05, 2.55], [0.22, -0.02, 2.7], [0.0, -0.12, 2.45]]) {
      d.box(dx - 0.05, dy - 0.05, zz, dx + 0.05, dy + 0.05, zz + 0.08, FLOWER, { line: false, noW: true, noS: true });
    }
  }
  function paintBedHuatan(d) {
    /* 砖花坛：密实砖砌四面 + 灰缝 + 角柱 + 泥土 + 花叶簇 */
    const BR = '#9a8a78', BRW = '#7a6a58', MORT = '#b8b0a0', TOP = '#aea090';
    const SOIL = '#4a3a28', LEAF = '#5a8a3a', LEAF2 = '#3a6a28', R1 = '#c84838', R2 = '#e8a838', R3 = '#d86040';
    const W = 1.7, D = 1.15, H = 0.72;
    // 基座条石
    d.box(-W / 2 - 0.06, -D / 2 - 0.06, 0, W / 2 + 0.06, D / 2 + 0.06, 0.14, '#8a8070', { line: shade('#8a8070', 0.5), west: '#6a6258', top: '#9a9080' });
    // 四面砖墙
    d.box(-W / 2, -D / 2, 0.14, W / 2, -D / 2 + 0.22, H, BR, { line: shade(BR, 0.5), west: BRW, top: TOP });
    d.box(-W / 2, D / 2 - 0.22, 0.14, W / 2, D / 2, H, BR, { line: shade(BR, 0.5), west: BRW, top: TOP });
    d.box(-W / 2, -D / 2 + 0.2, 0.14, -W / 2 + 0.22, D / 2 - 0.2, H, BR, { line: shade(BR, 0.5), west: BRW, top: TOP });
    d.box(W / 2 - 0.22, -D / 2 + 0.2, 0.14, W / 2, D / 2 - 0.2, H, BR, { line: shade(BR, 0.5), west: BRW, top: TOP });
    // 砖缝密实
    for (let z = 0.26; z < H; z += 0.12) {
      d.seg([-W / 2 + 0.02, -D / 2 - 0.01, z], [W / 2 - 0.02, -D / 2 - 0.01, z], MORT);
      d.seg([-W / 2 - 0.01, -D / 2 + 0.02, z], [-W / 2 - 0.01, D / 2 - 0.02, z], shade(MORT, 0.9));
    }
    for (let x = -W / 2 + 0.2; x < W / 2; x += 0.28) {
      d.seg([x, -D / 2 - 0.01, 0.2], [x, -D / 2 - 0.01, H - 0.04], shade(BR, 0.72));
    }
    // 角柱
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const px = sx * (W / 2 - 0.08), py = sy * (D / 2 - 0.08);
      d.box(px - 0.1, py - 0.1, 0.14, px + 0.1, py + 0.1, H + 0.1, shade(BR, 0.95), { line: shade(BR, 0.48), west: BRW, top: TOP });
      d.box(px - 0.08, py - 0.08, H + 0.1, px + 0.08, py + 0.08, H + 0.18, '#8a8070', { line: false, noW: true, noS: true });
    }
    // 泥土
    d.box(-W / 2 + 0.24, -D / 2 + 0.24, 0.5, W / 2 - 0.24, D / 2 - 0.24, H - 0.02, SOIL, { line: shade(SOIL, 0.55), west: shade(SOIL, 0.85), top: shade(SOIL, 1.05) });
    // 花叶簇密实
    for (const [dx, dy, zz, sx, sy, sz, c1, c2] of [
      [-0.45, -0.2, H, 0.35, 0.28, 0.55, LEAF, LEAF2],
      [0.35, 0.15, H + 0.05, 0.32, 0.26, 0.5, LEAF2, LEAF],
      [-0.1, 0.25, H, 0.3, 0.24, 0.48, LEAF, LEAF2],
      [0.4, -0.25, H + 0.08, 0.28, 0.22, 0.42, shade(LEAF, 1.1), LEAF],
      [-0.35, 0.05, H + 0.15, 0.25, 0.2, 0.38, LEAF2, LEAF],
      [0.05, -0.15, H + 0.2, 0.28, 0.22, 0.4, LEAF, LEAF2],
    ]) {
      d.box(dx - sx / 2, dy - sy / 2, zz, dx + sx / 2, dy + sy / 2, zz + sz, c1, { line: shade(c1, 0.55), west: c2, top: shade(c1, 1.1) });
    }
    for (const [dx, dy, zz, c] of [
      [-0.4, -0.15, H + 0.4, R1], [0.3, 0.1, H + 0.45, R2], [-0.05, 0.2, H + 0.35, R3],
      [0.35, -0.2, H + 0.38, R1], [-0.25, 0.1, H + 0.5, R2], [0.1, -0.05, H + 0.55, R3],
    ]) {
      d.box(dx - 0.06, dy - 0.06, zz, dx + 0.06, dy + 0.06, zz + 0.1, c, { line: false, noW: true, noS: true });
    }
  }
  function paintStoneShitai(d) {
    /* 石台/条石座：分层条石 + 束腰 + 浮雕边 + 台面 */
    const ST = '#8a8478', STW = '#6a6458', TOP = '#a09a8c', EDGE = '#9a9488';
    const W = 1.9, D = 0.85;
    // 基座
    d.box(-W / 2 - 0.05, -D / 2 - 0.05, 0, W / 2 + 0.05, D / 2 + 0.05, 0.22, shade(ST, 0.9), { line: shade(ST, 0.5), west: STW, top: shade(ST, 0.95) });
    for (let x = -W / 2 + 0.15; x < W / 2; x += 0.35) {
      d.seg([x, -D / 2 - 0.02, 0.08], [x, -D / 2 - 0.02, 0.2], shade(ST, 0.7));
    }
    // 束腰
    d.box(-W / 2 + 0.08, -D / 2 + 0.06, 0.22, W / 2 - 0.08, D / 2 - 0.06, 0.42, shade(ST, 0.95), { line: shade(ST, 0.48), west: STW, top: EDGE });
    d.QS(-0.01, -W / 2 + 0.15, 0.28, W / 2 - 0.15, 0.36, shade(EDGE, 1.08), shade(ST, 0.55));
    // 浮雕纹带
    for (let i = 0; i < 5; i++) {
      const x = -W / 2 + 0.25 + i * 0.35;
      d.box(x - 0.08, -D / 2 + 0.02, 0.26, x + 0.08, -D / 2 + 0.1, 0.38, shade(ST, 1.08), { line: false, noW: true, noS: true });
    }
    // 上台面厚板
    d.box(-W / 2, -D / 2, 0.42, W / 2, D / 2, 0.62, ST, { line: shade(ST, 0.48), west: STW, top: TOP });
    d.box(-W / 2 + 0.06, -D / 2 + 0.06, 0.62, W / 2 - 0.06, D / 2 - 0.06, 0.7, shade(ST, 1.05), { line: shade(ST, 0.5), west: shade(STW, 1.05), top: shade(TOP, 1.08) });
    // 台面分缝
    for (let x = -W / 2 + 0.4; x < W / 2; x += 0.45) {
      d.seg([x, -D / 2 + 0.08, 0.705], [x, D / 2 - 0.08, 0.705], shade(ST, 0.75));
    }
    // 角兽足感
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const px = sx * (W / 2 - 0.12), py = sy * (D / 2 - 0.1);
      d.box(px - 0.1, py - 0.08, 0, px + 0.1, py + 0.08, 0.28, shade(ST, 0.85), { line: shade(ST, 0.48), west: STW, top: EDGE });
    }
    // 苔点
    for (const [dx, dy, zz] of [[-0.7, 0.25, 0.7], [0.55, -0.2, 0.7], [-0.2, -0.28, 0.42]]) {
      d.box(dx - 0.06, dy - 0.05, zz, dx + 0.06, dy + 0.05, zz + 0.05, '#4a6a3a', { line: false, noW: true, noS: true });
    }
  }
  /* ---- Site224：石狮/小蹲兽（门兽点景；≠屋脊兽；禁纯线稿、密实 kitbash） ---- */
  /** 石狮：须弥座 + 蹲踞狮身 + 卷鬃头 + 前爪绣球（宅门/广场/衙署庙前） */
  function paintStoneShishi(d) {
    const stone = STONE, dark = shade(stone, 0.45), lite = shade(stone, 1.2), gold = shade(GOLD, 0.78);
    const moss = '#5a6a48', ribbon = '#a8342a';
    // 须弥座
    d.box(-0.55, -0.48, 0, 0.55, 0.48, 0.28, stone, { line: dark, south: shade(stone, 1.02), top: lite, west: shade(stone, 0.8) });
    d.QS(-0.02, -0.5, 0.08, 0.5, 0.22, shade(stone, 1.12));
    d.box(-0.48, -0.42, 0.24, 0.48, 0.42, 0.4, shade(stone, 0.92), { line: dark, south: shade(stone, 1.06), top: lite });
    for (let x = -0.32; x < 0.34; x += 0.16) d.QS(-0.03, x, 0.28, x + 0.1, 0.36, gold);
    // 狮身蹲踞（胸+臀实体块）
    d.box(-0.42, -0.2, 0.38, 0.38, 0.42, 1.15, stone, { line: dark, south: shade(stone, 1.04), top: shade(stone, 1.16), west: shade(stone, 0.82) });
    d.box(-0.36, -0.38, 0.42, 0.32, -0.05, 1.05, shade(stone, 0.96), { line: dark, south: shade(stone, 1.08), top: lite, west: shade(stone, 0.78) });
    // 肋线/鳞片浅浮雕
    for (let z = 0.55; z < 1.05; z += 0.12) d.seg([-0.34, -0.39, z], [0.28, -0.39, z], shade(stone, 0.7));
    for (let x = -0.22; x < 0.26; x += 0.16) d.seg([x, -0.39, 0.45], [x, -0.39, 1.0], shade(stone, 0.78));
    // 前爪
    for (const x of [-0.22, 0.12]) {
      d.box(x - 0.1, -0.42, 0.38, x + 0.1, -0.22, 0.72, shade(stone, 0.94), { line: dark, west: shade(stone, 0.8), top: lite });
      d.QS(-0.36, x - 0.08, 0.4, x + 0.08, 0.52, shade(stone, 1.14));
      for (const dx of [-0.05, 0, 0.05]) d.QS(-0.38, x + dx - 0.015, 0.38, x + dx + 0.015, 0.46, dark);
    }
    // 绣球
    d.box(0.18, -0.48, 0.42, 0.48, -0.22, 0.78, shade(stone, 0.98), { line: dark, south: lite, top: shade(stone, 1.18) });
    for (const r of [0.1, 0.06]) d.QS(-0.4, 0.28 - r, 0.55 - r * 0.2, 0.38 + r, 0.7 + r * 0.15, shade(stone, 1.1 + (0.1 - r)));
    d.QS(-0.42, 0.3, 0.58, 0.36, 0.66, gold);
    // 头 + 卷鬃（密实块，非线稿）
    d.box(-0.28, -0.32, 1.05, 0.28, 0.22, 1.55, stone, { line: dark, south: shade(stone, 1.06), top: shade(stone, 1.2), west: shade(stone, 0.84) });
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2;
      const dx = Math.cos(a) * 0.3, dz = 1.3 + Math.sin(a) * 0.22;
      d.QS(-0.3, dx - 0.07, dz - 0.07, dx + 0.07, dz + 0.07, k % 2 ? shade(stone, 1.14) : shade(stone, 0.92));
    }
    // 面：眼·鼻·口
    d.QS(-0.34, -0.16, 1.28, -0.06, 1.36, dark);
    d.QS(-0.34, 0.06, 1.28, 0.16, 1.36, dark);
    d.QS(-0.35, -0.04, 1.22, 0.04, 1.3, shade(stone, 1.22));
    d.QS(-0.36, -0.1, 1.14, 0.1, 1.22, shade(ribbon, 0.85));
    d.QS(-0.37, -0.06, 1.16, 0.06, 1.2, shade(ribbon, 1.1));
    // 耳
    for (const s of [-1, 1]) {
      d.box(s * 0.22 - 0.06, -0.28, 1.42, s * 0.22 + 0.06, -0.16, 1.58, shade(stone, 0.95), { line: dark, top: lite });
    }
    // 项圈铃
    d.box(-0.22, -0.28, 1.0, 0.22, 0.05, 1.1, ribbon, { line: shade(ribbon, 0.5), top: shade(ribbon, 1.15) });
    d.QS(-0.3, -0.05, 0.98, 0.05, 1.08, gold);
    // 后臀尾卷
    d.box(0.28, 0.15, 0.7, 0.48, 0.4, 1.05, shade(stone, 0.9), { line: dark, west: shade(stone, 0.75), top: lite });
    d.QS(-0.28, 0.32, 1.0, 0.46, 1.12, shade(stone, 1.1));
    // 苔点
    d.QS(-0.4, -0.4, 0.3, -0.28, 0.38, moss);
    d.QS(-0.38, 0.25, 0.85, 0.38, 0.95, shade(moss, 1.1));
  }
  /** 小蹲兽：矮座 + 紧凑蹲身 + 小鬃头（桥头/巷口次位点景） */
  function paintStoneShishiS(d) {
    const stone = STONE, dark = shade(stone, 0.45), lite = shade(stone, 1.18), gold = shade(GOLD, 0.72);
    const moss = '#5a6a48';
    d.box(-0.38, -0.32, 0, 0.38, 0.32, 0.2, stone, { line: dark, south: shade(stone, 1.02), top: lite, west: shade(stone, 0.8) });
    d.QS(-0.02, -0.34, 0.06, 0.34, 0.16, shade(stone, 1.1));
    // 蹲身
    d.box(-0.3, -0.18, 0.18, 0.28, 0.28, 0.78, stone, { line: dark, south: shade(stone, 1.04), top: shade(stone, 1.14), west: shade(stone, 0.82) });
    d.box(-0.26, -0.3, 0.2, 0.22, -0.02, 0.7, shade(stone, 0.96), { line: dark, south: shade(stone, 1.08), top: lite });
    for (let z = 0.32; z < 0.68; z += 0.1) d.seg([-0.24, -0.31, z], [0.2, -0.31, z], shade(stone, 0.72));
    // 前爪
    for (const x of [-0.16, 0.08]) {
      d.box(x - 0.07, -0.32, 0.18, x + 0.07, -0.16, 0.48, shade(stone, 0.94), { line: dark, top: lite });
      d.QS(-0.28, x - 0.05, 0.2, x + 0.05, 0.3, shade(stone, 1.12));
    }
    // 头
    d.box(-0.2, -0.24, 0.68, 0.2, 0.14, 1.05, stone, { line: dark, south: shade(stone, 1.06), top: shade(stone, 1.18), west: shade(stone, 0.84) });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      const dx = Math.cos(a) * 0.2, dz = 0.86 + Math.sin(a) * 0.14;
      d.QS(-0.22, dx - 0.05, dz - 0.05, dx + 0.05, dz + 0.05, k % 2 ? shade(stone, 1.12) : shade(stone, 0.9));
    }
    d.QS(-0.26, -0.1, 0.86, -0.02, 0.94, dark);
    d.QS(-0.26, 0.02, 0.86, 0.1, 0.94, dark);
    d.QS(-0.27, -0.06, 0.78, 0.06, 0.86, shade(stone, 1.2));
    d.QS(-0.24, -0.04, 0.72, 0.04, 0.78, gold);
    // 尾卷
    d.box(0.2, 0.1, 0.45, 0.34, 0.28, 0.72, shade(stone, 0.9), { line: dark, top: lite });
    d.QS(-0.22, -0.22, 0.22, -0.12, 0.3, moss);
  }


/* ---- Site225：宫灯/纱灯/立灯（街巷宅院挂灯·立灯点景；≠石灯笼/挂灯杆/圆灯笼串；禁纯线稿、密实 kitbash） ---- */
  /** 宫灯：六角木框 + 纱绢面 + 金顶宝盖 + 流苏（门楣下/亭角挂） */
  function paintLanternGong(d) {
    const WOOD = '#5a2a1c', WOOD_D = '#2a0e08', GOLD = '#c8a040', SILK = '#e8d8a8', SILK2 = '#d8c090';
    const RED = '#c8322c', CREAM = '#f0e8d0';
    // 吊绳/钩
    d.seg([0, 0, 2.55], [0, 0, 2.35], WOOD_D, 2);
    d.box(-0.06, -0.06, 2.32, 0.06, 0.06, 2.42, GOLD, { line: shade(GOLD, 0.55), top: '#e8c868' });
    // 宝盖顶
    d.box(-0.42, -0.42, 2.15, 0.42, 0.42, 2.32, GOLD, { line: shade(GOLD, 0.5), west: shade(GOLD, 0.78), top: '#e8c868' });
    d.box(-0.28, -0.28, 2.05, 0.28, 0.28, 2.15, shade(GOLD, 0.92), { line: shade(GOLD, 0.5), west: shade(GOLD, 0.75), top: shade(GOLD, 1.1) });
    // 六角上框
    d.box(-0.38, -0.38, 1.95, 0.38, 0.38, 2.08, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.08) });
    for (let a = 0; a < 6; a++) {
      const ang = a * Math.PI / 3;
      const dx = Math.cos(ang) * 0.34, dy = Math.sin(ang) * 0.34;
      d.box(dx - 0.04, dy - 0.04, 1.15, dx + 0.04, dy + 0.04, 2.0, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: shade(WOOD, 1.05) });
    }
    // 纱绢面（密实色块，非线稿）
    d.box(-0.32, -0.32, 1.2, 0.32, 0.32, 1.95, SILK, { line: shade(SILK, 0.55), west: SILK2, top: CREAM });
    d.QS(-0.33, -0.26, 1.3, 0.26, 1.85, CREAM, shade(SILK, 0.6));
    d.QS(-0.34, -0.18, 1.4, 0.18, 1.75, 'rgba(255,240,180,0.55)');
    // 框内竖棱
    for (const x of [-0.16, 0, 0.16]) d.seg([x, -0.335, 1.25], [x, -0.335, 1.9], shade(WOOD, 0.85));
    for (const z of [1.45, 1.7]) d.seg([-0.28, -0.335, z], [0.28, -0.335, z], shade(WOOD, 0.9));
    // 下框 + 托盘
    d.box(-0.38, -0.38, 1.05, 0.38, 0.38, 1.2, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.08) });
    d.box(-0.3, -0.3, 0.95, 0.3, 0.3, 1.08, GOLD, { line: shade(GOLD, 0.55), west: shade(GOLD, 0.78), top: '#e8c868' });
    // 流苏
    for (const [dx, dy] of [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22], [0, -0.28], [0, 0.28]]) {
      d.box(dx - 0.03, dy - 0.03, 0.55, dx + 0.03, dy + 0.03, 0.98, RED, { line: shade(RED, 0.5), top: shade(RED, 1.15) });
      d.QS(-0.02, dx - 0.025, 0.5, dx + 0.025, 0.58, GOLD);
    }
  }
  /** 纱灯：竹骨圆筒 + 薄纱透光 + 上下木箍 + 短穗（巷口/门楣轻挂） */
  function paintLanternSha(d) {
    const BAM = '#8a6a38', BAM_D = '#5a4020', SILK = '#f0d8c0', SILK2 = '#e0c0a0', GOLD = '#c8a040';
    const RED = '#b83830', CREAM = '#fff0d8';
    d.seg([0, 0, 2.15], [0, 0, 1.98], BAM_D, 2);
    d.box(-0.08, -0.08, 1.92, 0.08, 0.08, 2.02, GOLD, { line: shade(GOLD, 0.55), top: '#e8c868' });
    // 上箍
    d.box(-0.36, -0.36, 1.78, 0.36, 0.36, 1.92, BAM, { line: BAM_D, west: shade(BAM, 0.8), top: shade(BAM, 1.1) });
    for (let a = 0; a < 8; a++) {
      const ang = a * Math.PI / 4;
      const dx = Math.cos(ang) * 0.3, dy = Math.sin(ang) * 0.3;
      d.box(dx - 0.025, dy - 0.025, 0.95, dx + 0.025, dy + 0.025, 1.82, shade(BAM, 0.95), { line: BAM_D, west: shade(BAM, 0.75), top: shade(BAM, 1.05) });
    }
    // 纱面筒体密实
    d.box(-0.32, -0.32, 1.0, 0.32, 0.32, 1.8, SILK, { line: shade(SILK, 0.55), west: SILK2, top: CREAM });
    d.QS(-0.33, -0.24, 1.1, 0.24, 1.7, CREAM, shade(SILK, 0.6));
    d.QS(-0.34, -0.14, 1.25, 0.14, 1.55, 'rgba(255,230,180,0.45)');
    // 纱纹横带
    for (const z of [1.2, 1.4, 1.6]) d.seg([-0.3, -0.335, z], [0.3, -0.335, z], shade(SILK2, 0.85));
    // 下箍
    d.box(-0.36, -0.36, 0.85, 0.36, 0.36, 1.0, BAM, { line: BAM_D, west: shade(BAM, 0.8), top: shade(BAM, 1.08) });
    d.box(-0.2, -0.2, 0.75, 0.2, 0.2, 0.88, GOLD, { line: shade(GOLD, 0.55), top: '#e8c868' });
    // 短穗
    for (const dx of [-0.18, 0, 0.18]) {
      d.box(dx - 0.025, -0.02, 0.42, dx + 0.025, 0.02, 0.78, RED, { line: shade(RED, 0.5), top: shade(RED, 1.12) });
    }
  }
  /** 立灯/灯架：石座 + 木架 + 横挑臂 + 挂宫灯头（廊前/桥栏旁；≠石灯笼/挂灯杆） */
  function paintLanternStand(d) {
    const ST = '#8a8070', STW = '#6a6258', WOOD = '#5a2a1c', WOOD_D = '#2a0e08', GOLD = '#c8a040';
    const SILK = '#e8d0a0', RED = '#c8322c';
    // 石座
    d.box(-0.32, -0.32, 0, 0.32, 0.32, 0.28, ST, { line: shade(ST, 0.5), west: STW, top: shade(ST, 0.92) });
    for (let z = 0.1; z < 0.26; z += 0.1) d.seg([-0.3, -0.325, z], [0.3, -0.325, z], shade(ST, 0.7));
    // 立柱
    d.box(-0.08, -0.08, 0.28, 0.08, 0.08, 2.35, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.1) });
    for (let z = 0.5; z < 2.2; z += 0.28) d.seg([-0.09, -0.09, z], [0.09, -0.09, z], shade(WOOD, 1.12));
    // 斜撑
    d.box(-0.06, -0.45, 1.55, 0.06, -0.05, 1.72, WOOD, { line: WOOD_D, west: shade(WOOD, 0.75), top: shade(WOOD, 1.05) });
    d.box(-0.05, -0.55, 1.2, 0.05, -0.08, 1.35, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: shade(WOOD, 1.05) });
    // 横挑臂
    d.box(-0.07, -0.85, 2.15, 0.07, 0.12, 2.3, WOOD, { line: WOOD_D, west: shade(WOOD, 0.75), top: shade(WOOD, 1.08) });
    d.box(-0.1, -0.1, 2.28, 0.1, 0.1, 2.45, GOLD, { line: shade(GOLD, 0.55), west: shade(GOLD, 0.8), top: '#e8c868' });
    // 吊绳 + 小宫灯头（密实块）
    d.seg([0, -0.7, 2.18], [0, -0.7, 1.95], WOOD_D, 2);
    d.box(-0.22, -0.92, 1.85, 0.22, -0.48, 1.98, GOLD, { line: shade(GOLD, 0.5), west: shade(GOLD, 0.78), top: '#e8c868' });
    d.box(-0.2, -0.9, 1.35, 0.2, -0.5, 1.85, SILK, { line: shade(SILK, 0.55), west: shade(SILK, 0.85), top: shade(SILK, 1.1) });
    d.QS(-0.21, -0.88, 1.45, -0.52, 1.75, 'rgba(255,235,170,0.5)');
    for (const x of [-0.08, 0.08]) d.seg([x, -0.92, 1.4], [x, -0.92, 1.8], shade(WOOD, 0.85));
    d.box(-0.2, -0.9, 1.22, 0.2, -0.5, 1.38, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.05) });
    d.box(-0.04, -0.72, 0.95, 0.04, -0.68, 1.25, RED, { line: shade(RED, 0.5), top: shade(RED, 1.12) });
  }


/* ---- Site226：竹篱/花篱/柴扉（巷口·宅侧·园边·桥头小径点景；≠漏窗花墙/内隔断屏；禁纯线稿、密实 kitbash） ---- */
  /** 竹篱：密排竹竿 + 横篾绑 + 石脚（巷口/桥头小径侧；室外篱笆≠漏窗） */
  function paintFenceZhuli(d) {
    const BAM = '#7a9a48', BAM_D = '#3a5020', BAM_L = '#a8c868', BIND = '#8a6a38', BIND_D = '#4a3018';
    const ST = '#8a8070', STW = '#6a6258', LEAF = '#4a7830', CREAM = '#e8e0c8';
    // 石脚基座
    d.box(-1.05, -0.18, 0, 1.05, 0.18, 0.22, ST, { line: shade(ST, 0.5), west: STW, top: shade(ST, 0.92) });
    for (let x = -0.95; x < 0.95; x += 0.28) d.seg([x, -0.185, 0.08], [x + 0.22, -0.185, 0.08], shade(ST, 0.7));
    // 密排竹竿（实体柱，非线稿）
    for (let i = -5; i <= 5; i++) {
      const x = i * 0.18;
      const h = 1.15 + (Math.abs(i) % 3) * 0.06;
      d.box(x - 0.055, -0.07, 0.2, x + 0.055, 0.07, h, BAM, { line: BAM_D, west: shade(BAM, 0.78), top: BAM_L });
      // 竹节环
      for (let z = 0.38; z < h - 0.08; z += 0.28) {
        d.box(x - 0.065, -0.08, z - 0.025, x + 0.065, 0.08, z + 0.025, BAM_D, { line: shade(BAM_D, 0.7), top: BAM_L });
      }
      // 梢端斜切尖
      d.box(x - 0.04, -0.05, h - 0.02, x + 0.04, 0.05, h + 0.12, BAM_L, { line: BAM_D, west: shade(BAM, 0.85), top: CREAM });
    }
    // 横篾绑带（三道密实）
    for (const z of [0.42, 0.78, 1.08]) {
      d.box(-1.0, -0.09, z - 0.04, 1.0, 0.09, z + 0.04, BIND, { line: BIND_D, west: shade(BIND, 0.8), top: shade(BIND, 1.1) });
      for (let x = -0.9; x < 0.9; x += 0.36) {
        d.box(x - 0.04, -0.1, z - 0.06, x + 0.04, 0.1, z + 0.06, BIND_D, { line: shade(BIND_D, 0.7), top: shade(BIND, 1.05) });
      }
    }
    // 两端立柱加粗
    for (const x of [-1.0, 1.0]) {
      d.box(x - 0.08, -0.1, 0.18, x + 0.08, 0.1, 1.35, shade(BAM, 0.9), { line: BAM_D, west: shade(BAM, 0.72), top: BAM_L });
      d.box(x - 0.1, -0.12, 1.3, x + 0.1, 0.12, 1.42, BIND, { line: BIND_D, top: shade(BIND, 1.12) });
    }
    // 篱根少许竹叶簇（密实色块）
    for (const [dx, dz] of [[-0.7, 0.55], [0.55, 0.7], [-0.2, 0.95], [0.85, 0.5]]) {
      d.box(dx - 0.12, -0.14, dz, dx + 0.12, -0.02, dz + 0.28, LEAF, { line: shade(LEAF, 0.55), top: shade(LEAF, 1.2) });
      d.QS(-0.15, dx - 0.1, dz + 0.05, dx + 0.1, dz + 0.22, shade(LEAF, 1.15));
    }
  }
  /** 花篱：木格篱架 + 攀花藤叶密实团块 + 石座（宅侧/园边；≠漏窗花墙） */
  function paintFenceHuali(d) {
    const WOOD = '#5a3a22', WOOD_D = '#2a1408', WOOD_L = '#8a6040';
    const ST = '#8a8070', STW = '#6a6258';
    const LEAF = '#3a6828', LEAF2 = '#5a9038', FLOWER = '#c84860', FLOWER2 = '#e87890', GOLD = '#c8a040';
    const CREAM = '#f0e8d0', TEAL = '#3a6870';
    // 石座
    d.box(-1.15, -0.2, 0, 1.15, 0.2, 0.26, ST, { line: shade(ST, 0.5), west: STW, top: shade(ST, 0.92) });
    for (let x = -1.05; x < 1.05; x += 0.3) d.seg([x, -0.205, 0.1], [x + 0.24, -0.205, 0.1], shade(ST, 0.72));
    // 木立柱 + 顶梁
    for (const x of [-1.05, -0.35, 0.35, 1.05]) {
      d.box(x - 0.07, -0.09, 0.24, x + 0.07, 0.09, 1.45, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: WOOD_L });
    }
    d.box(-1.12, -0.1, 1.38, 1.12, 0.1, 1.52, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: WOOD_L });
    d.QS(-0.11, -1.05, 1.42, 1.05, 1.5, GOLD);
    // 横档密格
    for (const z of [0.55, 0.85, 1.15]) {
      d.box(-1.08, -0.08, z - 0.035, 1.08, 0.08, z + 0.035, WOOD, { line: WOOD_D, west: shade(WOOD, 0.82), top: WOOD_L });
    }
    // 竖格条
    for (let x = -0.9; x <= 0.9; x += 0.22) {
      d.box(x - 0.03, -0.07, 0.3, x + 0.03, 0.07, 1.38, shade(WOOD, 0.95), { line: WOOD_D, west: shade(WOOD, 0.75), top: WOOD_L });
    }
    // 攀花藤叶密实团（多簇，禁线稿）
    const clusters = [
      [-0.75, 0.7], [-0.4, 1.05], [0.1, 0.65], [0.5, 1.1], [0.85, 0.75],
      [-0.95, 1.15], [0.25, 0.95], [-0.15, 1.25], [0.7, 0.5], [-0.55, 0.45],
    ];
    for (const [cx, cz] of clusters) {
      d.box(cx - 0.18, -0.16, cz - 0.12, cx + 0.18, 0.02, cz + 0.22, LEAF, { line: shade(LEAF, 0.5), top: LEAF2 });
      d.QS(-0.17, cx - 0.14, cz - 0.06, cx + 0.14, cz + 0.16, shade(LEAF2, 1.05));
      // 花点
      d.box(cx - 0.06, -0.18, cz + 0.05, cx + 0.06, -0.04, cz + 0.16, FLOWER, { line: shade(FLOWER, 0.55), top: FLOWER2 });
      d.QS(-0.185, cx - 0.04, cz + 0.07, cx + 0.04, cz + 0.14, shade(CREAM, 0.95));
    }
    // 顶上少许垂花
    for (const x of [-0.6, 0, 0.6]) {
      d.box(x - 0.1, -0.14, 1.48, x + 0.1, 0.02, 1.72, LEAF2, { line: shade(LEAF, 0.55), top: shade(LEAF2, 1.15) });
      d.box(x - 0.05, -0.16, 1.6, x + 0.05, -0.02, 1.78, FLOWER, { line: shade(FLOWER, 0.5), top: FLOWER2 });
    }
    // 中心小牌饰
    d.box(-0.22, -0.14, 0.9, 0.22, 0.12, 1.2, CREAM, { line: WOOD_D, south: shade(CREAM, 1.05), top: shade(CREAM, 1.12) });
    d.QS(-0.15, -0.16, 0.96, 0.16, 1.14, shade(TEAL, 0.55));
    d.QS(-0.155, -0.08, 1.0, 0.08, 1.1, GOLD);
  }
  /** 柴扉：柴木小门 + 斜撑 + 竹编门扇 + 石槛（园门/巷侧小门；≠垂花门/门楼） */
  function paintGateChaifei(d) {
    const WOOD = '#5a3a22', WOOD_D = '#2a1408', WOOD_L = '#8a6040', BAM = '#7a9a48', BAM_D = '#3a5020';
    const ST = '#8a8070', STW = '#6a6258', BIND = '#8a6a38', IRON = '#3a3028', CREAM = '#e0d4b8';
    // 石槛
    d.box(-0.85, -0.22, 0, 0.85, 0.22, 0.2, ST, { line: shade(ST, 0.5), west: STW, top: shade(ST, 0.92) });
    for (let x = -0.75; x < 0.75; x += 0.28) d.seg([x, -0.225, 0.08], [x + 0.22, -0.225, 0.08], shade(ST, 0.7));
    // 门柱（左右）
    for (const x of [-0.72, 0.72]) {
      d.box(x - 0.1, -0.12, 0.18, x + 0.1, 0.12, 1.85, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: WOOD_L });
      for (let z = 0.5; z < 1.7; z += 0.35) d.seg([x - 0.11, -0.13, z], [x + 0.11, -0.13, z], shade(WOOD, 1.12));
      // 柱顶帽
      d.box(x - 0.14, -0.14, 1.8, x + 0.14, 0.14, 1.95, WOOD_D, { line: shade(WOOD_D, 0.7), top: WOOD_L });
      d.box(x - 0.08, -0.08, 1.92, x + 0.08, 0.08, 2.05, BIND, { line: shade(BIND, 0.55), top: shade(BIND, 1.1) });
    }
    // 上楣梁
    d.box(-0.78, -0.12, 1.7, 0.78, 0.12, 1.88, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: WOOD_L });
    d.QS(-0.13, -0.7, 1.76, 0.7, 1.85, shade(CREAM, 0.85));
    // 门扇：竖柴条密排
    for (let i = -4; i <= 4; i++) {
      const x = i * 0.14;
      const h = 1.55 + (Math.abs(i) % 2) * 0.05;
      d.box(x - 0.05, -0.08, 0.22, x + 0.05, 0.08, h, shade(WOOD, 0.92 + (i % 3) * 0.03), { line: WOOD_D, west: shade(WOOD, 0.75), top: WOOD_L });
    }
    // 横档 + 斜撑（实体）
    for (const z of [0.55, 1.05, 1.45]) {
      d.box(-0.65, -0.1, z - 0.04, 0.65, 0.1, z + 0.04, WOOD, { line: WOOD_D, west: shade(WOOD, 0.82), top: WOOD_L });
    }
    // 斜撑 X
    d.box(-0.55, -0.09, 0.4, -0.05, 0.09, 0.55, WOOD_D, { line: shade(WOOD_D, 0.7), top: WOOD_L });
    d.box(-0.45, -0.09, 0.7, 0.05, 0.09, 0.85, WOOD_D, { line: shade(WOOD_D, 0.7), top: WOOD_L });
    d.box(-0.3, -0.09, 1.0, 0.2, 0.09, 1.15, WOOD_D, { line: shade(WOOD_D, 0.7), top: WOOD_L });
    d.box(0.05, -0.09, 0.4, 0.55, 0.09, 0.55, WOOD_D, { line: shade(WOOD_D, 0.7), top: WOOD_L });
    d.box(-0.05, -0.09, 0.7, 0.45, 0.09, 0.85, WOOD_D, { line: shade(WOOD_D, 0.7), top: WOOD_L });
    d.box(-0.2, -0.09, 1.0, 0.3, 0.09, 1.15, WOOD_D, { line: shade(WOOD_D, 0.7), top: WOOD_L });
    // 竹编补板（门扇中段密实）
    d.box(-0.5, -0.11, 0.7, 0.5, 0.05, 1.2, BAM, { line: BAM_D, west: shade(BAM, 0.8), top: shade(BAM, 1.1) });
    for (let x = -0.45; x < 0.45; x += 0.12) d.seg([x, -0.115, 0.75], [x, -0.115, 1.15], shade(BAM_D, 0.9));
    for (let z = 0.8; z < 1.15; z += 0.1) d.seg([-0.48, -0.115, z], [0.48, -0.115, z], shade(BAM, 0.85));
    // 门环/闩
    d.box(0.35, -0.14, 0.95, 0.55, -0.02, 1.15, IRON, { line: shade(IRON, 0.6), top: shade(IRON, 1.15) });
    d.box(0.38, -0.16, 1.0, 0.52, -0.06, 1.1, shade(CREAM, 0.7), { line: IRON, top: CREAM });
    d.box(-0.15, -0.14, 1.0, 0.35, -0.04, 1.1, BIND, { line: shade(BIND, 0.55), top: shade(BIND, 1.1) });
    // 两侧短篱翼（衔接感）
    for (const side of [-1, 1]) {
      const bx = side * 0.95;
      for (let i = 0; i < 3; i++) {
        const x = bx + side * (0.12 + i * 0.14);
        d.box(x - 0.04, -0.06, 0.2, x + 0.04, 0.06, 1.05, BAM, { line: BAM_D, west: shade(BAM, 0.78), top: shade(BAM, 1.1) });
      }
      d.box(bx + side * 0.08, -0.08, 0.55, bx + side * 0.5, 0.08, 0.65, BIND, { line: shade(BIND, 0.55), top: shade(BIND, 1.08) });
    }
  }

  /* Site228：石桌 — 厚石板桌面 + 鼓形/方石腿 + 线脚密实（禁纯线稿） */
  function paintSeatShizhuo(d) {
    const ST = '#8a8070', STW = '#6a6258', STL = '#a09888', MOSS = '#5a7048', GOLD = '#c8a040';
    // 四石腿（鼓形收腰实体）
    for (const [x, y] of [[-0.55, -0.45], [0.55, -0.45], [-0.55, 0.45], [0.55, 0.45]]) {
      d.box(x - 0.16, y - 0.16, 0, x + 0.16, y + 0.16, 0.18, ST, { line: shade(ST, 0.5), west: STW, top: shade(ST, 0.9) });
      d.box(x - 0.14, y - 0.14, 0.18, x + 0.14, y + 0.14, 0.42, shade(ST, 0.95), { line: shade(ST, 0.48), west: STW, top: shade(ST, 1.02) });
      d.box(x - 0.18, y - 0.18, 0.42, x + 0.18, y + 0.18, 0.58, ST, { line: shade(ST, 0.5), west: STW, top: STL });
      for (let z = 0.12; z < 0.55; z += 0.14) d.seg([x - 0.17, y - 0.17, z], [x + 0.17, y - 0.17, z], shade(ST, 0.72));
    }
    // 厚石桌面 + 线脚
    d.box(-0.95, -0.75, 0.58, 0.95, 0.75, 0.72, ST, { line: shade(ST, 0.48), west: STW, top: shade(ST, 0.95) });
    d.box(-0.88, -0.68, 0.72, 0.88, 0.68, 0.88, shade(ST, 1.05), { line: shade(ST, 0.5), west: STW, top: STL });
    for (let x = -0.7; x < 0.75; x += 0.28) d.seg([x, -0.69, 0.88], [x, 0.69, 0.88], shade(ST, 0.78));
    for (let y = -0.5; y < 0.55; y += 0.28) d.seg([-0.89, y, 0.88], [0.89, y, 0.88], shade(ST, 0.75));
    // 桌沿回纹块 + 角饰
    d.box(-0.92, -0.72, 0.78, -0.7, -0.5, 0.86, shade(ST, 1.12), { line: shade(ST, 0.55), top: GOLD });
    d.box(0.7, -0.72, 0.78, 0.92, -0.5, 0.86, shade(ST, 1.1), { line: shade(ST, 0.55), top: GOLD });
    d.box(-0.92, 0.5, 0.78, -0.7, 0.72, 0.86, shade(ST, 1.1), { line: shade(ST, 0.55), top: GOLD });
    d.box(0.7, 0.5, 0.78, 0.92, 0.72, 0.86, shade(ST, 1.08), { line: shade(ST, 0.55), top: GOLD });
    // 青苔点缀
    d.QS(-0.76, -0.6, 0.62, -0.35, 0.7, MOSS);
    d.QS(0.55, 0.4, 0.64, 0.72, 0.72, shade(MOSS, 0.9));
  }

  /* Site228：石凳 — 圆鼓墩/方墩密实（≠site204 简易双腿 prop_shiteng；≠石灯笼 aq_shideng） */
  function paintSeatShideng(d) {
    const ST = '#8a8070', STW = '#6a6258', STL = '#a09888', MOSS = '#5a7048', GOLD = '#c8a040';
    // 鼓形墩身（多层收腰实体）
    d.box(-0.42, -0.42, 0, 0.42, 0.42, 0.14, ST, { line: shade(ST, 0.5), west: STW, top: shade(ST, 0.9) });
    d.box(-0.38, -0.38, 0.14, 0.38, 0.38, 0.32, shade(ST, 0.95), { line: shade(ST, 0.48), west: STW, top: shade(ST, 1.0) });
    d.box(-0.34, -0.34, 0.32, 0.34, 0.34, 0.48, shade(ST, 0.92), { line: shade(ST, 0.5), west: STW, top: shade(ST, 0.98) });
    d.box(-0.4, -0.4, 0.48, 0.4, 0.4, 0.62, ST, { line: shade(ST, 0.48), west: STW, top: STL });
    // 坐面厚圆盘 + 弦纹
    d.box(-0.48, -0.48, 0.62, 0.48, 0.48, 0.78, shade(ST, 1.05), { line: shade(ST, 0.5), west: STW, top: STL });
    for (let a = 0; a < 8; a++) {
      const ang = (a / 8) * Math.PI * 2;
      const x0 = Math.cos(ang) * 0.28, y0 = Math.sin(ang) * 0.28;
      d.seg([x0, y0, 0.78], [x0 * 1.35, y0 * 1.35, 0.78], shade(ST, 0.75));
    }
    // 束腰回纹环
    d.box(-0.36, -0.36, 0.28, 0.36, 0.36, 0.36, shade(ST, 1.12), { line: shade(ST, 0.55), west: STW, top: GOLD });
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      const x = Math.cos(ang) * 0.3, y = Math.sin(ang) * 0.3;
      d.QS(y - 0.05, x - 0.05, 0.3, x + 0.05, 0.34, GOLD);
    }
    // 青苔
    d.QS(-0.45, -0.35, 0.08, -0.1, 0.16, MOSS);
    d.QS(0.2, 0.15, 0.5, 0.4, 0.58, shade(MOSS, 0.85));
  }

  /* Site228：棋枰桌 — 石桌面刻棋盘格 + 石腿 + 边线密实（对弈点景） */
  function paintSeatQiping(d) {
    const ST = '#8a8070', STW = '#6a6258', STL = '#a09888', INK = '#2a2418', CREAM = '#e0d4b8', GOLD = '#c8a040', WOOD = '#6a4a2c';
    // 四短石腿
    for (const [x, y] of [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]]) {
      d.box(x - 0.14, y - 0.14, 0, x + 0.14, y + 0.14, 0.5, ST, { line: shade(ST, 0.5), west: STW, top: shade(ST, 0.92) });
      for (let z = 0.12; z < 0.48; z += 0.14) d.seg([x - 0.15, y - 0.15, z], [x + 0.15, y - 0.15, z], shade(ST, 0.72));
    }
    // 厚桌面
    d.box(-0.85, -0.85, 0.5, 0.85, 0.85, 0.68, ST, { line: shade(ST, 0.48), west: STW, top: shade(ST, 0.95) });
    d.box(-0.78, -0.78, 0.68, 0.78, 0.78, 0.82, shade(ST, 1.04), { line: shade(ST, 0.5), west: STW, top: STL });
    // 棋盘面（浅色石板）
    d.box(-0.62, -0.62, 0.82, 0.62, 0.62, 0.9, CREAM, { line: INK, west: shade(CREAM, 0.85), top: shade(CREAM, 1.08) });
    // 棋盘格线（实体细条，非纯线稿）
    for (let i = -4; i <= 4; i++) {
      const t = i * 0.12;
      d.box(t - 0.015, -0.58, 0.9, t + 0.015, 0.58, 0.92, INK, { line: false, noW: true, noS: true });
      d.box(-0.58, t - 0.015, 0.9, 0.58, t + 0.015, 0.92, INK, { line: false, noW: true, noS: true });
    }
    // 星位/天元小块
    for (const [x, y] of [[-0.36, -0.36], [0.36, -0.36], [-0.36, 0.36], [0.36, 0.36], [0, 0], [-0.36, 0], [0.36, 0], [0, -0.36], [0, 0.36]]) {
      d.box(x - 0.04, y - 0.04, 0.9, x + 0.04, y + 0.04, 0.94, INK, { line: false, noW: true, noS: true });
    }
    // 边框金钉 + 木纹边
    d.box(-0.72, -0.72, 0.78, 0.72, -0.62, 0.86, WOOD, { line: shade(WOOD, 0.55), top: shade(WOOD, 1.1) });
    d.box(-0.72, 0.62, 0.78, 0.72, 0.72, 0.86, WOOD, { line: shade(WOOD, 0.55), top: shade(WOOD, 1.1) });
    d.box(-0.72, -0.62, 0.78, -0.62, 0.62, 0.86, WOOD, { line: shade(WOOD, 0.55), top: shade(WOOD, 1.1) });
    d.box(0.62, -0.62, 0.78, 0.72, 0.62, 0.86, WOOD, { line: shade(WOOD, 0.55), top: shade(WOOD, 1.1) });
    for (const x of [-0.55, -0.2, 0.2, 0.55]) {
      d.QS(-0.7, x - 0.03, 0.84, x + 0.03, 0.88, GOLD);
      d.QS(0.66, x - 0.03, 0.84, x + 0.03, 0.88, GOLD);
    }
  }




/* ---- Site227：货摊/货架/晾晒杆（市井点景；≠既有 aq_stall 粗摊；与招牌#115/街具#118互补；禁纯线稿、密实 kitbash） ---- */
  /** 小货摊：木柱棚架 + 布幌披檐 + 案台货筐（主街侧/巷口/桥头） */

  /** Site229 水缸：陶缸储水（无花叶；≠花缸 prop_huagang）——缸身收腰+箍环+木盖+水面 */
  function paintPropShuigang(d) {
    const CER = '#7a5a3a', CERW = '#4a3018', GLAZE = '#5a7a68', RIM = '#c8b898', WOOD = '#5a3a22', WOOD_D = '#2a160c';
    const WATER = '#3a6a78', WATER_L = '#6a9aaa';
    d.box(-0.48, -0.48, 0, 0.48, 0.48, 0.18, shade(CER, 0.88), { line: shade(CER, 0.48), west: CERW, top: shade(CER, 0.85) });
    d.box(-0.52, -0.52, 0.18, 0.52, 0.52, 0.55, CER, { line: shade(CER, 0.48), west: CERW, top: shade(CER, 0.95) });
    d.box(-0.46, -0.46, 0.55, 0.46, 0.46, 0.95, shade(CER, 1.02), { line: shade(CER, 0.5), west: CERW, top: shade(CER, 1.05) });
    d.box(-0.5, -0.5, 0.95, 0.5, 0.5, 1.12, shade(CER, 1.08), { line: shade(CER, 0.5), west: CERW, top: RIM });
    d.QS(-0.53, -0.42, 0.35, 0.42, 0.48, GLAZE, shade(CER, 0.55));
    d.QS(-0.53, -0.38, 0.62, 0.38, 0.72, shade(RIM, 0.9), shade(CER, 0.55));
    for (const z of [0.32, 0.48, 0.68, 0.88]) d.seg([-0.53, -0.53, z], [0.53, -0.53, z], shade(CER, 0.7));
    for (const z of [0.4, 0.78]) {
      d.box(-0.54, -0.54, z, 0.54, 0.54, z + 0.06, shade(CERW, 1.05), { line: shade(CERW, 0.6), west: shade(CERW, 0.85), top: shade(CER, 0.9) });
    }
    d.box(-0.38, -0.38, 1.05, 0.38, 0.38, 1.1, WATER, { line: shade(WATER, 0.55), west: shade(WATER, 0.8), top: WATER_L });
    d.QS(-0.02, -0.22, 1.08, 0.22, 1.12, shade(WATER_L, 1.15));
    d.box(-0.42, -0.42, 1.12, 0.42, 0.42, 1.22, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: shade(WOOD, 1.1) });
    d.box(-0.08, -0.08, 1.22, 0.08, 0.08, 1.32, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.12) });
    d.box(0.35, -0.06, 0.7, 0.48, 0.06, 1.05, WOOD, { line: WOOD_D, west: shade(WOOD, 0.75), top: shade(WOOD, 1.05) });
  }
  /** Site229 井栏：石井栏口（无亭顶四柱；≠井亭 pavilion_jingting）——方栏+柱头+井口暗水 */
  function paintPropJinglan(d) {
    const ST = '#8a8070', STW = '#6a6258', TOP = '#9a9080', MOSS = '#4a6a48';
    d.box(-0.85, -0.85, 0, 0.85, 0.85, 0.16, ST, { line: shade(ST, 0.48), west: STW, top: shade(ST, 0.9) });
    d.box(-0.78, -0.78, 0.16, 0.78, 0.78, 0.28, shade(ST, 0.98), { line: shade(ST, 0.5), west: STW, top: TOP });
    for (let x = -0.65; x < 0.7; x += 0.26) d.seg([x, -0.79, 0.28], [x, 0.79, 0.28], shade(ST, 0.72));
    /* 井口暗水凹 */
    d.box(-0.42, -0.42, 0.28, 0.42, 0.42, 0.34, '#2a3438', { line: shade(ST, 0.5), west: '#1a2428', top: '#1e2a30' });
    d.box(-0.32, -0.32, 0.22, 0.32, 0.32, 0.28, '#3a5a68', { line: shade('#3a5a68', 0.55), west: '#2a4a58', top: '#4a7a88' });
    /* 四面石栏板 */
    for (const [x0, y0, x1, y1] of [
      [-0.72, -0.72, 0.72, -0.52], [-0.72, 0.52, 0.72, 0.72],
      [-0.72, -0.72, -0.52, 0.72], [0.52, -0.72, 0.72, 0.72],
    ]) {
      d.box(x0, y0, 0.28, x1, y1, 0.85, ST, { line: shade(ST, 0.48), west: STW, top: shade(ST, 1.08) });
    }
    /* 四角柱头 */
    for (const [x, y] of [[-0.62, -0.62], [0.62, -0.62], [-0.62, 0.62], [0.62, 0.62]]) {
      d.box(x - 0.12, y - 0.12, 0.28, x + 0.12, y + 0.12, 1.05, shade(ST, 1.02), { line: shade(ST, 0.5), west: STW, top: TOP });
      d.box(x - 0.14, y - 0.14, 1.05, x + 0.14, y + 0.14, 1.18, ST, { line: shade(ST, 0.5), west: STW, top: shade(TOP, 1.05) });
      d.box(x - 0.08, y - 0.08, 1.18, x + 0.08, y + 0.08, 1.28, shade(ST, 1.1), { line: shade(ST, 0.5), west: STW, top: TOP });
    }
    /* 栏面刻线/苔点 */
    for (const z of [0.45, 0.62, 0.78]) d.seg([-0.7, -0.73, z], [0.7, -0.73, z], shade(ST, 0.7));
    d.box(-0.55, -0.74, 0.5, -0.35, -0.7, 0.7, MOSS, { line: shade(MOSS, 0.55), west: shade(MOSS, 0.8), top: shade(MOSS, 1.1) });
    d.box(0.3, 0.7, 0.55, 0.55, 0.74, 0.75, MOSS, { line: shade(MOSS, 0.55), west: shade(MOSS, 0.8), top: shade(MOSS, 1.1) });
    /* 辘轳小架（矮木架，非亭） */
    const WOOD = '#5a3a22', WOOD_D = '#2a160c';
    d.box(-0.06, -0.55, 0.85, 0.06, -0.45, 1.55, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: shade(WOOD, 1.08) });
    d.box(-0.06, 0.45, 0.85, 0.06, 0.55, 1.55, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: shade(WOOD, 1.08) });
    d.box(-0.08, -0.55, 1.48, 0.08, 0.55, 1.6, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.1) });
    d.box(-0.12, -0.08, 1.42, 0.12, 0.08, 1.55, shade(WOOD, 1.05), { line: WOOD_D, west: shade(WOOD, 0.85), top: shade(WOOD, 1.12) });
  }
  /** Site229 水桶：木桶+铁箍+提梁绳（取水点景） */
  function paintPropShuitong(d) {
    const WOOD = '#6a4a28', WOOD_D = '#3a2210', BAND = '#4a4a48', ROPE = '#8a6a38', WATER = '#3a6a78';
    d.box(-0.32, -0.32, 0, 0.32, 0.32, 0.12, shade(WOOD, 0.9), { line: WOOD_D, west: shade(WOOD, 0.75), top: shade(WOOD, 0.95) });
    d.box(-0.35, -0.35, 0.12, 0.35, 0.35, 0.55, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: shade(WOOD, 1.02) });
    d.box(-0.32, -0.32, 0.55, 0.32, 0.32, 0.85, shade(WOOD, 1.05), { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.08) });
    for (const z of [0.22, 0.42, 0.68]) {
      d.box(-0.37, -0.37, z, 0.37, 0.37, z + 0.05, BAND, { line: shade(BAND, 0.55), west: shade(BAND, 0.8), top: shade(BAND, 1.1) });
    }
    for (let x = -0.28; x <= 0.28; x += 0.1) d.seg([x, -0.36, 0.15], [x, -0.36, 0.82], shade(WOOD, 0.85));
    d.box(-0.26, -0.26, 0.78, 0.26, 0.26, 0.84, WATER, { line: shade(WATER, 0.55), west: shade(WATER, 0.8), top: '#6a9aaa' });
    /* 提梁 */
    d.box(-0.38, -0.04, 0.7, -0.32, 0.04, 0.85, WOOD, { line: WOOD_D, west: shade(WOOD, 0.75), top: shade(WOOD, 1.05) });
    d.box(0.32, -0.04, 0.7, 0.38, 0.04, 0.85, WOOD, { line: WOOD_D, west: shade(WOOD, 0.75), top: shade(WOOD, 1.05) });
    d.box(-0.38, -0.04, 1.05, 0.38, 0.04, 1.15, ROPE, { line: shade(ROPE, 0.55), west: shade(ROPE, 0.8), top: shade(ROPE, 1.1) });
    d.seg([-0.35, 0, 0.85], [-0.35, 0, 1.08], WOOD_D, 2);
    d.seg([0.35, 0, 0.85], [0.35, 0, 1.08], WOOD_D, 2);
    d.box(-0.06, -0.06, 1.12, 0.06, 0.06, 1.28, ROPE, { line: shade(ROPE, 0.55), west: shade(ROPE, 0.8), top: shade(ROPE, 1.12) });
  }


  /** Site231 柴堆：交错柴捆+绳索（宅后/厨侧/厩旁储柴；kitbash 密实） */
  function paintPropChaidui(d) {
    const WOOD = '#6a4a28', WOOD_D = '#3a2210', WOOD_L = '#8a6a40', BARK = '#4a3018', ROPE = '#8a6a38', MOSS = '#4a6a48';
    /* 底层横柴 */
    for (let i = 0; i < 5; i++) {
      const x0 = -0.85 + i * 0.32, x1 = x0 + 0.28;
      const y0 = -0.42 + (i % 2) * 0.08, y1 = 0.42 - (i % 2) * 0.06;
      d.box(x0, y0, 0, x1, y1, 0.22, i % 2 ? WOOD : WOOD_L, { line: WOOD_D, west: BARK, top: shade(WOOD, 1.05) });
    }
    /* 中层斜交 */
    for (let i = 0; i < 4; i++) {
      const x0 = -0.72 + i * 0.36, x1 = x0 + 0.3;
      d.box(x0, -0.38, 0.22, x1, 0.38, 0.48, shade(WOOD, 0.98), { line: WOOD_D, west: shade(BARK, 1.05), top: shade(WOOD_L, 1.02) });
    }
    /* 上层短柴+尖端 */
    for (let i = 0; i < 3; i++) {
      const x0 = -0.55 + i * 0.4, x1 = x0 + 0.32;
      d.box(x0, -0.28, 0.48, x1, 0.28, 0.78, WOOD_L, { line: WOOD_D, west: BARK, top: shade(WOOD, 1.1) });
      d.box(x0 + 0.05, -0.12, 0.78, x1 - 0.05, 0.12, 0.98, shade(WOOD, 1.05), { line: WOOD_D, west: shade(BARK, 0.9), top: shade(WOOD_L, 1.12) });
    }
    /* 竖向柴端截面纹理 */
    for (let x = -0.7; x <= 0.7; x += 0.22) d.seg([x, -0.44, 0.05], [x, -0.44, 0.2], shade(WOOD_D, 1.05));
    for (let x = -0.6; x <= 0.55; x += 0.28) d.seg([x, 0.4, 0.25], [x, 0.4, 0.45], shade(WOOD_D, 1.0));
    /* 捆绳 */
    d.box(-0.9, -0.08, 0.18, 0.9, 0.08, 0.26, ROPE, { line: shade(ROPE, 0.55), west: shade(ROPE, 0.8), top: shade(ROPE, 1.1) });
    d.box(-0.78, -0.08, 0.5, 0.78, 0.08, 0.58, ROPE, { line: shade(ROPE, 0.55), west: shade(ROPE, 0.8), top: shade(ROPE, 1.08) });
    d.QS(-0.6, -0.1, 0.55, 0.6, 0.62, shade(ROPE, 1.12));
    /* 苔点/碎屑 */
    d.box(-0.7, -0.45, 0.02, -0.5, -0.38, 0.12, MOSS, { line: shade(MOSS, 0.55), west: shade(MOSS, 0.8), top: shade(MOSS, 1.1) });
    d.box(0.45, 0.32, 0.02, 0.7, 0.42, 0.1, shade(BARK, 0.9), { line: WOOD_D, west: BARK, top: shade(WOOD, 0.95) });
    d.box(-0.15, -0.2, 0.95, 0.15, 0.15, 1.12, WOOD, { line: WOOD_D, west: BARK, top: shade(WOOD_L, 1.08) });
  }
  /** Site231 草垛：圆丘草垛+苫顶绳网（宅后/厩旁/码头边；kitbash 密实） */
  function paintPropCaoduo(d) {
    const STRAW = '#c8a858', STRAW_D = '#8a6830', STRAW_L = '#e0c878', ROPE = '#6a4a28', THAT = '#a88840';
    /* 基盘 */
    d.box(-0.95, -0.85, 0, 0.95, 0.85, 0.12, shade(STRAW_D, 0.95), { line: shade(STRAW_D, 0.55), west: shade(STRAW_D, 0.8), top: STRAW });
    /* 下层宽丘 */
    d.box(-0.88, -0.78, 0.12, 0.88, 0.78, 0.55, STRAW, { line: shade(STRAW_D, 0.5), west: STRAW_D, top: shade(STRAW_L, 1.02) });
    d.box(-0.78, -0.68, 0.55, 0.78, 0.68, 0.95, shade(STRAW, 1.02), { line: shade(STRAW_D, 0.5), west: shade(STRAW_D, 0.9), top: STRAW_L });
    /* 上层收尖 */
    d.box(-0.58, -0.5, 0.95, 0.58, 0.5, 1.35, STRAW_L, { line: shade(STRAW_D, 0.5), west: THAT, top: shade(STRAW_L, 1.1) });
    d.box(-0.35, -0.3, 1.35, 0.35, 0.3, 1.65, THAT, { line: shade(STRAW_D, 0.55), west: shade(STRAW_D, 0.95), top: shade(STRAW_L, 1.15) });
    d.box(-0.18, -0.15, 1.65, 0.18, 0.15, 1.85, shade(THAT, 1.05), { line: shade(STRAW_D, 0.55), west: STRAW_D, top: '#f0d898' });
    /* 草丝纹理 */
    for (let x = -0.8; x <= 0.8; x += 0.2) d.seg([x, -0.8, 0.2], [x * 0.7, -0.55, 0.9], shade(STRAW_D, 0.9));
    for (let x = -0.6; x <= 0.6; x += 0.22) d.seg([x, 0.72, 0.3], [x * 0.65, 0.4, 1.1], shade(STRAW_D, 0.85));
    for (const z of [0.35, 0.7, 1.1]) d.seg([-0.75, -0.7, z], [0.75, -0.7, z], shade(STRAW_D, 0.75));
    /* 苫绳网 */
    d.box(-0.92, -0.06, 0.4, 0.92, 0.06, 0.48, ROPE, { line: shade(ROPE, 0.55), west: shade(ROPE, 0.8), top: shade(ROPE, 1.08) });
    d.box(-0.7, -0.06, 0.9, 0.7, 0.06, 0.98, ROPE, { line: shade(ROPE, 0.55), west: shade(ROPE, 0.8), top: shade(ROPE, 1.05) });
    d.seg([-0.5, 0, 0.48], [0, 0, 1.7], ROPE, 2);
    d.seg([0.5, 0, 0.48], [0, 0, 1.7], ROPE, 2);
    d.QS(-0.2, -0.08, 1.55, 0.2, 1.72, shade(STRAW_L, 1.2));
  }
  /** Site231 粮袋：麻袋堆+绳口（巷口/码头边/厨侧；≠货摊案上小袋） */
  function paintPropLiangdai(d) {
    const BAG = '#c8b070', BAG_D = '#8a7040', BAG_L = '#e0d0a0', ROPE = '#5a3a22', STITCH = '#6a5028', MARK = '#8a3030';
    /* 底层两袋横放 */
    d.box(-0.7, -0.45, 0, -0.05, 0.4, 0.55, BAG, { line: shade(BAG_D, 0.5), west: BAG_D, top: shade(BAG_L, 1.02) });
    d.box(0.05, -0.4, 0, 0.7, 0.45, 0.55, shade(BAG, 0.98), { line: shade(BAG_D, 0.5), west: shade(BAG_D, 0.9), top: BAG_L });
    /* 中层斜交 */
    d.box(-0.55, -0.35, 0.55, 0.15, 0.35, 1.05, shade(BAG, 1.02), { line: shade(BAG_D, 0.5), west: BAG_D, top: shade(BAG_L, 1.05) });
    d.box(-0.1, -0.38, 0.55, 0.6, 0.32, 1.05, BAG, { line: shade(BAG_D, 0.5), west: shade(BAG_D, 0.85), top: BAG_L });
    /* 顶袋立放收口 */
    d.box(-0.28, -0.28, 1.05, 0.28, 0.28, 1.55, shade(BAG, 1.05), { line: shade(BAG_D, 0.5), west: BAG_D, top: BAG_L });
    d.box(-0.22, -0.22, 1.55, 0.22, 0.22, 1.72, shade(BAG_L, 1.02), { line: shade(BAG_D, 0.55), west: shade(BAG_D, 0.9), top: '#f0e8c8' });
    /* 绳口结 */
    d.box(-0.12, -0.12, 1.68, 0.12, 0.12, 1.85, ROPE, { line: shade(ROPE, 0.55), west: shade(ROPE, 0.8), top: shade(ROPE, 1.1) });
    d.box(-0.06, -0.06, 1.85, 0.06, 0.06, 1.95, shade(ROPE, 1.05), { line: shade(ROPE, 0.55), west: shade(ROPE, 0.85), top: shade(ROPE, 1.15) });
    /* 缝线/印记 */
    for (const z of [0.2, 0.4]) d.seg([-0.68, -0.46, z], [-0.08, -0.46, z], STITCH);
    for (const z of [0.18, 0.38]) d.seg([0.08, 0.46, z], [0.68, 0.46, z], STITCH);
    d.seg([-0.5, -0.36, 0.7], [0.1, -0.36, 0.95], STITCH);
    d.seg([-0.2, 0.3, 0.7], [0.55, 0.3, 0.95], STITCH);
    d.box(-0.15, -0.32, 0.75, 0.05, -0.28, 0.95, MARK, { line: shade(MARK, 0.55), west: shade(MARK, 0.8), top: shade(MARK, 1.1) });
    d.box(0.25, 0.25, 0.72, 0.45, 0.32, 0.92, MARK, { line: shade(MARK, 0.55), west: shade(MARK, 0.8), top: shade(MARK, 1.1) });
    /* 侧袋捆绳 */
    d.box(-0.72, -0.08, 0.28, -0.02, 0.08, 0.36, ROPE, { line: shade(ROPE, 0.55), west: shade(ROPE, 0.8), top: shade(ROPE, 1.08) });
    d.box(0.02, -0.08, 0.28, 0.72, 0.08, 0.36, ROPE, { line: shade(ROPE, 0.55), west: shade(ROPE, 0.8), top: shade(ROPE, 1.08) });
    d.QS(-0.2, -0.3, 1.6, 0.2, 1.7, shade(BAG_L, 1.15));
  }

  /** Site232 酒坛：褐陶大坛+草塞/红签（酒肆门前/厨房外；kitbash 密实釉色绳捆） */
  function paintPropJiutan(d) {
    const CER = '#6a3a22', CER_D = '#3a1c10', CER_L = '#8a5a38', GLAZE = '#5a6a48', RIM = '#c8a878';
    const STRAW = '#c8b070', STRAW_D = '#8a7040', ROPE = '#5a3a22', TAG = '#a02828', TAG_L = '#c84840';
    /* 基座陶脚 */
    d.box(-0.42, -0.42, 0, 0.42, 0.42, 0.14, shade(CER_D, 0.95), { line: shade(CER_D, 0.5), west: CER_D, top: CER });
    /* 下腹鼓 */
    d.box(-0.52, -0.52, 0.14, 0.52, 0.52, 0.55, CER, { line: shade(CER, 0.48), west: CER_D, top: shade(CER, 0.98) });
    d.box(-0.58, -0.55, 0.55, 0.58, 0.55, 0.95, shade(CER, 1.02), { line: shade(CER, 0.5), west: CER_D, top: shade(CER_L, 1.02) });
    /* 上收下颈 */
    d.box(-0.42, -0.4, 0.95, 0.42, 0.4, 1.25, CER_L, { line: shade(CER, 0.5), west: shade(CER_D, 0.95), top: RIM });
    d.box(-0.32, -0.3, 1.25, 0.32, 0.3, 1.45, shade(CER, 1.05), { line: shade(CER, 0.5), west: CER_D, top: RIM });
    /* 口沿 */
    d.box(-0.36, -0.34, 1.42, 0.36, 0.34, 1.55, shade(CER_L, 1.08), { line: shade(CER, 0.5), west: CER_D, top: RIM });
    /* 釉带/绳捆 */
    d.QS(-0.6, -0.48, 0.4, 0.48, 0.55, GLAZE, shade(CER, 0.55));
    d.QS(-0.6, -0.42, 0.72, 0.42, 0.85, shade(RIM, 0.85), shade(CER, 0.55));
    for (const z of [0.35, 0.7, 1.05]) {
      d.box(-0.6, -0.08, z, 0.6, 0.08, z + 0.07, ROPE, { line: shade(ROPE, 0.55), west: shade(ROPE, 0.8), top: shade(ROPE, 1.1) });
    }
    for (const z of [0.28, 0.5, 0.88, 1.18]) d.seg([-0.59, -0.56, z], [0.59, -0.56, z], shade(CER, 0.7));
    /* 草塞 */
    d.box(-0.18, -0.18, 1.55, 0.18, 0.18, 1.78, STRAW, { line: shade(STRAW_D, 0.5), west: STRAW_D, top: shade(STRAW, 1.12) });
    d.box(-0.12, -0.12, 1.78, 0.12, 0.12, 1.95, shade(STRAW, 1.05), { line: shade(STRAW_D, 0.55), west: STRAW_D, top: '#e8d8a8' });
    d.seg([-0.15, 0, 1.6], [-0.15, 0, 1.9], STRAW_D);
    d.seg([0.1, 0, 1.62], [0.1, 0, 1.88], shade(STRAW_D, 0.9));
    /* 红签吊牌 */
    d.box(0.22, -0.04, 1.15, 0.48, 0.04, 1.42, TAG, { line: shade(TAG, 0.5), west: shade(TAG, 0.8), top: TAG_L });
    d.seg([0.18, 0, 1.45], [0.35, 0, 1.42], ROPE, 2);
    d.QS(0.24, -0.02, 1.2, 0.46, 1.38, shade(TAG_L, 1.15));
    /* 釉高光/苔点 */
    d.QS(-0.05, -0.4, 0.6, 0.35, 0.75, shade(GLAZE, 1.2));
    d.box(-0.5, 0.4, 0.2, -0.35, 0.5, 0.35, '#4a6a48', { line: shade('#4a6a48', 0.55), west: shade('#4a6a48', 0.8), top: shade('#4a6a48', 1.1) });
  }
  /** Site232 陶瓮：水瓮/酱瓮堆叠（巷口/码头边/小院墙根；釉色层次） */
  function paintPropTaoweng(d) {
    const CER = '#7a4a2a', CER_D = '#4a2814', CER_L = '#9a6a42', GLAZE = '#4a6a58', GLAZE2 = '#6a5a38';
    const RIM = '#d0b888', ROPE = '#5a3a22', SAUCE = '#3a2818';
    /* 底层大瓮 */
    d.box(-0.7, -0.55, 0, 0.05, 0.5, 0.18, shade(CER_D, 0.95), { line: shade(CER_D, 0.5), west: CER_D, top: CER });
    d.box(-0.75, -0.58, 0.18, 0.08, 0.55, 0.7, CER, { line: shade(CER, 0.48), west: CER_D, top: shade(CER, 1.02) });
    d.box(-0.68, -0.5, 0.7, 0.02, 0.48, 1.05, shade(CER, 1.05), { line: shade(CER, 0.5), west: CER_D, top: RIM });
    d.box(-0.55, -0.4, 1.05, -0.1, 0.38, 1.22, CER_L, { line: shade(CER, 0.5), west: CER_D, top: RIM });
    d.QS(-0.78, -0.5, 0.35, 0.05, 0.5, GLAZE, shade(CER, 0.55));
    d.box(-0.78, -0.08, 0.45, 0.1, 0.08, 0.52, ROPE, { line: shade(ROPE, 0.55), west: shade(ROPE, 0.8), top: shade(ROPE, 1.08) });
    /* 右侧酱瓮 */
    d.box(0.05, -0.48, 0, 0.72, 0.45, 0.15, shade(SAUCE, 0.95), { line: shade(SAUCE, 0.5), west: SAUCE, top: shade(CER_D, 1.05) });
    d.box(0.08, -0.5, 0.15, 0.75, 0.48, 0.65, shade(CER, 0.92), { line: shade(CER, 0.48), west: CER_D, top: shade(CER, 0.98) });
    d.box(0.12, -0.42, 0.65, 0.7, 0.4, 0.95, shade(CER_L, 0.95), { line: shade(CER, 0.5), west: CER_D, top: RIM });
    d.QS(0.05, -0.45, 0.3, 0.72, 0.45, GLAZE2, shade(CER, 0.55));
    d.box(0.08, -0.08, 0.4, 0.75, 0.08, 0.48, ROPE, { line: shade(ROPE, 0.55), west: shade(ROPE, 0.8), top: shade(ROPE, 1.08) });
    /* 顶上小瓮 */
    d.box(-0.35, -0.28, 1.22, 0.35, 0.28, 1.35, shade(CER, 1.0), { line: shade(CER, 0.5), west: CER_D, top: CER_L });
    d.box(-0.4, -0.32, 1.35, 0.4, 0.32, 1.7, CER_L, { line: shade(CER, 0.5), west: CER_D, top: RIM });
    d.box(-0.28, -0.22, 1.7, 0.28, 0.22, 1.88, shade(CER, 1.08), { line: shade(CER, 0.5), west: CER_D, top: RIM });
    d.QS(-0.42, -0.25, 1.4, 0.25, 1.55, shade(GLAZE, 1.1), shade(CER, 0.55));
    d.box(-0.42, -0.06, 1.5, 0.42, 0.06, 1.58, ROPE, { line: shade(ROPE, 0.55), west: shade(ROPE, 0.8), top: shade(ROPE, 1.1) });
    /* 木盖 */
    d.box(-0.3, -0.24, 1.88, 0.3, 0.24, 1.98, '#5a3a22', { line: '#2a160c', west: shade('#5a3a22', 0.8), top: shade('#5a3a22', 1.1) });
    for (const z of [0.3, 0.55, 0.85]) d.seg([-0.76, -0.59, z], [0.05, -0.59, z], shade(CER, 0.7));
    d.QS(-0.5, -0.4, 0.55, -0.15, 0.7, shade(GLAZE, 1.25));
  }
  /** Site232 酒旗：门前酒旗杆+布幌（点景级，非大牌坊） */
  function paintPropJiuqi(d) {
    const WOOD = '#5a3a22', WOOD_D = '#2a160c', WOOD_L = '#7a5a38';
    const CLOTH = '#c83828', CLOTH_D = '#8a2018', CLOTH_L = '#e05848', EDGE = '#e8c878', ROPE = '#8a6a38';
    /* 旗杆 */
    d.box(-0.08, -0.08, 0, 0.08, 0.08, 3.15, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: shade(WOOD, 1.08) });
    d.box(-0.12, -0.12, 0, 0.12, 0.12, 0.18, shade(WOOD_D, 1.05), { line: WOOD_D, west: WOOD_D, top: WOOD });
    /* 横挑臂 */
    d.box(0.0, -0.06, 2.75, 1.35, 0.06, 2.92, WOOD_L, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD_L, 1.1) });
    d.box(1.25, -0.05, 2.55, 1.38, 0.05, 2.95, WOOD, { line: WOOD_D, west: shade(WOOD, 0.75), top: shade(WOOD, 1.05) });
    /* 斜撑 */
    d.seg([0.05, 0, 2.2], [0.9, 0, 2.78], WOOD_D, 2);
    /* 布幌垂挂 */
    d.box(0.35, -0.12, 1.55, 1.2, 0.12, 2.72, CLOTH, { line: shade(CLOTH_D, 0.5), west: CLOTH_D, top: shade(CLOTH, 1.08) });
    d.box(0.4, -0.1, 1.7, 1.15, 0.1, 2.55, shade(CLOTH, 1.05), { line: shade(CLOTH_D, 0.5), west: shade(CLOTH_D, 0.9), top: CLOTH_L });
    /* 金边/流苏纹 */
    d.box(0.35, -0.12, 2.55, 1.2, 0.12, 2.72, EDGE, { line: shade(EDGE, 0.55), west: shade(EDGE, 0.8), top: shade(EDGE, 1.12) });
    d.box(0.35, -0.12, 1.55, 1.2, 0.12, 1.68, EDGE, { line: shade(EDGE, 0.55), west: shade(EDGE, 0.8), top: shade(EDGE, 1.1) });
    for (let x = 0.45; x <= 1.1; x += 0.18) {
      d.seg([x, -0.13, 1.55], [x, -0.13, 1.35], CLOTH_D);
      d.box(x - 0.04, -0.06, 1.28, x + 0.04, 0.06, 1.4, EDGE, { line: shade(EDGE, 0.55), west: shade(EDGE, 0.8), top: shade(EDGE, 1.1) });
    }
    /* 「酒」字块意（色块非字库） */
    d.box(0.58, -0.02, 1.95, 0.98, 0.02, 2.35, CLOTH_D, { line: shade(CLOTH_D, 0.5), west: shade(CLOTH_D, 0.85), top: shade(CLOTH_L, 0.9) });
    d.QS(0.62, -0.01, 2.0, 0.94, 2.3, shade(EDGE, 1.05));
    /* 挂绳 */
    d.seg([0.5, 0, 2.78], [0.5, 0, 2.7], ROPE, 2);
    d.seg([1.05, 0, 2.78], [1.05, 0, 2.7], ROPE, 2);
    d.QS(0.7, -0.1, 2.2, 1.05, 2.5, shade(CLOTH_L, 1.2));
  }

  /** Site233 石磨：上下扇圆磨+木柄+石材颗粒/粮粉痕迹（厨侧/磨坊巷口；kitbash 密实） */
  function paintPropShima(d) {
    const ST = '#8a8070', STW = '#6a6258', STL = '#a09888', ST_D = '#5a5048';
    const WOOD = '#6a4a28', WOOD_D = '#3a2210', WOOD_L = '#8a6a40';
    const FLOUR = '#e8dcc0', FLOUR_D = '#c8b898', MOSS = '#5a6a48';
    /* 石基座 */
    d.box(-0.72, -0.72, 0, 0.72, 0.72, 0.18, ST, { line: shade(ST, 0.5), west: STW, top: shade(ST, 0.92) });
    for (let a = 0; a < 8; a++) {
      const ang = a * Math.PI / 4;
      const x = Math.cos(ang) * 0.55, y = Math.sin(ang) * 0.55;
      d.seg([x * 0.7, y * 0.7, 0.18], [x, y, 0.18], shade(ST, 0.72));
    }
    /* 下扇石磨（粗厚圆盘，密实石块） */
    d.box(-0.62, -0.62, 0.18, 0.62, 0.62, 0.48, ST, { line: ST_D, west: STW, top: STL });
    d.box(-0.58, -0.58, 0.48, 0.58, 0.58, 0.62, shade(ST, 1.02), { line: ST_D, west: shade(ST, 0.82), top: shade(STL, 1.05) });
    /* 下扇放射纹/磨齿 */
    for (let a = 0; a < 12; a++) {
      const ang = a * Math.PI / 6;
      const x0 = Math.cos(ang) * 0.12, y0 = Math.sin(ang) * 0.12;
      const x1 = Math.cos(ang) * 0.52, y1 = Math.sin(ang) * 0.52;
      d.seg([x0, y0, 0.63], [x1, y1, 0.63], shade(ST_D, 0.95));
    }
    /* 中轴石芯 */
    d.box(-0.1, -0.1, 0.55, 0.1, 0.1, 0.95, ST, { line: ST_D, west: STW, top: STL });
    /* 上扇石磨（略小、可转） */
    d.box(-0.55, -0.55, 0.62, 0.55, 0.55, 0.92, shade(ST, 1.05), { line: ST_D, west: shade(ST, 0.85), top: shade(STL, 1.12) });
    for (let a = 0; a < 10; a++) {
      const ang = a * Math.PI / 5 + 0.15;
      const x0 = Math.cos(ang) * 0.1, y0 = Math.sin(ang) * 0.1;
      const x1 = Math.cos(ang) * 0.48, y1 = Math.sin(ang) * 0.48;
      d.seg([x0, y0, 0.93], [x1, y1, 0.93], shade(ST_D, 0.9));
    }
    /* 进料孔 */
    d.box(-0.12, -0.12, 0.9, 0.12, 0.12, 1.0, ST_D, { line: shade(ST_D, 0.7), west: shade(ST, 0.7), top: shade(ST_D, 0.85) });
    d.QS(-0.08, -0.08, 0.95, 0.08, 1.02, shade(FLOUR_D, 0.9));
    /* 木推柄（水平伸出） */
    d.box(0.35, -0.07, 0.72, 1.05, 0.07, 0.88, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: WOOD_L });
    d.box(0.95, -0.09, 0.7, 1.15, 0.09, 0.9, WOOD_D, { line: shade(WOOD_D, 0.7), west: shade(WOOD, 0.7), top: WOOD_L });
    for (let x = 0.4; x < 1.0; x += 0.18) d.seg([x, -0.08, 0.75], [x, -0.08, 0.85], shade(WOOD_D, 1.05));
    /* 立柱木柄（竖握） */
    d.box(0.98, -0.06, 0.88, 1.12, 0.06, 1.45, WOOD_L, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD_L, 1.1) });
    d.box(0.96, -0.08, 1.4, 1.14, 0.08, 1.55, WOOD_D, { line: shade(WOOD_D, 0.7), top: WOOD_L });
    /* 石材颗粒斑点 */
    for (const [dx, dy, dz] of [[-0.4, -0.5, 0.5], [0.35, -0.45, 0.55], [-0.3, 0.4, 0.7], [0.25, 0.35, 0.75], [-0.5, 0.1, 0.35], [0.45, -0.2, 0.8]]) {
      d.box(dx - 0.04, dy - 0.04, dz, dx + 0.04, dy + 0.04, dz + 0.06, shade(ST, 1.12), { line: false, noW: true, noS: true });
    }
    /* 粮粉痕迹（磨盘沿/基座） */
    d.box(-0.7, -0.15, 0.16, -0.45, 0.15, 0.22, FLOUR, { line: shade(FLOUR_D, 0.6), west: FLOUR_D, top: shade(FLOUR, 1.1) });
    d.box(0.4, 0.4, 0.16, 0.68, 0.65, 0.22, shade(FLOUR, 0.95), { line: shade(FLOUR_D, 0.55), west: FLOUR_D, top: FLOUR });
    d.QS(-0.5, -0.55, 0.85, -0.25, 0.95, shade(FLOUR, 0.85));
    d.QS(0.2, 0.3, 0.88, 0.45, 0.98, shade(FLOUR_D, 0.9));
    /* 苔点 */
    d.box(-0.65, 0.5, 0.02, -0.45, 0.68, 0.1, MOSS, { line: shade(MOSS, 0.55), top: shade(MOSS, 1.1) });
  }
  /** Site233 碾盘：石碾盘+碾轮+木轴（磨坊巷口/厩侧；kitbash 密实） */
  function paintPropNianpan(d) {
    const ST = '#8a8070', STW = '#6a6258', STL = '#a09888', ST_D = '#5a5048';
    const WOOD = '#6a4a28', WOOD_D = '#3a2210', WOOD_L = '#8a6a40';
    const FLOUR = '#e0d4b0', FLOUR_D = '#b8a878', MOSS = '#5a6a48';
    /* 宽石盘基 */
    d.box(-1.05, -1.05, 0, 1.05, 1.05, 0.16, ST, { line: shade(ST, 0.5), west: STW, top: shade(ST, 0.9) });
    for (let r = 0.3; r < 1.0; r += 0.22) {
      for (let a = 0; a < 8; a++) {
        const ang = a * Math.PI / 4;
        d.seg([Math.cos(ang) * r * 0.85, Math.sin(ang) * r * 0.85, 0.16], [Math.cos(ang) * r, Math.sin(ang) * r, 0.16], shade(ST, 0.7));
      }
    }
    /* 碾盘面（厚石板） */
    d.box(-0.95, -0.95, 0.16, 0.95, 0.95, 0.38, shade(ST, 1.02), { line: ST_D, west: STW, top: STL });
    /* 盘面凹槽环 */
    d.box(-0.7, -0.7, 0.36, 0.7, 0.7, 0.42, shade(ST, 0.92), { line: ST_D, west: shade(ST, 0.8), top: shade(ST, 0.95) });
    d.QS(-0.02, -0.65, 0.4, 0.65, 0.44, shade(ST, 1.08));
    /* 中心立轴石座 */
    d.box(-0.18, -0.18, 0.38, 0.18, 0.18, 0.85, ST, { line: ST_D, west: STW, top: STL });
    d.box(-0.12, -0.12, 0.85, 0.12, 0.12, 1.15, shade(ST, 1.05), { line: ST_D, west: shade(ST, 0.85), top: STL });
    /* 木横轴 */
    d.box(-0.08, -0.85, 0.95, 0.08, 0.85, 1.1, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: WOOD_L });
    for (let y = -0.7; y <= 0.7; y += 0.28) d.seg([-0.09, y, 0.98], [-0.09, y, 1.08], shade(WOOD_D, 1.0));
    /* 碾轮（竖立石轮，偏一侧） */
    d.box(-0.22, 0.45, 0.38, 0.22, 0.85, 1.05, ST, { line: ST_D, west: STW, top: STL });
    d.box(-0.18, 0.48, 0.42, 0.18, 0.82, 1.0, shade(ST, 1.08), { line: ST_D, west: shade(ST, 0.88), top: shade(STL, 1.1) });
    /* 碾轮辐纹 */
    for (let z = 0.5; z < 1.0; z += 0.12) d.seg([-0.2, 0.46, z], [0.2, 0.46, z], shade(ST_D, 0.9));
    for (let x = -0.12; x <= 0.12; x += 0.12) d.seg([x, 0.46, 0.45], [x, 0.46, 1.0], shade(ST_D, 0.85));
    /* 碾轮轴芯 */
    d.box(-0.06, 0.42, 0.68, 0.06, 0.88, 0.82, WOOD_D, { line: shade(WOOD_D, 0.7), west: shade(WOOD, 0.7), top: WOOD_L });
    /* 对面配重短柄 */
    d.box(-0.06, -0.95, 0.95, 0.06, -0.75, 1.1, WOOD_L, { line: WOOD_D, west: shade(WOOD, 0.8), top: WOOD_L });
    d.box(-0.1, -1.05, 0.9, 0.1, -0.88, 1.15, WOOD_D, { line: shade(WOOD_D, 0.7), top: WOOD_L });
    /* 石材颗粒 */
    for (const [dx, dy, dz] of [[-0.8, -0.6, 0.25], [0.7, -0.5, 0.3], [-0.5, 0.7, 0.28], [0.6, 0.6, 0.35], [0.1, 0.55, 0.7], [-0.15, 0.7, 0.9]]) {
      d.box(dx - 0.05, dy - 0.05, dz, dx + 0.05, dy + 0.05, dz + 0.07, shade(ST, 1.14), { line: false, noW: true, noS: true });
    }
    /* 粮粉/麸皮痕迹 */
    d.box(-0.9, -0.2, 0.14, -0.55, 0.2, 0.2, FLOUR, { line: shade(FLOUR_D, 0.55), west: FLOUR_D, top: shade(FLOUR, 1.08) });
    d.box(0.5, 0.5, 0.14, 0.9, 0.85, 0.2, shade(FLOUR, 0.92), { line: shade(FLOUR_D, 0.55), top: FLOUR });
    d.QS(-0.4, 0.5, 0.4, -0.1, 0.85, shade(FLOUR_D, 0.8));
    d.box(-0.3, -0.9, 0.14, 0.1, -0.6, 0.2, FLOUR_D, { line: shade(FLOUR_D, 0.5), top: FLOUR });
    /* 苔 */
    d.box(0.75, -0.9, 0.02, 0.95, -0.7, 0.1, MOSS, { line: shade(MOSS, 0.55), top: shade(MOSS, 1.1) });
  }
  /** Site233 石臼：臼身+木杵+粮粉（厨侧/粮袋旁；kitbash 密实） */
  function paintPropShijiu(d) {
    const ST = '#8a8070', STW = '#6a6258', STL = '#a09888', ST_D = '#5a5048';
    const WOOD = '#6a4a28', WOOD_D = '#3a2210', WOOD_L = '#8a6a40';
    const FLOUR = '#e8dcc0', FLOUR_D = '#c8b898', MOSS = '#5a6a48';
    /* 石臼底座 */
    d.box(-0.48, -0.48, 0, 0.48, 0.48, 0.2, ST, { line: shade(ST, 0.5), west: STW, top: shade(ST, 0.92) });
    for (let x = -0.35; x < 0.36; x += 0.2) d.seg([x, -0.49, 0.1], [x + 0.15, -0.49, 0.1], shade(ST, 0.72));
    /* 臼身鼓腹 */
    d.box(-0.42, -0.42, 0.2, 0.42, 0.42, 0.55, ST, { line: ST_D, west: STW, top: STL });
    d.box(-0.45, -0.45, 0.55, 0.45, 0.45, 0.85, shade(ST, 1.02), { line: ST_D, west: shade(ST, 0.82), top: shade(STL, 1.05) });
    /* 臼口外翻沿 */
    d.box(-0.5, -0.5, 0.82, 0.5, 0.5, 0.98, STL, { line: ST_D, west: shade(ST, 0.85), top: shade(STL, 1.15) });
    /* 臼腔内壁/底 */
    d.box(-0.32, -0.32, 0.45, 0.32, 0.32, 0.88, ST_D, { line: shade(ST_D, 0.7), west: shade(ST, 0.7), top: shade(ST_D, 0.9) });
    d.QS(-0.05, -0.28, 0.5, 0.28, 0.85, shade(ST, 0.85));
    /* 臼内粮粉 */
    d.box(-0.28, -0.28, 0.48, 0.28, 0.28, 0.62, FLOUR, { line: shade(FLOUR_D, 0.55), west: FLOUR_D, top: shade(FLOUR, 1.1) });
    d.QS(-0.08, -0.2, 0.55, 0.2, 0.7, shade(FLOUR, 1.05));
    /* 木杵（斜倚臼侧） */
    d.box(0.15, -0.08, 0.7, 0.35, 0.08, 1.85, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: WOOD_L });
    d.box(0.12, -0.1, 1.75, 0.38, 0.1, 1.95, WOOD_D, { line: shade(WOOD_D, 0.7), top: WOOD_L });
    /* 杵头石/木锤 */
    d.box(0.08, -0.14, 0.55, 0.42, 0.14, 0.78, WOOD_L, { line: WOOD_D, west: shade(WOOD, 0.75), top: shade(WOOD_L, 1.08) });
    d.box(0.1, -0.12, 0.5, 0.4, 0.12, 0.58, ST, { line: ST_D, west: STW, top: STL });
    for (let z = 0.9; z < 1.7; z += 0.22) d.seg([0.14, -0.09, z], [0.36, -0.09, z], shade(WOOD_D, 1.0));
    /* 石材颗粒 */
    for (const [dx, dy, dz] of [[-0.35, -0.35, 0.4], [0.3, -0.3, 0.65], [-0.3, 0.3, 0.7], [0.35, 0.25, 0.35], [-0.4, 0.05, 0.9]]) {
      d.box(dx - 0.035, dy - 0.035, dz, dx + 0.035, dy + 0.035, dz + 0.05, shade(ST, 1.12), { line: false, noW: true, noS: true });
    }
    /* 臼沿/地面粮粉痕迹 */
    d.box(-0.55, 0.2, 0.16, -0.3, 0.45, 0.22, FLOUR, { line: shade(FLOUR_D, 0.55), top: shade(FLOUR, 1.08) });
    d.box(0.25, -0.5, 0.16, 0.5, -0.25, 0.22, shade(FLOUR, 0.95), { line: shade(FLOUR_D, 0.55), top: FLOUR });
    d.QS(-0.15, -0.45, 0.9, 0.1, 1.0, shade(FLOUR_D, 0.85));
    /* 苔 */
    d.box(-0.45, 0.35, 0.02, -0.25, 0.48, 0.1, MOSS, { line: shade(MOSS, 0.55), top: shade(MOSS, 1.1) });
  }


  /** Site234 晾衣杆：竹竿支架+衣物色块层次（宅后/厨侧；≠site227 pole_liangshai 货摊晾晒；kitbash 密实） */
  function paintPropLiangyi(d) {
    const BAM = '#c8b070', BAM_D = '#8a7040', BAM_L = '#e0d098', WOOD = '#6a4a28', WOOD_D = '#3a2210';
    const ROPE = '#8a6a38', CLOTH_R = '#c84838', CLOTH_B = '#3a6a98', CLOTH_G = '#4a8a58', CLOTH_Y = '#d8b048', CLOTH_W = '#e8e0d0';
    /* 左右立竹竿 */
    d.box(-1.05, -0.08, 0, -0.88, 0.08, 2.55, BAM, { line: BAM_D, west: shade(BAM, 0.78), top: BAM_L });
    d.box(0.88, -0.08, 0, 1.05, 0.08, 2.55, BAM, { line: BAM_D, west: shade(BAM, 0.78), top: BAM_L });
    for (let z = 0.3; z < 2.4; z += 0.35) {
      d.seg([-1.06, -0.09, z], [-0.87, -0.09, z], shade(BAM_D, 0.95));
      d.seg([0.87, -0.09, z], [1.06, -0.09, z], shade(BAM_D, 0.95));
    }
    /* 顶横杆 */
    d.box(-1.1, -0.07, 2.35, 1.1, 0.07, 2.5, BAM_L, { line: BAM_D, west: shade(BAM, 0.8), top: shade(BAM_L, 1.1) });
    d.box(-1.12, -0.05, 2.2, 1.12, 0.05, 2.32, BAM, { line: BAM_D, west: shade(BAM, 0.82), top: BAM_L });
    /* 中横杆 */
    d.box(-1.05, -0.05, 1.55, 1.05, 0.05, 1.68, BAM, { line: BAM_D, west: shade(BAM, 0.8), top: BAM_L });
    /* 基座石/木墩 */
    d.box(-1.15, -0.18, 0, -0.78, 0.18, 0.22, WOOD, { line: WOOD_D, west: shade(WOOD, 0.75), top: shade(WOOD, 1.08) });
    d.box(0.78, -0.18, 0, 1.15, 0.18, 0.22, WOOD, { line: WOOD_D, west: shade(WOOD, 0.75), top: shade(WOOD, 1.08) });
    /* 绳结 */
    d.box(-1.0, -0.1, 2.28, -0.85, 0.1, 2.42, ROPE, { line: shade(ROPE, 0.55), top: shade(ROPE, 1.1) });
    d.box(0.85, -0.1, 2.28, 1.0, 0.1, 2.42, ROPE, { line: shade(ROPE, 0.55), top: shade(ROPE, 1.1) });
    /* 上层衣物色块（挂在顶杆） */
    const tops = [
      [-0.85, CLOTH_R], [-0.45, CLOTH_B], [-0.05, CLOTH_W], [0.35, CLOTH_G], [0.7, CLOTH_Y],
    ];
    for (const [x0, col] of tops) {
      d.box(x0, -0.12, 1.72, x0 + 0.28, 0.12, 2.32, col, { line: shade(col, 0.5), west: shade(col, 0.78), top: shade(col, 1.12) });
      d.QS(-0.13, x0 + 0.04, 1.85, x0 + 0.24, 2.2, shade(col, 1.15));
      d.box(x0 + 0.1, -0.04, 2.3, x0 + 0.18, 0.04, 2.4, ROPE, { line: shade(ROPE, 0.55), top: shade(ROPE, 1.08) });
    }
    /* 下层衣物/裤腿层次 */
    const bots = [
      [-0.7, CLOTH_B], [-0.3, CLOTH_R], [0.1, CLOTH_Y], [0.5, CLOTH_W],
    ];
    for (const [x0, col] of bots) {
      d.box(x0, -0.1, 0.85, x0 + 0.32, 0.1, 1.52, shade(col, 0.95), { line: shade(col, 0.5), west: shade(col, 0.75), top: shade(col, 1.08) });
      d.seg([x0 + 0.08, -0.11, 0.95], [x0 + 0.08, -0.11, 1.4], shade(col, 0.7));
      d.seg([x0 + 0.24, -0.11, 0.95], [x0 + 0.24, -0.11, 1.4], shade(col, 0.7));
    }
    /* 竹节高光 */
    d.QS(-0.09, -1.02, 1.2, -0.9, 1.35, shade(BAM_L, 1.2));
    d.QS(-0.09, 0.9, 1.8, 1.02, 1.95, shade(BAM_L, 1.2));
  }
  /** Site234 鱼篓：竹编篓身+绳提梁（码头/巷口；kitbash 密实） */
  function paintPropYulou(d) {
    const BAM = '#b89858', BAM_D = '#7a5830', BAM_L = '#d8c078', ROPE = '#5a3a22', FISH = '#6a8090', MOSS = '#5a6a48';
    /* 底圈 */
    d.box(-0.48, -0.48, 0, 0.48, 0.48, 0.18, BAM_D, { line: shade(BAM_D, 0.55), west: shade(BAM, 0.7), top: BAM });
    /* 鼓腹篓身（多层竹圈） */
    d.box(-0.55, -0.55, 0.18, 0.55, 0.55, 0.55, BAM, { line: BAM_D, west: shade(BAM, 0.78), top: BAM_L });
    d.box(-0.52, -0.52, 0.55, 0.52, 0.52, 0.95, shade(BAM, 1.02), { line: BAM_D, west: shade(BAM, 0.82), top: BAM_L });
    d.box(-0.45, -0.45, 0.95, 0.45, 0.45, 1.25, BAM_L, { line: BAM_D, west: shade(BAM, 0.85), top: shade(BAM_L, 1.1) });
    /* 口沿收口 */
    d.box(-0.4, -0.4, 1.22, 0.4, 0.4, 1.38, BAM_D, { line: shade(BAM_D, 0.6), west: shade(BAM, 0.75), top: BAM_L });
    d.box(-0.28, -0.28, 1.3, 0.28, 0.28, 1.42, shade(BAM_D, 0.9), { line: BAM_D, west: shade(BAM, 0.7), top: shade(BAM_D, 0.85) });
    /* 竹编交叉纹 */
    for (let z = 0.25; z < 1.2; z += 0.18) {
      d.seg([-0.54, -0.5, z], [0.54, -0.5, z], shade(BAM_D, 0.9));
      d.seg([-0.5, 0.5, z], [0.5, 0.5, z], shade(BAM_D, 0.85));
    }
    for (let a = 0; a < 8; a++) {
      const ang = a * Math.PI / 4;
      const x = Math.cos(ang) * 0.48, y = Math.sin(ang) * 0.48;
      d.seg([x * 0.85, y * 0.85, 0.2], [x * 0.75, y * 0.75, 1.2], shade(BAM_D, 0.95));
    }
    /* 绳提梁 */
    d.box(-0.08, -0.55, 1.35, 0.08, 0.55, 1.48, ROPE, { line: shade(ROPE, 0.55), west: shade(ROPE, 0.8), top: shade(ROPE, 1.1) });
    d.box(-0.55, -0.08, 1.35, -0.4, 0.08, 1.85, ROPE, { line: shade(ROPE, 0.55), west: shade(ROPE, 0.8), top: shade(ROPE, 1.08) });
    d.box(0.4, -0.08, 1.35, 0.55, 0.08, 1.85, ROPE, { line: shade(ROPE, 0.55), west: shade(ROPE, 0.8), top: shade(ROPE, 1.08) });
    d.box(-0.5, -0.08, 1.8, 0.5, 0.08, 1.95, ROPE, { line: shade(ROPE, 0.55), west: shade(ROPE, 0.85), top: shade(ROPE, 1.12) });
    /* 篓内鱼影/湿痕 */
    d.box(-0.2, -0.15, 0.35, 0.2, 0.15, 0.55, FISH, { line: shade(FISH, 0.5), west: shade(FISH, 0.75), top: shade(FISH, 1.1) });
    d.QS(-0.1, -0.2, 0.4, 0.15, 0.7, shade(FISH, 0.9));
    /* 苔/水渍 */
    d.box(-0.5, 0.35, 0.02, -0.3, 0.5, 0.12, MOSS, { line: shade(MOSS, 0.55), top: shade(MOSS, 1.1) });
    d.QS(-0.35, -0.5, 0.6, -0.15, 0.85, shade(BAM_L, 0.85));
  }
  /** Site234 竹筐：堆叠竹编筐（巷口/厨侧；kitbash 密实） */
  function paintPropZhukuang(d) {
    const BAM = '#c0a060', BAM_D = '#806038', BAM_L = '#dcc888', ROPE = '#6a4a28', VEG = '#5a8a48', VEG2 = '#c86838';
    /* 底层大筐 */
    d.box(-0.7, -0.55, 0, 0.7, 0.55, 0.2, BAM_D, { line: shade(BAM_D, 0.55), west: shade(BAM, 0.7), top: BAM });
    d.box(-0.68, -0.52, 0.2, 0.68, 0.52, 0.65, BAM, { line: BAM_D, west: shade(BAM, 0.78), top: BAM_L });
    d.box(-0.72, -0.56, 0.6, 0.72, 0.56, 0.78, BAM_L, { line: BAM_D, west: shade(BAM, 0.85), top: shade(BAM_L, 1.1) });
    /* 中层斜放筐 */
    d.box(-0.55, -0.45, 0.78, 0.55, 0.45, 1.15, shade(BAM, 1.02), { line: BAM_D, west: shade(BAM, 0.8), top: BAM_L });
    d.box(-0.58, -0.48, 1.1, 0.58, 0.48, 1.28, BAM_L, { line: BAM_D, west: shade(BAM, 0.85), top: shade(BAM_L, 1.08) });
    /* 顶层小筐 */
    d.box(-0.4, -0.35, 1.28, 0.4, 0.35, 1.55, BAM, { line: BAM_D, west: shade(BAM, 0.78), top: BAM_L });
    d.box(-0.42, -0.37, 1.5, 0.42, 0.37, 1.68, BAM_L, { line: BAM_D, west: shade(BAM, 0.85), top: shade(BAM_L, 1.12) });
    /* 编织横纹 */
    for (let z of [0.3, 0.5, 0.9, 1.05, 1.4]) {
      d.seg([-0.65, -0.53, z], [0.65, -0.53, z], shade(BAM_D, 0.9));
    }
    for (let x = -0.55; x <= 0.55; x += 0.22) d.seg([x, -0.54, 0.25], [x, -0.54, 0.7], shade(BAM_D, 0.85));
    for (let x = -0.4; x <= 0.4; x += 0.2) d.seg([x, -0.46, 0.85], [x, -0.46, 1.2], shade(BAM_D, 0.9));
    /* 捆绳 */
    d.box(-0.7, -0.08, 0.4, 0.7, 0.08, 0.5, ROPE, { line: shade(ROPE, 0.55), west: shade(ROPE, 0.8), top: shade(ROPE, 1.08) });
    d.box(-0.55, -0.08, 1.0, 0.55, 0.08, 1.1, ROPE, { line: shade(ROPE, 0.55), west: shade(ROPE, 0.8), top: shade(ROPE, 1.05) });
    /* 筐内蔬果色块 */
    d.box(-0.25, -0.2, 0.55, 0.05, 0.15, 0.72, VEG, { line: shade(VEG, 0.5), west: shade(VEG, 0.75), top: shade(VEG, 1.12) });
    d.box(0.1, -0.15, 0.55, 0.4, 0.2, 0.75, VEG2, { line: shade(VEG2, 0.5), west: shade(VEG2, 0.78), top: shade(VEG2, 1.1) });
    d.box(-0.2, -0.15, 1.2, 0.2, 0.15, 1.35, shade(VEG, 1.05), { line: shade(VEG, 0.5), top: shade(VEG, 1.15) });
    d.QS(-0.15, -0.4, 1.55, 0.15, 1.65, shade(BAM_L, 1.2));
  }

  /** Site235 鸡笼：竹木笼+鸡影层次（宅后/厨侧/厩旁；kitbash 密实） */
  function paintPropJilong(d) {
    const BAM = '#c4a868', BAM_D = '#7a5830', BAM_L = '#e0d098', WOOD = '#6a4a28', WOOD_D = '#3a2210';
    const ROPE = '#8a6a38', FEATH = '#c85828', FEATH2 = '#e8d0a0', FEATH3 = '#8a4830', STRAW = '#c8b070';
    /* 底托木框 */
    d.box(-0.85, -0.55, 0, 0.85, 0.55, 0.18, WOOD, { line: WOOD_D, west: shade(WOOD, 0.75), top: shade(WOOD, 1.08) });
    d.box(-0.9, -0.6, 0.12, 0.9, 0.6, 0.28, BAM_D, { line: shade(BAM_D, 0.55), west: shade(BAM, 0.7), top: BAM });
    /* 笼身四壁竹格（密实色块+格纹，禁纯线稿） */
    d.box(-0.82, -0.52, 0.28, 0.82, 0.52, 1.15, BAM, { line: BAM_D, west: shade(BAM, 0.78), top: BAM_L });
    d.box(-0.78, -0.48, 1.1, 0.78, 0.48, 1.35, BAM_L, { line: BAM_D, west: shade(BAM, 0.85), top: shade(BAM_L, 1.1) });
    /* 顶盖微拱 */
    d.box(-0.88, -0.58, 1.3, 0.88, 0.58, 1.48, BAM_D, { line: shade(BAM_D, 0.6), west: shade(BAM, 0.75), top: BAM_L });
    d.box(-0.55, -0.35, 1.45, 0.55, 0.35, 1.58, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.1) });
    /* 竹栅横档 */
    for (let z = 0.4; z < 1.25; z += 0.16) {
      d.seg([-0.8, -0.53, z], [0.8, -0.53, z], shade(BAM_D, 0.92));
      d.seg([-0.8, 0.53, z], [0.8, 0.53, z], shade(BAM_D, 0.85));
    }
    for (let x = -0.7; x <= 0.7; x += 0.2) {
      d.seg([x, -0.54, 0.3], [x, -0.54, 1.3], shade(BAM_D, 0.9));
    }
    /* 笼门小闩 */
    d.box(-0.2, -0.58, 0.55, 0.2, -0.48, 1.0, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: shade(WOOD, 1.08) });
    d.box(-0.08, -0.62, 0.72, 0.08, -0.45, 0.88, ROPE, { line: shade(ROPE, 0.55), top: shade(ROPE, 1.1) });
    /* 鸡影层次（色块体，非线稿） */
    d.box(-0.35, -0.2, 0.4, -0.05, 0.15, 0.75, FEATH, { line: shade(FEATH, 0.5), west: shade(FEATH, 0.75), top: shade(FEATH, 1.12) });
    d.box(-0.28, -0.12, 0.72, 0.0, 0.1, 0.95, FEATH3, { line: shade(FEATH3, 0.5), west: shade(FEATH3, 0.78), top: shade(FEATH3, 1.1) });
    d.box(0.1, -0.18, 0.38, 0.42, 0.18, 0.7, FEATH2, { line: shade(FEATH2, 0.5), west: shade(FEATH2, 0.8), top: shade(FEATH2, 1.12) });
    d.box(0.18, -0.1, 0.68, 0.38, 0.12, 0.9, FEATH, { line: shade(FEATH, 0.5), west: shade(FEATH, 0.78), top: shade(FEATH, 1.08) });
    /* 冠/喙点缀 */
    d.box(-0.22, -0.05, 0.92, -0.1, 0.05, 1.05, '#c03028', { line: shade('#c03028', 0.5), top: shade('#c03028', 1.15) });
    d.box(0.28, -0.04, 0.88, 0.38, 0.04, 0.98, '#d87828', { line: shade('#d87828', 0.5), top: shade('#d87828', 1.1) });
    /* 笼底垫草 */
    d.box(-0.7, -0.4, 0.28, 0.7, 0.4, 0.38, STRAW, { line: shade(STRAW, 0.55), west: shade(STRAW, 0.8), top: shade(STRAW, 1.1) });
    d.QS(-0.35, -0.55, 0.5, -0.25, 0.85, shade(BAM_L, 1.15));
    d.QS(-0.4, 0.25, 1.0, 0.55, 1.2, shade(BAM_L, 1.18));
  }
  /** Site235 鸟笼：悬挂圆笼+挂钩（巷口挂笼/檐下；kitbash 密实） */
  function paintPropNiaolong(d) {
    const BAM = '#b89858', BAM_D = '#6a4828', BAM_L = '#d8c078', WOOD = '#5a3a22', HOOK = '#8a8a98';
    const ROPE = '#6a4a28', BIRD = '#3a6a98', BIRD2 = '#c85038', LEAF = '#4a7a48';
    /* 顶挂钩+吊环 */
    d.box(-0.08, -0.08, 2.15, 0.08, 0.08, 2.45, HOOK, { line: shade(HOOK, 0.5), west: shade(HOOK, 0.8), top: shade(HOOK, 1.15) });
    d.box(-0.18, -0.06, 2.05, 0.18, 0.06, 2.2, HOOK, { line: shade(HOOK, 0.55), west: shade(HOOK, 0.78), top: shade(HOOK, 1.1) });
    d.box(-0.05, -0.05, 1.85, 0.05, 0.05, 2.1, ROPE, { line: shade(ROPE, 0.55), top: shade(ROPE, 1.08) });
    /* 上盖圆盘 */
    d.box(-0.55, -0.55, 1.7, 0.55, 0.55, 1.88, BAM_D, { line: shade(BAM_D, 0.55), west: shade(BAM, 0.72), top: BAM_L });
    d.box(-0.4, -0.4, 1.85, 0.4, 0.4, 1.98, WOOD, { line: shade(WOOD, 0.55), west: shade(WOOD, 0.8), top: shade(WOOD, 1.1) });
    /* 鼓腹笼身（多层竹圈色块） */
    d.box(-0.62, -0.62, 1.15, 0.62, 0.62, 1.72, BAM, { line: BAM_D, west: shade(BAM, 0.78), top: BAM_L });
    d.box(-0.68, -0.68, 0.7, 0.68, 0.68, 1.2, shade(BAM, 1.02), { line: BAM_D, west: shade(BAM, 0.8), top: BAM_L });
    d.box(-0.58, -0.58, 0.35, 0.58, 0.58, 0.75, BAM, { line: BAM_D, west: shade(BAM, 0.78), top: BAM_L });
    /* 底托 */
    d.box(-0.5, -0.5, 0.15, 0.5, 0.5, 0.38, BAM_D, { line: shade(BAM_D, 0.55), west: shade(BAM, 0.7), top: BAM });
    d.box(-0.35, -0.35, 0.0, 0.35, 0.35, 0.2, WOOD, { line: shade(WOOD, 0.55), west: shade(WOOD, 0.78), top: shade(WOOD, 1.08) });
    /* 竖竹筋密排 */
    for (let a = 0; a < 12; a++) {
      const ang = a * Math.PI / 6;
      const x = Math.cos(ang) * 0.58, y = Math.sin(ang) * 0.58;
      d.seg([x, y, 0.4], [x * 0.9, y * 0.9, 1.7], shade(BAM_D, 0.95));
    }
    for (let z of [0.5, 0.85, 1.2, 1.5]) {
      d.seg([-0.6, -0.6, z], [0.6, -0.6, z], shade(BAM_D, 0.9));
    }
    /* 笼内鸟影 */
    d.box(-0.15, -0.12, 0.85, 0.2, 0.15, 1.15, BIRD, { line: shade(BIRD, 0.5), west: shade(BIRD, 0.75), top: shade(BIRD, 1.12) });
    d.box(-0.05, -0.08, 1.12, 0.15, 0.1, 1.35, BIRD2, { line: shade(BIRD2, 0.5), west: shade(BIRD2, 0.78), top: shade(BIRD2, 1.1) });
    d.box(0.12, -0.04, 1.28, 0.22, 0.04, 1.4, '#e8c060', { line: shade('#e8c060', 0.5), top: shade('#e8c060', 1.15) });
    /* 食罐/水盅 */
    d.box(-0.35, 0.15, 0.4, -0.15, 0.4, 0.6, '#d8c8a0', { line: shade('#d8c8a0', 0.5), west: shade('#d8c8a0', 0.8), top: shade('#d8c8a0', 1.1) });
    d.box(0.15, 0.12, 0.4, 0.4, 0.38, 0.58, '#6a8aa8', { line: shade('#6a8aa8', 0.5), west: shade('#6a8aa8', 0.8), top: shade('#6a8aa8', 1.12) });
    /* 小叶点缀 */
    d.box(-0.45, -0.5, 1.55, -0.25, -0.3, 1.72, LEAF, { line: shade(LEAF, 0.5), top: shade(LEAF, 1.15) });
    d.QS(-0.2, -0.35, 1.6, -0.1, 1.8, shade(BAM_L, 1.2));
  }
  /** Site235 小鸭舍/鹅舍：矮棚+水盆（宅后/厩旁/厨侧点景级；kitbash 密实） */
  function paintPropYashe(d) {
    const WOOD = '#6a4a28', WOOD_D = '#3a2210', WOOD_L = '#8a6a40', THATCH = '#b89858', THATCH_D = '#7a5830';
    const BAM = '#c8b070', STONE = '#8a8a80', WATER = '#4a7a98', DUCK = '#e8e0d0', DUCK2 = '#c85038', MOSS = '#5a6a48';
    /* 矮棚台基 */
    d.box(-1.0, -0.7, 0, 1.0, 0.7, 0.2, STONE, { line: shade(STONE, 0.55), west: shade(STONE, 0.75), top: shade(STONE, 1.08) });
    /* 后墙/侧墙木板 */
    d.box(-0.95, 0.45, 0.2, 0.95, 0.7, 1.15, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: WOOD_L });
    d.box(-0.95, -0.7, 0.2, -0.7, 0.7, 1.15, WOOD, { line: WOOD_D, west: shade(WOOD, 0.75), top: WOOD_L });
    d.box(0.7, -0.7, 0.2, 0.95, 0.7, 1.15, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: WOOD_L });
    /* 茅草/瓦顶矮坡 */
    d.box(-1.1, -0.8, 1.05, 1.1, 0.85, 1.35, THATCH, { line: THATCH_D, west: shade(THATCH, 0.78), top: shade(THATCH, 1.12) });
    d.box(-1.05, -0.75, 1.3, 1.05, 0.8, 1.5, THATCH_D, { line: shade(THATCH_D, 0.55), west: shade(THATCH, 0.7), top: shade(THATCH, 1.05) });
    d.box(-0.15, -0.1, 1.45, 0.15, 0.15, 1.62, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: WOOD_L });
    /* 前檐柱 */
    d.box(-0.85, -0.72, 0.2, -0.7, -0.55, 1.2, BAM, { line: shade(BAM, 0.55), west: shade(BAM, 0.8), top: shade(BAM, 1.1) });
    d.box(0.7, -0.72, 0.2, 0.85, -0.55, 1.2, BAM, { line: shade(BAM, 0.55), west: shade(BAM, 0.8), top: shade(BAM, 1.1) });
    /* 门洞暗影 */
    d.box(-0.35, -0.68, 0.25, 0.35, -0.5, 0.95, shade(WOOD_D, 0.85), { line: WOOD_D, west: shade(WOOD_D, 0.7), top: shade(WOOD, 0.6) });
    /* 棚内草垫 */
    d.box(-0.6, -0.35, 0.2, 0.55, 0.35, 0.35, '#c8b070', { line: shade('#c8b070', 0.55), west: shade('#c8b070', 0.8), top: shade('#c8b070', 1.1) });
    /* 鸭/鹅影 */
    d.box(-0.25, -0.55, 0.35, 0.05, -0.25, 0.65, DUCK, { line: shade(DUCK, 0.5), west: shade(DUCK, 0.8), top: shade(DUCK, 1.12) });
    d.box(-0.15, -0.45, 0.62, 0.0, -0.3, 0.78, DUCK2, { line: shade(DUCK2, 0.5), top: shade(DUCK2, 1.1) });
    d.box(0.2, -0.5, 0.32, 0.5, -0.2, 0.58, shade(DUCK, 0.95), { line: shade(DUCK, 0.5), west: shade(DUCK, 0.78), top: shade(DUCK, 1.08) });
    /* 水盆（点景级） */
    d.box(0.35, 0.15, 0.2, 0.9, 0.6, 0.35, STONE, { line: shade(STONE, 0.5), west: shade(STONE, 0.75), top: shade(STONE, 1.05) });
    d.box(0.42, 0.22, 0.32, 0.83, 0.53, 0.48, WATER, { line: shade(WATER, 0.5), west: shade(WATER, 0.8), top: shade(WATER, 1.18) });
    d.QS(-0.25, 0.45, 0.35, 0.75, 0.45, shade(WATER, 1.25));
    /* 苔痕/木纹 */
    d.box(-0.9, 0.5, 0.25, -0.75, 0.65, 0.45, MOSS, { line: shade(MOSS, 0.55), top: shade(MOSS, 1.1) });
    d.seg([-0.92, 0.48, 0.5], [0.92, 0.48, 0.5], shade(WOOD_D, 0.9));
    d.seg([-0.92, 0.48, 0.85], [0.92, 0.48, 0.85], shade(WOOD_D, 0.85));
    d.QS(-0.55, -0.85, 1.15, -0.5, 1.35, shade(THATCH, 1.2));
  }

  /** Site236 蒲团：圆草垫叠放（廊下/石桌旁/庭院；kitbash 密实，禁纯线稿） */
  function paintPropPutuan(d) {
    const STRAW = '#c8b070', STRAW_D = '#8a7040', STRAW_L = '#e0d098', ROPE = '#6a4a28';
    const CLOTH = '#a84838', CLOTH2 = '#6a3828', EDGE = '#5a4830', MOSS = '#5a6a48';
    /* 底层大圆垫 */
    d.box(-0.72, -0.72, 0, 0.72, 0.72, 0.16, STRAW_D, { line: shade(STRAW_D, 0.55), west: shade(STRAW, 0.72), top: STRAW });
    d.box(-0.65, -0.65, 0.12, 0.65, 0.65, 0.28, STRAW, { line: STRAW_D, west: shade(STRAW, 0.8), top: STRAW_L });
    /* 中层叠垫微错位 */
    d.box(-0.55, -0.48, 0.26, 0.62, 0.68, 0.42, shade(STRAW, 1.02), { line: STRAW_D, west: shade(STRAW, 0.78), top: STRAW_L });
    d.box(-0.5, -0.42, 0.38, 0.55, 0.58, 0.52, STRAW_L, { line: STRAW_D, west: shade(STRAW, 0.85), top: shade(STRAW_L, 1.1) });
    /* 顶层小垫/坐面 */
    d.box(-0.42, -0.38, 0.48, 0.42, 0.42, 0.62, CLOTH, { line: CLOTH2, west: shade(CLOTH, 0.78), top: shade(CLOTH, 1.12) });
    d.box(-0.28, -0.28, 0.58, 0.28, 0.28, 0.7, shade(CLOTH, 1.05), { line: CLOTH2, west: shade(CLOTH, 0.82), top: shade(CLOTH, 1.15) });
    /* 草绳捆扎 */
    d.box(-0.68, -0.08, 0.18, -0.55, 0.08, 0.35, ROPE, { line: shade(ROPE, 0.55), top: shade(ROPE, 1.08) });
    d.box(0.55, -0.08, 0.28, 0.68, 0.08, 0.45, ROPE, { line: shade(ROPE, 0.55), top: shade(ROPE, 1.08) });
    d.box(-0.08, -0.7, 0.2, 0.08, -0.55, 0.4, ROPE, { line: shade(ROPE, 0.55), top: shade(ROPE, 1.08) });
    /* 编织纹层次（色块/短段，非线稿） */
    for (let a = 0; a < 8; a++) {
      const ang = a * Math.PI / 4;
      const x = Math.cos(ang) * 0.55, y = Math.sin(ang) * 0.55;
      d.box(x - 0.06, y - 0.06, 0.14, x + 0.06, y + 0.06, 0.26, shade(STRAW_D, 0.95), { line: false, noW: true, noS: true });
    }
    for (let r = 0.2; r < 0.55; r += 0.12) {
      d.seg([-r, 0, 0.52], [r, 0, 0.52], shade(CLOTH2, 0.85));
      d.seg([0, -r, 0.52], [0, r, 0.52], shade(CLOTH2, 0.8));
    }
    /* 边缘压条 + 苔痕 */
    d.box(-0.75, -0.15, 0.0, -0.68, 0.15, 0.12, EDGE, { line: shade(EDGE, 0.55), top: shade(EDGE, 1.05) });
    d.box(0.68, -0.15, 0.0, 0.75, 0.15, 0.12, EDGE, { line: shade(EDGE, 0.55), top: shade(EDGE, 1.05) });
    d.box(-0.2, 0.55, 0.12, 0.05, 0.7, 0.22, MOSS, { line: shade(MOSS, 0.55), top: shade(MOSS, 1.1) });
    d.QS(-0.15, -0.2, 0.62, 0.15, 0.68, shade(CLOTH, 1.2));
    d.QS(-0.45, 0.2, 0.3, 0.5, 0.4, shade(STRAW_L, 1.18));
  }
  /** Site236 小茶灶/风炉：铜铁风炉+壶（茶摊侧/庭院/廊下；kitbash 密实） */
  function paintPropChazao(d) {
    const IRON = '#4a4a52', IRON_D = '#2a2a30', IRON_L = '#6a6a72', BRZ = '#8a6a38', BRZ_D = '#5a4020';
    const COPPER = '#a87840', COPPER_L = '#c89858', ASH = '#3a3428', FLAME = '#ff9030', FLAME2 = '#ffe060';
    const POT = '#5a6a78', POT_L = '#8aa0b0', WOOD = '#5a3a22', CHAR = '#2a2218';
    /* 石/砖台基 */
    d.box(-0.55, -0.5, 0, 0.55, 0.5, 0.18, '#7a7a70', { line: shade('#7a7a70', 0.55), west: shade('#7a7a70', 0.75), top: shade('#8a8a80', 1.08) });
    /* 风炉三足 */
    for (const [x, y] of [[-0.28, -0.2], [0.28, -0.2], [0, 0.28]]) {
      d.box(x - 0.07, y - 0.07, 0.18, x + 0.07, y + 0.07, 0.42, IRON, { line: IRON_D, west: shade(IRON, 0.78), top: IRON_L });
    }
    /* 炉身收腰 */
    d.box(-0.38, -0.35, 0.4, 0.38, 0.35, 0.55, IRON, { line: IRON_D, west: shade(IRON, 0.8), top: IRON_L });
    d.box(-0.42, -0.38, 0.55, 0.42, 0.38, 0.85, shade(IRON, 1.02), { line: IRON_D, west: shade(IRON, 0.82), top: IRON_L });
    d.box(-0.35, -0.32, 0.85, 0.35, 0.32, 1.05, IRON, { line: IRON_D, west: shade(IRON, 0.78), top: shade(IRON, 1.05) });
    /* 炉沿铜口 */
    d.box(-0.48, -0.42, 1.02, 0.48, 0.42, 1.15, BRZ, { line: BRZ_D, west: shade(BRZ, 0.85), top: COPPER_L });
    /* 炉门/通风孔色块 */
    d.box(-0.15, -0.42, 0.55, 0.15, -0.32, 0.85, IRON_D, { line: shade(IRON_D, 0.6), west: shade(IRON, 0.6), top: IRON });
    d.box(-0.35, 0.0, 0.62, -0.28, 0.2, 0.78, CHAR, { line: false, noW: true, noS: true });
    d.box(0.28, 0.0, 0.62, 0.35, 0.2, 0.78, CHAR, { line: false, noW: true, noS: true });
    /* 炉内炭火 */
    d.box(-0.22, -0.18, 0.9, 0.22, 0.18, 1.05, ASH, { line: false, noW: true, noS: true });
    d.box(-0.12, -0.1, 1.0, 0.12, 0.1, 1.18, FLAME, { line: shade(FLAME, 0.55), west: '#e86820', top: FLAME2 });
    d.QS(-0.08, -0.06, 1.15, 0.06, 1.32, FLAME2);
    /* 铁架/提梁 */
    d.box(-0.05, -0.05, 1.12, 0.05, 0.05, 1.55, IRON_L, { line: IRON_D, west: shade(IRON, 0.85), top: shade(IRON_L, 1.1) });
    d.box(-0.35, -0.04, 1.48, 0.35, 0.04, 1.58, IRON, { line: IRON_D, west: shade(IRON, 0.8), top: IRON_L });
    /* 铜壶（点景级） */
    d.box(-0.22, -0.22, 1.55, 0.22, 0.22, 1.85, COPPER, { line: BRZ_D, west: shade(COPPER, 0.8), top: COPPER_L });
    d.box(-0.18, -0.18, 1.82, 0.18, 0.18, 2.05, shade(COPPER, 1.05), { line: BRZ_D, west: shade(COPPER, 0.85), top: COPPER_L });
    d.box(-0.08, -0.08, 2.0, 0.08, 0.08, 2.18, BRZ, { line: BRZ_D, west: shade(BRZ, 0.85), top: COPPER_L });
    /* 壶嘴/壶把 */
    d.box(0.18, -0.06, 1.7, 0.42, 0.06, 1.88, COPPER, { line: BRZ_D, west: shade(COPPER, 0.78), top: COPPER_L });
    d.box(-0.38, -0.05, 1.65, -0.2, 0.05, 1.95, BRZ, { line: BRZ_D, west: shade(BRZ, 0.8), top: COPPER_L });
    /* 旁侧小木柴/炭篓 */
    d.box(0.35, 0.15, 0.18, 0.55, 0.45, 0.55, WOOD, { line: shade(WOOD, 0.55), west: shade(WOOD, 0.75), top: shade(WOOD, 1.08) });
    d.box(0.38, 0.18, 0.5, 0.52, 0.42, 0.72, CHAR, { line: shade(CHAR, 0.6), top: shade(CHAR, 1.05) });
    d.box(-0.55, 0.2, 0.18, -0.35, 0.45, 0.4, POT, { line: shade(POT, 0.55), west: shade(POT, 0.8), top: POT_L });
    d.QS(-0.1, -0.15, 1.9, 0.1, 2.05, shade(COPPER_L, 1.2));
  }
  /** Site236 茶盏托盘：点景茶具（石桌旁/廊下/茶摊侧；kitbash 密实） */
  function paintPropChaju(d) {
    const WOOD = '#6a4a28', WOOD_D = '#3a2210', WOOD_L = '#8a6a40', LACQ = '#5a2018', LACQ_L = '#8a3830';
    const PORC = '#e8e0d0', PORC_B = '#3a6a98', PORC_G = '#4a7a58', TEA = '#6a5030', GOLD = '#c8a040';
    const MAT = '#c8b070', MAT_D = '#8a7040';
    /* 托盘木底 */
    d.box(-0.7, -0.45, 0, 0.7, 0.45, 0.1, WOOD, { line: WOOD_D, west: shade(WOOD, 0.75), top: WOOD_L });
    d.box(-0.65, -0.4, 0.08, 0.65, 0.4, 0.22, LACQ, { line: shade(LACQ, 0.55), west: shade(LACQ, 0.8), top: LACQ_L });
    /* 盘沿 */
    d.box(-0.72, -0.48, 0.18, 0.72, -0.38, 0.32, WOOD_L, { line: WOOD_D, west: shade(WOOD, 0.82), top: shade(WOOD_L, 1.1) });
    d.box(-0.72, 0.38, 0.18, 0.72, 0.48, 0.32, WOOD_L, { line: WOOD_D, west: shade(WOOD, 0.82), top: shade(WOOD_L, 1.1) });
    d.box(-0.72, -0.48, 0.18, -0.62, 0.48, 0.32, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: WOOD_L });
    d.box(0.62, -0.48, 0.18, 0.72, 0.48, 0.32, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: WOOD_L });
    /* 草垫/布垫 */
    d.box(-0.5, -0.28, 0.22, 0.5, 0.28, 0.32, MAT, { line: MAT_D, west: shade(MAT, 0.8), top: shade(MAT, 1.1) });
    /* 茶壶 */
    d.box(-0.35, -0.18, 0.32, -0.05, 0.18, 0.65, PORC, { line: shade(PORC, 0.55), west: shade(PORC, 0.88), top: shade(PORC, 1.08) });
    d.box(-0.3, -0.14, 0.62, -0.1, 0.14, 0.78, PORC_B, { line: shade(PORC_B, 0.5), west: shade(PORC_B, 0.8), top: shade(PORC_B, 1.12) });
    d.box(-0.25, -0.08, 0.75, -0.15, 0.08, 0.88, GOLD, { line: shade(GOLD, 0.55), top: shade(GOLD, 1.15) });
    d.box(-0.05, -0.05, 0.5, 0.12, 0.05, 0.62, PORC, { line: shade(PORC, 0.55), top: shade(PORC, 1.05) });
    d.box(-0.42, -0.04, 0.48, -0.32, 0.04, 0.7, PORC_B, { line: shade(PORC_B, 0.5), top: shade(PORC_B, 1.1) });
    /* 茶盏×3 */
    const cups = [[0.05, -0.2, PORC], [0.28, -0.05, PORC_G], [0.12, 0.18, PORC]];
    for (const [cx, cy, col] of cups) {
      d.box(cx - 0.1, cy - 0.1, 0.32, cx + 0.1, cy + 0.1, 0.42, col, { line: shade(col, 0.5), west: shade(col, 0.85), top: shade(col, 1.1) });
      d.box(cx - 0.08, cy - 0.08, 0.4, cx + 0.08, cy + 0.08, 0.52, shade(col, 1.02), { line: shade(col, 0.55), west: shade(col, 0.88), top: shade(col, 1.12) });
      d.box(cx - 0.05, cy - 0.05, 0.48, cx + 0.05, cy + 0.05, 0.55, TEA, { line: false, noW: true, noS: true });
    }
    /* 茶荷/小碟 */
    d.box(0.4, 0.1, 0.32, 0.58, 0.3, 0.4, PORC, { line: shade(PORC, 0.55), west: shade(PORC, 0.85), top: shade(PORC, 1.08) });
    d.box(0.42, 0.12, 0.38, 0.56, 0.28, 0.45, GOLD, { line: shade(GOLD, 0.55), top: shade(GOLD, 1.12) });
    /* 漆盘金线点缀 */
    d.seg([-0.55, -0.35, 0.22], [0.55, -0.35, 0.22], shade(GOLD, 0.9));
    d.seg([-0.55, 0.35, 0.22], [0.55, 0.35, 0.22], shade(GOLD, 0.85));
    d.QS(-0.28, -0.12, 0.7, -0.18, 0.8, shade(PORC, 1.15));
    d.QS(0.08, -0.18, 0.48, 0.02, 0.52, shade(TEA, 1.2));
  }

  /** Site237 书案：矮案+卷轴书册（廊下/庭院石桌旁/书房外檐/茶席侧；kitbash 密实，禁纯线稿） */
  function paintPropShuan(d) {
    const WOOD = '#6a4a28', WOOD_D = '#3a2210', WOOD_L = '#8a6a40', LACQ = '#5a2018', LACQ_L = '#8a3830';
    const PAPER = '#e8dcc0', PAPER_D = '#c8b890', INK = '#2a2a28', JADE = '#4a7a58', GOLD = '#c8a040';
    const CLOTH = '#a84838', CLOTH2 = '#6a3828', SCROLL = '#d8c8a0', BIND = '#8a5030';
    /* 案足×4 */
    for (const [x, y] of [[-0.85, -0.38], [0.85, -0.38], [-0.85, 0.38], [0.85, 0.38]]) {
      d.box(x - 0.08, y - 0.08, 0, x + 0.08, y + 0.08, 0.72, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: WOOD_L });
    }
    /* 横枨 */
    d.box(-0.9, -0.42, 0.28, 0.9, -0.32, 0.4, WOOD_D, { line: shade(WOOD_D, 0.55), west: shade(WOOD, 0.7), top: WOOD });
    d.box(-0.9, 0.32, 0.28, 0.9, 0.42, 0.4, WOOD_D, { line: shade(WOOD_D, 0.55), west: shade(WOOD, 0.7), top: WOOD });
    /* 案面漆木 */
    d.box(-1.0, -0.48, 0.7, 1.0, 0.48, 0.88, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: WOOD_L });
    d.box(-0.95, -0.42, 0.85, 0.95, 0.42, 0.98, LACQ, { line: shade(LACQ, 0.55), west: shade(LACQ, 0.82), top: LACQ_L });
    /* 卷轴堆（左侧） */
    d.box(-0.85, -0.28, 0.98, -0.45, 0.28, 1.18, SCROLL, { line: PAPER_D, west: shade(SCROLL, 0.85), top: PAPER });
    d.box(-0.82, -0.22, 1.15, -0.48, 0.22, 1.35, PAPER, { line: PAPER_D, west: shade(PAPER, 0.9), top: shade(PAPER, 1.08) });
    d.box(-0.9, -0.08, 1.05, -0.4, 0.08, 1.2, BIND, { line: shade(BIND, 0.55), top: shade(BIND, 1.1) });
    d.box(-0.78, -0.18, 1.32, -0.52, 0.18, 1.48, SCROLL, { line: PAPER_D, west: shade(SCROLL, 0.88), top: PAPER });
    /* 书册叠放（中） */
    d.box(-0.25, -0.3, 0.98, 0.35, 0.3, 1.12, CLOTH, { line: CLOTH2, west: shade(CLOTH, 0.8), top: shade(CLOTH, 1.1) });
    d.box(-0.22, -0.26, 1.1, 0.32, 0.26, 1.22, CLOTH2, { line: shade(CLOTH2, 0.55), west: shade(CLOTH, 0.75), top: CLOTH });
    d.box(-0.18, -0.22, 1.2, 0.28, 0.22, 1.32, PAPER, { line: PAPER_D, west: shade(PAPER, 0.9), top: shade(PAPER, 1.05) });
    d.box(-0.15, -0.18, 1.3, 0.25, 0.18, 1.42, PAPER_D, { line: shade(PAPER_D, 0.55), top: PAPER });
    /* 展开书页色块 */
    d.box(0.05, -0.35, 0.98, 0.55, 0.05, 1.05, PAPER, { line: PAPER_D, west: shade(PAPER, 0.92), top: shade(PAPER, 1.1) });
    d.box(0.1, -0.3, 1.03, 0.5, 0.0, 1.08, INK, { line: false, noW: true, noS: true });
    /* 镇纸/玉件 */
    d.box(0.6, -0.15, 0.98, 0.85, 0.15, 1.12, JADE, { line: shade(JADE, 0.55), west: shade(JADE, 0.8), top: shade(JADE, 1.15) });
    d.box(0.65, -0.08, 1.1, 0.8, 0.08, 1.2, GOLD, { line: shade(GOLD, 0.55), top: shade(GOLD, 1.12) });
    /* 案沿金线点缀（短段色条，非纯线稿） */
    d.box(-0.95, -0.45, 0.9, -0.88, 0.45, 0.96, GOLD, { line: false, noW: true, noS: true });
    d.box(0.88, -0.45, 0.9, 0.95, 0.45, 0.96, GOLD, { line: false, noW: true, noS: true });
    d.QS(-0.1, -0.1, 1.35, 0.05, 1.45, shade(PAPER, 1.15));
    d.QS(0.68, -0.05, 1.14, 0.78, 1.18, shade(JADE, 1.2));
  }
  /** Site237 棋盘：围棋/象棋盘+棋罐（庭院石桌旁/廊下/茶席侧；≠site228 seat_qiping 棋枰桌；kitbash 密实） */
  function paintPropQipan(d) {
    const WOOD = '#5a3a22', WOOD_D = '#2a160c', WOOD_L = '#7a5a38', BOARD = '#d8c8a0', BOARD_D = '#a89060';
    const LINE = '#3a2a18', BLACK = '#2a2a28', WHITE = '#e8e0d0', JAR = '#6a4a28', JAR_L = '#8a6a40';
    const CLOTH = '#4a5840', CLOTH2 = '#2a3820', STONE = '#8a8a80', RED = '#a83828';
    /* 布垫底 */
    d.box(-0.78, -0.78, 0, 0.78, 0.78, 0.1, CLOTH, { line: CLOTH2, west: shade(CLOTH, 0.78), top: shade(CLOTH, 1.08) });
    /* 木框棋盘 */
    d.box(-0.7, -0.7, 0.08, 0.7, 0.7, 0.22, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: WOOD_L });
    d.box(-0.62, -0.62, 0.2, 0.62, 0.62, 0.32, BOARD, { line: BOARD_D, west: shade(BOARD, 0.88), top: shade(BOARD, 1.1) });
    /* 棋盘格（实体细条色块，非纯线稿） */
    for (let i = -5; i <= 5; i++) {
      const t = i * 0.1;
      d.box(t - 0.015, -0.55, 0.3, t + 0.015, 0.55, 0.34, LINE, { line: false, noW: true, noS: true });
      d.box(-0.55, t - 0.015, 0.3, 0.55, t + 0.015, 0.34, LINE, { line: false, noW: true, noS: true });
    }
    /* 星位/交叉点色块 */
    for (const [x, y] of [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3], [0, 0]]) {
      d.box(x - 0.04, y - 0.04, 0.32, x + 0.04, y + 0.04, 0.36, WOOD_D, { line: false, noW: true, noS: true });
    }
    /* 黑白子散落 */
    const stones = [[-0.2, -0.15, BLACK], [0.15, -0.25, WHITE], [-0.35, 0.1, BLACK], [0.25, 0.2, WHITE], [0.05, 0.35, BLACK], [-0.1, 0.25, WHITE], [0.4, -0.05, BLACK]];
    for (const [sx, sy, col] of stones) {
      d.box(sx - 0.07, sy - 0.07, 0.34, sx + 0.07, sy + 0.07, 0.48, col, { line: shade(col, 0.55), west: shade(col, 0.85), top: shade(col, 1.12) });
    }
    /* 棋罐×2 */
    d.box(0.45, 0.35, 0.1, 0.72, 0.65, 0.55, JAR, { line: WOOD_D, west: shade(JAR, 0.8), top: JAR_L });
    d.box(0.48, 0.38, 0.52, 0.68, 0.62, 0.7, BLACK, { line: shade(BLACK, 0.6), top: shade(BLACK, 1.05) });
    d.box(-0.72, 0.35, 0.1, -0.45, 0.65, 0.55, JAR, { line: WOOD_D, west: shade(JAR, 0.8), top: JAR_L });
    d.box(-0.68, 0.38, 0.52, -0.48, 0.62, 0.7, WHITE, { line: shade(WHITE, 0.55), top: shade(WHITE, 1.08) });
    /* 罐盖/提环 */
    d.box(0.52, 0.42, 0.68, 0.64, 0.58, 0.78, WOOD_L, { line: WOOD_D, top: shade(WOOD_L, 1.1) });
    d.box(-0.64, 0.42, 0.68, -0.52, 0.58, 0.78, WOOD_L, { line: WOOD_D, top: shade(WOOD_L, 1.1) });
    /* 旁侧小木匣（象棋子暗示） */
    d.box(-0.7, -0.7, 0.1, -0.4, -0.45, 0.4, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: WOOD_L });
    d.box(-0.65, -0.65, 0.38, -0.45, -0.5, 0.52, RED, { line: shade(RED, 0.55), top: shade(RED, 1.1) });
    d.QS(-0.05, -0.05, 0.4, 0.05, 0.48, shade(BOARD, 1.15));
  }
  /** Site237 笔架砚台：点景文房（书房外檐/廊下/茶席侧/石桌旁；kitbash 密实） */
  function paintPropBijia(d) {
    const WOOD = '#5a3a22', WOOD_D = '#2a160c', WOOD_L = '#7a5a38', STONE = '#4a4a52', STONE_L = '#6a6a72';
    const INK = '#1a1a18', INK_W = '#3a3a38', BRUSH = '#2a2218', HAIR = '#c8b890', JADE = '#4a7a58';
    const PAPER = '#e8dcc0', GOLD = '#c8a040', RED = '#a83828', WATER = '#5a7a88';
    /* 石砚台基 */
    d.box(-0.55, -0.4, 0, 0.55, 0.4, 0.12, STONE, { line: shade(STONE, 0.55), west: shade(STONE, 0.75), top: STONE_L });
    d.box(-0.48, -0.32, 0.1, 0.2, 0.32, 0.28, STONE_L, { line: shade(STONE, 0.55), west: shade(STONE, 0.82), top: shade(STONE_L, 1.08) });
    /* 砚堂墨池 */
    d.box(-0.35, -0.2, 0.22, 0.08, 0.2, 0.35, INK, { line: shade(INK, 0.6), west: INK_W, top: shade(INK, 1.05) });
    d.box(-0.28, -0.12, 0.32, 0.0, 0.12, 0.4, INK_W, { line: false, noW: true, noS: true });
    /* 笔架山（三峰） */
    d.box(0.15, -0.25, 0.12, 0.5, 0.25, 0.35, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: WOOD_L });
    d.box(0.2, -0.08, 0.32, 0.32, 0.08, 0.85, WOOD_L, { line: WOOD_D, west: shade(WOOD, 0.85), top: shade(WOOD_L, 1.1) });
    d.box(0.32, -0.1, 0.32, 0.45, 0.1, 1.05, WOOD, { line: WOOD_D, west: shade(WOOD, 0.82), top: WOOD_L });
    d.box(0.18, -0.12, 0.32, 0.28, 0.05, 0.7, WOOD_D, { line: shade(WOOD_D, 0.55), top: WOOD });
    /* 毛笔×3 斜倚 */
    const brushes = [[0.22, -0.05, 0.7, 1.35], [0.35, 0.0, 0.85, 1.55], [0.28, 0.08, 0.55, 1.2]];
    for (const [bx, by, z0, z1] of brushes) {
      d.box(bx - 0.04, by - 0.04, z0, bx + 0.04, by + 0.04, z1 - 0.25, BRUSH, { line: shade(BRUSH, 0.55), west: shade(BRUSH, 0.8), top: shade(BRUSH, 1.05) });
      d.box(bx - 0.05, by - 0.05, z1 - 0.28, bx + 0.05, by + 0.05, z1, HAIR, { line: shade(HAIR, 0.55), west: shade(HAIR, 0.85), top: shade(HAIR, 1.1) });
      d.box(bx - 0.035, by - 0.035, z1 - 0.5, bx + 0.035, by + 0.035, z1 - 0.35, GOLD, { line: shade(GOLD, 0.55), top: shade(GOLD, 1.1) });
    }
    /* 水盂 */
    d.box(-0.5, 0.15, 0.12, -0.28, 0.38, 0.45, JADE, { line: shade(JADE, 0.55), west: shade(JADE, 0.8), top: shade(JADE, 1.12) });
    d.box(-0.46, 0.18, 0.42, -0.32, 0.34, 0.55, WATER, { line: shade(WATER, 0.55), top: shade(WATER, 1.15) });
    /* 印泥盒 */
    d.box(-0.15, 0.2, 0.28, 0.08, 0.38, 0.48, RED, { line: shade(RED, 0.55), west: shade(RED, 0.8), top: shade(RED, 1.12) });
    d.box(-0.12, 0.23, 0.45, 0.05, 0.35, 0.55, GOLD, { line: shade(GOLD, 0.55), top: shade(GOLD, 1.1) });
    /* 旁侧小纸卷 */
    d.box(-0.55, -0.38, 0.12, -0.25, -0.18, 0.35, PAPER, { line: shade(PAPER, 0.55), west: shade(PAPER, 0.9), top: shade(PAPER, 1.08) });
    d.box(-0.5, -0.35, 0.32, -0.3, -0.22, 0.48, WOOD_L, { line: WOOD_D, top: shade(WOOD_L, 1.05) });
    d.QS(0.35, 0.0, 1.4, 0.42, 1.52, shade(HAIR, 1.15));
    d.QS(-0.2, 0.0, 0.36, -0.1, 0.4, shade(INK_W, 1.1));
  }

  /** Site238 花架：木架+盆花（庭院/廊下/豪宅侧院/茶席旁；≠盆景 pot_penjing；kitbash 密实） */
  function paintPropHuajia(d) {
    const WOOD = '#6a4a28', WOOD_D = '#3a2210', WOOD_L = '#8a6a40', LACQ = '#5a2818';
    const POT = '#8a4030', POT2 = '#6a3020', POT3 = '#a85838', SOIL = '#4a3020';
    const LEAF = '#3a7840', LEAF2 = '#2a5830', FLOWER = '#c84858', FLOWER2 = '#e87838', FLOWER3 = '#d8a040', FLOWER4 = '#e8d0e0';
    /* 立柱×4 */
    for (const [x, y] of [[-0.55, -0.35], [0.55, -0.35], [-0.55, 0.35], [0.55, 0.35]]) {
      d.box(x - 0.07, y - 0.07, 0, x + 0.07, y + 0.07, 2.35, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: WOOD_L });
    }
    /* 横档三层 */
    for (const z of [0.55, 1.25, 1.95]) {
      d.box(-0.6, -0.4, z, 0.6, 0.4, z + 0.1, WOOD_L, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD_L, 1.08) });
      d.box(-0.58, -0.38, z + 0.08, 0.58, 0.38, z + 0.14, LACQ, { line: shade(LACQ, 0.55), top: shade(LACQ, 1.1) });
    }
    /* 顶横梁 + 短飞檐暗示 */
    d.box(-0.65, -0.42, 2.3, 0.65, 0.42, 2.45, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: WOOD_L });
    d.box(-0.7, -0.2, 2.4, -0.55, 0.2, 2.55, WOOD_D, { line: shade(WOOD_D, 0.55), top: WOOD });
    d.box(0.55, -0.2, 2.4, 0.7, 0.2, 2.55, WOOD_D, { line: shade(WOOD_D, 0.55), top: WOOD });
    /* 下层盆花×3 */
    const potsLo = [[-0.38, -0.12, POT, FLOWER], [0.0, 0.1, POT2, FLOWER2], [0.35, -0.08, POT3, FLOWER3]];
    for (const [px, py, pc, fc] of potsLo) {
      d.box(px - 0.16, py - 0.16, 0.7, px + 0.16, py + 0.16, 1.05, pc, { line: shade(pc, 0.55), west: shade(pc, 0.8), top: shade(pc, 1.1) });
      d.box(px - 0.12, py - 0.12, 1.0, px + 0.12, py + 0.12, 1.12, SOIL, { line: shade(SOIL, 0.55), top: shade(SOIL, 1.05) });
      d.box(px - 0.1, py - 0.1, 1.1, px + 0.1, py + 0.1, 1.45, LEAF, { line: shade(LEAF, 0.55), west: LEAF2, top: shade(LEAF, 1.12) });
      d.box(px - 0.08, py - 0.05, 1.4, px + 0.08, py + 0.08, 1.58, fc, { line: shade(fc, 0.55), top: shade(fc, 1.15) });
    }
    /* 中层盆花×2 */
    for (const [px, py, pc, fc] of [[-0.28, 0.05, POT3, FLOWER4], [0.28, -0.05, POT, FLOWER]]) {
      d.box(px - 0.15, py - 0.15, 1.4, px + 0.15, py + 0.15, 1.72, pc, { line: shade(pc, 0.55), west: shade(pc, 0.82), top: shade(pc, 1.1) });
      d.box(px - 0.11, py - 0.11, 1.68, px + 0.11, py + 0.11, 1.8, SOIL, { line: shade(SOIL, 0.55), top: shade(SOIL, 1.05) });
      d.box(px - 0.12, py - 0.1, 1.78, px + 0.12, py + 0.1, 2.15, LEAF2, { line: shade(LEAF2, 0.55), west: LEAF, top: shade(LEAF, 1.1) });
      d.box(px - 0.07, py - 0.06, 2.1, px + 0.07, py + 0.06, 2.28, fc, { line: shade(fc, 0.55), top: shade(fc, 1.12) });
    }
    /* 上层小盆 */
    d.box(-0.12, -0.1, 2.1, 0.12, 0.12, 2.35, POT2, { line: shade(POT2, 0.55), west: shade(POT2, 0.8), top: shade(POT2, 1.1) });
    d.box(-0.08, -0.06, 2.32, 0.08, 0.08, 2.42, SOIL, { line: shade(SOIL, 0.55), top: shade(SOIL, 1.05) });
    d.box(-0.1, -0.08, 2.4, 0.1, 0.08, 2.7, LEAF, { line: shade(LEAF, 0.55), west: LEAF2, top: shade(LEAF, 1.15) });
    d.box(-0.06, -0.04, 2.65, 0.06, 0.05, 2.82, FLOWER2, { line: shade(FLOWER2, 0.55), top: shade(FLOWER2, 1.15) });
    d.QS(-0.05, -0.02, 2.75, 0.05, 2.85, shade(FLOWER2, 1.2));
    d.QS(0.3, -0.05, 1.55, 0.4, 1.65, shade(FLOWER3, 1.15));
  }
  /** Site238 竹几：矮几（茶席旁/廊下/庭院；竹节木色层次；≠石桌/书案；kitbash 密实） */
  function paintPropZhuji(d) {
    const BAM = '#7a8a48', BAM_D = '#4a5828', BAM_L = '#9aaa68', NODE = '#5a6828';
    const MAT = '#c8b070', MAT_D = '#a89050', TEA = '#6a3828', PORC = '#e8e0d0', GREEN = '#4a7a58';
    /* 四腿竹节 */
    for (const [x, y] of [[-0.55, -0.35], [0.55, -0.35], [-0.55, 0.35], [0.55, 0.35]]) {
      d.box(x - 0.07, y - 0.07, 0, x + 0.07, y + 0.07, 0.55, BAM, { line: BAM_D, west: shade(BAM, 0.8), top: BAM_L });
      d.box(x - 0.085, y - 0.085, 0.18, x + 0.085, y + 0.085, 0.26, NODE, { line: shade(NODE, 0.55), top: shade(NODE, 1.1) });
      d.box(x - 0.085, y - 0.085, 0.4, x + 0.085, y + 0.085, 0.48, NODE, { line: shade(NODE, 0.55), top: shade(NODE, 1.1) });
    }
    /* 横枨 */
    d.box(-0.58, -0.38, 0.22, 0.58, -0.28, 0.32, BAM_D, { line: shade(BAM_D, 0.55), west: shade(BAM, 0.75), top: BAM });
    d.box(-0.58, 0.28, 0.22, 0.58, 0.38, 0.32, BAM_D, { line: shade(BAM_D, 0.55), west: shade(BAM, 0.75), top: BAM });
    /* 几面编席 */
    d.box(-0.65, -0.42, 0.52, 0.65, 0.42, 0.68, BAM, { line: BAM_D, west: shade(BAM, 0.8), top: BAM_L });
    d.box(-0.6, -0.38, 0.65, 0.6, 0.38, 0.78, MAT, { line: MAT_D, west: shade(MAT, 0.88), top: shade(MAT, 1.1) });
    /* 席纹细条（实体色块） */
    for (let i = -4; i <= 4; i++) {
      const t = i * 0.12;
      d.box(t - 0.02, -0.35, 0.76, t + 0.02, 0.35, 0.8, MAT_D, { line: false, noW: true, noS: true });
    }
    /* 茶盏×2 + 小壶 */
    d.box(-0.35, -0.15, 0.78, -0.15, 0.05, 0.98, PORC, { line: shade(PORC, 0.55), west: shade(PORC, 0.9), top: shade(PORC, 1.08) });
    d.box(-0.32, -0.12, 0.95, -0.18, 0.02, 1.05, GREEN, { line: shade(GREEN, 0.55), top: shade(GREEN, 1.12) });
    d.box(0.12, -0.12, 0.78, 0.32, 0.08, 0.98, PORC, { line: shade(PORC, 0.55), west: shade(PORC, 0.9), top: shade(PORC, 1.08) });
    d.box(0.15, -0.08, 0.95, 0.28, 0.05, 1.05, TEA, { line: shade(TEA, 0.55), top: shade(TEA, 1.1) });
    d.box(-0.08, 0.08, 0.78, 0.18, 0.32, 1.15, TEA, { line: shade(TEA, 0.55), west: shade(TEA, 0.8), top: shade(TEA, 1.08) });
    d.box(-0.02, 0.14, 1.12, 0.12, 0.26, 1.28, PORC, { line: shade(PORC, 0.55), top: shade(PORC, 1.1) });
    /* 旁侧竹卷/小匣 */
    d.box(0.35, -0.3, 0.78, 0.58, -0.05, 1.05, BAM_L, { line: BAM_D, west: shade(BAM, 0.85), top: shade(BAM_L, 1.1) });
    d.box(-0.55, 0.15, 0.78, -0.3, 0.35, 1.0, NODE, { line: shade(NODE, 0.55), top: shade(NODE, 1.08) });
    d.QS(0.0, 0.15, 1.22, 0.1, 1.3, shade(PORC, 1.15));
    d.QS(-0.25, -0.05, 1.0, -0.2, 1.08, shade(GREEN, 1.2));
  }
  /** Site238 小博古架：点景层架+瓶罐（廊下/豪宅侧院/茶席旁；≠抱鼓石 stone_baogu / 货架 rack；kitbash 密实） */
  function paintPropBogu(d) {
    const WOOD = '#5a3a22', WOOD_D = '#2a160c', WOOD_L = '#7a5a38', LACQ = '#4a1810', LACQ_L = '#7a3028';
    const PORC = '#e8e0d0', BLUE = '#3a5a88', CEL = '#6a9a78', AMBER = '#c87838', JADE = '#4a7a58';
    const GOLD = '#c8a040', RED = '#a83828', BRONZE = '#8a6a38', INK = '#2a2a28';
    /* 背板+侧板 */
    d.box(-0.55, 0.28, 0, 0.55, 0.4, 2.35, WOOD, { line: WOOD_D, west: shade(WOOD, 0.75), top: WOOD_L });
    d.box(-0.58, -0.32, 0, -0.48, 0.35, 2.35, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: WOOD_L });
    d.box(0.48, -0.32, 0, 0.58, 0.35, 2.35, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: WOOD_L });
    /* 底足 */
    d.box(-0.55, -0.32, 0, -0.35, -0.18, 0.2, WOOD_D, { line: shade(WOOD_D, 0.55), top: WOOD });
    d.box(0.35, -0.32, 0, 0.55, -0.18, 0.2, WOOD_D, { line: shade(WOOD_D, 0.55), top: WOOD });
    /* 层板×4 */
    for (const z of [0.35, 0.95, 1.55, 2.15]) {
      d.box(-0.52, -0.3, z, 0.52, 0.32, z + 0.1, WOOD_L, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD_L, 1.08) });
      d.box(-0.5, -0.28, z + 0.08, 0.5, 0.3, z + 0.14, LACQ, { line: shade(LACQ, 0.55), top: LACQ_L });
    }
    /* 顶帽 */
    d.box(-0.6, -0.35, 2.3, 0.6, 0.4, 2.5, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: WOOD_L });
    d.box(-0.45, -0.15, 2.48, 0.45, 0.25, 2.62, LACQ_L, { line: LACQ, top: shade(LACQ_L, 1.1) });
    /* 底层：铜尊+瓷瓶 */
    d.box(-0.4, -0.15, 0.5, -0.15, 0.15, 0.95, BRONZE, { line: shade(BRONZE, 0.55), west: shade(BRONZE, 0.8), top: GOLD });
    d.box(-0.35, -0.1, 0.9, -0.2, 0.1, 1.08, GOLD, { line: shade(GOLD, 0.55), top: shade(GOLD, 1.12) });
    d.box(0.1, -0.12, 0.5, 0.38, 0.18, 1.05, PORC, { line: shade(PORC, 0.55), west: shade(PORC, 0.9), top: shade(PORC, 1.08) });
    d.box(0.15, -0.08, 0.75, 0.32, 0.12, 0.95, BLUE, { line: shade(BLUE, 0.55), top: shade(BLUE, 1.1) });
    d.box(0.18, -0.05, 1.0, 0.3, 0.08, 1.18, PORC, { line: shade(PORC, 0.55), top: shade(PORC, 1.05) });
    /* 二层：青瓷罐+红盒 */
    d.box(-0.38, -0.12, 1.1, -0.08, 0.18, 1.55, CEL, { line: shade(CEL, 0.55), west: shade(CEL, 0.82), top: shade(CEL, 1.12) });
    d.box(-0.32, -0.06, 1.5, -0.14, 0.1, 1.68, JADE, { line: shade(JADE, 0.55), top: shade(JADE, 1.1) });
    d.box(0.08, -0.15, 1.1, 0.4, 0.15, 1.4, RED, { line: shade(RED, 0.55), west: shade(RED, 0.8), top: shade(RED, 1.12) });
    d.box(0.12, -0.1, 1.38, 0.35, 0.1, 1.52, GOLD, { line: shade(GOLD, 0.55), top: shade(GOLD, 1.1) });
    /* 三层：琥珀色瓶+墨匣 */
    d.box(-0.35, -0.1, 1.7, -0.05, 0.15, 2.2, AMBER, { line: shade(AMBER, 0.55), west: shade(AMBER, 0.82), top: shade(AMBER, 1.12) });
    d.box(-0.28, -0.05, 2.15, -0.12, 0.08, 2.35, GOLD, { line: shade(GOLD, 0.55), top: shade(GOLD, 1.1) });
    d.box(0.1, -0.18, 1.7, 0.42, 0.12, 1.95, INK, { line: shade(INK, 0.6), west: shade(INK, 0.85), top: shade(INK, 1.05) });
    d.box(0.15, -0.12, 1.92, 0.38, 0.08, 2.1, WOOD_L, { line: WOOD_D, top: shade(WOOD_L, 1.08) });
    /* 顶层：小玉件+瓷碟 */
    d.box(-0.25, -0.08, 2.3, -0.05, 0.12, 2.5, JADE, { line: shade(JADE, 0.55), west: shade(JADE, 0.8), top: shade(JADE, 1.15) });
    d.box(0.1, -0.15, 2.3, 0.4, 0.15, 2.42, PORC, { line: shade(PORC, 0.55), west: shade(PORC, 0.9), top: shade(PORC, 1.08) });
    d.box(0.15, -0.1, 2.4, 0.35, 0.1, 2.52, BLUE, { line: shade(BLUE, 0.55), top: shade(BLUE, 1.1) });
    d.QS(-0.2, 0.0, 2.45, -0.1, 2.55, shade(JADE, 1.2));
    d.QS(0.2, -0.05, 1.0, 0.28, 1.1, shade(BLUE, 1.15));
  }

  /** Site239 串灯：檐下连串小灯（市井点景；≠宫灯/纱灯/立灯；kitbash 密实） */
  function paintPropChuanleng(d) {
    const WOOD = '#5a3a22', WOOD_D = '#2a160c', WOOD_L = '#7a5a38';
    const ROPE = '#8a7050', ROPE_D = '#5a4830';
    const PAPER = '#f0d8a0', PAPER2 = '#e8c878', PAPER3 = '#f8e8c0', PAPER4 = '#d8b060';
    const FRAME = '#6a4828', GLOW = '#ffe8a8', TASSEL = '#c84838';
    /* 檐下横杆 */
    d.box(-1.15, -0.08, 2.35, 1.15, 0.08, 2.5, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: WOOD_L });
    d.box(-1.18, -0.1, 2.32, -1.05, 0.1, 2.52, WOOD_D, { line: shade(WOOD_D, 0.55), top: WOOD });
    d.box(1.05, -0.1, 2.32, 1.18, 0.1, 2.52, WOOD_D, { line: shade(WOOD_D, 0.55), top: WOOD });
    /* 主绳 */
    d.box(-1.05, -0.03, 2.28, 1.05, 0.03, 2.36, ROPE, { line: ROPE_D, west: shade(ROPE, 0.85), top: shade(ROPE, 1.08) });
    /* 六盏小纸灯（实体层次，非线稿） */
    const lamps = [
      [-0.9, PAPER, PAPER2], [-0.54, PAPER3, PAPER], [-0.18, PAPER2, PAPER4],
      [0.18, PAPER, PAPER3], [0.54, PAPER4, PAPER2], [0.9, PAPER2, PAPER],
    ];
    for (const [x, pc, pc2] of lamps) {
      /* 吊绳 */
      d.box(x - 0.02, -0.02, 2.05, x + 0.02, 0.02, 2.3, ROPE_D, { line: false, noW: true, noS: true });
      /* 上木箍 */
      d.box(x - 0.14, -0.14, 2.0, x + 0.14, 0.14, 2.1, FRAME, { line: WOOD_D, west: shade(FRAME, 0.8), top: WOOD_L });
      /* 灯身（圆筒实体） */
      d.box(x - 0.16, -0.16, 1.55, x + 0.16, 0.16, 2.02, pc, { line: shade(pc, 0.55), west: shade(pc2, 0.92), top: shade(pc, 1.12) });
      d.box(x - 0.12, -0.12, 1.65, x + 0.12, 0.12, 1.95, shade(pc, 1.08), { line: false, noW: true, noS: true, top: GLOW });
      /* 下木箍 */
      d.box(x - 0.14, -0.14, 1.48, x + 0.14, 0.14, 1.58, FRAME, { line: WOOD_D, west: shade(FRAME, 0.8), top: WOOD_L });
      /* 短穗 */
      d.box(x - 0.04, -0.04, 1.28, x + 0.04, 0.04, 1.5, TASSEL, { line: shade(TASSEL, 0.55), west: shade(TASSEL, 0.8), top: shade(TASSEL, 1.1) });
      d.QS(x - 0.08, -0.05, 1.75, x + 0.08, 1.95, shade(GLOW, 1.15));
    }
    /* 端头结 */
    d.box(-1.08, -0.06, 2.25, -0.98, 0.06, 2.4, ROPE_D, { line: shade(ROPE_D, 0.55), top: ROPE });
    d.box(0.98, -0.06, 2.25, 1.08, 0.06, 2.4, ROPE_D, { line: shade(ROPE_D, 0.55), top: ROPE });
  }
  /** Site239 布幌：竖幌+横杆（店门/茶摊檐下；≠酒旗杆 prop_jiuqi / 宫灯；kitbash 密实） */
  function paintPropHuangzi(d) {
    const WOOD = '#5a3a22', WOOD_D = '#2a160c', WOOD_L = '#7a5a38';
    const CLOTH = '#c84838', CLOTH_D = '#8a2820', CLOTH_L = '#e86858';
    const EDGE = '#d8a040', EDGE_D = '#a87828', CREAM = '#e8d8b0', INK = '#2a2218';
    const ROPE = '#6a5040';
    /* 墙托短臂 + 横杆 */
    d.box(-0.15, -0.12, 2.55, 0.15, 0.12, 2.85, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: WOOD_L });
    d.box(0.05, -0.08, 2.65, 0.95, 0.08, 2.8, WOOD_L, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD_L, 1.08) });
    d.box(0.85, -0.1, 2.62, 1.05, 0.1, 2.82, WOOD_D, { line: shade(WOOD_D, 0.55), top: WOOD });
    /* 挂环 */
    d.box(0.25, -0.06, 2.55, 0.38, 0.06, 2.68, EDGE, { line: EDGE_D, top: shade(EDGE, 1.1) });
    d.box(0.72, -0.06, 2.55, 0.85, 0.06, 2.68, EDGE, { line: EDGE_D, top: shade(EDGE, 1.1) });
    /* 竖布幌主体（厚实体） */
    d.box(0.22, -0.14, 0.85, 0.95, 0.14, 2.58, CLOTH, { line: shade(CLOTH_D, 0.5), west: CLOTH_D, top: shade(CLOTH, 1.08) });
    d.box(0.28, -0.1, 1.0, 0.9, 0.1, 2.45, CLOTH_L, { line: shade(CLOTH_D, 0.55), west: shade(CLOTH, 0.9), top: shade(CLOTH_L, 1.1) });
    /* 金边上沿/下沿 */
    d.box(0.22, -0.14, 2.45, 0.95, 0.14, 2.58, EDGE, { line: EDGE_D, west: shade(EDGE, 0.8), top: shade(EDGE, 1.12) });
    d.box(0.22, -0.14, 0.85, 0.95, 0.14, 1.0, EDGE, { line: EDGE_D, west: shade(EDGE, 0.8), top: shade(EDGE, 1.1) });
    /* 中腰织纹色带 */
    d.box(0.3, -0.08, 1.65, 0.88, 0.08, 1.95, CREAM, { line: shade(CREAM, 0.55), west: shade(CREAM, 0.9), top: shade(CREAM, 1.08) });
    d.box(0.4, -0.04, 1.72, 0.78, 0.04, 1.9, INK, { line: shade(INK, 0.6), west: shade(INK, 0.85), top: shade(INK, 1.05) });
    /* 褶痕实体条 */
    for (const x of [0.38, 0.55, 0.72]) {
      d.box(x - 0.02, -0.12, 1.05, x + 0.02, 0.12, 2.4, shade(CLOTH_D, 0.95), { line: false, noW: true, noS: true });
    }
    /* 下穗×3 */
    for (const x of [0.35, 0.58, 0.82]) {
      d.seg([x, 0, 0.85], [x, 0, 0.55], CLOTH_D, 2);
      d.box(x - 0.05, -0.05, 0.42, x + 0.05, 0.05, 0.58, EDGE, { line: EDGE_D, west: shade(EDGE, 0.8), top: shade(EDGE, 1.1) });
    }
    /* 挂绳 */
    d.seg([0.3, 0, 2.65], [0.3, 0, 2.55], ROPE, 2);
    d.seg([0.8, 0, 2.65], [0.8, 0, 2.55], ROPE, 2);
    d.QS(0.4, -0.08, 1.8, 0.75, 2.2, shade(CLOTH_L, 1.15));
  }
  /** Site239 招幌：圆形/菱形招客幌（店门巷口；≠酒旗/匾额/竖招板；kitbash 密实） */
  function paintPropZhaohuang(d) {
    const WOOD = '#5a3a22', WOOD_D = '#2a160c', WOOD_L = '#7a5a38';
    const FRAME = '#8a6030', FRAME_D = '#5a3818', FRAME_L = '#b88848';
    const FACE = '#e8d090', FACE_D = '#c8a860', FACE2 = '#d85840', FACE2_D = '#a83828';
    const EDGE = '#d8a040', ROPE = '#6a5040', TASSEL = '#c84838', INK = '#2a2218';
    /* 短挑臂 */
    d.box(-0.12, -0.1, 2.4, 0.12, 0.1, 2.75, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: WOOD_L });
    d.box(0.0, -0.07, 2.55, 0.7, 0.07, 2.68, WOOD_L, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD_L, 1.08) });
    /* 挂绳 */
    d.seg([0.45, 0, 2.55], [0.45, 0, 2.35], ROPE, 2);
    d.box(0.38, -0.05, 2.28, 0.52, 0.05, 2.4, EDGE, { line: shade(EDGE, 0.55), top: shade(EDGE, 1.1) });
    /* 外圆框（多层实体） */
    d.box(0.05, -0.45, 1.35, 0.85, 0.45, 2.3, FRAME, { line: FRAME_D, west: shade(FRAME, 0.8), top: FRAME_L });
    d.box(0.12, -0.38, 1.42, 0.78, 0.38, 2.22, FACE, { line: shade(FACE_D, 0.55), west: shade(FACE, 0.9), top: shade(FACE, 1.1) });
    /* 内菱形招面 */
    d.box(0.22, -0.22, 1.55, 0.68, 0.22, 2.1, FACE2, { line: FACE2_D, west: shade(FACE2, 0.85), top: shade(FACE2, 1.12) });
    d.box(0.28, -0.14, 1.65, 0.62, 0.14, 2.0, shade(FACE2, 1.08), { line: shade(FACE2_D, 0.6), west: shade(FACE2, 0.92), top: shade(FACE, 1.05) });
    /* 中心色块（招客意） */
    d.box(0.35, -0.08, 1.72, 0.55, 0.08, 1.95, INK, { line: shade(INK, 0.6), west: shade(INK, 0.85), top: shade(INK, 1.05) });
    d.box(0.38, -0.05, 1.78, 0.52, 0.05, 1.9, EDGE, { line: shade(EDGE, 0.55), top: shade(EDGE, 1.15) });
    /* 外框金边细条 */
    d.box(0.08, -0.42, 2.18, 0.82, 0.42, 2.28, EDGE, { line: shade(EDGE, 0.55), west: shade(EDGE, 0.8), top: shade(EDGE, 1.12) });
    d.box(0.08, -0.42, 1.35, 0.82, 0.42, 1.45, EDGE, { line: shade(EDGE, 0.55), west: shade(EDGE, 0.8), top: shade(EDGE, 1.1) });
    /* 下穗 */
    for (const x of [0.25, 0.45, 0.65]) {
      d.seg([x, 0, 1.35], [x, 0, 1.05], TASSEL, 2);
      d.box(x - 0.04, -0.04, 0.92, x + 0.04, 0.04, 1.08, EDGE, { line: shade(EDGE, 0.55), top: shade(EDGE, 1.1) });
    }
    d.QS(0.3, -0.15, 1.75, 0.6, 2.05, shade(FACE2, 1.18));
  }

  /* Site240 庭院石灯笼（庭灯）：石基座+中柱+六角灯室+宝盖顶；苔点；≠街具 prop_shideng（街灯更高暖晕）——庭灯偏矮、青石苔痕、庭院点景 */
  function paintPropTingdeng(d) {
    const ST = '#7a7468', STW = '#5a5448', TOP = '#8a8478', GOLD = '#b89850', MOSS = '#4a6a48';
    const GLOW = '#e8d090', GLOW_L = '#fff0b8';
    // 方石基座（两层）
    d.box(-0.48, -0.48, 0, 0.48, 0.48, 0.22, ST, { line: shade(ST, 0.48), west: STW, top: shade(ST, 0.9) });
    d.box(-0.4, -0.4, 0.22, 0.4, 0.4, 0.38, shade(ST, 0.98), { line: shade(ST, 0.5), west: STW, top: TOP });
    for (let z = 0.08; z < 0.2; z += 0.08) {
      d.seg([-0.46, -0.485, z], [0.46, -0.485, z], shade(ST, 0.7));
      d.seg([-0.485, -0.46, z], [-0.485, 0.46, z], shade(STW, 0.7));
    }
    // 苔点
    d.box(-0.42, -0.5, 0.12, -0.28, -0.46, 0.22, MOSS, { line: shade(MOSS, 0.55), west: shade(MOSS, 0.8), top: shade(MOSS, 1.1) });
    d.box(0.3, 0.42, 0.14, 0.44, 0.48, 0.24, MOSS, { line: shade(MOSS, 0.55), west: shade(MOSS, 0.8), top: shade(MOSS, 1.1) });
    // 中柱（八棱感：方柱+角条）
    d.box(-0.18, -0.18, 0.38, 0.18, 0.18, 0.95, shade(ST, 0.96), { line: shade(ST, 0.5), west: STW, top: TOP });
    for (let z = 0.5; z < 0.9; z += 0.12) d.seg([-0.185, -0.185, z], [0.185, -0.185, z], shade(ST, 0.75));
    for (const [x, y] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) {
      d.box(x - 0.04, y - 0.04, 0.38, x + 0.04, y + 0.04, 0.95, shade(ST, 0.88), { line: shade(ST, 0.5), west: STW, top: TOP });
    }
    // 灯室承盘
    d.box(-0.36, -0.36, 0.95, 0.36, 0.36, 1.05, shade(ST, 1.02), { line: shade(ST, 0.48), west: STW, top: TOP });
    // 六角灯室（方盒近似 + 格栅暖光）
    d.box(-0.3, -0.3, 1.05, 0.3, 0.3, 1.55, shade(ST, 1.0), { line: shade(ST, 0.48), west: STW, top: TOP });
    d.QS(-0.31, -0.2, 1.12, 0.2, 1.48, GLOW, shade(ST, 0.55));
    d.QS(-0.32, -0.14, 1.18, 0.14, 1.42, GLOW_L);
    for (const x of [-0.12, 0, 0.12]) d.seg([x, -0.305, 1.12], [x, -0.305, 1.48], shade(ST, 0.55));
    for (const z of [1.22, 1.36]) d.seg([-0.2, -0.305, z], [0.2, -0.305, z], shade(ST, 0.55));
    // 侧窗暖光
    d.QS(0.305, -0.16, 1.15, 0.16, 1.45, shade(GLOW, 0.95), shade(ST, 0.55));
    // 宝盖屋顶
    d.box(-0.42, -0.42, 1.55, 0.42, 0.42, 1.68, shade(ST, 1.08), { line: shade(ST, 0.5), west: STW, top: shade(ST, 1.18) });
    d.box(-0.2, -0.2, 1.68, 0.2, 0.2, 1.82, shade(ST, 1.05), { line: shade(ST, 0.5), west: STW, top: TOP });
    d.box(-0.07, -0.07, 1.82, 0.07, 0.07, 2.0, GOLD, { line: shade(GOLD, 0.55), west: shade(GOLD, 0.8), top: '#e8c868' });
    // 隅石装饰
    for (const [x, y] of [[-0.36, -0.36], [0.36, -0.36], [-0.36, 0.36], [0.36, 0.36]]) {
      d.box(x - 0.07, y - 0.07, 0.38, x + 0.07, y + 0.07, 0.5, shade(ST, 0.9), { line: shade(ST, 0.5), west: STW, top: TOP });
    }
  }

  /* Site240 水盆：青石浅盆+水面+盆沿；≠水缸 prop_shuigang（高陶缸）——浅盆宽口、庭院洗手/点景 */
  function paintPropShuipen(d) {
    const ST = '#7a7468', STW = '#5a5448', TOP = '#8a8478', RIM = '#c8b898';
    const WATER = '#3a6a78', WATER_L = '#6a9aaa', MOSS = '#4a6a48';
    // 石足
    d.box(-0.55, -0.55, 0, 0.55, 0.55, 0.16, shade(ST, 0.9), { line: shade(ST, 0.48), west: STW, top: shade(ST, 0.88) });
    for (const [x, y] of [[-0.42, -0.42], [0.42, -0.42], [-0.42, 0.42], [0.42, 0.42]]) {
      d.box(x - 0.1, y - 0.1, 0.16, x + 0.1, y + 0.1, 0.28, ST, { line: shade(ST, 0.5), west: STW, top: TOP });
    }
    // 盆身（浅宽）
    d.box(-0.62, -0.62, 0.28, 0.62, 0.62, 0.55, ST, { line: shade(ST, 0.48), west: STW, top: shade(ST, 0.95) });
    d.box(-0.58, -0.58, 0.55, 0.58, 0.58, 0.72, shade(ST, 1.02), { line: shade(ST, 0.5), west: STW, top: RIM });
    // 盆沿回纹块
    for (const z of [0.4, 0.58]) {
      d.box(-0.64, -0.64, z, 0.64, 0.64, z + 0.05, shade(STW, 1.02), { line: shade(STW, 0.6), west: shade(STW, 0.85), top: shade(ST, 0.9) });
    }
    for (const z of [0.36, 0.48, 0.62]) d.seg([-0.63, -0.63, z], [0.63, -0.63, z], shade(ST, 0.7));
    // 水面
    d.box(-0.48, -0.48, 0.62, 0.48, 0.48, 0.68, WATER, { line: shade(WATER, 0.55), west: shade(WATER, 0.8), top: WATER_L });
    d.QS(-0.05, -0.28, 0.66, 0.28, 0.7, shade(WATER_L, 1.15));
    d.QS(0.1, -0.1, 0.67, 0.22, 0.71, 'rgba(180,210,220,0.35)');
    // 苔点
    d.box(-0.55, -0.66, 0.4, -0.4, -0.6, 0.52, MOSS, { line: shade(MOSS, 0.55), west: shade(MOSS, 0.8), top: shade(MOSS, 1.1) });
    d.box(0.38, 0.58, 0.45, 0.55, 0.66, 0.58, MOSS, { line: shade(MOSS, 0.55), west: shade(MOSS, 0.8), top: shade(MOSS, 1.1) });
    // 小石舀搁沿
    const WOOD = '#5a3a22', WOOD_D = '#2a160c';
    d.box(0.4, -0.12, 0.72, 0.58, 0.12, 0.82, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: shade(WOOD, 1.1) });
    d.box(0.46, -0.04, 0.82, 0.54, 0.04, 0.95, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.12) });
  }

  /* Site240 洗手钵：石钵+承座+水面；门前/影壁侧净手点景；≠水缸/香炉——钵口圆、承座矮、带木勺 */
  function paintPropXishoubo(d) {
    const ST = '#7a7468', STW = '#5a5448', TOP = '#8a8478', RIM = '#c8b898';
    const WATER = '#3a6a78', WATER_L = '#6a9aaa', MOSS = '#4a6a48';
    const WOOD = '#5a3a22', WOOD_D = '#2a160c';
    // 承座
    d.box(-0.38, -0.38, 0, 0.38, 0.38, 0.2, ST, { line: shade(ST, 0.48), west: STW, top: shade(ST, 0.9) });
    d.box(-0.28, -0.28, 0.2, 0.28, 0.28, 0.42, shade(ST, 0.98), { line: shade(ST, 0.5), west: STW, top: TOP });
    for (let z = 0.08; z < 0.18; z += 0.08) d.seg([-0.36, -0.385, z], [0.36, -0.385, z], shade(ST, 0.7));
    // 钵身收腰
    d.box(-0.42, -0.42, 0.42, 0.42, 0.42, 0.58, ST, { line: shade(ST, 0.48), west: STW, top: shade(ST, 0.95) });
    d.box(-0.48, -0.48, 0.58, 0.48, 0.48, 0.78, shade(ST, 1.02), { line: shade(ST, 0.5), west: STW, top: RIM });
    d.box(-0.44, -0.44, 0.78, 0.44, 0.44, 0.88, shade(ST, 1.06), { line: shade(ST, 0.5), west: STW, top: RIM });
    for (const z of [0.5, 0.65, 0.8]) d.seg([-0.49, -0.49, z], [0.49, -0.49, z], shade(ST, 0.7));
    // 水面
    d.box(-0.34, -0.34, 0.78, 0.34, 0.34, 0.84, WATER, { line: shade(WATER, 0.55), west: shade(WATER, 0.8), top: WATER_L });
    d.QS(-0.02, -0.18, 0.82, 0.18, 0.86, shade(WATER_L, 1.15));
    // 木勺
    d.box(0.28, -0.05, 0.88, 0.5, 0.05, 0.96, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: shade(WOOD, 1.1) });
    d.box(0.42, -0.03, 0.96, 0.48, 0.03, 1.12, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.12) });
    // 苔/水渍
    d.box(-0.4, -0.5, 0.5, -0.28, -0.42, 0.62, MOSS, { line: shade(MOSS, 0.55), west: shade(MOSS, 0.8), top: shade(MOSS, 1.1) });
    d.box(0.25, 0.4, 0.55, 0.4, 0.5, 0.68, MOSS, { line: shade(MOSS, 0.55), west: shade(MOSS, 0.8), top: shade(MOSS, 1.1) });
  }

  /** Site241 蓑衣：挂墙/架上棕蓑（宅后/巷口/厨侧；kitbash 密实，禁纯线稿） */
  function paintPropSuoyi(d) {
    const STRAW = '#c8a868', STRAW_D = '#8a6838', STRAW_L = '#e0c888', STRAW2 = '#b89050';
    const WOOD = '#6a4a28', WOOD_D = '#3a2210', ROPE = '#5a3a22', HOOK = '#8a8a98', MOSS = '#5a6a48';
    /* 挂架木条 */
    d.box(-0.85, -0.12, 1.55, 0.85, 0.12, 1.75, WOOD, { line: WOOD_D, west: shade(WOOD, 0.75), top: shade(WOOD, 1.1) });
    d.box(-0.9, -0.08, 1.7, 0.9, 0.08, 1.88, WOOD_D, { line: shade(WOOD_D, 0.55), west: shade(WOOD, 0.7), top: WOOD });
    /* 挂钩 */
    d.box(-0.55, -0.06, 1.72, -0.4, 0.06, 2.05, HOOK, { line: shade(HOOK, 0.5), west: shade(HOOK, 0.8), top: shade(HOOK, 1.12) });
    d.box(0.4, -0.06, 1.72, 0.55, 0.06, 2.05, HOOK, { line: shade(HOOK, 0.5), west: shade(HOOK, 0.8), top: shade(HOOK, 1.12) });
    d.box(-0.08, -0.06, 1.72, 0.08, 0.06, 2.1, HOOK, { line: shade(HOOK, 0.5), top: shade(HOOK, 1.1) });
    /* 肩领/领圈 */
    d.box(-0.55, -0.35, 1.35, 0.55, 0.35, 1.65, STRAW_D, { line: shade(STRAW_D, 0.55), west: shade(STRAW, 0.72), top: STRAW_L });
    d.box(-0.4, -0.25, 1.55, 0.4, 0.25, 1.72, STRAW2, { line: STRAW_D, west: shade(STRAW, 0.8), top: STRAW_L });
    /* 蓑身分层棕叶（密实色块） */
    d.box(-0.75, -0.4, 0.85, 0.75, 0.4, 1.4, STRAW, { line: STRAW_D, west: shade(STRAW, 0.78), top: STRAW_L });
    d.box(-0.85, -0.45, 0.45, 0.85, 0.45, 0.95, shade(STRAW, 1.02), { line: STRAW_D, west: shade(STRAW, 0.75), top: STRAW_L });
    d.box(-0.7, -0.38, 0.15, 0.7, 0.38, 0.55, STRAW2, { line: STRAW_D, west: shade(STRAW, 0.78), top: STRAW });
    d.box(-0.55, -0.3, 0.0, 0.55, 0.3, 0.25, STRAW_D, { line: shade(STRAW_D, 0.55), west: shade(STRAW, 0.7), top: STRAW });
    /* 棕丝下垂层次 */
    for (let x = -0.7; x <= 0.7; x += 0.18) {
      d.box(x, -0.42, 0.2, x + 0.1, -0.32, 0.9, shade(STRAW, 0.95), { line: shade(STRAW_D, 0.7), west: shade(STRAW, 0.75), top: STRAW_L });
      d.box(x + 0.02, 0.32, 0.15, x + 0.12, 0.42, 0.85, shade(STRAW2, 0.98), { line: shade(STRAW_D, 0.7), west: shade(STRAW, 0.78), top: STRAW_L });
    }
    /* 捆绳 */
    d.box(-0.6, -0.1, 1.25, 0.6, 0.1, 1.38, ROPE, { line: shade(ROPE, 0.55), west: shade(ROPE, 0.8), top: shade(ROPE, 1.1) });
    d.box(-0.5, -0.08, 0.7, 0.5, 0.08, 0.82, ROPE, { line: shade(ROPE, 0.55), west: shade(ROPE, 0.8), top: shade(ROPE, 1.08) });
    /* 苔点/湿痕 */
    d.box(-0.7, 0.3, 0.5, -0.5, 0.42, 0.65, MOSS, { line: shade(MOSS, 0.55), top: shade(MOSS, 1.1) });
    d.QS(-0.35, -0.55, 1.0, -0.25, 1.3, shade(STRAW_L, 1.15));
    d.QS(-0.4, 0.2, 0.4, 0.5, 0.7, shade(STRAW_L, 1.12));
  }
  /** Site241 斗笠：叠放/挂竹笠（巷口/宅后/码头；kitbash 密实） */
  function paintPropDouli(d) {
    const BAM = '#c4a868', BAM_D = '#7a5830', BAM_L = '#e0d098', BAM2 = '#b89858';
    const WOOD = '#5a3a22', ROPE = '#6a4a28', HOOK = '#8a8a98', RIB = '#8a7040';
    /* 挂钉/立架 */
    d.box(-0.08, -0.08, 0, 0.08, 0.08, 1.85, WOOD, { line: shade(WOOD, 0.55), west: shade(WOOD, 0.78), top: shade(WOOD, 1.1) });
    d.box(-0.15, -0.15, 0, 0.15, 0.15, 0.18, WOOD, { line: shade(WOOD, 0.5), top: shade(WOOD, 1.08) });
    d.box(-0.12, -0.06, 1.7, 0.12, 0.06, 1.95, HOOK, { line: shade(HOOK, 0.5), top: shade(HOOK, 1.12) });
    /* 上层斗笠（挂） */
    d.box(-0.85, -0.85, 1.45, 0.85, 0.85, 1.58, BAM_D, { line: shade(BAM_D, 0.55), west: shade(BAM, 0.72), top: BAM_L });
    d.box(-0.65, -0.65, 1.55, 0.65, 0.65, 1.72, BAM, { line: BAM_D, west: shade(BAM, 0.8), top: BAM_L });
    d.box(-0.35, -0.35, 1.68, 0.35, 0.35, 1.88, BAM2, { line: BAM_D, west: shade(BAM, 0.85), top: shade(BAM_L, 1.1) });
    d.box(-0.18, -0.18, 1.85, 0.18, 0.18, 2.0, WOOD, { line: shade(WOOD, 0.55), top: shade(WOOD, 1.1) });
    /* 中层叠笠 */
    d.box(-0.9, -0.9, 0.85, 0.9, 0.9, 0.98, BAM_D, { line: shade(BAM_D, 0.55), west: shade(BAM, 0.7), top: BAM });
    d.box(-0.72, -0.72, 0.95, 0.72, 0.72, 1.15, BAM, { line: BAM_D, west: shade(BAM, 0.78), top: BAM_L });
    d.box(-0.4, -0.4, 1.1, 0.4, 0.4, 1.3, BAM2, { line: BAM_D, west: shade(BAM, 0.82), top: shade(BAM_L, 1.08) });
    d.box(-0.2, -0.2, 1.25, 0.2, 0.2, 1.4, WOOD, { line: shade(WOOD, 0.55), top: shade(WOOD, 1.08) });
    /* 底层叠笠（靠地） */
    d.box(-0.95, -0.95, 0.15, 0.95, 0.95, 0.28, BAM_D, { line: shade(BAM_D, 0.55), west: shade(BAM, 0.7), top: BAM });
    d.box(-0.78, -0.78, 0.25, 0.78, 0.78, 0.48, BAM, { line: BAM_D, west: shade(BAM, 0.78), top: BAM_L });
    d.box(-0.45, -0.45, 0.42, 0.45, 0.45, 0.65, BAM2, { line: BAM_D, west: shade(BAM, 0.82), top: shade(BAM_L, 1.08) });
    d.box(-0.22, -0.22, 0.6, 0.22, 0.22, 0.78, WOOD, { line: shade(WOOD, 0.55), top: shade(WOOD, 1.08) });
    /* 竹骨放射纹（色块短段，非纯线） */
    for (let a = 0; a < 8; a++) {
      const ang = a * Math.PI / 4;
      const x = Math.cos(ang) * 0.7, y = Math.sin(ang) * 0.7;
      d.box(x * 0.3 - 0.04, y * 0.3 - 0.04, 1.5, x * 0.85 + 0.04, y * 0.85 + 0.04, 1.6, RIB, { line: shade(RIB, 0.55), top: shade(RIB, 1.05) });
      d.box(x * 0.25 - 0.04, y * 0.25 - 0.04, 0.9, x * 0.8 + 0.04, y * 0.8 + 0.04, 1.0, shade(RIB, 0.95), { line: shade(RIB, 0.55), top: shade(RIB, 1.05) });
    }
    /* 捆绳 */
    d.box(-0.15, -0.15, 0.75, 0.15, 0.15, 0.88, ROPE, { line: shade(ROPE, 0.55), top: shade(ROPE, 1.1) });
    d.QS(-0.35, -0.5, 1.6, -0.2, 1.8, shade(BAM_L, 1.2));
    d.QS(-0.4, 0.35, 0.35, 0.6, 0.55, shade(BAM_L, 1.15));
  }
  /** Site241 扁担+筐：斜靠墙扁担与两端箩筐（宅后/巷口/码头/厨侧；kitbash 密实） */
  function paintPropBiandan(d) {
    const BAM = '#c8b070', BAM_D = '#8a7040', BAM_L = '#e0d098', WOOD = '#6a4a28', WOOD_D = '#3a2210';
    const ROPE = '#5a3a22', VEG = '#5a8a48', VEG2 = '#c86838', STRAW = '#c8a868';
    /* 斜靠扁担（长杆） */
    d.box(-1.15, -0.1, 0.15, 1.15, 0.1, 0.35, BAM, { line: BAM_D, west: shade(BAM, 0.78), top: BAM_L });
    d.box(-1.2, -0.08, 0.28, 1.2, 0.08, 0.48, BAM_L, { line: BAM_D, west: shade(BAM, 0.85), top: shade(BAM_L, 1.1) });
    d.box(-1.18, -0.06, 0.85, 1.18, 0.06, 1.05, BAM, { line: BAM_D, west: shade(BAM, 0.8), top: BAM_L });
    d.box(-1.15, -0.08, 1.5, 1.15, 0.08, 1.7, BAM_L, { line: BAM_D, west: shade(BAM, 0.85), top: shade(BAM_L, 1.12) });
    /* 竹节 */
    for (const x of [-0.9, -0.45, 0, 0.45, 0.9]) {
      d.box(x - 0.04, -0.12, 0.2, x + 0.04, 0.12, 0.45, BAM_D, { line: shade(BAM_D, 0.55), top: BAM });
      d.box(x - 0.04, -0.1, 0.9, x + 0.04, 0.1, 1.1, BAM_D, { line: shade(BAM_D, 0.55), top: BAM });
      d.box(x - 0.04, -0.1, 1.55, x + 0.04, 0.1, 1.72, BAM_D, { line: shade(BAM_D, 0.55), top: BAM });
    }
    /* 左箩筐 */
    d.box(-1.35, -0.55, 0, -0.55, 0.55, 0.2, BAM_D, { line: shade(BAM_D, 0.55), west: shade(BAM, 0.7), top: BAM });
    d.box(-1.3, -0.5, 0.2, -0.6, 0.5, 0.75, BAM, { line: BAM_D, west: shade(BAM, 0.78), top: BAM_L });
    d.box(-1.35, -0.55, 0.7, -0.55, 0.55, 0.9, BAM_L, { line: BAM_D, west: shade(BAM, 0.85), top: shade(BAM_L, 1.1) });
    d.box(-1.15, -0.35, 0.55, -0.75, 0.35, 0.85, VEG, { line: shade(VEG, 0.5), west: shade(VEG, 0.75), top: shade(VEG, 1.12) });
    d.box(-1.05, -0.25, 0.7, -0.85, 0.2, 0.95, VEG2, { line: shade(VEG2, 0.5), top: shade(VEG2, 1.1) });
    /* 右箩筐 */
    d.box(0.55, -0.55, 0, 1.35, 0.55, 0.2, BAM_D, { line: shade(BAM_D, 0.55), west: shade(BAM, 0.7), top: BAM });
    d.box(0.6, -0.5, 0.2, 1.3, 0.5, 0.75, BAM, { line: BAM_D, west: shade(BAM, 0.78), top: BAM_L });
    d.box(0.55, -0.55, 0.7, 1.35, 0.55, 0.9, BAM_L, { line: BAM_D, west: shade(BAM, 0.85), top: shade(BAM_L, 1.1) });
    d.box(0.75, -0.35, 0.55, 1.15, 0.35, 0.85, STRAW, { line: shade(STRAW, 0.55), west: shade(STRAW, 0.8), top: shade(STRAW, 1.1) });
    d.box(0.85, -0.2, 0.7, 1.05, 0.25, 0.95, VEG, { line: shade(VEG, 0.5), top: shade(VEG, 1.12) });
    /* 吊绳 */
    d.box(-1.05, -0.08, 0.85, -0.85, 0.08, 1.55, ROPE, { line: shade(ROPE, 0.55), west: shade(ROPE, 0.8), top: shade(ROPE, 1.08) });
    d.box(0.85, -0.08, 0.85, 1.05, 0.08, 1.55, ROPE, { line: shade(ROPE, 0.55), west: shade(ROPE, 0.8), top: shade(ROPE, 1.08) });
    /* 靠墙垫木 */
    d.box(-0.25, -0.2, 0, 0.25, 0.2, 0.18, WOOD, { line: WOOD_D, west: shade(WOOD, 0.75), top: shade(WOOD, 1.08) });
    /* 编织横纹 */
    for (const z of [0.35, 0.55]) {
      d.seg([-1.28, -0.52, z], [-0.62, -0.52, z], shade(BAM_D, 0.9));
      d.seg([0.62, -0.52, z], [1.28, -0.52, z], shade(BAM_D, 0.9));
    }
    d.QS(-0.35, -1.1, 1.55, -0.9, 1.7, shade(BAM_L, 1.2));
    d.QS(-0.4, 0.7, 0.55, 0.95, 0.8, shade(BAM_L, 1.15));
  }

  /** Site242 铜镜：圆镜+支架（闺房外檐/廊侧案几/豪宅内院；kitbash 密实；≠灯/盆景） */
  function paintPropTongjing(d) {
    const BRONZE = '#8a6a38', BRONZE_D = '#5a4020', BRONZE_L = '#b89050', GOLD = '#c8a040';
    const MIRROR = '#c8d0d8', MIRROR_L = '#e8f0f8', MIRROR_D = '#8890a0', WOOD = '#5a3a22', WOOD_D = '#2a160c';
    const LACQ = '#4a1810', JADE = '#4a7a58', RED = '#a83828';
    /* 底座木托 */
    d.box(-0.45, -0.3, 0, 0.45, 0.3, 0.22, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: shade(WOOD, 1.08) });
    d.box(-0.4, -0.25, 0.18, 0.4, 0.25, 0.32, LACQ, { line: shade(LACQ, 0.55), top: shade(LACQ, 1.1) });
    /* 支柱 */
    d.box(-0.1, -0.1, 0.28, 0.1, 0.1, 1.35, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.05) });
    d.box(-0.14, -0.14, 0.55, 0.14, 0.14, 0.7, BRONZE, { line: BRONZE_D, top: BRONZE_L });
    d.box(-0.14, -0.14, 1.05, 0.14, 0.14, 1.2, BRONZE, { line: BRONZE_D, top: BRONZE_L });
    /* 镜托叉臂 */
    d.box(-0.55, -0.08, 1.25, -0.08, 0.08, 1.45, BRONZE, { line: BRONZE_D, west: shade(BRONZE, 0.8), top: BRONZE_L });
    d.box(0.08, -0.08, 1.25, 0.55, 0.08, 1.45, BRONZE, { line: BRONZE_D, west: shade(BRONZE, 0.8), top: BRONZE_L });
    d.box(-0.12, -0.12, 1.35, 0.12, 0.12, 1.55, GOLD, { line: shade(GOLD, 0.55), top: shade(GOLD, 1.12) });
    /* 圆镜盘（多层实体近似圆） */
    d.box(-0.55, -0.12, 1.5, 0.55, 0.18, 2.45, BRONZE_D, { line: shade(BRONZE_D, 0.55), west: shade(BRONZE, 0.75), top: BRONZE });
    d.box(-0.48, -0.08, 1.58, 0.48, 0.14, 2.38, BRONZE, { line: BRONZE_D, west: shade(BRONZE, 0.82), top: BRONZE_L });
    d.box(-0.42, -0.05, 1.65, 0.42, 0.12, 2.32, MIRROR_D, { line: shade(MIRROR_D, 0.6), west: shade(MIRROR, 0.88), top: MIRROR });
    d.box(-0.35, -0.02, 1.72, 0.35, 0.1, 2.25, MIRROR, { line: false, noW: true, noS: true, top: MIRROR_L });
    d.box(-0.22, 0.0, 1.85, 0.22, 0.08, 2.12, MIRROR_L, { line: false, noW: true, noS: true, top: shade(MIRROR_L, 1.08) });
    /* 镜钮/纽 */
    d.box(-0.08, 0.05, 1.9, 0.08, 0.16, 2.08, GOLD, { line: shade(GOLD, 0.55), top: shade(GOLD, 1.15) });
    /* 旁侧小梳/妆匣暗示 */
    d.box(0.25, -0.22, 0.32, 0.48, 0.05, 0.55, RED, { line: shade(RED, 0.55), west: shade(RED, 0.8), top: shade(RED, 1.1) });
    d.box(-0.48, -0.2, 0.32, -0.22, 0.08, 0.62, JADE, { line: shade(JADE, 0.55), west: shade(JADE, 0.82), top: shade(JADE, 1.12) });
    d.QS(-0.15, 0.02, 2.15, -0.05, 2.28, shade(MIRROR_L, 1.2));
    d.QS(0.3, -0.1, 0.5, 0.4, 0.58, shade(RED, 1.15));
  }
  /** Site242 梳妆匣：木匣+铜扣+开盖暗示（闺房外檐/廊侧案几/豪宅内院；≠博古架/书案；kitbash 密实） */
  function paintPropShuzhuang(d) {
    const WOOD = '#6a4a28', WOOD_D = '#3a2210', WOOD_L = '#8a6a40', LACQ = '#5a2818', LACQ_L = '#8a4030';
    const BRONZE = '#8a6a38', GOLD = '#c8a040', SILK = '#c84858', SILK2 = '#e8d0e0', IVORY = '#e8e0d0';
    const JADE = '#4a7a58', MIRROR = '#c8d0d8';
    /* 匣体 */
    d.box(-0.7, -0.45, 0, 0.7, 0.45, 0.55, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: WOOD_L });
    d.box(-0.65, -0.4, 0.5, 0.65, 0.4, 0.72, LACQ, { line: shade(LACQ, 0.55), west: shade(LACQ, 0.85), top: LACQ_L });
    /* 侧脚 */
    for (const [x, y] of [[-0.62, -0.38], [0.62, -0.38], [-0.62, 0.38], [0.62, 0.38]]) {
      d.box(x - 0.08, y - 0.08, 0, x + 0.08, y + 0.08, 0.18, WOOD_D, { line: shade(WOOD_D, 0.55), top: WOOD });
    }
    /* 铜扣×2 + 锁鼻 */
    d.box(-0.2, -0.48, 0.25, -0.05, -0.38, 0.5, BRONZE, { line: shade(BRONZE, 0.55), top: GOLD });
    d.box(0.05, -0.48, 0.25, 0.2, -0.38, 0.5, BRONZE, { line: shade(BRONZE, 0.55), top: GOLD });
    d.box(-0.08, -0.5, 0.32, 0.08, -0.42, 0.48, GOLD, { line: shade(GOLD, 0.55), top: shade(GOLD, 1.12) });
    /* 开盖斜立（后半抬起） */
    d.box(-0.68, 0.05, 0.7, 0.68, 0.42, 1.15, WOOD_L, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD_L, 1.08) });
    d.box(-0.62, 0.08, 1.05, 0.62, 0.38, 1.28, LACQ_L, { line: LACQ, top: shade(LACQ_L, 1.1) });
    /* 内衬锦缎 */
    d.box(-0.58, -0.32, 0.72, 0.58, 0.08, 0.85, SILK, { line: shade(SILK, 0.55), west: shade(SILK, 0.85), top: shade(SILK, 1.1) });
    d.box(-0.5, -0.25, 0.82, 0.5, 0.02, 0.92, SILK2, { line: false, noW: true, noS: true, top: shade(SILK2, 1.05) });
    /* 匣内小镜 + 梳 + 粉扑 */
    d.box(-0.35, -0.18, 0.9, -0.05, 0.05, 1.25, BRONZE, { line: shade(BRONZE, 0.55), west: shade(BRONZE, 0.8), top: BRONZE });
    d.box(-0.3, -0.12, 0.98, -0.1, 0.0, 1.18, MIRROR, { line: false, noW: true, noS: true, top: shade(MIRROR, 1.1) });
    d.box(0.05, -0.2, 0.9, 0.45, -0.05, 1.05, IVORY, { line: shade(IVORY, 0.55), west: shade(IVORY, 0.9), top: shade(IVORY, 1.08) });
    d.box(0.15, -0.15, 1.02, 0.35, -0.08, 1.35, WOOD_D, { line: shade(WOOD_D, 0.55), top: WOOD });
    d.box(0.2, -0.02, 0.9, 0.48, 0.2, 1.12, JADE, { line: shade(JADE, 0.55), west: shade(JADE, 0.82), top: shade(JADE, 1.12) });
    d.box(0.25, 0.02, 1.08, 0.42, 0.15, 1.22, SILK, { line: shade(SILK, 0.55), top: shade(SILK, 1.15) });
    /* 匣面描金线暗示 */
    d.box(-0.55, -0.35, 0.68, 0.55, -0.28, 0.74, GOLD, { line: false, noW: true, noS: true });
    d.QS(-0.2, -0.05, 1.15, -0.1, 1.25, shade(MIRROR, 1.15));
    d.QS(0.3, 0.05, 1.15, 0.4, 1.22, shade(SILK, 1.2));
  }
  /** Site242 胭脂/粉盒：小圆盒点景（案几旁；≠酒坛/陶瓮；kitbash 密实） */
  function paintPropYanzhi(d) {
    const LACQ = '#8a2820', LACQ_D = '#4a1010', LACQ_L = '#b84838', GOLD = '#c8a040', GOLD_D = '#8a6820';
    const PINK = '#e898a0', PINK_D = '#c86870', CREAM = '#f0e8d8', WOOD = '#5a3a22', WOOD_D = '#2a160c';
    const JADE = '#4a7a58', BRONZE = '#8a6a38', SILK = '#d87080';
    /* 小案托 */
    d.box(-0.4, -0.3, 0, 0.4, 0.3, 0.15, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.08) });
    /* 主胭脂盒（红漆圆盒近似） */
    d.box(-0.28, -0.22, 0.15, 0.12, 0.18, 0.55, LACQ, { line: LACQ_D, west: shade(LACQ, 0.8), top: LACQ_L });
    d.box(-0.24, -0.18, 0.5, 0.08, 0.14, 0.68, LACQ_L, { line: LACQ_D, top: shade(LACQ_L, 1.1) });
    d.box(-0.18, -0.12, 0.65, 0.02, 0.08, 0.78, GOLD, { line: GOLD_D, top: shade(GOLD, 1.12) });
    d.box(-0.2, -0.14, 0.55, 0.04, 0.1, 0.62, PINK, { line: PINK_D, top: shade(PINK, 1.1) });
    /* 旁粉盒（奶油色） */
    d.box(0.12, -0.18, 0.15, 0.42, 0.12, 0.48, CREAM, { line: shade(CREAM, 0.7), west: shade(CREAM, 0.9), top: shade(CREAM, 1.08) });
    d.box(0.15, -0.14, 0.45, 0.38, 0.08, 0.58, GOLD, { line: GOLD_D, top: shade(GOLD, 1.1) });
    d.box(0.18, -0.1, 0.42, 0.35, 0.05, 0.5, PINK, { line: PINK_D, top: shade(PINK, 1.12) });
    /* 第三小盒（青玉色） */
    d.box(-0.08, 0.12, 0.15, 0.22, 0.35, 0.42, JADE, { line: shade(JADE, 0.55), west: shade(JADE, 0.82), top: shade(JADE, 1.12) });
    d.box(-0.04, 0.16, 0.38, 0.18, 0.3, 0.52, GOLD, { line: GOLD_D, top: shade(GOLD, 1.1) });
    /* 小刷/胭脂棒 */
    d.box(0.28, 0.05, 0.15, 0.38, 0.28, 0.85, WOOD_D, { line: shade(WOOD_D, 0.55), top: WOOD });
    d.box(0.26, 0.08, 0.8, 0.4, 0.25, 0.95, SILK, { line: shade(SILK, 0.55), top: shade(SILK, 1.15) });
    /* 散落花钿/铜镜碎片暗示 */
    d.box(-0.38, 0.05, 0.15, -0.22, 0.22, 0.28, BRONZE, { line: shade(BRONZE, 0.55), top: GOLD });
    d.box(-0.35, -0.28, 0.15, -0.15, -0.15, 0.28, GOLD, { line: GOLD_D, top: shade(GOLD, 1.12) });
    d.QS(-0.1, -0.05, 0.7, 0.0, 0.78, shade(GOLD, 1.2));
    d.QS(0.22, -0.05, 0.52, 0.32, 0.6, shade(PINK, 1.15));
  }

  /** Site243 金鱼缸：陶缸+水+鱼影（庭院/廊下/豪宅侧院；kitbash 密实；≠水缸 prop_shuigang 木盖储水、≠盆景 prop_penjing） */
  function paintPropYugang(d) {
    const CER = '#8a5a3a', CERW = '#4a2818', GLAZE = '#3a6a78', RIM = '#c8b090', WATER = '#2a6a88', WATER_L = '#5a9ab0';
    const FISH = '#d85828', FISH2 = '#e8a038', FISH3 = '#c83848', STONE = '#6a6860', WOOD = '#5a3a22', WOOD_D = '#2a160c';
    const MOSS = '#4a6a48', JADE = '#3a7a68';
    /* 石座 */
    d.box(-0.55, -0.55, 0, 0.55, 0.55, 0.18, STONE, { line: shade(STONE, 0.5), west: shade(STONE, 0.75), top: shade(STONE, 0.95) });
    d.box(-0.5, -0.5, 0.14, 0.5, 0.5, 0.28, shade(STONE, 1.05), { line: shade(STONE, 0.5), west: shade(STONE, 0.8), top: shade(STONE, 1.08) });
    /* 陶缸身：收腰多层 */
    d.box(-0.48, -0.48, 0.28, 0.48, 0.48, 0.55, CER, { line: shade(CER, 0.48), west: CERW, top: shade(CER, 0.95) });
    d.box(-0.52, -0.52, 0.55, 0.52, 0.52, 0.85, shade(CER, 1.02), { line: shade(CER, 0.5), west: CERW, top: shade(CER, 1.0) });
    d.box(-0.48, -0.48, 0.85, 0.48, 0.48, 1.15, shade(CER, 1.06), { line: shade(CER, 0.5), west: CERW, top: RIM });
    d.box(-0.54, -0.54, 1.1, 0.54, 0.54, 1.28, shade(CER, 1.1), { line: shade(CER, 0.5), west: CERW, top: RIM });
    /* 釉带/箍 */
    d.QS(-0.53, -0.42, 0.62, 0.42, 0.72, GLAZE, shade(CER, 0.55));
    d.QS(-0.53, -0.38, 0.95, 0.38, 1.05, shade(RIM, 0.92), shade(CER, 0.55));
    for (const z of [0.42, 0.68, 0.98]) {
      d.box(-0.55, -0.55, z, 0.55, 0.55, z + 0.05, shade(CERW, 1.05), { line: shade(CERW, 0.6), west: shade(CERW, 0.85), top: shade(CER, 0.9) });
    }
    /* 水面（无木盖——观鱼） */
    d.box(-0.4, -0.4, 1.18, 0.4, 0.4, 1.24, WATER, { line: shade(WATER, 0.55), west: shade(WATER, 0.8), top: WATER_L });
    d.box(-0.32, -0.32, 1.22, 0.32, 0.32, 1.26, WATER_L, { line: false, noW: true, noS: true, top: shade(WATER_L, 1.12) });
    d.QS(-0.05, -0.2, 1.23, 0.2, 1.27, shade(WATER_L, 1.2));
    /* 鱼影×3（水面下实体块暗示游动） */
    d.box(-0.28, -0.08, 1.14, -0.08, 0.05, 1.2, FISH, { line: shade(FISH, 0.55), west: shade(FISH, 0.8), top: shade(FISH, 1.1) });
    d.box(-0.32, -0.02, 1.16, -0.22, 0.08, 1.19, shade(FISH, 0.85), { line: false, noW: true, noS: true });
    d.box(0.05, -0.18, 1.13, 0.28, -0.02, 1.19, FISH2, { line: shade(FISH2, 0.55), west: shade(FISH2, 0.85), top: shade(FISH2, 1.12) });
    d.box(0.22, -0.12, 1.15, 0.32, -0.05, 1.18, shade(FISH2, 0.75), { line: false, noW: true, noS: true });
    d.box(-0.05, 0.12, 1.14, 0.18, 0.28, 1.2, FISH3, { line: shade(FISH3, 0.55), west: shade(FISH3, 0.82), top: shade(FISH3, 1.1) });
    /* 缸缘水草/石 */
    d.box(-0.35, 0.28, 1.24, -0.18, 0.42, 1.55, MOSS, { line: shade(MOSS, 0.55), west: shade(MOSS, 0.8), top: shade(MOSS, 1.12) });
    d.box(0.15, 0.25, 1.24, 0.35, 0.4, 1.48, JADE, { line: shade(JADE, 0.55), west: shade(JADE, 0.82), top: shade(JADE, 1.1) });
    d.box(-0.42, -0.4, 1.24, -0.28, -0.25, 1.38, STONE, { line: shade(STONE, 0.5), top: shade(STONE, 1.05) });
    /* 旁侧木勺/舀水暗示 */
    d.box(0.4, -0.08, 0.9, 0.55, 0.08, 1.35, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: shade(WOOD, 1.08) });
    d.box(0.38, -0.12, 1.3, 0.58, 0.12, 1.42, WOOD_D, { line: shade(WOOD_D, 0.55), top: WOOD });
    d.QS(-0.15, -0.05, 1.2, -0.05, 1.24, shade(FISH, 1.15));
  }
  /** Site243 多层花盆架：木架+分层陶盆（庭院/廊下/豪宅侧院；≠花架 prop_huajia 单架盆花、≠盆景 prop_penjing；kitbash 密实） */
  function paintPropHuapenjia(d) {
    const WOOD = '#6a4a28', WOOD_D = '#3a2210', WOOD_L = '#8a6a40', CER = '#8a5a3a', CERW = '#4a2818';
    const LEAF = '#3a7a48', LEAF2 = '#5a9a58', FLOWER = '#c84858', FLOWER2 = '#e8a038', FLOWER3 = '#d870a0';
    const SOIL = '#4a3018', RIM = '#c8b090', BAMBOO = '#8a9a48';
    /* 立柱×4 */
    for (const [x, y] of [[-0.55, -0.35], [0.55, -0.35], [-0.55, 0.35], [0.55, 0.35]]) {
      d.box(x - 0.07, y - 0.07, 0, x + 0.07, y + 0.07, 2.55, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: shade(WOOD, 1.05) });
    }
    /* 三层搁板 */
    for (const z of [0.35, 1.15, 1.95]) {
      d.box(-0.65, -0.42, z, 0.65, 0.42, z + 0.12, WOOD_L, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD_L, 1.08) });
      d.box(-0.62, -0.38, z + 0.1, 0.62, 0.38, z + 0.16, WOOD_D, { line: shade(WOOD_D, 0.55), top: WOOD });
    }
    /* 横撑 */
    for (const z of [0.7, 1.5, 2.3]) {
      d.box(-0.58, -0.38, z, 0.58, -0.28, z + 0.08, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.05) });
      d.box(-0.58, 0.28, z, 0.58, 0.38, z + 0.08, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.05) });
    }
    /* 各层陶盆+花叶（每层 2–3 盆） */
    const pots = [
      [-0.35, -0.1, 0.48, FLOWER, LEAF], [0.25, 0.05, 0.48, FLOWER2, LEAF2],
      [-0.3, 0.05, 1.28, FLOWER3, LEAF], [0.28, -0.08, 1.28, FLOWER, LEAF2],
      [-0.32, -0.05, 2.08, FLOWER2, LEAF], [0.22, 0.08, 2.08, FLOWER3, LEAF2], [0.0, -0.15, 2.08, FLOWER, LEAF],
    ];
    for (const [px, py, pz, fl, lf] of pots) {
      d.box(px - 0.18, py - 0.18, pz, px + 0.18, py + 0.18, pz + 0.22, CER, { line: shade(CER, 0.5), west: CERW, top: RIM });
      d.box(px - 0.15, py - 0.15, pz + 0.18, px + 0.15, py + 0.15, pz + 0.28, SOIL, { line: shade(SOIL, 0.55), top: shade(SOIL, 1.05) });
      d.box(px - 0.08, py - 0.08, pz + 0.28, px + 0.08, py + 0.08, pz + 0.55, lf, { line: shade(lf, 0.55), west: shade(lf, 0.8), top: shade(lf, 1.12) });
      d.box(px - 0.12, py - 0.05, pz + 0.48, px + 0.12, py + 0.05, pz + 0.62, fl, { line: shade(fl, 0.55), west: shade(fl, 0.85), top: shade(fl, 1.15) });
      d.box(px - 0.05, py - 0.12, pz + 0.5, px + 0.05, py + 0.12, pz + 0.65, shade(fl, 1.08), { line: shade(fl, 0.55), top: shade(fl, 1.18) });
    }
    /* 顶横梁装饰竹节暗示 */
    d.box(-0.68, -0.1, 2.5, 0.68, 0.1, 2.65, BAMBOO, { line: shade(BAMBOO, 0.55), west: shade(BAMBOO, 0.8), top: shade(BAMBOO, 1.1) });
    d.QS(-0.2, -0.02, 2.55, -0.1, 2.62, shade(BAMBOO, 1.2));
    d.QS(0.2, 0.0, 0.7, 0.3, 0.85, shade(FLOWER, 1.15));
  }
  /** Site243 鹦鹉栖架：木架+笼（庭院/廊下/豪宅侧院；≠鸟笼 prop_niaolong 吊笼、≠鸡笼 prop_jilong；kitbash 密实） */
  function paintPropYingwujia(d) {
    const WOOD = '#5a3a22', WOOD_D = '#2a160c', WOOD_L = '#7a5a38', BAMBOO = '#8a9a48', ROPE = '#8a6a38';
    const BRONZE = '#8a6a38', FEATHER = '#c84838', FEATHER2 = '#e8c040', FEATHER3 = '#3a8a58', CAGE = '#6a6860';
    const PERCH = '#9a7a48', DISH = '#c8b090';
    /* 底座十字 */
    d.box(-0.55, -0.12, 0, 0.55, 0.12, 0.14, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: shade(WOOD, 1.05) });
    d.box(-0.12, -0.55, 0, 0.12, 0.55, 0.14, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: shade(WOOD, 1.05) });
    d.box(-0.18, -0.18, 0.1, 0.18, 0.18, 0.28, WOOD_D, { line: shade(WOOD_D, 0.55), top: WOOD });
    /* 主立柱 */
    d.box(-0.1, -0.1, 0.25, 0.1, 0.1, 2.55, WOOD_L, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD_L, 1.08) });
    /* 中层栖杆×2 */
    d.box(-0.7, -0.06, 1.15, 0.7, 0.06, 1.28, PERCH, { line: shade(PERCH, 0.55), west: shade(PERCH, 0.85), top: shade(PERCH, 1.1) });
    d.box(-0.55, -0.06, 1.75, 0.55, 0.06, 1.88, PERCH, { line: shade(PERCH, 0.55), west: shade(PERCH, 0.85), top: shade(PERCH, 1.1) });
    /* 顶端横梁+吊环 */
    d.box(-0.45, -0.08, 2.45, 0.45, 0.08, 2.6, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.1) });
    d.box(-0.08, -0.08, 2.55, 0.08, 0.08, 2.75, BRONZE, { line: shade(BRONZE, 0.55), top: shade(BRONZE, 1.12) });
    /* 侧挂小笼（竹/金属丝网近似实体格） */
    d.box(0.35, -0.35, 1.35, 0.85, 0.15, 2.15, CAGE, { line: shade(CAGE, 0.5), west: shade(CAGE, 0.75), top: shade(CAGE, 1.05) });
    d.box(0.4, -0.3, 1.4, 0.8, 0.1, 2.1, BAMBOO, { line: shade(BAMBOO, 0.55), west: shade(BAMBOO, 0.85), top: shade(BAMBOO, 1.08) });
    for (const z of [1.55, 1.75, 1.95]) d.seg([0.38, -0.32, z], [0.38, 0.12, z], shade(CAGE, 0.7));
    for (const y of [-0.25, -0.05, 0.05]) d.seg([0.38, y, 1.4], [0.38, y, 2.1], shade(CAGE, 0.65));
    d.box(0.48, -0.15, 1.7, 0.72, 0.0, 1.85, PERCH, { line: shade(PERCH, 0.55), top: shade(PERCH, 1.1) });
    /* 笼内鹦鹉色块 */
    d.box(0.5, -0.12, 1.82, 0.7, 0.02, 2.05, FEATHER, { line: shade(FEATHER, 0.55), west: shade(FEATHER, 0.8), top: shade(FEATHER, 1.12) });
    d.box(0.55, -0.08, 2.0, 0.68, -0.02, 2.12, FEATHER2, { line: shade(FEATHER2, 0.55), top: shade(FEATHER2, 1.15) });
    d.box(0.52, -0.05, 1.9, 0.62, 0.05, 2.0, FEATHER3, { line: shade(FEATHER3, 0.55), top: shade(FEATHER3, 1.1) });
    /* 另一侧栖杆上站鸟暗示 */
    d.box(-0.55, -0.1, 1.28, -0.3, 0.08, 1.55, FEATHER2, { line: shade(FEATHER2, 0.55), west: shade(FEATHER2, 0.85), top: shade(FEATHER2, 1.12) });
    d.box(-0.5, -0.05, 1.5, -0.35, 0.05, 1.65, FEATHER, { line: shade(FEATHER, 0.55), top: shade(FEATHER, 1.15) });
    d.box(-0.48, -0.02, 1.6, -0.4, 0.04, 1.72, FEATHER3, { line: shade(FEATHER3, 0.55), top: shade(FEATHER3, 1.1) });
    /* 食碗/水盅 */
    d.box(-0.35, 0.15, 1.28, -0.15, 0.35, 1.42, DISH, { line: shade(DISH, 0.55), west: shade(DISH, 0.85), top: shade(DISH, 1.1) });
    d.box(0.15, 0.18, 1.28, 0.35, 0.38, 1.4, DISH, { line: shade(DISH, 0.55), west: shade(DISH, 0.85), top: '#5a9ab0' });
    /* 吊绳 */
    d.seg([0.6, -0.1, 2.55], [0.6, -0.1, 2.15], ROPE, 2);
    d.QS(0.55, -0.05, 1.95, 0.65, 2.05, shade(FEATHER, 1.2));
    d.QS(-0.45, 0.0, 1.55, -0.38, 1.65, shade(FEATHER2, 1.15));
  }

  /** Site244 纺车：木质纺车+可辨认轮辐/纱锭（庭院/廊下/豪宅侧院；≠石磨/晾衣；kitbash 密实） */
  function paintPropFangche(d) {
    const WOOD = '#6a4a28', WOOD_D = '#3a2210', WOOD_L = '#8a6a40', RIM = '#9a7a48';
    const YARN = '#e8d8b0', YARN2 = '#c8a878', YARN3 = '#d87858', IRON = '#4a4038';
    /* 底座横梁+脚 */
    d.box(-0.7, -0.35, 0, 0.7, 0.35, 0.14, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: shade(WOOD, 1.05) });
    d.box(-0.65, -0.12, 0.1, 0.15, 0.12, 0.28, WOOD_D, { line: shade(WOOD_D, 0.55), top: WOOD });
    for (const [x, y] of [[-0.55, -0.28], [0.55, -0.28], [-0.55, 0.28], [0.55, 0.28]]) {
      d.box(x - 0.08, y - 0.08, 0, x + 0.08, y + 0.08, 0.22, WOOD, { line: WOOD_D, west: shade(WOOD, 0.75), top: shade(WOOD, 1.02) });
    }
    /* 立柱×2 撑轮轴 */
    d.box(-0.55, -0.1, 0.2, -0.4, 0.1, 1.55, WOOD_L, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD_L, 1.08) });
    d.box(0.05, -0.1, 0.2, 0.2, 0.1, 1.55, WOOD_L, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD_L, 1.08) });
    /* 横轴 */
    d.box(-0.58, -0.06, 1.35, 0.22, 0.06, 1.5, RIM, { line: WOOD_D, west: shade(RIM, 0.85), top: shade(RIM, 1.1) });
    /* 大轮外圈（可辨认轮） */
    d.box(-0.95, -0.08, 0.55, -0.55, 0.08, 1.85, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: shade(WOOD, 1.05) });
    d.box(-1.05, -0.12, 0.7, -0.45, 0.12, 0.9, WOOD_L, { line: WOOD_D, west: shade(WOOD, 0.82), top: shade(WOOD_L, 1.08) });
    d.box(-1.05, -0.12, 1.5, -0.45, 0.12, 1.7, WOOD_L, { line: WOOD_D, west: shade(WOOD, 0.82), top: shade(WOOD_L, 1.08) });
    d.box(-1.12, -0.1, 0.95, -0.95, 0.1, 1.45, WOOD, { line: WOOD_D, west: shade(WOOD, 0.75), top: shade(WOOD, 1.02) });
    d.box(-0.55, -0.1, 0.95, -0.38, 0.1, 1.45, WOOD, { line: WOOD_D, west: shade(WOOD, 0.75), top: shade(WOOD, 1.02) });
    /* 轮辐 */
    for (const z of [0.85, 1.05, 1.25, 1.45]) {
      d.seg([-1.05, 0, z], [-0.45, 0, z], shade(WOOD_D, 1.05), 2);
    }
    for (const x of [-1.0, -0.85, -0.7, -0.55]) {
      d.seg([x, 0, 0.75], [x, 0, 1.65], shade(WOOD_D, 1.0), 2);
    }
    /* 轮毂 */
    d.box(-0.82, -0.1, 1.1, -0.62, 0.1, 1.35, IRON, { line: shade(IRON, 0.55), west: shade(IRON, 0.8), top: shade(IRON, 1.1) });
    /* 踏板 */
    d.box(0.15, -0.25, 0.14, 0.65, 0.25, 0.28, WOOD_L, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD_L, 1.1) });
    d.box(0.35, -0.06, 0.25, 0.48, 0.06, 0.85, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: shade(WOOD, 1.05) });
    /* 纱锭/锭子+纱（可辨认纱） */
    d.box(0.25, -0.08, 0.9, 0.55, 0.08, 1.55, WOOD_D, { line: shade(WOOD_D, 0.55), top: WOOD });
    d.box(0.28, -0.18, 1.15, 0.52, 0.18, 1.45, YARN, { line: shade(YARN, 0.55), west: shade(YARN, 0.85), top: shade(YARN, 1.12) });
    d.box(0.3, -0.15, 1.2, 0.5, 0.15, 1.4, YARN2, { line: shade(YARN2, 0.55), top: shade(YARN2, 1.1) });
    d.box(0.32, -0.05, 1.42, 0.48, 0.05, 1.62, YARN3, { line: shade(YARN3, 0.55), top: shade(YARN3, 1.15) });
    /* 引纱细线 */
    d.seg([-0.7, 0, 1.4], [0.35, 0, 1.35], YARN2, 1);
    d.seg([0.4, 0, 1.55], [0.55, 0, 1.75], YARN3, 1);
    d.QS(0.32, -0.08, 1.25, 0.48, 1.4, shade(YARN, 1.2));
    d.QS(-0.9, -0.02, 1.15, -0.7, 1.35, shade(WOOD_L, 1.15));
  }
  /** Site244 绣绷：圆/方绣架+绷布（庭院/廊下/豪宅侧院；≠花架/书案；kitbash 密实） */
  function paintPropXiubeng(d) {
    const WOOD = '#5a3a22', WOOD_D = '#2a160c', WOOD_L = '#7a5a38', BAM = '#8a9a48';
    const CLOTH = '#e8dcc8', CLOTH2 = '#d8c8a8', EMB = '#c84858', EMB2 = '#3a6a88', EMB3 = '#d8a038', NEEDLE = '#c0c0c8';
    /* 三脚架底座 */
    for (const [x, y, z2] of [[-0.45, -0.35, 0.95], [0.45, -0.35, 0.95], [0.0, 0.42, 0.95]]) {
      d.box(x - 0.07, y - 0.07, 0, x + 0.07, y + 0.07, z2, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: shade(WOOD, 1.05) });
    }
    d.box(-0.2, -0.2, 0.85, 0.2, 0.2, 1.05, WOOD_D, { line: shade(WOOD_D, 0.55), top: WOOD });
    /* 立杆+铰 */
    d.box(-0.08, -0.08, 0.95, 0.08, 0.08, 1.85, WOOD_L, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD_L, 1.08) });
    d.box(-0.15, -0.12, 1.7, 0.55, 0.12, 1.9, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.1) });
    /* 圆形绣绷外框（可辨认圆架） */
    d.box(0.15, -0.55, 1.35, 1.05, 0.55, 1.55, WOOD_L, { line: WOOD_D, west: shade(WOOD, 0.82), top: shade(WOOD_L, 1.1) });
    d.box(0.15, -0.55, 2.05, 1.05, 0.55, 2.25, WOOD_L, { line: WOOD_D, west: shade(WOOD, 0.82), top: shade(WOOD_L, 1.1) });
    d.box(0.1, -0.6, 1.5, 0.28, 0.6, 2.15, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: shade(WOOD, 1.05) });
    d.box(0.92, -0.6, 1.5, 1.1, 0.6, 2.15, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: shade(WOOD, 1.05) });
    /* 内圈箍 */
    d.box(0.28, -0.42, 1.55, 0.95, 0.42, 1.7, BAM, { line: shade(BAM, 0.55), west: shade(BAM, 0.85), top: shade(BAM, 1.08) });
    d.box(0.28, -0.42, 1.95, 0.95, 0.42, 2.1, BAM, { line: shade(BAM, 0.55), west: shade(BAM, 0.85), top: shade(BAM, 1.08) });
    /* 绷布 */
    d.box(0.32, -0.38, 1.65, 0.92, 0.38, 2.0, CLOTH, { line: shade(CLOTH, 0.55), west: shade(CLOTH, 0.88), top: CLOTH2 });
    /* 绣纹色块（花鸟暗示） */
    d.box(0.45, -0.12, 1.75, 0.68, 0.12, 1.95, EMB, { line: shade(EMB, 0.55), west: shade(EMB, 0.85), top: shade(EMB, 1.15) });
    d.box(0.55, -0.05, 1.88, 0.78, 0.18, 2.02, EMB2, { line: shade(EMB2, 0.55), top: shade(EMB2, 1.12) });
    d.box(0.4, 0.05, 1.72, 0.55, 0.22, 1.88, EMB3, { line: shade(EMB3, 0.55), top: shade(EMB3, 1.15) });
    d.box(0.7, -0.2, 1.7, 0.85, -0.05, 1.85, shade(EMB, 1.1), { line: shade(EMB, 0.55), top: shade(EMB, 1.2) });
    /* 针+线 */
    d.box(0.75, 0.15, 1.9, 0.82, 0.22, 2.15, NEEDLE, { line: shade(NEEDLE, 0.55), top: '#f0f0f8' });
    d.seg([0.78, 0.18, 1.9], [0.55, 0.0, 1.78], EMB, 1);
    /* 侧挂线团 */
    d.box(-0.15, 0.15, 1.35, 0.08, 0.35, 1.6, EMB2, { line: shade(EMB2, 0.55), west: shade(EMB2, 0.85), top: shade(EMB2, 1.1) });
    d.box(-0.12, -0.35, 1.35, 0.1, -0.15, 1.55, EMB3, { line: shade(EMB3, 0.55), top: shade(EMB3, 1.12) });
    d.QS(0.5, -0.1, 1.8, 0.75, 1.98, shade(EMB, 1.2));
  }
  /** Site244 线筐：竹筐+彩线团（庭院/廊下/豪宅侧院；≠晾衣竹筐 prop_zhukuang 空筐/杂物筐；kitbash 密实） */
  function paintPropXiankuang(d) {
    const BAM = '#9a8a48', BAM_D = '#5a4a20', BAM_L = '#b8a858', RIM = '#c8b878';
    const Y1 = '#c84858', Y2 = '#3a6a88', Y3 = '#d8a038', Y4 = '#3a8a58', Y5 = '#8a4a98', Y6 = '#e8d8b0';
    /* 竹筐底+身 */
    d.box(-0.55, -0.45, 0, 0.55, 0.45, 0.18, BAM_D, { line: shade(BAM_D, 0.55), west: shade(BAM_D, 0.85), top: BAM });
    d.box(-0.6, -0.5, 0.15, 0.6, 0.5, 0.55, BAM, { line: BAM_D, west: shade(BAM, 0.8), top: BAM_L });
    d.box(-0.58, -0.48, 0.5, 0.58, 0.48, 0.85, BAM_L, { line: BAM_D, west: shade(BAM, 0.85), top: RIM });
    /* 编织箍/竖篾 */
    for (const z of [0.28, 0.48, 0.68]) {
      d.box(-0.62, -0.52, z, 0.62, 0.52, z + 0.06, BAM_D, { line: shade(BAM_D, 0.55), west: shade(BAM_D, 0.8), top: BAM });
    }
    for (const x of [-0.45, -0.2, 0.05, 0.3, 0.5]) {
      d.seg([x, -0.52, 0.2], [x, -0.52, 0.85], shade(BAM_D, 1.05), 2);
    }
    /* 口沿 */
    d.box(-0.65, -0.55, 0.8, 0.65, 0.55, 0.98, RIM, { line: BAM_D, west: shade(BAM, 0.85), top: shade(RIM, 1.1) });
    /* 提梁 */
    d.box(-0.08, -0.55, 0.9, 0.08, 0.55, 1.05, BAM, { line: BAM_D, west: shade(BAM, 0.8), top: BAM_L });
    d.box(-0.5, -0.08, 0.95, 0.5, 0.08, 1.45, BAM_L, { line: BAM_D, west: shade(BAM, 0.85), top: shade(BAM_L, 1.1) });
    /* 彩线团堆满（可辨认线团，≠空竹筐） */
    const balls = [
      [-0.28, -0.18, 0.95, Y1], [0.05, -0.22, 0.98, Y2], [0.3, -0.1, 0.95, Y3],
      [-0.15, 0.12, 1.0, Y4], [0.18, 0.15, 1.02, Y5], [-0.35, 0.05, 1.15, Y6],
      [0.08, -0.05, 1.18, Y1], [0.28, 0.08, 1.15, Y2], [-0.05, 0.22, 1.12, Y3],
      [0.0, 0.0, 1.32, Y4], [-0.22, -0.15, 1.28, Y5], [0.22, -0.18, 1.3, Y6],
    ];
    for (const [bx, by, bz, col] of balls) {
      d.box(bx - 0.14, by - 0.14, bz, bx + 0.14, by + 0.14, bz + 0.28, col, { line: shade(col, 0.5), west: shade(col, 0.82), top: shade(col, 1.12) });
      d.box(bx - 0.1, by - 0.1, bz + 0.22, bx + 0.1, by + 0.1, bz + 0.32, shade(col, 1.08), { line: shade(col, 0.55), top: shade(col, 1.18) });
    }
    /* 散落线头 */
    d.seg([-0.4, -0.3, 0.98], [-0.55, -0.45, 0.7], Y1, 1);
    d.seg([0.35, 0.25, 1.05], [0.55, 0.4, 0.75], Y2, 1);
    d.QS(-0.1, -0.05, 1.25, 0.15, 1.4, shade(Y3, 1.2));
    d.QS(0.15, 0.05, 1.05, 0.35, 1.2, shade(Y5, 1.15));
  }


  /** Site245 风铃：屋檐铜/瓷风铃+可辨认铃身+穗（庭院/廊下/檐下/门侧；≠宫灯/串灯；kitbash 密实） */
  function paintPropFengling(d) {
    const COPPER = '#b87838', COPPER_D = '#6a4018', COPPER_L = '#d8a058', PORC = '#e8e0d0';
    const PORC2 = '#d0c8b0', TASSEL = '#c84848', TASSEL2 = '#d8a038', TASSEL3 = '#3a6a88', IRON = '#3a3430';
    const CORD = '#8a6a40', GLAZE = '#7a9a88';
    /* 挂梁/檐钩 */
    const WOOD = '#5a3a22', WOOD_D = '#2a160c';
    d.box(-0.35, -0.08, 2.35, 0.35, 0.08, 2.55, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.08) });
    d.box(-0.06, -0.06, 2.15, 0.06, 0.06, 2.4, IRON, { line: shade(IRON, 0.55), top: shade(IRON, 1.1) });
    /* 悬绳 */
    d.box(-0.035, -0.035, 1.55, 0.035, 0.035, 2.2, CORD, { line: shade(CORD, 0.55), top: shade(CORD, 1.05) });
    /* 铜铃身（可辨认钟形） */
    d.box(-0.32, -0.32, 1.35, 0.32, 0.32, 1.55, COPPER_L, { line: COPPER_D, west: shade(COPPER, 0.85), top: shade(COPPER_L, 1.12) });
    d.box(-0.38, -0.38, 1.15, 0.38, 0.38, 1.4, COPPER, { line: COPPER_D, west: shade(COPPER, 0.8), top: COPPER_L });
    d.box(-0.28, -0.28, 0.95, 0.28, 0.28, 1.2, COPPER_D, { line: shade(COPPER_D, 0.55), west: shade(COPPER, 0.75), top: COPPER });
    /* 瓷釉腰环 */
    d.box(-0.4, -0.4, 1.28, 0.4, 0.4, 1.38, PORC, { line: shade(PORC2, 0.55), west: shade(PORC, 0.9), top: PORC });
    d.box(-0.22, -0.22, 1.32, 0.22, 0.22, 1.42, GLAZE, { line: shade(GLAZE, 0.55), top: shade(GLAZE, 1.15) });
    /* 铃舌/撞锤 */
    d.box(-0.08, -0.08, 0.7, 0.08, 0.08, 1.05, IRON, { line: shade(IRON, 0.55), top: shade(IRON, 1.1) });
    d.box(-0.14, -0.14, 0.55, 0.14, 0.14, 0.75, COPPER_L, { line: COPPER_D, top: shade(COPPER_L, 1.15) });
    /* 底口沿 */
    d.box(-0.35, -0.35, 0.88, 0.35, 0.35, 1.0, COPPER_L, { line: COPPER_D, west: shade(COPPER, 0.85), top: shade(COPPER_L, 1.1) });
    /* 流苏穗×3（可辨认穗） */
    for (const [tx, col] of [[-0.22, TASSEL], [0.0, TASSEL2], [0.22, TASSEL3]]) {
      d.box(tx - 0.06, -0.06, 0.35, tx + 0.06, 0.06, 0.95, col, { line: shade(col, 0.5), west: shade(col, 0.85), top: shade(col, 1.12) });
      d.box(tx - 0.08, -0.08, 0.15, tx + 0.08, 0.08, 0.4, shade(col, 0.9), { line: shade(col, 0.5), top: shade(col, 1.05) });
      d.box(tx - 0.05, -0.05, 0.0, tx + 0.05, 0.05, 0.2, shade(col, 0.75), { line: shade(col, 0.45), top: col });
      d.seg([tx, 0, 0.95], [tx, 0, 1.35], shade(col, 0.7), 1);
    }
    /* 侧挂小瓷片装饰 */
    d.box(-0.55, -0.08, 1.5, -0.4, 0.08, 1.75, PORC, { line: shade(PORC2, 0.55), top: PORC });
    d.box(0.4, -0.08, 1.5, 0.55, 0.08, 1.75, PORC2, { line: shade(PORC, 0.55), top: PORC });
    d.QS(-0.15, -0.15, 1.2, 0.15, 1.4, shade(COPPER_L, 1.2));
    d.QS(-0.08, -0.08, 0.2, 0.08, 0.4, shade(TASSEL2, 1.15));
  }
  /** Site245 竹帘：卷起或半垂竹帘（廊下/庭院/豪宅侧院；≠晾衣杆/花架；kitbash 密实） */
  function paintPropZhulian(d) {
    const BAM = '#9a8a48', BAM_D = '#5a4a20', BAM_L = '#b8a858', RIM = '#c8b878';
    const CORD = '#6a4a28', CORD2 = '#8a6a40', TIE = '#c85038', WOOD = '#5a3a22', WOOD_D = '#2a160c';
    /* 上轴/卷杆（可辨认卷起筒） */
    d.box(-0.95, -0.12, 2.05, 0.95, 0.12, 2.35, BAM_L, { line: BAM_D, west: shade(BAM, 0.85), top: RIM });
    d.box(-1.0, -0.16, 2.1, -0.85, 0.16, 2.4, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.05) });
    d.box(0.85, -0.16, 2.1, 1.0, 0.16, 2.4, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.05) });
    /* 卷帘筒（半卷状态，上半密、下半垂） */
    d.box(-0.9, -0.18, 1.75, 0.9, 0.18, 2.1, BAM, { line: BAM_D, west: shade(BAM, 0.8), top: BAM_L });
    d.box(-0.85, -0.2, 1.85, 0.85, 0.2, 2.05, BAM_D, { line: shade(BAM_D, 0.55), top: BAM });
    /* 垂下竹篾条（半垂，可辨认条纹） */
    for (let i = 0; i < 11; i++) {
      const x = -0.8 + i * 0.16;
      const zBot = 0.55 + (i % 3) * 0.08;
      d.box(x - 0.05, -0.08, zBot, x + 0.05, 0.08, 1.85, (i % 2) ? BAM_L : BAM, { line: BAM_D, west: shade(BAM, 0.82), top: shade(BAM_L, 1.05) });
      /* 节痕 */
      for (const z of [1.1, 1.45, 1.7]) {
        d.box(x - 0.055, -0.09, z, x + 0.055, 0.09, z + 0.04, BAM_D, { line: shade(BAM_D, 0.55), top: BAM });
      }
    }
    /* 横编绳/结 */
    for (const z of [1.0, 1.35, 1.65]) {
      d.box(-0.92, -0.1, z, 0.92, 0.1, z + 0.06, CORD, { line: shade(CORD, 0.55), west: shade(CORD, 0.85), top: CORD2 });
    }
    /* 侧挽起束带（卷起一侧暗示） */
    d.box(0.55, -0.15, 1.2, 0.85, 0.15, 1.55, TIE, { line: shade(TIE, 0.5), west: shade(TIE, 0.85), top: shade(TIE, 1.12) });
    d.box(0.6, -0.12, 1.05, 0.8, 0.12, 1.25, shade(TIE, 0.85), { line: shade(TIE, 0.5), top: TIE });
    d.seg([0.7, 0, 1.55], [0.7, 0, 1.85], TIE, 2);
    /* 下摆参差 */
    d.box(-0.75, -0.1, 0.45, -0.55, 0.1, 0.7, BAM_L, { line: BAM_D, top: BAM });
    d.box(0.35, -0.1, 0.4, 0.55, 0.1, 0.65, BAM, { line: BAM_D, top: BAM_L });
    d.QS(-0.2, -0.05, 1.9, 0.2, 2.15, shade(RIM, 1.15));
    d.QS(0.6, -0.08, 1.15, 0.8, 1.4, shade(TIE, 1.15));
  }
  /** Site245 纱幔：浅色纱帐/幔（院廊用；≠布幌招幌/晾衣；kitbash 密实） */
  function paintPropShaman(d) {
    const WOOD = '#5a3a22', WOOD_D = '#2a160c', WOOD_L = '#7a5a38';
    const SHEER = '#f0e8d8', SHEER2 = '#e0d4c0', SHEER3 = '#d8c8b0', EDGE = '#c8b090';
    const TIE = '#b87888', TIE2 = '#88a0b8', GOLD = '#c8a050';
    /* 顶梁横杆 */
    d.box(-1.05, -0.1, 2.35, 1.05, 0.1, 2.55, WOOD_L, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD_L, 1.1) });
    d.box(-1.1, -0.12, 2.4, -0.95, 0.12, 2.6, WOOD, { line: WOOD_D, top: WOOD_L });
    d.box(0.95, -0.12, 2.4, 1.1, 0.12, 2.6, WOOD, { line: WOOD_D, top: WOOD_L });
    /* 挂环 */
    for (const x of [-0.7, -0.25, 0.25, 0.7]) {
      d.box(x - 0.05, -0.05, 2.25, x + 0.05, 0.05, 2.42, GOLD, { line: shade(GOLD, 0.55), top: shade(GOLD, 1.15) });
    }
    /* 主纱幔幅（浅色半透层叠，可辨认垂幔褶皱） */
    d.box(-0.95, -0.08, 0.55, -0.35, 0.08, 2.3, SHEER, { line: shade(EDGE, 0.7), west: shade(SHEER, 0.92), top: SHEER2 });
    d.box(-0.4, -0.1, 0.45, 0.4, 0.1, 2.3, SHEER2, { line: shade(EDGE, 0.65), west: shade(SHEER2, 0.9), top: SHEER });
    d.box(0.35, -0.08, 0.6, 0.95, 0.08, 2.3, SHEER3, { line: shade(EDGE, 0.7), west: shade(SHEER3, 0.9), top: SHEER2 });
    /* 褶皱竖条 */
    for (const x of [-0.85, -0.65, -0.5, -0.15, 0.05, 0.2, 0.55, 0.75]) {
      d.seg([x, 0, 0.6], [x, 0, 2.25], shade(EDGE, 0.85), 1);
    }
    /* 下摆波浪/荷叶边 */
    for (const [x0, x1, z] of [[-0.95, -0.55, 0.4], [-0.45, 0.05, 0.35], [0.1, 0.5, 0.42], [0.45, 0.95, 0.38]]) {
      d.box(x0, -0.1, z, x1, 0.1, z + 0.22, SHEER, { line: shade(EDGE, 0.6), west: shade(SHEER, 0.88), top: SHEER2 });
    }
    /* 挽起一侧（半开幔） */
    d.box(0.55, -0.18, 1.1, 0.95, 0.18, 1.75, SHEER2, { line: shade(EDGE, 0.6), west: shade(SHEER2, 0.9), top: SHEER });
    d.box(0.65, -0.15, 1.35, 0.9, 0.15, 1.55, TIE, { line: shade(TIE, 0.5), west: shade(TIE, 0.85), top: shade(TIE, 1.12) });
    d.box(0.7, -0.12, 1.25, 0.85, 0.12, 1.4, TIE2, { line: shade(TIE2, 0.5), top: shade(TIE2, 1.1) });
    /* 顶缘花边+坠饰 */
    d.box(-0.95, -0.12, 2.15, 0.95, 0.12, 2.35, EDGE, { line: shade(EDGE, 0.55), west: shade(EDGE, 0.85), top: SHEER });
    for (const x of [-0.6, 0.0, 0.6]) {
      d.box(x - 0.06, -0.06, 2.0, x + 0.06, 0.06, 2.2, GOLD, { line: shade(GOLD, 0.55), top: shade(GOLD, 1.15) });
    }
    d.QS(-0.2, -0.05, 1.4, 0.2, 1.8, shade(SHEER, 1.15));
    d.QS(0.65, -0.08, 1.3, 0.9, 1.6, shade(TIE, 1.15));
  }


  /** Site246 茶盘：木盘+茶碗/壶（庭院/廊下/店前/豪宅；≠prop_chaju 茶盏托盘；kitbash 密实） */
  function paintPropChapan(d) {
    const WOOD = '#6a4220', WOOD_D = '#2e1808', WOOD_L = '#8a5a30', LACQ = '#5a2010', LACQ_L = '#8a3820';
    const PORC = '#f0e8d8', PORC_B = '#3a6a98', PORC_G = '#4a7a58', TEA = '#6a4828', GOLD = '#c8a040';
    const BRONZE = '#8a6a38', MAT = '#c8a868', MAT_D = '#8a7040', INK = '#2a2a28';
    /* 矮足木托 */
    for (const [x, y] of [[-0.72, -0.48], [0.72, -0.48], [-0.72, 0.48], [0.72, 0.48]]) {
      d.box(x - 0.08, y - 0.08, 0, x + 0.08, y + 0.08, 0.18, WOOD_D, { line: shade(WOOD_D, 0.55), top: WOOD });
    }
    /* 主木盘底板（可辨认浅盘） */
    d.box(-0.85, -0.58, 0.15, 0.85, 0.58, 0.28, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: WOOD_L });
    d.box(-0.8, -0.52, 0.25, 0.8, 0.52, 0.38, LACQ, { line: shade(LACQ, 0.55), west: shade(LACQ, 0.82), top: LACQ_L });
    /* 盘沿高起（四面） */
    d.box(-0.88, -0.6, 0.32, 0.88, -0.48, 0.52, WOOD_L, { line: WOOD_D, west: shade(WOOD, 0.82), top: shade(WOOD_L, 1.1) });
    d.box(-0.88, 0.48, 0.32, 0.88, 0.6, 0.52, WOOD_L, { line: WOOD_D, west: shade(WOOD, 0.82), top: shade(WOOD_L, 1.1) });
    d.box(-0.88, -0.6, 0.32, -0.72, 0.6, 0.52, WOOD, { line: WOOD_D, west: shade(WOOD, 0.75), top: WOOD_L });
    d.box(0.72, -0.6, 0.32, 0.88, 0.6, 0.52, WOOD, { line: WOOD_D, west: shade(WOOD, 0.75), top: WOOD_L });
    /* 盘内草垫 */
    d.box(-0.62, -0.38, 0.36, 0.62, 0.38, 0.46, MAT, { line: MAT_D, west: shade(MAT, 0.85), top: shade(MAT, 1.1) });
    /* 茶壶（可辨认壶身+壶嘴+提梁） */
    d.box(-0.42, -0.22, 0.45, -0.02, 0.22, 0.95, PORC, { line: shade(PORC, 0.55), west: shade(PORC, 0.88), top: shade(PORC, 1.08) });
    d.box(-0.38, -0.18, 0.9, -0.06, 0.18, 1.12, PORC_B, { line: shade(PORC_B, 0.5), west: shade(PORC_B, 0.82), top: shade(PORC_B, 1.12) });
    d.box(-0.32, -0.12, 1.08, -0.12, 0.12, 1.22, GOLD, { line: shade(GOLD, 0.55), top: shade(GOLD, 1.15) });
    /* 壶嘴 */
    d.box(-0.02, -0.06, 0.7, 0.22, 0.06, 0.88, PORC, { line: shade(PORC, 0.55), top: shade(PORC, 1.05) });
    d.box(0.18, -0.05, 0.72, 0.32, 0.05, 0.82, PORC_B, { line: shade(PORC_B, 0.5), top: shade(PORC_B, 1.1) });
    /* 壶把 */
    d.box(-0.55, -0.05, 0.65, -0.4, 0.05, 1.0, PORC_B, { line: shade(PORC_B, 0.5), top: shade(PORC_B, 1.08) });
    d.box(-0.58, -0.06, 0.95, -0.38, 0.06, 1.08, BRONZE, { line: shade(BRONZE, 0.55), top: GOLD });
    /* 茶碗×4（可辨认盏） */
    const cups = [[0.08, -0.28, PORC], [0.35, -0.12, PORC_G], [0.18, 0.2, PORC], [0.42, 0.22, PORC_B]];
    for (const [cx, cy, col] of cups) {
      d.box(cx - 0.12, cy - 0.12, 0.45, cx + 0.12, cy + 0.12, 0.58, col, { line: shade(col, 0.5), west: shade(col, 0.85), top: shade(col, 1.08) });
      d.box(cx - 0.1, cy - 0.1, 0.55, cx + 0.1, cy + 0.1, 0.72, shade(col, 1.02), { line: shade(col, 0.55), west: shade(col, 0.88), top: shade(col, 1.12) });
      d.box(cx - 0.06, cy - 0.06, 0.68, cx + 0.06, cy + 0.06, 0.78, TEA, { line: false, noW: true, noS: true });
    }
    /* 茶则/茶荷 */
    d.box(0.52, -0.35, 0.45, 0.72, -0.1, 0.58, PORC, { line: shade(PORC, 0.55), west: shade(PORC, 0.88), top: shade(PORC, 1.08) });
    d.box(0.55, -0.3, 0.55, 0.7, -0.15, 0.68, GOLD, { line: shade(GOLD, 0.55), top: shade(GOLD, 1.12) });
    /* 漆盘描金 */
    d.seg([-0.7, -0.45, 0.4], [0.7, -0.45, 0.4], shade(GOLD, 0.9));
    d.seg([-0.7, 0.45, 0.4], [0.7, 0.45, 0.4], shade(GOLD, 0.85));
    d.QS(-0.35, -0.1, 1.05, -0.2, 1.18, shade(PORC, 1.15));
    d.QS(0.12, -0.22, 0.68, 0.02, 0.75, shade(TEA, 1.2));
  }

  /** Site246 食盒：分层提盒（庭院/廊下/店前/豪宅；可辨认多层+提梁；kitbash 密实） */
  function paintPropShihe(d) {
    const WOOD = '#5a3a1a', WOOD_D = '#2a1608', WOOD_L = '#7a5230', LACQ = '#6a2818', LACQ_L = '#9a4030';
    const LACQ2 = '#4a1810', GOLD = '#c8a040', BRONZE = '#8a6a38', RED = '#a83828', CREAM = '#e8d8b8';
    const ROPE = '#8a6a40', FOOD = '#d87838', FOOD2 = '#6a8a48', FOOD3 = '#c84848';
    /* 底足 */
    for (const [x, y] of [[-0.55, -0.4], [0.55, -0.4], [-0.55, 0.4], [0.55, 0.4]]) {
      d.box(x - 0.1, y - 0.1, 0, x + 0.1, y + 0.1, 0.2, WOOD_D, { line: shade(WOOD_D, 0.55), top: WOOD });
    }
    /* 底层盒 */
    d.box(-0.65, -0.5, 0.18, 0.65, 0.5, 0.7, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: WOOD_L });
    d.box(-0.6, -0.45, 0.65, 0.6, 0.45, 0.82, LACQ, { line: shade(LACQ, 0.55), west: shade(LACQ, 0.85), top: LACQ_L });
    /* 中层盒 */
    d.box(-0.58, -0.45, 0.8, 0.58, 0.45, 1.3, WOOD_L, { line: WOOD_D, west: shade(WOOD, 0.82), top: shade(WOOD_L, 1.08) });
    d.box(-0.54, -0.4, 1.25, 0.54, 0.4, 1.42, LACQ2, { line: shade(LACQ2, 0.55), west: shade(LACQ, 0.8), top: LACQ_L });
    /* 顶层盒 */
    d.box(-0.5, -0.38, 1.4, 0.5, 0.38, 1.85, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: WOOD_L });
    d.box(-0.46, -0.34, 1.8, 0.46, 0.34, 1.98, LACQ_L, { line: LACQ, west: shade(LACQ, 0.85), top: shade(LACQ_L, 1.1) });
    /* 各层描金腰线 */
    for (const z of [0.72, 1.32, 1.9]) {
      d.box(-0.62, -0.48, z, 0.62, 0.48, z + 0.06, GOLD, { line: shade(GOLD, 0.55), west: shade(GOLD, 0.85), top: shade(GOLD, 1.12) });
    }
    /* 铜扣/锁鼻（侧） */
    for (const z of [0.4, 1.0, 1.6]) {
      d.box(-0.72, -0.08, z, -0.62, 0.08, z + 0.2, BRONZE, { line: shade(BRONZE, 0.55), top: GOLD });
      d.box(0.62, -0.08, z, 0.72, 0.08, z + 0.2, BRONZE, { line: shade(BRONZE, 0.55), top: GOLD });
    }
    /* 提梁竖杆×2 + 横梁（可辨认提盒） */
    d.box(-0.35, -0.06, 1.95, -0.22, 0.06, 2.55, WOOD_D, { line: shade(WOOD_D, 0.55), top: WOOD });
    d.box(0.22, -0.06, 1.95, 0.35, 0.06, 2.55, WOOD_D, { line: shade(WOOD_D, 0.55), top: WOOD });
    d.box(-0.4, -0.08, 2.45, 0.4, 0.08, 2.65, WOOD_L, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD_L, 1.1) });
    d.box(-0.15, -0.1, 2.55, 0.15, 0.1, 2.72, BRONZE, { line: shade(BRONZE, 0.55), top: GOLD });
    /* 绳结装饰 */
    d.box(-0.12, -0.08, 2.35, 0.12, 0.08, 2.5, ROPE, { line: shade(ROPE, 0.55), top: shade(ROPE, 1.1) });
    /* 半开顶层露出食物暗示 */
    d.box(-0.35, -0.2, 1.98, 0.35, 0.25, 2.15, CREAM, { line: shade(CREAM, 0.7), west: shade(CREAM, 0.9), top: shade(CREAM, 1.08) });
    d.box(-0.25, -0.12, 2.1, -0.05, 0.08, 2.28, FOOD, { line: shade(FOOD, 0.55), top: shade(FOOD, 1.12) });
    d.box(0.0, -0.1, 2.1, 0.2, 0.1, 2.25, FOOD2, { line: shade(FOOD2, 0.55), top: shade(FOOD2, 1.12) });
    d.box(0.12, 0.05, 2.08, 0.3, 0.22, 2.22, FOOD3, { line: shade(FOOD3, 0.55), top: shade(FOOD3, 1.1) });
    /* 侧红签 */
    d.box(0.48, -0.15, 1.0, 0.62, 0.15, 1.35, RED, { line: shade(RED, 0.5), west: shade(RED, 0.85), top: shade(RED, 1.12) });
    d.QS(-0.1, -0.05, 2.55, 0.1, 2.7, shade(GOLD, 1.2));
    d.QS(-0.2, -0.05, 2.15, -0.08, 2.25, shade(FOOD, 1.15));
  }

  /** Site246 果盘：高足或平底盘+果（庭院/廊下/店前/豪宅；可辨认盘+果；kitbash 密实） */
  function paintPropGuopan(d) {
    const WOOD = '#5a3a22', WOOD_D = '#2a160c', WOOD_L = '#7a5a38', LACQ = '#4a2010', LACQ_L = '#7a3828';
    const PORC = '#e8e0d0', PORC_B = '#3a6a98', GOLD = '#c8a040', BRONZE = '#8a6a38';
    const ORANGE = '#d87838', RED = '#c84838', YELLOW = '#d8b038', GREEN = '#5a8a48', PURPLE = '#7a4878';
    const CREAM = '#f0e8d0';
    /* 高足底座 */
    d.box(-0.35, -0.35, 0, 0.35, 0.35, 0.18, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: WOOD_L });
    d.box(-0.22, -0.22, 0.15, 0.22, 0.22, 0.55, WOOD_D, { line: shade(WOOD_D, 0.55), west: shade(WOOD, 0.75), top: WOOD });
    d.box(-0.28, -0.28, 0.5, 0.28, 0.28, 0.68, BRONZE, { line: shade(BRONZE, 0.55), west: shade(BRONZE, 0.82), top: GOLD });
    /* 盘托颈 */
    d.box(-0.14, -0.14, 0.65, 0.14, 0.14, 0.95, WOOD_L, { line: WOOD_D, west: shade(WOOD, 0.82), top: shade(WOOD_L, 1.08) });
    d.box(-0.18, -0.18, 0.9, 0.18, 0.18, 1.05, LACQ, { line: shade(LACQ, 0.55), top: LACQ_L });
    /* 果盘盘面（浅宽盘，可辨认） */
    d.box(-0.85, -0.7, 1.0, 0.85, 0.7, 1.15, PORC, { line: shade(PORC, 0.55), west: shade(PORC, 0.88), top: shade(PORC, 1.08) });
    d.box(-0.9, -0.75, 1.12, 0.9, 0.75, 1.28, PORC_B, { line: shade(PORC_B, 0.5), west: shade(PORC_B, 0.82), top: shade(PORC_B, 1.1) });
    /* 盘沿翻边 */
    d.box(-0.95, -0.8, 1.2, 0.95, -0.65, 1.38, PORC, { line: shade(PORC, 0.55), west: shade(PORC, 0.9), top: CREAM });
    d.box(-0.95, 0.65, 1.2, 0.95, 0.8, 1.38, PORC, { line: shade(PORC, 0.55), west: shade(PORC, 0.9), top: CREAM });
    d.box(-0.95, -0.8, 1.2, -0.78, 0.8, 1.38, PORC_B, { line: shade(PORC_B, 0.5), top: PORC });
    d.box(0.78, -0.8, 1.2, 0.95, 0.8, 1.38, PORC_B, { line: shade(PORC_B, 0.5), top: PORC });
    /* 盘内心 */
    d.box(-0.7, -0.55, 1.25, 0.7, 0.55, 1.35, CREAM, { line: shade(CREAM, 0.7), west: shade(CREAM, 0.92), top: shade(CREAM, 1.05) });
    /* 描金圈 */
    d.box(-0.75, -0.6, 1.32, 0.75, 0.6, 1.38, GOLD, { line: shade(GOLD, 0.55), west: shade(GOLD, 0.85), top: shade(GOLD, 1.12) });
    /* 果：橙/红/黄/绿/紫 堆叠可辨认 */
    const fruits = [
      [-0.4, -0.25, ORANGE, 0.2], [0.05, -0.3, RED, 0.18], [0.35, -0.15, YELLOW, 0.17],
      [-0.15, 0.15, GREEN, 0.19], [0.25, 0.25, PURPLE, 0.16], [-0.45, 0.2, ORANGE, 0.15],
      [0.0, -0.05, RED, 0.14], [0.45, 0.1, GREEN, 0.13], [-0.2, -0.35, YELLOW, 0.12],
    ];
    for (const [fx, fy, col, r] of fruits) {
      const z0 = 1.35;
      d.box(fx - r, fy - r, z0, fx + r, fy + r, z0 + r * 1.6, col, { line: shade(col, 0.5), west: shade(col, 0.82), top: shade(col, 1.15) });
      d.box(fx - r * 0.6, fy - r * 0.6, z0 + r * 1.3, fx + r * 0.6, fy + r * 0.6, z0 + r * 2.0, shade(col, 1.08), { line: shade(col, 0.55), top: shade(col, 1.2) });
    }
    /* 叶/蒂点缀 */
    d.box(-0.08, -0.08, 1.7, 0.08, 0.08, 1.95, GREEN, { line: shade(GREEN, 0.5), top: shade(GREEN, 1.15) });
    d.box(0.2, -0.25, 1.65, 0.35, -0.1, 1.85, shade(GREEN, 0.9), { line: shade(GREEN, 0.5), top: GREEN });
    d.QS(-0.35, -0.2, 1.55, -0.25, 1.7, shade(ORANGE, 1.2));
    d.QS(0.05, -0.25, 1.55, 0.15, 1.68, shade(RED, 1.2));
  }

  /** Site247 石敢当：门侧石碑/石敢当（可辨认刻字或符；≠Site215 stone_ganddang 路标尖顶；kitbash 密实） */
  function paintPropShigandang(d) {
    const ST = '#8a8070', STW = '#6a6258', TOP = '#9a9080', DARK = '#4a443c', INK = '#2a2620';
    const RED = '#a83828', RED_D = '#701818', GOLD = '#c8a040', SEAL = '#c84838';
    /* 宽基座（门侧碑座，可辨认） */
    d.box(-0.55, -0.38, 0, 0.55, 0.38, 0.22, ST, { line: shade(ST, 0.48), west: STW, top: shade(ST, 0.9) });
    d.box(-0.48, -0.32, 0.2, 0.48, 0.32, 0.36, shade(ST, 0.95), { line: shade(ST, 0.5), west: STW, top: TOP });
    /* 须弥束腰 */
    d.box(-0.42, -0.28, 0.34, 0.42, 0.28, 0.48, DARK, { line: shade(DARK, 0.5), west: shade(DARK, 0.85), top: shade(ST, 1.05) });
    /* 碑身（宽扁门侧碑，非尖顶路标） */
    d.box(-0.4, -0.2, 0.45, 0.4, 0.2, 1.65, shade(ST, 1.02), { line: shade(ST, 0.48), west: STW, top: TOP });
    /* 内凹铭文框 */
    d.box(-0.32, -0.22, 0.55, 0.32, -0.16, 1.5, DARK, { line: shade(DARK, 0.5), west: INK, top: shade(DARK, 1.05) });
    d.QS(-0.41, -0.25, 0.55, 0.25, 1.5, shade(ST, 1.14), shade(ST, 0.55));
    /* 「泰山石敢当」字块暗示（五字竖排，可辨认刻字） */
    const glyphs = [
      [-0.18, 0.62, 0.36, 0.14], [-0.18, 0.82, 0.36, 0.14], [-0.18, 1.02, 0.36, 0.14],
      [-0.18, 1.22, 0.36, 0.14], [-0.18, 1.42, 0.36, 0.12],
    ];
    for (const [gx, gz, gw, gh] of glyphs) {
      d.box(gx, -0.225, gz, gx + gw, -0.175, gz + gh, shade(INK, 1.1), { line: false, noW: true, noS: true });
      d.box(gx + 0.05, -0.23, gz + 0.03, gx + gw - 0.05, -0.18, gz + gh - 0.03, shade(ST, 1.15), { line: false, noW: true, noS: true });
    }
    /* 朱红符印（可辨认符） */
    d.box(-0.14, -0.24, 1.05, 0.14, -0.2, 1.28, SEAL, { line: shade(SEAL, 0.5), west: RED_D, top: shade(SEAL, 1.12) });
    d.box(-0.08, -0.245, 1.1, 0.08, -0.205, 1.22, RED, { line: false, noW: true, noS: true });
    /* 碑额横匾（非尖顶） */
    d.box(-0.48, -0.24, 1.62, 0.48, 0.24, 1.78, shade(ST, 1.08), { line: shade(ST, 0.5), west: STW, top: shade(ST, 1.18) });
    d.box(-0.35, -0.18, 1.75, 0.35, 0.18, 1.92, shade(ST, 1.05), { line: shade(ST, 0.5), west: STW, top: TOP });
    /* 描金边 + 侧云纹暗示 */
    d.box(-0.42, -0.22, 1.7, 0.42, 0.22, 1.76, GOLD, { line: shade(GOLD, 0.55), west: shade(GOLD, 0.85), top: shade(GOLD, 1.12) });
    d.QS(-0.1, -0.2, 1.12, 0.1, 1.24, shade(SEAL, 1.2));
    for (let z = 0.55; z < 1.55; z += 0.14) d.seg([-0.39, -0.205, z], [0.39, -0.205, z], shade(ST, 0.7));
  }
  /** Site247 门神画：贴门或挂轴门神（可辨认武将红袍金甲；≠匾额对联；kitbash 密实） */
  function paintPropMenshen(d) {
    const WOOD = '#5a3a1a', WOOD_D = '#2a1608', WOOD_L = '#7a5230', GOLD = '#c8a040';
    const RED = '#c04030', RED_D = '#801820', CREAM = '#e8d8b8', INK = '#2a2a28';
    const ARMOR = '#8a6a38', BLUE = '#3a5a88', FACE = '#e8c8a0', BLACK = '#1a1814';
    /* 挂轴天杆 + 地杆 */
    d.box(-0.72, -0.12, 2.55, 0.72, 0.12, 2.75, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: WOOD_L });
    d.box(-0.68, -0.1, 0.05, 0.68, 0.1, 0.22, WOOD_D, { line: shade(WOOD_D, 0.55), top: WOOD });
    /* 画心纸面（竖轴） */
    d.box(-0.62, -0.08, 0.2, 0.62, 0.08, 2.55, CREAM, { line: shade(CREAM, 0.7), west: shade(CREAM, 0.9), top: shade(CREAM, 1.05) });
    /* 朱红边框 */
    d.box(-0.65, -0.1, 0.22, -0.55, 0.1, 2.52, RED, { line: RED_D, west: shade(RED, 0.82), top: shade(RED, 1.1) });
    d.box(0.55, -0.1, 0.22, 0.65, 0.1, 2.52, RED, { line: RED_D, west: shade(RED, 0.82), top: shade(RED, 1.1) });
    d.box(-0.65, -0.1, 2.4, 0.65, 0.1, 2.55, RED, { line: RED_D, top: shade(RED, 1.12) });
    d.box(-0.65, -0.1, 0.2, 0.65, 0.1, 0.35, RED, { line: RED_D, top: shade(RED, 1.1) });
    /* 门神武将身躯（红袍） */
    d.box(-0.35, -0.1, 0.55, 0.35, 0.1, 1.55, RED, { line: RED_D, west: shade(RED, 0.82), top: shade(RED, 1.08) });
    /* 金甲胸甲 */
    d.box(-0.3, -0.1, 1.2, 0.3, 0.1, 1.7, ARMOR, { line: shade(ARMOR, 0.5), west: shade(ARMOR, 0.82), top: GOLD });
    d.box(-0.22, -0.1, 1.35, 0.22, 0.1, 1.55, GOLD, { line: shade(GOLD, 0.55), top: shade(GOLD, 1.15) });
    /* 头冠 */
    d.box(-0.28, -0.1, 1.95, 0.28, 0.1, 2.25, GOLD, { line: shade(GOLD, 0.5), west: shade(GOLD, 0.85), top: shade(GOLD, 1.12) });
    d.box(-0.18, -0.1, 2.2, 0.18, 0.1, 2.4, RED, { line: RED_D, top: shade(RED, 1.1) });
    /* 面容 */
    d.box(-0.22, -0.1, 1.7, 0.22, 0.1, 2.0, FACE, { line: shade(FACE, 0.6), west: shade(FACE, 0.88), top: shade(FACE, 1.08) });
    d.box(-0.14, -0.1, 1.82, -0.04, 0.1, 1.92, INK, { line: false, noW: true, noS: true });
    d.box(0.04, -0.1, 1.82, 0.14, 0.1, 1.92, INK, { line: false, noW: true, noS: true });
    d.box(-0.08, -0.1, 1.72, 0.08, 0.1, 1.8, RED_D, { line: false, noW: true, noS: true });
    /* 须髯 */
    d.box(-0.25, -0.1, 1.55, 0.25, 0.1, 1.72, BLACK, { line: shade(BLACK, 0.7), top: shade(BLACK, 1.05) });
    /* 持械（刀/锏暗示） */
    d.box(0.3, -0.1, 0.7, 0.5, 0.1, 2.1, ARMOR, { line: shade(ARMOR, 0.5), top: GOLD });
    d.box(0.28, -0.1, 2.0, 0.52, 0.1, 2.25, GOLD, { line: shade(GOLD, 0.55), top: shade(GOLD, 1.15) });
    d.box(-0.5, -0.1, 0.6, -0.3, 0.1, 1.4, BLUE, { line: shade(BLUE, 0.5), west: shade(BLUE, 0.82), top: shade(BLUE, 1.08) });
    /* 靴 */
    d.box(-0.3, -0.1, 0.35, -0.08, 0.1, 0.58, BLACK, { line: shade(BLACK, 0.6), top: shade(BLACK, 1.05) });
    d.box(0.08, -0.1, 0.35, 0.3, 0.1, 0.58, BLACK, { line: shade(BLACK, 0.6), top: shade(BLACK, 1.05) });
    /* 描金边线 */
    d.seg([-0.55, -0.09, 0.4], [-0.55, -0.09, 2.4], shade(GOLD, 0.9));
    d.seg([0.55, -0.09, 0.4], [0.55, -0.09, 2.4], shade(GOLD, 0.85));
    d.QS(-0.15, -0.05, 1.85, 0.15, 1.98, shade(FACE, 1.15));
  }
  /** Site247 年画：墙贴或摊上年画卷（可辨认红底彩绘民俗；≠门神挂轴/匾额；kitbash 密实） */
  function paintPropNianhua(d) {
    const WOOD = '#6a4220', WOOD_D = '#2e1808', WOOD_L = '#8a5a30', GOLD = '#c8a040';
    const RED = '#c84838', RED_D = '#801820', CREAM = '#f0e0c8', YELLOW = '#d8b038';
    const GREEN = '#4a8a48', BLUE = '#3a6a98', PINK = '#d87888', INK = '#2a2a28';
    /* 摊架/卷轴木托（可辨认摊上年画卷） */
    d.box(-0.85, -0.35, 0, 0.85, 0.35, 0.18, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: WOOD_L });
    d.box(-0.8, -0.3, 0.15, 0.8, 0.3, 0.32, WOOD_D, { line: shade(WOOD_D, 0.55), top: WOOD });
    /* 卷轴两端木轴 */
    d.box(-0.95, -0.12, 0.9, -0.75, 0.12, 1.15, WOOD_L, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD_L, 1.1) });
    d.box(0.75, -0.12, 0.9, 0.95, 0.12, 1.15, WOOD_L, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD_L, 1.1) });
    /* 年画纸面（横幅墙贴/摊开） */
    d.box(-0.78, -0.08, 0.35, 0.78, 0.08, 1.85, CREAM, { line: shade(CREAM, 0.7), west: shade(CREAM, 0.9), top: shade(CREAM, 1.05) });
    /* 大红底框 */
    d.box(-0.78, -0.1, 0.35, 0.78, 0.1, 0.5, RED, { line: RED_D, top: shade(RED, 1.12) });
    d.box(-0.78, -0.1, 1.7, 0.78, 0.1, 1.85, RED, { line: RED_D, top: shade(RED, 1.12) });
    d.box(-0.78, -0.1, 0.35, -0.65, 0.1, 1.85, RED, { line: RED_D, west: shade(RED, 0.82), top: shade(RED, 1.1) });
    d.box(0.65, -0.1, 0.35, 0.78, 0.1, 1.85, RED, { line: RED_D, west: shade(RED, 0.82), top: shade(RED, 1.1) });
    /* 民俗彩绘块：娃娃/花/鱼暗示（色块可辨认年画） */
    d.box(-0.5, -0.1, 0.7, -0.1, 0.1, 1.35, PINK, { line: shade(PINK, 0.55), west: shade(PINK, 0.85), top: shade(PINK, 1.1) });
    d.box(-0.42, -0.1, 1.2, -0.18, 0.1, 1.45, CREAM, { line: shade(CREAM, 0.6), top: shade(CREAM, 1.08) });
    d.box(-0.38, -0.1, 1.28, -0.3, 0.1, 1.36, INK, { line: false, noW: true, noS: true });
    d.box(-0.28, -0.1, 1.28, -0.2, 0.1, 1.36, INK, { line: false, noW: true, noS: true });
    /* 鲤鱼/牡丹色块 */
    d.box(0.05, -0.1, 0.65, 0.55, 0.1, 1.05, RED, { line: RED_D, west: shade(RED, 0.85), top: shade(RED, 1.1) });
    d.box(0.15, -0.1, 0.85, 0.45, 0.1, 1.15, GOLD, { line: shade(GOLD, 0.55), top: shade(GOLD, 1.15) });
    d.box(0.1, -0.1, 1.15, 0.5, 0.1, 1.5, GREEN, { line: shade(GREEN, 0.5), west: shade(GREEN, 0.82), top: shade(GREEN, 1.1) });
    d.box(0.2, -0.1, 1.35, 0.4, 0.1, 1.55, PINK, { line: shade(PINK, 0.55), top: shade(PINK, 1.12) });
    /* 金字横批暗示 */
    d.box(-0.55, -0.1, 1.55, 0.55, 0.1, 1.68, YELLOW, { line: shade(YELLOW, 0.55), west: shade(YELLOW, 0.85), top: GOLD });
    d.box(-0.4, -0.1, 1.58, -0.25, 0.1, 1.66, INK, { line: false, noW: true, noS: true });
    d.box(-0.1, -0.1, 1.58, 0.05, 0.1, 1.66, INK, { line: false, noW: true, noS: true });
    d.box(0.2, -0.1, 1.58, 0.35, 0.1, 1.66, INK, { line: false, noW: true, noS: true });
    /* 侧蓝云纹 */
    d.box(-0.6, -0.1, 0.55, -0.5, 0.1, 0.75, BLUE, { line: shade(BLUE, 0.5), top: shade(BLUE, 1.1) });
    d.box(0.5, -0.1, 0.55, 0.6, 0.1, 0.75, BLUE, { line: shade(BLUE, 0.5), top: shade(BLUE, 1.1) });
    d.QS(-0.35, -0.05, 1.25, -0.2, 1.4, shade(PINK, 1.15));
    d.QS(0.2, -0.05, 0.9, 0.4, 1.05, shade(GOLD, 1.2));
  }
  /** Site248 糖葫芦：竹签糖葫芦串（可辨认红果+糖衣；摊边/巷口玩具零食；kitbash 密实） */
  function paintPropTanghulu(d) {
    const BAM = '#8a6a38', BAM_D = '#5a4020', BAM_L = '#a88850';
    const RED = '#c03828', RED_D = '#801818', RED_L = '#e85848', SUGAR = '#f0e8d8';
    const WOOD = '#5a3a1a', WOOD_D = '#2a1608', HOLD = '#6a4a28';
    /* 木托/小立架（摊边可辨认） */
    d.box(-0.35, -0.22, 0, 0.35, 0.22, 0.14, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: shade(WOOD, 1.1) });
    d.box(-0.28, -0.16, 0.12, 0.28, 0.16, 0.28, HOLD, { line: WOOD_D, west: shade(HOLD, 0.8), top: BAM_L });
    /* 竹签（斜插可辨认串） */
    d.box(-0.04, -0.04, 0.25, 0.04, 0.04, 1.85, BAM, { line: BAM_D, west: shade(BAM, 0.78), top: BAM_L });
    d.box(-0.035, -0.035, 1.8, 0.035, 0.035, 1.95, BAM_L, { line: BAM_D, top: shade(BAM_L, 1.12) });
    /* 红果串（5–6 颗，糖衣高光） */
    const berries = [0.42, 0.62, 0.82, 1.02, 1.22, 1.42];
    for (let i = 0; i < berries.length; i++) {
      const z = berries[i];
      const r = 0.16 - (i % 3) * 0.01;
      d.box(-r, -r, z, r, r, z + 0.28, RED, { line: RED_D, west: shade(RED, 0.82), top: RED_L });
      /* 糖衣亮斑 */
      d.box(-r * 0.45, -r - 0.02, z + 0.08, r * 0.2, -r + 0.02, z + 0.2, SUGAR, { line: false, noW: true, noS: true });
      d.QS(-0.06, -r - 0.01, z + 0.1, 0.06, z + 0.22, shade(RED_L, 1.15));
    }
    /* 签顶小果/糖滴 */
    d.box(-0.08, -0.08, 1.68, 0.08, 0.08, 1.82, RED_L, { line: RED_D, west: shade(RED, 0.85), top: SUGAR });
    /* 侧旁第二签暗示（成束） */
    d.box(0.12, -0.03, 0.3, 0.2, 0.03, 1.55, BAM, { line: BAM_D, west: shade(BAM, 0.75), top: BAM_L });
    d.box(0.08, -0.1, 0.55, 0.24, 0.1, 0.78, RED, { line: RED_D, west: shade(RED, 0.82), top: RED_L });
    d.box(0.08, -0.1, 0.85, 0.24, 0.1, 1.08, RED, { line: RED_D, west: shade(RED, 0.82), top: RED_L });
    d.box(0.08, -0.1, 1.15, 0.24, 0.1, 1.38, RED, { line: RED_D, west: shade(RED, 0.82), top: RED_L });
    d.box(-0.2, -0.03, 0.32, -0.12, 0.03, 1.4, BAM, { line: BAM_D, west: shade(BAM, 0.75), top: BAM_L });
    d.box(-0.24, -0.1, 0.58, -0.08, 0.1, 0.8, RED, { line: RED_D, top: RED_L });
    d.box(-0.24, -0.1, 0.88, -0.08, 0.1, 1.1, RED, { line: RED_D, top: RED_L });
    /* 托盘边纹 */
    d.seg([-0.32, -0.2, 0.14], [0.32, -0.2, 0.14], shade(BAM_L, 0.9));
  }
  /** Site248 拨浪鼓：手持小鼓玩具（可辨认双面鼓+摇珠；摊边/巷口；kitbash 密实） */
  function paintPropBolanggu(d) {
    const WOOD = '#6a4220', WOOD_D = '#2e1808', WOOD_L = '#8a5a30';
    const RED = '#c04030', RED_D = '#801820', SKIN = '#e8d0a8', GOLD = '#c8a040';
    const CORD = '#8a3030', BEAD = '#d84838';
    /* 握柄（竹/木杆） */
    d.box(-0.06, -0.06, 0, 0.06, 0.06, 1.05, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: WOOD_L });
    d.box(-0.08, -0.08, 0, 0.08, 0.08, 0.18, WOOD_D, { line: shade(WOOD_D, 0.55), top: WOOD });
    /* 鼓身（扁圆双面） */
    d.box(-0.42, -0.18, 1.0, 0.42, 0.18, 1.55, RED, { line: RED_D, west: shade(RED, 0.82), top: shade(RED, 1.08) });
    /* 鼓面（皮） */
    d.box(-0.38, -0.2, 1.08, 0.38, -0.14, 1.48, SKIN, { line: shade(SKIN, 0.6), west: shade(SKIN, 0.88), top: shade(SKIN, 1.1) });
    d.box(-0.38, 0.14, 1.08, 0.38, 0.2, 1.48, SKIN, { line: shade(SKIN, 0.6), west: shade(SKIN, 0.88), top: shade(SKIN, 1.1) });
    /* 鼓钉环 */
    for (let x = -0.32; x <= 0.32; x += 0.16) {
      d.box(x - 0.03, -0.21, 1.12, x + 0.03, -0.17, 1.2, GOLD, { line: false, noW: true, noS: true });
      d.box(x - 0.03, 0.17, 1.12, x + 0.03, 0.21, 1.2, GOLD, { line: false, noW: true, noS: true });
    }
    /* 鼓心纹 */
    d.box(-0.12, -0.205, 1.22, 0.12, -0.155, 1.38, RED_D, { line: false, noW: true, noS: true });
    d.QS(-0.1, -0.2, 1.24, 0.1, 1.36, shade(GOLD, 1.15));
    /* 左右摇珠绳 + 珠 */
    d.box(-0.55, -0.03, 1.22, -0.42, 0.03, 1.32, CORD, { line: shade(CORD, 0.5), top: shade(CORD, 1.1) });
    d.box(0.42, -0.03, 1.22, 0.55, 0.03, 1.32, CORD, { line: shade(CORD, 0.5), top: shade(CORD, 1.1) });
    d.box(-0.62, -0.1, 1.15, -0.48, 0.1, 1.4, BEAD, { line: shade(BEAD, 0.5), west: shade(BEAD, 0.82), top: shade(BEAD, 1.15) });
    d.box(0.48, -0.1, 1.15, 0.62, 0.1, 1.4, BEAD, { line: shade(BEAD, 0.5), west: shade(BEAD, 0.82), top: shade(BEAD, 1.15) });
    /* 柄端结 */
    d.box(-0.1, -0.1, 0.95, 0.1, 0.1, 1.08, GOLD, { line: shade(GOLD, 0.55), west: shade(GOLD, 0.85), top: shade(GOLD, 1.12) });
    d.seg([-0.4, -0.19, 1.05], [0.4, -0.19, 1.05], shade(GOLD, 0.9));
    d.seg([-0.4, -0.19, 1.5], [0.4, -0.19, 1.5], shade(GOLD, 0.85));
  }
  /** Site248 风筝：折叠或立放风筝（可辨认燕形/菱形骨架+彩面；摊边/广场；kitbash 密实） */
  function paintPropFengzheng(d) {
    const BAM = '#8a6a38', BAM_D = '#5a4020', BAM_L = '#a88850';
    const RED = '#c84838', RED_D = '#801820', BLUE = '#3a6a98', GOLD = '#c8a040';
    const CREAM = '#f0e0c8', GREEN = '#4a8a48', INK = '#2a2a28', WOOD = '#5a3a1a';
    /* 立放木托/架 */
    d.box(-0.45, -0.2, 0, 0.45, 0.2, 0.12, WOOD, { line: shade(WOOD, 0.5), west: shade(WOOD, 0.78), top: shade(WOOD, 1.08) });
    d.box(-0.08, -0.08, 0.1, 0.08, 0.08, 0.55, BAM, { line: BAM_D, west: shade(BAM, 0.78), top: BAM_L });
    /* 菱形/燕形主骨架（十字竹骨） */
    d.box(-0.85, -0.04, 0.9, 0.85, 0.04, 1.05, BAM, { line: BAM_D, west: shade(BAM, 0.8), top: BAM_L });
    d.box(-0.05, -0.04, 0.5, 0.05, 0.04, 1.85, BAM, { line: BAM_D, west: shade(BAM, 0.8), top: BAM_L });
    /* 斜撑 */
    d.box(-0.55, -0.03, 0.7, -0.45, 0.03, 1.5, BAM_D, { line: shade(BAM_D, 0.6), top: BAM });
    d.box(0.45, -0.03, 0.7, 0.55, 0.03, 1.5, BAM_D, { line: shade(BAM_D, 0.6), top: BAM });
    /* 彩面纸（红主面） */
    d.box(-0.75, -0.06, 0.75, 0.75, 0.06, 1.55, RED, { line: RED_D, west: shade(RED, 0.85), top: shade(RED, 1.1) });
    /* 中心纹/眼睛暗示（燕形可辨认） */
    d.box(-0.22, -0.07, 1.05, 0.22, 0.07, 1.35, CREAM, { line: shade(CREAM, 0.6), top: shade(CREAM, 1.08) });
    d.box(-0.14, -0.075, 1.15, -0.04, 0.075, 1.28, INK, { line: false, noW: true, noS: true });
    d.box(0.04, -0.075, 1.15, 0.14, 0.075, 1.28, INK, { line: false, noW: true, noS: true });
    /* 翼尖色块 */
    d.box(-0.85, -0.05, 0.85, -0.55, 0.05, 1.15, BLUE, { line: shade(BLUE, 0.5), west: shade(BLUE, 0.82), top: shade(BLUE, 1.1) });
    d.box(0.55, -0.05, 0.85, 0.85, 0.05, 1.15, BLUE, { line: shade(BLUE, 0.5), west: shade(BLUE, 0.82), top: shade(BLUE, 1.1) });
    d.box(-0.35, -0.05, 1.5, 0.35, 0.05, 1.75, GOLD, { line: shade(GOLD, 0.55), top: shade(GOLD, 1.15) });
    /* 尾穗 */
    d.box(-0.08, -0.04, 0.35, 0.08, 0.04, 0.7, GREEN, { line: shade(GREEN, 0.5), top: shade(GREEN, 1.1) });
    d.box(-0.2, -0.03, 0.25, -0.05, 0.03, 0.55, RED, { line: RED_D, top: shade(RED, 1.1) });
    d.box(0.05, -0.03, 0.25, 0.2, 0.03, 0.55, BLUE, { line: shade(BLUE, 0.5), top: shade(BLUE, 1.1) });
    /* 描金边 */
    d.seg([-0.7, -0.055, 0.8], [0.7, -0.055, 0.8], shade(GOLD, 0.9));
    d.seg([-0.7, -0.055, 1.5], [0.7, -0.055, 1.5], shade(GOLD, 0.85));
    d.QS(-0.15, -0.04, 1.15, 0.15, 1.3, shade(CREAM, 1.2));
  }
  function paintStallHuotan(d) {
    const WOOD = '#5a3a22', WOOD_D = '#2a160c', CLOTH = '#c85038', CLOTH2 = '#a03828';
    const BOARD = '#7a5a38', CREAM = '#e8d8b8', JAR = '#6a8a58', FRUIT = '#d87838', BAG = '#c8b070';
    for (const [dx, dy] of [[-0.85, -0.45], [0.85, -0.45], [-0.85, 0.45], [0.85, 0.45]]) {
      d.box(dx - 0.06, dy - 0.06, 0, dx + 0.06, dy + 0.06, 2.15, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: shade(WOOD, 1.08) });
    }
    d.box(-0.92, -0.52, 2.05, 0.92, 0.52, 2.22, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.1) });
    d.box(-1.05, -0.6, 1.85, 1.05, 0.55, 2.1, CLOTH, { line: shade(CLOTH, 0.5), west: CLOTH2, top: shade(CLOTH, 1.12) });
    for (let x = -0.9; x <= 0.9; x += 0.3) d.seg([x, -0.62, 1.9], [x, -0.62, 2.05], shade(CLOTH2, 0.85));
    d.QS(-0.7, -0.58, 1.92, 0.7, 2.05, shade(CLOTH, 1.15));
    d.box(-0.95, -0.5, 0.85, 0.95, 0.5, 1.05, BOARD, { line: WOOD_D, west: shade(BOARD, 0.8), top: shade(BOARD, 1.08) });
    d.box(-0.9, -0.45, 0.55, 0.9, 0.45, 0.88, WOOD, { line: WOOD_D, west: shade(WOOD, 0.75), top: shade(WOOD, 1.02) });
    d.box(-0.7, -0.35, 1.05, -0.35, 0.0, 1.45, JAR, { line: shade(JAR, 0.5), west: shade(JAR, 0.78), top: shade(JAR, 1.1) });
    d.box(-0.25, -0.3, 1.05, 0.15, 0.15, 1.38, FRUIT, { line: shade(FRUIT, 0.5), west: shade(FRUIT, 0.8), top: '#e89850' });
    d.box(0.25, -0.35, 1.05, 0.7, 0.1, 1.42, BAG, { line: shade(BAG, 0.5), west: shade(BAG, 0.8), top: CREAM });
    d.box(-0.15, 0.1, 1.05, 0.35, 0.4, 1.32, '#8a4a2a', { line: WOOD_D, west: shade('#8a4a2a', 0.8), top: '#c87040' });
    d.box(-0.08, -0.62, 1.55, 0.08, -0.55, 1.9, CLOTH2, { line: shade(CLOTH2, 0.5), top: shade(CLOTH, 1.1) });
    d.QS(-0.1, -0.61, 1.5, 0.1, 1.58, '#c8a040');
  }
  /** 货架：木格层架 + 坛罐布匹货堆（店侧/宅前空地） */
  function paintRackHuojia(d) {
    const WOOD = '#5a3a22', WOOD_D = '#2a160c', BOARD = '#7a5a38';
    const JAR = '#6a7a58', JAR2 = '#8a5a3a', CLOTH = '#c8b898', BLUE = '#3a5a78', RED = '#a83830';
    for (const dx of [-0.7, 0.7]) {
      d.box(dx - 0.07, -0.28, 0, dx + 0.07, 0.28, 2.55, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: shade(WOOD, 1.08) });
    }
    d.box(-0.78, -0.32, 2.4, 0.78, 0.32, 2.55, WOOD, { line: WOOD_D, west: shade(WOOD, 0.8), top: shade(WOOD, 1.1) });
    for (const z of [0.35, 0.95, 1.55, 2.15]) {
      d.box(-0.72, -0.3, z, 0.72, 0.3, z + 0.1, BOARD, { line: WOOD_D, west: shade(BOARD, 0.8), top: shade(BOARD, 1.08) });
    }
    d.box(-0.68, 0.22, 0.4, 0.68, 0.3, 2.4, shade(WOOD, 0.92), { line: WOOD_D, west: shade(WOOD, 0.7), top: shade(WOOD, 1.05) });
    d.box(-0.55, -0.2, 0.45, -0.2, 0.15, 0.9, JAR, { line: shade(JAR, 0.5), west: shade(JAR, 0.78), top: shade(JAR, 1.1) });
    d.box(-0.05, -0.18, 0.45, 0.35, 0.18, 0.85, JAR2, { line: shade(JAR2, 0.5), west: shade(JAR2, 0.8), top: shade(JAR2, 1.08) });
    d.box(0.4, -0.15, 0.45, 0.62, 0.15, 0.88, RED, { line: shade(RED, 0.5), top: shade(RED, 1.1) });
    d.box(-0.6, -0.22, 1.05, -0.1, 0.18, 1.45, CLOTH, { line: shade(CLOTH, 0.55), west: shade(CLOTH, 0.85), top: '#f0e8d0' });
    d.box(0.0, -0.2, 1.05, 0.55, 0.18, 1.48, BLUE, { line: shade(BLUE, 0.5), west: shade(BLUE, 0.8), top: shade(BLUE, 1.12) });
    d.box(-0.5, -0.18, 1.65, -0.05, 0.15, 2.05, JAR2, { line: shade(JAR2, 0.5), west: shade(JAR2, 0.78), top: '#c87848' });
    d.box(0.1, -0.2, 1.65, 0.55, 0.18, 2.08, CLOTH, { line: shade(CLOTH, 0.55), west: shade(CLOTH, 0.85), top: '#fff0d8' });
    for (const x of [-0.25, 0.25]) d.seg([x, -0.3, 0.45], [x, -0.3, 2.35], shade(WOOD, 0.9));
  }
  /** 晾晒杆：竹竿架 + 横竿 + 衣物布巾（宅前/巷口；市井感） */
  function paintPoleLiangshai(d) {
    const BAM = '#8a6a38', BAM_D = '#5a4020';
    const CLOTH_R = '#c85038', CLOTH_B = '#3a5a88', CLOTH_C = '#e8d8b0', CLOTH_G = '#4a7a58';
    for (const dx of [-1.15, 1.15]) {
      d.box(dx - 0.05, -0.05, 0, dx + 0.05, 0.05, 2.85, BAM, { line: BAM_D, west: shade(BAM, 0.78), top: shade(BAM, 1.1) });
      d.box(dx - 0.04, -0.35, 0, dx + 0.04, -0.05, 1.2, BAM, { line: BAM_D, west: shade(BAM, 0.75), top: shade(BAM, 1.05) });
      d.box(dx - 0.04, 0.05, 0, dx + 0.04, 0.35, 1.15, BAM, { line: BAM_D, west: shade(BAM, 0.75), top: shade(BAM, 1.05) });
    }
    d.box(-1.2, -0.04, 2.55, 1.2, 0.04, 2.68, BAM, { line: BAM_D, west: shade(BAM, 0.8), top: shade(BAM, 1.1) });
    d.box(-1.2, -0.04, 2.15, 1.2, 0.04, 2.28, BAM, { line: BAM_D, west: shade(BAM, 0.8), top: shade(BAM, 1.08) });
    const clothes = [
      [-0.9, CLOTH_R, 1.35], [-0.45, CLOTH_B, 1.55], [0.0, CLOTH_C, 1.25],
      [0.45, CLOTH_G, 1.5], [0.85, CLOTH_R, 1.4],
    ];
    for (const [cx, col, h] of clothes) {
      d.box(cx - 0.18, -0.02, 2.28 - h, cx + 0.18, 0.06, 2.55, col, { line: shade(col, 0.5), west: shade(col, 0.82), top: shade(col, 1.12) });
      d.QS(-0.03, cx - 0.16, 2.28 - h + 0.1, cx + 0.16, 2.5, shade(col, 1.15));
      for (let k = 0; k < 3; k++) {
        const zz = 2.28 - h + 0.2 + k * 0.28;
        if (zz < 2.5) d.seg([cx - 0.15, -0.03, zz], [cx + 0.15, -0.03, zz], shade(col, 0.75));
      }
    }
    for (const [cx, col] of [[-0.7, CLOTH_C], [0.2, CLOTH_B], [0.7, CLOTH_G]]) {
      d.box(cx - 0.14, -0.02, 1.55, cx + 0.14, 0.05, 2.15, col, { line: shade(col, 0.5), west: shade(col, 0.85), top: shade(col, 1.1) });
    }
  }

  
  /* Site230：香炉 — 三足青铜炉+炉盖+香炷轻烟（影壁前/小龛/供案；≠site222 stone_lu 门侧小石炉） */
  function paintPropXianglu(d) {
    const BRZ = '#6a5a38', BRZ_D = '#3a2e18', BRZ_L = '#9a8850', GOLD = '#c8a040';
    const ASH = '#4a4030', SMOKE = 'rgba(200,200,190,0.45)', RED = '#a83828';
    // 三足
    for (const [x, y] of [[-0.28, -0.18], [0.28, -0.18], [0, 0.28]]) {
      d.box(x - 0.07, y - 0.07, 0, x + 0.07, y + 0.07, 0.28, BRZ, { line: BRZ_D, west: shade(BRZ, 0.78), top: shade(BRZ, 0.95) });
      d.box(x - 0.05, y - 0.05, 0.28, x + 0.05, y + 0.05, 0.42, shade(BRZ, 0.92), { line: BRZ_D, west: shade(BRZ, 0.75), top: BRZ_L });
    }
    // 炉身收腰
    d.box(-0.38, -0.32, 0.42, 0.38, 0.32, 0.55, BRZ, { line: BRZ_D, west: shade(BRZ, 0.8), top: shade(BRZ, 0.95) });
    d.box(-0.42, -0.36, 0.55, 0.42, 0.36, 0.78, shade(BRZ, 1.02), { line: BRZ_D, west: shade(BRZ, 0.82), top: BRZ_L });
    d.box(-0.36, -0.3, 0.78, 0.36, 0.3, 0.95, BRZ, { line: BRZ_D, west: shade(BRZ, 0.78), top: shade(BRZ, 1.05) });
    // 炉沿回纹块 + 金钉
    d.box(-0.48, -0.4, 0.95, 0.48, 0.4, 1.08, BRZ_L, { line: BRZ_D, west: shade(BRZ, 0.85), top: GOLD });
    for (const x of [-0.32, 0, 0.32]) {
      d.QS(-0.38, x - 0.04, 1.0, x + 0.04, 1.06, GOLD);
      d.QS(0.32, x - 0.04, 1.0, x + 0.04, 1.06, GOLD);
    }
    // 炉盖 + 纽
    d.box(-0.28, -0.24, 1.08, 0.28, 0.24, 1.22, shade(BRZ, 1.05), { line: BRZ_D, west: shade(BRZ, 0.8), top: BRZ_L });
    d.box(-0.1, -0.1, 1.22, 0.1, 0.1, 1.42, GOLD, { line: shade(GOLD, 0.55), west: shade(GOLD, 0.85), top: shade(GOLD, 1.15) });
    // 香灰 + 三炷香
    d.box(-0.22, -0.18, 1.05, 0.22, 0.18, 1.12, ASH, { line: false, noW: true, noS: true });
    for (const x of [-0.12, 0, 0.12]) {
      d.box(x - 0.025, -0.02, 1.12, x + 0.025, 0.02, 1.55, RED, { line: shade(RED, 0.5), top: '#e85840' });
      d.QS(-0.04, x - 0.03, 1.55, x + 0.03, 1.62, '#ffc878');
    }
    // 轻烟（半透明色块，非线稿）
    d.QS(-0.18, -0.1, 1.62, 0.12, 1.85, SMOKE);
    d.QS(0.02, 0.0, 1.78, 0.18, 2.05, 'rgba(210,210,200,0.35)');
  }

  /* Site230：烛台 — 铜座+烛杆+烛泪+烛火（案几/龛侧；密实 kitbash） */
  function paintPropZhutai(d) {
    const BRZ = '#6a5a38', BRZ_D = '#3a2e18', BRZ_L = '#9a8850', GOLD = '#c8a040';
    const WAX = '#e8d8b0', WAX_D = '#c8b888', FLAME = '#ff9830', FLAME2 = '#ffe060';
    // 宽底座
    d.box(-0.32, -0.28, 0, 0.32, 0.28, 0.12, BRZ, { line: BRZ_D, west: shade(BRZ, 0.78), top: shade(BRZ, 0.95) });
    d.box(-0.26, -0.22, 0.12, 0.26, 0.22, 0.28, shade(BRZ, 1.02), { line: BRZ_D, west: shade(BRZ, 0.8), top: BRZ_L });
    // 束腰柱
    d.box(-0.1, -0.1, 0.28, 0.1, 0.1, 0.85, BRZ, { line: BRZ_D, west: shade(BRZ, 0.78), top: shade(BRZ, 1.05) });
    d.box(-0.14, -0.14, 0.5, 0.14, 0.14, 0.62, GOLD, { line: shade(GOLD, 0.55), west: shade(GOLD, 0.85), top: shade(GOLD, 1.12) });
    // 托盘
    d.box(-0.22, -0.2, 0.85, 0.22, 0.2, 0.98, BRZ_L, { line: BRZ_D, west: shade(BRZ, 0.85), top: GOLD });
    // 蜡烛 + 烛泪
    d.box(-0.08, -0.08, 0.98, 0.08, 0.08, 1.55, WAX, { line: WAX_D, west: shade(WAX, 0.88), top: shade(WAX, 1.08) });
    d.box(-0.12, -0.06, 1.0, -0.06, 0.06, 1.18, shade(WAX, 0.92), { line: false, noW: true, noS: true });
    d.box(0.04, -0.1, 1.05, 0.14, 0.02, 1.22, shade(WAX, 0.9), { line: false, noW: true, noS: true });
    // 烛芯 + 火焰
    d.box(-0.02, -0.02, 1.55, 0.02, 0.02, 1.62, '#2a2010', { line: false, noW: true, noS: true });
    d.box(-0.06, -0.05, 1.62, 0.06, 0.05, 1.82, FLAME, { line: shade(FLAME, 0.6), west: '#e86820', top: FLAME2 });
    d.QS(-0.04, -0.03, 1.78, 0.03, 1.95, FLAME2);
  }

  /* Site230：小供案/条几 — 木案+牙板+供品垫（宅门内/影壁前/亭侧；≠大庙殿布局） */
  function paintPropGonganS(d) {
    const WOOD = '#5a3a22', WOOD_D = '#2a160c', WOOD_L = '#8a6a42', GOLD = '#c8a040';
    const CLOTH = '#a83828', CLOTH2 = '#781820', CREAM = '#e8d8b8', CERAM = '#6a7a58';
    // 四腿
    for (const [x, y] of [[-0.85, -0.32], [0.85, -0.32], [-0.85, 0.32], [0.85, 0.32]]) {
      d.box(x - 0.07, y - 0.07, 0, x + 0.07, y + 0.07, 0.72, WOOD, { line: WOOD_D, west: shade(WOOD, 0.78), top: shade(WOOD, 1.05) });
      for (let z = 0.15; z < 0.7; z += 0.18) d.seg([x - 0.08, y - 0.08, z], [x + 0.08, y - 0.08, z], shade(WOOD, 0.7));
    }
    // 牙板
    d.box(-0.88, -0.35, 0.55, 0.88, 0.35, 0.68, shade(WOOD, 0.95), { line: WOOD_D, west: shade(WOOD, 0.75), top: WOOD_L });
    d.box(-0.7, -0.28, 0.48, -0.55, 0.28, 0.55, GOLD, { line: shade(GOLD, 0.5), top: shade(GOLD, 1.1) });
    d.box(0.55, -0.28, 0.48, 0.7, 0.28, 0.55, GOLD, { line: shade(GOLD, 0.5), top: shade(GOLD, 1.1) });
    // 案面
    d.box(-0.95, -0.4, 0.72, 0.95, 0.4, 0.88, WOOD_L, { line: WOOD_D, west: shade(WOOD, 0.82), top: shade(WOOD_L, 1.08) });
    for (let x = -0.7; x < 0.75; x += 0.28) d.seg([x, -0.38, 0.88], [x, 0.38, 0.88], shade(WOOD, 0.72));
    // 红呢垫
    d.box(-0.7, -0.28, 0.88, 0.7, 0.28, 0.95, CLOTH, { line: CLOTH2, west: shade(CLOTH, 0.8), top: shade(CLOTH, 1.12) });
    // 供品：果盘/瓷瓶/香盒
    d.box(-0.45, -0.15, 0.95, -0.15, 0.15, 1.18, CERAM, { line: shade(CERAM, 0.5), west: shade(CERAM, 0.78), top: shade(CERAM, 1.1) });
    d.box(0.1, -0.18, 0.95, 0.45, 0.18, 1.12, CREAM, { line: shade(CREAM, 0.6), west: shade(CREAM, 0.85), top: '#f0e8d0' });
    d.box(-0.08, -0.12, 0.95, 0.08, 0.12, 1.08, GOLD, { line: shade(GOLD, 0.55), top: shade(GOLD, 1.15) });
    d.QS(-0.2, -0.5, 1.0, -0.3, 1.05, '#d87838');
    d.QS(-0.2, 0.25, 1.0, 0.4, 1.05, '#e89850');
  }


  const MODULES = [
    { key: 'wall_plaster_S', geo: [0, -0.05, 0, 1.5, 0.1, 2.4], paint: (d) => paintWallPlasterS(d, 1.5, 2.4), mw: 1.5, mh: 2.4, face: 'S' },
    { key: 'wall_brick_S', geo: [0, -0.05, 0, 1.5, 0.1, 1.2], paint: (d) => paintWallBrickS(d, 1.5, 1.2), mw: 1.5, mh: 1.2, face: 'S' },
    { key: 'wall_plaster_W', geo: [-0.05, 0, 0, 0.1, 1.5, 2.4], paint: (d) => paintWallW(d, 1.5, 2.4, false), mw: 1.5, mh: 2.4, face: 'W' },
    { key: 'wall_brick_W', geo: [-0.05, 0, 0, 0.1, 1.5, 1.2], paint: (d) => paintWallW(d, 1.5, 1.2, true), mw: 1.5, mh: 1.2, face: 'W' },
    { key: 'win_grid_S', geo: [0, -0.05, 0, 1.0, 0.1, 1.4], paint: (d) => paintWin(d, 1.0, 1.4, 'grid'), mw: 1.0, mh: 1.4, face: 'S' },
    { key: 'win_diamond_S', geo: [0, -0.05, 0, 1.0, 0.1, 1.4], paint: (d) => paintWin(d, 1.0, 1.4, 'diamond'), mw: 1.0, mh: 1.4, face: 'S' },
    { key: 'win_bubujin_S', geo: [0, -0.05, 0, 1.0, 0.1, 1.4], paint: (d) => paintWin(d, 1.0, 1.4, 'bubujin'), mw: 1.0, mh: 1.4, face: 'S' },
    { key: 'win_wanzi_S', geo: [0, -0.05, 0, 1.0, 0.1, 1.4], paint: (d) => paintWin(d, 1.0, 1.4, 'wanzi'), mw: 1.0, mh: 1.4, face: 'S' },
    { key: 'win_vbars_S', geo: [0, -0.05, 0, 1.0, 0.1, 0.6], paint: (d) => paintWin(d, 1.0, 0.6, 'vbars'), mw: 1.0, mh: 0.6, face: 'S' },
    { key: 'door_geshan_S', geo: [0, -0.05, 0, 0.7, 0.1, 2.5], paint: (d) => paintGeshanLeaf(d, 0.7, 2.5, { style: 'grid' }), mw: 0.7, mh: 2.5, face: 'S' },
    { key: 'door_geshan_carved_S', geo: [0, -0.05, 0, 0.7, 0.1, 2.5], paint: (d) => paintGeshanLeaf(d, 0.7, 2.5, { carved: true, style: 'diamond' }), mw: 0.7, mh: 2.5, face: 'S' },
    { key: 'door_ban_S', geo: [0, -0.05, 0, 0.85, 0.1, 2.5], paint: (d) => paintBanDoor(d, 0.85, 2.5), mw: 0.85, mh: 2.5, face: 'S' },
    { key: 'threshold_S', geo: [0, -0.05, 0, 1.0, 0.1, 0.2], paint: (d) => paintThreshold(d, 1.0), mw: 1.0, mh: 0.2, face: 'S' },
    /* Site203 lattice densify */
    { key: 'lattice_geshan_S', geo: [0, -0.05, 0, 1.1, 0.1, 1.0], paint: (d) => paintLatticeGeshan(d, 1.1, 1.0), mw: 1.1, mh: 1.0, face: 'S' },
    { key: 'window_huachuang_S', geo: [0, -0.05, 0, 1.1, 0.1, 1.5], paint: (d) => paintHuachuang(d, 1.1, 1.5), mw: 1.1, mh: 1.5, face: 'S' },
    { key: 'door_geshan_bubujin_S', geo: [0, -0.05, 0, 0.7, 0.1, 2.5], paint: (d) => paintGeshanLeaf(d, 0.7, 2.5, { style: 'bubujin' }), mw: 0.7, mh: 2.5, face: 'S' },
    { key: 'sill_kanchuang_S', geo: [0, -0.05, 0, 1.2, 0.1, 1.6], paint: (d) => paintKanchuang(d, 1.2, 1.6), mw: 1.2, mh: 1.6, face: 'S' },
    { key: 'column_red', geo: [-0.2, -0.2, 0, 0.2, 0.2, 3.5], paint: (d) => paintColumn(d, 3.5, 0.15), mw: 0.4, mh: 3.5, face: 'C', origin: 'center' },
    { key: 'plaque_frame', geo: [-1.2, -0.1, -0.55, 1.2, 0.1, 0.55], paint: (d) => paintPlaqueFrame(d, 2.0, 0.7, { style: 'dark' }), mw: 2.0, mh: 0.7, face: 'S', origin: 'center' },
    { key: 'plaque_wood', geo: [-1.2, -0.1, -0.55, 1.2, 0.1, 0.55], paint: (d) => paintPlaqueFrame(d, 2.0, 0.7, { style: 'wood' }), mw: 2.0, mh: 0.7, face: 'S', origin: 'center' },
    { key: 'vsign_board', geo: [-0.35, -0.08, -1.1, 0.35, 0.08, 0.15], paint: (d) => paintVsignBoard(d, 0.5, 1.9), mw: 0.5, mh: 2.0, face: 'S', origin: 'top' },
    { key: 'banner_red', geo: [-0.3, -0.05, -1.7, 0.3, 0.05, 0.1], paint: (d) => paintBanner(d, 0.55, 1.5, '#c8322c'), mw: 0.55, mh: 1.7, face: 'S', origin: 'top' },
    { key: 'banner_green', geo: [-0.3, -0.05, -1.7, 0.3, 0.05, 0.1], paint: (d) => paintBanner(d, 0.55, 1.5, '#2f6a58'), mw: 0.55, mh: 1.7, face: 'S', origin: 'top' },
    { key: 'banner_blue', geo: [-0.3, -0.05, -1.7, 0.3, 0.05, 0.1], paint: (d) => paintBanner(d, 0.55, 1.5, '#2f4f86'), mw: 0.55, mh: 1.7, face: 'S', origin: 'top' },
    { key: 'banner_cream', geo: [-0.3, -0.05, -1.7, 0.3, 0.05, 0.1], paint: (d) => paintBanner(d, 0.55, 1.5, '#e8dcc0'), mw: 0.55, mh: 1.7, face: 'S', origin: 'top' },
    { key: 'lantern', geo: [-0.35, -0.35, -0.9, 0.35, 0.35, 0.1], paint: (d) => paintLantern(d, 0.22), mw: 0.7, mh: 1.0, face: 'C', origin: 'top' },
    { key: 'tile_eave_S', geo: [0, -0.08, -0.12, 1.0, 0.05, 0.38], paint: (d) => paintTileStripS(d, 1.0), mw: 1.0, mh: 0.38, face: 'S' },
    { key: 'tile_course_S', geo: [0, -0.05, 0, 1.0, 0.05, 0.22], paint: (d) => paintTileCourseS(d, 1.0), mw: 1.0, mh: 0.22, face: 'S' },
    { key: 'tile_ridge_S', geo: [0, -0.12, 0, 1.0, 0.12, 0.28], paint: (d) => paintTileRidgeS(d, 1.0), mw: 1.0, mh: 0.28, face: 'S' },
    { key: 'tile_wadang_S', geo: [0, -0.08, -0.05, 0.9, 0.05, 0.28], paint: (d) => paintWadangS(d, 0.9), mw: 0.9, mh: 0.28, face: 'S' },
    { key: 'tile_drip_S', geo: [0, -0.1, -0.12, 0.9, 0.05, 0.32], paint: (d) => paintDripS(d, 0.9), mw: 0.9, mh: 0.32, face: 'S' },
    { key: 'chiwen_S', geo: [0, -0.2, 0, 0.85, 0.15, 1.1], paint: (d) => paintChiwenS(d, 0.85), mw: 0.85, mh: 1.1, face: 'S' },
    { key: 'chiwen_flip_S', geo: [0, -0.2, 0, 0.85, 0.15, 1.1], paint: (d) => paintChiwenS(d, 0.85, { flip: true }), mw: 0.85, mh: 1.1, face: 'S' },
    /* Site205 roof-tiles densify */
    { key: 'tile_wadang', geo: [0, -0.08, -0.05, 0.95, 0.05, 0.3], paint: (d) => paintWadangDenseS(d, 0.95), mw: 0.95, mh: 0.3, face: 'S' },
    { key: 'tile_dishui', geo: [0, -0.1, -0.14, 0.95, 0.05, 0.34], paint: (d) => paintDishuiS(d, 0.95), mw: 0.95, mh: 0.34, face: 'S' },
    { key: 'tile_walong', geo: [0, -0.06, 0, 1.0, 0.05, 0.28], paint: (d) => paintWalongS(d, 1.0), mw: 1.0, mh: 0.28, face: 'S' },
    { key: 'eave_yankou', geo: [0, -0.1, -0.1, 1.05, 0.06, 0.32], paint: (d) => paintYankouS(d, 1.05), mw: 1.05, mh: 0.32, face: 'S' },
    /* Site207 rail/queti/gualuo/baluster */
    { key: 'rail_xunzhang', geo: [0, -0.08, 0, 1.4, 0.12, 1.3], paint: (d) => paintRailXunzhang(d, 1.4), mw: 1.4, mh: 1.3, face: 'S' },
    { key: 'ornament_queti', geo: [0, -0.22, 0, 1.1, 0.3, 0.82], paint: (d) => paintOrnamentQueti(d), mw: 1.1, mh: 0.82, face: 'S' },
    { key: 'hanging_gualuo', geo: [0, -0.08, 0, 1.6, 0.12, 0.85], paint: (d) => paintHangingGualuo(d, 1.6, 0.85), mw: 1.6, mh: 0.85, face: 'S' },
    { key: 'baluster_xiaozhu', geo: [-0.18, -0.18, 0, 0.18, 0.18, 1.42], paint: (d) => paintBalusterXiaozhu(d), mw: 0.36, mh: 1.42, face: 'C', origin: 'center' },
    /* Site209 door hardware */
    { key: 'door_mending', geo: [0, -0.08, 0, 1.0, 0.12, 2.2], paint: (d) => paintDoorMending(d, 1.0, 2.2), mw: 1.0, mh: 2.2, face: 'S' },
    { key: 'knocker_pushou', geo: [-0.32, -0.16, -0.25, 0.32, 0.14, 0.58], paint: (d) => paintKnockerPushou(d), mw: 0.64, mh: 0.83, face: 'S', origin: 'center' },
    { key: 'sill_menkan', geo: [0, -0.2, 0, 1.4, 0.24, 0.3], paint: (d) => paintSillMenkan(d, 1.4), mw: 1.4, mh: 0.3, face: 'S' },
    { key: 'stone_baogu', geo: [-0.45, -0.35, 0, 0.45, 0.48, 1.22], paint: (d) => paintStoneBaogu(d), mw: 0.9, mh: 1.22, face: 'C', origin: 'center' },
    { key: 'dougong', geo: [-0.85, -0.7, 0, 0.85, 0.35, 0.55], paint: (d) => paintDougong(d), mw: 1.7, mh: 0.55, face: 'S', origin: 'center' },
    { key: 'dougong_large', geo: [-1.1, -0.85, 0, 1.1, 0.35, 0.7], paint: (d) => paintDougong(d, { large: true }), mw: 2.2, mh: 0.7, face: 'S', origin: 'center' },
    { key: 'efang_unit', geo: [0, -0.1, 0, 2.8, 0.25, 0.4], paint: (d) => paintEfangUnit(d, 2.8), mw: 2.8, mh: 0.4, face: 'S' },
    /* Site198 wall-merlon */
    { key: 'city_brick_S', geo: [0, -0.05, 0, 1.6, 0.1, 1.8], paint: (d) => paintCityBrickS(d, 1.6, 1.8), mw: 1.6, mh: 1.8, face: 'S' },
    { key: 'city_brick_W', geo: [-0.05, 0, 0, 0.1, 1.6, 1.8], paint: (d) => paintCityBrickW(d, 1.6, 1.8), mw: 1.6, mh: 1.8, face: 'W' },
    { key: 'city_stone_S', geo: [0, -0.05, 0, 1.6, 0.1, 1.2], paint: (d) => paintCityStoneS(d, 1.6, 1.2), mw: 1.6, mh: 1.2, face: 'S' },
    { key: 'merlon_S', geo: [0, -0.02, 0, 1.05, 0.55, 1.76], paint: (d) => paintMerlon(d, { w: 1.05, d: 0.55, h: 1.7 }), mw: 1.05, mh: 1.7, face: 'S' },
    { key: 'crenel_S', geo: [0, -0.02, 0, 0.55, 0.55, 1.04], paint: (d) => paintCrenel(d, { w: 0.55, d: 0.55, h: 1.0 }), mw: 0.55, mh: 1.0, face: 'S' },
    { key: 'parapet_S', geo: [0, -0.02, 0, 1.6, 0.6, 1.2], paint: (d) => paintParapet(d, { w: 1.6, d: 0.6, h: 1.1 }), mw: 1.6, mh: 1.1, face: 'S' },
    { key: 'walk_top', geo: [0, 0, 0, 1.6, 1.6, 0.08], paint: (d) => paintWalkTop(d, 1.6, 1.6), mw: 1.6, mh: 1.6, face: 'C' },
    /* Site202 paving */
    { key: 'pave_fangzhuan', geo: [0, 0, 0, 1.6, 1.6, 0.06], paint: (d) => paintPaveFangzhuan(d, 1.6, 1.6), mw: 1.6, mh: 1.6, face: 'C' },
    { key: 'pave_tiaoshi', geo: [0, 0, 0, 1.6, 1.6, 0.06], paint: (d) => paintPaveTiaoshi(d, 1.6, 1.6), mw: 1.6, mh: 1.6, face: 'C' },
    { key: 'pave_xiewen', geo: [0, 0, 0, 1.6, 1.6, 0.06], paint: (d) => paintPaveXiewen(d, 1.6, 1.6), mw: 1.6, mh: 1.6, face: 'C' },
    { key: 'drain_gutter', geo: [0, 0, -0.05, 0.7, 0.7, 0.18], paint: (d) => paintDrainGutter(d), mw: 0.7, mh: 0.7, face: 'C' },
    { key: 'curb_stone', geo: [0, 0, 0, 0.95, 0.32, 0.25], paint: (d) => paintCurbStone(d), mw: 0.95, mh: 0.32, face: 'C' },
    /* Site204 street props */
    { key: 'prop_shideng', geo: [-0.55, -0.55, 0, 0.55, 0.55, 2.2], paint: (d) => paintPropShideng(d), mw: 1.1, mh: 2.2, face: 'C', origin: 'center' },
    { key: 'prop_shiteng', geo: [-0.8, -0.4, 0, 0.8, 0.4, 0.6], paint: (d) => paintPropShiteng(d), mw: 1.6, mh: 0.6, face: 'C', origin: 'center' },
    { key: 'prop_huagang', geo: [-0.5, -0.5, 0, 0.5, 0.5, 1.4], paint: (d) => paintPropHuagang(d), mw: 1.0, mh: 1.4, face: 'C', origin: 'center' },
    { key: 'prop_lamp_pole', geo: [-0.35, -1.1, 0, 0.35, 0.35, 3.8], paint: (d) => paintPropLampPole(d), mw: 0.7, mh: 3.8, face: 'C', origin: 'center' },
    /* Site206 gable/brick/chitou/cap */
    { key: 'wall_shangqiang', geo: [0, -0.05, 0, 1.2, 0.1, 2.6], paint: (d) => paintShangqiang(d, 1.2, 2.6), mw: 1.2, mh: 2.6, face: 'S' },
    { key: 'brick_qingshui', geo: [0, -0.05, 0, 1.2, 0.1, 1.4], paint: (d) => paintQingshuiBrick(d, 1.2, 1.4), mw: 1.2, mh: 1.4, face: 'S' },
    { key: 'ornament_chitou', geo: [0, -0.05, 0, 0.7, 0.55, 1.0], paint: (d) => paintChitou(d, { w: 0.7, d: 0.55, h: 0.95 }), mw: 0.7, mh: 0.95, face: 'S' },
    { key: 'wall_cap', geo: [0, 0, 0, 1.2, 0.45, 0.32], paint: (d) => paintWallCap(d, 1.2, 0.45), mw: 1.2, mh: 0.45, face: 'C' },
    /* Site210 soft decor: qifan/weiman/liusu/hang */
    { key: 'banner_qifan', geo: [-0.3, -0.08, -1.7, 0.3, 0.08, 0.12], paint: (d) => paintBannerQifan(d), mw: 0.55, mh: 1.75, face: 'S', origin: 'top' },
    { key: 'curtain_weiman', geo: [0, -0.1, 0, 2.2, 0.2, 1.0], paint: (d) => paintCurtainWeiman(d, 2.2), mw: 2.2, mh: 1.0, face: 'S' },
    { key: 'tassel_liusu', geo: [-0.28, -0.12, -0.15, 0.28, 0.12, 1.0], paint: (d) => paintTasselLiusu(d), mw: 0.56, mh: 1.15, face: 'S', origin: 'top' },
    { key: 'hang_ornament', geo: [-0.22, -0.1, 0, 0.22, 0.1, 1.2], paint: (d) => paintHangOrnament(d), mw: 0.44, mh: 1.2, face: 'S', origin: 'top' },
    /* Site212 yingbi/zhaobi/huaxin/base */
    { key: 'wall_yingbi', geo: [0, -0.22, 0, 2.4, 0.28, 2.8], paint: (d) => paintWallYingbi(d, 2.4, 2.8), mw: 2.4, mh: 2.8, face: 'S' },
    { key: 'wall_zhaobi', geo: [0, -0.24, 0, 2.8, 0.3, 3.2], paint: (d) => paintWallZhaobi(d, 2.8, 3.2), mw: 2.8, mh: 3.2, face: 'S' },
    { key: 'brick_huaxin', geo: [-0.55, -0.14, -0.55, 0.55, 0.14, 0.55], paint: (d) => paintBrickHuaxin(d), mw: 1.1, mh: 1.1, face: 'S', origin: 'center' },
    { key: 'screen_base', geo: [0, -0.36, 0, 2.6, 0.36, 0.55], paint: (d) => paintScreenBase(d, 2.6), mw: 2.6, mh: 0.55, face: 'S' },
    /* Site214 screens/partitions/moon/frame */
    { key: 'screen_luodizhao', geo: [0, -0.2, 0, 2.6, 0.26, 3.4], paint: (d) => paintScreenLuodizhao(d, 2.6, 3.4), mw: 2.6, mh: 3.4, face: 'S' },
    { key: 'partition_geshan', geo: [0, -0.16, 0, 2.4, 0.22, 2.8], paint: (d) => paintPartitionGeshan(d, 2.4, 2.8), mw: 2.4, mh: 2.8, face: 'S' },
    { key: 'moon_yuedong', geo: [0, -0.18, 0, 2.8, 0.28, 3.0], paint: (d) => paintMoonYuedong(d, 2.8, 3.0), mw: 2.8, mh: 3.0, face: 'S' },
    { key: 'frame_menkuang', geo: [0, -0.22, 0, 2.2, 0.28, 3.2], paint: (d) => paintFrameMenkuang(d, 2.2, 3.2), mw: 2.2, mh: 3.2, face: 'S' },
    /* Site208 caihua beam/efang/dougong/eave */
    { key: 'beam_efang', geo: [0, -0.1, 0, 2.6, 0.25, 0.45], paint: (d) => paintBeamEfang(d, 2.6), mw: 2.6, mh: 0.45, face: 'S' },
    { key: 'caihua_band', geo: [0, -0.08, 0, 2.4, 0.2, 0.3], paint: (d) => paintCaihuaBand(d, 2.4), mw: 2.4, mh: 0.3, face: 'S' },
    { key: 'dougong_block', geo: [-0.8, -0.65, 0, 0.8, 0.32, 0.55], paint: (d) => paintDougongBlock(d), mw: 1.6, mh: 0.55, face: 'S', origin: 'center' },
    { key: 'eave_board', geo: [0, -0.1, 0, 2.2, 0.22, 0.35], paint: (d) => paintEaveBoard(d, 2.2), mw: 2.2, mh: 0.35, face: 'S' },
    /* Site211 platform taiji/tiaotiao/chuidai/taduo */
    { key: 'base_taiji', geo: [0, -0.24, 0, 1.6, 0.24, 1.1], paint: (d) => paintBaseTaiji(d, 1.6, 1.1), mw: 1.6, mh: 1.1, face: 'S' },
    { key: 'step_tiaotiao', geo: [0, -0.3, 0, 1.6, 0.34, 0.3], paint: (d) => paintStepTiaotiao(d, 1.6), mw: 1.6, mh: 0.3, face: 'S' },
    { key: 'ramp_chuidai', geo: [-0.08, -1.5, 0, 0.5, 0.3, 1.22], paint: (d) => paintRampChuidai(d), mw: 0.58, mh: 1.22, face: 'S' },
    { key: 'stair_taduo', geo: [0, -0.3, 0, 1.4, 0.3, 0.34], paint: (d) => paintStairTaduo(d, 1.4), mw: 1.4, mh: 0.34, face: 'S' },
    /* Site213 ridge beasts: chiwen/zoushou/ornament/chuiji */
    { key: 'ridge_chiwen', geo: [0, -0.24, 0, 0.95, 0.18, 1.32], paint: (d) => paintRidgeChiwen(d, 0.95), mw: 0.95, mh: 1.32, face: 'S' },
    { key: 'beast_zoushou', geo: [-0.28, -0.24, 0, 0.28, 0.18, 1.1], paint: (d) => paintBeastZoushou(d), mw: 0.56, mh: 1.1, face: 'S', origin: 'center' },
    { key: 'ridge_ornament', geo: [-0.32, -0.2, 0, 0.32, 0.2, 1.1], paint: (d) => paintRidgeOrnament(d), mw: 0.64, mh: 1.1, face: 'S', origin: 'center' },
    { key: 'hip_chuiji', geo: [0, -0.16, 0, 1.2, 0.16, 0.4], paint: (d) => paintHipChuiji(d, 1.2), mw: 1.2, mh: 0.4, face: 'S' },
    /* Site215 hitching: shuanma/shangma/ganddang/curb_marker */
    { key: 'post_shuanma', geo: [-0.4, -0.4, 0, 0.4, 0.4, 2.55], paint: (d) => paintPostShuanma(d), mw: 0.8, mh: 2.55, face: 'C', origin: 'center' },
    { key: 'stone_shangma', geo: [-0.75, -0.5, 0, 0.75, 0.5, 0.85], paint: (d) => paintStoneShangma(d), mw: 1.5, mh: 0.85, face: 'C', origin: 'center' },
    { key: 'stone_ganddang', geo: [-0.45, -0.3, 0, 0.45, 0.3, 2.0], paint: (d) => paintStoneGanddang(d), mw: 0.9, mh: 2.0, face: 'C', origin: 'center' },
    { key: 'curb_marker', geo: [-0.3, -0.3, 0, 0.3, 0.3, 1.0], paint: (d) => paintCurbMarker(d), mw: 0.6, mh: 1.0, face: 'C', origin: 'center' },
    /* Site216 louwindow: window_lou/wall_huaziang/brick_toukong/lattice_wall */
    { key: 'window_lou', geo: [0, -0.18, 0, 1.8, 0.24, 2.0], paint: (d) => paintWindowLou(d, 1.8, 2.0), mw: 1.8, mh: 2.0, face: 'S' },
    { key: 'wall_huaziang', geo: [0, -0.2, 0, 3.2, 0.28, 2.6], paint: (d) => paintWallHuaziang(d, 3.2, 2.6), mw: 3.2, mh: 2.6, face: 'S' },
    { key: 'brick_toukong', geo: [-0.7, -0.16, -0.7, 0.7, 0.16, 0.7], paint: (d) => paintBrickToukong(d), mw: 1.4, mh: 1.4, face: 'S', origin: 'center' },
    { key: 'lattice_wall', geo: [0, -0.16, 0, 2.4, 0.22, 2.4], paint: (d) => paintLatticeWall(d, 2.4, 2.4), mw: 2.4, mh: 2.4, face: 'S' },
    /* Site217 pavilions: jingting/luting/paifang_s/roof_ting */
    { key: 'pavilion_jingting', geo: [-1.4, -1.4, 0, 1.4, 1.4, 4.0], paint: (d) => paintPavilionJingting(d), mw: 2.8, mh: 4.0, face: 'C', origin: 'center' },
    { key: 'pavilion_luting', geo: [-1.6, -1.3, 0, 1.6, 1.3, 4.0], paint: (d) => paintPavilionLuting(d), mw: 3.2, mh: 4.0, face: 'C', origin: 'center' },
    { key: 'gate_paifang_s', geo: [-1.95, -0.6, 0, 1.95, 0.6, 4.8], paint: (d) => paintGatePaifangS(d), mw: 3.9, mh: 4.8, face: 'C', origin: 'center' },
    { key: 'roof_ting', geo: [-1.45, -1.45, 0, 1.45, 1.45, 1.45], paint: (d) => paintRoofTing(d), mw: 2.9, mh: 1.45, face: 'C', origin: 'center' },
    /* Site218 chuihuamen: gate_chuihua/gate_menlou_s/eave_menzhao/post_menzhu */
    { key: 'gate_chuihua', geo: [-1.8, -0.6, 0, 1.8, 0.6, 4.5], paint: (d) => paintGateChuihua(d), mw: 3.6, mh: 4.5, face: 'C', origin: 'center' },
    { key: 'gate_menlou_s', geo: [-1.6, -0.75, 0, 1.6, 0.75, 4.65], paint: (d) => paintGateMenlouS(d), mw: 3.2, mh: 4.65, face: 'C', origin: 'center' },
    { key: 'eave_menzhao', geo: [-1.45, -0.4, 0, 1.45, 0.5, 2.1], paint: (d) => paintEaveMenzhao(d), mw: 2.9, mh: 2.1, face: 'C', origin: 'center' },
    { key: 'post_menzhu', geo: [-0.45, -0.45, 0, 0.45, 0.45, 2.4], paint: (d) => paintPostMenzhu(d), mw: 0.9, mh: 2.4, face: 'C', origin: 'center' },
    /* Site219 rockery: rock_taihu/rock_dieshi/rock_peak_s/plant_rock_moss */
    { key: 'rock_taihu', geo: [-1.0, -0.8, 0, 1.0, 0.8, 3.65], paint: (d) => paintRockTaihu(d), mw: 2.0, mh: 3.65, face: 'C', origin: 'center' },
    { key: 'rock_dieshi', geo: [-1.45, -1.1, 0, 1.45, 1.1, 3.95], paint: (d) => paintRockDieshi(d), mw: 2.9, mh: 3.95, face: 'C', origin: 'center' },
    { key: 'rock_peak_s', geo: [-0.6, -0.5, 0, 0.6, 0.5, 3.25], paint: (d) => paintRockPeakS(d), mw: 1.2, mh: 3.25, face: 'C', origin: 'center' },
    { key: 'plant_rock_moss', geo: [-0.6, -0.45, 0, 0.6, 0.45, 1.45], paint: (d) => paintPlantRockMoss(d), mw: 1.2, mh: 1.45, face: 'C', origin: 'center' },
    /* Site220 meirenkao: seat_meirenkao/seat_feilaichi/rail_zuokan/bench_lang */
    { key: 'seat_meirenkao', geo: [-1.4, -0.4, 0, 1.4, 0.45, 1.5], paint: (d) => paintSeatMeirenkao(d), mw: 2.8, mh: 1.5, face: 'C', origin: 'center' },
    { key: 'seat_feilaichi', geo: [-0.6, -0.5, 0, 0.6, 0.6, 1.6], paint: (d) => paintSeatFeilaichi(d), mw: 1.2, mh: 1.6, face: 'C', origin: 'center' },
    { key: 'rail_zuokan', geo: [-1.25, -0.3, 0, 1.25, 0.35, 1.3], paint: (d) => paintRailZuokan(d), mw: 2.5, mh: 1.3, face: 'C', origin: 'center' },
    { key: 'bench_lang', geo: [-1.1, -0.4, 0, 1.1, 0.4, 0.75], paint: (d) => paintBenchLang(d), mw: 2.2, mh: 0.75, face: 'C', origin: 'center' },
    /* Site221 biane: sign_biane/sign_duilian/sign_zhaopai_s/sign_hanging */
    { key: 'sign_biane', geo: [-1.4, -0.22, -0.5, 1.4, 0.22, 0.55], paint: (d) => paintSignBiane(d), mw: 2.8, mh: 1.05, face: 'S', origin: 'center' },
    { key: 'sign_duilian', geo: [-0.28, -0.14, 0, 0.28, 0.14, 2.5], paint: (d) => paintSignDuilian(d), mw: 0.56, mh: 2.5, face: 'S', origin: 'center' },
    { key: 'sign_zhaopai_s', geo: [-0.65, -0.16, -0.1, 0.65, 0.14, 0.6], paint: (d) => paintSignZhaopaiS(d), mw: 1.3, mh: 0.7, face: 'S', origin: 'center' },
    { key: 'sign_hanging', geo: [-0.45, -0.14, -0.2, 0.45, 0.14, 1.7], paint: (d) => paintSignHanging(d), mw: 0.9, mh: 1.9, face: 'S', origin: 'top' },
    /* Site222 baogu densify: stone_baogu(reuse site209)/stone_mendun/stone_lu */
    { key: 'stone_mendun', geo: [-0.5, -0.42, 0, 0.5, 0.42, 1.25], paint: (d) => paintStoneMendun(d), mw: 1.0, mh: 1.25, face: 'C', origin: 'center' },
    { key: 'stone_lu', geo: [-0.38, -0.32, 0, 0.38, 0.32, 1.28], paint: (d) => paintStoneLu(d), mw: 0.76, mh: 1.28, face: 'C', origin: 'center' },
    /* Site223 penjing: pot_penjing/bed_huatan/stone_shitai */
    { key: 'pot_penjing', geo: [-0.55, -0.55, 0, 0.55, 0.55, 2.85], paint: (d) => paintPotPenjing(d), mw: 1.1, mh: 2.85, face: 'C', origin: 'center' },
    { key: 'bed_huatan', geo: [-0.95, -0.7, 0, 0.95, 0.7, 1.45], paint: (d) => paintBedHuatan(d), mw: 1.9, mh: 1.45, face: 'C', origin: 'center' },
    { key: 'stone_shitai', geo: [-1.05, -0.5, 0, 1.05, 0.5, 0.85], paint: (d) => paintStoneShitai(d), mw: 2.1, mh: 0.85, face: 'C', origin: 'center' },
    /* Site224 shishi densify: stone_shishi / stone_shishi_s（门兽≠屋脊兽） */
    { key: 'stone_shishi', geo: [-0.58, -0.5, 0, 0.58, 0.5, 1.62], paint: (d) => paintStoneShishi(d), mw: 1.16, mh: 1.62, face: 'C', origin: 'center' },
    { key: 'stone_shishi_s', geo: [-0.4, -0.34, 0, 0.4, 0.34, 1.12], paint: (d) => paintStoneShishiS(d), mw: 0.8, mh: 1.12, face: 'C', origin: 'center' },
    /* Site225 gongdeng densify: lantern_gong / lantern_sha / lantern_stand */
    { key: 'lantern_gong', geo: [-0.45, -0.45, 0.5, 0.45, 0.45, 2.6], paint: (d) => paintLanternGong(d), mw: 0.9, mh: 2.1, face: 'C', origin: 'center' },
    { key: 'lantern_sha', geo: [-0.4, -0.4, 0.4, 0.4, 0.4, 2.2], paint: (d) => paintLanternSha(d), mw: 0.8, mh: 1.8, face: 'C', origin: 'center' },
    { key: 'lantern_stand', geo: [-0.35, -0.95, 0, 0.35, 0.35, 2.5], paint: (d) => paintLanternStand(d), mw: 0.7, mh: 2.5, face: 'C', origin: 'center' },
    /* Site226 zhuli densify: fence_zhuli / fence_huali / gate_chaifei（室外篱门≠漏窗/内隔断） */
    { key: 'fence_zhuli', geo: [-1.1, -0.2, 0, 1.1, 0.2, 1.5], paint: (d) => paintFenceZhuli(d), mw: 2.2, mh: 1.5, face: 'C', origin: 'center' },
    { key: 'fence_huali', geo: [-1.2, -0.22, 0, 1.2, 0.22, 1.85], paint: (d) => paintFenceHuali(d), mw: 2.4, mh: 1.85, face: 'C', origin: 'center' },
    { key: 'gate_chaifei', geo: [-1.05, -0.24, 0, 1.05, 0.24, 2.1], paint: (d) => paintGateChaifei(d), mw: 2.1, mh: 2.1, face: 'C', origin: 'center' },
    /* Site227 huotan densify: stall_huotan / rack_huojia / pole_liangshai */
    { key: 'stall_huotan', geo: [-1.1, -0.65, 0, 1.1, 0.6, 2.25], paint: (d) => paintStallHuotan(d), mw: 2.2, mh: 2.25, face: 'C', origin: 'center' },
    { key: 'rack_huojia', geo: [-0.8, -0.35, 0, 0.8, 0.35, 2.6], paint: (d) => paintRackHuojia(d), mw: 1.6, mh: 2.6, face: 'C', origin: 'center' },
    { key: 'pole_liangshai', geo: [-1.25, -0.4, 0, 1.25, 0.4, 2.9], paint: (d) => paintPoleLiangshai(d), mw: 2.5, mh: 2.9, face: 'C', origin: 'center' },
    /* Site228 shizhuo densify: seat_shizhuo / seat_shideng / seat_qiping（庭院闲坐对弈≠廊边美人靠/简易街具） */
    { key: 'seat_shizhuo', geo: [-1.0, -0.8, 0, 1.0, 0.8, 0.95], paint: (d) => paintSeatShizhuo(d), mw: 2.0, mh: 0.95, face: 'C', origin: 'center' },
    { key: 'seat_shideng', geo: [-0.55, -0.55, 0, 0.55, 0.55, 0.85], paint: (d) => paintSeatShideng(d), mw: 1.1, mh: 0.85, face: 'C', origin: 'center' },
    { key: 'seat_qiping', geo: [-0.9, -0.9, 0, 0.9, 0.9, 1.0], paint: (d) => paintSeatQiping(d), mw: 1.8, mh: 1.0, face: 'C', origin: 'center' },
    /* Site229 shuigang densify: prop_shuigang / prop_jinglan / prop_shuitong */
    { key: 'prop_shuigang', geo: [-0.55, -0.55, 0, 0.55, 0.55, 1.35], paint: (d) => paintPropShuigang(d), mw: 1.1, mh: 1.35, face: 'C', origin: 'center' },
    { key: 'prop_jinglan', geo: [-0.9, -0.9, 0, 0.9, 0.9, 1.65], paint: (d) => paintPropJinglan(d), mw: 1.8, mh: 1.65, face: 'C', origin: 'center' },
    { key: 'prop_shuitong', geo: [-0.4, -0.4, 0, 0.4, 0.4, 1.3], paint: (d) => paintPropShuitong(d), mw: 0.8, mh: 1.3, face: 'C', origin: 'center' },
    /* Site230 xianglu densify: prop_xianglu / prop_zhutai / prop_gongan_s（香火案几≠影壁/匾额/门侧小石炉） */
    { key: 'prop_xianglu', geo: [-0.5, -0.42, 0, 0.5, 0.42, 2.1], paint: (d) => paintPropXianglu(d), mw: 1.0, mh: 2.1, face: 'C', origin: 'center' },
    { key: 'prop_zhutai', geo: [-0.35, -0.3, 0, 0.35, 0.3, 2.0], paint: (d) => paintPropZhutai(d), mw: 0.7, mh: 2.0, face: 'C', origin: 'center' },
    { key: 'prop_gongan_s', geo: [-1.0, -0.45, 0, 1.0, 0.45, 1.25], paint: (d) => paintPropGonganS(d), mw: 2.0, mh: 1.25, face: 'C', origin: 'center' },
    /* Site231 chaidui densify: prop_chaidui / prop_caoduo / prop_liangdai（柴草粮储≠货摊/水缸） */
    { key: 'prop_chaidui', geo: [-0.95, -0.5, 0, 0.95, 0.5, 1.2], paint: (d) => paintPropChaidui(d), mw: 1.9, mh: 1.2, face: 'C', origin: 'center' },
    { key: 'prop_caoduo', geo: [-1.0, -0.9, 0, 1.0, 0.9, 1.9], paint: (d) => paintPropCaoduo(d), mw: 2.0, mh: 1.9, face: 'C', origin: 'center' },
    { key: 'prop_liangdai', geo: [-0.75, -0.5, 0, 0.75, 0.5, 2.0], paint: (d) => paintPropLiangdai(d), mw: 1.5, mh: 2.0, face: 'C', origin: 'center' },
    /* Site232 jiutan densify: prop_jiutan / prop_taoweng / prop_jiuqi（酒坛陶瓮幌≠柴草粮/货摊/水缸） */
    { key: 'prop_jiutan', geo: [-0.6, -0.58, 0, 0.6, 0.58, 2.0], paint: (d) => paintPropJiutan(d), mw: 1.2, mh: 2.0, face: 'C', origin: 'center' },
    { key: 'prop_taoweng', geo: [-0.8, -0.6, 0, 0.8, 0.6, 2.05], paint: (d) => paintPropTaoweng(d), mw: 1.6, mh: 2.05, face: 'C', origin: 'center' },
    { key: 'prop_jiuqi', geo: [-0.2, -0.2, 0, 1.45, 0.2, 3.2], paint: (d) => paintPropJiuqi(d), mw: 1.65, mh: 3.2, face: 'C', origin: 'center' },
    /* Site233 shima densify: prop_shima / prop_nianpan / prop_shijiu（石磨碾盘石臼≠柴堆/粮袋） */
    { key: 'prop_shima', geo: [-0.75, -0.75, 0, 1.2, 0.75, 1.6], paint: (d) => paintPropShima(d), mw: 1.95, mh: 1.6, face: 'C', origin: 'center' },
    { key: 'prop_nianpan', geo: [-1.1, -1.1, 0, 1.1, 1.1, 1.2], paint: (d) => paintPropNianpan(d), mw: 2.2, mh: 1.2, face: 'C', origin: 'center' },
    { key: 'prop_shijiu', geo: [-0.55, -0.55, 0, 0.55, 0.55, 2.0], paint: (d) => paintPropShijiu(d), mw: 1.1, mh: 2.0, face: 'C', origin: 'center' },
    /* Site234 liangyi densify: prop_liangyi / prop_yulou / prop_zhukuang（晾衣筐篓≠柴堆/货摊晾晒/石磨） */
    { key: 'prop_liangyi', geo: [-1.15, -0.2, 0, 1.15, 0.2, 2.55], paint: (d) => paintPropLiangyi(d), mw: 2.3, mh: 2.55, face: 'C', origin: 'center' },
    { key: 'prop_yulou', geo: [-0.55, -0.55, 0, 0.55, 0.55, 1.95], paint: (d) => paintPropYulou(d), mw: 1.1, mh: 1.95, face: 'C', origin: 'center' },
    { key: 'prop_zhukuang', geo: [-0.75, -0.58, 0, 0.75, 0.58, 1.7], paint: (d) => paintPropZhukuang(d), mw: 1.5, mh: 1.7, face: 'C', origin: 'center' },
    /* Site235 jilong densify: prop_jilong / prop_niaolong / prop_yashe（禽笼鸭舍点景≠柴堆/晾衣/石磨） */
    { key: 'prop_jilong', geo: [-0.9, -0.6, 0, 0.9, 0.6, 1.6], paint: (d) => paintPropJilong(d), mw: 1.8, mh: 1.6, face: 'C', origin: 'center' },
    { key: 'prop_niaolong', geo: [-0.7, -0.7, 0, 0.7, 0.7, 2.45], paint: (d) => paintPropNiaolong(d), mw: 1.4, mh: 2.45, face: 'C', origin: 'center' },
    { key: 'prop_yashe', geo: [-1.1, -0.8, 0, 1.1, 0.85, 1.65], paint: (d) => paintPropYashe(d), mw: 2.2, mh: 1.65, face: 'C', origin: 'center' },
    /* Site236 putuan densify: prop_putuan / prop_chazao / prop_chaju（蒲团茶灶茶具≠石桌/货摊/禽笼/晾衣） */
    { key: 'prop_putuan', geo: [-0.75, -0.75, 0, 0.75, 0.75, 0.75], paint: (d) => paintPropPutuan(d), mw: 1.5, mh: 0.75, face: 'C', origin: 'center' },
    { key: 'prop_chazao', geo: [-0.55, -0.5, 0, 0.55, 0.5, 2.2], paint: (d) => paintPropChazao(d), mw: 1.1, mh: 2.2, face: 'C', origin: 'center' },
    { key: 'prop_chaju', geo: [-0.72, -0.48, 0, 0.72, 0.48, 0.9], paint: (d) => paintPropChaju(d), mw: 1.44, mh: 0.9, face: 'C', origin: 'center' },
    /* Site237 shuan densify: prop_shuan / prop_qipan / prop_bijia（书案棋盘笔架≠石桌棋枰/蒲团茶具） */
    { key: 'prop_shuan', geo: [-1.05, -0.55, 0, 1.05, 0.55, 1.55], paint: (d) => paintPropShuan(d), mw: 2.1, mh: 1.55, face: 'C', origin: 'center' },
    { key: 'prop_qipan', geo: [-0.8, -0.8, 0, 0.8, 0.8, 0.85], paint: (d) => paintPropQipan(d), mw: 1.6, mh: 0.85, face: 'C', origin: 'center' },
    { key: 'prop_bijia', geo: [-0.6, -0.45, 0, 0.6, 0.45, 1.6], paint: (d) => paintPropBijia(d), mw: 1.2, mh: 1.6, face: 'C', origin: 'center' },
    /* Site238 huajia densify: prop_huajia / prop_zhuji / prop_bogu（花架竹几博古≠盆景/蒲团茶具/书案/抱鼓石） */
    { key: 'prop_huajia', geo: [-0.75, -0.5, 0, 0.75, 0.5, 2.9], paint: (d) => paintPropHuajia(d), mw: 1.5, mh: 2.9, face: 'C', origin: 'center' },
    { key: 'prop_zhuji', geo: [-0.7, -0.48, 0, 0.7, 0.48, 1.35], paint: (d) => paintPropZhuji(d), mw: 1.4, mh: 1.35, face: 'C', origin: 'center' },
    { key: 'prop_bogu', geo: [-0.65, -0.4, 0, 0.65, 0.45, 2.7], paint: (d) => paintPropBogu(d), mw: 1.3, mh: 2.7, face: 'C', origin: 'center' },

    /* Site239 huangzi densify: prop_chuanleng / prop_huangzi / prop_zhaohuang（市井串灯布幌招幌≠宫灯/酒旗/匾额） */
    { key: 'prop_chuanleng', geo: [-1.2, -0.2, 1.2, 1.2, 0.2, 2.55], paint: (d) => paintPropChuanleng(d), mw: 2.4, mh: 1.35, face: 'C', origin: 'center' },
    { key: 'prop_huangzi', geo: [-0.2, -0.18, 0.4, 1.1, 0.18, 2.9], paint: (d) => paintPropHuangzi(d), mw: 1.3, mh: 2.5, face: 'C', origin: 'center' },
    { key: 'prop_zhaohuang', geo: [-0.15, -0.5, 0.9, 0.9, 0.5, 2.8], paint: (d) => paintPropZhaohuang(d), mw: 1.05, mh: 1.9, face: 'C', origin: 'center' },
    /* Site240 tingdeng densify: prop_tingdeng / prop_shuipen / prop_xishoubo（庭灯水盆洗手钵≠街灯/水缸/香炉） */
    { key: 'prop_tingdeng', geo: [-0.55, -0.55, 0, 0.55, 0.55, 2.05], paint: (d) => paintPropTingdeng(d), mw: 1.1, mh: 2.05, face: 'C', origin: 'center' },
    { key: 'prop_shuipen', geo: [-0.7, -0.7, 0, 0.7, 0.7, 1.0], paint: (d) => paintPropShuipen(d), mw: 1.4, mh: 1.0, face: 'C', origin: 'center' },
    { key: 'prop_xishoubo', geo: [-0.55, -0.55, 0, 0.55, 0.55, 1.2], paint: (d) => paintPropXishoubo(d), mw: 1.1, mh: 1.2, face: 'C', origin: 'center' },
    /* Site241 suoyi densify: prop_suoyi / prop_douli / prop_biandan（蓑衣斗笠扁担≠晾衣/柴堆/禽笼） */
    { key: 'prop_suoyi', geo: [-0.95, -0.5, 0, 0.95, 0.5, 2.1], paint: (d) => paintPropSuoyi(d), mw: 1.9, mh: 2.1, face: 'C', origin: 'center' },
    { key: 'prop_douli', geo: [-1.0, -1.0, 0, 1.0, 1.0, 2.05], paint: (d) => paintPropDouli(d), mw: 2.0, mh: 2.05, face: 'C', origin: 'center' },
    { key: 'prop_biandan', geo: [-1.4, -0.6, 0, 1.4, 0.6, 1.8], paint: (d) => paintPropBiandan(d), mw: 2.8, mh: 1.8, face: 'C', origin: 'center' },
    /* Site242 tongjing densify: prop_tongjing / prop_shuzhuang / prop_yanzhi（铜镜梳妆胭脂≠花架/书案/博古架） */
    { key: 'prop_tongjing', geo: [-0.6, -0.35, 0, 0.6, 0.35, 2.55], paint: (d) => paintPropTongjing(d), mw: 1.2, mh: 2.55, face: 'C', origin: 'center' },
    { key: 'prop_shuzhuang', geo: [-0.75, -0.5, 0, 0.75, 0.5, 1.4], paint: (d) => paintPropShuzhuang(d), mw: 1.5, mh: 1.4, face: 'C', origin: 'center' },
    { key: 'prop_yanzhi', geo: [-0.45, -0.35, 0, 0.45, 0.4, 1.05], paint: (d) => paintPropYanzhi(d), mw: 0.9, mh: 1.05, face: 'C', origin: 'center' },
    /* Site243 yugang densify: prop_yugang / prop_huapenjia / prop_yingwujia（金鱼缸花盆架鹦鹉架≠盆景/花架/水缸/鸟笼） */
    { key: 'prop_yugang', geo: [-0.6, -0.6, 0, 0.6, 0.6, 1.6], paint: (d) => paintPropYugang(d), mw: 1.2, mh: 1.6, face: 'C', origin: 'center' },
    { key: 'prop_huapenjia', geo: [-0.75, -0.5, 0, 0.75, 0.5, 2.75], paint: (d) => paintPropHuapenjia(d), mw: 1.5, mh: 2.75, face: 'C', origin: 'center' },
    { key: 'prop_yingwujia', geo: [-0.75, -0.55, 0, 0.9, 0.55, 2.85], paint: (d) => paintPropYingwujia(d), mw: 1.65, mh: 2.85, face: 'C', origin: 'center' },
    /* —— Site244：纺车 / 绣绷 / 线筐 —— */
    { key: 'prop_fangche', geo: [-0.95, -0.75, 0, 0.95, 0.75, 2.05], paint: (d) => paintPropFangche(d), mw: 1.9, mh: 2.05, face: 'C', origin: 'center' },
    { key: 'prop_xiubeng', geo: [-0.55, -0.55, 0, 0.55, 0.55, 1.85], paint: (d) => paintPropXiubeng(d), mw: 1.1, mh: 1.85, face: 'C', origin: 'center' },
    { key: 'prop_xiankuang', geo: [-0.7, -0.6, 0, 0.7, 0.6, 1.55], paint: (d) => paintPropXiankuang(d), mw: 1.4, mh: 1.55, face: 'C', origin: 'center' },
    /* Site245 fengling densify: prop_fengling / prop_zhulian / prop_shaman（风铃竹帘纱幔≠宫灯/串灯幌/晾衣/铜镜/纺车） */
    { key: 'prop_fengling', geo: [-0.6, -0.45, 0, 0.6, 0.45, 2.55], paint: (d) => paintPropFengling(d), mw: 1.2, mh: 2.55, face: 'C', origin: 'center' },
    { key: 'prop_zhulian', geo: [-1.05, -0.25, 0, 1.05, 0.25, 2.4], paint: (d) => paintPropZhulian(d), mw: 2.1, mh: 2.4, face: 'C', origin: 'center' },
    { key: 'prop_shaman', geo: [-1.15, -0.2, 0, 1.15, 0.2, 2.6], paint: (d) => paintPropShaman(d), mw: 2.3, mh: 2.6, face: 'C', origin: 'center' },
    /* Site246 chapan densify: prop_chapan / prop_shihe / prop_guopan（茶盘食盒果盘≠茶具/货架/盆景） */
    { key: 'prop_chapan', geo: [-0.9, -0.65, 0, 0.9, 0.65, 1.35], paint: (d) => paintPropChapan(d), mw: 1.8, mh: 1.35, face: 'C', origin: 'center' },
    { key: 'prop_shihe', geo: [-0.75, -0.55, 0, 0.75, 0.55, 2.8], paint: (d) => paintPropShihe(d), mw: 1.5, mh: 2.8, face: 'C', origin: 'center' },
    { key: 'prop_guopan', geo: [-0.95, -0.85, 0, 0.95, 0.85, 2.05], paint: (d) => paintPropGuopan(d), mw: 1.9, mh: 2.05, face: 'C', origin: 'center' },
    /* Site247 shigandang densify: prop_shigandang / prop_menshen / prop_nianhua（门侧石敢当/门神画/年画≠路标石敢当/对联/招牌） */
    { key: 'prop_shigandang', geo: [-0.55, -0.4, 0, 0.55, 0.4, 1.95], paint: (d) => paintPropShigandang(d), mw: 1.1, mh: 1.95, face: 'C', origin: 'center' },
    { key: 'prop_menshen', geo: [-0.75, -0.15, 0, 0.75, 0.15, 2.8], paint: (d) => paintPropMenshen(d), mw: 1.5, mh: 2.8, face: 'C', origin: 'center' },
    { key: 'prop_nianhua', geo: [-0.95, -0.4, 0, 0.95, 0.4, 1.9], paint: (d) => paintPropNianhua(d), mw: 1.9, mh: 1.9, face: 'C', origin: 'center' },
    /* Site248 tanghulu densify: prop_tanghulu / prop_bolanggu / prop_fengzheng（糖葫芦/拨浪鼓/风筝≠货摊果盘/幌子） */
    { key: 'prop_tanghulu', geo: [-0.4, -0.25, 0, 0.4, 0.25, 2.0], paint: (d) => paintPropTanghulu(d), mw: 0.8, mh: 2.0, face: 'C', origin: 'center' },
    { key: 'prop_bolanggu', geo: [-0.65, -0.25, 0, 0.65, 0.25, 1.6], paint: (d) => paintPropBolanggu(d), mw: 1.3, mh: 1.6, face: 'C', origin: 'center' },
    { key: 'prop_fengzheng', geo: [-0.9, -0.25, 0, 0.9, 0.25, 1.95], paint: (d) => paintPropFengzheng(d), mw: 1.8, mh: 1.95, face: 'C', origin: 'center' },
  ];

  function ensure(makeCanvas) {
    if (ready) return;
    makeCanvas = makeCanvas || defaultMake;
    const pack = [];
    for (const m of MODULES) {
      const b = boundsOf(m.geo, 6);
      pack.push({ m, w: b[2] - b[0], h: b[3] - b[1], ox: -b[0], oy: -b[1], bx: b });
    }
    const WIDTH = 2048;
    let x = 2, y = 2, rowH = 0, totalH = 0;
    const placed = [];
    for (const it of pack) {
      if (x + it.w + 2 > WIDTH) { y += rowH + 2; x = 2; rowH = 0; }
      it.x = x; it.y = y;
      x += it.w + 2; rowH = Math.max(rowH, it.h);
      totalH = Math.max(totalH, y + rowH + 2);
      placed.push(it);
    }
    atlas = makeCanvas(WIDTH, Math.max(64, totalH));
    ag = atlas.getContext('2d');
    ag.clearRect(0, 0, WIDTH, totalH);
    frames = {};
    for (const it of placed) {
      ag.save(); ag.beginPath(); ag.rect(it.x, it.y, it.w, it.h); ag.clip();
      const d = painter(ag, it.x + it.ox, it.y + it.oy);
      it.m.paint(d);
      ag.restore();
      // hard edges
      try {
        const im = ag.getImageData(it.x, it.y, it.w, it.h), a = im.data;
        for (let i = 3; i < a.length; i += 4) a[i] = a[i] >= 110 ? 255 : 0;
        ag.putImageData(im, it.x, it.y);
      } catch (_) {}
      frames[it.m.key] = {
        x: it.x, y: it.y, w: it.w, h: it.h, ox: it.ox, oy: it.oy,
        mw: it.m.mw, mh: it.m.mh, face: it.m.face, origin: it.m.origin || 'bay',
        geo: it.m.geo.slice(),
      };
    }
    ready = true;
  }

  /** Blit one module so its local origin lands at world (x,y,z). */
  function stamp(d, key, x, y, z, o = {}) {
    ensure();
    const f = frames[key]; if (!f) return;
    const p = d.P(x, y, z);
    const g = d.g;
    const sx = o.sx || 1, sy = o.sy || 1;
    const dw = Math.round(f.w * sx), dh = Math.round(f.h * sy);
    g.save();
    if (o.alpha != null) g.globalAlpha = o.alpha;
    g.imageSmoothingEnabled = false;
    g.drawImage(atlas, f.x, f.y, f.w, f.h, Math.round(p[0] - f.ox * sx), Math.round(p[1] - f.oy * sy), dw, dh);
    g.restore();
  }

  /** Tile-fill a south-face rectangle with repeating modules (like jinghuaili wall bays). */
  function fillS(d, key, y, x0, z0, x1, z1, o = {}) {
    ensure();
    const f = frames[key]; if (!f) return;
    const mw = o.mw || f.mw, mh = o.mh || f.mh;
    const sx = (x1 - x0) > 0 ? Math.min(1.25, Math.max(0.55, (x1 - x0) / Math.max(1, Math.ceil((x1 - x0) / mw)) / mw)) : 1;
    // prefer integer tiles along x; scale slightly to fit
    const n = Math.max(1, Math.round((x1 - x0) / mw));
    const tw = (x1 - x0) / n;
    const m = Math.max(1, Math.round((z1 - z0) / mh));
    const th = (z1 - z0) / m;
    for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
      stamp(d, key, x0 + i * tw, y, z0 + j * th, { sx: tw / mw, sy: th / mh });
    }
  }

  function fillW(d, key, x, y0, z0, y1, z1, o = {}) {
    ensure();
    const f = frames[key]; if (!f) return;
    const mw = o.mw || f.mw, mh = o.mh || f.mh;
    const n = Math.max(1, Math.round((y1 - y0) / mw));
    const tw = (y1 - y0) / n;
    const m = Math.max(1, Math.round((z1 - z0) / mh));
    const th = (z1 - z0) / m;
    for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
      stamp(d, key, x, y0 + i * tw, z0 + j * th, { sx: tw / mw, sy: th / mh });
    }
  }

  /** Stamp tile eave modules along a polyline of world points (S-eave).
   * Site198 denser + 瓦当/滴水；Site205 再加密瓦当/滴水/檐口. */
  function stampEaveTiles(d, pts, o = {}) {
    ensure();
    if (!pts || pts.length < 2) return;
    const site205 = o.site205 !== false;
    const pitch = site205 ? ((o && o.dense) ? 0.48 : 0.58) : ((o && o.dense) ? 0.65 : 0.78);
    let acc = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
      const len = Math.sqrt(dx * dx + dy * dy) || 0.001;
      const steps = Math.max(1, Math.round(len / pitch));
      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        const px = a[0] + dx * t, py = a[1] + dy * t, pz = a[2] + dz * t;
        stamp(d, 'tile_eave_S', px, py, pz, { sx: len / steps, sy: 1 });
        if (site205) {
          /* 檐口 fascia every step */
          stamp(d, 'eave_yankou', px, py + 0.01, pz + 0.02, { sx: Math.min(1.1, len / steps), sy: 0.95 });
          if (s % 2 === 0) stamp(d, 'tile_wadang', px, py - 0.025, pz - 0.05, { sx: 0.9, sy: 0.95 });
          else stamp(d, 'tile_dishui', px, py - 0.035, pz - 0.08, { sx: 0.9, sy: 1.0 });
          /* denser: also overlay Site198 modules every 3rd */
          if (s % 3 === 0) stamp(d, 'tile_wadang_S', px + 0.08, py - 0.015, pz - 0.03, { sx: 0.7, sy: 0.8 });
          if (s % 3 === 1) stamp(d, 'tile_drip_S', px + 0.06, py - 0.02, pz - 0.05, { sx: 0.7, sy: 0.85 });
        } else {
          if (s % 2 === 0) stamp(d, 'tile_wadang_S', px, py - 0.02, pz - 0.04, { sx: 0.85, sy: 0.9 });
          else stamp(d, 'tile_drip_S', px, py - 0.03, pz - 0.06, { sx: 0.85, sy: 0.95 });
        }
      }
      acc += len;
    }
  }
  /** Site205：沿屋面坡 stamp 瓦垄 modules. */
  function stampWalong(d, pts, o = {}) {
    ensure();
    if (!pts || pts.length < 2) return;
    const pitch = (o && o.dense) ? 0.55 : 0.7;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
      const len = Math.sqrt(dx * dx + dy * dy) || 0.001;
      const steps = Math.max(1, Math.round(len / pitch));
      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        stamp(d, 'tile_walong', a[0] + dx * t, a[1] + dy * t, a[2] + dz * t, {
          sx: (o.sx || (len / steps)), sy: o.sy || 0.9,
        });
      }
    }
  }
  /** Stamp 鸱吻 at ridge ends (atlas kitbash). */
  function stampChiwen(d, x, y, z, o = {}) {
    ensure();
    const key = o.flip ? 'chiwen_flip_S' : 'chiwen_S';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }

  /** Site207：沿栏杆 polyline stamp 寻杖 + 小柱；可选雀替/挂落。少改宏观布局. */
  function stampRailQueti(d, pts, o = {}) {
    ensure();
    if (!pts || pts.length < 2) return;
    const pitch = (o && o.dense) ? 0.7 : 0.95;
    const zOff = o.zOff || 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const dx = b[0] - a[0], dy = b[1] - a[1], dz = (b[2] || 0) - (a[2] || 0);
      const len = Math.sqrt(dx * dx + dy * dy) || 0.001;
      const steps = Math.max(1, Math.round(len / pitch));
      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        const px = a[0] + dx * t, py = a[1] + dy * t, pz = (a[2] || 0) + dz * t + zOff;
        stamp(d, 'rail_xunzhang', px, py, pz, { sx: Math.min(1.15, (len / steps) / 1.4 * (o.sx || 1.05)), sy: o.sy || 0.95 });
        if (s % 2 === 0) stamp(d, 'baluster_xiaozhu', px, py - 0.02, pz, { sx: 0.85, sy: 0.9 });
      }
      /* 雀替 at segment ends (column joints) */
      if (o.queti !== false) {
        stamp(d, 'ornament_queti', a[0], a[1] - 0.04, (a[2] || 0) + (o.quetiZ || 0.85), { sx: 0.75, sy: 0.8 });
        stamp(d, 'ornament_queti', b[0], b[1] - 0.04, (b[2] || 0) + (o.quetiZ || 0.85), { sx: 0.75, sy: 0.8 });
      }
    }
  }
  /** Site207：柱间挂落 stamp（水平带） */
  function stampGualuo(d, x0, y, z, x1, o = {}) {
    ensure();
    const span = Math.abs(x1 - x0);
    const n = Math.max(1, Math.round(span / 1.5));
    const tw = span / n;
    const xStart = Math.min(x0, x1);
    for (let i = 0; i < n; i++) {
      stamp(d, 'hanging_gualuo', xStart + i * tw, y, z, { sx: tw / 1.6, sy: o.sy || 0.95 });
    }
  }


  /** Site209：大门门钉/铺首/门槛/抱鼓 stamp（少改宏观布局） */
  function stampDoorHardware(d, x0, y, z0, x1, z1, o = {}) {
    ensure();
    const w = Math.abs(x1 - x0) || 1;
    const h = Math.max(0.8, Math.abs(z1 - z0) || 2);
    const xMid = (x0 + x1) / 2;
    const dense = o.dense !== false;
    /* 门钉面板 densify */
    if (o.mending !== false) {
      const n = dense ? Math.max(2, Math.round(w / 0.55)) : Math.max(1, Math.round(w / 0.85));
      const tw = w / n;
      const xStart = Math.min(x0, x1);
      for (let i = 0; i < n; i++) {
        stamp(d, 'door_mending', xStart + i * tw, y, z0, { sx: tw / 1.0, sy: h / 2.2 });
      }
    }
    /* 铺首衔环 center (or dual for wide) */
    if (o.pushou !== false) {
      const pz = z0 + h * (o.pushouT || 0.52);
      stamp(d, 'knocker_pushou', xMid, y - 0.04, pz, { sx: o.pushouSx || 0.95, sy: o.pushouSy || 0.95 });
      if (dense && w > 2.2) {
        stamp(d, 'knocker_pushou', x0 + w * 0.28, y - 0.04, pz, { sx: 0.75, sy: 0.8 });
        stamp(d, 'knocker_pushou', x0 + w * 0.72, y - 0.04, pz, { sx: 0.75, sy: 0.8 });
      }
    }
    /* 门槛 */
    if (o.menkan !== false) {
      stamp(d, 'sill_menkan', Math.min(x0, x1), y - 0.02, z0 - 0.02, { sx: w / 1.4, sy: o.menkanSy || 1.05 });
    }
    /* 抱鼓石 pair */
    if (o.baogu !== false) {
      const bz = o.baoguZ != null ? o.baoguZ : Math.max(0, z0 - 0.05);
      const inset = o.baoguInset != null ? o.baoguInset : 0.15;
      stamp(d, 'stone_baogu', Math.min(x0, x1) - inset, y - 0.08, bz, { sx: o.baoguSx || 0.85, sy: o.baoguSy || 0.9 });
      stamp(d, 'stone_baogu', Math.max(x0, x1) + inset, y - 0.08, bz, { sx: o.baoguSx || 0.85, sy: o.baoguSy || 0.9 });
    }
  }


  /** Site212：影壁/照壁/砖雕花心/基座 stamp（入口点景；少改宏观布局） */
  function stampYingbi(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'yingbi';
    const sx = o.sx || 1, sy = o.sy || 1;
    const baseKey = 'screen_base';
    const wallKey = kind === 'zhaobi' ? 'wall_zhaobi' : 'wall_yingbi';
    const wallMw = kind === 'zhaobi' ? 2.8 : 2.4;
    const wallMh = kind === 'zhaobi' ? 3.2 : 2.8;
    if (o.base !== false) {
      stamp(d, baseKey, x - (wallMw * sx) / 2, y, z, { sx: (wallMw * sx) / 2.6, sy: o.baseSy || 1.0 });
    }
    const wz = z + (o.base !== false ? 0.48 * (o.baseSy || 1) : 0);
    stamp(d, wallKey, x - (wallMw * sx) / 2, y - 0.02, wz, { sx: sx, sy: sy });
    if (o.huaxin !== false) {
      const hz = wz + wallMh * sy * (o.huaxinT || 0.52);
      stamp(d, 'brick_huaxin', x, y - 0.06, hz, { sx: o.hsx || 0.85, sy: o.hsy || 0.85 });
    }
  }

  /** Site210：旗幡/帷幔/流苏/挂饰 stamp（檐下点缀；与幌子/灯笼错位） */
  function stampSoftDecor(d, x0, y, z, x1, o = {}) {
    ensure();
    const span = Math.abs(x1 - x0);
    const xStart = Math.min(x0, x1);
    if (o.weiman !== false) {
      const n = Math.max(1, Math.round(span / 2.0));
      const tw = span / n;
      for (let i = 0; i < n; i++) {
        stamp(d, 'curtain_weiman', xStart + i * tw, y, z, { sx: tw / 2.2, sy: o.weimanSy || 0.85 });
      }
    }
    if (o.tassel !== false) {
      const step = o.tasselStep || 1.15;
      for (let x = xStart + 0.35; x < xStart + span - 0.2; x += step) {
        stamp(d, 'tassel_liusu', x, y - 0.02, z + (o.tasselZ || 0.05), { sx: o.tsx || 0.75, sy: o.tsy || 0.8 });
      }
    }
    if (o.hang !== false) {
      const step = o.hangStep || 1.6;
      for (let x = xStart + 0.7; x < xStart + span - 0.3; x += step) {
        stamp(d, 'hang_ornament', x, y - 0.04, z + (o.hangZ || 0.15), { sx: o.hsx || 0.7, sy: o.hsy || 0.75 });
      }
    }
    if (o.qifan) {
      const qx = o.qifanX != null ? o.qifanX : xStart + span * 0.5;
      stamp(d, 'banner_qifan', qx, y - 0.08, z + (o.qifanZ || 0.55), { sx: o.qsx || 0.85, sy: o.qsy || 0.9 });
    }
  }

  /** Site211：台基/阶条石/垂带/踏垛 stamp（贴在已有 platform 体量上；不改 footprint；不碰铺地） */
  function stampPlatform(d, x0, y0, x1, y1, z1, o = {}) {
    ensure();
    const w = Math.abs(x1 - x0) || 1;
    const zTop = Math.max(0.2, z1 || 0.4);
    const dense = o.dense !== false;
    const yFront = Math.min(y0, y1);
    /* 台基南立面 densify */
    if (o.taiji !== false) {
      const n = dense ? Math.max(2, Math.round(w / 0.95)) : Math.max(1, Math.round(w / 1.4));
      const tw = w / n;
      const xStart = Math.min(x0, x1);
      for (let i = 0; i < n; i++) {
        stamp(d, 'base_taiji', xStart + i * tw, yFront - 0.02, 0, { sx: tw / 1.6, sy: zTop / 1.1 });
      }
    }
    /* 阶条石顶缘 */
    if (o.tiaotiao !== false) {
      const n = dense ? Math.max(2, Math.round(w / 1.1)) : Math.max(1, Math.round(w / 1.5));
      const tw = w / n;
      const xStart = Math.min(x0, x1);
      for (let i = 0; i < n; i++) {
        stamp(d, 'step_tiaotiao', xStart + i * tw, yFront - 0.04, zTop - 0.02, { sx: tw / 1.6, sy: 1.05 });
      }
    }
    /* 踏垛 + 垂带（沿 o.steps 或默认中轴） */
    const steps = o.steps || [];
    const doStairs = o.taduo !== false && (steps.length || o.forceStairs);
    if (doStairs) {
      const list = steps.length ? steps : [[(x0 + x1) / 2, Math.min(w * 0.4, 3.6)]];
      for (const st of list) {
        const cx = st[0], sw = st[1] || 3.2;
        const n = Math.max(2, Math.round(zTop / 0.16));
        const dz = zTop / n;
        for (let k = 0; k < n; k++) {
          const yy = yFront - (n - k) * 0.3;
          const zz = dz * k;
          stamp(d, 'stair_taduo', cx - sw / 2, yy - 0.02, zz, { sx: sw / 1.4, sy: Math.max(0.85, dz / 0.28) });
        }
        if (o.chuidai !== false) {
          const n2 = n;
          stamp(d, 'ramp_chuidai', cx - sw / 2 - 0.15, yFront - n2 * 0.3, 0, { sx: 0.95, sy: Math.max(0.85, zTop / 1.15) });
          stamp(d, 'ramp_chuidai', cx + sw / 2 - 0.25, yFront - n2 * 0.3, 0, { sx: 0.95, sy: Math.max(0.85, zTop / 1.15) });
        }
      }
    } else if (o.chuidai && steps.length) {
      for (const st of steps) {
        const cx = st[0], sw = st[1] || 3.2;
        const n = Math.max(2, Math.round(zTop / 0.16));
        stamp(d, 'ramp_chuidai', cx - sw / 2 - 0.15, yFront - n * 0.3, 0, { sx: 0.9, sy: zTop / 1.15 });
        stamp(d, 'ramp_chuidai', cx + sw / 2 - 0.25, yFront - n * 0.3, 0, { sx: 0.9, sy: zTop / 1.15 });
      }
    }
  }


  /** Site213：正脊鸱吻 densify + 正脊饰 + 垂脊走兽 + 垂脊瓦带（少改宏观布局；与瓦当衔接） */
  function stampRidgeBeasts(d, o = {}) {
    ensure();
    const ym = o.ym, Ht = o.Ht, rh = o.rh || 0.35;
    const rx0 = o.rx0, rx1 = o.rx1;
    if (ym == null || Ht == null || rx0 == null || rx1 == null) return;
    const dense = o.dense !== false;
    /* denser 鸱吻 overlay at ridge ends */
    if (o.chiwen !== false) {
      for (const [x, flip] of [[rx0, true], [rx1, false]]) {
        const key = flip ? 'ridge_chiwen' : 'ridge_chiwen';
        stamp(d, key, x - (flip ? 0.05 : 0.85), ym - 0.18, Ht + rh * 0.02, {
          sx: Math.max(0.9, Math.min(1.45, 0.6 + rh)),
          sy: Math.max(0.9, Math.min(1.5, 0.75 + rh)),
        });
        /* also keep classic chiwen underlay slightly inset for kitbash density */
        if (dense) stampChiwen(d, x - (flip ? 0.02 : 0.7), ym - 0.14, Ht + rh * 0.08, {
          flip, sx: Math.max(0.75, Math.min(1.2, 0.5 + rh * 0.85)), sy: Math.max(0.75, Math.min(1.25, 0.6 + rh * 0.85)),
        });
      }
    }
    /* 正脊饰 along main ridge */
    if (o.ornament !== false && rh > 0.12) {
      const span = Math.abs(rx1 - rx0);
      const step = dense ? 1.35 : 1.9;
      const margin = 0.85;
      for (let x = rx0 + margin; x < rx1 - margin; x += step) {
        stamp(d, 'ridge_ornament', x, ym - 0.08, Ht + rh * 0.55, { sx: o.osx || 0.75, sy: o.osy || 0.8 });
      }
      /* center finial if long enough */
      if (span > 4.5) {
        stamp(d, 'ridge_ornament', (rx0 + rx1) / 2, ym - 0.1, Ht + rh * 0.7, { sx: 0.95, sy: 1.05 });
      }
    }
    /* 垂脊瓦带 + 走兽 along hip rays */
    const hips = o.hips || [];
    for (const hip of hips) {
      const [a, b] = hip; /* a near ridge, b near eave corner */
      if (!a || !b) continue;
      const dx = b[0] - a[0], dy = b[1] - a[1], dz = (b[2] || 0) - (a[2] || 0);
      const len = Math.sqrt(dx * dx + dy * dy) || 0.001;
      /* hip_chuiji tiles */
      if (o.chuiji !== false) {
        const pitch = dense ? 0.55 : 0.75;
        const steps = Math.max(1, Math.round(len / pitch));
        for (let s = 0; s < steps; s++) {
          const t = (s + 0.15) / steps;
          stamp(d, 'hip_chuiji', a[0] + dx * t, a[1] + dy * t, (a[2] || 0) + dz * t, {
            sx: Math.min(1.1, (len / steps) / 1.2), sy: 0.9,
          });
        }
      }
      /* 走兽 along hip (toward eave) */
      const nBeast = o.beasts != null ? o.beasts : (dense ? 3 : 2);
      if (o.zoushou !== false && nBeast > 0) {
        for (let k = 1; k <= nBeast; k++) {
          const t = Math.min(0.92, 0.18 + k * (0.7 / (nBeast + 1)));
          stamp(d, 'beast_zoushou', a[0] + dx * t, a[1] + dy * t - 0.04, (a[2] || 0) + dz * t + 0.06, {
            sx: 0.7 + k * 0.05, sy: 0.75 + k * 0.04,
          });
        }
      }
    }
  }

  /** Site214：落地罩/隔扇屏/月洞/门框 stamp（开敞门厅·廊口；少改宏观布局；与格扇互补） */
  function stampScreens(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'luodizhao';
    const sx = o.sx || 1, sy = o.sy || 1;
    if (kind === 'geshan' || kind === 'partition') {
      stamp(d, 'partition_geshan', x - (2.4 * sx) / 2, y, z, { sx: sx, sy: sy });
      return;
    }
    if (kind === 'yuedong' || kind === 'moon') {
      stamp(d, 'moon_yuedong', x - (2.8 * sx) / 2, y, z, { sx: sx, sy: sy });
      return;
    }
    if (kind === 'menkuang' || kind === 'frame') {
      stamp(d, 'frame_menkuang', x - (2.2 * sx) / 2, y, z, { sx: sx, sy: sy });
      return;
    }
    if (kind === 'combo') {
      stamp(d, 'frame_menkuang', x - (2.2 * sx) / 2, y - 0.02, z, { sx: sx * 0.95, sy: sy * 0.9 });
      if (o.moon !== false) stamp(d, 'moon_yuedong', x - (2.8 * sx * 0.7) / 2, y + 0.35, z + 0.15, { sx: sx * 0.7, sy: sy * 0.72 });
      return;
    }
    /* default luodizhao */
    stamp(d, 'screen_luodizhao', x - (2.6 * sx) / 2, y, z, { sx: sx, sy: sy });
    if (o.withGeshan) {
      stamp(d, 'partition_geshan', x - (2.4 * sx * 0.75) / 2, y + 0.08, z + 0.05, { sx: sx * 0.75, sy: sy * 0.7 });
    }
  }


  /** Site216：漏窗/花墙/透空砖雕/花格墙 stamp（艮岳·豪宅侧墙·巷墙；少改宏观布局；与格扇/影壁互补） */
  function stampLouwindow(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'lou';
    const sx = o.sx || 1, sy = o.sy || 1;
    if (kind === 'huaziang' || kind === 'flowerwall') {
      stamp(d, 'wall_huaziang', x - (3.2 * sx) / 2, y, z, { sx: sx, sy: sy });
      if (o.toukong !== false) {
        stamp(d, 'brick_toukong', x, y - 0.04, z + 2.6 * sy * (o.toukongT || 0.48), { sx: o.tsx || 0.75, sy: o.tsy || 0.75 });
      }
      return;
    }
    if (kind === 'toukong' || kind === 'brick') {
      stamp(d, 'brick_toukong', x, y, z, { sx: sx, sy: sy });
      return;
    }
    if (kind === 'lattice' || kind === 'lattice_wall') {
      stamp(d, 'lattice_wall', x - (2.4 * sx) / 2, y, z, { sx: sx, sy: sy });
      return;
    }
    if (kind === 'combo') {
      stamp(d, 'wall_huaziang', x - (3.2 * sx) / 2, y, z, { sx: sx, sy: sy });
      stamp(d, 'window_lou', x - (1.8 * sx * 0.7) / 2, y + 0.02, z + 0.35, { sx: sx * 0.7, sy: sy * 0.65 });
      return;
    }
    /* default lou */
    stamp(d, 'window_lou', x - (1.8 * sx) / 2, y, z, { sx: sx, sy: sy });
    if (o.withToukong) {
      stamp(d, 'brick_toukong', x, y - 0.04, z + 1.0 * sy, { sx: 0.65, sy: 0.65 });
    }
  }

  function getAtlas() { ensure(); return atlas; }
  function getFrames() { ensure(); return frames; }
  function getModules() { return MODULES.map((m) => m.key); }

  // Hook paint so atlas is ready before any ancient draw
  if (A && A.paint && !A._ancientAtlasHooked) {
    const _paint = A.paint.bind(A);
    A.paint = function (makeCanvas, only, used) {
      _makeCanvas = makeCanvas;
      ensure(makeCanvas);
      return _paint(makeCanvas, only, used);
    };
    A._ancientAtlasHooked = true;
  }


  /** Site215：拴马桩/上马石/石敢当/路牙石标 stamp（点缀；不改 footprint） */
  function stampHitching(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'shuanma';
    const map = {
      shuanma: 'post_shuanma',
      shangma: 'stone_shangma',
      ganddang: 'stone_ganddang',
      curb: 'curb_marker',
    };
    const key = map[kind] || 'post_shuanma';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }


  /** Site217：井亭/路亭/小牌坊/亭顶 stamp（点景；不改 footprint） */

  /** Site219：太湖石/叠石/小峰石/石附苔 stamp（庭院·艮岳外围点景；不改 footprint） */
  function stampRockery(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'taihu';
    const map = {
      taihu: 'rock_taihu',
      dieshi: 'rock_dieshi',
      peak: 'rock_peak_s',
      peak_s: 'rock_peak_s',
      moss: 'plant_rock_moss',
      rock_moss: 'plant_rock_moss',
    };
    const key = map[kind] || 'rock_taihu';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }

  function stampPavilions(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'jingting';
    const map = {
      jingting: 'pavilion_jingting',
      luting: 'pavilion_luting',
      paifang: 'gate_paifang_s',
      paifang_s: 'gate_paifang_s',
      roof: 'roof_ting',
    };
    const key = map[kind] || 'pavilion_jingting';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }

  /** Site218：垂花门/小门楼/门罩/门柱石 stamp（宅院入口点景；不改 footprint） */
  function stampChuihuamen(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'chuihua';
    const map = {
      chuihua: 'gate_chuihua',
      menlou: 'gate_menlou_s',
      menlou_s: 'gate_menlou_s',
      menzhao: 'eave_menzhao',
      menzhu: 'post_menzhu',
    };
    const key = map[kind] || 'gate_chuihua';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }


  /** Site220：美人靠/飞来椅/坐槛/廊凳 stamp（廊边亭边点景；不改 footprint） */
  /** Site221：匾额/对联/小字牌/垂挂牌 stamp（店铺门楣·宅门·巷口·亭侧点景；不改 footprint） */
  function stampBiane(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'biane';
    const map = {
      biane: 'sign_biane',
      duilian: 'sign_duilian',
      zhaopai: 'sign_zhaopai_s',
      zhaopai_s: 'sign_zhaopai_s',
      hanging: 'sign_hanging',
      hang: 'sign_hanging',
    };
    const key = map[kind] || 'sign_biane';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }

  /** Site223：盆景/砖花坛/石台 stamp（宅院·巷口·桥头·亭侧·门前点景；不改 footprint） */
  function stampPenjing(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'penjing';
    const map = {
      penjing: 'pot_penjing',
      pot: 'pot_penjing',
      pot_penjing: 'pot_penjing',
      huatan: 'bed_huatan',
      bed: 'bed_huatan',
      bed_huatan: 'bed_huatan',
      shitai: 'stone_shitai',
      stone: 'stone_shitai',
      stone_shitai: 'stone_shitai',
    };
    const key = map[kind] || 'pot_penjing';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }

  /** Site224：石狮/小蹲兽 stamp（宅门·桥头·广场/衙署庙前点景；门兽≠屋脊兽；不改 footprint） */
  function stampShishi(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'shishi';
    const map = {
      shishi: 'stone_shishi',
      stone_shishi: 'stone_shishi',
      shishi_s: 'stone_shishi_s',
      stone_shishi_s: 'stone_shishi_s',
      s: 'stone_shishi_s',
    };
    const key = map[kind] || 'stone_shishi';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }


  function stampMeirenkao(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'meirenkao';
    const map = {
      meirenkao: 'seat_meirenkao',
      feilaichi: 'seat_feilaichi',
      zuokan: 'rail_zuokan',
      lang: 'bench_lang',
      bench_lang: 'bench_lang',
    };
    const key = map[kind] || 'seat_meirenkao';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }

  /** Site222：抱鼓石/方门墩/小石炉 stamp（宅门·巷口点景；不改 footprint；stone_baogu 复用 site209） */
  function stampBaogu(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'baogu';
    const map = {
      baogu: 'stone_baogu',
      stone_baogu: 'stone_baogu',
      mendun: 'stone_mendun',
      stone_mendun: 'stone_mendun',
      lu: 'stone_lu',
      stone_lu: 'stone_lu',
    };
    const key = map[kind] || 'stone_baogu';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }

/** Site225：宫灯/纱灯/立灯 stamp（门楣·亭角·桥栏·巷口·富户廊前点景；与#113 lanternGlow互补；不改 footprint） */
  function stampGongdeng(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'gong';
    const map = {
      gong: 'lantern_gong',
      lantern_gong: 'lantern_gong',
      gongdeng: 'lantern_gong',
      sha: 'lantern_sha',
      lantern_sha: 'lantern_sha',
      stand: 'lantern_stand',
      lantern_stand: 'lantern_stand',
      lideng: 'lantern_stand',
    };
    const key = map[kind] || 'lantern_gong';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }

/** Site226：竹篱/花篱/柴扉 stamp（巷口·宅侧·园边·桥头小径点景；与漏窗#131、隔断#129互补；不改 footprint） */
  function stampZhuli(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'zhuli';
    const map = {
      zhuli: 'fence_zhuli',
      fence_zhuli: 'fence_zhuli',
      bamboo: 'fence_zhuli',
      huali: 'fence_huali',
      fence_huali: 'fence_huali',
      flower: 'fence_huali',
      chaifei: 'gate_chaifei',
      gate_chaifei: 'gate_chaifei',
      gate: 'gate_chaifei',
    };
    const key = map[kind] || 'fence_zhuli';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }


/** Site229：水缸/井栏/水桶 stamp（宅院角·巷口·井边·厨后·桥头点景；与井亭#130互补；不改 footprint） */
  function stampShuigang(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'shuigang';
    const map = {
      shuigang: 'prop_shuigang',
      prop_shuigang: 'prop_shuigang',
      jar: 'prop_shuigang',
      jinglan: 'prop_jinglan',
      prop_jinglan: 'prop_jinglan',
      well: 'prop_jinglan',
      shuitong: 'prop_shuitong',
      prop_shuitong: 'prop_shuitong',
      bucket: 'prop_shuitong',
    };
    const key = map[kind] || 'prop_shuigang';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }


/** Site231：柴堆/草垛/粮袋 stamp（宅后·厨侧·巷口·码头边·厩旁点景；与货摊#141、水缸#143互补；不改 footprint） */
  function stampChaidui(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'chaidui';
    const map = {
      chaidui: 'prop_chaidui',
      prop_chaidui: 'prop_chaidui',
      wood: 'prop_chaidui',
      firewood: 'prop_chaidui',
      caoduo: 'prop_caoduo',
      prop_caoduo: 'prop_caoduo',
      hay: 'prop_caoduo',
      straw: 'prop_caoduo',
      liangdai: 'prop_liangdai',
      prop_liangdai: 'prop_liangdai',
      sack: 'prop_liangdai',
      grain: 'prop_liangdai',
    };
    const key = map[kind] || 'prop_chaidui';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }

/** Site232：酒坛/陶瓮/酒旗 stamp（酒肆门前·宅侧巷口·码头边·厨房外·小院墙根点景；与货摊#141、水缸#143、柴堆#145互补；不改 footprint） */
  function stampJiutan(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'jiutan';
    const map = {
      jiutan: 'prop_jiutan',
      prop_jiutan: 'prop_jiutan',
      jar: 'prop_jiutan',
      wine: 'prop_jiutan',
      taoweng: 'prop_taoweng',
      prop_taoweng: 'prop_taoweng',
      urn: 'prop_taoweng',
      jiuqi: 'prop_jiuqi',
      prop_jiuqi: 'prop_jiuqi',
      flag: 'prop_jiuqi',
      banner: 'prop_jiuqi',
    };
    const key = map[kind] || 'prop_jiutan';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }

/** Site233：石磨/碾盘/石臼 stamp（厨侧·宅后·磨坊巷口·粮袋旁·厩侧点景；与柴堆#145、粮袋互补；不改 footprint） */
  function stampShima(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'shima';
    const map = {
      shima: 'prop_shima',
      prop_shima: 'prop_shima',
      mill: 'prop_shima',
      grindstone: 'prop_shima',
      nianpan: 'prop_nianpan',
      prop_nianpan: 'prop_nianpan',
      roller: 'prop_nianpan',
      shijiu: 'prop_shijiu',
      prop_shijiu: 'prop_shijiu',
      mortar: 'prop_shijiu',
      pestle: 'prop_shijiu',
    };
    const key = map[kind] || 'prop_shima';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }

/** Site227：货摊/货架/晾晒 stamp（主街两侧·巷口·桥头·宅前点景；与招牌#115/街具#118互补；不改 footprint） */

/** Site234：晾衣杆/鱼篓/竹筐 stamp（宅后晾衣·巷口筐篓·码头鱼篓·厨侧点景；与柴堆#145、货摊晾晒#141、石磨#146互补；不改 footprint） */
  function stampLiangyi(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'liangyi';
    const map = {
      liangyi: 'prop_liangyi',
      prop_liangyi: 'prop_liangyi',
      clothes: 'prop_liangyi',
      pole: 'prop_liangyi',
      yulou: 'prop_yulou',
      prop_yulou: 'prop_yulou',
      fishbasket: 'prop_yulou',
      zhukuang: 'prop_zhukuang',
      prop_zhukuang: 'prop_zhukuang',
      basket: 'prop_zhukuang',
    };
    const key = map[kind] || 'prop_liangyi';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }


/** Site235：鸡笼/鸟笼/鸭舍 stamp（宅后·厩旁·巷口挂笼·厨侧点景；与柴堆#145、石磨#146、晾衣#148互补；不改 footprint） */
  function stampJilong(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'jilong';
    const map = {
      jilong: 'prop_jilong',
      prop_jilong: 'prop_jilong',
      chicken: 'prop_jilong',
      coop: 'prop_jilong',
      niaolong: 'prop_niaolong',
      prop_niaolong: 'prop_niaolong',
      birdcage: 'prop_niaolong',
      cage: 'prop_niaolong',
      yashe: 'prop_yashe',
      prop_yashe: 'prop_yashe',
      duck: 'prop_yashe',
      goose: 'prop_yashe',
    };
    const key = map[kind] || 'prop_jilong';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }


/** Site236：蒲团/茶灶/茶具 stamp（廊下·石桌旁·庭院·茶摊侧点景；与石桌#142、货摊#141、鸡笼#149、晾衣#148互补；不改 footprint） */

/** Site237：书案/棋盘/笔架砚台 stamp（廊下·庭院石桌旁·书房外檐·茶席侧点景；与石桌#142、蒲团#150互补；≠seat_qiping；不改 footprint） */

/** Site238：花架/竹几/小博古架 stamp（庭院·廊下·豪宅侧院·茶席旁点景；与盆景#137、蒲团#150、书案#151互补；≠stone_baogu；不改 footprint） */
  function stampHuajia(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'huajia';
    const map = {
      huajia: 'prop_huajia',
      prop_huajia: 'prop_huajia',
      flowerstand: 'prop_huajia',
      rack: 'prop_huajia',
      zhuji: 'prop_zhuji',
      prop_zhuji: 'prop_zhuji',
      bamboo: 'prop_zhuji',
      table: 'prop_zhuji',
      bogu: 'prop_bogu',
      prop_bogu: 'prop_bogu',
      shelf: 'prop_bogu',
      antique: 'prop_bogu',
    };
    const key = map[kind] || 'prop_huajia';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }


/** Site240：庭院石灯笼/水盆/洗手钵 stamp（庭院·门前·廊下·影壁侧点景；≠街灯 prop_shideng / 水缸 prop_shuigang / 香炉；不改 footprint） */

/** Site241：蓑衣/斗笠/扁担 stamp（宅后·巷口·码头边·厨侧点景；与晾衣#148、柴堆#145、禽笼#149互补；不改 footprint） */

/** Site242：铜镜/梳妆匣/胭脂粉盒 stamp（闺房外檐·廊侧案几·豪宅内院点景；与花架#152、书案#151、博古架互补；不改 footprint） */
  function stampTongjing(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'tongjing';
    const map = {
      tongjing: 'prop_tongjing',
      prop_tongjing: 'prop_tongjing',
      mirror: 'prop_tongjing',
      bronze_mirror: 'prop_tongjing',
      shuzhuang: 'prop_shuzhuang',
      prop_shuzhuang: 'prop_shuzhuang',
      vanity: 'prop_shuzhuang',
      dressing_box: 'prop_shuzhuang',
      yanzhi: 'prop_yanzhi',
      prop_yanzhi: 'prop_yanzhi',
      rouge: 'prop_yanzhi',
      powder: 'prop_yanzhi',
    };
    const key = map[kind] || 'prop_tongjing';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }

  function stampSuoyi(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'suoyi';
    const map = {
      suoyi: 'prop_suoyi',
      prop_suoyi: 'prop_suoyi',
      raincoat: 'prop_suoyi',
      straw_coat: 'prop_suoyi',
      douli: 'prop_douli',
      prop_douli: 'prop_douli',
      bamboo_hat: 'prop_douli',
      hat: 'prop_douli',
      biandan: 'prop_biandan',
      prop_biandan: 'prop_biandan',
      pole: 'prop_biandan',
      carrying_pole: 'prop_biandan',
    };
    const key = map[kind] || 'prop_suoyi';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }

  function stampTingdeng(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'tingdeng';
    const map = {
      tingdeng: 'prop_tingdeng',
      prop_tingdeng: 'prop_tingdeng',
      courtyard_lantern: 'prop_tingdeng',
      ting_lantern: 'prop_tingdeng',
      shuipen: 'prop_shuipen',
      prop_shuipen: 'prop_shuipen',
      basin: 'prop_shuipen',
      water_basin: 'prop_shuipen',
      xishoubo: 'prop_xishoubo',
      prop_xishoubo: 'prop_xishoubo',
      washbowl: 'prop_xishoubo',
      handbasin: 'prop_xishoubo',
    };
    const key = map[kind] || 'prop_tingdeng';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }

  function stampHuangzi(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'huangzi';
    const map = {
      huangzi: 'prop_huangzi',
      prop_huangzi: 'prop_huangzi',
      banner: 'prop_huangzi',
      cloth: 'prop_huangzi',
      chuanleng: 'prop_chuanleng',
      prop_chuanleng: 'prop_chuanleng',
      stringlight: 'prop_chuanleng',
      lights: 'prop_chuanleng',
      zhaohuang: 'prop_zhaohuang',
      prop_zhaohuang: 'prop_zhaohuang',
      roundsign: 'prop_zhaohuang',
      diamond: 'prop_zhaohuang',
    };
    const key = map[kind] || 'prop_huangzi';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }

/** Site243：金鱼缸/多层花盆架/鹦鹉栖架 stamp（庭院·廊下·豪宅侧院点景；与盆景#137、花架#152、水缸#143、鸡笼鸟笼#149互补；勿覆盖 prop_penjing；不改 footprint） */
  function stampFengling(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'fengling';
    const map = {
      fengling: 'prop_fengling',
      prop_fengling: 'prop_fengling',
      windchime: 'prop_fengling',
      bell: 'prop_fengling',
      zhulian: 'prop_zhulian',
      prop_zhulian: 'prop_zhulian',
      bamboo_curtain: 'prop_zhulian',
      curtain: 'prop_zhulian',
      shaman: 'prop_shaman',
      prop_shaman: 'prop_shaman',
      gauze: 'prop_shaman',
      sheer: 'prop_shaman',
    };
    const key = map[kind] || 'prop_fengling';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }


/** Site248：糖葫芦/拨浪鼓/风筝 stamp（店前·巷口·广场边缘点景；与货摊#141、幌子#153互补；不改 footprint） */
  function stampTanghulu(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'tanghulu';
    const map = {
      tanghulu: 'prop_tanghulu',
      prop_tanghulu: 'prop_tanghulu',
      candied_haw: 'prop_tanghulu',
      hawthorn: 'prop_tanghulu',
      bolanggu: 'prop_bolanggu',
      prop_bolanggu: 'prop_bolanggu',
      rattle_drum: 'prop_bolanggu',
      pellet_drum: 'prop_bolanggu',
      fengzheng: 'prop_fengzheng',
      prop_fengzheng: 'prop_fengzheng',
      kite: 'prop_fengzheng',
      song_kite: 'prop_fengzheng',
    };
    const key = map[kind] || 'prop_tanghulu';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }

  function stampFangche(d, x, y, z, o = {}) {
    ensure();
    const kind = (o && o.kind) || 'fangche';
    const key = kind === 'xiubeng' ? 'prop_xiubeng' : kind === 'xiankuang' ? 'prop_xiankuang' : 'prop_fangche';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }

  function stampChapan(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'chapan';
    const map = {
      chapan: 'prop_chapan',
      prop_chapan: 'prop_chapan',
      tea_tray: 'prop_chapan',
      tray: 'prop_chapan',
      shihe: 'prop_shihe',
      prop_shihe: 'prop_shihe',
      food_box: 'prop_shihe',
      tiered_box: 'prop_shihe',
      guopan: 'prop_guopan',
      prop_guopan: 'prop_guopan',
      fruit_dish: 'prop_guopan',
      fruit: 'prop_guopan',
    };
    const key = map[kind] || 'prop_chapan';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }

  function stampShigandang(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'shigandang';
    const map = {
      shigandang: 'prop_shigandang',
      prop_shigandang: 'prop_shigandang',
      stone_tablet: 'prop_shigandang',
      tablet: 'prop_shigandang',
      menshen: 'prop_menshen',
      prop_menshen: 'prop_menshen',
      door_god: 'prop_menshen',
      door_gods: 'prop_menshen',
      nianhua: 'prop_nianhua',
      prop_nianhua: 'prop_nianhua',
      newyear: 'prop_nianhua',
      folk_print: 'prop_nianhua',
    };
    const key = map[kind] || 'prop_shigandang';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }


  function stampYugang(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'yugang';
    const map = {
      yugang: 'prop_yugang',
      prop_yugang: 'prop_yugang',
      goldfish: 'prop_yugang',
      fishbowl: 'prop_yugang',
      huapenjia: 'prop_huapenjia',
      prop_huapenjia: 'prop_huapenjia',
      potstand: 'prop_huapenjia',
      flowerpot_rack: 'prop_huapenjia',
      yingwujia: 'prop_yingwujia',
      prop_yingwujia: 'prop_yingwujia',
      parrot: 'prop_yingwujia',
      parrot_perch: 'prop_yingwujia',
    };
    const key = map[kind] || 'prop_yugang';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }

  function stampShuan(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'shuan';
    const map = {
      shuan: 'prop_shuan',
      prop_shuan: 'prop_shuan',
      desk: 'prop_shuan',
      table: 'prop_shuan',
      qipan: 'prop_qipan',
      prop_qipan: 'prop_qipan',
      board: 'prop_qipan',
      go: 'prop_qipan',
      bijia: 'prop_bijia',
      prop_bijia: 'prop_bijia',
      brushrest: 'prop_bijia',
      inkstone: 'prop_bijia',
    };
    const key = map[kind] || 'prop_shuan';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }

  function stampPutuan(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'putuan';
    const map = {
      putuan: 'prop_putuan',
      prop_putuan: 'prop_putuan',
      cushion: 'prop_putuan',
      mat: 'prop_putuan',
      chazao: 'prop_chazao',
      prop_chazao: 'prop_chazao',
      stove: 'prop_chazao',
      brazier: 'prop_chazao',
      chaju: 'prop_chaju',
      prop_chaju: 'prop_chaju',
      teaset: 'prop_chaju',
      tray: 'prop_chaju',
    };
    const key = map[kind] || 'prop_putuan';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }

  function stampHuotan(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'huotan';
    const map = {
      huotan: 'stall_huotan',
      stall: 'stall_huotan',
      stall_huotan: 'stall_huotan',
      huojia: 'rack_huojia',
      rack: 'rack_huojia',
      rack_huojia: 'rack_huojia',
      liangshai: 'pole_liangshai',
      pole: 'pole_liangshai',
      pole_liangshai: 'pole_liangshai',
    };
    const key = map[kind] || 'stall_huotan';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }

/** Site230：香炉/烛台/小供案 stamp（影壁前·宅门内·亭侧·巷口小龛·庭院角；与影壁#126、匾额#135互补；≠stone_lu；不改 footprint） */
  function stampXianglu(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'xianglu';
    const map = {
      xianglu: 'prop_xianglu',
      prop_xianglu: 'prop_xianglu',
      incense: 'prop_xianglu',
      zhutai: 'prop_zhutai',
      prop_zhutai: 'prop_zhutai',
      candle: 'prop_zhutai',
      gongan: 'prop_gongan_s',
      gongan_s: 'prop_gongan_s',
      prop_gongan_s: 'prop_gongan_s',
      altar: 'prop_gongan_s',
    };
    const key = map[kind] || 'prop_xianglu';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }

/** Site228：石桌/石凳/棋枰 stamp（庭院·巷角·亭侧·桥头·树下点景；与美人靠#134、街具#118互补；不改 footprint） */
  function stampShizhuo(d, x, y, z, o = {}) {
    ensure();
    const kind = o.kind || 'shizhuo';
    const map = {
      shizhuo: 'seat_shizhuo',
      seat_shizhuo: 'seat_shizhuo',
      table: 'seat_shizhuo',
      shideng: 'seat_shideng',
      seat_shideng: 'seat_shideng',
      stool: 'seat_shideng',
      qiping: 'seat_qiping',
      seat_qiping: 'seat_qiping',
      chess: 'seat_qiping',
    };
    const key = map[kind] || 'seat_shizhuo';
    stamp(d, key, x, y, z, { sx: o.sx || 1, sy: o.sy || 1 });
  }

  const AncientAtlas = {
    ensure, stamp, fillS, fillW, stampEaveTiles, stampChiwen, stampWalong, stampRailQueti, stampGualuo, stampDoorHardware, stampSoftDecor, stampPlatform, stampYingbi, stampRidgeBeasts, stampScreens, stampHitching, stampLouwindow, stampPavilions, stampChuihuamen, stampRockery, stampMeirenkao, stampBiane, stampBaogu, stampPenjing, stampShishi, stampGongdeng, stampZhuli, stampHuotan, stampShizhuo, stampShuigang, stampXianglu, stampChaidui, stampJiutan, stampShima, stampLiangyi, stampJilong, stampPutuan, stampShuan, stampHuajia, stampHuangzi, stampTingdeng, stampSuoyi, stampTongjing, stampYugang, stampFangche, stampFengling, stampChapan, stampShigandang, stampTanghulu, getAtlas, getFrames, getModules, MODULES,
    site201: { signboards: true, plaqueWood: true, vsignBoard: true, bannerCream: true, kitbash: true },
    site202: { paving: true, fangzhuan: true, tiaoshi: true, xiewen: true, drain: true, curb: true, kitbash: true },
    site203: { lattice: true, latticeGeshan: true, huachuang: true, geshanBubujin: true, kanchuang: true, kitbash: true },
    site204: { streetProps: true, shideng: true, shiteng: true, huagang: true, lampPole: true, kitbash: true },
    site205: { roofTiles: true, wadang: true, dishui: true, walong: true, yankou: true, kitbash: true },
    site206: { gableBrick: true, shangqiang: true, qingshui: true, chitou: true, wallCap: true, kitbash: true },
    site207: { railQueti: true, xunzhang: true, queti: true, gualuo: true, xiaozhu: true, kitbash: true },
    site208: { caihua: true, beamEfang: true, caihuaBand: true, dougongBlock: true, eaveBoard: true, kitbash: true },
    site209: { doorHardware: true, mending: true, pushou: true, menkan: true, baogu: true, kitbash: true },
    site210: { banners: true, qifan: true, weiman: true, liusu: true, hangOrnament: true, kitbash: true },
    site211: { platform: true, taiji: true, tiaotiao: true, chuidai: true, taduo: true, kitbash: true },
    site212: { yingbi: true, zhaobi: true, huaxin: true, screenBase: true, kitbash: true },
    site213: { ridgeBeasts: true, chiwen: true, zoushou: true, ornament: true, chuiji: true, kitbash: true },
    site214: { screens: true, luodizhao: true, partitionGeshan: true, yuedong: true, menkuang: true, kitbash: true },
    site215: { hitching: true, shuanma: true, shangma: true, ganddang: true, curbMarker: true, kitbash: true },
    site216: { louwindow: true, windowLou: true, wallHuaziang: true, brickToukong: true, latticeWall: true, kitbash: true },
    site217: { pavilions: true, jingting: true, luting: true, paifangS: true, roofTing: true, kitbash: true },
    site218: { chuihuamen: true, chuihua: true, menlouS: true, menzhao: true, menzhu: true, kitbash: true },
    site219: { rockery: true, rockTaihu: true, rockDieshi: true, rockPeakS: true, plantRockMoss: true, kitbash: true },
    site220: { meirenkao: true, feilaichi: true, zuokan: true, benchLang: true, kitbash: true },
    site221: { biane: true, duilian: true, zhaopaiS: true, hanging: true, kitbash: true },
    site222: { baogu: true, stoneBaogu: true, stoneMendun: true, stoneLu: true, kitbash: true },
    site223: { penjing: true, potPenjing: true, bedHuatan: true, stoneShitai: true, kitbash: true },
    site224: { shishi: true, stoneShishi: true, stoneShishiS: true, kitbash: true },
    site225: { gongdeng: true, lanternGong: true, lanternSha: true, lanternStand: true, kitbash: true },
    site226: { zhuli: true, fenceZhuli: true, fenceHuali: true, gateChaifei: true, kitbash: true },
    site227: { huotan: true, stallHuotan: true, rackHuojia: true, poleLiangshai: true, kitbash: true },
    site228: { shizhuo: true, seatShizhuo: true, seatShideng: true, seatQiping: true, kitbash: true },
    site229: { shuigang: true, propShuigang: true, propJinglan: true, propShuitong: true, kitbash: true },
    site230: { xianglu: true, propXianglu: true, propZhutai: true, propGonganS: true, kitbash: true },
    site231: { chaidui: true, propChaidui: true, propCaoduo: true, propLiangdai: true, kitbash: true },
    site232: { jiutan: true, propJiutan: true, propTaoweng: true, propJiuqi: true, kitbash: true },
    site233: { shima: true, propShima: true, propNianpan: true, propShijiu: true, kitbash: true },
    site234: { liangyi: true, propLiangyi: true, propYulou: true, propZhukuang: true, kitbash: true },
    site235: { jilong: true, propJilong: true, propNiaolong: true, propYashe: true, kitbash: true },
    site236: { putuan: true, propPutuan: true, propChazao: true, propChaju: true, kitbash: true },
    site237: { shuan: true, propShuan: true, propQipan: true, propBijia: true, kitbash: true },
    site238: { huajia: true, propHuajia: true, propZhuji: true, propBogu: true, kitbash: true },
    site239: { huangzi: true, propChuanleng: true, propHuangzi: true, propZhaohuang: true, kitbash: true },
    site240: { tingdeng: true, propTingdeng: true, propShuipen: true, propXishoubo: true, kitbash: true },
    site241: { suoyi: true, propSuoyi: true, propDouli: true, propBiandan: true, kitbash: true },
    site242: { tongjing: true, propTongjing: true, propShuzhuang: true, propYanzhi: true, kitbash: true },
    site243: { yugang: true, propYugang: true, propHuapenjia: true, propYingwujia: true, kitbash: true },
    site244: { fangche: true, propFangche: true, propXiubeng: true, propXiankuang: true, kitbash: true },
    site245: { fengling: true, propFengling: true, propZhulian: true, propShaman: true, kitbash: true },
    site246: { chapan: true, propChapan: true, propShihe: true, propGuopan: true, kitbash: true },
    site247: { shigandang: true, propShigandang: true, propMenshen: true, propNianhua: true, kitbash: true },
    site248: { tanghulu: true, propTanghulu: true, propBolanggu: true, propFengzheng: true, kitbash: true },
    get _makeCanvas() { return _makeCanvas; },
    set _makeCanvas(v) { _makeCanvas = v; },
  };
  root.AncientAtlas = AncientAtlas;
})(typeof window !== 'undefined' ? window : globalThis);

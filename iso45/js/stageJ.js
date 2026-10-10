/* scene-proto-45 · Stage J: scan log book, laundry→wardrobe chain, wear tip, fee→物业微信, rx polish.
   Does not rewrite Char-A appearance / NPC_SPEC / civic exteriors. */
(function (SP) {
  "use strict";
  const J = (SP.stageJ = {});
  const G = () => SP.game, R = () => G() && G().rules, C = () => SP.clock;
  const toast = (t, ms) => SP.toast && SP.toast(t, ms || 3000);
  const log = (t) => SP.world && SP.world.logEvent(t);
  const ps = () => G() && G().ps;
  const A = () => SP.stageA;
  const E = () => SP.stageE;
  const F = () => SP.stageF;
  const SI = () => SP.stageI;
  const SH = () => SP.stageH;

  const LOG_MAX = 24;

  J.ensure = function () {
    const p = ps(); if (!p) return null;
    p.flags = p.flags || {};
    if (!p.scanLog) p.scanLog = [];
    return p;
  };

  // ---------- 1) Visitor scan log book ----------
  J.pushScan = function (ok, detail, kind) {
    J.ensure();
    const row = {
      t: (E() && E().stamp && E().stamp()) || "",
      abs: C().abs(),
      day: F() ? F().dayKey() : 0,
      ok: !!ok,
      detail: detail || "",
      kind: kind || (ok ? "pass" : "visitor")
    };
    ps().scanLog.unshift(row);
    if (ps().scanLog.length > LOG_MAX) ps().scanLog.length = LOG_MAX;
    return row;
  };

  J.renderScanLog = function () {
    J.ensure();
    const rows = ps().scanLog || [];
    if (!rows.length) return `<div class="jscan"><p class="hint">暂无扫码记录。进出馨园门禁会出现在这里。</p></div>`;
    return `<div class="jscan">${rows.slice(0, 16).map((r) => `
      <div class="jscan-row ${r.ok ? "ok" : "vis"}">
        <b>${r.ok ? "通行" : "访客"}</b>
        <span>D${r.day} ${r.t || ""}</span>
        <p>${r.detail || "—"}</p>
      </div>`).join("")}</div>`;
  };

  J.openScanLogMenu = function (from) {
    J.ensure();
    const rows = ps().scanLog || [];
    const preview = rows.slice(0, 5).map((r, i) =>
      ({ id: "row" + i, ok: true, label: `${r.ok ? "✓" : "·"} D${r.day} ${r.detail || "记录"}`, fn: () => null })
    );
    const opts = [
      { id: "view", ok: true, label: `查看登记簿（共 ${rows.length} 条）`,
        fn: () => {
          if (A() && A().openPhone) {
            // stash flag so phone more/daylog can show — use toast summary + phone bag-like
            toast(rows.length ? rows.slice(0, 3).map((r) => `${r.ok ? "通行" : "访客"} ${r.detail}`).join(" / ") : "登记簿为空", 4000);
            A().openPhone("scanlog");
          } else toast(J.renderScanLog().replace(/<[^>]+>/g, " "));
          return null;
        } },
      ...preview,
      { id: "clear", ok: rows.length > 0, label: "清空演示记录",
        fn: () => { ps().scanLog = []; toast("登记簿已清空"); return null; } },
      { id: "cancel", ok: true, label: "关掉", fn: () => null }
    ];
    G().openMenu(Object.assign({}, from || {}, { _name: "门禁登记簿" }), opts);
  };

  J.wrapScan = function () {
    const si = SI(); if (!si || si._jScan) return;
    si._jScan = true;
    const prev = si.playScan.bind(si);
    si.playScan = function (ok, detail, thenFn) {
      J.pushScan(ok, detail, ok ? "pass" : "visitor");
      return prev(ok, detail, thenFn);
    };
  };

  J.polishScanReview = function () {
    const g = G(); if (!g || g._jScanReview) return; g._jScanReview = true;
    const prev = g.use.bind(g);
    g.use = function (o) {
      if (o && (o.id === "xin_notice" || o.id === "xin_mail" || o.interact === "gate")) {
        J.ensure();
        if ((ps().scanLog || []).length) {
          // inject via menu when stageH/F may already intercept — offer after their menus by wrapping present path
          // For gate: SP.presentAtGate may open menu; we add review via phone + explicit on notice when renew not urgent
        }
      }
      // xin notice: if access ok and not in renew urgency, add log book option by wrapping openMenu calls — simpler: patch after stageH
      return prev(o);
    };

    // Hook presentAtGate / renew menus by wrapping openMenu
    if (!g._jOpenMenu) {
      g._jOpenMenu = true;
      const prevOM = g.openMenu.bind(g);
      g.openMenu = function (o, opts) {
        const name = (o && o._name) || "";
        const isXin = /馨园|门禁|物业|铁门|门岗/.test(name) || (o && (o.id === "xin_notice" || o.id === "xin_mail" || o.interact === "gate"));
        if (isXin && opts && !opts.some((x) => x.id === "scanlog")) {
          opts = opts.slice();
          opts.splice(Math.max(0, opts.length - 1), 0, {
            id: "scanlog", ok: true, label: "查阅门禁登记簿…",
            fn: () => { J.openScanLogMenu(o); return null; }
          });
        }
        return prevOM(o, opts);
      };
    }

    // phone tab scanlog
    const SA = A();
    if (SA && !SA._jScanPhone) {
      SA._jScanPhone = true;
      const prevP = SA.openPhone.bind(SA);
      SA.openPhone = function (tab, threadId) {
        prevP(tab, threadId);
        if (tab === "scanlog" || tab === "home") {
          const el = document.getElementById("phonepanel"); if (!el) return;
          if (tab === "home" || !tab) {
            const grid = el.querySelector(".app-grid");
            if (grid && !grid.querySelector('[data-tab="scanlog"]')) {
              const btn = document.createElement("button");
              btn.className = "app-ico"; btn.dataset.tab = "scanlog";
              btn.innerHTML = `<span class="ic" style="background:#5856d6">🛂</span><span class="nm">门禁</span>`;
              btn.onclick = () => SA.openPhone("scanlog");
              grid.appendChild(btn);
            }
          } else if (tab === "scanlog") {
            const head = el.querySelector(".phd b"); if (head) head.textContent = "门禁登记簿";
            const body = el.querySelector(".pbd");
            if (body) body.innerHTML = J.renderScanLog() + `<p class="hint">物业/门岗菜单也可查阅。最多保留 ${LOG_MAX} 条。</p>`;
          }
        }
      };
    }
  };

  // ---------- 2) Todo chain: collect → suggest change outfit ----------
  J.suggestChangeOutfit = function () {
    J.ensure();
    if (ps().flags.outfit_suggest_open) return;
    ps().flags.outfit_suggest_open = true;
    toast("衣服收好了——要不要换一身干净的？", 3200);
    const opts = [
      {
        id: "change_rules", ok: true, label: "换上干净衣服（洗衣系统）",
        fn: () => {
          ps().flags.outfit_suggest_open = false;
          const w = SP.world && SP.world.byId && (SP.world.byId.wardrobe || SP.world.byId.closet);
          const r = G().start("change_clothes", w || { interact: "wardrobe" });
          if (r && r.ok === false) toast(r.reason || "现在不能换");
          else toast("换上干净衣服了");
          // also open appearance wardrobe if available
          if (SP.appearance && SP.appearance.openWardrobe) {
            setTimeout(() => {
              try { SP.appearance.openWardrobe(); } catch (e) {}
            }, 400);
          }
          if (F()) F().pushLog("outfit", "收衣后换装", { place: "room_xin_102" });
          return null;
        }
      },
      {
        id: "wardrobe_ui", ok: !!(SP.appearance && SP.appearance.openWardrobe),
        label: SP.appearance ? "打开衣柜外观换装…" : "衣柜外观（未接入）",
        fn: () => {
          ps().flags.outfit_suggest_open = false;
          if (SP.appearance && SP.appearance.openWardrobe) SP.appearance.openWardrobe();
          else toast("外观衣柜暂未开放");
          return null;
        }
      },
      {
        id: "later", ok: true, label: "稍后再说",
        fn: () => { ps().flags.outfit_suggest_open = false; toast("记得换洗哦"); return null; }
      }
    ];
    G().openMenu({ _name: "收衣完成 · 换装建议", interact: "wardrobe" }, opts);
  };

  J.wrapCollectChain = function () {
    const g = G(); if (!g || g._jCollect) return; g._jCollect = true;
    const prev = g.start.bind(g);
    g.start = function (id, o) {
      const beforeRack = !!(ps().clothes && ps().clothes.rack && ps().clothes.rack.balcony);
      const r = prev(id, o);
      if (id === "collect_clothes") {
        const afterRack = !!(ps().clothes && ps().clothes.rack && ps().clothes.rack.balcony);
        if (beforeRack && !afterRack) {
          setTimeout(() => { try { J.suggestChangeOutfit(); } catch (e) {} }, 500);
        }
      }
      return r;
    };
  };

  // ---------- 3) Wear × weather/overtime tip on HUD ----------
  J.wearTipText = function () {
    const L = (R() && R().data.laundry) || {};
    const thr = L.wear_dirty_h || 20;
    const work = L.work_wear_mul != null ? L.work_wear_mul : 1.5;
    const sleep = L.sleep_wear_mul != null ? L.sleep_wear_mul : 0.3;
    let weather = "晴";
    let wmul = 1;
    try {
      const wn = C().weatherName && C().weatherName();
      weather = wn || C().weather || "clear";
      // outdoor drying mul related; for wear, season_mul affects feel
      const season = C().season || "spring";
      const sm = (L.season_mul && L.season_mul[season]) || 1;
      wmul = sm;
    } catch (e) {}
    const cl = ps().clothes;
    const wh = cl ? (cl.worn_h || 0) : 0;
    const pct = Math.min(100, Math.round(wh / thr * 100));
    return `穿着磨损 ${pct}%（脏线 ${thr}h）· 上班×${work} 睡觉×${sleep} · 季节系数×${wmul} · 天气 ${weather}`;
  };

  J.polishWearTip = function () {
    const sh = SH(); if (!sh || sh._jWearTip) return;
    sh._jWearTip = true;
    const prev = sh.clothesChip.bind(sh);
    sh.clothesChip = function () {
      let html = prev();
      try {
        const tip = J.wearTipText();
        // add title + clickable marker
        html = html.replace('title="洗衣状态"', `title="${tip.replace(/"/g, "'")}" data-wear-tip="1"`);
        html = html.replace("</span>", ` <small class="wear-tip-q">?</small></span>`);
      } catch (e) {}
      return html;
    };
    // click tip
    setInterval(() => {
      try {
        const chip = document.querySelector(".cloth-chip[data-wear-tip]");
        if (chip && !chip._jBound) {
          chip._jBound = true;
          chip.style.cursor = "pointer";
          chip.onclick = () => toast(J.wearTipText(), 4500);
        }
      } catch (e) {}
    }, 1500);
  };

  // ---------- 4) Fee receipt → 物业 WeChat ----------
  J.mirrorFeeToPropertyWx = function (fee) {
    J.ensure();
    if (ps().flags.wx_fee_receipt_pushed) return;
    ps().flags.wx_fee_receipt_pushed = true;
    const amt = fee || 45;
    if (E()) {
      E().wxPush("property", `（系统）已收到物业费 ¥${amt}，电子凭证已放入租户背包。`, true);
      E().wxPush("property", `我交了物业费 ¥${amt}，凭证在手机里。`, false);
      E().wxPush("property", "好的，账上已平。门禁续期也帮你办了。", true);
    }
    if (F()) F().pushLog("wx_fee", `物业微信：物业费凭证 ¥${amt}`, { place: "xin" });
  };

  J.wrapFeeWx = function () {
    const si = SI(); if (!si || si._jFeeWx) return;
    // renewByFee already wrapped in stageI; wrap again on stageH
    const sh = SH(); if (!sh || sh._jFeeWx) return;
    sh._jFeeWx = true;
    const prev = sh.renewByFee.bind(sh);
    sh.renewByFee = function () {
      ps().flags.wx_fee_receipt_pushed = false; // allow push each renew
      const before = ps().money;
      const ok = prev();
      if (ok) {
        const fee = before - ps().money;
        J.mirrorFeeToPropertyWx(fee);
      }
      return ok;
    };

    // property thread replies for fee
    const SA = A();
    if (SA && !SA._jFeeReplies) {
      SA._jFeeReplies = true;
      const prevT = SA.threads.bind(SA);
      SA.threads = function () {
        const chat = prevT();
        const th = chat.property;
        if (th) {
          th.replies = (th.replies || []).slice();
          if (!th.replies.some((r) => r.id === "fee_ask")) {
            th.replies.push({
              id: "fee_ask",
              label: "物业费凭证怎么给你们看？",
              them: [
                "手机背包里打开出示即可，或微信发我一张截图。",
                "一楼公告栏旁也可以当面核验缴费凭证。",
                "系统里有记录也行，带纸质/电子凭证更快。"
              ]
            });
          }
          if (E() && E().hasItem("property_fee_receipt") && !th.replies.some((r) => r.id === "fee_show")) {
            th.replies.unshift({
              id: "fee_show",
              label: "我包里有物业费凭证",
              them: [
                "收到，账上平了，谢谢配合。",
                "好的，门禁权限按凭证续期处理。",
                "嗯，登记簿也给你备注「已缴费」。"
              ]
            });
          }
        }
        return chat;
      };
    }
  };

  // ---------- 5) Hospital rx present polish ----------
  J.polishRx = function () {
    const SF = F(); if (!SF || SF._jRx) return;
    SF._jRx = true;
    // richer hospital outcomes
    if (SF.OUTCOMES && SF.OUTCOMES.hospital) {
      SF.OUTCOMES.hospital.rx_slip = {
        ok: true,
        text: "护士小周：处方在有效期内。请到药房窗口取药；如已取药请按疗程服用，有不适再来复诊。"
      };
      SF.OUTCOMES.hospital.med_cold = SF.OUTCOMES.hospital.med_cold || {
        ok: true,
        text: "小周：药带着呢？记得多喝水，别自行加量。"
      };
    }
    // when presenting rx at hospital, also wx aunt + daylog place hospital
    const prev = SF.presentItem.bind(SF);
    SF.presentItem = function (target, itemId) {
      prev(target, itemId);
      if (target === "hospital" && itemId === "rx_slip" && SF.alreadyShown("hospital", "rx_slip")) {
        if (E()) {
          E().wxPush("aunt", "阿姨，护士说处方有效，我按医嘱吃药。", false);
          E().wxPush("aunt", "乖，按时吃，别熬夜。", true);
        }
        // pharmacy hint
        if (SP.world && SP.world.sceneId === "civic_hospital") {
          toast("提示：药房窗口可凭处方取药（若尚未购买）", 3000);
        }
      }
    };

    // ensure meds can be "shown" as soft docs at hospital — optional add to DOC_IDS only for hospital menu
    // keep DOC_IDS as docs; meds stay use-only
  };

  // ---------- install ----------
  J.install = function () {
    const g = G(); if (!g || g._stageJ) return; g._stageJ = true;
    J.ensure();
    J.wrapScan();
    J.polishScanReview();
    J.wrapCollectChain();
    J.polishWearTip();
    J.wrapFeeWx();
    J.polishRx();
    if (!document.getElementById("stageJ-css")) {
      const st = document.createElement("style"); st.id = "stageJ-css";
      st.textContent = `
        .jscan{color:#f5f5f7;font-size:13px}
        .jscan-row{padding:10px 0;border-bottom:1px solid #2c2c2e}
        .jscan-row b{margin-right:8px}
        .jscan-row.ok b{color:#30d158}
        .jscan-row.vis b{color:#ff9f0a}
        .jscan-row span{color:#8e8e93;font-size:11px}
        .jscan-row p{margin:4px 0 0;line-height:1.35}
        .wear-tip-q{opacity:.7;font-size:10px;margin-left:2px}
      `;
      document.head.appendChild(st);
    }
  };

  const boot = () => {
    if (SP.game && SP.game.ps && SP.stageI && SP.stageH) J.install();
    else setTimeout(boot, 120);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.SP || (window.SP = {}));

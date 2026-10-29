/* 区级总览。选一个区，镜头缓移到该区可玩范围的中心并拉远。
 * 鹰山宋城等 teleport 区会把人物一并送到 spawn（南广场），否则人物留在原地。
 * 不调用 chunks.loadAll，远景仍走 Site129–131 的视锥分块和补洞。 */
(function (SP) {
  'use strict';
  if (!SP || SP.districtJump) return;
  const root = typeof window !== 'undefined' ? window : globalThis;
  function list() {
    const N = root.RONGQIAO_NORTH || {};
    const out = [{ id: 'rongqiao', name: '榕桥区', rect: [-178, -80, 300, 360] }];
    const hedong = N.expansionP10 && N.expansionP10.district;
    if (hedong && hedong.length >= 4) out.push({ id: 'hedong', name: '月河区·河东', rect: hedong.slice(0, 4) });
    const nanbu = N.expansionP11 && N.expansionP11.district;
    if (nanbu && nanbu.length >= 4) out.push({ id: 'nanbu', name: '南埠', rect: nanbu.slice(0, 4) });
    const song = N.expansionSongcheng;
    if (song && song.district && song.district.length >= 4) {
      out.push({
        id: 'songcheng',
        name: (song.names && song.names.district) || '鹰山宋城',
        rect: song.district.slice(0, 4),
        spawn: song.spawn,
        teleport: !!song.teleport,
      });
    }
    return out;
  }
  function go(id) {
    const d = list().find((x) => x.id === id);
    if (!d) return { ok: false, reason: '没有这个区' };
    const cam = SP.cameraNavigation;
    if (!cam || typeof cam.overview !== 'function') return { ok: false, reason: '镜头还没准备好' };
    let teleported = false;
    if (d.teleport && d.spawn && SP.player) {
      const p = SP.player;
      p.x = d.spawn[0];
      p.y = d.spawn[1];
      if (d.spawn[2] && typeof p.setDir === 'function') p.setDir(d.spawn[2]);
      if (SP.cam) { SP.cam.pan = [0, 0]; SP.cam.ready = false; SP.cam.lock = null; SP.cam.lockFrom = null; }
      teleported = true;
    }
    const r = cam.overview(d.rect);
    if (r && r.ok && SP.toast) {
      SP.toast(
        teleported
          ? '已传送到「' + d.name + '」南广场，镜头为区级总览。走两步即回到跟随。'
          : '镜头移到「' + d.name + '」总览。人物没有移动。走两步即回到跟随，或在手机地图里点「恢复人物镜头跟随」。',
        3600,
      );
    }
    return r || { ok: false, reason: '现在不能切换区级总览' };
  }
  SP.districtJump = { list, go };
  const doc = root.document;
  if (!doc || !doc.body || doc.getElementById('district-jump-hud')) return;
  const bar = doc.createElement('div');
  bar.id = 'district-jump-hud';
  bar.setAttribute('role', 'toolbar');
  bar.setAttribute('aria-label', '区级总览');
  const label = doc.createElement('span');
  label.textContent = '总览';
  bar.appendChild(label);
  function rebuild() {
    const nodes = bar.childNodes ? Array.from(bar.childNodes) : [];
    for (const n of nodes) { if (n !== label && bar.contains && bar.contains(n)) bar.removeChild(n); else if (n !== label) try { bar.removeChild(n); } catch (e) {} }
    for (const d of list()) {
      const b = doc.createElement('button');
      b.type = 'button';
      b.textContent = d.name;
      b.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const r = go(d.id);
        if (!r || !r.ok) SP.toast && SP.toast((r && r.reason) || '现在不能切换区级总览');
      });
      bar.appendChild(b);
    }
  }
  rebuild();
  /* defer 片区登记后补一次按钮（鹰山宋城） */
  root.setTimeout(rebuild, 0);
  root.setTimeout(rebuild, 800);
  for (const type of ['pointerdown', 'mousedown', 'touchstart', 'click']) bar.addEventListener(type, (ev) => ev.stopPropagation());
  doc.body.appendChild(bar);
})(typeof window !== 'undefined' ? window.SP : globalThis.SP);

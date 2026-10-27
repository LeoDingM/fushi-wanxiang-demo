/* 区级总览。选一个区，镜头缓移到该区可玩范围的中心并拉远。人物留在原地。
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
    return out;
  }
  function go(id) {
    const d = list().find((x) => x.id === id);
    if (!d) return { ok: false, reason: '没有这个区' };
    const cam = SP.cameraNavigation;
    if (!cam || typeof cam.overview !== 'function') return { ok: false, reason: '镜头还没准备好' };
    const r = cam.overview(d.rect);
    if (r && r.ok && SP.toast) SP.toast('镜头移到「' + d.name + '」总览。人物没有移动。走两步即回到跟随，或在手机地图里点「恢复人物镜头跟随」。', 3600);
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
  for (const type of ['pointerdown', 'mousedown', 'touchstart', 'click']) bar.addEventListener(type, (ev) => ev.stopPropagation());
  doc.body.appendChild(bar);
})(typeof window !== 'undefined' ? window.SP : globalThis.SP);

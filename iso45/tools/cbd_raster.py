"""浮世万象 · CBD kit rasterizer (tools/build_cbd.py uses it). A tiny analytic ray caster with the EXACT 45° camera of the
kit (orthographic, yaw 45, pitch 30 -> 2:1 dimetric, 32 px per metre on x-y, 39.19 px per metre on z, sun_world from
kit/kit_manifest.json) that turns a list of primitives (boxes with yaw, vertical cylinders, ellipsoids, faceted blobs)
into pixel-art sprites: 4-tone ramp shading under the sun, self/cast shadows, per-material grain, ink outline, depth
contours. Per frame it also returns an emissive layer (night), an up-facing snow mask and a ground shadow mask."""
import math
import numpy as np

PZ = 39.1918; KX = 32.0; KY = 16.0
SUN = np.array([-0.0776, -0.7239, 0.6855]); SUN = SUN / np.linalg.norm(SUN)
RAY = np.array([1.0, 1.0, -KX / PZ])                    # camera ray (screen point fixed), not normalised; t = depth
def hexc(h): h = h.lstrip("#"); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], float)
_fib = []
for i in range(40):
    zc = 1 - (i + 0.5) / 40 * 1.6; r = math.sqrt(max(0, 1 - zc * zc)); a = i * 2.39996
    _fib.append((r * math.cos(a), r * math.sin(a), zc))
FACETS = np.array(_fib); FACETS /= np.linalg.norm(FACETS, axis=1)[:, None]

class Prim:
    def __init__(s, kind, mat, **k): s.kind = kind; s.mat = mat; s.__dict__.update(k)
    def corners(s):
        if s.kind == "box":
            c, h, a = s.c, s.h, s.yaw; ca, sa = math.cos(a), math.sin(a); out = []
            for dx in (-1, 1):
                for dy in (-1, 1):
                    for dz in (-1, 1):
                        x, y = dx * h[0], dy * h[1]; out.append((c[0] + x * ca - y * sa, c[1] + x * sa + y * ca, c[2] + dz * h[2]))
            return out
        if s.kind == "cyl":
            r = s.r; return [(s.c[0] + dx * r, s.c[1] + dy * r, z) for dx in (-1, 1) for dy in (-1, 1) for z in (s.z0, s.z1)]
        r = s.r; return [(s.c[0] + dx * r[0], s.c[1] + dy * r[1], s.c[2] + dz * r[2]) for dx in (-1, 1) for dy in (-1, 1) for dz in (-1, 1)]
    def hit(s, O, D):
        """O (N,3), D (3,) -> t (N,) (inf = miss), n (N,3)"""
        N = O.shape[0]; t = np.full(N, np.inf); n = np.zeros((N, 3))
        if s.kind == "box":
            ca, sa = math.cos(-s.yaw), math.sin(-s.yaw); c = np.array(s.c)
            P = O - c; Pl = np.stack([P[:, 0] * ca - P[:, 1] * sa, P[:, 0] * sa + P[:, 1] * ca, P[:, 2]], 1)
            Dl = np.array([D[0] * ca - D[1] * sa, D[0] * sa + D[1] * ca, D[2]])
            h = np.array(s.h); tmin = np.full(N, -np.inf); tmax = np.full(N, np.inf); ax = np.zeros(N, int); sg = np.zeros(N)
            for i in range(3):
                if abs(Dl[i]) < 1e-12:
                    bad = np.abs(Pl[:, i]) > h[i]; tmin[bad] = np.inf; continue
                t1 = (-h[i] - Pl[:, i]) / Dl[i]; t2 = (h[i] - Pl[:, i]) / Dl[i]
                lo = np.minimum(t1, t2); hi = np.maximum(t1, t2)
                upd = lo > tmin; tmin = np.where(upd, lo, tmin); ax = np.where(upd, i, ax); sg = np.where(upd, -np.sign(Dl[i]), sg)
                tmax = np.minimum(tmax, hi)
            ok = (tmin <= tmax) & (tmin > 1e-6)
            t[ok] = tmin[ok]
            nl = np.zeros((N, 3)); nl[np.arange(N), ax] = sg
            ca2, sa2 = math.cos(s.yaw), math.sin(s.yaw)
            n = np.stack([nl[:, 0] * ca2 - nl[:, 1] * sa2, nl[:, 0] * sa2 + nl[:, 1] * ca2, nl[:, 2]], 1)
        elif s.kind == "cyl":
            cx, cy = s.c; ox = O[:, 0] - cx; oy = O[:, 1] - cy
            a = D[0] ** 2 + D[1] ** 2; b = 2 * (ox * D[0] + oy * D[1]); cc = ox * ox + oy * oy - s.r * s.r
            disc = b * b - 4 * a * cc; ok = disc >= 0; sq = np.sqrt(np.where(ok, disc, 0))
            ts = (-b - sq) / (2 * a); z = O[:, 2] + ts * D[2]; side = ok & (z >= s.z0) & (z <= s.z1) & (ts > 1e-6)
            t = np.where(side, ts, np.inf)
            n = np.stack([(ox + ts * D[0]) / s.r, (oy + ts * D[1]) / s.r, np.zeros(N)], 1)
            for zc, nz in ((s.z1, 1.0), (s.z0, -1.0)):
                if abs(D[2]) < 1e-12: continue
                tc = (zc - O[:, 2]) / D[2]; px = ox + tc * D[0]; py = oy + tc * D[1]
                cap = (px * px + py * py <= s.r * s.r) & (tc > 1e-6) & (tc < t)
                t = np.where(cap, tc, t); n[cap] = (0, 0, nz)
            if getattr(s, "segs", 0):           # faceted prism look: snap the side normal to N directions
                ang = np.round(np.arctan2(n[:, 1], n[:, 0]) / (2 * math.pi / s.segs)) * (2 * math.pi / s.segs)
                sidem = np.abs(n[:, 2]) < 0.5; n[sidem, 0] = np.cos(ang[sidem]); n[sidem, 1] = np.sin(ang[sidem])
        else:                                    # ellipsoid / faceted blob
            r = np.array(s.r); c = np.array(s.c); Os = (O - c) / r; Ds = D / r
            a = Ds @ Ds; b = 2 * (Os @ Ds); cc = (Os * Os).sum(1) - 1
            disc = b * b - 4 * a * cc; ok = disc >= 0; sq = np.sqrt(np.where(ok, disc, 0))
            ts = (-b - sq) / (2 * a); ok &= ts > 1e-6
            t = np.where(ok, ts, np.inf)
            p = Os + ts[:, None] * Ds; n = p / r; n /= np.maximum(1e-9, np.linalg.norm(n, axis=1))[:, None]
            if s.kind == "blob":
                j = getattr(s, "jit", 0)
                k = (n @ FACETS.T).argmax(1); n = FACETS[k].copy()
                if j: n += (np.sin(k * 12.9898 + s.seed)[:, None] * j * np.array([1, 0.6, 0.2]))
                n /= np.linalg.norm(n, axis=1)[:, None]
        return t, n

class Model:
    """piece builder: primitives in metres around the piece origin; rot k turns the model +k*45° about z"""
    def __init__(s, rot=0): s.prims = []; s.a = rot * math.pi / 4
    def _p(s, x, y): ca, sa = math.cos(s.a), math.sin(s.a); return (x * ca - y * sa, x * sa + y * ca)
    def box(s, mat, a, b, yaw=0.0):
        c = [(a[i] + b[i]) / 2 for i in range(3)]; h = [abs(b[i] - a[i]) / 2 for i in range(3)]
        cx, cy = s._p(c[0], c[1]); s.prims.append(Prim("box", mat, c=(cx, cy, c[2]), h=h, yaw=yaw + s.a)); return s
    def cyl(s, mat, c, r, z0, z1, segs=0):
        cx, cy = s._p(*c); s.prims.append(Prim("cyl", mat, c=(cx, cy), r=r, z0=z0, z1=z1, segs=segs)); return s
    def ell(s, mat, c, r, blob=False, seed=0, jit=0.0):
        cx, cy = s._p(c[0], c[1]); rr = (r, r, r) if np.isscalar(r) else r
        if s.a and rr[0] != rr[1]: ca, sa = abs(math.cos(s.a)), abs(math.sin(s.a)); rr = (rr[0] * ca + rr[1] * sa, rr[0] * sa + rr[1] * ca, rr[2])
        s.prims.append(Prim("blob" if blob else "ell", mat, c=(cx, cy, c[2]), r=rr, seed=seed, jit=jit)); return s

def trace(prims, O, D, skip=None):
    N = O.shape[0]; T = np.full(N, np.inf); Nn = np.zeros((N, 3)); M = np.full(N, -1)
    for i, p in enumerate(prims):
        t, n = p.hit(O, D); b = t < T; T[b] = t[b]; Nn[b] = n[b]; M[b] = i
    return T, Nn, M

def scr(p): return ((p[0] - p[1]) * KX, (p[0] + p[1]) * KY + p[2] * PZ)      # (sx, screen-up)

def render(model, mats, pad=2, shadow=True, outline=True):
    """-> dict(img RGBA uint8, emit RGBA, snow RGBA, shadow RGBA + its anchor, anchor, w, h)"""
    prims = model.prims
    if not prims: return None
    pts = [c for p in prims for c in p.corners()]
    xs = [scr(c)[0] for c in pts]; ys = [scr(c)[1] for c in pts]
    x0, x1 = math.floor(min(xs)) - pad, math.ceil(max(xs)) + pad; y0, y1 = math.floor(min(ys)) - pad, math.ceil(max(ys)) + pad
    W, H = x1 - x0, y1 - y0
    ztop = max(c[2] for c in pts) + 1
    jj, ii = np.mgrid[0:H, 0:W]; X = x0 + ii.ravel() + 0.5; U = y1 - jj.ravel() - 0.5
    a = X / KX; b = (U - ztop * PZ) / KY
    O = np.stack([(a + b) / 2, (b - a) / 2, np.full(a.shape, ztop)], 1)
    T, Nn, M = trace(prims, O, RAY)
    hit = np.isfinite(T); P = O + T[:, None] * RAY
    # cast shadows (sun rays from the hit point)
    sh = np.zeros(len(T), bool)
    if hit.any():
        Ps = P[hit] + Nn[hit] * 0.01
        ts, _, _ = trace(prims, Ps, SUN); sh[np.where(hit)[0]] = np.isfinite(ts)
    lam = np.clip(Nn @ SUN, 0, 1) * (~sh)
    rgb = np.zeros((len(T), 3)); emit = np.zeros((len(T), 4)); snow = np.zeros(len(T), bool)
    for mi, p in enumerate(prims):
        sel = (M == mi)
        if not sel.any(): continue
        m = mats[p.mat]; base = hexc(m["c"])
        l = lam[sel]; v = 0.5 + 0.5 * l
        q = np.select([v < 0.62, v < 0.78, v < 0.93], [0.56, 0.72, 0.87], 1.0)
        if m.get("hi"): q = np.where(l > 0.85, 1.1, q)
        if m.get("flat"): q = np.full(sel.sum(), m.get("flat"))
        g = P[sel]; cell = np.floor(g * (m.get("grain", 4))).astype(np.int64)
        hsh = ((cell[:, 0] * 73856093) ^ (cell[:, 1] * 19349663) ^ (cell[:, 2] * 83492791)) & 1023
        var = 1 + (hsh / 1023 - 0.5) * 0.10 * m.get("var", 1)
        col = base[None, :] * (q * var)[:, None]
        cool = np.clip((0.9 - q) / 0.35, 0, 1)[:, None]           # shadow side: slightly cooler
        col = col * (1 - 0.12 * cool) + col * np.array([0.92, 0.98, 1.12]) * 0.12 * cool
        if m.get("stripe"):                                       # vertical / horizontal pattern bands in local metres
            per, ax, k = m["stripe"]; ph = (g[:, ax] % per) / per < 0.5; col = np.where(ph[:, None], col * k, col)
        rgb[sel] = col
        if m.get("e"):
            ec = hexc(m["e"]); emit[sel, :3] = ec; emit[sel, 3] = 255
        if not m.get("nosnow"): snow[sel] = Nn[sel, 2] > 0.55
    img = np.zeros((H, W, 4)); A = hit.reshape(H, W)
    img[..., :3] = np.clip(rgb.reshape(H, W, 3), 0, 255); img[..., 3] = A * 255
    if outline:
        Tm = np.where(hit, T, 1e9).reshape(H, W)
        edge = np.zeros((H, W), bool); cont = np.zeros((H, W), bool)
        for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            nb = np.roll(np.roll(A, dy, 0), dx, 1)
            if dy == 1: nb[0, :] = False
            if dy == -1: nb[-1, :] = False
            if dx == 1: nb[:, 0] = False
            if dx == -1: nb[:, -1] = False
            edge |= A & ~nb
            nt = np.roll(np.roll(Tm, dy, 0), dx, 1); cont |= A & (Tm - nt > 0.6)
        nol = np.zeros(H * W, bool)
        for mi, p in enumerate(prims):
            if mats[p.mat].get("noline"): nol |= (M == mi)
        nol = nol.reshape(H, W)
        img[..., :3] = np.where((edge & ~nol)[..., None], img[..., :3] * 0.42, img[..., :3])
        img[..., :3] = np.where((cont & ~edge)[..., None], img[..., :3] * 0.74, img[..., :3])
    E = emit.reshape(H, W, 4)
    S = np.zeros((H, W, 4)); sm = snow.reshape(H, W) & A
    S[sm] = (246, 248, 252, 255)
    out = dict(img=img.astype(np.uint8), emit=E.astype(np.uint8), snow=S.astype(np.uint8), anchor=(-x0, y1), w=W, h=H,
               emit_any=bool(E[..., 3].any()), snow_any=bool(sm.any()))
    if shadow:
        # ground shadow: footprint of every primitive pushed along -sun to z = 0
        gp = []
        for c in pts:
            k = c[2] / SUN[2]; gp.append(scr((c[0] - SUN[0] * k, c[1] - SUN[1] * k, 0)))
        gp += [scr((c[0], c[1], 0)) for c in pts]
        sx0, sx1 = math.floor(min(p[0] for p in gp)) - 1, math.ceil(max(p[0] for p in gp)) + 1
        sy0, sy1 = math.floor(min(p[1] for p in gp)) - 1, math.ceil(max(p[1] for p in gp)) + 1
        SW_, SH_ = sx1 - sx0, sy1 - sy0
        jj, ii = np.mgrid[0:SH_, 0:SW_]; X = sx0 + ii.ravel() + 0.5; U = sy1 - jj.ravel() - 0.5
        a = X / KX; b = U / KY; G = np.stack([(a + b) / 2, (b - a) / 2, np.full(a.shape, 0.005)], 1)
        ts, _, _ = trace(prims, G, SUN); m = np.isfinite(ts).reshape(SH_, SW_)
        Sh = np.zeros((SH_, SW_, 4), np.uint8); Sh[m] = (16, 20, 34, 255)
        out["shadow"] = Sh; out["shadow_anchor"] = (-sx0, sy1); out["shadow_any"] = bool(m.any())
    return out

def ground_tile(fn, w=128, h=64):
    """seamless screen-space 128 x 64 ground texture: fn(x, y) world metres (z = 0) -> rgb arrays"""
    jj, ii = np.mgrid[0:h, 0:w]
    a = (ii + 0.5) / KX; b = -(jj + 0.5) / KY          # a = x - y, b = x + y (screen y down: sy = -(x+y)*16)
    x = (a + b) / 2; y = (b - a) / 2
    rgb = fn(x, y)
    out = np.zeros((h, w, 4), np.uint8); out[..., :3] = np.clip(rgb, 0, 255); out[..., 3] = 255
    return out

import * as THREE from "three";
import { createBot, crewColors, disposeSheets, PLAYER_COLORS, type Bot } from "./sprite";

/**
 * The WORLD: the library as an isometric factory floor you walk. Every page is
 * a stone pod with its desktop screenshot standing as the back wall and its
 * phone capture as the side wall, the way the landing-page factory video
 * builds them; walk onto a pod (or click it) and open it.
 *
 * One orthographic camera at the video's angle follows the bot. Screenshots
 * load only when the bot gets near them, and print in from a blueprint grid
 * when they arrive. Nothing renders while a prompt dialog is open or the tab
 * is hidden.
 */

export interface WorldItem {
  slug: string;
  title: string;
  thumb: string;
  phone?: string;
  accent: string;
  added: string;
}

export interface WorldHooks {
  onActive: (index: number | null) => void;
  onOpen: (index: number) => void;
  onReady: () => void;
}

export interface WorldOptions {
  canvas: HTMLCanvasElement;
  tagLayer: HTMLElement;
  minimap: HTMLCanvasElement | null;
  items: WorldItem[];
  visited: () => ReadonlySet<string>;
  reduced: boolean;
  hooks: WorldHooks;
}

export interface WorldHandle {
  zoom: (dir: 1 | -1) => void;
  interact: () => void;
  dispose: () => void;
}

// ───────────── layout ─────────────
const PLAT = 120; // half the pod's width
const PLAT_H = 16;
const WALL = PLAT - 6;
const PITCH = 400;
const COLS = 10;
const BACK_W = 2 * WALL;
const BACK_H = BACK_W / 2;
const SIDE_H = 140;
const SIDE_W = SIDE_H * 0.8;
const NEAR = PLAT + 34; // how close counts as at the pod
const RADIUS = 13;
const AZ = 135;
const ELEV = Math.atan2(0.42, Math.SQRT1_2);

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const damp = (k: number, dt: number) => 1 - Math.exp(-k * dt);
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ───────────── the page panel shader: blueprint → print reveal, sweep, glow rim ─────────────
const PAGE_VS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const PAGE_FS = `
  uniform sampler2D map; uniform float reveal, sweep, glow, shade; uniform vec3 accent; uniform vec2 size;
  varying vec2 vUv;
  void main(){
    vec3 col = texture2D(map, vUv).rgb;
    vec2 g = vUv * size / 10.0;
    float ln = max(step(0.9, fract(g.x)), step(0.9, fract(g.y)));
    vec3 bp = mix(vec3(0.012,0.03,0.09), vec3(0.08,0.25,0.65), ln * 0.7) + col * 0.07;
    float y = 1.0 - vUv.y;
    float r = step(y, reveal * 1.03);
    vec3 c = mix(bp, col, r);
    float band = exp(-pow((y - reveal) * 36.0, 2.0)) * step(0.001, reveal) * step(reveal, 0.999);
    c += accent * band * 2.2 + vec3(band * 0.6);
    float s = vUv.x * 0.55 + y * 0.45;
    c += vec3(exp(-pow((s - sweep) * 8.0, 2.0)) * 0.38);
    vec2 d = min(vUv, 1.0 - vUv) * size;
    float rim = 1.0 - smoothstep(0.0, 3.5, min(d.x, d.y));
    c = mix(c, accent * 1.4 + 0.15, rim * glow);
    gl_FragColor = vec4(c * shade, 1.0);
    #include <colorspace_fragment>
  }`;

type PageMat = THREE.ShaderMaterial & {
  uniforms: { map: { value: THREE.Texture }; reveal: { value: number }; sweep: { value: number }; glow: { value: number } };
};

interface Pod {
  i: number;
  item: WorldItem;
  x: number;
  z: number;
  group: THREE.Group;
  rim: THREE.MeshBasicMaterial;
  back: PageMat;
  side: PageMat | null;
  backTex: THREE.Texture | null;
  requested: boolean;
  revealAt: number; // seconds, -1 until the screenshot arrives
  glow: number;
  boxes: [number, number, number, number][]; // walls the bot can't walk through: x0, x1, z0, z1
  tag: HTMLDivElement;
  tagShown: boolean;
}

export function createWorld(opts: WorldOptions): WorldHandle {
  const { canvas, tagLayer, minimap, items, hooks, reduced } = opts;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x0b0d14, 1);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 8000);
  const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  let W = 1, H = 1;

  const aim = (focus: THREE.Vector3, half: number) => {
    const az = (AZ * Math.PI) / 180, flat = Math.cos(ELEV) * 3000;
    camera.position.set(focus.x + Math.sin(az) * flat, focus.y + Math.sin(ELEV) * 3000, focus.z + Math.cos(az) * flat);
    camera.lookAt(focus);
    const a = W / H;
    camera.left = -half * a;
    camera.right = half * a;
    camera.top = half;
    camera.bottom = -half;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  };

  // On the ground: screen right and screen up, from the camera's fixed angle
  const az = (AZ * Math.PI) / 180;
  const RIGHT = new THREE.Vector3(Math.cos(az), 0, -Math.sin(az));
  const UP = new THREE.Vector3(-Math.sin(az), 0, -Math.cos(az));

  // ───────────── textures ─────────────
  const owned: THREE.Texture[] = [];
  function canvasTex(w: number, h: number, draw: (x: CanvasRenderingContext2D, w: number, h: number) => void, repeat?: [number, number]) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    draw(c.getContext("2d")!, w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = maxAniso;
    if (repeat) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(repeat[0], repeat[1]);
    }
    owned.push(t);
    return t;
  }
  const blank = new THREE.DataTexture(new Uint8Array([10, 12, 20, 255]), 1, 1);
  blank.needsUpdate = true;
  owned.push(blank);

  const platTops = new Map<string, THREE.Texture>();
  const platTop = (accent: string) => {
    const hit = platTops.get(accent);
    if (hit) return hit;
    const t = canvasTex(512, 512, (x, w, h) => {
      const n = 10, s = w / n, r = rng(7);
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          const base = (i + j) % 2 ? [214, 208, 194] : [204, 197, 182];
          const k = (r() - 0.5) * 8;
          x.fillStyle = `rgb(${base[0] + k},${base[1] + k},${base[2] + k})`;
          x.fillRect(i * s, j * s, s, s);
          x.fillStyle = "rgba(255,255,255,.35)";
          x.fillRect(i * s, j * s, s, 3);
          x.fillRect(i * s, j * s, 3, s);
          x.fillStyle = "rgba(0,0,0,.12)";
          x.fillRect(i * s, j * s + s - 3, s, 3);
          x.fillRect(i * s + s - 3, j * s, 3, s);
        }
      x.strokeStyle = accent;
      x.globalAlpha = 0.55;
      x.lineWidth = 8;
      x.strokeRect(4, 4, w - 8, h - 8);
    });
    platTops.set(accent, t);
    return t;
  };
  const stoneSide = (base: string, line: string, top: string) =>
    canvasTex(256, 32, (x, w, h) => {
      x.fillStyle = base;
      x.fillRect(0, 0, w, h);
      x.fillStyle = line;
      for (let i = 0; i < 8; i++) x.fillRect(i * 32 + (i % 2) * 8, 14, 22, 3);
      x.fillStyle = top;
      x.fillRect(0, 0, w, 3);
    }, [6, 0.6]);
  const sideA = new THREE.MeshBasicMaterial({ map: stoneSide("#7c7566", "#6b6456", "#958d7c") });
  const sideB = new THREE.MeshBasicMaterial({ map: stoneSide("#5e584c", "#514b40", "#756e60") });
  const under = new THREE.MeshBasicMaterial({ color: 0x3c382f });
  const crateTop = canvasTex(64, 64, (x, w, h) => {
    x.fillStyle = "#b08a57";
    x.fillRect(0, 0, w, h);
    x.strokeStyle = "#7a5c36";
    x.lineWidth = 6;
    x.strokeRect(3, 3, w - 6, h - 6);
    x.beginPath();
    x.moveTo(0, 0);
    x.lineTo(w, h);
    x.stroke();
  });
  const hazard = canvasTex(64, 64, (x, w, h) => {
    x.fillStyle = "#f2c230";
    x.fillRect(0, 0, w, h);
    x.fillStyle = "#1a1a1a";
    for (let i = -2; i < 4; i++) {
      x.beginPath();
      x.moveTo(i * 32, h);
      x.lineTo(i * 32 + 16, h);
      x.lineTo(i * 32 + 16 + h, 0);
      x.lineTo(i * 32 + h, 0);
      x.fill();
    }
  });

  const boxShaded = (w: number, h: number, d: number, top: number | THREE.Texture, s1: number, s2: number) => {
    const m1 = new THREE.MeshBasicMaterial({ color: s1 }), m2 = new THREE.MeshBasicMaterial({ color: s2 });
    const mt = new THREE.MeshBasicMaterial(typeof top === "number" ? { color: top } : { map: top });
    return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [m1, m1, mt, m2, m2, m2]);
  };
  const ADD = (color: string | number, op: number) =>
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false });
  const SHADOW = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.32, depthWrite: false });

  // A decal lying on the floor that reads straight on screen
  const floorDecal = (tex: THREE.Texture, w: number, h: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    m.rotation.order = "YXZ";
    m.rotation.y = (3 * Math.PI) / 4;
    m.rotation.x = -Math.PI / 2;
    return m;
  };

  // ───────────── the floor ─────────────
  const ROWS = Math.ceil(items.length / COLS);
  const X1 = PITCH / 2 + 220, X0 = -(COLS - 1) * PITCH - PITCH / 2 - 40;
  const Z0 = -PITCH / 2 - 220, Z1 = (ROWS - 1) * PITCH + PITCH / 2 + 40;
  const CX = (X0 + X1) / 2, CZ = (Z0 + Z1) / 2;
  const FW = X1 - X0 + 1400, FD = Z1 - Z0 + 1400;
  const floorTex = canvasTex(256, 256, (x, w, h) => {
    x.fillStyle = "#151824";
    x.fillRect(0, 0, w, h);
    x.fillStyle = "#1c2030";
    x.fillRect(0, 0, w, 3);
    x.fillRect(0, 0, 3, h);
    x.fillStyle = "#11131c";
    x.fillRect(0, h / 2 - 1, w, 2);
    x.fillRect(w / 2 - 1, 0, 2, h);
  }, [FW / 64, FD / 64]);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(FW, FD), new THREE.MeshBasicMaterial({ map: floorTex }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(CX, 0, CZ);
  scene.add(floor);

  // the walkable edge: a hazard line round the floor
  const edgeMat = new THREE.MeshBasicMaterial({ map: hazard });
  for (const [w, d, x, z] of [
    [X1 - X0, 10, CX, Z0 - 8],
    [X1 - X0, 10, CX, Z1 + 8],
    [10, Z1 - Z0, X0 - 8, CZ],
    [10, Z1 - Z0, X1 + 8, CZ],
  ]) {
    const e = new THREE.Mesh(new THREE.PlaneGeometry(w, d), edgeMat);
    e.rotation.x = -Math.PI / 2;
    e.position.set(x, 0.3, z);
    scene.add(e);
  }

  // the spawn pad's floor sign
  const SPAWN = new THREE.Vector3(PITCH / 2 + 40, 0, -PITCH / 2 - 40);
  const sign = floorDecal(
    canvasTex(1024, 256, (x, w, h) => {
      x.fillStyle = "rgba(233,230,220,.9)";
      x.textAlign = "center";
      x.textBaseline = "middle";
      // the pixel face is wide: shrink the title until it fits the sign
      let size = 92;
      do x.font = `700 ${size}px "Silk", monospace`;
      while (x.measureText("LANDING PAGE FACTORY").width > w - 40 && (size -= 4) > 20);
      x.fillText("LANDING PAGE FACTORY", w / 2, h / 2 - 34);
      x.fillStyle = "rgba(242,194,48,.85)";
      x.font = '400 44px "Silk", monospace';
      x.fillText(`${items.length} PAGES ON THE FLOOR`, w / 2, h / 2 + 58);
    }),
    360,
    90
  );
  sign.position.set(SPAWN.x + 70, 0.4, SPAWN.z - 70);
  scene.add(sign);

  // ───────────── panels ─────────────
  function pageMat(w: number, h: number, accent: string, shade: number): PageMat {
    return new THREE.ShaderMaterial({
      vertexShader: PAGE_VS,
      fragmentShader: PAGE_FS,
      uniforms: {
        map: { value: blank },
        reveal: { value: 0 },
        sweep: { value: -1 },
        glow: { value: 0 },
        shade: { value: shade },
        accent: { value: new THREE.Color(accent) },
        size: { value: new THREE.Vector2(w, h) },
      },
    }) as PageMat;
  }
  const slabMat = [0x2c3042, 0x22253a];
  function panel(w: number, h: number, accent: string, shade: number) {
    const pivot = new THREE.Group();
    const body = new THREE.Group();
    body.position.y = h / 2;
    pivot.add(body);
    const slab = boxShaded(w + 5, h + 5, 6, 0x1a1c27, slabMat[0], slabMat[1]);
    slab.position.z = -3;
    body.add(slab);
    const mat = pageMat(w, h, accent, shade);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    face.position.z = 0.35;
    body.add(face);
    return { pivot, mat, face, slab };
  }

  // ───────────── pods ─────────────
  const pickables: THREE.Object3D[] = [];
  const numberTex = (n: number, accent: string) =>
    canvasTex(128, 64, (x, w, h) => {
      x.fillStyle = accent;
      x.font = '700 44px "Silk", monospace';
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText(String(n + 1).padStart(2, "0"), w / 2, h / 2 + 2);
    });

  const pods: Pod[] = items.map((item, i) => {
    const x = -(i % COLS) * PITCH, z = Math.floor(i / COLS) * PITCH;
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    scene.add(group);

    const plat = new THREE.Mesh(new THREE.BoxGeometry(PLAT * 2, PLAT_H, PLAT * 2), [
      sideA, sideA, new THREE.MeshBasicMaterial({ map: platTop(item.accent) }), under, sideB, sideB,
    ]);
    plat.position.y = PLAT_H / 2;
    plat.userData.pod = i;
    group.add(plat);
    pickables.push(plat);

    // the two near edges light up when the bot is on the pod
    const rim = ADD(item.accent, 0);
    const rimA = new THREE.Mesh(new THREE.BoxGeometry(PLAT * 2 + 2, 3, 3), rim);
    rimA.position.set(0, PLAT_H + 0.5, -PLAT);
    const rimB = new THREE.Mesh(new THREE.BoxGeometry(3, 3, PLAT * 2 + 2), rim);
    rimB.position.set(PLAT, PLAT_H + 0.5, 0);
    group.add(rimA, rimB);

    const back = panel(BACK_W, BACK_H, item.accent, 1);
    back.pivot.position.set(-WALL + BACK_W / 2, PLAT_H, WALL);
    back.pivot.rotation.y = Math.PI;
    back.face.userData.pod = i;
    group.add(back.pivot);
    pickables.push(back.face);

    const boxes: Pod["boxes"] = [[x - WALL - 3, x - WALL + BACK_W + 3, z + WALL - 4, z + WALL + 8]];
    let side: PageMat | null = null;
    if (item.phone) {
      const s = panel(SIDE_W, SIDE_H, item.accent, 0.86);
      s.pivot.position.set(-WALL, PLAT_H, WALL - SIDE_W / 2);
      s.pivot.rotation.y = Math.PI / 2;
      s.face.userData.pod = i;
      group.add(s.pivot);
      pickables.push(s.face);
      side = s.mat;
      boxes.push([x - WALL - 8, x - WALL + 4, z + WALL - SIDE_W - 3, z + WALL]);
    } else {
      // no phone capture: a stack of crates where the side wall would be
      for (const [cx, cz, cs, cy] of [[-WALL + 22, WALL - 60, 30, 0], [-WALL + 22, WALL - 100, 22, 0], [-WALL + 22, WALL - 60, 20, 30]]) {
        const c = boxShaded(cs, cs, cs, crateTop, 0x8e6c42, 0x6f5432);
        c.position.set(cx, PLAT_H + cy + cs / 2, cz);
        group.add(c);
      }
      boxes.push([x - WALL + 5, x - WALL + 39, z + WALL - 113, z + WALL - 43]);
    }

    const num = floorDecal(numberTex(i, item.accent), 64, 32);
    num.position.set(PLAT - 44, PLAT_H + 0.4, -PLAT + 44);
    group.add(num);

    const tag = document.createElement("div");
    tag.className = "world-tag";
    const dot = document.createElement("i");
    dot.style.background = item.accent;
    tag.append(dot, document.createTextNode(item.title));
    tag.style.display = "none";
    tagLayer.appendChild(tag);

    return { i, item, x, z, group, rim, back: back.mat, side, backTex: null, requested: false, revealAt: -1, glow: 0, boxes, tag, tagShown: false };
  });

  // ───────────── belts and presses round the back and the left of the floor ─────────────
  const beltTex = canvasTex(128, 64, (x, w, h) => {
    x.fillStyle = "#23262f";
    x.fillRect(0, 0, w, h);
    x.fillStyle = "#2f3340";
    for (let i = 0; i < 2; i++) {
      x.beginPath();
      x.moveTo(i * 64 + 8, 6);
      x.lineTo(i * 64 + 34, 32);
      x.lineTo(i * 64 + 8, 58);
      x.lineTo(i * 64 + 22, 58);
      x.lineTo(i * 64 + 48, 32);
      x.lineTo(i * 64 + 22, 6);
      x.fill();
    }
    x.fillStyle = "#3a3e4c";
    x.fillRect(0, 0, w, 3);
    x.fillRect(0, h - 3, w, 3);
  }, [1, 1]);
  const cardSide = new THREE.MeshBasicMaterial({ color: 0x2c3042 }), cardSide2 = new THREE.MeshBasicMaterial({ color: 0x1d2030 });
  const cardFaces = pods.slice(0, 12).map(() => new THREE.MeshBasicMaterial({ color: 0x1a1d2b }));
  const belts: { len: number; cards: { m: THREE.Mesh; off: number }[]; place: (m: THREE.Mesh, d: number) => void; tex: THREE.Texture }[] = [];
  const pistons: THREE.Mesh[] = [];
  const addBelt = (len: number, alongX: boolean, x: number, z: number, seed: number) => {
    const t = beltTex.clone();
    t.repeat.set(len / 64, 1);
    t.needsUpdate = true;
    owned.push(t);
    const top = new THREE.MeshBasicMaterial({ map: t });
    const geo = alongX ? new THREE.BoxGeometry(len, 14, 46) : new THREE.BoxGeometry(46, 14, len);
    const belt = new THREE.Mesh(geo, [cardSide, cardSide, top, cardSide2, cardSide2, cardSide2]);
    if (!alongX) t.rotation = Math.PI / 2;
    belt.position.set(alongX ? x + len / 2 : x, 7, alongX ? z : z + len / 2);
    scene.add(belt);
    const press = boxShaded(84, 96, 84, 0x3b4054, 0x2f3446, 0x262a3b);
    press.position.set(alongX ? x - 40 : x, 48, alongX ? z : z - 40);
    scene.add(press);
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(84, 16), new THREE.MeshBasicMaterial({ map: hazard }));
    strip.position.set(press.position.x + (alongX ? 0 : 0), 80, press.position.z - 42.2);
    strip.rotation.y = Math.PI;
    scene.add(strip);
    const piston = boxShaded(34, 44, 34, 0x8a90a6, 0x5d6378, 0x4b5065);
    piston.position.set(press.position.x, 118, press.position.z);
    scene.add(piston);
    pistons.push(piston);
    const cards: { m: THREE.Mesh; off: number }[] = [];
    const N = Math.floor(len / 110);
    for (let k = 0; k < N; k++) {
      const face = cardFaces[(k * 5 + seed) % cardFaces.length];
      const m = new THREE.Mesh(new THREE.BoxGeometry(alongX ? 46 : 23, 3, alongX ? 23 : 46), [cardSide, cardSide, face, cardSide2, cardSide2, cardSide2]);
      scene.add(m);
      cards.push({ m, off: (k / N) * len });
    }
    belts.push({
      len,
      cards,
      tex: t,
      place: (m, d) => m.position.set(alongX ? x + d : x, 16, alongX ? z : z + d),
    });
  };
  addBelt(X1 - X0, true, X0, Z1 + 120, 0);
  addBelt(Z1 - Z0, false, X0 - 120, Z0, 3);
  for (const b of belts) for (const c of b.cards) b.place(c.m, c.off);

  // ───────────── the bot and the crew ─────────────
  const player = createBot(PLAYER_COLORS, SHADOW);
  scene.add(player.group, player.shadow);
  const pos = SPAWN.clone();
  const vel = new THREE.Vector3();
  let facingBack = true, facingLeft = false, walkPhase = 0;

  // the crew walk the aisles, node to node
  const AISLE_X = (k: number) => PITCH / 2 - k * PITCH;
  const AISLE_Z = (m: number) => -PITCH / 2 + m * PITCH;
  const crewRng = rng(4242);
  interface Walker { bot: Bot; k: number; m: number; from: THREE.Vector3; to: THREE.Vector3; u: number; len: number; speed: number; wait: number; back: boolean; left: boolean; phase: number }
  const crew: Walker[] = [];
  const crewCount = Math.min(14, Math.max(6, Math.round(items.length / 7)));
  for (let n = 0; n < crewCount; n++) {
    const bot = createBot(crewColors(Math.floor(crewRng() * 360)), SHADOW);
    scene.add(bot.group, bot.shadow);
    const k = Math.floor(crewRng() * (COLS + 1)), m = Math.floor(crewRng() * (ROWS + 1));
    const p = new THREE.Vector3(AISLE_X(k), 0, AISLE_Z(m));
    crew.push({ bot, k, m, from: p.clone(), to: p.clone(), u: 1, len: 0, speed: 70 + crewRng() * 50, wait: crewRng() * 2, back: crewRng() > 0.5, left: crewRng() > 0.5, phase: crewRng() * 4 });
  }
  const nextNode = (w: Walker) => {
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dk, dm]) => w.k + dk >= 0 && w.k + dk <= COLS && w.m + dm >= 0 && w.m + dm <= ROWS);
    const [dk, dm] = dirs[Math.floor(crewRng() * dirs.length)];
    w.k += dk;
    w.m += dm;
    w.from.copy(w.to);
    w.to.set(AISLE_X(w.k), 0, AISLE_Z(w.m));
    w.len = w.from.distanceTo(w.to);
    w.u = 0;
  };

  // ───────────── the active-pod marker and the motes ─────────────
  const marker = new THREE.Mesh(new THREE.OctahedronGeometry(9), ADD(0xffffff, 0.95));
  marker.visible = false;
  scene.add(marker);
  const ringMat = ADD(0xffffff, 0);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 64).rotateX(-Math.PI / 2), ringMat);
  scene.add(ring);
  let ringT = -1;

  const MOTES = 220, BOX = 1400;
  const moteR = rng(99);
  const motePos = new Float32Array(MOTES * 3);
  const motes = Array.from({ length: MOTES }, () => ({ x: moteR() * BOX, z: moteR() * BOX, y: moteR() * 420, v: 6 + moteR() * 14, ph: moteR() * 6.28 }));
  const moteGeo = new THREE.BufferGeometry();
  moteGeo.setAttribute("position", new THREE.BufferAttribute(motePos, 3));
  const moteMat = new THREE.PointsMaterial({ color: 0xffe9b0, size: 3, sizeAttenuation: false, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending });
  const moteMesh = new THREE.Points(moteGeo, moteMat);
  moteMesh.frustumCulled = false;
  scene.add(moteMesh);

  // ───────────── screenshots, loaded as the bot comes near ─────────────
  let inFlight = 0;
  const loadImage = (url: string, w: number, h: number) =>
    new Promise<THREE.Texture>((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        c.getContext("2d")!.drawImage(img, 0, 0, w, h);
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = maxAniso;
        owned.push(t);
        resolve(t);
      };
      img.onerror = reject;
      img.src = url;
    });
  let disposed = false;
  const request = (p: Pod) => {
    p.requested = true;
    inFlight++;
    const jobs: Promise<unknown>[] = [
      loadImage(p.item.thumb, 512, 256).then((t) => {
        if (disposed) return;
        p.back.uniforms.map.value = t;
        p.backTex = t;
        if (p.i < cardFaces.length) {
          cardFaces[p.i].map = t;
          cardFaces[p.i].color.set(0xffffff);
          cardFaces[p.i].needsUpdate = true;
        }
      }),
    ];
    if (p.item.phone && p.side) {
      const side = p.side;
      jobs.push(loadImage(p.item.phone, 256, 320).then((t) => { if (!disposed) side.uniforms.map.value = t; }));
    }
    Promise.allSettled(jobs).then(() => {
      inFlight--;
      if (!disposed) p.revealAt = clock;
    });
  };
  const feed = () => {
    if (inFlight >= 4) return;
    let best: Pod | null = null, bestD = 1700 * 1700;
    for (const p of pods) {
      if (p.requested) continue;
      const d = (p.x - pos.x) ** 2 + (p.z - pos.z) ** 2;
      if (d < bestD) { bestD = d; best = p; }
    }
    if (best) request(best);
  };

  // ───────────── input ─────────────
  const keys = new Set<string>();
  let run = false;
  let target: THREE.Vector3 | null = null;
  let pendingOpen = -1;
  let active: number | null = null;
  let half = 300, halfTo = window.innerWidth < 720 ? 380 : 300;
  const MIN_HALF = 170, MAX_HALF = 900;

  const paused = () => disposed || document.hidden || !window.location.pathname.startsWith("/world");
  const typing = (e: Event) => {
    const t = e.target as HTMLElement | null;
    return !!t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
  };
  const MOVE: Record<string, string> = { ArrowUp: "u", KeyW: "u", ArrowDown: "d", KeyS: "d", ArrowLeft: "l", KeyA: "l", ArrowRight: "r", KeyD: "r" };

  const open = (i: number) => {
    ringT = clock;
    ring.position.set(pods[i].x, PLAT_H + 1, pods[i].z);
    ringMat.color.set(pods[i].item.accent);
    pendingOpen = -1;
    target = null;
    keys.clear();
    hooks.onOpen(i);
  };
  const interact = () => {
    if (active !== null) open(active);
  };
  const zoom = (dir: 1 | -1) => {
    halfTo = clamp(halfTo * (dir > 0 ? 0.8 : 1.25), MIN_HALF, MAX_HALF);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (paused() || typing(e) || e.ctrlKey || e.metaKey || e.altKey) return;
    if (MOVE[e.code]) {
      keys.add(MOVE[e.code]);
      target = null;
      pendingOpen = -1;
      e.preventDefault();
    } else if (e.code === "ShiftLeft" || e.code === "ShiftRight") run = true;
    else if (e.code === "KeyE" || e.code === "Enter" || e.code === "Space") {
      if (active !== null) {
        e.preventDefault();
        open(active);
      }
    } else if (e.key === "+" || e.key === "=") zoom(1);
    else if (e.key === "-" || e.key === "_") zoom(-1);
  };
  const onKeyUp = (e: KeyboardEvent) => {
    if (MOVE[e.code]) keys.delete(MOVE[e.code]);
    if (e.code === "ShiftLeft" || e.code === "ShiftRight") run = false;
  };
  const onBlur = () => {
    keys.clear();
    run = false;
  };

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  let down: { x: number; y: number; id: number } | null = null;
  const onPointerDown = (e: PointerEvent) => {
    down = { x: e.clientX, y: e.clientY, id: e.pointerId };
  };
  const onPointerUp = (e: PointerEvent) => {
    if (!down || down.id !== e.pointerId || paused()) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    down = null;
    if (moved > 10) return;
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(pickables, false)[0];
    if (hit) {
      const i = hit.object.userData.pod as number;
      if (active === i) return open(i);
      // walk onto the pod's near corner, then open it
      target = new THREE.Vector3(pods[i].x + PLAT * 0.45, 0, pods[i].z - PLAT * 0.45);
      pendingOpen = i;
      return;
    }
    const p = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(groundPlane, p)) {
      target = p;
      pendingOpen = -1;
    }
  };
  const onWheel = (e: WheelEvent) => {
    if (paused()) return;
    e.preventDefault();
    halfTo = clamp(halfTo * Math.exp(e.deltaY * 0.0012), MIN_HALF, MAX_HALF);
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("wheel", onWheel, { passive: false });

  const resize = () => {
    const r = canvas.parentElement!.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    renderer.setSize(W, H, false);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement!);
  resize();

  // ───────────── movement and collision ─────────────
  const collide = () => {
    pos.x = clamp(pos.x, X0 + RADIUS, X1 - RADIUS);
    pos.z = clamp(pos.z, Z0 + RADIUS, Z1 - RADIUS);
    const col = Math.round(-pos.x / PITCH), row = Math.round(pos.z / PITCH);
    for (let dc = -1; dc <= 1; dc++)
      for (let dr = -1; dr <= 1; dr++) {
        const c = col + dc, rr = row + dr;
        if (c < 0 || c >= COLS || rr < 0) continue;
        const p = pods[rr * COLS + c];
        if (!p) continue;
        for (const [x0, x1, z0, z1] of p.boxes) {
          const nx = clamp(pos.x, x0, x1), nz = clamp(pos.z, z0, z1);
          const dx = pos.x - nx, dz = pos.z - nz, d2 = dx * dx + dz * dz;
          if (d2 >= RADIUS * RADIUS) continue;
          if (d2 > 1e-6) {
            const d = Math.sqrt(d2), push = RADIUS - d;
            pos.x += (dx / d) * push;
            pos.z += (dz / d) * push;
          } else {
            // the centre is inside the wall: leave by the nearest side
            const out = [pos.x - x0, x1 - pos.x, pos.z - z0, z1 - pos.z];
            const k = out.indexOf(Math.min(...out));
            if (k === 0) pos.x = x0 - RADIUS;
            else if (k === 1) pos.x = x1 + RADIUS;
            else if (k === 2) pos.z = z0 - RADIUS;
            else pos.z = z1 + RADIUS;
          }
        }
      }
  };
  const podAt = (x: number, z: number, margin: number) => {
    const col = Math.round(-x / PITCH), row = Math.round(z / PITCH);
    if (col < 0 || col >= COLS || row < 0) return null;
    const p = pods[row * COLS + col];
    if (!p) return null;
    return Math.abs(x - p.x) <= margin && Math.abs(z - p.z) <= margin ? p : null;
  };

  const _dir = new THREE.Vector3();
  const _focus = SPAWN.clone().setY(40);
  const _v = new THREE.Vector3();
  let clock = 0, last = performance.now(), raf = 0, blinkAt = 2, mapAt = 0, feedAt = 0, ready = false;

  const step = (dt: number) => {
    // where the bot wants to go
    _dir.set(0, 0, 0);
    if (keys.size) {
      const ix = (keys.has("r") ? 1 : 0) - (keys.has("l") ? 1 : 0);
      const iy = (keys.has("u") ? 1 : 0) - (keys.has("d") ? 1 : 0);
      _dir.addScaledVector(RIGHT, ix).addScaledVector(UP, iy);
    } else if (target) {
      _dir.set(target.x - pos.x, 0, target.z - pos.z);
      if (_dir.length() < 8) {
        target = null;
        _dir.set(0, 0, 0);
      }
    }
    const want = _dir.lengthSq() > 0 ? (run ? 380 : 230) : 0;
    if (want) _dir.normalize().multiplyScalar(want);
    vel.lerp(_dir, damp(want ? 12 : 16, dt));
    // small sub-steps, so a slow frame never carries the bot through a wall
    const sub = Math.ceil(dt / 0.02);
    for (let k = 0; k < sub; k++) {
      pos.addScaledVector(vel, dt / sub);
      collide();
    }

    // step up onto a pod's top
    const onPod = podAt(pos.x, pos.z, PLAT - 2);
    const groundY = onPod ? PLAT_H : 0;
    pos.y += (groundY - pos.y) * damp(22, dt);

    // which pod the bot is at
    const near = podAt(pos.x, pos.z, NEAR);
    const nowActive = near ? near.i : null;
    if (nowActive !== active) {
      active = nowActive;
      hooks.onActive(active);
    }
    if (pendingOpen >= 0 && active === pendingOpen && (!target || podAt(pos.x, pos.z, PLAT - 10))) open(pendingOpen);

    // facing and frame: from the move on screen
    const speed = Math.hypot(vel.x, vel.z);
    if (speed > 20) {
      const sx = vel.dot(RIGHT), sy = vel.dot(UP);
      if (Math.abs(sy) > speed * 0.2) facingBack = sy > 0;
      if (Math.abs(sx) > speed * 0.2) facingLeft = sx < 0;
      walkPhase += dt * (speed / 230) * 9;
    }
    let frame = speed > 20 ? 2 + (Math.floor(walkPhase) % 4) : 0;
    if (frame === 0 && clock > blinkAt) {
      frame = 1;
      if (clock > blinkAt + 0.14) blinkAt = clock + 2.5 + Math.random() * 3;
    }
    player.pose(facingBack, facingLeft, frame);
    player.group.position.copy(pos);
    player.shadow.position.set(pos.x, pos.y + 0.5, pos.z);

    // the crew
    for (const w of crew) {
      if (w.wait > 0) {
        w.wait -= dt;
        w.bot.pose(w.back, w.left, 0);
      } else {
        if (w.u >= 1) {
          nextNode(w);
          const d = _v.subVectors(w.to, w.from);
          w.back = d.dot(UP) > 0;
          w.left = d.dot(RIGHT) < 0;
        }
        w.u = Math.min(1, w.u + (w.speed * dt) / Math.max(1, w.len));
        if (w.u >= 1 && crewRng() < 0.35) w.wait = 0.6 + crewRng() * 2.4;
        w.phase += dt * (w.speed / 230) * 9;
        w.bot.pose(w.back, w.left, 2 + (Math.floor(w.phase) % 4));
      }
      _v.lerpVectors(w.from, w.to, w.u);
      w.bot.group.position.copy(_v);
      w.bot.shadow.position.set(_v.x, 0.5, _v.z);
    }

    // camera
    _focus.x += (pos.x - _focus.x) * damp(reduced ? 20 : 6, dt);
    _focus.z += (pos.z - _focus.z) * damp(reduced ? 20 : 6, dt);
    _focus.y = 40 + pos.y;
    half += (halfTo - half) * damp(8, dt);
    aim(_focus, half);
    player.group.quaternion.copy(camera.quaternion);
    for (const w of crew) w.bot.group.quaternion.copy(camera.quaternion);

    // pods: glow, reveal, tags
    const showAll = half < 520;
    for (const p of pods) {
      const on = p.i === active ? 1 : 0;
      p.glow += (on - p.glow) * damp(10, dt);
      p.rim.opacity = 0.12 + p.glow * 0.85;
      if (p.revealAt >= 0) {
        const u = clamp((clock - p.revealAt) / (reduced ? 0.01 : 0.9), 0, 1);
        p.back.uniforms.reveal.value = u;
        p.back.uniforms.sweep.value = u < 1 ? -1 : ((clock - p.revealAt - 0.9) * 0.35) % 2.2 - 0.4 + (on ? 0 : 9);
        if (p.side) p.side.uniforms.reveal.value = u;
      }
      p.back.uniforms.glow.value = p.glow;
      if (p.side) p.side.uniforms.glow.value = p.glow;

      _v.set(p.x - WALL + BACK_W / 2, PLAT_H + BACK_H + 22, p.z + WALL).project(camera);
      const sx = (_v.x + 1) * 0.5 * W, sy = (1 - _v.y) * 0.5 * H;
      const visible = (showAll || on) && sx > -160 && sx < W + 160 && sy > -40 && sy < H + 40;
      if (visible !== p.tagShown) {
        p.tag.style.display = visible ? "" : "none";
        p.tagShown = visible;
      }
      if (visible) {
        p.tag.style.transform = `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px) translate(-50%, -100%)`;
        p.tag.classList.toggle("is-active", !!on);
      }
    }

    // marker over the active pod
    if (active !== null) {
      const p = pods[active];
      marker.visible = true;
      (marker.material as THREE.MeshBasicMaterial).color.set(p.item.accent);
      marker.position.set(p.x - WALL + BACK_W / 2, PLAT_H + BACK_H + 46 + (reduced ? 0 : Math.sin(clock * 3) * 5), p.z + WALL);
      marker.rotation.y = reduced ? 0 : clock * 1.6;
    } else marker.visible = false;

    // open ring
    if (ringT >= 0) {
      const u = (clock - ringT) / 0.6;
      if (u >= 1) {
        ringT = -1;
        ringMat.opacity = 0;
      } else {
        ring.scale.setScalar(40 + u * 140);
        ringMat.opacity = (1 - u) * 0.9;
      }
    }

    // belts and presses
    if (!reduced) {
      for (const b of belts) {
        b.tex.offset.x = -((clock * 62) / 64) % 1;
        for (const c of b.cards) b.place(c.m, (c.off + clock * 62) % b.len);
      }
      pistons.forEach((p, k) => (p.position.y = 118 - Math.max(0, Math.sin(clock * 2.4 + k * 1.7)) * 34));
    }

    // motes drift in a box that follows the camera
    for (let k = 0; k < MOTES; k++) {
      const m = motes[k];
      const t = reduced ? 0 : clock;
      const mx = ((((m.x + Math.sin(t * 0.3 + m.ph) * 20 - _focus.x) % BOX) + BOX) % BOX) + _focus.x - BOX / 2;
      const mz = ((((m.z - _focus.z) % BOX) + BOX) % BOX) + _focus.z - BOX / 2;
      motePos[k * 3] = mx;
      motePos[k * 3 + 1] = (m.y + t * m.v) % 420;
      motePos[k * 3 + 2] = mz;
    }
    moteGeo.attributes.position.needsUpdate = true;

    if (clock > feedAt) {
      feed();
      feedAt = clock + 0.12;
    }
    if (minimap && clock > mapAt) {
      drawMap();
      mapAt = clock + 0.12;
    }
  };

  // ───────────── minimap: the floor as the camera sees it ─────────────
  const mapCtx = minimap?.getContext("2d") ?? null;
  const drawMap = () => {
    if (!mapCtx || !minimap) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = minimap.clientWidth, ch = minimap.clientHeight;
    if (minimap.width !== Math.round(cw * dpr)) {
      minimap.width = Math.round(cw * dpr);
      minimap.height = Math.round(ch * dpr);
    }
    const c = mapCtx;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, cw, ch);
    // project the floor's corners to fit the map
    const corners = [[X0, Z0], [X1, Z0], [X0, Z1], [X1, Z1]].map(([x, z]) => [x * RIGHT.x + z * RIGHT.z, -(x * UP.x + z * UP.z)]);
    const xs = corners.map((p) => p[0]), ys = corners.map((p) => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const s = Math.min((cw - 12) / (maxX - minX), (ch - 12) / (maxY - minY));
    const ox = (cw - (maxX - minX) * s) / 2, oy = (ch - (maxY - minY) * s) / 2;
    const at = (x: number, z: number): [number, number] => [ox + (x * RIGHT.x + z * RIGHT.z - minX) * s, oy + (-(x * UP.x + z * UP.z) - minY) * s];
    c.beginPath();
    corners.slice(0, 2).concat([corners[3], corners[2]]).forEach(([px, py], k) => {
      const X = ox + (px - minX) * s, Y = oy + (py - minY) * s;
      if (k) c.lineTo(X, Y);
      else c.moveTo(X, Y);
    });
    c.closePath();
    c.fillStyle = "rgba(21,24,36,.9)";
    c.fill();
    c.strokeStyle = "rgba(242,194,48,.5)";
    c.lineWidth = 1;
    c.stroke();
    const seen = opts.visited();
    const r = Math.max(1.6, PLAT * s * 0.75);
    for (const p of pods) {
      const [X, Y] = at(p.x, p.z);
      c.fillStyle = seen.has(p.item.slug) ? p.item.accent : "rgba(233,230,220,.22)";
      c.fillRect(X - r, Y - r, r * 2, r * 2);
      if (p.i === active) {
        c.strokeStyle = "#fff";
        c.lineWidth = 1.5;
        c.strokeRect(X - r - 2, Y - r - 2, r * 2 + 4, r * 2 + 4);
      }
    }
    const [PX, PY] = at(pos.x, pos.z);
    c.fillStyle = "#f2c230";
    c.beginPath();
    c.arc(PX, PY, 3.5, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "#0b0d14";
    c.lineWidth = 1.5;
    c.stroke();
  };

  const loop = () => {
    raf = requestAnimationFrame(loop);
    const now = performance.now();
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (paused()) {
      if (keys.size) keys.clear();
      run = false;
      return;
    }
    clock += dt;
    step(dt);
    renderer.render(scene, camera);
    if (!ready) {
      ready = true;
      hooks.onReady();
    }
  };
  raf = requestAnimationFrame(loop);

  return {
    zoom,
    interact,
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
      ro.disconnect();
      for (const p of pods) p.tag.remove();
      player.dispose();
      for (const w of crew) w.bot.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mats = m.material ? (Array.isArray(m.material) ? m.material : [m.material]) : [];
        for (const mat of mats) mat.dispose();
      });
      for (const t of owned) t.dispose();
      disposeSheets();
      renderer.dispose();
    },
  };
}

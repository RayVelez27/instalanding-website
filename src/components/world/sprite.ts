import * as THREE from "three";

/**
 * The WORLD's builder bot, drawn here pixel by pixel: a hard hat, a glowing
 * visor and a pair of overalls, in a three-quarter view toward the camera
 * (front) and away from it (back). Each view has an idle frame, a blink and a
 * four-frame walk; the left-facing views are the right ones mirrored in the
 * UVs, so one 6x2 sheet of 24x32 cells covers every direction.
 *
 * No sheet from elsewhere: the reference video's sprite kit is not for
 * commercial use, so this one is original and recoloured per bot.
 */

export const CELL_W = 24;
export const CELL_H = 32;
const COLS = 6; // idle, blink, walk 0..3
const ROWS = 2; // front, back

export interface BotColors {
  hat: string;
  hatShade: string;
  hatLight: string;
  suit: string;
  suitShade: string;
  suitLight: string;
  eye: string;
}

export const PLAYER_COLORS: BotColors = {
  hat: "#f2c230",
  hatShade: "#c99a1a",
  hatLight: "#ffe17a",
  suit: "#3c62d2",
  suitShade: "#2b47a0",
  suitLight: "#73a7ff",
  eye: "#7fffd4",
};

/** A crew member's colours from one hue: the hat and the suit stay apart. */
export const crewColors = (hue: number): BotColors => ({
  hat: `hsl(${hue} 62% 58%)`,
  hatShade: `hsl(${hue} 55% 42%)`,
  hatLight: `hsl(${hue} 80% 74%)`,
  suit: `hsl(${(hue + 150) % 360} 28% 38%)`,
  suitShade: `hsl(${(hue + 150) % 360} 30% 27%)`,
  suitLight: `hsl(${(hue + 150) % 360} 34% 52%)`,
  eye: "#ffd166",
});

const OUTLINE = "#0b0d14";
const METAL = "#9aa0b5";
const METAL_SHADE = "#5d6378";
const VISOR = "#151a18";
const BOOT = "#2c3042";
const PACK = "#8e6c42";
const PACK_SHADE = "#6f5432";

type Px = (x: number, y: number, w: number, h: number, c: string) => void;

function drawBot(px: Px, back: boolean, frame: number, c: BotColors) {
  // frame: 0 idle, 1 blink, 2..5 walk
  const walk = frame >= 2 ? frame - 2 : -1;
  const bob = walk === 1 || walk === 3 ? -1 : 0;
  const stride = walk === 0 ? 1 : walk === 2 ? -1 : 0;

  // legs and boots: the far leg first, a stride lifts one and pushes the other
  const leg = (x: number, lift: number, shift: number, shade: boolean) => {
    px(x + shift, 24 - lift, 3, 5, shade ? c.suitShade : c.suit);
    px(x + shift - (back ? 0 : 0), 28 - lift, 4, 3, BOOT);
  };
  leg(8, stride > 0 ? 1 : 0, stride < 0 ? 1 : 0, true);
  leg(13, stride < 0 ? 1 : 0, stride > 0 ? 1 : 0, false);

  const y = (v: number) => v + bob;

  // far arm, behind the body
  px(4, y(15) + (stride < 0 ? 1 : 0), 2, 6, METAL_SHADE);
  px(4, y(21) + (stride < 0 ? 1 : 0), 2, 2, METAL);

  // body: overalls with a shaded side, a lit edge and a belt
  px(6, y(14), 12, 10, c.suit);
  px(6, y(14), 2, 10, c.suitShade);
  px(16, y(14), 2, 10, c.suitLight);
  px(6, y(21), 12, 1, OUTLINE);
  if (back) {
    // a tool pack on the back
    px(8, y(15), 8, 6, PACK);
    px(8, y(20), 8, 1, PACK_SHADE);
    px(9, y(16), 6, 1, PACK_SHADE);
  } else {
    px(9, y(15), 1, 1, c.hatLight);
    px(14, y(15), 1, 1, c.hatLight);
    px(10, y(17), 4, 3, c.suitShade);
  }

  // near arm, swinging with the stride
  px(18, y(15) + (stride > 0 ? 1 : 0), 2, 6, METAL);
  px(18, y(21) + (stride > 0 ? 1 : 0), 2, 2, "#d9dce6");

  // neck
  px(9, y(13), 6, 1, METAL_SHADE);

  // head: helmet dome, brim, then the visor (front) or the back plate
  px(9, y(3), 6, 1, c.hat);
  px(7, y(4), 10, 1, c.hat);
  px(6, y(5), 12, 4, c.hat);
  px(6, y(5), 2, 4, c.hatShade);
  px(12, y(4), 3, 2, c.hatLight);
  px(5, y(9), 14, 1, c.hatShade);
  if (back) {
    px(7, y(10), 10, 3, METAL_SHADE);
    px(8, y(11), 8, 1, OUTLINE);
  } else {
    px(7, y(10), 11, 3, VISOR);
    if (frame !== 1) {
      px(12, y(11), 2, 1, c.eye);
      px(15, y(11), 2, 1, c.eye);
    } else {
      px(12, y(11), 2, 1, "#2a3b37");
      px(15, y(11), 2, 1, "#2a3b37");
    }
  }

  // antenna with a lit tip
  px(11, y(0), 1, 3, METAL);
  px(11, y(0), 1, 1, frame === 1 ? "#ff8f8f" : "#ff5f5f");
}

/** Every opaque pixel gets a 1px dark outline, the sheet's only line work. */
function outline(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const solid = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 0;
  const edge: number[] = [];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (solid(x, y)) continue;
      // stay inside the cell: never bleed into a neighbour
      const cx = x % CELL_W, cy = y % CELL_H;
      const n = (dx: number, dy: number) => {
        const nx = cx + dx, ny = cy + dy;
        return nx >= 0 && ny >= 0 && nx < CELL_W && ny < CELL_H && solid(x + dx, y + dy);
      };
      if (n(1, 0) || n(-1, 0) || n(0, 1) || n(0, -1)) edge.push(x, y);
    }
  ctx.fillStyle = OUTLINE;
  for (let i = 0; i < edge.length; i += 2) ctx.fillRect(edge[i], edge[i + 1], 1, 1);
}

const sheets = new Map<string, THREE.CanvasTexture>();

export function botSheet(c: BotColors): THREE.CanvasTexture {
  const key = Object.values(c).join("|");
  const hit = sheets.get(key);
  if (hit) return hit;
  const canvas = document.createElement("canvas");
  canvas.width = CELL_W * COLS;
  canvas.height = CELL_H * ROWS;
  const ctx = canvas.getContext("2d")!;
  for (let row = 0; row < ROWS; row++)
    for (let col = 0; col < COLS; col++) {
      const ox = col * CELL_W, oy = row * CELL_H;
      // inset by a pixel so the outline fits inside the cell
      const px: Px = (x, y, w, h, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(ox + x, oy + y + 1, w, h);
      };
      drawBot(px, row === 1, col, c);
    }
  outline(ctx, canvas.width, canvas.height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  sheets.set(key, tex);
  return tex;
}

export function disposeSheets() {
  for (const t of sheets.values()) t.dispose();
  sheets.clear();
}

/** World units per sprite pixel; taller than wide, the way a tactics camera sees a sprite. */
export const PX_W = 1.75;
export const PX_H = 2.1;

export interface Bot {
  group: THREE.Group;
  shadow: THREE.Mesh;
  /** Pick the cell: back (facing away), mirrored (facing left), frame 0..5 */
  pose(back: boolean, left: boolean, frame: number): void;
  dispose(): void;
}

const SHADOW_GEO = new THREE.CircleGeometry(1, 20).rotateX(-Math.PI / 2);

export function createBot(colors: BotColors, shadowMat: THREE.Material): Bot {
  const tex = botSheet(colors);
  const geo = new THREE.PlaneGeometry(1, 1);
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.scale.set(CELL_W * PX_W, CELL_H * PX_H, 1);
  mesh.position.y = (CELL_H * PX_H) / 2;
  const group = new THREE.Group();
  group.add(mesh);
  const shadow = new THREE.Mesh(SHADOW_GEO, shadowMat);
  shadow.scale.set(15, 1, 10);
  shadow.renderOrder = 1;
  let last = "";
  return {
    group,
    shadow,
    pose(back, left, frame) {
      const key = `${back}${left}${frame}`;
      if (key === last) return;
      last = key;
      const u0 = (frame * CELL_W) / (CELL_W * COLS), u1 = ((frame + 1) * CELL_W) / (CELL_W * COLS);
      const row = back ? 1 : 0;
      const v1 = 1 - (row * CELL_H) / (CELL_H * ROWS), v0 = 1 - ((row + 1) * CELL_H) / (CELL_H * ROWS);
      const [l, r] = left ? [u1, u0] : [u0, u1];
      const uv = geo.attributes.uv as THREE.BufferAttribute;
      uv.setXY(0, l, v1);
      uv.setXY(1, r, v1);
      uv.setXY(2, l, v0);
      uv.setXY(3, r, v0);
      uv.needsUpdate = true;
    },
    dispose() {
      geo.dispose();
      mat.dispose();
      group.removeFromParent();
      shadow.removeFromParent();
    },
  };
}

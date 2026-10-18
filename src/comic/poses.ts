// Pantins articulés : morphologies, bibliothèque de poses et interpolation.
// Repère : personnage tourné vers la droite, pieds à (0,0), y vers le bas (SVG).
// Angles en degrés : 0 = membre vers le bas, 90 = vers l'avant, 180 = vers le haut.

export type Limb = {a: number; b: number}; // a : segment haut (absolu), b : pliure du coude / genou (relative)

export type Pose = {
  torso: number; // inclinaison du buste : 0 = droit, + = vers l'avant
  head: number; // inclinaison de la tête par rapport au buste
  armF: Limb; // bras avant (devant le corps)
  armB: Limb; // bras arrière
  legF: Limb;
  legB: Limb;
  rot?: number; // rotation de tout le corps autour des hanches (allongé : -90)
  dx?: number; // décalage horizontal (en unités de hauteur de jambe)
  dy?: number; // décalage vertical (+ = plus bas)
};

export type Build = {
  thigh: number;
  shin: number;
  torso: number;
  upper: number;
  fore: number;
  head: number;
  limb: number; // épaisseur des membres
  hipW: number;
  shoulderW: number;
  belly?: number; // ventre (sumo)
};

const base: Build = {thigh: 46, shin: 46, torso: 66, upper: 34, fore: 32, head: 17, limb: 16, hipW: 30, shoulderW: 38};

export const BUILDS: Record<string, Build> = {
  // Royce : fin et un peu plus petit
  slim: {...base, thigh: 44, shin: 44, torso: 62, upper: 32, fore: 30, head: 16, limb: 15, hipW: 28, shoulderW: 34},
  normal: base,
  heavy: {...base, thigh: 50, shin: 48, torso: 74, upper: 37, fore: 35, head: 19, limb: 25, hipW: 44, shoulderW: 56},
  muscle: {...base, thigh: 50, shin: 50, torso: 74, upper: 38, fore: 36, head: 18, limb: 28, hipW: 38, shoulderW: 76},
  tall: {...base, thigh: 58, shin: 58, torso: 78, upper: 42, fore: 40, head: 18, limb: 20, hipW: 34, shoulderW: 48},
  sumo: {...base, thigh: 40, shin: 40, torso: 76, upper: 36, fore: 34, head: 20, limb: 34, hipW: 70, shoulderW: 70, belly: 64},
};

const L = (a: number, b: number): Limb => ({a, b});

export const POSES: Record<string, Pose> = {
  stand: {torso: 0, head: 0, armF: L(8, 10), armB: L(-8, 10), legF: L(4, -4), legB: L(-4, -4)},
  guard: {torso: 10, head: -6, armF: L(45, 115), armB: L(25, 130), legF: L(22, -14), legB: L(-24, -8), dy: 0.06},
  punch: {torso: 18, head: -6, armF: L(92, 2), armB: L(20, 130), legF: L(26, -12), legB: L(-30, -4), dy: 0.06},
  kick: {torso: -28, head: 10, armF: L(60, 50), armB: L(-50, 40), legF: L(125, -8), legB: L(-6, -2)},
  shoot: {torso: 72, head: -40, armF: L(110, -6), armB: L(95, -4), legF: L(70, -95), legB: L(-35, -10), dy: 0.38},
  walk1: {torso: 4, head: 0, armF: L(-20, 20), armB: L(25, 20), legF: L(25, -10), legB: L(-20, -25)},
  walk2: {torso: 4, head: 0, armF: L(25, 20), armB: L(-20, 20), legF: L(-20, -25), legB: L(25, -10)},
  armsUp: {torso: -4, head: -18, armF: L(160, -15), armB: L(200, 15), legF: L(14, -4), legB: L(-14, -4)},
  flex: {torso: 0, head: -6, armF: L(95, -115), armB: L(80, -120), legF: L(14, -4), legB: L(-14, -4)},
  crossed: {torso: 0, head: -4, armF: L(25, 105), armB: L(15, 115), legF: L(10, -4), legB: L(-10, -4)},
  // au sol, sur le dos (tête vers l'arrière)
  lying: {torso: 0, head: 0, armF: L(30, 10), armB: L(-20, 10), legF: L(4, 0), legB: L(-4, 0), rot: -90, dy: 0.62},
  tapA: {torso: 0, head: -10, armF: L(80, 20), armB: L(-20, 10), legF: L(25, -30), legB: L(-4, 0), rot: -90, dy: 0.62},
  tapB: {torso: 0, head: -10, armF: L(115, 10), armB: L(-20, 10), legF: L(25, -30), legB: L(-4, 0), rot: -90, dy: 0.62},
  // face contre le sol (KO)
  fallen: {torso: 0, head: 10, armF: L(170, 10), armB: L(150, 10), legF: L(0, 0), legB: L(-6, 0), rot: 90, dy: 0.66},
  // à cheval sur un adversaire allongé
  mount: {torso: 6, head: -4, armF: L(70, 60), armB: L(50, 70), legF: L(75, -125), legB: L(60, -120), dy: 0.62},
  // assis, jambes devant
  sit: {torso: 4, head: 0, armF: L(40, 30), armB: L(20, 30), legF: L(88, 0), legB: L(82, -6), dy: 0.5},
  // assis derrière l'adversaire, bras autour du cou
  choke: {torso: 14, head: -8, armF: L(70, 95), armB: L(60, 105), legF: L(70, -20), legB: L(78, -10), dy: 0.5},
  // assis, étranglé : buste en arrière, mains sur le bras
  choked: {torso: -14, head: -16, armF: L(150, 40), armB: L(140, 50), legF: L(84, -4), legB: L(88, 0), dy: 0.5},
  chokedTap: {torso: -14, head: -16, armF: L(150, 40), armB: L(30, 10), legF: L(84, -4), legB: L(88, 0), dy: 0.5},
  // allongé sur le dos, jambes qui frappent vers l'avant (Inoki contre Ali)
  groundKickA: {torso: 0, head: -20, armF: L(-30, 20), armB: L(-50, 20), legF: L(80, -10), legB: L(30, -70), rot: -90},
  groundKickB: {torso: 0, head: -20, armF: L(-30, 20), armB: L(-50, 20), legF: L(35, -80), legB: L(85, -5), rot: -90},
  // assis au sol, jambes douloureuses
  hurt: {torso: 20, head: 25, armF: L(70, 40), armB: L(60, 50), legF: L(80, -20), legB: L(70, -40)},
  bow: {torso: 50, head: 10, armF: L(10, 0), armB: L(-5, 0), legF: L(4, -4), legB: L(-4, -4)},
};

export type PoseKey = {pose: string; t: number};

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerpLimb = (a: Limb, b: Limb, k: number): Limb => ({a: lerp(a.a, b.a, k), b: lerp(a.b, b.b, k)});
const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

export function mixPose(p: Pose, q: Pose, k: number): Pose {
  return {
    torso: lerp(p.torso, q.torso, k),
    head: lerp(p.head, q.head, k),
    armF: lerpLimb(p.armF, q.armF, k),
    armB: lerpLimb(p.armB, q.armB, k),
    legF: lerpLimb(p.legF, q.legF, k),
    legB: lerpLimb(p.legB, q.legB, k),
    rot: lerp(p.rot ?? 0, q.rot ?? 0, k),
    dx: lerp(p.dx ?? 0, q.dx ?? 0, k),
    dy: lerp(p.dy ?? 0, q.dy ?? 0, k),
  };
}

/** Pose à l'instant t (secondes depuis le début de la case), transition de `dur` secondes vers chaque nouvelle pose. */
export function poseAt(keys: PoseKey[], t: number, dur = 0.2): Pose {
  const get = (n: string) => POSES[n] ?? POSES.stand;
  if (!keys.length) return POSES.stand;
  let cur = get(keys[0].pose);
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (t < k.t) break;
    const p = Math.min(1, (t - k.t) / dur);
    cur = p >= 1 ? get(k.pose) : mixPose(cur, get(k.pose), ease(p));
  }
  // Respiration légère pour que rien ne soit figé
  const breath = Math.sin(t * 4) * 1.5;
  return {...cur, torso: cur.torso + breath * 0.6, armF: {...cur.armF, a: cur.armF.a + breath}};
}

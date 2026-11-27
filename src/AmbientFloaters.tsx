'use client';

import { useEffect, useMemo, useRef, type CSSProperties } from 'react';

export type AmbientPalette = [deep: string, mid: string, light: string];

type PetalShape = 'notch' | 'round';
type Sprite = { front: HTMLCanvasElement; back: HTMLCanvasElement; soft: HTMLCanvasElement };
type Kind = 'heart' | 'petal' | 'leaf';

type Particle = {
  kind: Kind;
  sprite: Sprite;
  x: number;
  y: number;
  /** 0 = far, 1 = near — drives size, speed, opacity, focus. */
  z: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vr: number;
  spin: number;
  vs: number;
  phase: number;
  alpha: number;
  once: boolean;
};

/** Blush / rose — default for most wedding templates. */
export const AMBIENT_PALETTE_BLUSH = {
  petals: [
    { shape: 'notch' as const, colors: ['#d9617f', '#f4a9bb', '#fff1f4'] satisfies AmbientPalette },
    { shape: 'notch' as const, colors: ['#e57f98', '#f8c3cf', '#fff8fa'] satisfies AmbientPalette },
    { shape: 'round' as const, colors: ['#a8243f', '#dc6680', '#f6b8c5'] satisfies AmbientPalette },
    { shape: 'round' as const, colors: ['#cfa27e', '#eedac4', '#fffaf2'] satisfies AmbientPalette },
  ],
  hearts: [
    ['#c4566f', '#ec9aab', '#fde3e9'],
    ['#d0788a', '#f3b6c2', '#fff0f3'],
    ['#b9806a', '#e6b9a5', '#fbeee6'],
  ] as AmbientPalette[],
  leaves: [
    ['#5f7f52', '#a9c08f', '#e8f0dc'],
    ['#7f9a68', '#c3d3a6', '#f0f6e8'],
    ['#4f6d47', '#8fae7b', '#e4eed8'],
  ] as AmbientPalette[],
};

/** Gold + velvet blush — Song Hỷ / nhung đỏ. */
export const AMBIENT_PALETTE_GOLD = {
  petals: [
    { shape: 'notch' as const, colors: ['#c9a227', '#f5d28a', '#fff8e8'] satisfies AmbientPalette },
    { shape: 'round' as const, colors: ['#d4af37', '#f8e2b0', '#fffaf0'] satisfies AmbientPalette },
    { shape: 'notch' as const, colors: ['#c45c6a', '#fde4e8', '#fff1f2'] satisfies AmbientPalette },
    { shape: 'round' as const, colors: ['#9b1b2f', '#e08a9a', '#fff1f2'] satisfies AmbientPalette },
  ],
  hearts: [
    ['#c45c6a', '#f7c3cc', '#fff0f3'],
    ['#9b1b2f', '#fde0e5', '#fff5f7'],
    ['#c9a227', '#f5d28a', '#fff8e8'],
  ] as AmbientPalette[],
  leaves: AMBIENT_PALETTE_BLUSH.leaves,
};

/** Sage botanical — love-journey. */
export const AMBIENT_PALETTE_SAGE = {
  petals: [
    { shape: 'round' as const, colors: ['#f1a7b5', '#fde4e8', '#fff8fa'] satisfies AmbientPalette },
    { shape: 'notch' as const, colors: ['#f4bcc6', '#fff1f2', '#ffffff'] satisfies AmbientPalette },
    { shape: 'round' as const, colors: ['#e78b9e', '#fbd5dc', '#fff5f7'] satisfies AmbientPalette },
  ],
  hearts: [
    ['#d9667d', '#f7c3cc', '#fff0f3'],
    ['#e98ea0', '#fde0e5', '#fff8fa'],
  ] as AmbientPalette[],
  leaves: [
    ['#5f7f52', '#a9c08f', '#e8f0dc'],
    ['#7f9a68', '#c3d3a6', '#f0f6e8'],
    ['#4f6d47', '#8fae7b', '#e4eed8'],
  ] as AmbientPalette[],
};

export type AmbientPalettePreset = 'blush' | 'gold' | 'sage';

const PRESETS = {
  blush: AMBIENT_PALETTE_BLUSH,
  gold: AMBIENT_PALETTE_GOLD,
  sage: AMBIENT_PALETTE_SAGE,
} as const;

const SPRITE = 96;
const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

function canvas(size: number) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  return c;
}

function heartPath(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.22);
  ctx.bezierCurveTo(-s * 0.08, -s * 0.42, -s * 0.46, -s * 0.44, -s * 0.44, -s * 0.12);
  ctx.bezierCurveTo(-s * 0.42, s * 0.12, -s * 0.12, s * 0.28, 0, s * 0.48);
  ctx.bezierCurveTo(s * 0.12, s * 0.28, s * 0.42, s * 0.12, s * 0.44, -s * 0.12);
  ctx.bezierCurveTo(s * 0.46, -s * 0.44, s * 0.08, -s * 0.42, 0, -s * 0.22);
  ctx.closePath();
}

function petalPath(ctx: CanvasRenderingContext2D, L: number, shape: PetalShape) {
  ctx.beginPath();
  ctx.moveTo(0, L);
  ctx.bezierCurveTo(-L * 0.78, L * 0.42, -L * 0.74, -L * 0.74, -L * 0.2, -L * 0.92);
  if (shape === 'notch') {
    ctx.quadraticCurveTo(-L * 0.07, -L * 0.96, 0, -L * 0.76);
    ctx.quadraticCurveTo(L * 0.07, -L * 0.96, L * 0.2, -L * 0.92);
  } else {
    ctx.quadraticCurveTo(0, -L * 1.04, L * 0.2, -L * 0.92);
  }
  ctx.bezierCurveTo(L * 0.74, -L * 0.74, L * 0.78, L * 0.42, 0, L);
  ctx.closePath();
}

function paintPetal(c: HTMLCanvasElement, shape: PetalShape, [deep, mid, light]: AmbientPalette, back: boolean) {
  const ctx = c.getContext('2d')!;
  const L = SPRITE * 0.4;
  ctx.translate(SPRITE / 2, SPRITE / 2);
  petalPath(ctx, L, shape);
  const g = ctx.createRadialGradient(0, L, L * 0.05, 0, L * 0.2, L * 2);
  g.addColorStop(0, deep);
  g.addColorStop(0.42, mid);
  g.addColorStop(1, light);
  ctx.fillStyle = g;
  ctx.fill();
  if (back) {
    ctx.fillStyle = 'rgba(255, 246, 248, 0.34)';
    ctx.fill();
  } else {
    ctx.save();
    ctx.clip();
    const sheen = ctx.createLinearGradient(-L, -L, L, L);
    sheen.addColorStop(0, 'rgba(255,255,255,0)');
    sheen.addColorStop(0.45, 'rgba(255,255,255,0.28)');
    sheen.addColorStop(0.6, 'rgba(255,255,255,0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(-L, -L, L * 2, L * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 0.8;
    for (const spread of [-0.34, 0, 0.34]) {
      ctx.beginPath();
      ctx.moveTo(0, L * 0.9);
      ctx.quadraticCurveTo(spread * L * 0.5, 0, spread * L, -L * 0.7);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.strokeStyle = deep;
  ctx.globalAlpha = 0.25;
  ctx.lineWidth = 0.8;
  ctx.stroke();
}

function paintHeart(c: HTMLCanvasElement, [deep, mid, light]: AmbientPalette) {
  const ctx = c.getContext('2d')!;
  const s = SPRITE * 0.62;
  ctx.translate(SPRITE / 2, SPRITE / 2);
  heartPath(ctx, s);
  const g = ctx.createRadialGradient(-s * 0.14, -s * 0.18, s * 0.02, 0, s * 0.05, s * 0.6);
  g.addColorStop(0, light);
  g.addColorStop(0.5, mid);
  g.addColorStop(1, deep);
  ctx.shadowColor = mid;
  ctx.shadowBlur = SPRITE * 0.05;
  ctx.fillStyle = g;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 0.9;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.32)';
  ctx.beginPath();
  ctx.ellipse(-s * 0.22, -s * 0.16, s * 0.08, s * 0.04, -0.75, 0, Math.PI * 2);
  ctx.fill();
}

function paintLeaf(c: HTMLCanvasElement, [deep, mid, light]: AmbientPalette, back: boolean) {
  const ctx = c.getContext('2d')!;
  const s = SPRITE;
  ctx.translate(s / 2, s / 2);
  ctx.rotate(-Math.PI / 4);
  ctx.beginPath();
  ctx.moveTo(-s * 0.4, 0);
  ctx.bezierCurveTo(-s * 0.18, -s * 0.22, s * 0.18, -s * 0.22, s * 0.4, 0);
  ctx.bezierCurveTo(s * 0.18, s * 0.22, -s * 0.18, s * 0.22, -s * 0.4, 0);
  const g = ctx.createLinearGradient(-s * 0.4, 0, s * 0.4, 0);
  g.addColorStop(0, light);
  g.addColorStop(0.45, mid);
  g.addColorStop(1, deep);
  ctx.fillStyle = g;
  ctx.fill();
  if (back) {
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(-s * 0.36, 0);
    ctx.lineTo(s * 0.36, 0);
    ctx.strokeStyle = 'rgba(240,246,228,.65)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
}

/** Soft blur via downscale — works where `ctx.filter` does not (Safari). */
function soften(src: HTMLCanvasElement) {
  const small = canvas(SPRITE / 6);
  const sctx = small.getContext('2d')!;
  sctx.imageSmoothingQuality = 'high';
  sctx.drawImage(src, 0, 0, small.width, small.height);
  const out = canvas(SPRITE);
  const octx = out.getContext('2d')!;
  octx.imageSmoothingQuality = 'high';
  octx.drawImage(small, 0, 0, SPRITE, SPRITE);
  return out;
}

function buildSprites(preset: AmbientPalettePreset) {
  const palettes = PRESETS[preset];
  const petals: Sprite[] = palettes.petals.map(({ shape, colors }) => {
    const front = canvas(SPRITE);
    const back = canvas(SPRITE);
    paintPetal(front, shape, colors, false);
    paintPetal(back, shape, colors, true);
    return { front, back, soft: soften(front) };
  });
  const hearts: Sprite[] = palettes.hearts.map((colors) => {
    const front = canvas(SPRITE);
    paintHeart(front, colors);
    return { front, back: front, soft: soften(front) };
  });
  const leaves: Sprite[] = palettes.leaves.map((colors) => {
    const front = canvas(SPRITE);
    const back = canvas(SPRITE);
    paintLeaf(front, colors, false);
    paintLeaf(back, colors, true);
    return { front, back, soft: soften(front) };
  });
  return { petals, hearts, leaves };
}

export type AmbientFloatersProps = {
  petals?: boolean;
  hearts?: boolean;
  /** Sage botanical leaves (often paired with `petals`). */
  leaves?: boolean;
  /** Increment to release a short heart trail (e.g. on envelope open). */
  burst?: number;
  heartCount?: number;
  petalCount?: number;
  leafCount?: number;
  /** Color mood. Templates pick a preset; sprites rebuild when it changes. */
  palette?: AmbientPalettePreset;
  className?: string;
  style?: CSSProperties;
  /** Default 40 — below typical docks/gates, above invite content. */
  zIndex?: number;
};

/**
 * Fixed fullscreen canvas: petals/leaves tumble down, hearts drift up.
 * Depth-sorted with soft far particles. Pauses while the tab is hidden.
 */
export function AmbientFloaters({
  petals = false,
  hearts = false,
  leaves = false,
  burst = 0,
  heartCount = 5,
  petalCount = 20,
  leafCount = 8,
  palette = 'blush',
  className,
  style,
  zIndex = 40,
}: AmbientFloatersProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const size = useRef({ width: 0, height: 0 });
  const sprites = useRef<ReturnType<typeof buildSprites> | null>(null);
  const kick = useRef<() => void>(() => {});
  const active = petals || hearts || leaves;

  const paletteKey = useMemo(() => palette, [palette]);

  useEffect(() => {
    const el = ref.current;
    const ctx = el?.getContext('2d');
    if (!el || !ctx || !active) return;
    sprites.current = buildSprites(paletteKey);
    const art = sprites.current;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let frame = 0;
    let last = 0;

    const depth = () => (Math.random() < 0.1 ? rand(0.92, 1) : rand(0, 0.85));

    const spawnHeart = (scatter: boolean): Particle => {
      const { width, height } = size.current;
      const z = rand(0.1, 0.8);
      return {
        kind: 'heart',
        sprite: pick(art.hearts),
        x: rand(0, width),
        y: scatter ? rand(height * 0.3, height) : height + rand(20, 80),
        z,
        vx: 0,
        vy: -rand(0.3, 0.55) * (0.6 + z * 0.6),
        size: rand(10, 16) * (0.6 + z * 0.8),
        rot: rand(-0.3, 0.3),
        vr: 0,
        spin: 0,
        vs: 0,
        phase: rand(0, Math.PI * 2),
        alpha: 0.3 + z * 0.4,
        once: false,
      };
    };

    const spawnFalling = (kind: 'petal' | 'leaf', scatter: boolean): Particle => {
      const { width, height } = size.current;
      const z = depth();
      const pool = kind === 'leaf' ? art.leaves : art.petals;
      return {
        kind,
        sprite: pick(pool),
        x: rand(-width * 0.2, width),
        y: scatter ? rand(0, height) : -rand(20, 80),
        z,
        vx: rand(0.15, 0.45),
        vy: rand(0.45, 0.85) * (0.5 + z * 0.9),
        size: (kind === 'leaf' ? rand(14, 24) : rand(16, 26)) * (0.5 + z * 1.3),
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.012, 0.012),
        spin: rand(0, Math.PI * 2),
        vs: rand(0.02, 0.055),
        phase: rand(0, Math.PI * 2),
        alpha: z > 0.9 ? 0.55 : 0.5 + z * 0.45,
        once: false,
      };
    };

    const seed = () => {
      particles.current = particles.current.filter((p) => p.once);
      if (hearts) for (let i = 0; i < heartCount; i++) particles.current.push(spawnHeart(true));
      if (petals) for (let i = 0; i < petalCount; i++) particles.current.push(spawnFalling('petal', true));
      if (leaves) for (let i = 0; i < leafCount; i++) particles.current.push(spawnFalling('leaf', true));
    };

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      size.current = { width, height };
      el.width = Math.round(width * dpr);
      el.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingQuality = 'high';
    };

    const draw = (now: number) => {
      frame = 0;
      if (document.hidden) {
        last = 0;
        return;
      }
      const dt = last ? Math.min(3, (now - last) / 16.67) : 1;
      last = now;
      const { width, height } = size.current;
      const wind = Math.sin(now / 2600) * 0.45 + Math.sin(now / 1100) * 0.22 + Math.sin(now / 470) * 0.08;
      ctx.clearRect(0, 0, width, height);

      const next: Particle[] = [];
      for (const p of particles.current) {
        p.phase += 0.02 * dt;
        const focus = p.z > 0.9 || p.z < 0.2 ? p.sprite.soft : null;
        if (p.kind === 'heart') {
          p.x += (Math.sin(p.phase) * 0.45 + p.vx + wind * 0.25 * p.z) * dt;
          p.y += p.vy * dt;
          if (p.once) p.vy = Math.min(-0.7, p.vy * 0.992);
          p.vx *= 0.98;
          if (p.y < -60) {
            if (!p.once) next.push(spawnHeart(false));
            continue;
          }
          const fadeOut = Math.min(1, Math.max(0, p.y / (height * 0.35)));
          const fadeIn = Math.min(1, Math.max(0, (height + 40 - p.y) / 160));
          const fade = fadeOut * fadeIn;
          const beat = 1 + Math.max(0, Math.sin(p.phase * 3)) * 0.025;
          const d = p.size * 1.6 * beat;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot + Math.sin(p.phase) * 0.15);
          ctx.globalAlpha = p.alpha * fade;
          ctx.drawImage(focus ?? p.sprite.front, -d / 2, -d / 2, d, d);
          ctx.restore();
        } else {
          p.spin += p.vs * dt;
          const turn = Math.cos(p.spin);
          p.x += (p.vx + wind * (0.4 + p.z) + Math.sin(p.spin) * 0.5) * dt;
          p.y += p.vy * (0.75 + Math.abs(turn) * 0.45) * dt;
          p.rot += (p.vr + Math.sin(p.phase) * 0.004) * dt;
          if (p.y > height + 60 || p.x > width + 60 || p.x < -width * 0.3) {
            if (!p.once) next.push(spawnFalling(p.kind, false));
            continue;
          }
          const d = p.size * 2;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.scale(Math.max(0.12, Math.abs(turn)), 0.82 + Math.sin(p.spin * 0.7) * 0.18);
          ctx.globalAlpha = p.alpha;
          ctx.drawImage(focus ?? (turn >= 0 ? p.sprite.front : p.sprite.back), -d / 2, -d / 2, d, d);
          ctx.restore();
        }
        next.push(p);
      }
      next.sort((a, b) => a.z - b.z);
      particles.current = next;
      if (next.length) frame = requestAnimationFrame(draw);
    };

    kick.current = () => {
      if (!frame && !document.hidden && particles.current.length) frame = requestAnimationFrame(draw);
    };

    resize();
    seed();
    particles.current.sort((a, b) => a.z - b.z);
    kick.current();
    window.addEventListener('resize', resize);
    const onVisibility = () => kick.current();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(frame);
      kick.current = () => {};
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [hearts, petals, leaves, heartCount, petalCount, leafCount, paletteKey, active]);

  useEffect(() => {
    if (!burst || !hearts) return;
    sprites.current ??= buildSprites(paletteKey);
    const art = sprites.current;
    const { width, height } = size.current;
    for (let i = 0; i < 12; i++) {
      const z = rand(0.3, 0.85);
      particles.current.push({
        kind: 'heart',
        sprite: pick(art.hearts),
        x: width / 2 + rand(-width * 0.34, width * 0.34),
        y: height + 20 + (i / 12) * height * 0.6 + rand(0, 40),
        z,
        vx: rand(-0.5, 0.5),
        vy: -rand(1.3, 2.1) * (0.7 + z * 0.4),
        size: rand(12, 19) * (0.7 + z * 0.5),
        rot: rand(-0.3, 0.3),
        vr: 0,
        spin: 0,
        vs: 0,
        phase: rand(0, Math.PI * 2),
        alpha: rand(0.55, 0.8),
        once: true,
      });
    }
    particles.current.sort((a, b) => a.z - b.z);
    kick.current();
  }, [burst, hearts, paletteKey]);

  if (!active) return null;

  return (
    <canvas
      ref={ref}
      className={className}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex,
        pointerEvents: 'none',
        ...style,
      }}
    />
  );
}

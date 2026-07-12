import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { CanvasTexture } from 'three';
import '../styles/HeroScene.css';

// ─── Texture ──────────────────────────────────────────────────────────────────

/**
 * Procedurally draws a classic football (soccer ball) texture onto an offscreen
 * canvas and returns it as a Three.js CanvasTexture.
 *
 * Paints black pentagons at 13 canonical positions, then overlays a hexagon grid.
 * Defined at module scope — texture is built once and reused.
 *
 * @returns {CanvasTexture}
 */
function buildSoccerTexture() {
  const SIZE = 512;
  const c = document.createElement('canvas');
  c.width = SIZE;
  c.height = SIZE;
  const ctx = c.getContext('2d');

  // White base
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Classic football pentagon positions [u, v] in 0..1 space (equirectangular UV)
  const PENTAGONS = [
    [0.50, 0.07],  // top pole
    [0.10, 0.25],  [0.35, 0.20], [0.65, 0.20], [0.90, 0.25],
    [0.20, 0.50],  [0.50, 0.45], [0.80, 0.50],
    [0.10, 0.73],  [0.35, 0.78], [0.65, 0.78], [0.90, 0.73],
    [0.50, 0.93],  // bottom pole
  ];

  const RADIUS = SIZE * 0.072;
  const SIDES  = 5;

  ctx.fillStyle = '#111111';

  PENTAGONS.forEach(([u, v]) => {
    const cx = u * SIZE;
    const cy = v * SIZE;
    ctx.beginPath();
    for (let i = 0; i < SIDES; i++) {
      const angle = (Math.PI * 2 * i) / SIDES - Math.PI / 2;
      const x = cx + RADIUS * Math.cos(angle);
      const y = cy + RADIUS * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  });

  // Hexagon grid overlay between pentagons
  ctx.strokeStyle = 'rgba(30,30,30,0.22)';
  ctx.lineWidth = 1.5;
  const HEX_R = SIZE * 0.054;
  const HEX_W = HEX_R * 2;
  const HEX_H = Math.sqrt(3) * HEX_R;

  for (let row = -1; row < SIZE / HEX_H + 2; row++) {
    for (let col = -1; col < SIZE / HEX_W + 2; col++) {
      const offsetX = row % 2 === 0 ? 0 : HEX_R;
      const cx2 = col * HEX_W * 1.5 + offsetX;
      const cy2 = row * HEX_H;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + Math.PI / 6;
        const x = cx2 + HEX_R * Math.cos(angle);
        const y = cy2 + HEX_R * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  return new CanvasTexture(c);
}

// ─── SoccerBall ───────────────────────────────────────────────────────────────

/**
 * Rotating soccer-ball mesh.
 * Defined outside HeroScene so React never re-mounts it on parent re-renders.
 * (Vercel: `rerender-no-inline-components`)
 */
function SoccerBall() {
  const meshRef = useRef(null);

  // Build texture once per mount — expensive canvas work stays out of render path.
  // (Vercel: `rerender-lazy-state-init` pattern)
  const texture = useMemo(() => buildSoccerTexture(), []);

  // Rotate in the R3F loop — delta-based so it's frame-rate independent.
  // Stored in ref, never triggers React re-render.
  // (Vercel: `rerender-use-ref-transient-values`)
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.35;
    meshRef.current.rotation.x += delta * 0.06;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.3, 64, 64]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.5}
        metalness={0.04}
      />
    </mesh>
  );
}

// ─── HeroScene ───────────────────────────────────────────────────────────────

/**
 * R3F Canvas banner — lazy-loaded in App.tsx via React.lazy so Three.js
 * is never in the initial JS bundle.
 *
 * `pointer-events: none` on the canvas means it never intercepts clicks
 * on the CompetitionSelector or Countdown components below it.
 *
 * `aria-hidden="true"` — purely decorative, no interactive content.
 */
export default function HeroScene() {
  return (
    <div className="hero-scene-banner" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ pointerEvents: 'none' }}
      >
        {/* Ambient fill — low to keep the scene dramatic */}
        <ambientLight intensity={0.35} />

        {/* Key light — warm white upper-right (stadium floodlight) */}
        <directionalLight
          position={[4, 6, 3]}
          intensity={1.5}
          color="#fff8ee"
        />

        {/* Accent rim light — electric green from the left */}
        <pointLight
          position={[-4, 2, 2]}
          intensity={1.3}
          color="#00e676"
          distance={12}
        />

        {/* Subtle underlight to soften the shadow side */}
        <pointLight
          position={[0, -3, 2]}
          intensity={0.25}
          color="#1a3a6e"
          distance={8}
        />

        <SoccerBall />
      </Canvas>
    </div>
  );
}

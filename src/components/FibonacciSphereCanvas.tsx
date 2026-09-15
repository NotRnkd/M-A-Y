import React, { useEffect, useRef, useState } from 'react';

interface FibonacciSphereProps {
  accentColor?: string; // hex or rgb
  glowColor?: string;
  isVoiceActive?: boolean;
  voiceLevel?: number; // 0 to 1
  onSphereClick?: () => void;
  subtleDeformScale?: number;
}

interface Particle3D {
  baseX: number;
  baseY: number;
  baseZ: number;
  theta: number;
  phi: number;
  seed: number;
  pulseSpeed: number;
}

export const FibonacciSphereCanvas: React.FC<FibonacciSphereProps> = ({
  accentColor = '#ff7a00',
  glowColor = '#ffb68b',
  isVoiceActive = false,
  voiceLevel = 0,
  onSphereClick,
  subtleDeformScale = 1.0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Rotation and interaction state
  const stateRef = useRef({
    rotX: 0.25,
    rotY: 0.4,
    rotZ: 0,
    targetRotX: 0.25,
    targetRotY: 0.4,
    velX: 0.0015,
    velY: 0.0035,
    isDragging: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    mouseParallaxX: 0,
    mouseParallaxY: 0,
    time: 0,
  });

  const [particles, setParticles] = useState<Particle3D[]>([]);

  // Initialize Fibonacci distribution with golden angle
  useEffect(() => {
    const NUM_PARTICLES = 1600;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~2.39996 rad (137.508°)
    const pts: Particle3D[] = [];

    for (let i = 0; i < NUM_PARTICLES; i++) {
      // y goes smoothly from 1 to -1 (uniform pole distribution)
      const y = 1 - (2 * (i + 0.5)) / NUM_PARTICLES;
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = i * goldenAngle;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;
      const phi = Math.asin(y);

      pts.push({
        baseX: x,
        baseY: y,
        baseZ: z,
        theta,
        phi,
        seed: (i * 137.5) % 100,
        pulseSpeed: 0.5 + ((i % 17) / 17) * 0.8,
      });
    }

    setParticles(pts);
  }, []);

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || particles.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const state = stateRef.current;
      state.time += 0.016;

      // Update rotation with auto spin and inertia
      if (!state.isDragging) {
        state.rotY += state.velY;
        state.rotX += state.velX * 0.5;

        // Smoothly blend in mouse parallax
        state.rotX += (state.mouseParallaxY * 0.15 - state.rotX * 0.05) * 0.03;
        state.rotY += (state.mouseParallaxX * 0.15 - state.rotY * 0.05) * 0.03;
      }

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Base radius responsive to viewport
      const minDim = Math.min(width, height);
      const baseRadius = Math.max(80, minDim * 0.28);
      const cameraDist = baseRadius * 2.8;

      ctx.clearRect(0, 0, width, height);

      // 1. Ambient Background Bloom Halo
      const bloomRadius = baseRadius * 1.6;
      const ambientGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius * 0.2,
        centerX,
        centerY,
        bloomRadius
      );

      // Parse accent color into RGB for alpha blending
      const hexToRgb = (hex: string) => {
        const clean = hex.replace('#', '');
        const bigint = parseInt(clean, 16);
        if (clean.length === 3) {
          const r = ((bigint >> 8) & 15) * 17;
          const g = ((bigint >> 4) & 15) * 17;
          const b = (bigint & 15) * 17;
          return { r, g, b };
        }
        return {
          r: (bigint >> 16) & 255,
          g: (bigint >> 8) & 255,
          b: bigint & 255,
        };
      };

      const rgb = hexToRgb(accentColor);
      const rgbGlow = hexToRgb(glowColor);

      const breathing = Math.sin(state.time * 1.5) * 0.05 + 1;
      const voiceAmp = isVoiceActive ? Math.max(voiceLevel, 0.25) * 0.35 : 0;

      ambientGlow.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.28 + voiceAmp * 0.3})`);
      ambientGlow.addColorStop(0.35, `rgba(${rgbGlow.r}, ${rgbGlow.g}, ${rgbGlow.b}, ${0.12 + voiceAmp * 0.15})`);
      ambientGlow.addColorStop(0.7, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.04)`);
      ambientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.save();
      ctx.fillStyle = ambientGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, bloomRadius * breathing, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Rotation matrix values
      const cosX = Math.cos(state.rotX);
      const sinX = Math.sin(state.rotX);
      const cosY = Math.cos(state.rotY);
      const sinY = Math.sin(state.rotY);

      // Pre-allocate or map projected particles
      const projected = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 2. Subtle Spherical Harmonic Deformation
        const t = state.time;
        // Traveling harmonic wave on sphere
        const wave1 = Math.sin(4 * p.theta + t * 1.8) * Math.cos(3 * p.phi + t * 1.2) * 0.055;
        const wave2 = Math.sin(6 * p.theta - t * 2.3 + p.seed) * 0.035;
        const wave3 = Math.cos(2 * p.phi + t * 0.8) * 0.03;
        const voiceRipple = voiceAmp > 0 ? Math.sin(8 * (p.baseY + 1) + t * 9) * voiceAmp * 0.15 : 0;

        const deformation = (1 + (wave1 + wave2 + wave3 + voiceRipple) * subtleDeformScale) * breathing;
        const r = baseRadius * deformation;

        const x0 = p.baseX * r;
        const y0 = p.baseY * r;
        const z0 = p.baseZ * r;

        // Rotate around Y axis
        const x1 = x0 * cosY + z0 * sinY;
        const z1 = -x0 * sinY + z0 * cosY;

        // Rotate around X axis
        const y2 = y0 * cosX - z1 * sinX;
        const z2 = y0 * sinX + z1 * cosX;

        // Depth perspective projection
        // z2 ranges approximately from -baseRadius to +baseRadius
        const distance = cameraDist + z2;
        if (distance <= 10) continue;

        const fov = cameraDist / distance;
        const projX = centerX + x1 * fov;
        const projY = centerY + y2 * fov;

        // Normalized depth (0 = furthest back, 1 = closest front)
        const normZ = Math.min(1, Math.max(0, (z2 + baseRadius * 1.1) / (baseRadius * 2.2)));

        projected.push({
          x: projX,
          y: projY,
          z: z2,
          normZ,
          fov,
          seed: p.seed,
        });
      }

      // 3. Depth Sorting for Proper Occlusion & Layering
      projected.sort((a, b) => a.z - b.z);

      // 4. Render Depth-Aware Particles with Multi-tier Bloom
      ctx.save();
      // Use lighter composition for the glow points
      ctx.globalCompositeOperation = 'screen';

      for (let i = 0; i < projected.length; i++) {
        const pt = projected[i];
        const normZ = pt.normZ; // 0 to 1

        // Depth-dependent size and opacity
        const particleRadius = (1.1 + normZ * 2.1) * pt.fov;
        // Foreground particles are much brighter and sharper
        const alpha = 0.2 + Math.pow(normZ, 1.8) * 0.8;

        // Foreground bloom halo for points facing camera
        if (normZ > 0.65) {
          const haloRadius = particleRadius * (2.8 + (normZ - 0.65) * 4);
          const haloGrad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, haloRadius);
          haloGrad.addColorStop(0, `rgba(${rgbGlow.r}, ${rgbGlow.g}, ${rgbGlow.b}, ${alpha * 0.45})`);
          haloGrad.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

          ctx.fillStyle = haloGrad;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, haloRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Particle Core Dot
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, Math.max(0.8, particleRadius), 0, Math.PI * 2);

        if (normZ > 0.85) {
          // Intense hot core for nearest particles
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
        } else if (normZ > 0.5) {
          ctx.fillStyle = `rgba(${rgbGlow.r}, ${rgbGlow.g}, ${rgbGlow.b}, ${alpha})`;
        } else {
          // Dimmer back-facing particles
          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * 0.6})`;
        }
        ctx.fill();
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [particles, accentColor, glowColor, isVoiceActive, voiceLevel, subtleDeformScale]);

  // Handle Canvas Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Mouse & Touch Drag Controls
  const handlePointerDown = (e: React.PointerEvent) => {
    stateRef.current.isDragging = true;
    stateRef.current.startX = e.clientX;
    stateRef.current.startY = e.clientY;
    stateRef.current.lastX = e.clientX;
    stateRef.current.lastY = e.clientY;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const state = stateRef.current;
    const container = containerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      const normX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const normY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      state.mouseParallaxX = normX;
      state.mouseParallaxY = normY;
    }

    if (!state.isDragging) return;

    const deltaX = e.clientX - state.lastX;
    const deltaY = e.clientY - state.lastY;

    state.rotY += deltaX * 0.008;
    state.rotX += deltaY * 0.008;

    // Track velocity for smooth release
    state.velY = deltaX * 0.002;
    state.velX = deltaY * 0.002;

    state.lastX = e.clientX;
    state.lastY = e.clientY;
  };

  const handlePointerUp = () => {
    stateRef.current.isDragging = false;
  };

  return (
    <div
      ref={containerRef}
      id="fibonacci-sphere-container"
      className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none overflow-hidden"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={onSphereClick}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-none"
      />
    </div>
  );
};

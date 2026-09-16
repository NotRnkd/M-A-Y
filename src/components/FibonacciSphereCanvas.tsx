import React, { useEffect, useRef } from 'react';

interface FibonacciSphereProps {
  accentColor?: string; // hex
  glowColor?: string;
  isVoiceActive?: boolean;
  voiceLevel?: number;
  onSphereClick?: () => void;
  subtleDeformScale?: number;
  showTerrain?: boolean;
}

interface Particle3D {
  baseX: number;
  baseY: number;
  baseZ: number;
  theta: number;
  phi: number;
  seed: number;
}

export const FibonacciSphereCanvas: React.FC<FibonacciSphereProps> = ({
  accentColor = '#ff7a00',
  glowColor = '#ffb68b',
  isVoiceActive = false,
  voiceLevel = 0,
  onSphereClick,
  subtleDeformScale = 1.0,
  showTerrain = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Rotation and interaction state
  const stateRef = useRef({
    rotX: 0.22,
    rotY: 0.35,
    velX: 0.0008,
    velY: 0.0028,
    isDragging: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    mouseParallaxX: 0,
    mouseParallaxY: 0,
    time: 0,
    currentVoiceAmp: 0,
  });

  const particlesRef = useRef<Particle3D[]>([]);

  // Initialize Fibonacci distribution with golden angle
  useEffect(() => {
    const NUM_PARTICLES = 1850;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~2.39996 rad (137.508°)
    const pts: Particle3D[] = [];

    for (let i = 0; i < NUM_PARTICLES; i++) {
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
      });
    }

    particlesRef.current = pts;
  }, []);

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

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

    const render = () => {
      const state = stateRef.current;
      state.time += 0.016;

      // Update rotation
      if (!state.isDragging) {
        state.rotY += state.velY;
        state.rotX += state.velX;

        // Smooth parallax towards mouse
        state.rotX += (state.mouseParallaxY * 0.12 - state.rotX * 0.04) * 0.025;
        state.rotY += (state.mouseParallaxX * 0.12 - state.rotY * 0.04) * 0.025;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Logical CSS dimensions
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      // EXACT CENTER: Optical and geometric center of the staging viewport
      const centerX = width / 2;
      const centerY = height * 0.46;

      ctx.clearRect(0, 0, width, height);

      const rgb = hexToRgb(accentColor);
      const rgbGlow = hexToRgb(glowColor);

      // ==========================================
      // 1. TOPOGRAPHICAL CONTOUR TERRAIN (Floor Mesh)
      // ==========================================
      if (showTerrain) {
        ctx.save();
        const terrainY = height * 0.82;
        const terrainWidth = width * 1.05;
        const numRings = 14;
        const tTime = state.time * 0.4;

        for (let r = 0; r < numRings; r++) {
          const ringRadX = (r + 1) * (terrainWidth / (numRings * 2));
          const ringRadY = ringRadX * 0.28;
          const alpha = Math.max(0, 0.22 - (r / numRings) * 0.18);

          ctx.beginPath();
          ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
          ctx.lineWidth = 1;

          const steps = 80;
          for (let s = 0; s <= steps; s++) {
            const angle = (s / steps) * Math.PI * 2;
            const wave = Math.sin(angle * 4 + tTime + r * 0.5) * 6 * ((r + 1) / numRings);
            // Symmetrically aligned with the orb at centerX
            const px = centerX + Math.cos(angle) * (ringRadX + wave);
            const py = terrainY + Math.sin(angle) * (ringRadY + wave * 0.3) + (r * 1.5);

            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
        ctx.restore();
      }

      // ==========================================
      // 2. FIBONACCI 3D SPHERE PARTICLE CLOUD
      // ==========================================
      const minDim = Math.min(width, height);
      // Scaled proportionally to look exactly like the reference screenshot
      const baseRadius = Math.max(120, Math.min(minDim * 0.32, 230));
      const cameraDist = baseRadius * 2.7;

      // Ambient radial glow behind the sphere
      const breathing = Math.sin(state.time * 1.4) * 0.04 + 1;

      // Smooth attack & decay transitions so pulse starts gently and decays seamlessly without cutting
      const targetAmp = isVoiceActive ? Math.max(voiceLevel, 0.32) * 0.75 : 0;
      const smoothRate = targetAmp > state.currentVoiceAmp ? 0.075 : 0.038;
      state.currentVoiceAmp += (targetAmp - state.currentVoiceAmp) * smoothRate;
      if (state.currentVoiceAmp < 0.001) state.currentVoiceAmp = 0;
      const voiceAmp = state.currentVoiceAmp;

      const bloomRadius = baseRadius * (1.75 + voiceAmp * 0.35);

      const ambientGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius * 0.15,
        centerX,
        centerY,
        bloomRadius
      );
      ambientGlow.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.35 + voiceAmp * 0.45})`);
      ambientGlow.addColorStop(0.35, `rgba(${rgbGlow.r}, ${rgbGlow.g}, ${rgbGlow.b}, ${0.16 + voiceAmp * 0.28})`);
      ambientGlow.addColorStop(0.7, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.05 + voiceAmp * 0.1})`);
      ambientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.save();
      ctx.fillStyle = ambientGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, bloomRadius * breathing, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Rotation matrix
      const cosX = Math.cos(state.rotX);
      const sinX = Math.sin(state.rotX);
      const cosY = Math.cos(state.rotY);
      const sinY = Math.sin(state.rotY);

      const pts = particlesRef.current;
      const projected = [];

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const t = state.time;

        // Organic spherical deformation with speech pulsing waves
        const wave1 = Math.sin(5 * p.theta + t * 1.6) * Math.cos(4 * p.phi + t * 1.1) * 0.06;
        const wave2 = Math.sin(7 * p.theta - t * 2.1 + p.seed) * 0.038;
        const wave3 = Math.cos(3 * p.phi + t * 0.75) * 0.032;
        const voiceRipple = voiceAmp > 0 ? Math.sin(10 * (p.baseY + 1) + t * 14) * voiceAmp * 0.28 : 0;

        const deformation = (1 + (wave1 + wave2 + wave3 + voiceRipple) * subtleDeformScale) * (breathing + voiceAmp * 0.1);
        const r = baseRadius * deformation;

        const x0 = p.baseX * r;
        const y0 = p.baseY * r;
        const z0 = p.baseZ * r;

        // Rotate Y
        const x1 = x0 * cosY + z0 * sinY;
        const z1 = -x0 * sinY + z0 * cosY;

        // Rotate X
        const y2 = y0 * cosX - z1 * sinX;
        const z2 = y0 * sinX + z1 * cosX;

        // Camera perspective
        const distance = cameraDist + z2;
        if (distance <= 5) continue;

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
        });
      }

      // Sort by depth (back to front)
      projected.sort((a, b) => a.z - b.z);

      // Render depth-aware particles
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      for (let i = 0; i < projected.length; i++) {
        const pt = projected[i];
        const normZ = pt.normZ; // 0 to 1

        const particleRadius = (1.1 + normZ * 2.2) * pt.fov;
        const alpha = 0.22 + Math.pow(normZ, 1.7) * 0.78;

        // Radiant halo for foreground particles
        if (normZ > 0.6) {
          const haloRadius = particleRadius * (2.8 + (normZ - 0.6) * 4.5);
          const haloGrad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, haloRadius);
          haloGrad.addColorStop(0, `rgba(${rgbGlow.r}, ${rgbGlow.g}, ${rgbGlow.b}, ${alpha * 0.45})`);
          haloGrad.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

          ctx.fillStyle = haloGrad;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, haloRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Particle Core
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, Math.max(0.7, particleRadius), 0, Math.PI * 2);

        if (normZ > 0.88) {
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
        } else if (normZ > 0.5) {
          ctx.fillStyle = `rgba(${rgbGlow.r}, ${rgbGlow.g}, ${rgbGlow.b}, ${alpha})`;
        } else {
          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * 0.65})`;
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
  }, [accentColor, glowColor, isVoiceActive, voiceLevel, subtleDeformScale, showTerrain]);

  // Handle Canvas Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
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

  // Pointer interaction
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

    state.rotY += deltaX * 0.007;
    state.rotX += deltaY * 0.007;

    state.velY = deltaX * 0.0018;
    state.velX = deltaY * 0.0018;

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
      className="absolute inset-0 w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none overflow-hidden"
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

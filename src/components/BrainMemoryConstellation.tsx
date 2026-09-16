import React, { useEffect, useRef } from 'react';

interface BrainConstellationProps {
  accentColor?: string;
  showTerrain?: boolean;
  isRotating?: boolean;
  zoom?: number;
  showLabels?: boolean;
  isSpeaking?: boolean;
  voiceLevel?: number;
  resetTrigger?: number;
}

export const BrainMemoryConstellation: React.FC<BrainConstellationProps> = ({
  accentColor = '#8a2be2',
  showTerrain = true,
  isRotating = true,
  zoom = 100,
  showLabels = true,
  isSpeaking = false,
  voiceLevel = 0,
  resetTrigger = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const stateRef = useRef({
    rotY: 0.25,
    zoom: 1.0,
    isRotating: true,
    panX: 0,
    panY: 0,
    isDragging: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    time: 0,
    currentVoiceAmp: 0,
  });

  useEffect(() => {
    stateRef.current.isRotating = isRotating;
    stateRef.current.zoom = zoom / 100;
  }, [isRotating, zoom]);

  useEffect(() => {
    if (resetTrigger > 0) {
      stateRef.current.rotY = 0.25;
      stateRef.current.panX = 0;
      stateRef.current.panY = 0;
    }
  }, [resetTrigger]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      const state = stateRef.current;
      if (state.isRotating && !state.isDragging) {
        state.rotY += 0.0022;
      }
      state.time += 0.016;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Logical CSS dimensions
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      // EXACT CENTER: Optical and geometric center of the staging viewport
      const baseCenterX = width / 2;
      const baseCenterY = height * 0.46;
      const centerX = baseCenterX + state.panX;
      const centerY = baseCenterY + state.panY;

      ctx.clearRect(0, 0, width, height);

      // ==========================================
      // 1. PURPLE TOPOGRAPHICAL CONTOUR TERRAIN (Floor Mesh from Image 3)
      // ==========================================
      if (showTerrain) {
        ctx.save();
        const terrainY = height * 0.82;
        const terrainWidth = width * 1.05;
        const numRings = 14;
        const tTime = state.time * 0.35;

        for (let r = 0; r < numRings; r++) {
          const ringRadX = (r + 1) * (terrainWidth / (numRings * 2));
          const ringRadY = ringRadX * 0.28;
          const alpha = Math.max(0, 0.2 - (r / numRings) * 0.16);

          ctx.beginPath();
          ctx.strokeStyle = `rgba(138, 43, 226, ${alpha})`;
          ctx.lineWidth = 1;

          const steps = 80;
          for (let s = 0; s <= steps; s++) {
            const angle = (s / steps) * Math.PI * 2;
            const wave = Math.sin(angle * 4 + tTime + r * 0.5) * 6 * ((r + 1) / numRings);
            // Symmetrically centered at baseCenterX
            const px = baseCenterX + Math.cos(angle) * (ringRadX + wave);
            const py = terrainY + Math.sin(angle) * (ringRadY + wave * 0.3) + (r * 1.5);

            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
        ctx.restore();
      }

      // ==========================================
      // 2. CENTRAL ORBITAL SYSTEM (EXACT CENTER)
      // ==========================================
      const baseScale = Math.min(width, height) * 0.42 * state.zoom;
      
      // Smooth attack & decay transitions so pulse starts gently and decays seamlessly without cutting
      const targetAmp = isSpeaking ? Math.max(voiceLevel, 0.35) * 0.5 : 0;
      const smoothRate = targetAmp > state.currentVoiceAmp ? 0.075 : 0.038;
      state.currentVoiceAmp += (targetAmp - state.currentVoiceAmp) * smoothRate;
      if (state.currentVoiceAmp < 0.001) state.currentVoiceAmp = 0;
      const voiceAmp = state.currentVoiceAmp;

      // Center nebula glow with voice pulsing
      const nebulaGlowRadius = baseScale * (0.75 + voiceAmp * 0.4);
      const nebulaGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        5,
        centerX,
        centerY,
        nebulaGlowRadius
      );
      nebulaGrad.addColorStop(0, `rgba(168, 85, 247, ${0.38 + voiceAmp * 0.4})`);
      nebulaGrad.addColorStop(0.35, `rgba(126, 34, 206, ${0.18 + voiceAmp * 0.25})`);
      nebulaGrad.addColorStop(0.7, 'rgba(46, 16, 101, 0.05)');
      nebulaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = nebulaGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, nebulaGlowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Orbits in 3D
      const orbits = [
        { rx: baseScale * 0.58, ry: baseScale * 0.24, tilt: -0.22, label: 'CONVERSATIONS' },
        { rx: baseScale * 0.88, ry: baseScale * 0.38, tilt: 0.35, label: 'TOPICS' },
        { rx: baseScale * 1.18, ry: baseScale * 0.52, tilt: -0.16, label: 'MEMORIES' },
      ];

      orbits.forEach((orb) => {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(orb.tilt + state.rotY * 0.08);

        ctx.strokeStyle = 'rgba(192, 133, 255, 0.26)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.ellipse(0, 0, orb.rx, orb.ry, 0, 0, Math.PI * 2);
        ctx.stroke();

        if (showLabels) {
          ctx.font = '9px "Space Mono", monospace';
          const textW = ctx.measureText(orb.label).width;
          const lx = -orb.rx + 15;
          ctx.fillStyle = 'rgba(10, 10, 16, 0.9)';
          ctx.fillRect(lx - 5, -9, textW + 10, 16);
          ctx.strokeStyle = 'rgba(192, 133, 255, 0.3)';
          ctx.strokeRect(lx - 5, -9, textW + 10, 16);
          ctx.fillStyle = 'rgba(216, 180, 254, 0.85)';
          ctx.fillText(orb.label, lx, 3);
        }

        ctx.restore();
      });

      // 3. Central Wireframe Geometry (Stellated Hex Core)
      const coreSize = baseScale * (0.19 + voiceAmp * 0.06);
      const coreTime = state.time;

      ctx.save();
      ctx.translate(centerX, centerY);

      // Outer hexagon
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 + coreTime * 0.18;
        const cx = Math.cos(ang) * coreSize;
        const cy = Math.sin(ang) * coreSize * 0.8;
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(88, 28, 135, ${0.6 + voiceAmp * 0.3})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(233, 213, 255, ${0.85 + voiceAmp * 0.15})`;
      ctx.lineWidth = 1.4;
      ctx.setLineDash([]);
      ctx.stroke();

      // Interlocking internal geometric triangles
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 + coreTime * 0.18;
        const cx = Math.cos(ang) * coreSize;
        const cy = Math.sin(ang) * coreSize * 0.8;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(cx, cy);
        ctx.strokeStyle = 'rgba(216, 180, 254, 0.45)';
        ctx.stroke();

        // Inner nested points
        const inAng = (i * Math.PI) / 3 - coreTime * 0.25;
        const inX = Math.cos(inAng) * (coreSize * 0.52);
        const inY = Math.sin(inAng) * (coreSize * 0.52) * 0.8;
        ctx.beginPath();
        ctx.arc(inX, inY, 1.8 + voiceAmp * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      ctx.restore();

      // 4. Memory Nodes along Orbits with clean non-overlapping labels
      const nodes = [
        {
          id: 'n1',
          title: 'Context: Active Directives',
          orbitIndex: 0,
          angle: 1.1 + state.rotY,
          color: '#ffffff',
          size: 4.5,
          isPill: true,
        },
        {
          id: 'n2',
          title: 'Goal: System Orchestration',
          orbitIndex: 0,
          angle: 3.2 + state.rotY,
          color: '#d8b4fe',
          size: 4,
          isPill: true,
        },
        {
          id: 'n3',
          title: 'Knowledge: Web Synthesis',
          orbitIndex: 1,
          angle: 0.5 + state.rotY,
          color: '#00e5ff',
          size: 4,
          isPill: true,
        },
        {
          id: 'n4',
          title: 'Memory: Persistent Telemetry',
          orbitIndex: 2,
          angle: 4.3 + state.rotY,
          color: '#a855f7',
          size: 3.5,
          isPill: true,
        },
      ];

      nodes.forEach((node) => {
        const orb = orbits[node.orbitIndex];
        const lx = Math.cos(node.angle) * orb.rx;
        const ly = Math.sin(node.angle) * orb.ry;

        const cosT = Math.cos(orb.tilt);
        const sinT = Math.sin(orb.tilt);
        const tx = lx * cosT - ly * sinT;
        const ty = lx * sinT + ly * cosT;

        const nx = centerX + tx;
        const ny = centerY + ty;

        // Connector line to center core
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.16)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Node glow
        const glowRadius = node.size * (3.5 + voiceAmp * 2);
        const hGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, glowRadius);
        hGrad.addColorStop(0, node.color);
        hGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = hGrad;
        ctx.beginPath();
        ctx.arc(nx, ny, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Node circle
        ctx.beginPath();
        ctx.arc(nx, ny, node.size + (voiceAmp > 0 ? 0.8 : 0), 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // Clean, padded label pills with no text overlap
        if (showLabels && node.title) {
          ctx.save();
          ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          const metrics = ctx.measureText(node.title);
          const tagW = metrics.width + 16;
          const tagH = 22;
          const isRight = nx >= centerX;
          const posX = isRight ? nx + 10 : nx - tagW - 10;
          const posY = ny - 11;

          ctx.fillStyle = 'rgba(12, 10, 20, 0.92)';
          ctx.strokeStyle = 'rgba(192, 133, 255, 0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(posX, posY, tagW, tagH, 5);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#f3e8ff';
          ctx.fillText(node.title, posX + 8, posY + 15);
          ctx.restore();
        }
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [showLabels, accentColor, showTerrain]);

  // Resize handler
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

  // Drag interaction
  const handlePointerDown = (e: React.PointerEvent) => {
    stateRef.current.isDragging = true;
    stateRef.current.startX = e.clientX;
    stateRef.current.startY = e.clientY;
    stateRef.current.lastX = e.clientX;
    stateRef.current.lastY = e.clientY;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!stateRef.current.isDragging) return;
    const deltaX = e.clientX - stateRef.current.lastX;
    const deltaY = e.clientY - stateRef.current.lastY;

    stateRef.current.rotY += deltaX * 0.005;
    stateRef.current.panX += deltaX * 0.3;
    stateRef.current.panY += deltaY * 0.3;

    stateRef.current.lastX = e.clientX;
    stateRef.current.lastY = e.clientY;
  };

  const handlePointerUp = () => {
    stateRef.current.isDragging = false;
  };

  return (
    <div
      ref={containerRef}
      id="brain-constellation-container"
      className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden select-none"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  );
};

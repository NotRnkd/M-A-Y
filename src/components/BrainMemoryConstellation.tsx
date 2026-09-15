import React, { useEffect, useRef, useState } from 'react';
import { RotateCw, Move, ZoomIn, ZoomOut, RefreshCw, Activity, Tag } from 'lucide-react';

interface BrainConstellationProps {
  accentColor?: string;
  showTerrain?: boolean;
}

export const BrainMemoryConstellation: React.FC<BrainConstellationProps> = ({
  accentColor = '#8a2be2',
  showTerrain = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Interaction & View state
  const [zoom, setZoom] = useState(100);
  const [isRotating, setIsRotating] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

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
  });

  useEffect(() => {
    stateRef.current.isRotating = isRotating;
    stateRef.current.zoom = zoom / 100;
  }, [isRotating, zoom]);

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

      // Center nebula glow
      const nebulaGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        5,
        centerX,
        centerY,
        baseScale * 0.75
      );
      nebulaGrad.addColorStop(0, 'rgba(138, 43, 226, 0.35)');
      nebulaGrad.addColorStop(0.35, 'rgba(92, 28, 170, 0.15)');
      nebulaGrad.addColorStop(0.7, 'rgba(30, 10, 60, 0.04)');
      nebulaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = nebulaGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseScale * 0.75, 0, Math.PI * 2);
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
          ctx.font = '10px "Space Mono", monospace';
          ctx.fillStyle = 'rgba(192, 133, 255, 0.55)';
          ctx.fillText(orb.label, -orb.rx + 15, 0);
        }

        ctx.restore();
      });

      // 3. Central Wireframe Geometry (Stellated Hex Core)
      const coreSize = baseScale * 0.19;
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
      ctx.fillStyle = 'rgba(64, 16, 110, 0.6)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(216, 180, 254, 0.75)';
      ctx.lineWidth = 1.2;
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
        ctx.strokeStyle = 'rgba(216, 180, 254, 0.38)';
        ctx.stroke();

        // Inner nested points
        const inAng = (i * Math.PI) / 3 - coreTime * 0.25;
        const inX = Math.cos(inAng) * (coreSize * 0.52);
        const inY = Math.sin(inAng) * (coreSize * 0.52) * 0.8;
        ctx.beginPath();
        ctx.arc(inX, inY, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      ctx.restore();

      // 4. Memory Nodes along Orbits (matching Image 3)
      const nodes = [
        {
          id: 'n1',
          title: '**Context Summary:** User gre...',
          orbitIndex: 0,
          angle: 1.1 + state.rotY,
          color: '#ffffff',
          size: 4.5,
          isPill: true,
          side: 'left',
        },
        {
          id: 'n2',
          title: 'Goal the user is working towar...',
          orbitIndex: 0,
          angle: 2.8 + state.rotY,
          color: '#d8b4fe',
          size: 4,
          isPill: true,
          side: 'right',
        },
        {
          id: 'n3',
          title: 'TOPICS',
          orbitIndex: 1,
          angle: 0.2 + state.rotY,
          color: '#00e5ff',
          size: 4,
          isPill: false,
          side: 'right',
        },
        {
          id: 'n4',
          title: '',
          orbitIndex: 2,
          angle: 4.1 + state.rotY,
          color: '#a855f7',
          size: 3.5,
          isPill: false,
          side: 'none',
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
        const hGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, node.size * 3.5);
        hGrad.addColorStop(0, node.color);
        hGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = hGrad;
        ctx.beginPath();
        ctx.arc(nx, ny, node.size * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Node circle
        ctx.beginPath();
        ctx.arc(nx, ny, node.size, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // Pill labels matching Image 3
        if (showLabels && node.title) {
          ctx.save();
          if (node.isPill) {
            ctx.font = '11px "Geist", sans-serif';
            const metrics = ctx.measureText(node.title);
            const tagW = metrics.width + 18;
            const tagH = 24;
            const posX = node.side === 'left' ? nx - tagW - 8 : nx + 12;
            const posY = ny - 12;

            ctx.fillStyle = 'rgba(14, 12, 22, 0.92)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(posX, posY, tagW, tagH, 6);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.fillText(node.title, posX + 9, posY + 16);
          } else {
            ctx.font = 'bold 10px "Space Mono", monospace';
            ctx.fillStyle = node.color;
            ctx.fillText(node.title, nx + 8, ny + 4);
          }
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

      {/* Interactive Controls Toolbar (Matching Image 3) */}
      <div className="absolute bottom-24 sm:bottom-20 z-20 flex flex-col items-center gap-1.5 pointer-events-auto">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#12111c]/90 border border-white/10 backdrop-blur-md shadow-2xl">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full transition-colors ${
              isRotating ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <RotateCw size={12} className={isRotating ? 'animate-spin-slow' : ''} />
            <span>Rotate</span>
          </button>

          <div className="w-[1px] h-3.5 bg-white/10" />

          <button
            onClick={() => {
              stateRef.current.panX = 0;
              stateRef.current.panY = 0;
            }}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <Move size={12} />
            <span>Pan</span>
          </button>

          <div className="w-[1px] h-3.5 bg-white/10" />

          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.max(50, z - 15))}
              className="p-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded"
            >
              <ZoomOut size={12} />
            </button>
            <span className="text-[11px] font-mono text-zinc-300 w-11 text-center">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(180, z + 15))}
              className="p-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded"
            >
              <ZoomIn size={12} />
            </button>
          </div>

          <div className="w-[1px] h-3.5 bg-white/10" />

          <button
            onClick={() => {
              setZoom(100);
              stateRef.current.rotY = 0.25;
              stateRef.current.panX = 0;
              stateRef.current.panY = 0;
            }}
            className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw size={11} />
            <span className="hidden sm:inline">Reset view</span>
          </button>

          <div className="w-[1px] h-3.5 bg-white/10" />

          <button
            onClick={() => setIsRotating(!isRotating)}
            className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <Activity size={12} />
            <span>Motion</span>
          </button>

          <div className="w-[1px] h-3.5 bg-white/10" />

          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
              showLabels ? 'text-purple-300' : 'text-zinc-500'
            }`}
          >
            <Tag size={12} />
            <span className="hidden sm:inline">All labels</span>
          </button>
        </div>

        <p className="text-[11px] text-zinc-500 font-mono tracking-wide">
          Drag to orbit · Scroll to zoom · Click anything
        </p>
      </div>
    </div>
  );
};

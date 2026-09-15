import React, { useEffect, useRef, useState } from 'react';
import { RotateCw, Move, ZoomIn, ZoomOut, RefreshCw, Activity, Tag, Sparkles } from 'lucide-react';

interface BrainNode {
  id: string;
  title: string;
  category: 'TOPICS' | 'CONVERSATIONS' | 'MEMORIES';
  orbitIndex: number;
  angle: number;
  speed: number;
  color: string;
  size: number;
  highlight?: boolean;
  tag?: string;
  summary?: string;
}

interface BrainConstellationProps {
  onSelectNode?: (node: BrainNode) => void;
  accentColor?: string;
}

export const BrainMemoryConstellation: React.FC<BrainConstellationProps> = ({
  onSelectNode,
  accentColor = '#8a2be2',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Interaction & View state
  const [zoom, setZoom] = useState(100);
  const [isRotating, setIsRotating] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [activeNode, setActiveNode] = useState<BrainNode | null>(null);

  const stateRef = useRef({
    rotX: 0.55,
    rotY: 0.2,
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

  const nodesRef = useRef<BrainNode[]>([
    {
      id: 'node-1',
      title: 'Context Summary',
      category: 'CONVERSATIONS',
      orbitIndex: 0,
      angle: 0.8,
      speed: 0.003,
      color: '#ffffff',
      size: 4.5,
      highlight: true,
      tag: 'Goal the user is working toward...',
      summary: 'Building clean, minimalist websites focusing on aesthetics, typography, and responsive workflows.',
    },
    {
      id: 'node-2',
      title: 'TOPICS',
      category: 'TOPICS',
      orbitIndex: 1,
      angle: 2.1,
      speed: 0.002,
      color: '#00e5ff',
      size: 4,
      tag: 'Design System & Architecture',
      summary: 'Obsidian void styling, golden ratio distribution, interactive orbital geometry.',
    },
    {
      id: 'node-3',
      title: 'Active Session Telemetry',
      category: 'MEMORIES',
      orbitIndex: 2,
      angle: 4.2,
      speed: 0.0018,
      color: '#c085ff',
      size: 3.5,
      tag: 'User preferences',
      summary: 'High contrast dark mode, voice activation, low-latency audio response.',
    },
    {
      id: 'node-4',
      title: 'YouTube Workflow Request',
      category: 'CONVERSATIONS',
      orbitIndex: 1,
      angle: 5.4,
      speed: 0.0022,
      color: '#ffb68b',
      size: 3,
      tag: 'Tool permissions',
      summary: 'User requested launching video stream interface.',
    },
  ]);

  // Update refs when props/state change
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
        state.rotY += 0.0025;
        state.time += 0.016;
      } else {
        state.time += 0.016;
      }

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2 + state.panX;
      const centerY = height / 2 + state.panY;

      ctx.clearRect(0, 0, width, height);

      const baseScale = Math.min(width, height) * 0.38 * state.zoom;

      // 1. Draw central nebula glow
      const nebulaGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        10,
        centerX,
        centerY,
        baseScale * 0.9
      );
      nebulaGrad.addColorStop(0, 'rgba(138, 43, 226, 0.28)');
      nebulaGrad.addColorStop(0.4, 'rgba(92, 28, 170, 0.12)');
      nebulaGrad.addColorStop(0.8, 'rgba(30, 10, 60, 0.04)');
      nebulaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = nebulaGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseScale * 0.9, 0, Math.PI * 2);
      ctx.fill();

      // 2. Orbital Ellipses in 3D
      const orbits = [
        { rx: baseScale * 0.55, ry: baseScale * 0.26, tilt: -0.25, label: 'CONVERSATIONS' },
        { rx: baseScale * 0.85, ry: baseScale * 0.40, tilt: 0.38, label: 'TOPICS' },
        { rx: baseScale * 1.15, ry: baseScale * 0.52, tilt: -0.15, label: 'MEMORIES' },
      ];

      orbits.forEach((orb) => {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(orb.tilt + state.rotY * 0.1);

        // Dashed elliptical track
        ctx.strokeStyle = 'rgba(192, 133, 255, 0.22)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.ellipse(0, 0, orb.rx, orb.ry, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Subtle category label on track
        if (showLabels) {
          ctx.font = '10px "Space Mono", monospace';
          ctx.fillStyle = 'rgba(192, 133, 255, 0.45)';
          ctx.letterSpacing = '2px';
          ctx.fillText(orb.label, -orb.rx + 20, 0);
        }

        ctx.restore();
      });

      // 3. Central Wireframe Geometry (Hexagonal nested core)
      const coreSize = baseScale * 0.22;
      const coreTime = state.time;

      ctx.save();
      ctx.translate(centerX, centerY);

      // Core polygon backdrop
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 + coreTime * 0.2;
        const cx = Math.cos(ang) * coreSize;
        const cy = Math.sin(ang) * coreSize * 0.75;
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(74, 18, 128, 0.45)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(216, 180, 254, 0.6)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([]);
      ctx.stroke();

      // Inner wireframe lines connecting vertices to center and diagonals
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 + coreTime * 0.2;
        const cx = Math.cos(ang) * coreSize;
        const cy = Math.sin(ang) * coreSize * 0.75;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(cx, cy);
        ctx.strokeStyle = 'rgba(216, 180, 254, 0.35)';
        ctx.stroke();

        // Inner nested ring
        const inAng = (i * Math.PI) / 3 - coreTime * 0.3;
        const inX = Math.cos(inAng) * (coreSize * 0.5);
        const inY = Math.sin(inAng) * (coreSize * 0.5) * 0.75;
        ctx.beginPath();
        ctx.arc(inX, inY, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      ctx.restore();

      // 4. Memory Nodes along Orbits
      const projectedNodes: { node: BrainNode; x: number; y: number; z: number }[] = [];

      nodesRef.current.forEach((node) => {
        if (state.isRotating && !state.isDragging) {
          node.angle += node.speed;
        }

        const orb = orbits[node.orbitIndex % orbits.length];
        const localAngle = node.angle + state.rotY;

        // Ellipse coordinates
        const lx = Math.cos(localAngle) * orb.rx;
        const ly = Math.sin(localAngle) * orb.ry;

        // Apply orbit tilt
        const cosT = Math.cos(orb.tilt);
        const sinT = Math.sin(orb.tilt);
        const tx = lx * cosT - ly * sinT;
        const ty = lx * sinT + ly * cosT;

        const nx = centerX + tx;
        const ny = centerY + ty;
        const nz = Math.sin(localAngle); // pseudo-depth

        projectedNodes.push({ node, x: nx, y: ny, z: nz });
      });

      // Sort nodes by depth
      projectedNodes.sort((a, b) => a.z - b.z);

      // Render connectors and nodes
      projectedNodes.forEach(({ node, x, y }) => {
        // Connector beam to center core
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Node halo
        const haloGrad = ctx.createRadialGradient(x, y, 0, x, y, node.size * 3.5);
        haloGrad.addColorStop(0, node.color);
        haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(x, y, node.size * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Node dot
        ctx.beginPath();
        ctx.arc(x, y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // White nucleus
        ctx.beginPath();
        ctx.arc(x, y, node.size * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Labels / Callouts (Screenshot 3 style)
        if (showLabels) {
          ctx.save();
          if (node.highlight) {
            // Pill tag like: **Context Summary**
            ctx.font = 'bold 12px "Geist", sans-serif';
            const titleText = `•• ${node.title}`;
            const metrics = ctx.measureText(titleText);
            const tagW = metrics.width + 16;
            const tagH = 24;

            ctx.fillStyle = 'rgba(18, 16, 28, 0.88)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(x + 12, y - 12, tagW, tagH, 6);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.fillText(titleText, x + 20, y + 4);

            // Sub-pill: "Goal the user is working toward..."
            if (node.tag) {
              ctx.font = '11px "Geist", sans-serif';
              const subText = node.tag;
              const subMetrics = ctx.measureText(subText);
              const subW = subMetrics.width + 16;

              ctx.fillStyle = 'rgba(10, 8, 18, 0.95)';
              ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
              ctx.beginPath();
              ctx.roundRect(x + 50, y + 16, subW, 22, 6);
              ctx.fill();
              ctx.stroke();

              ctx.fillStyle = '#d8b4fe';
              ctx.fillText(subText, x + 58, y + 31);
            }
          } else {
            // Regular node label
            ctx.font = '11px "Space Mono", monospace';
            ctx.fillStyle = node.color;
            ctx.fillText(node.title, x + 10, y + 4);
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
  }, [showLabels, accentColor]);

  // Resize handler
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
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
    if (!stateRef.current.isDragging) return;
    const deltaX = e.clientX - stateRef.current.lastX;
    const deltaY = e.clientY - stateRef.current.lastY;

    stateRef.current.rotY += deltaX * 0.005;
    stateRef.current.panX += deltaX * 0.2;
    stateRef.current.panY += deltaY * 0.2;

    stateRef.current.lastX = e.clientX;
    stateRef.current.lastY = e.clientY;
  };

  const handlePointerUp = () => {
    stateRef.current.isDragging = false;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden select-none"
    >
      <canvas
        ref={canvasRef}
        id="brain-constellation-canvas"
        className="w-full h-full block cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      {/* Interactive Controls Toolbar (Matching Screenshot 3) */}
      <div className="absolute bottom-16 sm:bottom-12 z-20 flex flex-col items-center gap-2 pointer-events-auto">
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
              stateRef.current.rotY = 0.2;
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

      {/* Selected Node Details Popover */}
      {activeNode && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 max-w-sm w-full p-4 rounded-xl bg-[#141224]/95 border border-purple-500/30 backdrop-blur-xl shadow-2xl z-30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono tracking-widest text-purple-400 uppercase">
              {activeNode.category}
            </span>
            <button
              onClick={() => setActiveNode(null)}
              className="text-zinc-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>
          <h4 className="text-sm font-semibold text-white mb-1">{activeNode.title}</h4>
          <p className="text-xs text-zinc-300 mb-2">{activeNode.summary}</p>
          {activeNode.tag && (
            <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {activeNode.tag}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

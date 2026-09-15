import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  User, 
  Sparkles, 
  Sliders, 
  Monitor, 
  Share2, 
  CreditCard, 
  TrendingUp,
  Check,
  RotateCcw
} from 'lucide-react';
import { PersonaType, SettingsTab, IdentitySubTab } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: PersonaType;
  accentColor: string;
  onColorChange: (newColor: string, newGlowColor: string) => void;
  systemPrompt: string;
  onSystemPromptChange: (prompt: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  persona,
  accentColor,
  onColorChange,
  systemPrompt,
  onSystemPromptChange,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('persona');
  const [activeSubTab, setActiveSubTab] = useState<IdentitySubTab>('IDENTITY');
  const [colorTarget, setColorTarget] = useState<'PERSONA' | 'WORKERS'>('PERSONA');
  const [autoSaveStatus, setAutoSaveStatus] = useState('Auto-saves');

  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [sliderPercent, setSliderPercent] = useState(6); // orange starts around 5-8%
  const isDraggingRef = useRef(false);

  // Convert percentage on the rainbow gradient to Hex color
  const percentToColor = (pct: number) => {
    // 0 = red/orange, 15 = yellow, 35 = green, 50 = cyan, 68 = blue, 85 = magenta, 100 = pink
    const hue = Math.round((pct / 100) * 360);
    return {
      hex: `hsl(${hue}, 100%, 50%)`,
      glowHex: `hsl(${hue}, 100%, 75%)`,
    };
  };

  const updateColorFromPointer = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const pct = Math.round((x / rect.width) * 100);
    setSliderPercent(pct);

    // Map percentage to actual color spectrum
    // 0% -> #ff4500, 6% -> #ff7a00, 16% -> #eab308, 35% -> #22c55e, 50% -> #06b6d4, 65% -> #3b82f6, 80% -> #a855f7, 95% -> #ec4899
    const hue = (pct * 3.6) % 360;
    // For a pleasing UI color:
    const s = 100;
    const l = 54;
    const mainHex = `hsl(${hue}, ${s}%, ${l}%)`;
    const glowHex = `hsl(${hue}, ${s}%, 75%)`;
    onColorChange(mainHex, glowHex);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    updateColorFromPointer(e.clientX);
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      updateColorFromPointer(e.clientX);
    };
    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onSystemPromptChange(e.target.value);
    setAutoSaveStatus('Saving...');
    setTimeout(() => {
      setAutoSaveStatus('Auto-saved');
      setTimeout(() => setAutoSaveStatus('Auto-saves'), 2000);
    }, 500);
  };

  const resetColor = () => {
    setSliderPercent(6);
    if (persona === 'MAY') {
      onColorChange('#ff7a00', '#ffb68b');
    } else {
      onColorChange('#8a2be2', '#d8b4fe');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      id="settings-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        id="settings-dialog"
        className="w-full max-w-5xl h-[88vh] max-h-[780px] bg-[#0c0c0f] border border-white/10 rounded-xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#e5e1e4]"
      >
        {/* ================= MODAL HEADER ================= */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0e0e13]">
          <div className="flex items-center gap-2.5">
            <span 
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: accentColor, boxShadow: `0 0 10px ${accentColor}` }}
            />
            <span className="font-mono text-xs font-bold tracking-[0.2em] text-white uppercase">
              SETTINGS
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white transition-colors"
            title="Close Settings"
          >
            <X size={18} />
          </button>
        </div>

        {/* ================= MODAL BODY ================= */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* LEFT SIDEBAR NAV */}
          <nav className="w-full md:w-60 border-r border-white/5 p-3 space-y-1 bg-[#09090c] overflow-y-auto shrink-0">
            <button
              onClick={() => setActiveTab('account')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs transition-colors ${
                activeTab === 'account'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <User size={15} />
              <span>Account</span>
            </button>

            <button
              onClick={() => setActiveTab('persona')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs transition-colors ${
                activeTab === 'persona'
                  ? 'bg-[#1a1924] text-white font-medium border border-white/10'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles size={15} style={{ color: accentColor }} />
              <span>{persona === 'MAY' ? 'May' : 'Zoey'}</span>
            </button>

            <button
              onClick={() => setActiveTab('preferences')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs transition-colors ${
                activeTab === 'preferences'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sliders size={15} />
              <span>Preferences</span>
            </button>

            <button
              onClick={() => setActiveTab('machine')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs transition-colors ${
                activeTab === 'machine'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Monitor size={15} />
              <span>Machine access</span>
            </button>

            <button
              onClick={() => setActiveTab('channels')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs transition-colors ${
                activeTab === 'channels'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Share2 size={15} />
              <span>Channels</span>
            </button>

            <button
              onClick={() => setActiveTab('plans')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs transition-colors ${
                activeTab === 'plans'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <CreditCard size={15} />
              <span>Plans & invoices</span>
            </button>

            <button
              onClick={() => setActiveTab('credits')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs transition-colors ${
                activeTab === 'credits'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <TrendingUp size={15} />
              <span>Credit usage</span>
            </button>
          </nav>

          {/* RIGHT CONTENT PANEL (Matching Screenshot 1) */}
          <main className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">
            {activeTab === 'persona' ? (
              <div className="space-y-6 max-w-3xl">
                {/* Title and Subtitle */}
                <div>
                  <h2 className="text-2xl font-semibold text-white tracking-tight">
                    {persona === 'MAY' ? 'May' : 'Zoey'}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    How she looks, what she knows, and how she sounds.
                  </p>
                </div>

                {/* Sub-tab segmented pill bar */}
                <div className="inline-flex p-1 rounded-lg bg-[#14141c] border border-white/5 gap-1">
                  {(['IDENTITY', 'SKILLS', 'VOICE', 'ABILITIES'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveSubTab(tab)}
                      className={`px-4 py-1.5 rounded-md text-xs font-mono font-bold tracking-wider transition-colors ${
                        activeSubTab === tab
                          ? 'bg-[#222130] text-white border border-white/10 shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* COLOUR SECTION */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono font-bold tracking-[0.15em] text-zinc-400 uppercase">
                        COLOUR
                      </span>

                      <div className="inline-flex p-0.5 rounded-md bg-[#161622] border border-white/5 text-xs font-mono">
                        <button
                          onClick={() => setColorTarget('PERSONA')}
                          className={`px-3 py-1 rounded text-xs transition-colors ${
                            colorTarget === 'PERSONA'
                              ? 'bg-[#262438] text-white font-bold'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {persona}
                        </button>
                        <button
                          onClick={() => setColorTarget('WORKERS')}
                          className={`px-3 py-1 rounded text-xs transition-colors ${
                            colorTarget === 'WORKERS'
                              ? 'bg-[#262438] text-white font-bold'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          WORKERS
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={resetColor}
                      className="px-3 py-1 rounded border border-white/10 text-xs font-mono text-zinc-400 hover:text-white hover:bg-white/5 transition-colors uppercase tracking-wider"
                    >
                      RESET
                    </button>
                  </div>

                  {/* SPECTRUM GRADIENT SLIDER (Interactive with custom thumb) */}
                  <div className="py-2">
                    <div
                      ref={sliderRef}
                      onPointerDown={handlePointerDown}
                      className="relative w-full h-4 sm:h-5 rounded-full cursor-pointer shadow-inner"
                      style={{
                        background:
                          'linear-gradient(to right, #ff4500, #ff8c00, #ffeb3b, #4caf50, #00e5ff, #2979ff, #d500f9, #ff1744)',
                      }}
                    >
                      {/* Draggable thumb matching Screenshot 1 */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 border-black/40 shadow-xl flex items-center justify-center transition-transform hover:scale-110 cursor-grab active:cursor-grabbing"
                        style={{ left: `${sliderPercent}%` }}
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: accentColor }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SYSTEM PROMPT SECTION */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold tracking-[0.15em] text-[#ff7a00] uppercase">
                      SYSTEM PROMPT
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {autoSaveStatus}
                    </span>
                  </div>

                  {/* Dark Monospace Code Editor */}
                  <div className="rounded-xl border border-white/10 bg-[#08080c] overflow-hidden flex flex-col shadow-inner">
                    <textarea
                      rows={9}
                      value={systemPrompt}
                      onChange={handleTextChange}
                      className="w-full p-4 bg-transparent font-mono text-xs text-zinc-300 placeholder-zinc-600 resize-none focus:outline-none leading-relaxed selection:bg-orange-500/30"
                      spellCheck={false}
                    />

                    <div className="px-4 py-2.5 border-t border-white/5 bg-[#0e0e14] flex items-center justify-between text-[11px] font-mono text-zinc-500">
                      <span>Identity Model: v4.8-neural</span>
                      <span>UTF-8 • {persona} Core</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Other Tabs Preview */
              <div className="space-y-4 max-w-xl">
                <h3 className="text-lg font-semibold text-white capitalize">
                  {activeTab}
                </h3>
                <p className="text-xs text-zinc-400">
                  Configure environment specifications, network telemetry, and system keys.
                </p>
                <div className="p-4 rounded-xl bg-[#14141c] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300">Telemetry Streaming</span>
                    <span className="text-emerald-400 font-mono">ACTIVE (60Hz)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300">Spatial Rendering Engine</span>
                    <span className="text-[#ff7a00] font-mono">Fibonacci 3D (1600 pts)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300">Voice Synthesis Node</span>
                    <span className="text-cyan-400 font-mono">Neural Stream v2</span>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

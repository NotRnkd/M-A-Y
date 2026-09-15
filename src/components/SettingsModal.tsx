import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  User, 
  Sparkles, 
  Sliders, 
  Volume2,
  Check,
  ShieldCheck,
  Key,
  Globe,
  Gauge
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
  persona = 'MAY',
  accentColor = '#ff7a00',
  onColorChange,
  systemPrompt,
  onSystemPromptChange,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('persona');
  const [activeSubTab, setActiveSubTab] = useState<IdentitySubTab>('IDENTITY');
  const [colorTarget, setColorTarget] = useState<'PERSONA' | 'WORKERS'>('PERSONA');
  const [autoSaveStatus, setAutoSaveStatus] = useState('Auto-saved');

  // Interactive Preferences state
  const [prefSoundEffects, setPrefSoundEffects] = useState(true);
  const [prefAutoFocus, setPrefAutoFocus] = useState(true);
  const [prefBloomIntensity, setPrefBloomIntensity] = useState('High');
  const [prefRotationSpeed, setPrefRotationSpeed] = useState(1.0);

  // Interactive Voice state
  const [selectedVoice, setSelectedVoice] = useState('May Warm (Default)');
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);

  // Interactive Skills state
  const [skills, setSkills] = useState([
    { id: 'web', name: 'Web Architecture & Front-end Synthesis', enabled: true },
    { id: 'strategy', name: 'Strategic Content & Planning', enabled: true },
    { id: 'telemetry', name: 'Autonomous Telemetry & Workers', enabled: true },
    { id: 'memory', name: 'Neural Memory Clustering & Retrieval', enabled: true },
    { id: 'voice', name: 'Low-latency Voice Dialogue', enabled: true },
  ]);

  const toggleSkill = (id: string) => {
    setSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [sliderPercent, setSliderPercent] = useState(5.5); // ~orange
  const isDraggingRef = useRef(false);

  const updateColorFromPointer = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const pct = (x / rect.width) * 100;
    setSliderPercent(pct);

    const hue = (pct * 3.6) % 360;
    const mainHex = `hsl(${hue}, 100%, 50%)`;
    const glowHex = `hsl(${hue}, 100%, 75%)`;
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

  const resetColor = () => {
    setSliderPercent(5.5);
    onColorChange('#ff7a00', '#ffb68b');
  };

  if (!isOpen) return null;

  return (
    <div 
      id="settings-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      <div 
        id="settings-dialog"
        className="w-full max-w-5xl h-[88vh] max-h-[760px] bg-[#0c0c0f] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#e5e1e4]"
      >
        {/* ================= MODAL HEADER ================= */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#09090c]">
          <div className="flex items-center gap-2.5">
            <span 
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
            />
            <span className="font-mono text-xs font-bold tracking-[0.22em] text-white uppercase">
              SETTINGS · MAY_OS
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
          {/* LEFT NAVIGATION TABS (Strictly: Account, May, Preferences) */}
          <nav className="w-full md:w-56 border-r border-white/5 p-3 space-y-1 bg-[#09090c] overflow-y-auto shrink-0">
            <button
              onClick={() => setActiveTab('account')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-colors ${
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
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-colors ${
                activeTab === 'persona'
                  ? 'bg-[#1a1924] text-white font-medium border border-white/10'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles size={15} style={{ color: accentColor }} />
              <span>May</span>
            </button>

            <button
              onClick={() => setActiveTab('preferences')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-colors ${
                activeTab === 'preferences'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sliders size={15} />
              <span>Preferences</span>
            </button>
          </nav>

          {/* RIGHT CONTENT PANEL */}
          <main className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">
            {activeTab === 'persona' && (
              <div className="space-y-6 max-w-3xl">
                {/* Title & Subtitle */}
                <div>
                  <h2 className="text-2xl font-semibold text-white tracking-tight">
                    May
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    How she looks, what she knows, and how she sounds.
                  </p>
                </div>

                {/* Subtabs: IDENTITY | SKILLS | VOICE | ABILITIES */}
                <div className="inline-flex p-1 rounded-xl bg-[#14141c] border border-white/5 gap-1">
                  {(['IDENTITY', 'SKILLS', 'VOICE', 'ABILITIES'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveSubTab(tab)}
                      className={`px-4 py-2 rounded-lg text-xs font-mono font-bold tracking-wider transition-colors ${
                        activeSubTab === tab
                          ? 'bg-[#222130] text-white border border-[#ff7a00]/50 shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {activeSubTab === 'IDENTITY' && (
                  <div className="space-y-6">
                    {/* COLOUR SECTION */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-mono font-bold tracking-[0.16em] text-zinc-400 uppercase">
                            COLOUR
                          </span>

                          <div className="inline-flex p-0.5 rounded-lg bg-[#161622] border border-white/5 text-xs font-mono">
                            <button
                              onClick={() => setColorTarget('PERSONA')}
                              className={`px-3.5 py-1 rounded-md text-xs transition-colors ${
                                colorTarget === 'PERSONA'
                                  ? 'bg-[#262438] text-[#ffb68b] border border-[#ff7a00]/40 font-bold'
                                  : 'text-zinc-400 hover:text-zinc-200'
                              }`}
                            >
                              MAY
                            </button>
                            <button
                              onClick={() => setColorTarget('WORKERS')}
                              className={`px-3.5 py-1 rounded-md text-xs transition-colors ${
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

                      {/* Color Spectrum Slider with Left Pip */}
                      <div className="flex items-center gap-3 py-2">
                        <div className="w-7 h-7 rounded-full bg-[#1e1712] border border-white/10 flex items-center justify-center shrink-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: accentColor }}
                          />
                        </div>

                        <div
                          ref={sliderRef}
                          onPointerDown={handlePointerDown}
                          className="relative flex-1 h-3.5 sm:h-4 rounded-full cursor-pointer shadow-inner"
                          style={{
                            background:
                              'linear-gradient(to right, #ff4500, #ff8c00, #ffeb3b, #4caf50, #00e5ff, #2979ff, #d500f9, #ff1744)',
                          }}
                        >
                          <div
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-6 rounded-full bg-white shadow-xl border border-black/30 hover:scale-110 transition-transform cursor-grab active:cursor-grabbing"
                            style={{ left: `${sliderPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* SYSTEM PROMPT */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold tracking-[0.16em] text-[#ff7a00] uppercase">
                          SYSTEM PROMPT
                        </span>
                        <span className="text-[11px] font-mono text-zinc-500">
                          {autoSaveStatus}
                        </span>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-[#08080c] overflow-hidden flex flex-col shadow-inner">
                        <textarea
                          rows={9}
                          value={systemPrompt}
                          onChange={(e) => onSystemPromptChange(e.target.value)}
                          placeholder="Enter system prompt guidelines..."
                          className="w-full p-4 bg-transparent font-mono text-xs text-zinc-300 placeholder-zinc-600 resize-none focus:outline-none leading-relaxed selection:bg-orange-500/30"
                          spellCheck={false}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeSubTab === 'SKILLS' && (
                  <div className="space-y-4">
                    <p className="text-xs text-zinc-400">
                      Configure autonomous intelligence modules active in May's execution runtime.
                    </p>
                    <div className="space-y-2">
                      {skills.map((skill) => (
                        <div
                          key={skill.id}
                          onClick={() => toggleSkill(skill.id)}
                          className="flex items-center justify-between p-3.5 rounded-xl bg-[#121118] border border-white/5 hover:border-white/15 cursor-pointer transition-colors"
                        >
                          <span className="text-xs text-white font-medium">{skill.name}</span>
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                              skill.enabled
                                ? 'bg-[#ff7a00] border-[#ff7a00] text-black'
                                : 'border-zinc-700 bg-transparent'
                            }`}
                          >
                            {skill.enabled && <Check size={12} strokeWidth={3} />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSubTab === 'VOICE' && (
                  <div className="space-y-5">
                    <p className="text-xs text-zinc-400">
                      Select neural acoustic synthesis model for real-time low latency audio.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { name: 'May Warm (Default)', desc: 'Smooth, natural conversational warmth' },
                        { name: 'May Crisp Studio', desc: 'High-clarity technical precision' },
                        { name: 'May Velvet Ambient', desc: 'Soft, reflective tonal delivery' },
                        { name: 'May Direct Dynamic', desc: 'Direct, focused and brisk' },
                      ].map((v) => (
                        <div
                          key={v.name}
                          onClick={() => setSelectedVoice(v.name)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            selectedVoice === v.name
                              ? 'bg-[#1e1710] border-[#ff7a00] text-white shadow-md'
                              : 'bg-[#121118] border-white/5 text-zinc-300 hover:border-white/15'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold">{v.name}</span>
                            <Volume2 size={14} style={{ color: accentColor }} />
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-1">{v.desc}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-xs text-zinc-400 font-mono">
                        <span>Pacing Speed</span>
                        <span className="text-white">{voiceSpeed.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.8"
                        max="1.5"
                        step="0.1"
                        value={voiceSpeed}
                        onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                        className="w-full accent-[#ff7a00] cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {activeSubTab === 'ABILITIES' && (
                  <div className="space-y-4">
                    <p className="text-xs text-zinc-400">
                      Autonomous system permissions and execution bounds for May.
                    </p>
                    <div className="space-y-2">
                      {[
                        { title: 'Interactive 3D Fibonacci Particle Cloud', status: 'Hardware Accelerated' },
                        { title: 'Dynamic Topological Mesh Generation', status: 'Active (60 FPS)' },
                        { title: 'Autonomous Work Order Dispatcher', status: 'Ready' },
                        { title: 'Neural Memory Graph Constellation', status: 'Online' },
                      ].map((ab, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#121118] border border-white/5">
                          <span className="text-xs text-zinc-200">{ab.title}</span>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            {ab.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-2xl font-semibold text-white tracking-tight">Account</h2>
                  <p className="text-xs text-zinc-400 mt-1">Manage system operator profile and credentials.</p>
                </div>

                <div className="p-4 rounded-xl bg-[#121118] border border-white/10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#1c1c28] border border-white/20 text-white font-mono font-bold text-lg flex items-center justify-center">
                    J
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Jordan (Operator)</div>
                    <div className="text-xs text-zinc-400">operator@may-system.ai</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#121118] border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck size={16} className="text-emerald-400" />
                      <span className="text-xs text-zinc-200 font-medium">Security Clearance</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">Root / Level 4</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#121118] border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <Key size={16} className="text-[#ff7a00]" />
                      <span className="text-xs text-zinc-200 font-medium">Gemini Intelligence Core</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">Connected (Server-side)</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#121118] border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <Globe size={16} className="text-cyan-400" />
                      <span className="text-xs text-zinc-200 font-medium">Network Endpoint</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">Cloud Run Sandboxed</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-2xl font-semibold text-white tracking-tight">Preferences</h2>
                  <p className="text-xs text-zinc-400 mt-1">Configure interface visuals, audio, and controls.</p>
                </div>

                <div className="space-y-3">
                  <div 
                    onClick={() => setPrefSoundEffects(!prefSoundEffects)}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#121118] border border-white/5 cursor-pointer hover:border-white/10 transition-colors"
                  >
                    <div>
                      <div className="text-xs font-medium text-white">Audio & Speech Synthesis</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">Enable synthetic auditory cues on actions</div>
                    </div>
                    <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${prefSoundEffects ? 'bg-[#ff7a00]' : 'bg-zinc-800'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${prefSoundEffects ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  <div 
                    onClick={() => setPrefAutoFocus(!prefAutoFocus)}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#121118] border border-white/5 cursor-pointer hover:border-white/10 transition-colors"
                  >
                    <div>
                      <div className="text-xs font-medium text-white">Auto-focus Input on Keypress</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">Start typing anywhere to message May</div>
                    </div>
                    <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${prefAutoFocus ? 'bg-[#ff7a00]' : 'bg-zinc-800'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${prefAutoFocus ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#121118] border border-white/5 space-y-2">
                    <div className="flex justify-between text-xs font-medium text-white">
                      <span>Particle Sphere Orbit Rate</span>
                      <span className="font-mono text-[#ffb68b]">{prefRotationSpeed.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.5"
                      step="0.1"
                      value={prefRotationSpeed}
                      onChange={(e) => setPrefRotationSpeed(parseFloat(e.target.value))}
                      className="w-full accent-[#ff7a00] cursor-pointer"
                    />
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

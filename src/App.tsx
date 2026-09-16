import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  Move, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  Tag 
} from 'lucide-react';
import { PersonaType, CenterViewMode } from './types';
import { TopNav } from './components/TopNav';
import { ConsolePanel } from './components/ConsolePanel';
import { AgentChatPanel } from './components/AgentChatPanel';
import { FibonacciSphereCanvas } from './components/FibonacciSphereCanvas';
import { BrainMemoryConstellation } from './components/BrainMemoryConstellation';
import { SettingsModal } from './components/SettingsModal';
import { VoiceActivityOverlay } from './components/VoiceActivityOverlay';

export default function App() {
  // Mode: Default to MAY with SPHERE
  const [persona, setPersona] = useState<PersonaType>('MAY');
  const [centerMode, setCenterMode] = useState<CenterViewMode>('SPHERE');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Panels: Left Console & Right Chat are both open by default
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  // Theme Colors matching design
  const [accentColor, setAccentColor] = useState('#ff7a00');
  const [glowColor, setGlowColor] = useState('#ffb68b');
  const [systemPrompt, setSystemPrompt] = useState(
    'You are May, an advanced autonomous operating intelligence designed to help build clean, minimalist websites, content, strategy, and orchestration.'
  );

  // User Voice Input State
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0.4);

  // May Speech Output & Orb Pulsing State
  const [isMaySpeaking, setIsMaySpeaking] = useState(false);
  const [maySpeechLevel, setMaySpeechLevel] = useState(0);
  const speechCadenceRef = useRef<number | null>(null);
  const speechTimeoutRef = useRef<number | null>(null);

  // OpenRouter Config state (synced with openrouter.config.json)
  const [configuredModel, setConfiguredModel] = useState('deepseek/deepseek-r1:free');

  // Brain View Controls State (Cleanly integrated in dock to prevent text overlap)
  const [brainRotating, setBrainRotating] = useState(true);
  const [brainZoom, setBrainZoom] = useState(100);
  const [brainShowLabels, setBrainShowLabels] = useState(true);
  const [brainResetCount, setBrainResetCount] = useState(0);

  // Page index: 0 = SPHERE, 1 = BRAIN
  const [activePageIndex, setActivePageIndex] = useState(0);

  // Load configured model from /api/config on mount
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data?.model) {
          setConfiguredModel(data.model);
        }
      })
      .catch((err) => {
        console.warn('Could not read config status:', err);
      });
  }, []);

  const handleToggleCenterMode = () => {
    if (centerMode === 'SPHERE') {
      setCenterMode('BRAIN');
      setActivePageIndex(1);
    } else {
      setCenterMode('SPHERE');
      setActivePageIndex(0);
    }
  };

  const handleNavigatePage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCenterMode('SPHERE');
      setActivePageIndex(0);
    } else {
      setCenterMode('BRAIN');
      setActivePageIndex(1);
    }
  };

  // Triggered whenever May sends a chat response: speaks and pulses the orb
  const handleMaySpeak = (text: string) => {
    handleStopSpeaking();

    const cleanText = text
      .replace(/[*_#`~[\]()<>]/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    if (!cleanText) return;

    setIsMaySpeaking(true);

    // Audio cadence oscillator driving real-time orb deformation and radial bloom
    let step = 0;
    speechCadenceRef.current = window.setInterval(() => {
      step += 0.16;
      const amp = 0.52 + Math.sin(step * 7.5) * 0.22 + Math.sin(step * 18) * 0.14 + (Math.random() * 0.12);
      setMaySpeechLevel(Math.min(1, Math.max(0.35, amp)));
    }, 80);

    // Native browser speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.05;
        utterance.pitch = 1.02;

        const voices = window.speechSynthesis.getVoices();
        const naturalVoice = voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Female') ||
              v.name.includes('Samantha') ||
              v.name.includes('Victoria') ||
              v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Karen'))
        );
        if (naturalVoice) utterance.voice = naturalVoice;

        utterance.onend = () => {
          handleStopSpeaking();
        };
        utterance.onerror = () => {
          handleStopSpeaking();
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('SpeechSynthesis invocation error:', err);
      }
    }

    // Safety fallback timer so speech & pulsing naturally complete if synthesizer is muted
    const approxDurationMs = Math.max(2600, Math.min(8500, cleanText.length * 62));
    speechTimeoutRef.current = window.setTimeout(() => {
      handleStopSpeaking();
    }, approxDurationMs);
  };

  const handleStopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    if (speechCadenceRef.current) {
      clearInterval(speechCadenceRef.current);
      speechCadenceRef.current = null;
    }
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
    setIsMaySpeaking(false);
    setMaySpeechLevel(0);
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      handleStopSpeaking();
    };
  }, []);

  // Keyboard shortcut: Spacebar toggles voice
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.getAttribute('contenteditable') === 'true';

      if (e.code === 'Space' && !isInput && !e.repeat) {
        e.preventDefault();
        setIsVoiceActive((prev) => !prev);
      }

      if (e.key === 'Escape') {
        if (isSettingsOpen) setIsSettingsOpen(false);
        if (isVoiceActive) setIsVoiceActive(false);
        if (isMaySpeaking) handleStopSpeaking();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsOpen, isVoiceActive, isMaySpeaking]);

  // Voice simulation when user is speaking
  useEffect(() => {
    if (!isVoiceActive) {
      setVoiceLevel(0);
      return;
    }
    const interval = setInterval(() => {
      setVoiceLevel(Math.random() * 0.7 + 0.3);
    }, 120);
    return () => clearInterval(interval);
  }, [isVoiceActive]);

  // Effective voice activity and level sent to the 3D Fibonacci sphere
  const effectiveVoiceActive = isVoiceActive || isMaySpeaking;
  const effectiveVoiceLevel = isMaySpeaking ? maySpeechLevel : voiceLevel;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#08080a] text-[#e5e1e4] select-none font-sans">
      {/* 1. TOP SYSTEM NAVIGATION (MAY_OS ™   Globe Bell Search J) */}
      <TopNav
        persona={persona}
        onTogglePersona={() => {}}
        centerMode={centerMode}
        onToggleCenterMode={handleToggleCenterMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        leftPanelOpen={leftPanelOpen}
        onToggleLeftPanel={() => setLeftPanelOpen(!leftPanelOpen)}
        rightPanelOpen={rightPanelOpen}
        onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
        accentColor={accentColor}
      />

      {/* 2. MAIN WORKSPACE VIEWPORT */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT CONSOLE PANEL (● CONSOLE) */}
        <AnimatePresence initial={false}>
          {leftPanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="z-20 w-[300px] h-full shrink-0 overflow-hidden relative"
            >
              <ConsolePanel
                persona={persona}
                accentColor={accentColor}
                onClose={() => setLeftPanelOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* CENTER STAGING VIEWPORT (Orbs are centered here) */}
        <main
          id="center-stage-viewport"
          className="flex-1 h-full relative overflow-hidden bg-[#08080a]"
        >
          {/* Top Floating Action: ● SPACEBAR FOR VOICE */}
          <div className="absolute top-6 left-0 right-0 z-30 flex justify-center pointer-events-auto">
            <VoiceActivityOverlay
              isActive={isVoiceActive}
              onToggle={() => setIsVoiceActive(!isVoiceActive)}
              accentColor={accentColor}
              personaName={persona}
              isSpeaking={isMaySpeaking}
              onStopSpeaking={handleStopSpeaking}
            />
          </div>

          {/* EXACT CENTER CANVAS (Spans absolute 100% of viewport, orb centered at width/2, height/2) */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center">
            {centerMode === 'SPHERE' ? (
              <FibonacciSphereCanvas
                accentColor={accentColor}
                glowColor={glowColor}
                isVoiceActive={effectiveVoiceActive}
                voiceLevel={effectiveVoiceLevel}
                subtleDeformScale={1.05}
                showTerrain={true}
                onSphereClick={() => setIsVoiceActive(!isVoiceActive)}
              />
            ) : (
              <BrainMemoryConstellation 
                accentColor="#8a2be2" 
                showTerrain={true}
                isRotating={brainRotating}
                zoom={brainZoom}
                showLabels={brainShowLabels}
                resetTrigger={brainResetCount}
                isSpeaking={isMaySpeaking}
                voiceLevel={maySpeechLevel}
              />
            )}
          </div>

          {/* BOTTOM DOCK & TYPOGRAPHY - Stacked cleanly with zero overlap */}
          <div className="absolute bottom-6 left-0 right-0 z-30 flex flex-col items-center gap-2.5 pointer-events-auto px-4">
            {/* SPHERE MODE DOCK CAPSULE: Chat · Console · Configure */}
            {centerMode === 'SPHERE' && (
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-1 p-1 rounded-full bg-[#111118]/90 border border-white/10 backdrop-blur-md text-xs font-mono shadow-2xl">
                  <button
                    onClick={() => setRightPanelOpen(!rightPanelOpen)}
                    className={`px-4 py-1.5 rounded-full transition-colors ${
                      rightPanelOpen
                        ? 'bg-[#22202c] text-white font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Chat
                  </button>
                  <button
                    onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                    className={`px-4 py-1.5 rounded-full transition-colors ${
                      leftPanelOpen
                        ? 'bg-[#221c16] text-[#ffb68b] border border-[#ff7a00]/30 font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Console
                  </button>
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="px-4 py-1.5 rounded-full text-zinc-400 hover:text-white transition-colors"
                  >
                    Configure
                  </button>
                </div>

                {/* Sub-label helper text */}
                <p className="text-[11px] font-mono text-zinc-500 tracking-wide">
                  Chat · Console · Configure — tap an item to open or close it
                </p>
              </div>
            )}

            {/* BRAIN MODE DOCK CAPSULE: Rotate · Pan · Zoom · Reset · Labels */}
            {centerMode === 'BRAIN' && (
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#12111c]/90 border border-white/10 backdrop-blur-md shadow-2xl text-xs font-mono">
                  <button
                    onClick={() => setBrainRotating(!brainRotating)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full transition-colors ${
                      brainRotating
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <RotateCw size={12} className={brainRotating ? 'animate-spin-slow' : ''} />
                    <span>Rotate</span>
                  </button>

                  <div className="w-[1px] h-3.5 bg-white/10" />

                  <button
                    onClick={() => setBrainResetCount((c) => c + 1)}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    <Move size={12} />
                    <span>Pan</span>
                  </button>

                  <div className="w-[1px] h-3.5 bg-white/10" />

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setBrainZoom((z) => Math.max(50, z - 15))}
                      className="p-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded"
                      title="Zoom Out"
                    >
                      <ZoomOut size={12} />
                    </button>
                    <span className="text-[11px] font-mono text-zinc-300 w-10 text-center">
                      {brainZoom}%
                    </span>
                    <button
                      onClick={() => setBrainZoom((z) => Math.min(180, z + 15))}
                      className="p-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded"
                      title="Zoom In"
                    >
                      <ZoomIn size={12} />
                    </button>
                  </div>

                  <div className="w-[1px] h-3.5 bg-white/10" />

                  <button
                    onClick={() => {
                      setBrainZoom(100);
                      setBrainResetCount((c) => c + 1);
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    <RefreshCw size={11} />
                    <span className="hidden sm:inline">Reset</span>
                  </button>

                  <div className="w-[1px] h-3.5 bg-white/10" />

                  <button
                    onClick={() => setBrainShowLabels(!brainShowLabels)}
                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                      brainShowLabels ? 'text-purple-300 font-semibold' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Tag size={12} />
                    <span className="hidden sm:inline">Labels</span>
                  </button>
                </div>

                <p className="text-[11px] font-mono text-zinc-500 tracking-wide whitespace-nowrap">
                  Drag constellation to orbit · Scroll to zoom · Click nodes
                </p>
              </div>
            )}

            {/* Display Title: M A Y or B R A I N (Guaranteed zero overlap) */}
            <div className="text-center pt-0.5">
              <h1
                className="font-mono text-xl sm:text-2xl font-bold tracking-[0.6em] sm:tracking-[0.7em] uppercase transition-colors whitespace-nowrap select-none"
                style={{ color: centerMode === 'SPHERE' ? accentColor : '#d8b4fe' }}
              >
                {centerMode === 'SPHERE' ? 'M A Y' : 'B R A I N'}
              </h1>

              {/* Subtitle with navigation arrows */}
              <div className="flex items-center justify-center gap-3 mt-1 text-zinc-500 text-[11px] font-mono tracking-[0.18em] whitespace-nowrap select-none">
                <button
                  onClick={() => handleNavigatePage('prev')}
                  className="hover:text-white transition-colors p-0.5"
                  title="Previous View"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="uppercase">
                  {centerMode === 'SPHERE'
                    ? 'ORCHESTRATOR · THE VOICE OF YOUR WORLD'
                    : 'MAY MEMORY · EVERYTHING STORED FOR YOU'}
                </span>
                <button
                  onClick={() => handleNavigatePage('next')}
                  className="hover:text-white transition-colors p-0.5"
                  title="Next View"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Pagination dots (May & Brain) */}
              <div className="flex items-center justify-center gap-2 mt-2">
                {[0, 1].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActivePageIndex(idx);
                      if (idx === 0) {
                        setCenterMode('SPHERE');
                      } else {
                        setCenterMode('BRAIN');
                      }
                    }}
                    title={idx === 0 ? 'May 3D Sphere' : 'Brain Memory'}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      activePageIndex === idx
                        ? 'w-3 bg-[#ff7a00] shadow-[0_0_6px_#ff7a00]'
                        : 'bg-zinc-700 hover:bg-zinc-500'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT CHAT PANEL (● MAY) */}
        <AnimatePresence initial={false}>
          {rightPanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="z-20 w-[380px] h-full shrink-0 overflow-hidden relative"
            >
              <AgentChatPanel
                persona="MAY"
                accentColor={accentColor}
                onClose={() => setRightPanelOpen(false)}
                isVoiceActive={isVoiceActive}
                onVoiceTrigger={() => setIsVoiceActive(!isVoiceActive)}
                onMaySpeak={handleMaySpeak}
                isMaySpeaking={isMaySpeaking}
                configuredModel={configuredModel}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. SETTINGS MODAL */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        persona="MAY"
        accentColor={accentColor}
        onColorChange={(hex, glow) => {
          setAccentColor(hex);
          setGlowColor(glow);
        }}
        systemPrompt={systemPrompt}
        onSystemPromptChange={setSystemPrompt}
      />
    </div>
  );
}

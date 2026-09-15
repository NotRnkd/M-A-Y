import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Voice State
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0.4);

  // Page index: 0 = SPHERE, 1 = BRAIN, 2 = SETTINGS
  const [activePageIndex, setActivePageIndex] = useState(0);

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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsOpen, isVoiceActive]);

  // Voice simulation
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
            />
          </div>

          {/* EXACT CENTER CANVAS (Spans absolute 100% of viewport, orb centered at width/2, height/2) */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center">
            {centerMode === 'SPHERE' ? (
              <FibonacciSphereCanvas
                accentColor={accentColor}
                glowColor={glowColor}
                isVoiceActive={isVoiceActive}
                voiceLevel={voiceLevel}
                subtleDeformScale={1.05}
                showTerrain={true}
                onSphereClick={() => setIsVoiceActive(!isVoiceActive)}
              />
            ) : (
              <BrainMemoryConstellation 
                accentColor="#8a2be2" 
                showTerrain={true}
              />
            )}
          </div>

          {/* BOTTOM DOCK & TYPOGRAPHY */}
          <div className="absolute bottom-6 left-0 right-0 z-30 flex flex-col items-center gap-2.5 pointer-events-auto px-4">
            {/* Dock Capsule: Chat · Console · Configure (Credits pill removed as requested) */}
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

            {/* Display Title: M A Y or B R A I N */}
            <div className="text-center pt-0.5">
              <h1
                className="font-mono text-xl sm:text-2xl font-bold tracking-[0.7em] uppercase transition-colors"
                style={{ color: centerMode === 'SPHERE' ? accentColor : '#d8b4fe' }}
              >
                {centerMode === 'SPHERE' ? 'M A Y' : 'B R A I N'}
              </h1>

              {/* Subtitle with navigation arrows */}
              <div className="flex items-center justify-center gap-3 mt-1 text-zinc-500 text-[11px] font-mono tracking-[0.18em]">
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

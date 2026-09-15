import React, { useState, useEffect, useCallback } from 'react';
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
  // OS & View State
  const [persona, setPersona] = useState<PersonaType>('MAY');
  const [centerMode, setCenterMode] = useState<CenterViewMode>('SPHERE');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Layout Panels
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  // Theme & Identity configuration
  const [accentColor, setAccentColor] = useState('#ff7a00');
  const [glowColor, setGlowColor] = useState('#ffb68b');
  const [systemPrompt, setSystemPrompt] = useState(
    'You are Zoey, an advanced autonomous operating intelligence...'
  );

  // Voice State
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0.4);

  // Page index for pagination dots: 0 = MAY Sphere, 1 = ZOEY Brain, 2 = Settings
  const [activePageIndex, setActivePageIndex] = useState(0);

  // Synchronize persona with center mode on toggle
  const handleTogglePersona = () => {
    if (persona === 'MAY') {
      setPersona('ZOEY');
      setCenterMode('BRAIN');
      setActivePageIndex(1);
      setAccentColor('#8a2be2');
      setGlowColor('#d8b4fe');
      setSystemPrompt('You are Zoey, an advanced autonomous operating intelligence...');
    } else {
      setPersona('MAY');
      setCenterMode('SPHERE');
      setActivePageIndex(0);
      setAccentColor('#ff7a00');
      setGlowColor('#ffb68b');
      setSystemPrompt('You are May, an autonomous orchestrator and execution intelligence...');
    }
  };

  const handleToggleCenterMode = () => {
    if (centerMode === 'SPHERE') {
      setCenterMode('BRAIN');
      setActivePageIndex(1);
    } else {
      setCenterMode('SPHERE');
      setActivePageIndex(0);
    }
  };

  // Switch between pages via arrow buttons or dots
  const handleNavigatePage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (activePageIndex === 1) {
        setPersona('MAY');
        setCenterMode('SPHERE');
        setActivePageIndex(0);
        setAccentColor('#ff7a00');
        setGlowColor('#ffb68b');
      } else if (activePageIndex === 2) {
        setIsSettingsOpen(false);
        setCenterMode('BRAIN');
        setPersona('ZOEY');
        setActivePageIndex(1);
      }
    } else {
      if (activePageIndex === 0) {
        setPersona('ZOEY');
        setCenterMode('BRAIN');
        setActivePageIndex(1);
        setAccentColor('#8a2be2');
        setGlowColor('#d8b4fe');
      } else if (activePageIndex === 1) {
        setIsSettingsOpen(true);
        setActivePageIndex(2);
      }
    }
  };

  // Keyboard shortcut: Spacebar triggers voice when not typing in inputs
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
      {/* 1. TOP SYSTEM NAVIGATION */}
      <TopNav
        persona={persona}
        onTogglePersona={handleTogglePersona}
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
        {/* LEFT DOCKED CONSOLE PANEL */}
        <AnimatePresence initial={false}>
          {leftPanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="z-20 w-72 sm:w-80 h-full shrink-0 overflow-hidden relative"
            >
              <ConsolePanel
                persona={persona}
                accentColor={accentColor}
                onClose={() => setLeftPanelOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* CENTER STAGING VIEWPORT */}
        <main
          id="center-stage-viewport"
          className="flex-1 h-full relative flex flex-col justify-between items-center overflow-hidden bg-radial from-[#121118]/60 via-[#08080a] to-[#050507]"
        >
          {/* Top Floating Action: SPACEBAR FOR VOICE */}
          <div className="z-30 pt-6 sm:pt-8 pointer-events-auto">
            <VoiceActivityOverlay
              isActive={isVoiceActive}
              onToggle={() => setIsVoiceActive(!isVoiceActive)}
              accentColor={accentColor}
              personaName={persona}
            />
          </div>

          {/* Center Visual Canvas Area */}
          <div className="absolute inset-0 flex items-center justify-center">
            {centerMode === 'SPHERE' ? (
              <FibonacciSphereCanvas
                accentColor={accentColor}
                glowColor={glowColor}
                isVoiceActive={isVoiceActive}
                voiceLevel={voiceLevel}
                subtleDeformScale={1.1}
                onSphereClick={() => setIsVoiceActive(!isVoiceActive)}
              />
            ) : (
              <BrainMemoryConstellation accentColor={accentColor} />
            )}
          </div>

          {/* Bottom Dock, Spaced Display Title, and Pagination Dots */}
          <div className="z-30 pb-6 sm:pb-8 flex flex-col items-center gap-3 pointer-events-auto">
            {/* Center Dock Pills (Screenshot 5 style) */}
            {centerMode === 'SPHERE' ? (
              <div className="flex flex-col items-center gap-2">
                <div className="inline-flex p-1 rounded-full bg-[#12111a]/85 border border-white/10 backdrop-blur-md text-xs font-mono">
                  <button
                    onClick={() => setRightPanelOpen(!rightPanelOpen)}
                    className={`px-4 py-1.5 rounded-full transition-colors ${
                      rightPanelOpen
                        ? 'bg-[#221e2c] text-white font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Chat
                  </button>
                  <button
                    onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                    className={`px-4 py-1.5 rounded-full transition-colors ${
                      leftPanelOpen
                        ? 'bg-[#221e2c] text-white font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Console
                  </button>
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="px-4 py-1.5 rounded-full text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    Configure
                  </button>
                </div>
                <p className="text-[11px] font-mono text-zinc-500 tracking-wide">
                  Chat · Console · Configure — tap an item to open or close it
                </p>
              </div>
            ) : null}

            {/* Spaced Display Title (MAY or BRAIN) */}
            <div className="text-center pt-1">
              <h1
                className="font-mono text-xl sm:text-2xl font-bold tracking-[0.6em] sm:tracking-[0.8em] uppercase transition-colors"
                style={{ color: accentColor }}
              >
                {centerMode === 'SPHERE' ? (persona === 'MAY' ? 'M A Y' : 'Z O E Y') : 'B R A I N'}
              </h1>

              {/* Sub-label with navigational arrows */}
              <div className="flex items-center justify-center gap-3 mt-1.5 text-zinc-500 text-[11px] font-mono tracking-[0.16em]">
                <button
                  onClick={() => handleNavigatePage('prev')}
                  className="hover:text-white transition-colors p-0.5"
                  title="Previous View"
                >
                  <ChevronLeft size={13} />
                </button>
                <span className="uppercase">
                  {centerMode === 'SPHERE'
                    ? 'ORCHESTRATOR · THE VOICE OF YOUR WORLD'
                    : 'HER MEMORY · EVERYTHING SHE KEEPS FOR YOU'}
                </span>
                <button
                  onClick={() => handleNavigatePage('next')}
                  className="hover:text-white transition-colors p-0.5"
                  title="Next View"
                >
                  <ChevronRight size={13} />
                </button>
              </div>

              {/* 3 Pagination dots */}
              <div className="flex items-center justify-center gap-2 mt-2">
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActivePageIndex(idx);
                      if (idx === 0) {
                        setPersona('MAY');
                        setCenterMode('SPHERE');
                        setAccentColor('#ff7a00');
                        setGlowColor('#ffb68b');
                      } else if (idx === 1) {
                        setPersona('ZOEY');
                        setCenterMode('BRAIN');
                        setAccentColor('#8a2be2');
                        setGlowColor('#d8b4fe');
                      } else {
                        setIsSettingsOpen(true);
                      }
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      activePageIndex === idx
                        ? 'w-3 bg-white shadow-[0_0_6px_#fff]'
                        : 'bg-zinc-600 hover:bg-zinc-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT DOCKED CHAT / TERMINAL PANEL */}
        <AnimatePresence initial={false}>
          {rightPanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="z-20 w-80 sm:w-96 h-full shrink-0 overflow-hidden relative"
            >
              <AgentChatPanel
                persona={persona}
                accentColor={accentColor}
                onClose={() => setRightPanelOpen(false)}
                isVoiceActive={isVoiceActive}
                onVoiceTrigger={() => setIsVoiceActive(!isVoiceActive)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. SETTINGS MODAL (Matching Screenshot 1) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          if (activePageIndex === 2) {
            setActivePageIndex(centerMode === 'SPHERE' ? 0 : 1);
          }
        }}
        persona={persona}
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

import React from 'react';
import { 
  Globe, 
  Bell, 
  Search, 
  Settings as SettingsIcon, 
  PanelLeft, 
  PanelRight,
  Brain,
  Layers,
  Sparkles
} from 'lucide-react';
import { PersonaType, CenterViewMode } from '../types';

interface TopNavProps {
  persona: PersonaType;
  onTogglePersona: () => void;
  centerMode: CenterViewMode;
  onToggleCenterMode: () => void;
  onOpenSettings: () => void;
  leftPanelOpen: boolean;
  onToggleLeftPanel: () => void;
  rightPanelOpen: boolean;
  onToggleRightPanel: () => void;
  accentColor: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  persona,
  onTogglePersona,
  centerMode,
  onToggleCenterMode,
  onOpenSettings,
  leftPanelOpen,
  onToggleLeftPanel,
  rightPanelOpen,
  onToggleRightPanel,
  accentColor,
}) => {
  return (
    <header 
      id="system-top-nav"
      className="h-12 w-full px-4 sm:px-6 flex items-center justify-between bg-[#08080a] border-b border-white/5 z-30 select-none"
    >
      {/* LEFT: LOGO & MOBILE TOGGLE */}
      <div className="flex items-center gap-3">
        {/* Toggle Left Sidebar on Mobile/Desktop */}
        <button
          onClick={onToggleLeftPanel}
          className={`p-1.5 rounded-md transition-colors ${
            leftPanelOpen ? 'text-white bg-white/5' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          title="Toggle Console Panel"
        >
          <PanelLeft size={16} />
        </button>

        {/* Dynamic System Logo */}
        <div 
          onClick={onTogglePersona}
          className="flex items-baseline cursor-pointer group"
          title="Click to switch between MAY_OS and ZOEY_OS"
        >
          <span 
            className="font-mono text-sm sm:text-base font-bold tracking-[0.14em] uppercase transition-colors"
            style={{ color: accentColor }}
          >
            {persona}_OS
          </span>
          <span className="font-mono text-[9px] text-zinc-500 ml-0.5 group-hover:text-zinc-300">
            ™
          </span>
        </div>

        {/* View Switcher Badge (Sphere vs Brain) */}
        <button
          onClick={onToggleCenterMode}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-[#14141d] border border-white/5 text-zinc-300 hover:text-white hover:border-white/10 transition-colors ml-2"
          title="Toggle between 3D Fibonacci Particle Cloud and Neural Memory Brain"
        >
          {centerMode === 'SPHERE' ? (
            <>
              <Layers size={11} style={{ color: accentColor }} />
              <span>SPHERE CLOUD</span>
            </>
          ) : (
            <>
              <Brain size={11} className="text-purple-400" />
              <span>BRAIN ORBIT</span>
            </>
          )}
        </button>
      </div>

      {/* CENTER: PERSONA SWITCHER PILL */}
      <div className="flex items-center gap-1 bg-[#12121a] p-0.5 rounded-full border border-white/5 text-xs font-mono">
        <button
          onClick={() => persona !== 'MAY' && onTogglePersona()}
          className={`px-3 py-1 rounded-full text-[11px] transition-colors ${
            persona === 'MAY'
              ? 'bg-[#221c16] text-[#ffb68b] border border-[#ff7a00]/30 font-semibold shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          MAY
        </button>
        <button
          onClick={() => persona !== 'ZOEY' && onTogglePersona()}
          className={`px-3 py-1 rounded-full text-[11px] transition-colors ${
            persona === 'ZOEY'
              ? 'bg-[#1e1828] text-purple-300 border border-purple-500/30 font-semibold shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          ZOEY
        </button>
      </div>

      {/* RIGHT UTILITIES */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Globe Network status */}
        <button 
          title="Network: 24ms Low Latency EU-West"
          className="p-1.5 text-zinc-400 hover:text-white transition-colors"
        >
          <Globe size={16} />
        </button>

        {/* Notifications */}
        <button 
          title="System Notifications: 0 Active"
          className="p-1.5 text-zinc-400 hover:text-white transition-colors relative"
        >
          <Bell size={16} />
          <span 
            className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
        </button>

        {/* Search */}
        <button 
          title="Search Command Palette"
          className="p-1.5 text-zinc-400 hover:text-white transition-colors"
        >
          <Search size={16} />
        </button>

        {/* Settings Button */}
        <button 
          onClick={onOpenSettings}
          title="Open System Settings"
          className="p-1.5 text-zinc-400 hover:text-white transition-colors"
        >
          <SettingsIcon size={16} />
        </button>

        {/* User Avatar circle 'J' */}
        <button 
          onClick={onOpenSettings}
          title="Profile: User J"
          className="w-7 h-7 ml-1 rounded-full bg-[#181822] border border-white/10 text-xs font-mono text-zinc-200 flex items-center justify-center hover:border-white/20 transition-colors"
        >
          J
        </button>

        {/* Toggle Right Chat on Mobile/Desktop */}
        <button
          onClick={onToggleRightPanel}
          className={`p-1.5 rounded-md transition-colors ${
            rightPanelOpen ? 'text-white bg-white/5' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          title="Toggle Chat Panel"
        >
          <PanelRight size={16} />
        </button>
      </div>
    </header>
  );
};

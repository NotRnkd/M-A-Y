import React from 'react';
import { 
  Globe, 
  Bell, 
  Search, 
  PanelLeft, 
  PanelRight,
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
  accentColor = '#ff7a00',
}) => {
  const [showNetworkInfo, setShowNetworkInfo] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);

  return (
    <header 
      id="system-top-nav"
      className="h-12 w-full px-6 flex items-center justify-between bg-[#08080a] border-b border-[#14141e] z-30 select-none relative"
    >
      {/* LEFT: EXACT BRAND LOGO (MAY_OS ™) */}
      <div className="flex items-center gap-3">
        {/* Mobile/Quick panel toggle */}
        <button
          onClick={onToggleLeftPanel}
          className={`lg:hidden p-1.5 rounded-md transition-colors ${
            leftPanelOpen ? 'text-white bg-white/5' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          title="Toggle Console"
        >
          <PanelLeft size={16} />
        </button>

        <div 
          onClick={onToggleCenterMode}
          className="flex items-baseline cursor-pointer group"
          title="Click to toggle between Orchestrator Sphere and Brain Memory view"
        >
          <span 
            className="font-mono text-sm sm:text-base font-bold tracking-[0.16em] uppercase transition-colors"
            style={{ color: accentColor }}
          >
            MAY_OS
          </span>
          <span 
            className="font-mono text-[10px] ml-1 transition-colors"
            style={{ color: accentColor }}
          >
            ™
          </span>
        </div>
      </div>

      {/* RIGHT UTILITIES: Globe, Bell, Search, J avatar */}
      <div className="flex items-center gap-4 relative">
        {/* Globe Network */}
        <div className="relative">
          <button 
            title="Network Connection (Active)"
            onClick={() => setShowNetworkInfo(!showNetworkInfo)}
            className="text-zinc-400 hover:text-white transition-colors p-1 flex items-center gap-1"
          >
            <Globe size={16} />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </button>
          {showNetworkInfo && (
            <div className="absolute right-0 top-9 w-60 p-3 bg-[#111117] border border-white/10 rounded-xl shadow-xl text-xs z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-zinc-300 font-mono text-[11px] pb-1 border-b border-white/5">
                <span>NEURAL LINK</span>
                <span className="text-emerald-400">ONLINE</span>
              </div>
              <div className="mt-2 space-y-1 text-zinc-400 text-[11px] font-mono">
                <div>Latency: 14ms</div>
                <div>Protocol: WebSockets v2</div>
                <div>Status: Connected to May Core</div>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button 
            title="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-zinc-400 hover:text-white transition-colors p-1 relative"
          >
            <Bell size={16} />
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-[#ff7a00]" />
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-9 w-72 p-3 bg-[#111117] border border-white/10 rounded-xl shadow-xl text-xs z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-zinc-300 font-mono text-[11px] pb-2 border-b border-white/5">
                <span>SYSTEM EVENTS</span>
                <span className="text-[10px] text-zinc-500">All clear</span>
              </div>
              <div className="mt-2 space-y-2">
                <div className="p-2 rounded-lg bg-white/5 text-[11px]">
                  <div className="text-white font-medium">May Orchestrator Active</div>
                  <div className="text-zinc-400 text-[10px] mt-0.5">3D particle sphere initialized in optimal render state.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <button 
          onClick={onToggleCenterMode}
          title="Search / Switch to Brain Memory"
          className="text-zinc-400 hover:text-white transition-colors p-1"
        >
          <Search size={16} />
        </button>

        {/* User Profile avatar J (opens Settings) */}
        <button 
          onClick={onOpenSettings}
          title="Settings / Configure May"
          className="w-7 h-7 rounded-full bg-[#121218] border border-[#262638] text-xs font-mono text-zinc-300 flex items-center justify-center hover:border-white/30 transition-colors"
        >
          J
        </button>

        {/* Mobile chat panel toggle */}
        <button
          onClick={onToggleRightPanel}
          className={`lg:hidden p-1.5 rounded-md transition-colors ${
            rightPanelOpen ? 'text-white bg-white/5' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          title="Toggle Chat"
        >
          <PanelRight size={16} />
        </button>
      </div>
    </header>
  );
};

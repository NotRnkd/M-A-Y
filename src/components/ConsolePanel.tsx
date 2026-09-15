import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Minus, 
  X, 
  UploadCloud, 
  MessageSquarePlus, 
  FolderPlus, 
  Search, 
  Zap, 
  Target, 
  Laptop, 
  Puzzle,
  CheckCircle2
} from 'lucide-react';
import { PersonaType } from '../types';

interface ConsolePanelProps {
  persona: PersonaType;
  accentColor: string;
  onClose?: () => void;
  onOpenGoalModal?: () => void;
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({
  persona,
  accentColor,
  onClose,
  onOpenGoalModal,
}) => {
  // Mode specific state
  const [filterOpen, setFilterOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [timePreset, setTimePreset] = useState<'24h' | '7d' | '30d' | 'All'>('All');
  const [timelineValue, setTimelineValue] = useState(65);
  const [selectedStored, setSelectedStored] = useState<'all' | 'memories' | 'conversations'>('all');
  
  // Quick goal addition toggle
  const [goals, setGoals] = useState([
    {
      id: '1',
      title: 'Creating Website clean minimali...',
      status: 'JUST SET',
      completed: 1,
      total: 5,
    },
  ]);

  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    setGoals([
      ...goals,
      {
        id: Date.now().toString(),
        title: newGoalText.trim(),
        status: 'JUST SET',
        completed: 0,
        total: 4,
      },
    ]);
    setNewGoalText('');
    setIsAddingGoal(false);
  };

  return (
    <aside 
      id="left-console-panel"
      className="w-full h-full flex flex-col justify-between p-4 sm:p-5 bg-[#0d0d12]/95 backdrop-blur-xl border-r border-white/5 text-[#e5e1e4] select-none overflow-y-auto"
    >
      <div className="space-y-6">
        {/* ================= HEADER ================= */}
        {persona === 'MAY' ? (
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span 
                className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px]"
                style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
              />
              <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#ffb68b] uppercase">
                CONSOLE
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500">
              <button 
                title="Minimize" 
                className="hover:text-white transition-colors p-1"
              >
                <Minus size={13} />
              </button>
              <button 
                onClick={onClose} 
                title="Close" 
                className="hover:text-white transition-colors p-1"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Search Bar for Zoey Memory */}
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search memory"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#171620] border border-white/5 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>
          </div>
        )}

        {/* ================= MAY OS: ACTIVITY & GOALS ================= */}
        {persona === 'MAY' && (
          <div className="space-y-6 text-xs">
            {/* ACTIVITY */}
            <div>
              <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-[0.16em] text-[#ff7a00] uppercase mb-2">
                <Zap size={12} />
                <span>ACTIVITY</span>
              </div>
              <p className="font-mono text-[11px] text-zinc-400 pl-4">
                ○ No workers out right now.
              </p>
            </div>

            {/* GOALS */}
            <div>
              <div className="flex items-center justify-between font-mono text-[11px] font-bold tracking-[0.16em] text-[#ff7a00] uppercase mb-2">
                <div className="flex items-center gap-1.5">
                  <Target size={12} />
                  <span>GOALS</span>
                </div>
                <button 
                  onClick={() => setIsAddingGoal(!isAddingGoal)}
                  className="hover:text-white p-0.5 transition-colors"
                  title="Add Goal"
                >
                  <Plus size={13} />
                </button>
              </div>

              {isAddingGoal && (
                <form onSubmit={handleAddGoal} className="mb-3">
                  <input
                    type="text"
                    placeholder="Enter new objective..."
                    value={newGoalText}
                    onChange={(e) => setNewGoalText(e.target.value)}
                    autoFocus
                    className="w-full px-2.5 py-1.5 bg-[#171622] border border-orange-500/40 rounded text-xs text-white focus:outline-none"
                  />
                </form>
              )}

              {goals.map((g) => (
                <div key={g.id} className="space-y-1.5 pl-1">
                  <div className="flex items-center justify-between text-zinc-300 font-mono text-[11px]">
                    <span className="truncate max-w-[170px]" title={g.title}>
                      {g.title}
                    </span>
                    <span className="text-[10px] tracking-wider text-[#ff7a00] font-semibold">
                      {g.status}
                    </span>
                  </div>

                  {/* Segmented step markers */}
                  <div className="flex items-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <div
                        key={step}
                        className={`w-3.5 h-3.5 rounded-xs border transition-colors ${
                          step <= g.completed
                            ? 'bg-[#ff7a00] border-[#ff7a00]'
                            : 'border-zinc-700 bg-transparent'
                        }`}
                      />
                    ))}
                    <div className="flex-1 h-[1px] bg-zinc-800" />
                  </div>
                </div>
              ))}
            </div>

            {/* AUTOMATIONS */}
            <div>
              <button className="flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-[0.16em] text-[#ff7a00] uppercase mb-2 hover:opacity-80 transition-opacity">
                <Zap size={12} />
                <span>AUTOMATIONS &gt;</span>
              </button>
              <div className="flex items-center justify-between pl-4">
                <span className="font-mono text-[11px] text-zinc-400">
                  Nothing runs on its own yet.
                </span>
                <button className="px-2.5 py-1 text-[11px] font-mono text-zinc-300 bg-[#201d2a] hover:bg-[#2b2738] border border-white/5 rounded transition-colors">
                  Set one up
                </button>
              </div>
            </div>

            {/* LOCAL MACHINE */}
            <div>
              <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-[0.16em] text-[#ff7a00] uppercase mb-2">
                <Laptop size={12} />
                <span>LOCAL MACHINE</span>
              </div>
              <p className="font-mono text-[11px] text-zinc-400 pl-4 leading-relaxed">
                No apps approved yet — the first request arrives in chat.
              </p>
            </div>

            {/* INTEGRATIONS */}
            <div>
              <button className="flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-[0.16em] text-[#ff7a00] uppercase mb-2 hover:opacity-80 transition-opacity">
                <Puzzle size={12} />
                <span>+ INTEGRATIONS &gt;</span>
              </button>
              <p className="font-mono text-[11px] text-zinc-400 pl-4">
                Nothing connected yet.
              </p>
            </div>
          </div>
        )}

        {/* ================= ZOEY OS: MEMORY & STORAGE (Screenshot 3) ================= */}
        {persona === 'ZOEY' && (
          <div className="space-y-5 text-xs">
            {/* Filters Accordion */}
            <div>
              <button 
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors mb-3"
              >
                {filterOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span className="font-medium">Filters</span>
              </button>

              {filterOpen && (
                <div className="space-y-4 pl-3 border-l border-white/5">
                  {/* What's stored */}
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-2 font-mono">
                      What's stored
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedStored('memories')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors ${
                          selectedStored === 'memories'
                            ? 'bg-purple-900/40 text-purple-300 border border-purple-500/40'
                            : 'bg-[#181624] text-zinc-400 hover:text-zinc-200 border border-white/5'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        <span>Memories 1</span>
                      </button>

                      <button
                        onClick={() => setSelectedStored('conversations')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors ${
                          selectedStored === 'conversations'
                            ? 'bg-purple-900/40 text-purple-300 border border-purple-500/40'
                            : 'bg-[#181624] text-zinc-400 hover:text-zinc-200 border border-white/5'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>Conversations 1</span>
                      </button>
                    </div>
                  </div>

                  {/* When (Timeline Scrubber) */}
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-2 font-mono">
                      When
                    </span>
                    {/* Scrub line widget matching Screenshot 3 */}
                    <div className="relative py-2">
                      <div className="h-4 bg-[#181625] border border-cyan-500/40 rounded-sm relative flex items-center">
                        <div 
                          className="absolute h-full w-1.5 bg-cyan-400 shadow-[0_0_6px_#00e5ff] cursor-ew-resize"
                          style={{ left: `${timelineValue}%` }}
                        />
                        <div className="w-full border-t border-dashed border-cyan-500/30" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 font-mono">
                      <span>Sep 14, 17:55 - Sep 14, 18:55</span>
                      <div className="flex items-center gap-1">
                        {(['24h', '7d', '30d', 'All'] as const).map((preset) => (
                          <button
                            key={preset}
                            onClick={() => setTimePreset(preset)}
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              timePreset === preset
                                ? 'bg-white/10 text-white font-semibold'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* About */}
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-2 font-mono">
                      About
                    </span>
                    <div className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-[#181625] border border-purple-500/20 text-xs text-zinc-300">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2 h-2 rotate-45 border border-purple-400" />
                        <span className="truncate">Goal the user is working toward: C...</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">2</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* File Explorer */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5 text-xs text-zinc-400">
                <span className="font-medium">File Explorer</span>
                <button className="text-zinc-500 hover:text-white p-0.5">
                  <FolderPlus size={14} />
                </button>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed font-mono">
                Nothing here yet — give her something.
              </p>
            </div>

            {/* Give her something */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] text-zinc-400 block font-mono">
                Give her something
              </span>

              <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#191728] hover:bg-[#232038] border border-white/5 text-zinc-200 text-xs font-medium transition-colors">
                <UploadCloud size={14} className="text-purple-400" />
                <span>Upload files & folders</span>
              </button>

              <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#191728] hover:bg-[#232038] border border-white/5 text-zinc-200 text-xs font-medium transition-colors">
                <MessageSquarePlus size={14} className="text-purple-400" />
                <span>Tell her something</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= BOTTOM STATUS PILL ================= */}
      <div className="pt-4">
        <button className="w-full flex items-center justify-between px-3.5 py-2 rounded-full bg-[#181622] hover:bg-[#221f30] border border-white/10 text-xs text-zinc-300 transition-colors shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#ffb68b]">0/5</span>
            <span className="font-semibold text-white">Getting started</span>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Five left</span>
        </button>
      </div>
    </aside>
  );
};

import React, { useState, useRef } from 'react';
import { 
  Zap, 
  Target, 
  Plus, 
  ChevronRight, 
  FolderPlus, 
  Upload, 
  MessageSquarePlus, 
  Search, 
  Filter,
  X,
  ChevronDown,
  CheckCircle2,
  Clock,
  Play
} from 'lucide-react';
import { PersonaType, TimeRangeFilter } from '../types';

interface ConsolePanelProps {
  persona: PersonaType;
  accentColor: string;
  onClose?: () => void;
}

interface GoalItem {
  id: string;
  title: string;
  steps: boolean[];
  status: string;
}

interface AutomationItem {
  id: string;
  name: string;
  trigger: string;
  enabled: boolean;
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({
  persona = 'MAY',
  accentColor = '#ff7a00',
  onClose,
}) => {
  // Memory Search & Filters State
  const [memorySearch, setMemorySearch] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeRangeFilter>('All');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Goals State
  const [goals, setGoals] = useState<GoalItem[]>([
    {
      id: 'g-1',
      title: 'Creating Website clean minimalist...',
      steps: [true, false, false, false, false],
      status: 'JUST SET',
    },
  ]);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  // Automations State
  const [automations, setAutomations] = useState<AutomationItem[]>([
    { id: 'a-1', name: 'Auto-compile neural memory', trigger: 'Every 24 hours', enabled: true },
  ]);
  const [isAddingAutomation, setIsAddingAutomation] = useState(false);
  const [newAutoName, setNewAutoName] = useState('');

  // Active workers toggle
  const [activeWorker, setActiveWorker] = useState<string | null>(null);

  // File upload input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const toggleGoalStep = (goalId: string, stepIndex: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const nextSteps = [...g.steps];
        nextSteps[stepIndex] = !nextSteps[stepIndex];
        const completedCount = nextSteps.filter(Boolean).length;
        const status = completedCount === 5 ? 'COMPLETED' : `${completedCount}/5 DONE`;
        return { ...g, steps: nextSteps, status };
      })
    );
  };

  const handleAddGoal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newGoalTitle.trim()) return;
    setGoals((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title: newGoalTitle.trim(),
        steps: [false, false, false, false, false],
        status: 'JUST SET',
      },
    ]);
    setNewGoalTitle('');
    setIsAddingGoal(false);
  };

  const handleAddAutomation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newAutoName.trim()) return;
    setAutomations((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newAutoName.trim(),
        trigger: 'On user prompt',
        enabled: true,
      },
    ]);
    setNewAutoName('');
    setIsAddingAutomation(false);
  };

  return (
    <aside 
      id="left-console-panel"
      className="w-full h-full flex flex-col justify-between bg-[#08080a] border-r border-[#1a1a24] text-[#e5e1e4] select-none text-xs"
    >
      {persona === 'MAY' ? (
        /* =========================================================================
           MAY CONSOLE VIEW (Activity, Goals, Automations)
           ========================================================================= */
        <div className="flex-1 flex flex-col justify-between overflow-y-auto">
          <div className="p-5 space-y-6">
            {/* Header: ● CONSOLE        ● × */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <span 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: accentColor, boxShadow: `0 0 6px ${accentColor}` }}
                />
                <span className="font-mono text-xs font-bold tracking-[0.22em] text-[#e5e1e4] uppercase">
                  CONSOLE
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span 
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
                <button 
                  onClick={onClose}
                  className="text-zinc-500 hover:text-white transition-colors"
                  title="Close Console"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* 1. ACTIVITY */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#ff7a00] font-mono font-bold tracking-[0.18em] text-[11px] uppercase">
                  <Zap size={13} className="text-[#ff7a00]" />
                  <span>ACTIVITY</span>
                </div>
                <button
                  onClick={() => setActiveWorker(activeWorker ? null : 'Website Architecture Generator')}
                  className="text-[10px] font-mono text-zinc-500 hover:text-[#ff7a00] transition-colors"
                >
                  {activeWorker ? 'Stop Worker' : 'Simulate Worker'}
                </button>
              </div>

              {activeWorker ? (
                <div className="p-2.5 rounded-xl bg-[#14121a] border border-[#ff7a00]/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-white font-medium text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff7a00] animate-ping" />
                    <span className="truncate">{activeWorker}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span>Task: 82% compiled</span>
                    <span className="text-[#ffb68b]">RUNNING</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-zinc-400 pl-0.5 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full border border-zinc-500" />
                  <span>No workers out right now.</span>
                </div>
              )}
            </div>

            {/* 2. GOALS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#ff7a00] font-mono font-bold tracking-[0.18em] text-[11px] uppercase">
                  <Target size={13} className="text-[#ff7a00]" />
                  <span>GOALS</span>
                </div>
                <button 
                  onClick={() => setIsAddingGoal(!isAddingGoal)}
                  title="Add new goal"
                  className="text-[#ff7a00] hover:text-[#ff9d42] transition-colors p-0.5"
                >
                  <Plus size={14} />
                </button>
              </div>

              {isAddingGoal && (
                <form onSubmit={handleAddGoal} className="space-y-2 p-2.5 rounded-xl bg-[#121118] border border-white/10">
                  <input
                    type="text"
                    placeholder="Goal description..."
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    autoFocus
                    className="w-full bg-[#181822] text-xs text-zinc-200 px-2 py-1.5 rounded border border-white/10 focus:outline-none focus:border-[#ff7a00]"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingGoal(false)}
                      className="px-2 py-1 text-[11px] text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-[#ff7a00] text-black font-semibold text-[11px] rounded"
                    >
                      Save Goal
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {goals.map((goal) => (
                  <div key={goal.id} className="space-y-1.5 p-2 rounded-lg bg-[#0e0e14]/60 border border-white/5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white font-medium truncate max-w-[170px]" title={goal.title}>
                        {goal.title}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 tracking-wider uppercase">
                        {goal.status}
                      </span>
                    </div>

                    {/* 5-Step Segmented Progress Bar */}
                    <div className="relative flex items-center justify-between pt-1">
                      <div className="absolute left-1 right-1 h-[1px] bg-zinc-800 -z-0" />
                      {goal.steps.map((isDone, idx) => (
                        <button
                          key={idx}
                          onClick={() => toggleGoalStep(goal.id, idx)}
                          title={`Milestone ${idx + 1}: ${isDone ? 'Completed' : 'Pending'}`}
                          className={`relative z-10 w-2.5 h-2.5 rounded-sm border transition-all ${
                            isDone 
                              ? 'bg-[#ff7a00] border-[#ff7a00] shadow-[0_0_6px_#ff7a00]' 
                              : 'bg-[#0b0b0e] border-zinc-700 hover:border-zinc-500'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. AUTOMATIONS */}
            <div className="space-y-2.5">
              <div 
                onClick={() => setIsAddingAutomation(!isAddingAutomation)}
                className="flex items-center justify-between text-[#ff7a00] font-mono font-bold tracking-[0.18em] text-[11px] uppercase group cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Zap size={13} className="text-[#ff7a00]" />
                  <span>AUTOMATIONS</span>
                </div>
                <ChevronRight size={13} className={`text-[#ff7a00] transform transition-transform ${isAddingAutomation ? 'rotate-90' : ''}`} />
              </div>

              {isAddingAutomation && (
                <form onSubmit={handleAddAutomation} className="space-y-2 p-2.5 rounded-xl bg-[#121118] border border-white/10">
                  <input
                    type="text"
                    placeholder="Automation routine name..."
                    value={newAutoName}
                    onChange={(e) => setNewAutoName(e.target.value)}
                    autoFocus
                    className="w-full bg-[#181822] text-xs text-zinc-200 px-2 py-1.5 rounded border border-white/10 focus:outline-none focus:border-[#ff7a00]"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingAutomation(false)}
                      className="px-2 py-1 text-[11px] text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-[#ff7a00] text-black font-semibold text-[11px] rounded"
                    >
                      Add Routine
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {automations.map((auto) => (
                  <div key={auto.id} className="flex items-center justify-between p-2 rounded-lg bg-[#0e0e14] border border-white/5">
                    <div>
                      <div className="text-white text-xs font-medium">{auto.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{auto.trigger}</div>
                    </div>
                    <button
                      onClick={() => {
                        setAutomations((prev) =>
                          prev.map((a) => (a.id === auto.id ? { ...a, enabled: !a.enabled } : a))
                        );
                      }}
                      className={`w-4 h-4 rounded flex items-center justify-center border text-[9px] transition-colors ${
                        auto.enabled
                          ? 'bg-[#ff7a00] border-[#ff7a00] text-black'
                          : 'border-zinc-700 text-transparent'
                      }`}
                    >
                      ✓
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
           MAY BRAIN EXPLORER VIEW
           ========================================================================= */
        <div className="flex-1 flex flex-col justify-between overflow-y-auto">
          <div className="p-5 space-y-5">
            {/* Search memory input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search memory..."
                value={memorySearch}
                onChange={(e) => setMemorySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#12111a] border border-[#222230] rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500/40 transition-colors"
              />
            </div>

            {/* Filters Accordion */}
            <div className="space-y-1">
              <button 
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="flex items-center gap-2 text-zinc-400 hover:text-white text-xs transition-colors"
              >
                <ChevronDown size={13} className={`transform transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
                <Filter size={12} />
                <span>Filters</span>
              </button>
            </div>

            {/* What's stored tags */}
            <div className="space-y-2">
              <span className="text-zinc-400 font-medium text-xs">What's stored</span>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#181628] border border-purple-500/30 text-purple-200 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Memories <span className="text-purple-300 font-mono">1</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#181822] border border-white/5 text-zinc-300 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                  Goals <span className="text-zinc-400 font-mono">{goals.length}</span>
                </span>
              </div>
            </div>

            {/* When Timeline Scrubber */}
            <div className="space-y-2">
              <span className="text-zinc-400 font-medium text-xs">When</span>
              <div className="h-10 w-full bg-[#12111c] border border-cyan-500/30 rounded-lg relative overflow-hidden flex items-center px-3">
                <div className="w-full border-t border-dashed border-cyan-500/40" />
                <div className="absolute right-12 top-1 bottom-1 w-2 rounded bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                <span>Active Session</span>
                <div className="flex items-center gap-1.5 text-zinc-400">
                  {(['24h', '7d', '30d', 'All'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTimeFilter(t)}
                      className={`hover:text-white ${timeFilter === t ? 'text-cyan-400 font-bold' : ''}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* About Goal */}
            <div className="space-y-1.5">
              <span className="text-zinc-400 font-medium text-xs">About</span>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#141220] border border-white/5 text-xs text-zinc-300">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-1.5 h-1.5 rounded-full border border-purple-400" />
                  <span className="truncate">{goals[0]?.title || 'System initialized'}</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-500 ml-1">{goals.length}</span>
              </div>
            </div>

            {/* File Explorer */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="font-medium text-xs">File Explorer</span>
                <FolderPlus size={13} className="text-zinc-500 hover:text-white cursor-pointer" />
              </div>
              <p className="text-zinc-500 text-xs">
                Nothing here yet — upload documents or scripts for May.
              </p>
            </div>

            {/* Give May something */}
            <div className="space-y-2 pt-1">
              <span className="text-zinc-400 font-medium text-xs">Give May something</span>
              <div className="space-y-1.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      alert(`Uploaded ${e.target.files[0].name} to May's neural file memory.`);
                    }
                  }}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[#141220] hover:bg-[#1e1c30] border border-white/5 text-xs text-zinc-300 transition-colors"
                >
                  <Upload size={13} />
                  <span>Upload files & folders</span>
                </button>
                <button 
                  onClick={() => setIsAddingGoal(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[#141220] hover:bg-[#1e1c30] border border-white/5 text-xs text-zinc-300 transition-colors"
                >
                  <MessageSquarePlus size={13} />
                  <span>Add note or goal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

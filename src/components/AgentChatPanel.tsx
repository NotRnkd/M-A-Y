import React, { useState, useRef, useEffect } from 'react';
import { 
  RotateCcw, 
  ExternalLink, 
  MoreHorizontal, 
  X, 
  Plus, 
  ArrowUp, 
  Monitor, 
  Mic, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { PersonaType, ChatMessage } from '../types';

interface AgentChatPanelProps {
  persona: PersonaType;
  accentColor: string;
  onClose?: () => void;
  onVoiceTrigger?: () => void;
  isVoiceActive?: boolean;
}

export const AgentChatPanel: React.FC<AgentChatPanelProps> = ({
  persona,
  accentColor,
  onClose,
  onVoiceTrigger,
  isVoiceActive = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Zoey chat seed matching Screenshot 3
  const [zoeyMessages, setZoeyMessages] = useState<ChatMessage[]>([
    {
      id: 'z-1',
      sender: 'user',
      agentName: 'You',
      text: 'hello',
      timestamp: '22 hours ago',
      avatarLetter: 'J',
    },
    {
      id: 'z-2',
      sender: 'agent',
      agentName: 'Zoey',
      text: "Hey there! I'm Zoey, your companion. I'm here to help you build those clean, minimalist websites you're working toward—whether that's design, content, strategy, or the whole workflow.\n\nWhat's on your mind right now?",
      timestamp: '22 hours ago',
      avatarLetter: 'Z',
    },
    {
      id: 'z-3',
      sender: 'user',
      agentName: 'You',
      text: 'Hello.',
      timestamp: '22 hours ago',
      avatarLetter: 'J',
    },
    {
      id: 'z-4',
      sender: 'agent',
      agentName: 'Zoey',
      text: "Hey, how's it going? What can I help you with?",
      timestamp: '22 hours ago',
      avatarLetter: 'Z',
    },
    {
      id: 'z-5',
      sender: 'user',
      agentName: 'You',
      text: 'Open YouTube.',
      timestamp: '22 hours ago',
      avatarLetter: 'J',
    },
    {
      id: 'z-6',
      sender: 'agent',
      agentName: 'Zoey',
      text: "I'll open YouTube for you.\n\nA card's waiting on your screen, just allow it there and I'll open YouTube for you.",
      timestamp: '22 hours ago',
      avatarLetter: 'Z',
    },
    {
      id: 'z-7',
      sender: 'user',
      agentName: 'You',
      text: 'Open game.',
      timestamp: '22 hours ago',
      avatarLetter: 'J',
    },
  ]);

  // May chat seed (initially empty terminal ready state as in Screenshot 5)
  const [mayMessages, setMayMessages] = useState<ChatMessage[]>([]);

  const activeMessages = persona === 'MAY' ? mayMessages : zoeyMessages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      agentName: 'You',
      text,
      timestamp: 'Just now',
      avatarLetter: 'J',
    };

    if (persona === 'MAY') {
      setMayMessages((prev) => [...prev, userMsg]);
    } else {
      setZoeyMessages((prev) => [...prev, userMsg]);
    }

    setInputText('');
    setIsTyping(true);

    // Dynamic simulated response
    setTimeout(() => {
      let replyText = '';
      if (persona === 'MAY') {
        if (text.toLowerCase().includes('workflow') || text.toLowerCase().includes('run')) {
          replyText = `Synthesizing neural execution pipeline for "${text}". Allocating 4 background micro-workers and syncing telemetry.`;
        } else if (text.toLowerCase().includes('sphere') || text.toLowerCase().includes('fibonacci')) {
          replyText = `The 3D Fibonacci particle cloud is computing at 60 FPS using golden-angle distribution (137.5°), dynamic radial bloom, and harmonic deformation.`;
        } else {
          replyText = `Command received. Orchestrating sub-routines and streaming telemetry updates to the console panel.`;
        }
      } else {
        if (text.toLowerCase().includes('memory') || text.toLowerCase().includes('brain')) {
          replyText = `I have logged that into your constellation under active memory nodes. You can inspect the orbit in the Brain view anytime!`;
        } else {
          replyText = `Got it! I've updated your workspace context. Let me know if you want me to preview the changes or launch additional tools.`;
        }
      }

      const agentMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        agentName: persona === 'MAY' ? 'May' : 'Zoey',
        text: replyText,
        timestamp: 'Just now',
        avatarLetter: persona === 'MAY' ? 'M' : 'Z',
      };

      if (persona === 'MAY') {
        setMayMessages((prev) => [...prev, agentMsg]);
      } else {
        setZoeyMessages((prev) => [...prev, agentMsg]);
      }
      setIsTyping(false);
    }, 900);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <aside 
      id="right-chat-panel"
      className="w-full h-full flex flex-col justify-between bg-[#0d0d12]/95 backdrop-blur-xl border-l border-white/5 text-[#e5e1e4] select-none"
    >
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5 bg-[#0e0e13]/60">
        <div className="flex items-center gap-2">
          <span 
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
          />
          <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#ffb68b] uppercase">
            {persona}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-zinc-500">
          <button 
            title="Refresh feed"
            onClick={() => {
              if (persona === 'MAY') setMayMessages([]);
            }}
            className="hover:text-white p-1 transition-colors"
          >
            <RotateCcw size={13} />
          </button>
          <button title="Pop out" className="hover:text-white p-1 transition-colors">
            <ExternalLink size={13} />
          </button>
          <button title="More options" className="hover:text-white p-1 transition-colors">
            <MoreHorizontal size={13} />
          </button>
          <button 
            onClick={onClose} 
            title="Close" 
            className="hover:text-white p-1 transition-colors ml-1"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* ================= CHAT FEED / TERMINAL READY ================= */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {persona === 'MAY' && mayMessages.length === 0 ? (
          /* Empty state terminal matching Screenshot 5 */
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-10 h-10 rounded-full bg-[#1e1a14] border border-[#ff7a00]/30 flex items-center justify-center text-[#ff7a00] mb-3 shadow-[0_0_16px_rgba(255,122,0,0.15)]">
              <MessageSquare size={16} />
            </div>
            <h3 className="font-mono text-xs font-bold tracking-[0.18em] text-white uppercase mb-2">
              MAY TERMINAL READY
            </h3>
            <p className="text-xs text-zinc-400 font-mono max-w-[260px] leading-relaxed">
              Ask May to run workflows, manage goals, launch applications, or orchestrate tools.
            </p>

            {/* Suggested quick actions */}
            <div className="flex flex-wrap gap-1.5 justify-center mt-6">
              {['Launch workflow', 'Inspect Fibonacci cloud', 'Open YouTube'].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-2.5 py-1 rounded-full bg-[#181622] hover:bg-[#252233] border border-white/5 text-[11px] font-mono text-zinc-300 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Conversational Messages */
          <div className="space-y-4 pt-1">
            {activeMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {msg.sender === 'user' ? (
                  /* User Message Bubble */
                  <div className="flex items-end gap-2 max-w-[85%]">
                    <div className="px-3.5 py-2 rounded-xl bg-[#1d1c2b] text-zinc-200 text-xs leading-relaxed border border-white/5">
                      {msg.text}
                    </div>
                    <div className="w-5 h-5 rounded-full bg-zinc-800 text-[10px] text-zinc-300 font-mono flex items-center justify-center">
                      {msg.avatarLetter || 'J'}
                    </div>
                  </div>
                ) : (
                  /* Agent Message Bubble */
                  <div className="flex items-start gap-2 max-w-[90%]">
                    <div 
                      className="w-5 h-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5"
                      style={{ 
                        backgroundColor: persona === 'MAY' ? 'rgba(255, 122, 0, 0.2)' : 'rgba(138, 43, 226, 0.25)',
                        color: accentColor,
                        border: `1px solid ${accentColor}40`
                      }}
                    >
                      {msg.avatarLetter || (persona === 'MAY' ? 'M' : 'Z')}
                    </div>
                    <div className="space-y-1">
                      <div className="px-3.5 py-2.5 rounded-xl bg-[#14131d] text-zinc-200 text-xs leading-relaxed border border-white/5 whitespace-pre-line">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                )}
                <span className="text-[10px] font-mono text-zinc-500 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono pl-1">
                <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: accentColor }} />
                <span>{persona} is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ================= FOOTER & CHAT INPUT ================= */}
      <div className="p-3 border-t border-white/5 bg-[#0e0e13]/80 space-y-2">
        <div className="relative flex items-center gap-2">
          {/* Plus trigger button */}
          <button 
            title="Attach or execute tool"
            className="w-8 h-8 rounded-lg bg-[#181624] hover:bg-[#252236] border border-white/5 text-zinc-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
          >
            <Plus size={14} />
          </button>

          {/* Input pill */}
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              placeholder={`Message ${persona === 'MAY' ? 'May' : 'Zoey'}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-3 pr-9 py-2 bg-[#171622] border border-white/5 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500/40 transition-colors"
            />
            {inputText.trim() && (
              <button
                onClick={() => handleSendMessage()}
                title="Send message"
                className="absolute right-2 p-1 rounded-md text-white hover:scale-105 transition-transform"
                style={{ backgroundColor: accentColor }}
              >
                <ArrowUp size={13} />
              </button>
            )}
          </div>

          {/* Show desktop button (Zoey mode, Screenshot 3) */}
          {persona === 'ZOEY' && (
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#181624] hover:bg-[#252236] border border-white/5 text-[11px] font-mono text-zinc-300 transition-colors whitespace-nowrap shrink-0">
              <Monitor size={12} />
              <span className="hidden sm:inline">Show desktop</span>
            </button>
          )}
        </div>

        {/* Status sub-label (Screenshot 5) */}
        <div className="flex items-center justify-end gap-2 text-[10px] font-mono text-zinc-500 pr-1">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
          <span className="tracking-wider uppercase text-zinc-400 font-semibold">ACTIONS AUTO</span>
          <span>v2.0.0</span>
        </div>
      </div>
    </aside>
  );
};

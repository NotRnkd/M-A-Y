import React, { useState, useRef, useEffect } from 'react';
import { 
  RotateCcw, 
  ExternalLink, 
  X, 
  Plus, 
  ArrowUp, 
  Mic, 
  ChevronDown,
  Sparkles,
  Code,
  Compass,
  Cpu,
  Volume2,
  VolumeX,
  Radio
} from 'lucide-react';
import { PersonaType, ChatMessage } from '../types';

interface AgentChatPanelProps {
  persona: PersonaType;
  accentColor: string;
  onClose?: () => void;
  onVoiceTrigger?: () => void;
  isVoiceActive?: boolean;
  onMaySpeak?: (text: string) => void;
  isMaySpeaking?: boolean;
  configuredModel?: string;
}

export const AgentChatPanel: React.FC<AgentChatPanelProps> = ({
  persona = 'MAY',
  accentColor = '#ff7a00',
  onClose,
  onVoiceTrigger,
  isVoiceActive = false,
  onMaySpeak,
  isMaySpeaking = false,
  configuredModel = 'deepseek/deepseek-r1:free',
}) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [actionsMode, setActionsMode] = useState<'AUTO' | 'MANUAL' | 'DIRECT'>('AUTO');
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Fresh, clean chat history with no prior messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const generateMayResponse = (input: string) => {
    const lower = input.toLowerCase();
    if (lower.includes('website') || lower.includes('build') || lower.includes('create')) {
      return "I'm orchestrating the website scaffolding for you now. I'll maintain a clean, minimal design aesthetic with high contrast and zero friction. Would you like me to focus on copy, layout, or backend integration first?";
    }
    if (lower.includes('youtube')) {
      return "Opening YouTube for you now. A direct authorization card has been registered.";
    }
    if (lower.includes('game') || lower.includes('app')) {
      return "I've routed the application request. Once approved in your system permissions, it will launch automatically.";
    }
    if (lower.includes('hello') || lower.includes('hey') || lower.includes('hi')) {
      return "Hey there! I'm May. I'm ready to help you orchestrate websites, automate workflows, or manage your neural memory. What shall we tackle?";
    }
    if (lower.includes('who are you') || lower.includes('what can you do')) {
      return "I am May, an autonomous synthetic intelligence operating system. I assist with website engineering, digital strategy, audio orchestration, and autonomous execution.";
    }
    return `Understood: "${input}". I have dispatched workers to orchestrate this task across the system telemetry. Everything is running cleanly.`;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      agentName: 'You',
      text,
      timestamp: 'Just now',
      avatarLetter: 'J',
      isVoice: isVoiceActive,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!textToSend) setInputText('');
    setShowQuickActions(false);
    setIsTyping(true);

    try {
      // Send chat context to the full-stack server endpoint (which uses OpenRouter from openrouter.config.json, or Gemini)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
        }),
      });

      let reply = '';
      if (res.ok) {
        const data = await res.json();
        reply = data.reply || generateMayResponse(text);
      } else {
        reply = generateMayResponse(text);
      }

      const agentMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        agentName: 'May',
        text: reply,
        timestamp: 'Just now',
        avatarLetter: 'M',
        isVoice: isVoiceActive,
      };

      setMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);

      // Pulse the orb and speak the reply
      if (speechEnabled && onMaySpeak) {
        onMaySpeak(reply);
      }
    } catch (err) {
      console.warn('Chat request fallback:', err);
      const reply = generateMayResponse(text);
      const agentMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        agentName: 'May',
        text: reply,
        timestamp: 'Just now',
        avatarLetter: 'M',
        isVoice: isVoiceActive,
      };

      setMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);

      if (speechEnabled && onMaySpeak) {
        onMaySpeak(reply);
      }
    }
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
      className="w-full h-full flex flex-col justify-between bg-[#08080a] border-l border-[#1a1a24] text-[#e5e1e4] select-none"
    >
      {/* ================= HEADER (● MAY   ↻ ⤢ ● ×) ================= */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#14141e] bg-[#08080a]">
        <div className="flex items-center gap-2 min-w-0">
          <span 
            className={`w-2 h-2 rounded-full transition-all ${isMaySpeaking ? 'animate-ping' : ''}`}
            style={{ backgroundColor: accentColor, boxShadow: `0 0 6px ${accentColor}` }}
          />
          <span className="font-mono text-xs font-bold tracking-[0.22em] text-[#e5e1e4] uppercase shrink-0">
            MAY
          </span>
          {isMaySpeaking && (
            <span className="text-[10px] font-mono text-[#ffb68b] px-1.5 py-0.5 rounded bg-[#2b180d] border border-[#ff7a00]/30 animate-pulse truncate">
              Speaking
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-zinc-500">
          <button 
            title={speechEnabled ? 'May Voice Output is On (Click to Mute)' : 'May Voice Output is Muted (Click to Unmute)'}
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className={`p-1 transition-colors ${speechEnabled ? 'text-zinc-300 hover:text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            {speechEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>
          <button 
            title="Reset history"
            onClick={() => setMessages([])}
            className="hover:text-white p-1 transition-colors"
          >
            <RotateCcw size={13} />
          </button>
          <button 
            title="Toggle Voice"
            onClick={onVoiceTrigger}
            className={`p-1 transition-colors ${isVoiceActive ? 'text-[#ff7a00]' : 'hover:text-white'}`}
          >
            <Mic size={13} />
          </button>
          {/* Status dot */}
          <span 
            className="w-1.5 h-1.5 rounded-full" 
            style={{ backgroundColor: accentColor }}
          />
          <button 
            onClick={onClose} 
            title="Close" 
            className="hover:text-white p-1 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Model config sub-header */}
      <div className="flex items-center justify-between px-5 py-1.5 bg-[#0e0e14] border-b border-[#161622] text-[10px] font-mono text-zinc-400">
        <div className="flex items-center gap-1.5 truncate max-w-[280px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-zinc-500">Model:</span>
          <span className="text-zinc-300 truncate" title={configuredModel}>
            {configuredModel}
          </span>
        </div>
        <span className="text-zinc-600 tracking-wider uppercase text-[9px]">
          openrouter.config.json
        </span>
      </div>

      {/* ================= CHAT FEED ================= */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-zinc-500">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-bold text-lg"
              style={{
                backgroundColor: 'rgba(255, 122, 0, 0.1)',
                border: `1px solid ${accentColor}40`,
                color: accentColor,
              }}
            >
              M
            </div>
            <div className="space-y-1">
              <h3 className="text-white text-sm font-medium tracking-wide">May is ready</h3>
              <p className="text-xs text-zinc-500 font-mono">
                Ask to build websites, configure strategy, or orchestrate tools.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full pt-2">
              {[
                'Build clean minimalist website',
                'Analyze system strategy',
                'Open automations manager',
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(suggestion)}
                  className="px-3 py-2 rounded-xl bg-[#121118] hover:bg-[#181822] border border-white/5 hover:border-white/10 text-xs text-zinc-400 hover:text-white text-left transition-colors font-mono"
                >
                  › {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              {msg.sender === 'user' ? (
                /* User Bubble */
                <div className="flex flex-col items-end gap-1 max-w-[90%]">
                  <div className="flex items-center gap-2">
                    <div className="px-4 py-2 rounded-xl bg-[#14141c] text-white text-sm font-normal border border-[#222230]">
                      {msg.text}
                    </div>
                    <div className="w-5 h-5 rounded-md bg-[#121218] border border-[#222230] text-[10px] text-zinc-400 font-mono flex items-center justify-center shrink-0">
                      {msg.avatarLetter || 'J'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-500 pr-7">
                    {msg.isVoice && <Mic size={10} className="text-[#ff7a00]" />}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>
              ) : (
                /* May Bubble */
                <div className="flex flex-col items-start gap-1 max-w-[95%]">
                  <div className="flex items-start gap-2.5">
                    <div 
                      className="w-5 h-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5"
                      style={{ 
                        backgroundColor: 'rgba(255, 122, 0, 0.15)',
                        color: accentColor,
                        border: `1px solid ${accentColor}50`
                      }}
                    >
                      M
                    </div>
                    <div className="text-zinc-200 text-sm leading-relaxed whitespace-pre-line font-sans">
                      {msg.text}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-500 pl-7">
                    {msg.isVoice && <Mic size={10} className="text-[#ff7a00]" />}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {isTyping && (
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono pl-7">
            <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: accentColor }} />
            <span>May is responding...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ================= FOOTER ================= */}
      <div className="p-4 border-t border-[#14141e] bg-[#08080a] space-y-2 relative">
        {/* Quick action popup */}
        {showQuickActions && (
          <div className="absolute bottom-16 left-4 right-4 p-2 bg-[#121118] border border-white/10 rounded-xl shadow-2xl z-40 space-y-1">
            <div className="text-[10px] font-mono text-zinc-500 px-2 py-1 uppercase tracking-wider">Quick Actions</div>
            <button
              onClick={() => handleSendMessage('Build clean minimalist website')}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-white/5"
            >
              <Code size={13} className="text-[#ff7a00]" />
              <span>Build Minimalist Website</span>
            </button>
            <button
              onClick={() => handleSendMessage('Run strategy and performance audit')}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-white/5"
            >
              <Compass size={13} className="text-[#ff7a00]" />
              <span>Strategy & Audit</span>
            </button>
            <button
              onClick={() => handleSendMessage('Check autonomous worker telemetry')}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-white/5"
            >
              <Cpu size={13} className="text-[#ff7a00]" />
              <span>Worker Telemetry</span>
            </button>
          </div>
        )}

        <div className="relative flex items-center bg-[#111117] border border-[#222230] rounded-xl px-3 py-2">
          {/* Plus icon */}
          <button 
            title="Quick actions & tools"
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="text-zinc-500 hover:text-white transition-colors mr-2 shrink-0"
          >
            <Plus size={16} />
          </button>

          {/* Input field */}
          <input
            type="text"
            placeholder="Message May..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none font-sans"
          />

          {/* Circular send arrow */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            title="Send message"
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shrink-0 ${
              inputText.trim()
                ? 'bg-[#ff7a00] text-black shadow-md hover:scale-105'
                : 'bg-[#181822] text-zinc-600'
            }`}
          >
            <ArrowUp size={13} />
          </button>
        </div>

        {/* Bottom status line: ● ACTIONS AUTO ˅   v2.0.0 */}
        <div className="flex items-center justify-end gap-3 text-[11px] font-mono pt-1 relative">
          <div 
            onClick={() => setShowActionsDropdown(!showActionsDropdown)}
            className="flex items-center gap-1.5 cursor-pointer text-[#ff7a00] hover:text-[#ff9a3c] transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff7a00]" />
            <span className="font-bold tracking-wider uppercase text-[10px]">ACTIONS {actionsMode}</span>
            <ChevronDown size={11} />
          </div>

          {showActionsDropdown && (
            <div className="absolute right-12 bottom-6 bg-[#121118] border border-white/10 rounded-lg p-1 shadow-xl z-50 text-[11px] font-mono">
              {(['AUTO', 'MANUAL', 'DIRECT'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setActionsMode(mode);
                    setShowActionsDropdown(false);
                  }}
                  className={`block w-full text-left px-3 py-1 rounded hover:bg-white/5 ${actionsMode === mode ? 'text-[#ff7a00]' : 'text-zinc-400'}`}
                >
                  ACTIONS {mode}
                </button>
              ))}
            </div>
          )}

          <span className="text-zinc-600 text-[10px]">v2.0.0</span>
        </div>
      </div>
    </aside>
  );
};

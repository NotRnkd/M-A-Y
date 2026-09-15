import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceActivityProps {
  isActive: boolean;
  onToggle: () => void;
  accentColor: string;
  personaName: string;
}

export const VoiceActivityOverlay: React.FC<VoiceActivityProps> = ({
  isActive,
  onToggle,
  accentColor,
  personaName,
}) => {
  const [frequencies, setFrequencies] = useState<number[]>([12, 28, 45, 60, 35, 18, 50, 75, 40, 20]);

  // Animate audio waveform when voice mode is active
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setFrequencies(
        Array.from({ length: 14 }, () => Math.floor(Math.random() * 65) + 15)
      );
    }, 90);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="flex flex-col items-center">
      {/* Top Floating Pill Trigger (Matching Screenshots 3 & 5) */}
      <button
        id="spacebar-voice-pill"
        onClick={onToggle}
        className={`group flex items-center gap-2.5 px-5 py-2 rounded-full border transition-all shadow-lg backdrop-blur-md ${
          isActive
            ? 'bg-[#1e1710]/95 border-[#ff7a00] text-white shadow-[0_0_24px_rgba(255,122,0,0.35)]'
            : 'bg-[#101015]/80 hover:bg-[#181822] border-white/10 hover:border-white/20 text-zinc-300'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full transition-all ${
            isActive ? 'animate-ping' : ''
          }`}
          style={{ backgroundColor: accentColor, boxShadow: `0 0 10px ${accentColor}` }}
        />
        <span className="font-mono text-xs font-bold tracking-[0.18em] text-[#ffb68b] uppercase">
          {isActive ? 'LISTENING...' : 'SPACEBAR FOR VOICE'}
        </span>
      </button>

      {/* Floating Audio Waveform when active */}
      {isActive && (
        <div className="mt-3 flex items-center gap-1 px-4 py-1.5 rounded-full bg-[#121118]/90 border border-white/10 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          <Mic size={13} style={{ color: accentColor }} />
          <div className="flex items-center gap-1 h-6 px-2">
            {frequencies.map((h, i) => (
              <div
                key={i}
                className="w-1 rounded-full transition-all duration-75"
                style={{
                  height: `${h}%`,
                  backgroundColor: accentColor,
                  opacity: 0.7 + (h / 100) * 0.3,
                }}
              />
            ))}
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            {personaName} Neural Audio
          </span>
        </div>
      )}
    </div>
  );
};

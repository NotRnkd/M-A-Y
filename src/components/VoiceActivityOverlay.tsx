import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceActivityProps {
  isActive: boolean;
  onToggle: () => void;
  accentColor: string;
  personaName: string;
  isSpeaking?: boolean;
  onStopSpeaking?: () => void;
}

export const VoiceActivityOverlay: React.FC<VoiceActivityProps> = ({
  isActive,
  onToggle,
  accentColor,
  personaName,
  isSpeaking = false,
  onStopSpeaking,
}) => {
  const [frequencies, setFrequencies] = useState<number[]>([12, 28, 45, 60, 35, 18, 50, 75, 40, 20]);

  // Animate audio waveform when voice mode or speech is active
  useEffect(() => {
    if (!isActive && !isSpeaking) return;

    const interval = setInterval(() => {
      setFrequencies(
        Array.from({ length: 14 }, () => Math.floor(Math.random() * 65) + 15)
      );
    }, 85);

    return () => clearInterval(interval);
  }, [isActive, isSpeaking]);

  const showWaveform = isActive || isSpeaking;

  return (
    <div className="flex flex-col items-center">
      {/* Top Floating Pill Indicator */}
      <div
        id="spacebar-voice-pill"
        onClick={isActive ? onToggle : isSpeaking ? onStopSpeaking : undefined}
        className={`group flex items-center gap-2.5 px-5 py-2 rounded-full border transition-all shadow-lg backdrop-blur-md select-none ${
          isSpeaking
            ? 'bg-[#22160d]/95 border-[#ff7a00] text-white shadow-[0_0_28px_rgba(255,122,0,0.45)] cursor-pointer'
            : isActive
            ? 'bg-[#1e1710]/95 border-[#ff7a00] text-white shadow-[0_0_24px_rgba(255,122,0,0.35)] cursor-pointer'
            : 'bg-[#101015]/80 border-white/10 text-zinc-300 cursor-default'
        }`}
        title={
          isSpeaking
            ? 'May is speaking (click to stop)'
            : isActive
            ? 'Click to stop listening'
            : 'Press Spacebar on your keyboard to speak'
        }
      >
        <span
          className={`w-2 h-2 rounded-full transition-all ${
            isActive || isSpeaking ? 'animate-ping' : ''
          }`}
          style={{ backgroundColor: accentColor, boxShadow: `0 0 10px ${accentColor}` }}
        />
        <span className="font-mono text-xs font-bold tracking-[0.18em] text-[#ffb68b] uppercase">
          {isSpeaking ? 'MAY IS SPEAKING...' : isActive ? 'LISTENING...' : 'SPACEBAR FOR VOICE'}
        </span>
      </div>

      {/* Floating Audio Waveform when active or speaking with smooth transition */}
      <AnimatePresence>
        {showWaveform && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -6 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="mt-3 flex items-center gap-1 px-4 py-1.5 rounded-full bg-[#121118]/90 border border-white/10 backdrop-blur-md shadow-lg"
          >
            {isSpeaking ? (
              <Volume2 size={13} style={{ color: accentColor }} />
            ) : (
              <Mic size={13} style={{ color: accentColor }} />
            )}
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
              {isSpeaking ? `${personaName} Voice Output` : `${personaName} Neural Audio`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

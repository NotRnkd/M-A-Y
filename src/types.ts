export type PersonaType = 'MAY' | 'ZOEY';

export type CenterViewMode = 'SPHERE' | 'BRAIN';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  agentName: string;
  text: string;
  timestamp: string;
  statusBadge?: string;
  avatarLetter?: string;
}

export interface MemoryNode {
  id: string;
  label: string;
  type: 'topic' | 'conversation' | 'memory' | 'goal';
  orbitRadius: number;
  orbitAngle: number;
  orbitSpeed: number;
  tilt: number;
  color?: string;
  description?: string;
  date?: string;
}

export type SettingsTab = 
  | 'account'
  | 'persona'
  | 'preferences'
  | 'machine'
  | 'channels'
  | 'plans'
  | 'credits';

export type IdentitySubTab = 'IDENTITY' | 'SKILLS' | 'VOICE' | 'ABILITIES';

export interface ThemeConfig {
  hue: number; // 0 to 360
  hex: string;
  secondaryHex: string;
  glowHex: string;
}

export type SpeakerId = "player" | "unknown" | "ally_guide" | "enemy_void";
export type Emotion = "neutral" | "angry" | "shocked" | "glitch" | "happy";

export interface DialogueLine {
  speakerId: SpeakerId;
  text: string;
  emotion: Emotion;
  voiceSfx?: string;
}

export interface Cutscene {
  id: string;
  backgroundId: string;
  dialogues: DialogueLine[];
  musicTrack?: string;
  nextLevelId?: number; // Force le passage a un niveau precis apres
}

export interface StoryManifest {
  gameTitle: string;
  version: string;
  characters: Record<
    SpeakerId,
    {
      name: string;
      color: string;
      spriteKey: string; // Pour afficher l'image correspondante
    }
  >;
  cutscenes: Record<string, Cutscene>;
  levelEvents: Record<
    number,
    {
      introCutsceneId?: string;
      outroCutsceneId?: string;
    }
  >;
}

export const ROOM_MIN_SIZE = 6;
export const ROOM_MAX_SIZE = 12;
export const MAX_ROOMS = 15;

export type RoomType =
  | "normal"
  | "spawn"
  | "exit"
  | "storage"
  | "library"
  | "arena"
  | "garden"
  | "shrine";

export interface Room {
  x: number;
  y: number;
  w: number;
  h: number;
  roomType?: RoomType; // Ajout pour le Level Design avancé
}

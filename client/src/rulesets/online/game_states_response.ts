import Room from "src/online/room/Room";

export default interface ResponseGameStates {
  room: Room | null;
  activeChessHost: number;
}

export interface ResponseChessPos {
  row: number;
  col: number;
}

export interface ResponseGameStateTimer {
  gameTime: number;
  stepTime: number;
}

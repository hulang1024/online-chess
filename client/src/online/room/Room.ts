import GameState from "../play/GameState";
import User from "../user/User";

export default class Room {
    id: number;
    name: string;
    roomSettings: RoomSettings;
    locked?: boolean;
    password?: string;
    status: number;
    channelId: number;
    owner: User;
    userCount: number;
    gameStatus: GameState;
    gameCount: number;
    redChessUser: User;
    blackChessUser: User;
    redReadied: boolean;
    blackReadied: boolean;
    redOnline: boolean;
    blackOnline: boolean;
    spectatorCount: number;
}

class RoomSettings {
  gameDuration: number;
  stepDuration: number;
  secondsCountdown: number;
}
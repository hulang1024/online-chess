import GameState from "../play/GameState";
import User from "../../user/User";
import { RoomSettings } from "./RoomSettings";
import APIGameUser from "../play/APIGameUser";

export default class Room {
  id: number;

  name: string;

  gameType: number;

  roomSettings: RoomSettings;

  locked?: boolean;

  password?: string;

  status: number;

  offlineAt: string | null;

  channelId: number;

  owner: User;

  gameStatus: GameState;

  gameCount: number;

  gameUsers: APIGameUser[];

  spectatorCount: number;
}

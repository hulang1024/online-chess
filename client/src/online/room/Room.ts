import GameState from "../play/GameState";
import User from "../../user/User";
import { RoomSettings } from "./RoomSettings";

export default class Room {
  id: number;

  name: string;

  roomSettings: RoomSettings;

  locked?: boolean;

  password?: string;

  status: number;

  offlineAt: string | null;

  channelId: number;

  owner: User;

  userCount: number;

  gameStatus: GameState;

  gameCount: number;

  redChessUser: User | null;

  blackChessUser: User | null;

  redReadied: boolean;

  blackReadied: boolean;

  redOnline: boolean;

  blackOnline: boolean;

  redUserStatus: number;

  blackUserStatus: number;

  spectatorCount: number;
}

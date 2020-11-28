import User from "../../user/User";
import GameState from "../play/GameState";

export default class Room {
    id: number;
    name: string;
    locked?: boolean;
    password?: string;
    status: number;
    channelId: number;
    owner: User;
    userCount: number;
    gameStatus: GameState;
    redChessUser: User;
    blackChessUser: User;
    redReadied: boolean;
    blackReadied: boolean;
    redOnline: boolean;
    blackOnline: boolean;
    spectatorCount: number;
}
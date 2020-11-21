import User from "../../user/User";
import UserGameState from "./UserGameState";

export default class Room {
    id: number;
    name: string;
    locked?: boolean;
    password?: string;
    status: number;
    channelId: number;
    owner: User;
    userCount: number;
    redChessUser: User;
    redGameState: UserGameState;
    blackChessUser: User;
    blackGameState: UserGameState;
    spectatorCount: number;
}
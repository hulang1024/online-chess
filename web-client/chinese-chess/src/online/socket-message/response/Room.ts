import RoomUser from "./RoomUser";

export default class Room {
    id: number;
    name: string;
    locked?: boolean;
    password?: string;
    status: number;
    channelId: number;
    userCount: number;
    users: Array<RoomUser>;
    spectatorCount: number;
    spectators: Array<RoomUser>;
}
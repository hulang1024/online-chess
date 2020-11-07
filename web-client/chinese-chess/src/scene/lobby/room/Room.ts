import RoomPlayer from "../RoomPlayer";

export default class Room {
    id: number;
    name: string;
    locked?: boolean;
    password?: string;
    status: number;
    playerCount: number;
    players: Array<RoomPlayer>;
}
import RoomPlayer from "./RoomPlayer";

export default class Room {
    id: number;
    name: string;
    status: number;
    playerCount: number;
    players: Array<RoomPlayer>;
}
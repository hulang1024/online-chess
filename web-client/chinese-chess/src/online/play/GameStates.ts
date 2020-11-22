import Room from "../room/Room";

export default interface GameStates {
    room: Room;
    chesses: Array<any>;
    activeChessHost: number;
    actionStack: Array<any>;
}
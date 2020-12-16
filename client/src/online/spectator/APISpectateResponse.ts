import ResponseGameStates from "../play/game_states_response";
import Room from "../room/Room";

export default class SpectateResponse {
  code: number;

  room: Room;

  states: ResponseGameStates;

  targetUserId: number;
}

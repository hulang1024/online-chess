import ResponseGameStates from "../play/game_states_response";

export default interface SpectateResponse {
  code: number;

  states: ResponseGameStates;

  targetUserId: number;
}

import ServerMsg from "../ws/ServerMsg";
import ResponseGameStates from "../../rulesets/game_states_response";

export interface ResultsReadyMsg extends ServerMsg {
  uid: number;
  ready: boolean;
}

export interface GameStartedMsg extends ServerMsg {
  redChessUid: number;
  blackChessUid: number;
}

export interface GameOverMsg extends ServerMsg {
  winUserId: number;
  timeout: boolean;
}

export interface ConfirmRequestMsg extends ServerMsg {
  reqType: number;
  uid: number;
}

export interface ConfirmResponseMsg extends ServerMsg {
  reqType: number;
  uid: number;
  ok: boolean
}

export interface GameContinueResponseMsg extends ServerMsg {
  uid: number;
  ok: boolean;
}

export interface GameStatesMsg extends ServerMsg {
  states: ResponseGameStates
}

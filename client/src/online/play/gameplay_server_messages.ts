import ServerMsg from "../ws/ServerMsg";
import ResponseGameStates from "../../rulesets/online/game_states_response";

export interface ResultsReadyMsg extends ServerMsg {
  uid: number;
  ready: boolean;
}

export interface GameStartedMsg extends ServerMsg {
  userHosts: {
    uid: number;
    chess: number;
  }[];
  initialStates: unknown;
}

export interface GameOverMsg extends ServerMsg {
  winHost: number;
  cause: number;
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

export interface ChatStatusInGameMsg extends ServerMsg {
  uid: number;
  typing: boolean;
}

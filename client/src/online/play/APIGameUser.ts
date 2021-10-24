import { ResponseGameStateTimer } from "src/rulesets/online/game_states_response";
import User from "src/user/User";

export default interface APIGameUser {
  user: User | null;

  status: number;

  online: boolean;

  ready: boolean;

  chess: number;

  timer: ResponseGameStateTimer;

  roomOwner: boolean;
}

import { ResponseGameStateChess } from "src/rulesets/chinesechess/online/gameplay_server_messages";
import { GameStartedMsg } from "src/online/play/gameplay_server_messages";

export interface ChineseChessDarkGameStartedMsg extends GameStartedMsg {
  chesses: Array<ResponseGameStateChess>;
}

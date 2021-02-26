import { GameType } from "src/rulesets/GameType";

export default class UserStats {
  gameType: GameType;

  playCount: number;

  winCount: number;

  loseCount: number;

  drawCount: number;

  winRate: number;
}

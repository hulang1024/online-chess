import { GameType } from "src/rulesets/GameType";
import TimerSettings from "./TimerSettings";

export default class GameSettings {
  gameType: GameType;

  timer: TimerSettings;
}

import GobangGameSettings from "src/rulesets/gobang/GobangGameSettings";
import { APIRequest, HttpMethod } from "../api/api_request";
import Room from "./Room";

export default class CreateRoomRequest extends APIRequest<Room> {
  constructor(room: Room) {
    super();
    this.method = HttpMethod.POST;
    this.path = 'rooms';

    // todo: json
    this.addParam('name', room.name);
    const { roomSettings: { gameSettings } } = room;
    this.addParam('gameType', gameSettings.gameType);
    this.addParam('canWithdraw', gameSettings.canWithdraw);
    this.addParam('gameDuration', gameSettings.timer.gameDuration);
    this.addParam('stepDuration', gameSettings.timer.stepDuration);
    this.addParam('secondsCountdown', gameSettings.timer.secondsCountdown);
    if (gameSettings instanceof GobangGameSettings) {
      this.addParam('chessboardSize', gameSettings.chessboardSize);
    }
    this.addParam('password', room.password);
  }
}

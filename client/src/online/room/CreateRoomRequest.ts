import { APIRequest, HttpMethod } from "../api/api_request";
import Room from "./Room";

export default class CreateRoomRequest extends APIRequest<Room> {
  constructor(room: Room) {
    super();
    this.method = HttpMethod.POST;
    this.path = 'rooms';

    this.addParam('name', room.name);
    this.addParam('gameType', room.gameType);
    this.addParam('gameDuration', room.roomSettings.gameDuration);
    this.addParam('stepDuration', room.roomSettings.stepDuration);
    this.addParam('secondsCountdown', room.roomSettings.secondsCountdown);
    this.addParam('password', room.password);
  }
}

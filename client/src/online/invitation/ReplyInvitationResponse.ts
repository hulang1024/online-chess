import APIResult from "../api/APIResult";
import Room from "../room/Room";
import SpectateResponse from "../spectator/APISpectateResponse";

export default interface ReplyInvitationResponse extends APIResult {
  playRoom: Room;
  spectateResponse: SpectateResponse;
}

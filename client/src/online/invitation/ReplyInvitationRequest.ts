import ReplyInvitationResponse from "./ReplyInvitationResponse";
import { APIRequest, HttpMethod } from "../api/api_request";

export default class ReplyInvitationRequest extends APIRequest<ReplyInvitationResponse> {
  constructor(invitationId: number, isAccept: boolean) {
    super();
    this.method = HttpMethod.POST;
    this.path = 'invitations/reply';
    this.addParam('invitationId', invitationId);
    this.addParam('isAccept', isAccept);
  }
}

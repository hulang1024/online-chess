import User from "../../user/User";
import APIResult from "../api/APIResult";
import { APIRequest, HttpMethod } from "../api/api_request";

export default class InviteRequest extends APIRequest<APIResult> {
  constructor(invitee: User, subject: number) {
    super();
    this.method = HttpMethod.POST;
    this.path = `invitations/${subject}`;
    this.addParam('inviteeId', invitee.id);
  }
}

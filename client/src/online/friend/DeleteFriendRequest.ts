import User from "../user/User";
import { APIRequest, HttpMethod } from "../api/api_request";
import APIResult from "../api/APIResult";

export default class DeleteFriendRequest extends APIRequest<APIResult> {
  private friend: User;

  constructor(friend: User) {
    super();
    this.friend = friend;
  }

  prepare() {
    this.method = HttpMethod.DELETE;
    this.path = `users/${this.user.id}/friends/${this.friend.id}`;
  }
}

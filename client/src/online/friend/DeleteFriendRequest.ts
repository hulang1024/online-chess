import User from "../user/User";
import { APIRequest, APIResult, HttpMethod } from "../api/api_request";

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

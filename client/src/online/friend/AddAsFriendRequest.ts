import User from "../user/User";
import { APIRequest, HttpMethod } from "../api/api_request";

export default class AddAsFriendRequest extends APIRequest {
    private friend: User; 
    constructor(friend: User) {
        super();
        this.friend = friend;
    }

    prepare() {
        this.method = HttpMethod.POST;
        this.path = `users/${this.user.id}/friends/${this.friend.id}`;
    }
}
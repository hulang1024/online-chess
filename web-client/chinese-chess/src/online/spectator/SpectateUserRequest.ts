import User from "../../user/User";
import { APIRequest, HttpMethod } from "../api/api_request";
import Room from "../room/Room";

export default class SpectateUserRequest extends APIRequest {
    private target: User;

    constructor(target: User) {
        super();
        this.target = target;
    }

    prepare() {
        this.method = HttpMethod.PUT;
        this.path = `users/${this.target.id}/spectators/${this.user.id}`;
    }
}
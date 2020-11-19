import User from "../../user/User";
import { APIRequest, HttpMethod } from "./api_request";

export default class LoginRequest extends APIRequest {
    constructor(user: User) {
        super();
        this.method = HttpMethod.POST;
        this.path = 'users/login';

        this.addParam('username', "test");
        this.addParam('password', 'test');
    }
}
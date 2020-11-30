import User from "../../user/User";
import { APIRequest, HttpMethod } from "./api_request";

export default class LoginRequest extends APIRequest {
    constructor(user: User, token: string) {
        super();
        this.method = HttpMethod.POST;
        this.path = 'users/login';

        if (token) {
            this.addParam('token', token);
        } else {
            this.addParam('username', user.nickname);
            this.addParam('password', user.password);
        }
    }
}
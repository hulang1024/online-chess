import User from "../user/User";
import { APIRequest, APIResult, HttpMethod } from "./api_request";

export default class RegisterRequest extends APIRequest<APIResult> {
  constructor(user: User) {
    super();
    this.method = HttpMethod.POST;
    this.path = 'users';

    this.addParam('nickname', user.nickname || user.username);
    this.addParam('password', user.password);
  }
}

import User from "../user/User";
import APILoginResult from './APILoginResult';
import { APIRequest, HttpMethod } from './api_request';

export default class LoginRequest extends APIRequest<APILoginResult> {
  constructor(user: User | null, token?: string) {
    super();
    this.method = HttpMethod.POST;
    this.path = 'users/login';

    if (token) {
      this.addParam('token', token);
    } else if (user) {
      this.addParam('username', user.username);
      this.addParam('password', user.password);
    }
  }
}
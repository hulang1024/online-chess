import device from "current-device";
import User from "../../user/User";
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

    // eslint-disable-next-line
    this.addParam('device', device.mobile() ? 2 : 1);
    // eslint-disable-next-line
    this.addParam('deviceOS', device.os);
  }
}

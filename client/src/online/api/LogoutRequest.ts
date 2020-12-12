import { APIRequest, HttpMethod } from './api_request';

export default class LogoutRequest extends APIRequest<void> {
  constructor() {
    super();
    this.method = HttpMethod.POST;
    this.path = 'users/logout';
  }
}

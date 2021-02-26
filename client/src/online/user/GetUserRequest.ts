import { APIRequest, HttpMethod } from "../api/api_request";
import UserDetails from "./UserDetails";

export default class GetUserRequest extends APIRequest<UserDetails> {
  constructor(userId: number) {
    super();
    this.method = HttpMethod.GET;
    this.path = `users/${userId}`;
  }
}

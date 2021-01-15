import { APIRequest, HttpMethod } from "../api/api_request";
import SearchUserInfo from "./SearchUserInfo";

export default class GetUserRequest extends APIRequest<SearchUserInfo> {
  constructor(userId: number) {
    super();
    this.method = HttpMethod.GET;
    this.path = `users/${userId}`;
  }
}

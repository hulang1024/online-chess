import APIPageResponse from "../api/APIPageResponse";
import { APIRequest, HttpMethod } from "../api/api_request";
import SearchUserInfo from "./SearchUserInfo";
import SearchUserParams from "./SearchUserParams";

export default class GetUsersRequest extends APIRequest<APIPageResponse<SearchUserInfo>> {
  constructor(params: SearchUserParams) {
    super();
    this.method = HttpMethod.GET;
    this.path = 'users';

    this.addParam('page', params.page);
    this.addParam('size', params.size);
    this.addParam('onlyFriends', params.onlyFriends);
    this.addParam('status', params.status);
  }
}

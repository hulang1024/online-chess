import APIPageResponse from "../api/APIPageResponse";
import { APIRequest, HttpMethod } from "../api/api_request";
import SearchUserInfo from "./SearchUserInfo";
import SearchUserParams from "./SearchUserParams";

export default class GetUsersRequest extends APIRequest<APIPageResponse<SearchUserInfo>> {
  constructor(params: SearchUserParams) {
    super();
    this.method = HttpMethod.GET;
    this.path = 'users';

    Object.keys(params).forEach((name) => {
      // eslint-disable-next-line
      this.addParam(name, (params as any)[name as string]);
    });
  }
}

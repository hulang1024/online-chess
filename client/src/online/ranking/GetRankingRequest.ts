import APIPageResponse from "../api/APIPageResponse";
import { APIRequest, HttpMethod } from "../api/api_request";
import SearchUserInfo from "../user/SearchUserInfo";
import SearchRankingParams from "./SearchRankingParams";

export default class GetRankingRequest extends APIRequest<APIPageResponse<SearchUserInfo>> {
  constructor(params: SearchRankingParams) {
    super();
    this.method = HttpMethod.GET;
    this.path = 'stats/ranking';

    this.addParam('page', params.page);
    this.addParam('size', params.size);
    this.addParam('rankingBy', params.rankingBy);
  }
}

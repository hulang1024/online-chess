import { APIRequest, HttpMethod } from "../api/api_request";

export default class GetUsersRequest extends APIRequest {
    constructor(params: any) {
        super();
        this.method = HttpMethod.GET;
        this.path = 'users';

        for (let key in params) {
            this.addParam(key, params[key]);
        }
    }
}
import User from "../../user/User";
import AccessToken from "./AccessToken";
import APIResult from './APIResult';

export default class APILoginResult extends APIResult {
  user: User;

  accessToken: AccessToken;
}

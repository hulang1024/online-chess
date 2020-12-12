import User from "../user/User";
import AccessToken from "./AccessToken";

export default class APILoginResult {
  user: User;

  accessToken: AccessToken;
}

import UserStatus from "./UserStatus";

export default class SearchUserParams {
  page = 1;

  size = 100;

  onlyFriends = false;

  status: UserStatus;
}

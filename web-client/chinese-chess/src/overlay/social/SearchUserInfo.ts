import User from "../../user/User";

export default class SearchUserInfo extends User {
    isOnline: boolean;
    isFriend: boolean;
    isMutual: boolean;
    userStats: any;
}
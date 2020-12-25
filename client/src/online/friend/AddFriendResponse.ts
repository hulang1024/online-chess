import APIResult from "../api/APIResult";

export default interface AddFriendResponse extends APIResult {
  isMutual: boolean;
}

import APIResult from "../api/APIResult";

export default class UploadAvatarResponse extends APIResult {
  success: boolean;

  url: string;
}

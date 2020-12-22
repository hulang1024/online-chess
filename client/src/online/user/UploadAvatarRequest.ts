import axios from 'axios';
import { APIRequest, HttpMethod } from "../api/api_request";
import UploadAvatarResponse from "./UploadAvatarResponse";

export default class UploadAvatarRequest extends APIRequest<UploadAvatarResponse> {
  private file: File;

  constructor(file: File) {
    super();
    this.method = HttpMethod.POST;
    this.path = 'users/avatar';
    this.file = file;
  }

  public createHttpRequest() {
    const formData = new FormData();
    formData.append("file", this.file);

    const req = axios.request({
      url: `${this.api.endpoint}/api/${this.path}`,
      method: this.method,
      headers: (this.api.accessToken ? {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${this.api.accessToken.accessToken}`,
      } : undefined),
      data: formData,
    });
    return req;
  }
}

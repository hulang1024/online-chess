import { Ref } from '@vue/composition-api';
import axios, { AxiosResponse, AxiosPromise, AxiosRequestConfig } from 'axios';
import User from "../user/User";
import APIAccess from "./APIAccess";

export abstract class APIRequest {
  protected api: APIAccess;
  protected path: string;
  protected method: HttpMethod;
  private params: {[key: string]: any};
  
  public success: APISuccessHandler;
  public failure: APIFailureHandler;

  // 是否正在请求
  public loading: Ref<boolean>;

  get user(): User {
    return this.api.localUser;
  }

  public perform(api: APIAccess) {
    this.api = api;

    this.prepare && this.prepare();
    this.setLoading(true);
    this.createHttpRequest().then((response: AxiosResponse) => {
      let isSuccessStatusCode = 200 <= response.status && response.status <= 299;

      if (isSuccessStatusCode) {
        this.triggerSuccess(response.data);
      } else {
        this.triggerFailure(response.data);
        this.api.handleHttpExceptionStatus(response.status);
      }
      this.setLoading(false);
    }).catch((e) => {
      const { response } = e;
      this.triggerFailure(response?.data);
      this.api.handleHttpExceptionStatus(response?.status);
      this.setLoading(false);
    });
  }

  protected createHttpRequest() {
    const req = axios.request({
      url: `${this.api.endpoint}/api/${this.path}`,
      method: this.method,
      headers: (this.api.accessToken ? {
        'Authorization': `Bearer ${this.api.accessToken.accessToken}`
      } : undefined),
      params: [HttpMethod.GET, HttpMethod.DELETE].includes(this.method)
        ? this.params : undefined,
      data: [HttpMethod.POST, HttpMethod.PUT].includes(this.method)
        ? this.params : undefined
    });
    return req;
  }

  protected prepare() {}//todo: 重构

  protected addParam(key: string, value: any) {
    this.params = this.params || {};
    this.params[key] = value;
  }

  private triggerFailure(e?: any) {
    if (!this.failure) return;
    this.failure(e);
  }

  private triggerSuccess(content?: any) {
    if (!this.success) return;
    this.success(content);
  }

  private setLoading(value: boolean) {
    if (this.loading) {
      this.loading.value = value;
    }
  }
}

interface APIFailureHandler {
  (e?: any): void;
}


interface APISuccessHandler {
  (content?: any): void;
}

export enum HttpMethod {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete'
}


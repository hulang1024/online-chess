import { Ref } from '@vue/composition-api';
import axios, { AxiosError, AxiosResponse } from 'axios';
import User from '../user/User';
import APIAccess from './APIAccess';
import APIResult from './APIResult';

interface APIFailureHandler<T> {
  (e: T | APIResult): void;
}

interface APISuccessHandler<T> {
  (content: T): void;
}

export enum HttpMethod {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete'
}

export abstract class APIRequest<T> {
  protected api: APIAccess;

  protected path: string;

  protected method: HttpMethod;

  private params: {[key: string]: unknown};

  public success: APISuccessHandler<T>;

  public failure: APIFailureHandler<T>;

  // 是否正在请求
  public loading: Ref<boolean>;

  get user(): User {
    return this.api.localUser;
  }

  public perform(api: APIAccess) {
    this.api = api;

    this.prepare();

    this.setLoading(true);
    this.createHttpRequest().then((response: AxiosResponse<T>) => {
      const isSuccessStatusCode = response.status >= 200 && response.status <= 299;

      if (isSuccessStatusCode) {
        this.triggerSuccess(response.data);
      } else {
        this.triggerFailure(response.data);
        this.api.handleHttpExceptionStatus(response.status);
      }
      this.setLoading(false);
    }).catch((e: AxiosError) => {
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
        Authorization: `Bearer ${this.api.accessToken.accessToken}`,
      } : undefined),
      params: [HttpMethod.GET, HttpMethod.DELETE].includes(this.method)
        ? this.params : undefined,
      data: [HttpMethod.POST, HttpMethod.PUT].includes(this.method)
        ? this.params : undefined,
    });
    return req;
  }

  // eslint-disable-next-line
  protected prepare(): void {}

  protected addParam(key: string, value: unknown) {
    this.params = this.params || {};
    this.params[key] = value;
  }

  private triggerFailure(e: T | APIResult) {
    if (!this.failure) return;
    this.failure(e);
  }

  private triggerSuccess(content: T) {
    if (!this.success) return;
    this.success(content);
  }

  private setLoading(value: boolean) {
    if (this.loading) {
      this.loading.value = value;
    }
  }
}

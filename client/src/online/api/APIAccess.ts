import { Notify } from 'quasar';
import ConfigManager, { ConfigItem } from '../../config/ConfigManager';
import User from '../user/User';
import BindableBool from '../../utils/bindables/BindableBool';
import { APIRequest } from './api_request';
import LoginRequest from './LoginRequest';
import AccessToken from './AccessToken';
import GuestUser from '../user/GuestUser';
import APILoginResult from './APILoginResult';

export default class APIAccess {
  public endpoint: string;

  public localUser: User = new GuestUser();

  public isLoggedIn: BindableBool = new BindableBool();

  public accessToken: AccessToken | null;

  configManager: ConfigManager;

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
    this.endpoint = `${window.location.protocol}//${window.location.host}`;
  }

  public queue<T>(request: APIRequest<T>) {
    request.perform(this);
  }

  public perform<T>(request: APIRequest<T>) {
    request.perform(this);
  }

  public handleHttpExceptionStatus(statusCode: number | undefined) {
    switch (statusCode) {
      case 401:
        this.logout();
        break;
      default: break;
    }
  }

  public login(user: User | null, token?: string): Promise<APILoginResult> {
    return new Promise((resolve, reject) => {
      const req = new LoginRequest(user, token);
      req.success = (ret: APILoginResult) => {
        this.accessToken = ret.accessToken;
        this.localUser = ret.user;
        this.isLoggedIn.value = true;

        this.configManager.set(ConfigItem.username, user?.username);

        if (this.configManager.get(ConfigItem.loginAuto)) {
          if (token) {
            this.configManager.set(ConfigItem.token, token);
            this.configManager.set(ConfigItem.password, '');
          } else {
            this.configManager.set(ConfigItem.token, '');
            this.configManager.set(ConfigItem.password, user?.password);
          }
          this.configManager.save();
        }

        resolve(ret);
      };
      req.failure = (ret) => {
        const causeMap: {[n: number]: string} = { 1: '用户不存在', 2: '密码错误', 3: '第三方用户登录失败' };
        Notify.create({
          type: 'warning',
          message: (ret && ret.code != null) ? causeMap[ret.code] : '登录失败',
        });
        if (ret && ret.code) {
          this.configManager.set(ConfigItem.password, '');
          this.configManager.set(ConfigItem.token, '');
          this.configManager.save();
        }
        reject();
      };
      req.perform(this);
    });
  }

  public logout() {
    this.accessToken = null;
    this.localUser = new GuestUser();
    this.isLoggedIn.value = false;
  }
}

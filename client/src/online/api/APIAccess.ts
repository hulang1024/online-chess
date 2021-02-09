import { Notify } from 'quasar';
import Bindable from 'src/utils/bindables/Bindable';
import ConfigManager, { ConfigItem } from '../../config/ConfigManager';
import User from '../../user/User';
import { APIRequest } from './api_request';
import LoginRequest from './LoginRequest';
import AccessToken from './AccessToken';
import GuestUser from '../../user/GuestUser';
import APILoginResult from './APILoginResult';

export enum APIState {
  /** 未登录 */
  offline = 1,

  /** 登录失败 */
  failing = 2,

  /** (重新)登录中 */
  connecting = 3,

  /** 在线  */
  online = 4,
}

export default class APIAccess {
  public endpoint: string;

  public localUser: User = new GuestUser();

  public state = new Bindable<APIState>();

  public accessToken: AccessToken | null;

  configManager: ConfigManager;

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
    this.endpoint = `${window.location.protocol}//${window.location.host}`;
  }

  public get isLoggedIn() { return this.localUser.id != -1; }

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
    this.state.value = APIState.connecting;

    return new Promise((resolve, reject) => {
      const req = new LoginRequest(user, token);
      req.success = (ret: APILoginResult) => {
        this.accessToken = ret.accessToken;
        this.localUser = { ...user, ...ret.user };

        if (!(user instanceof GuestUser)) {
          this.configManager.set(ConfigItem.username, user?.username);

          if (this.configManager.get(ConfigItem.loginAuto)) {
            if (token) {
              this.configManager.set(ConfigItem.token, token);
              this.configManager.set(ConfigItem.password, '');
            } else {
              this.configManager.set(ConfigItem.token, '');
              this.configManager.set(ConfigItem.password, user?.password);
            }
          }
          this.configManager.save();
        }

        this.state.value = APIState.online;

        resolve(ret);
      };
      req.failure = (ret) => {
        const causeMap: {[n: number]: string} = {
          1: '用户不存在',
          2: '密码错误',
          3: '第三方用户登录失败',
          100: '已被禁止登陆',
        };
        Notify.create({
          type: (ret && ret.code == 100) ? 'negative' : 'warning',
          message: (ret && ret.code != null) ? causeMap[ret.code] : '登录失败',
        });
        this.configManager.set(ConfigItem.password, '');
        this.configManager.set(ConfigItem.token, '');
        this.configManager.save();

        this.state.value = APIState.failing;

        reject();
      };
      req.perform(this);
    });
  }

  public logout() {
    this.accessToken = null;
    this.localUser = new GuestUser();
    this.state.value = APIState.offline;
  }
}

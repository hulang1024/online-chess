import ConfigManager, { ConfigItem } from "../../config/ConfigManager";
import User from "../user/User";
import BindableBool from "../../utils/bindables/BindableBool";
import { APIRequest } from "./api_request";
import LoginRequest from "./LoginRequest";
import { Notify } from 'quasar';

export default class APIAccess {
    public endpoint: string;
    public localUser: User = new GuestUser();
    public isLoggedIn: BindableBool = new BindableBool();
    public accessToken: AccessToken | null;
    configManager: ConfigManager;

    constructor(configManager: ConfigManager) {
        this.configManager = configManager;
        this.endpoint = false ? `${location.protocol}//${location.host}` : 'http://180.76.185.34'
    }

    public queue(request: APIRequest) {
        request.perform(this);
    }
    
    public perform(request: APIRequest) {
        request.perform(this);
    }

    public handleHttpExceptionStatus(statusCode: number) {
        switch (statusCode) {
            case 401:
                this.logout();
                break;
        }
    }

    public login(user: User | null, token?: string): Promise<void> {
        return new Promise((resolve, reject) => {
            let req = new LoginRequest(user, token);
            req.success = (ret) => {
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
            req.failure = (ret: any) => {
                const causeMap: any = {1: '用户不存在', 2: '密码错误', '3': '第三方用户登录失败'};
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
            }
            req.perform(this);
        });
    }

    public logout() {
        this.accessToken = null;
        this.localUser = new GuestUser();
        this.isLoggedIn.value = false;
    }
}

class GuestUser extends User {
    constructor() {
        super();
        this.id = -1;
        this.nickname = '游客';
        this.avatarUrl = '';
    }
}

interface AccessToken {
    accessToken: string;
    expiresIn: number;
}
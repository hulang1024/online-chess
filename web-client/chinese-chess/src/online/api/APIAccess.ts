import messager from "../../component/messager";
import ConfigManager, { ConfigItem } from "../../config/ConfigManager";
import SceneContext from "../../scene/SceneContext";
import User from "../../user/User";
import BindableBool from "../../utils/bindables/BindableBool";
import { APIRequest } from "./api_request";
import LoginRequest from "./LoginRequest";

export default class APIAccess {
    public endpoint: string;
    public localUser: User = new GuestUser();
    public isLoggedIn: BindableBool = new BindableBool();
    public accessToken: AccessToken;
    private context: SceneContext;
    configManager: ConfigManager;

    constructor(context: SceneContext) {
        this.context = context;
        this.configManager = context.configManager;
        this.endpoint = DEBUG ? `${location.protocol}//${location.host}` : 'http://180.76.185.34'
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

    public login(user: User, token?: string): Promise<void> {
        let loginRequest = new LoginRequest(user, token);
        return new Promise((resolve, reject) => {
            loginRequest.success = (ret) => {
                this.accessToken = ret.accessToken;
                this.localUser = ret.user;
                this.isLoggedIn.value = true;

                if (this.configManager.get(ConfigItem.loginAuto)) {
                    if (token) {
                        this.configManager.set(ConfigItem.token, token);
                        this.configManager.set(ConfigItem.password, '');
                    } else {
                        this.configManager.set(ConfigItem.username, user.nickname);
                        this.configManager.set(ConfigItem.password, user.password);
                        this.configManager.set(ConfigItem.token, '');
                    }
                    this.configManager.save();
                }

                resolve(ret);
            };
            loginRequest.failure = (ret) => {
                messager.fail(
                    (ret && ret.code != null) ? {1: '用户不存在', 2: '密码错误', '3': '第三方用户登录失败'}[ret.code] : '登录失败',
                    this.context.stage);
                if (ret && ret.code) {
                    this.configManager.set(ConfigItem.password, '');
                    this.configManager.set(ConfigItem.token, '');
                    this.configManager.save();
                }
                reject();
            }
            loginRequest.perform(this);
        });
    }

    public logout() {
        this.isLoggedIn.value = false;
        this.accessToken = null;
        this.localUser = new GuestUser();
    }
}

class GuestUser extends User {
    constructor() {
        super();
        this.id = -1;
        this.nickname = '游客';
    }
}

interface AccessToken {
    accessToken: string;
    expiresIn: number;
}
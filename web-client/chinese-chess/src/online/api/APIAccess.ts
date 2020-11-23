import messager from "../../component/messager";
import ConfigManager, { ConfigItem } from "../../config/ConfigManager";
import SceneContext from "../../scene/SceneContext";
import User from "../../user/User";
import { APIRequest } from "./api_request";
import LoginRequest from "./LoginRequest";

export default class APIAccess {
    public endpoint: string;
    public localUser: User = new GuestUser();
    public isLoggedIn: boolean;
    public accessToken: AccessToken;
    public stateChanged: Signal = new Signal();
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

    public login(user: User): Promise<void> {
        let loginRequest = new LoginRequest(user);
        return new Promise((resolve, reject) => {
            loginRequest.success = (ret) => {
                this.accessToken = ret.accessToken;
                user.id = ret.userId;
                this.localUser = user;
                this.isLoggedIn = true;

                //messager.clear();

                if (this.configManager.get(ConfigItem.loginAuto)) {
                    this.configManager.set(ConfigItem.username, user.nickname);
                    this.configManager.set(ConfigItem.password, user.password);
                    this.configManager.save();
                }

                this.stateChanged.dispatch();
                resolve(ret);
            };
            loginRequest.failure = (ret) => {
                messager.fail(
                    ret.code != null ? {1: '用户不存在', 2: '密码错误'}[ret.code] : '登录失败',
                    this.context.stage);
                this.configManager.set(ConfigItem.password, '');
                this.configManager.save();
                reject();
            }
            loginRequest.perform(this);
        });
    }

    public logout() {
        this.isLoggedIn = false;
        this.localUser = new GuestUser();
        this.stateChanged.dispatch();
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
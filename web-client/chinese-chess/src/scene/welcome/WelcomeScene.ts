
import AbstractScene from "../AbstractScene";
import SceneContext from "../SceneContext";

import APIAccess from "../../online/api/APIAccess";
import ChannelManager from "../../online/chat/ChannelManager";
import User from "../../user/User";
import messager from "../../component/messager";
import RegisterRequest from "../../online/api/RegisterRequest";
import SceneManager from "../scene_manger";
import LobbyScene from "../lobby/LobbyScene";
import SocketClient from "../../online/socket";

export default class WelcomeScene extends AbstractScene {
    private api: APIAccess;
    private socketClient: SocketClient;
    private channelManager: ChannelManager;
    
    constructor(context: SceneContext) {
        super(context);
        this.api = context.api;
        this.socketClient = context.socketClient;
        this.channelManager = context.channelManager;

        let group = new eui.Group();
        let layout = new eui.VerticalLayout();
        layout.verticalAlign = egret.VerticalAlign.MIDDLE;
        layout.horizontalAlign = egret.HorizontalAlign.CONTENT_JUSTIFY;
        layout.paddingTop = 32;
        layout.paddingRight = 32;
        layout.paddingBottom = 32;
        layout.paddingLeft = 32;
        layout.gap = 36;
        group.layout = layout;
        this.addChild(group);
        
        let btnLogin = new eui.Button();
        btnLogin.width = 130;
        btnLogin.label = "用户登录";
        btnLogin.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onLoginClick, this);
        group.addChild(btnLogin);

        let btnGuestLogin = new eui.Button();
        btnGuestLogin.width = 130;
        btnGuestLogin.label = "游客登录";
        btnGuestLogin.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onGuestLoginClick, this);
        group.addChild(btnGuestLogin);

        let btnCreateUser = new eui.Button();
        btnCreateUser.width = 130;
        btnCreateUser.label = "注册新用户";
        btnCreateUser.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onCreateUserClick, this);
        group.addChild(btnCreateUser);

        this.addEventListener(egret.Event.ADDED_TO_STAGE, () => {
            group.height = this.stage.stageHeight;
            group.width = this.stage.stageWidth;
        }, this);
    }

    private async onGuestLoginClick() {
        SceneManager.of(this.context).pushScene(context => new LobbyScene(context));
        this.channelManager.loadDefaultChannels();
        this.channelManager.openChannel(1);

        this.socketClient.connect();
    }

    private onLoginClick() {
        let user = new User();
        user.nickname = prompt('登陆用户名（昵称）');
        if (!user.nickname) return;
        user.password = prompt('登陆密码');
        this.api.login(user)
            .then(() => {
                messager.success('登录成功', this);
                SceneManager.of(this.context).pushScene(context => new LobbyScene(context));
                this.channelManager.loadDefaultChannels();
                this.channelManager.openChannel(1);

                this.socketClient.connect();
            })
            .catch((ret) => {
                messager.fail({1: '用户不存在', 2: '密码错误'}[ret.code], this);
            });
    }

    private onCreateUserClick() {
        let user = new User();
        user.nickname = prompt('注册用户名（昵称）');
        if (!user.nickname) return;
        user.password = prompt('注册密码');
        if (!(user.nickname && user.password)) {
            messager.error('重新输入', this);
            return;
        }
        let registerRequest = new RegisterRequest(user);
        registerRequest.success = () => {
            messager.success('注册成功', this);
        };
        registerRequest.failure = (ret) => {
            messager.fail({1: '失败', 2: '昵称已被使用'}[ret.code], this);
        }
        this.api.perform(registerRequest);
    }

}
import APIAccess from "../../online/api/APIAccess";
import CreateUserOverlay from "./CreateUserOverlay";
import SceneContext from "../../scene/SceneContext";
import User from "../../user/User";
import Overlay from "../Overlay";
import LogoutRequest from "../../online/api/LogoutRequest";
import ConfigManager, { ConfigItem } from "../../config/ConfigManager";
import PasswordInput from "../../component/PasswordInput";
import TextInput from "../../component/TextInput";

export default class UserLoginOverlay extends Overlay {
    private context: SceneContext;
    private api: APIAccess;
    private configManager: ConfigManager;
    private usernameInput: TextInput;
    private passwordInput: PasswordInput;
    private createUserOverlay: CreateUserOverlay;
    private btnLogin = new eui.Button();
    private staySignedInOptionGroup: eui.Group;

    constructor(context: SceneContext) {
        super(false, false);
        this.context = context;
        this.api = context.api;
        this.configManager = context.configManager;

        this.height = 360;

        let layout = new eui.VerticalLayout();
        layout.paddingTop = 32;
        layout.paddingRight = 32;
        layout.paddingBottom = 32;
        layout.paddingLeft = 32;
        layout.gap = 16;
        layout.horizontalAlign = egret.HorizontalAlign.CONTENT_JUSTIFY;

        this.layout = layout;

        this.visible = false;

        this.usernameInput = new TextInput({
            width: 300,
            prompt: '用户名',
            initialValue: this.configManager.get(ConfigItem.username)
        });
        this.addChild(this.usernameInput);

        this.passwordInput = new PasswordInput({
            width: 300,
            prompt: '密码'
        });
        this.passwordInput.onEnter = () => {
            this.login();
        };
        this.addChild(this.passwordInput);

        this.addChild(this.staySignedInOptionGroup = this.createStaySignedInOptionGroup());

        let { btnLogin } = this;
        btnLogin.label = '登录';
        btnLogin.addEventListener(egret.TouchEvent.TOUCH_TAP, this.login, this);
        this.addChild(btnLogin);

        let btnRegister = new eui.Button();
        btnRegister.label = '注册';
        btnRegister.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onRegisterClick, this);
        this.addChild(btnRegister);

        let btnLogout = new eui.Button();
        btnLogout.visible = false;
        btnLogout.includeInLayout = false;
        btnLogout.label = '注销';
        btnLogout.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onLogoutClick, this);
        this.addChild(btnLogout);

        this.addEventListener(egret.Event.ADDED_TO_STAGE, () => {
            this.x = this.stage.stageWidth - this.width;
            this.y = this.context.toolbar.height + 8;

            this.api.isLoggedIn.addAndRunOnce((isLoggedIn: boolean) => {
                [
                    this.usernameInput,
                    this.passwordInput,
                    this.staySignedInOptionGroup,
                    btnLogin, btnRegister].forEach(c => {
                    c.visible = !isLoggedIn;
                    c.includeInLayout = !isLoggedIn;
                });
                btnLogin.label = '登录';
                btnLogin.enabled = !isLoggedIn;
                btnLogout.visible = isLoggedIn;
                btnLogout.includeInLayout = isLoggedIn;
            });
    
        }, this);
    }

    public toggle() {
        this.visible = !this.visible;
    }

    private onLogoutClick() {
        let logoutRequest = new LogoutRequest();
        logoutRequest.success = () => {
            this.api.logout();
            this.configManager.set(ConfigItem.password, '');
            this.configManager.save();
        };
        this.api.perform(logoutRequest);
    }

    private login() {
        let user = new User();
        user.nickname = this.usernameInput.value;
        user.password = this.passwordInput.value;
        if (!(user.nickname && user.password)) {
            return;
        }

        this.btnLogin.label = '登录中...';
        this.btnLogin.enabled = false;

        this.api.login(user).then(() => {
            this.visible = false;
        }).catch(() =>  {
            this.btnLogin.label = '登录';
            this.btnLogin.enabled = true;
        });
    }

    private onRegisterClick() {
        this.toggle();
        if (!this.createUserOverlay) {
            this.createUserOverlay = new CreateUserOverlay(this.context, this);
            this.parent.addChild(this.createUserOverlay);
        }
        this.createUserOverlay.show();
    }


    private createStaySignedInOptionGroup() {
        let layout = new eui.HorizontalLayout();
        layout.horizontalAlign = egret.HorizontalAlign.JUSTIFY;
        let group = new eui.Group();
        group.layout = layout;

        let label = new eui.Label();
        label.text = "保持登录";
        label.size = 20;
        group.addChild(label);

        let staySignedInSwitch = new eui.ToggleSwitch();
        staySignedInSwitch.selected = this.configManager.get(ConfigItem.loginAuto);
        staySignedInSwitch.addEventListener(eui.UIEvent.CHANGE, (event: eui.UIEvent) => {
            this.configManager.set(ConfigItem.loginAuto, staySignedInSwitch.selected);
            this.configManager.save();
        }, this);
        group.addChild(staySignedInSwitch);

        return group;
    }
}
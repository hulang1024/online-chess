import messager from "../../component/messager";
import APIAccess from "../../online/api/APIAccess";
import SocketClient from "../../online/socket";
import PlayScene from "../../scene/play/PlayScene";
import CreateUserOverlay from "./CreateUserOverlay";
import SceneContext from "../../scene/SceneContext";
import SceneManager from "../../scene/scene_manger";
import User from "../../user/User";
import Overlay from "../Overlay";
import LogoutRequest from "../../online/api/LogoutRequest";
import ConfigManager, { ConfigItem } from "../../config/ConfigManager";

export default class UserLoginOverlay extends Overlay {
    private context: SceneContext;
    private api: APIAccess;
    private configManager: ConfigManager;
    private textEditUsername: eui.EditableText;
    private textEditPassword: eui.EditableText;
    private createUserOverlay: CreateUserOverlay;
    private btnLogin = new eui.Button();
    private userNameGroup: eui.Group;
    private passwordGroup: eui.Group;
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

        this.addChild(this.userNameGroup = this.createUserNameGroup());
        this.addChild(this.passwordGroup = this.createPasswordGroup());
        this.addChild(this.staySignedInOptionGroup = this.createStaySignedInOptionGroup());

        let { btnLogin } = this;
        btnLogin.label = '登录';
        btnLogin.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onLoginClick, this);
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

        let onAPIStateChange = () => {
            let { isLoggedIn } = this.api;

            [
                this.userNameGroup,
                this.passwordGroup,
                this.staySignedInOptionGroup,
                btnLogin, btnRegister].forEach(c => {
                c.visible = !isLoggedIn;
                c.includeInLayout = !isLoggedIn;
            });
            btnLogin.label = '登录';
            btnLogin.enabled = !isLoggedIn;
            btnLogout.visible = isLoggedIn;
            btnLogout.includeInLayout = isLoggedIn;
        };
        
        this.api.stateChanged.add(onAPIStateChange);

        this.addEventListener(egret.Event.ADDED_TO_STAGE, () => {
            this.x = this.stage.stageWidth - this.width;
            this.y = this.context.toolbar.height + 8;
            onAPIStateChange();
        }, this);
    }

    public toggle() {
        this.visible = !this.visible;
    }

    private onLogoutClick() {
        let logoutRequest = new LogoutRequest();
        logoutRequest.success = () => {
            this.api.logout();
        };
        this.api.perform(logoutRequest);
    }

    private onLoginClick() {
        let user = new User();
        user.nickname = this.textEditUsername.text;
        user.password = this.textEditPassword.text;
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

    private createUserNameGroup() {
        let group = new eui.Group();
        group.layout = new eui.HorizontalLayout();

        let label = new eui.Label();
        label.width = 80;
        label.text = "用户名";
        label.size = 20;
        group.addChild(label);

        let textEdit = new eui.EditableText();
        textEdit.size = 20;
        textEdit.width = 300;
        textEdit.border = true;
        textEdit.borderColor = 0xffffff;
        textEdit.verticalAlign = egret.VerticalAlign.MIDDLE;
        textEdit.text = this.configManager.get(ConfigItem.username);
        group.addChild(textEdit);
        this.textEditUsername = textEdit;

        return group;
    }

    private createPasswordGroup() {
        let group = new eui.Group();
        group.layout = new eui.HorizontalLayout();

        let label = new eui.Label();
        label.width = 80;
        label.text = "密码";
        label.size = 20;
        group.addChild(label);

        let textEdit = new eui.EditableText();
        textEdit.displayAsPassword = true;
        textEdit.size = 20;
        textEdit.width = 300;
        textEdit.border = true;
        textEdit.borderColor = 0xffffff;
        textEdit.verticalAlign = egret.VerticalAlign.MIDDLE;
        group.addChild(textEdit);
        this.textEditPassword = textEdit;

        return group;
    }

    private createStaySignedInOptionGroup() {
        let group = new eui.Group();
        group.layout = new eui.HorizontalLayout();

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
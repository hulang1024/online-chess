import messager from "../../component/messager";
import PasswordInput from "../../component/PasswordInput";
import TextInput from "../../component/TextInput";
import APIAccess from "../../online/api/APIAccess";
import RegisterRequest from "../../online/api/RegisterRequest";
import SceneContext from "../../scene/SceneContext";
import User from "../../user/User";
import Overlay from "../Overlay";
import UserLoginOverlay from "./UserLoginOverlay";

export default class CreateUserOverlay extends Overlay {
    private context: SceneContext;
    private api: APIAccess;
    private usernameInput: TextInput;
    private passwordInput: PasswordInput;
    private userLoginOverlay: UserLoginOverlay;

    constructor(context: SceneContext, userLoginOverlay: UserLoginOverlay) {
        super(false, false);
        this.context = context;
        this.api = context.api;
        this.userLoginOverlay = userLoginOverlay;

        this.visible = false;

        this.height = 320;

        let layout = new eui.VerticalLayout();
        layout.paddingTop = 32;
        layout.paddingRight = 32;
        layout.paddingBottom = 32;
        layout.paddingLeft = 32;
        layout.gap = 16;
        layout.horizontalAlign = egret.HorizontalAlign.CONTENT_JUSTIFY;
        this.layout = layout;

        this.usernameInput = new TextInput({
            width: 300,
            prompt: '用户名'
        });
        this.addChild(this.usernameInput);

        this.passwordInput = new PasswordInput({
            width: 300,
            prompt: '密码'
        });
        this.passwordInput.onEnter = () => {
            this.register();
        };
        this.addChild(this.passwordInput);

        let btnRegister = new eui.Button();
        btnRegister.label = '注册';
        btnRegister.addEventListener(egret.TouchEvent.TOUCH_TAP, this.register, this);
        this.addChild(btnRegister);

        let btnCancel = new eui.Button();
        btnCancel.label = '取消';
        btnCancel.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            this.visible = false;
        }, this);
        this.addChild(btnCancel);

        this.addEventListener(egret.Event.ADDED_TO_STAGE, () => {
            this.x = this.stage.stageWidth - this.width;
            this.y = this.context.toolbar.height + 8;
        }, this);
    }

    public show() {
        this.visible = true;
    }

    private register() {
        let user = new User();
        user.nickname = this.usernameInput.value;
        user.password = this.passwordInput.value;
        if (!(user.nickname && user.password)) {
            return;
        }

        let registerRequest = new RegisterRequest(user);
        registerRequest.success = () => {
            messager.success('注册成功', this);
            this.visible = false;
            this.userLoginOverlay.toggle();
        };
        registerRequest.failure = (ret) => {
            messager.fail(ret ? {
                1: '注册失败', 
                2: '用户名已被使用',
                3: '用户名格式错误（允许1到20个字符）',
                4: '密码格式错误（允许至多20位）'}[ret.code] : '注册失败', this);
        }
        this.api.perform(registerRequest);
    }
}
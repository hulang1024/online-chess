import messager from "../../component/messager";
import APIAccess from "../../online/api/APIAccess";
import RegisterRequest from "../../online/api/RegisterRequest";
import SceneContext from "../../scene/SceneContext";
import User from "../../user/User";
import Overlay from "../Overlay";
import UserLoginOverlay from "./UserLoginOverlay";

export default class CreateUserOverlay extends Overlay {
    private context: SceneContext;
    private userLoginOverlay: UserLoginOverlay;
    private api: APIAccess;
    private textEditUsername: eui.EditableText;
    private textEditPassword: eui.EditableText;

    constructor(context: SceneContext, userLoginOverlay: UserLoginOverlay) {
        super(false, false);
        this.context = context;
        this.api = context.api;
        this.userLoginOverlay = userLoginOverlay;

        this.height = 300;

        let layout = new eui.VerticalLayout();
        layout.paddingTop = 32;
        layout.paddingRight = 32;
        layout.paddingBottom = 32;
        layout.paddingLeft = 32;
        layout.gap = 16;
        layout.horizontalAlign = egret.HorizontalAlign.CONTENT_JUSTIFY;

        this.layout = layout;

        this.visible = false;

        this.addChild(this.createUserNameGroup());
        this.addChild(this.createPasswordGroup());

        let btnRegister = new eui.Button();
        btnRegister.label = '注册';
        btnRegister.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onCreateUserClick, this);
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

    private onCreateUserClick() {
        let user = new User();
        user.nickname = this.textEditUsername.text;
        user.password = this.textEditPassword.text;
        if (!(user.nickname && user.password)) {
            return;
        }

        let registerRequest = new RegisterRequest(user);
        registerRequest.success = () => {
            messager.success('注册成功', this);
            this.visible = true;
            this.userLoginOverlay.toggle();
        };
        registerRequest.failure = (ret) => {
            messager.fail(ret ? {1: '注册失败', 2: '昵称已被使用'}[ret.code] : '注册失败', this);
        }
        this.api.perform(registerRequest);
    }
}
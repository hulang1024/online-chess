import Overlay from "../../component/Overlay";

export default class UserLoginOverlay extends Overlay {
    private textEditUsername: eui.EditableText;
    private groupPassword: eui.Group;
    private textEditPassword: eui.EditableText;
    onOkClick: Function;

    constructor() {
        super();

        this.height = 200;

        let layout = new eui.VerticalLayout();
        layout.paddingTop = 16;
        layout.paddingRight = 16;
        layout.paddingBottom = 16;
        layout.paddingLeft = 16;
        layout.gap = 16;

        this.layout = layout;

        this.visible = false;

        this.addChild(this.createUserNameGroup());
        this.addChild(this.createPasswordGroup());

        let btnLogin = new eui.Button();
        btnLogin.label = '登录';
        this.addChild(btnLogin);
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
}
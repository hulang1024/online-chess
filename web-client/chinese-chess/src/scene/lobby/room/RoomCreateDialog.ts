import Dialog from "../../../component/Dialog";
import Room from "../../../online/socket-message/response/Room";

export default class RoomCreateDialog extends Dialog {
    private textEditRoomName: eui.EditableText;
    private groupPassword: eui.Group;
    private passwordSwitch: eui.ToggleSwitch;
    private textEditPassword: eui.EditableText;
    onOkClick: Function;

    constructor() {
        super();

        this.visible = false;
        this.title = "创建房间";

        this.body.addChild(this.createRoomNameGroup());
        this.body.addChild(this.createLockOptionGroup());

        this.groupPassword = this.createPasswordGroup();
        this.groupPassword.visible = false;
        this.body.addChild(this.groupPassword);

        this.onOk = () => {
            let room = new Room();
            room.name = this.textEditRoomName.text;
            room.locked = this.passwordSwitch.selected;
            room.password = this.textEditPassword.text || null;
            this.onOkClick(room); 
        };
    }

    private createRoomNameGroup() {
        let group = new eui.Group();
        group.layout = new eui.HorizontalLayout();

        let label = new eui.Label();
        label.text = "房间名称";
        label.size = 20;
        group.addChild(label);

        let textEdit = new eui.EditableText();
        textEdit.size = 20;
        textEdit.width = 300;
        textEdit.border = true;
        textEdit.borderColor = 0xffffff;
        textEdit.prompt = '可不填';
        textEdit.promptColor = 0xcccccc;
        textEdit.verticalAlign = egret.VerticalAlign.MIDDLE;
        group.addChild(textEdit);
        this.textEditRoomName = textEdit;

        return group;
    }

    private createLockOptionGroup() {
        let group = new eui.Group();
        group.layout = new eui.HorizontalLayout();

        let label = new eui.Label();
        label.text = "需要密码";
        label.size = 20;
        group.addChild(label);

        let passwordSwitch = new eui.ToggleSwitch();
        passwordSwitch.addEventListener(eui.UIEvent.CHANGE, (event: eui.UIEvent) => {
            this.groupPassword.visible = passwordSwitch.selected;
            if (!passwordSwitch.selected) {
                this.textEditPassword.text = '';
            }
        }, this);
        group.addChild(passwordSwitch);
        this.passwordSwitch = passwordSwitch;

        return group;
    }

    private createPasswordGroup() {
        let group = new eui.Group();
        group.layout = new eui.HorizontalLayout();

        let label = new eui.Label();
        label.text = "房间密码";
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
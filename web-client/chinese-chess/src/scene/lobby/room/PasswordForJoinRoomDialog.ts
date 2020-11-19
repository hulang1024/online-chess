import Dialog from "../../../component/Dialog";
import Room from "../../../online/socket-message/response/Room";

export default class PasswordForJoinRoomDialog extends Dialog {
    private textEditPassword: eui.EditableText;
    onOkClick: Function;

    constructor() {
        super();

        this.visible = false;

        this.body.addChild(this.createPasswordGroup());

        this.onOk = () => {
            let password = this.textEditPassword.text;
            if (password) {
                this.onOkClick(password);
            }
        };
    }

    showFor(room: Room) {
        this.visible = true;
        this.title = `输入棋桌 ${room.name} 的密码`;
    }

    private createPasswordGroup() {
        let group = new eui.Group();
        group.layout = new eui.HorizontalLayout();

        let label = new eui.Label();
        label.text = "棋桌密码";
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
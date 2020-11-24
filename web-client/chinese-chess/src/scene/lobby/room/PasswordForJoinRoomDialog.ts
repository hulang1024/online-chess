import Dialog from "../../../component/Dialog";
import PasswordInput from "../../../component/PasswordInput";
import Room from "../../../online/room/Room";

export default class PasswordForJoinRoomDialog extends Dialog {
    private passwordInput: PasswordInput;
    onOkClick: Function;

    constructor() {
        super();

        this.visible = false;

        this.passwordInput = new PasswordInput({
            width: 396,
            prompt: '请输入棋桌密码'
        });
        this.body.addChild(this.passwordInput);

        this.onOk = () => {
            let password = this.passwordInput.value;
            if (password) {
                this.onOkClick(password);
            }
        };
    }

    showFor(room: Room) {
        this.visible = true;
        this.title = `输入棋桌 ${room.name} 的密码`;
    }
}
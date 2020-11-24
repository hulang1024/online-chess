import Dialog from "../../../component/Dialog";
import PasswordInput from "../../../component/PasswordInput";
import TextInput from "../../../component/TextInput";
import Room from "../../../online/room/Room";

export default class RoomCreateDialog extends Dialog {
    private roomNameInput: TextInput;
    private groupPassword: eui.Group;
    private passwordSwitch: eui.ToggleSwitch;
    private passwordInput: PasswordInput;
    onOkClick: Function;

    constructor() {
        super();

        this.visible = false;
        this.title = "创建棋桌";

        this.body.addChild(this.createRoomNameGroup());
        this.body.addChild(this.createLockOptionGroup());

        this.groupPassword = this.createPasswordGroup();
        this.groupPassword.visible = false;
        this.body.addChild(this.groupPassword);

        this.onOk = () => {
            let room = new Room();
            room.name = this.roomNameInput.value;
            room.locked = this.passwordSwitch.selected;
            room.password = this.passwordInput.value || null;
            this.onOkClick(room); 
        };
    }

    private createRoomNameGroup() {
        let group = new eui.Group();
        group.layout = new eui.HorizontalLayout();

        this.roomNameInput = new TextInput({
            width: 396,
            prompt: '可不填'
        });

        let label = new eui.Label();
        label.text = "棋桌名称";
        label.size = 20;
        label.height = this.roomNameInput.height;
        label.verticalAlign = egret.VerticalAlign.MIDDLE;
        group.addChild(label);


        group.addChild(this.roomNameInput);

        return group;
    }

    private createLockOptionGroup() {
        let group = new eui.Group();
        group.layout = new eui.HorizontalLayout();

        let label = new eui.Label();
        label.text = "需要密码";
        label.size = 20;
        label.verticalAlign = egret.VerticalAlign.MIDDLE;
        group.addChild(label);

        let passwordSwitch = new eui.ToggleSwitch();
        passwordSwitch.addEventListener(eui.UIEvent.CHANGE, (event: eui.UIEvent) => {
            this.groupPassword.visible = passwordSwitch.selected;
            if (!passwordSwitch.selected) {
                this.passwordInput.value = '';
            }
        }, this);
        group.addChild(passwordSwitch);
        this.passwordSwitch = passwordSwitch;

        return group;
    }

    private createPasswordGroup() {
        let group = new eui.Group();
        group.layout = new eui.HorizontalLayout();

        this.passwordInput = new PasswordInput({
            width: 396
        });

        let label = new eui.Label();
        label.text = "棋桌密码";
        label.size = 20;
        label.height = this.passwordInput.height;
        label.verticalAlign = egret.VerticalAlign.MIDDLE;
        group.addChild(label);


        group.addChild(this.passwordInput);

        return group;
    }
}
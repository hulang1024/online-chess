import Dialog from "../../component/Dialog";

export default class ConfirmLeaveDialog extends Dialog {
    constructor() {
        super();
        this.visible = false;
        this.title = "正在游戏中，确认退出吗？";
    }
}
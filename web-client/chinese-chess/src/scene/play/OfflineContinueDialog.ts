import Dialog from "../../component/Dialog";

export default class OfflineContinueDialog extends Dialog {
    constructor() {
        super();
        this.visible = false;
        this.title = "你还有进行中的对局，是否回到游戏？";
    }
}
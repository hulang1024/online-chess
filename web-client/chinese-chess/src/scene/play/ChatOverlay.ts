import Dialog from "../../component/Dialog";

export default class ChatOverlay extends Dialog {
    private textEditMsg: eui.EditableText;
    onOkClick: Function;

    constructor() {
        super();

        this.visible = false;
        this.setSize(464, 300);
        this.title = '发送消息';

        this.textEditMsg = new eui.EditableText();
        this.textEditMsg.size = 18;
        this.textEditMsg.multiline = true;
        this.textEditMsg.width = 400;
        this.textEditMsg.height = 120;
        this.textEditMsg.border = true;
        this.textEditMsg.borderColor = 0xffffff;
        this.body.addChild(this.textEditMsg);

        this.onOk = () => {
            this.onOkClick(this.textEditMsg.text);
        };
    }

    show() {
        this.textEditMsg.text = '';
        this.visible = true;
    }
}
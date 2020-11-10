export default class MessageInput extends eui.Group {
    onSend: Function;

    constructor() {
        super();

        this.layout = new eui.HorizontalLayout();

        let textEdit = new eui.EditableText();
        textEdit.size = 18;
        textEdit.multiline = false;
        textEdit.prompt = '输入你的消息';
        textEdit.width = 230;
        textEdit.height = 40;
        textEdit.border = true;
        textEdit.background = true;
        textEdit.backgroundColor = 0x333333;
        textEdit.verticalAlign = egret.VerticalAlign.MIDDLE;
        this.addChild(textEdit);

        let btnSend = new eui.Button();
        btnSend.label = '发送';
        btnSend.width = 80;
        btnSend.height = 41;
        btnSend.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            let msg = textEdit.text.trim();
            if (!msg) {
                return;
            }
            textEdit.text = '';
            this.onSend(msg);
        }, this);
        this.addChild(btnSend);
    }
}
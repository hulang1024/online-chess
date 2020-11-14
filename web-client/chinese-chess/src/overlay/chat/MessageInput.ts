export default class MessageInput extends eui.Group {
    private textEdit = new eui.EditableText();
    onSend: Function;

    constructor() {
        super();

        const height = 44;
        const width = 326;

        this.layout = new eui.HorizontalLayout();

        let background = new egret.Shape();
        background.graphics.beginFill(0x222222);
        background.graphics.drawRoundRect(0, 0, width, height, 10, 10);
        background.graphics.endFill();
        this.addChild(background);

        let textEditContainer = new eui.Group();
        textEditContainer.width = width;
        textEditContainer.height = height;
        let { textEdit } = this;
        textEdit.left = 10;
        textEdit.size = 18;
        textEdit.multiline = false;
        textEdit.prompt = '键入你的消息';
        textEdit.promptColor = 0xcccccc;
        textEdit.width = width;
        textEdit.height = height;
        textEdit.verticalAlign = egret.VerticalAlign.MIDDLE;
        document.addEventListener('keydown', (event) => {
            if (event.key != 'Enter') {
                return;
            }
            let text = textEdit.text.trim();
            if (!text) {
                return;
            }
            this.onSend(text);
            textEdit.text = '';
        });
        textEditContainer.addChild(textEdit);
        this.addChild(textEditContainer);
    }

    setFocus() {
        this.textEdit.setFocus();
    }
}
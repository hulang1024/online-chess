export interface TextInputProps {
    width: number;
    height?: number;
    prompt?: string;
    initialValue?: string;
}

export default class TextInput extends eui.Group {
    protected textEdit = new eui.EditableText();
    public onEnter: Function;
    private hasFocus: boolean;

    constructor(props: TextInputProps) {
        super();

        const height = props.height || 56;
        this.height = height;

        this.layout = new eui.HorizontalLayout();

        let background = new egret.Shape();
        background.graphics.beginFill(0x000000, 0.6);
        background.graphics.drawRoundRect(0, 0, props.width, height, 10, 10);
        background.graphics.endFill();
        this.addChild(background);

        let textEditContainer = new eui.Group();
        textEditContainer.width = props.width;
        textEditContainer.height = height;
        let { textEdit } = this;
        textEdit.left = 12;
        textEdit.right = 10;
        textEdit.width = props.width;
        textEdit.height = height;
        textEdit.size = 20;
        textEdit.multiline = false;
        textEdit.prompt = props.prompt;
        textEdit.promptColor = 0xeeeeee;
        textEdit.verticalAlign = egret.VerticalAlign.MIDDLE;
        textEdit.text = props.initialValue;

        textEdit.addEventListener(egret.TextEvent.FOCUS_IN, () => {
            this.hasFocus = true;
        }, this);
        textEdit.addEventListener(egret.TextEvent.FOCUS_OUT, () => {
            this.hasFocus = false;
        }, this);

        document.addEventListener('keydown', (event) => {
            if (event.key != 'Enter') {
                return;
            }
            if (!this.hasFocus) {
                return;
            }

            let ok = this.onEnter(textEdit.text);
            if (ok) {
                textEdit.text = '';
            }
        });
        textEditContainer.addChild(textEdit);
        this.addChild(textEditContainer);
    }

    get value() {
        return this.textEdit.text;
    }

    set value(val: string) {
        this.textEdit.text = val;
    }

    public setFocus() {
        this.textEdit.setFocus();
    }
}
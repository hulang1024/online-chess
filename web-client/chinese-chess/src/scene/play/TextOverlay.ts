import Overlay from "../../overlay/Overlay";

export default class TextOverlay extends Overlay {
    private text: egret.TextField;

    constructor() {
        super(true);

        this.visible = false;

        this.height = 52;

        let text = new egret.TextField();
        text.size = 26;
        text.height = this.height;
        text.verticalAlign = egret.VerticalAlign.MIDDLE;
        text.textAlign = egret.HorizontalAlign.CENTER;
        this.addChild(text);

        this.addEventListener(egret.Event.ADDED_TO_STAGE, () => {
            this.width = this.stage.stageWidth - 4;
            this.text.width = this.width;
            this.setSize(this.width, this.height);
            this.setCenter();
        }, this);
        this.text = text;
    }

    show(text?: string, duration: number = 0) {
        this.visible = false;
        this.parent.setChildIndex(this, 10000);
        this.text.text = text;
        this.visible = true;

        if (duration != 0) {
            setTimeout(() => {
                this.visible = false;
            }, duration);
        }
    }
}
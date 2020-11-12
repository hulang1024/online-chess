export default class Overlay extends eui.Group {
    protected background = new egret.Shape();

    constructor(center: boolean) {
        super();

        // 背景
        this.addChild(this.background);

        this.layout
        if (center) {
            this.addEventListener(egret.Event.ADDED_TO_STAGE, () => {
                this.x = (this.parent.width - this.width) / 2;
                this.y = (this.parent.height - this.height) / 2;
                this.setSize(this.width, this.height);
            }, this);
        }
    }

    setSize(width: number, height: number) {
        this.width = width;
        this.height = height;

        // 背景
        this.background.graphics.clear();
        this.background.graphics.beginFill(0x333333, 0.6);
        this.background.graphics.drawRoundRect(0, 0, this.width, this.height, 8, 8);
    }
}
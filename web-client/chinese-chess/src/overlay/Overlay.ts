export default class Overlay extends eui.Group {
    protected background = new egret.Shape();
    private round: boolean;

    constructor(center: boolean = false, round: boolean = true) {
        super();

        this.round = round;

        // 背景
        this.addChild(this.background);

        this.addEventListener(egret.Event.ADDED_TO_STAGE, () => {
            if (center) {
                this.setCenter();
            }
            this.setSize(this.width, this.height);
        }, this);
    }

    setSize(width: number, height: number) {
        this.width = width;
        this.height = height;

        // 背景
        this.background.graphics.clear();
        this.background.graphics.beginFill(0x000000, 0.4);
        if (this.round) {
            this.background.graphics.drawRoundRect(0, 0, this.width, this.height, 8, 8);
        } else {
            this.background.graphics.drawRect(0, 0, this.width, this.height);
        }
        this.background.filters = [
            new egret.DropShadowFilter(
                2, 0, 0x000000, 0.3, 0, 4, 2,
                egret.BitmapFilterQuality.MEDIUM, false, false)
        ];
    }

    setCenter() {
        this.x = (this.parent.getBounds().x + this.parent.width - this.width) / 2;
        this.y = (this.parent.height - this.height) / 2;
    }
}
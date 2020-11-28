export default class Overlay extends eui.Group {
    protected background = new egret.Shape();
    private round: boolean;
    private backgroundAlpha: number;

    constructor(center: boolean = false, round: boolean = true, backgroundAlpha: number = 0.4) {
        super();

        this.round = round;
        this.backgroundAlpha = backgroundAlpha;

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
        this.background.graphics.beginFill(0x000000, this.backgroundAlpha);
        if (this.round) {
            this.background.graphics.drawRoundRect(0, 0, this.width, this.height, 8, 8);
        } else {
            this.background.graphics.drawRect(0, 0, this.width, this.height);
        }
        this.background.filters = [
            new egret.DropShadowFilter(
                2, 0, 0x000000, 0.2, 0, 4, 2,
                egret.BitmapFilterQuality.LOW, false, false)
        ];
    }

    setCenter() {
        this.x = (this.parent.getBounds().x + this.parent.width - this.width) / 2;
        this.y = (this.parent.height - this.height) / 2;
    }

    toggle() {
        if (!this.visible) {
            this.show();
        } else {
            this.hide();
        }
    }
    
    show() {
        this.parent.setChildIndex(this, 10000);
        this.visible = true;
    }

    hide() {
        this.visible = false;
    }
}
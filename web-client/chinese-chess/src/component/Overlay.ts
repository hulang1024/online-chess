export default class Overlay extends eui.Group {
    body = new eui.Group();
    protected txtTitle: egret.TextField;
    protected background = new egret.Shape();

    constructor() {
        super();

        let layout = new eui.VerticalLayout();
        this.layout = layout;

        // 背景
        this.addChild(this.background);

        // 内容
        let bodyLayout = new eui.VerticalLayout();
        bodyLayout.paddingTop = 16;
        bodyLayout.gap = 16;
        this.body.layout = bodyLayout;
        this.addChild(this.body);
        
        this.addEventListener(egret.Event.ADDED_TO_STAGE, () => {
            this.x = (this.stage.stageWidth - this.width) / 2;
            this.y = (this.stage.stageHeight - this.height) / 2;
        }, this);
    }

    setSize(width: number, height: number) {
        this.width = width;
        this.height = height;

        // 背景
        this.background.graphics.clear();
        this.background.graphics.beginFill(0x555555, 0.5);
        this.background.graphics.drawRoundRect(0, 0, this.width, this.height, 8, 8);
    }
}
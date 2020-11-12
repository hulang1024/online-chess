export default class Dialog extends eui.Group {
    _title: string;
    body = new eui.Group();
    onCancel: Function;
    onOk: Function;
    protected txtTitle: egret.TextField;
    protected background = new egret.Shape();
    protected btnCancel = new eui.Button();
    protected btnOk = new eui.Button();

    constructor() {
        super();

        let layout = new eui.VerticalLayout();
        layout.paddingTop = 16;
        layout.paddingRight = 16;
        layout.paddingBottom = 16;
        layout.paddingLeft = 16;
        this.layout = layout;

        // 背景
        this.addChild(this.background);

        // 标题
        let titleContainer = new eui.Group();
        titleContainer.height = 30;
        this.txtTitle = new egret.TextField();
        this.txtTitle.size = 20;
        this.txtTitle.bold = true;
        titleContainer.addChild(this.txtTitle);
        this.addChild(titleContainer);

        // 内容
        let bodyLayout = new eui.VerticalLayout();
        bodyLayout.paddingTop = 16;
        bodyLayout.gap = 16;
        this.body.layout = bodyLayout;
        this.addChild(this.body);

        // 底部
        let footerLayout = new eui.VerticalLayout();
        footerLayout.horizontalAlign = egret.HorizontalAlign.CONTENT_JUSTIFY;
        footerLayout.paddingTop = 24;
        footerLayout.gap = 32;
        let footer = new eui.Group();
        footer.layout = footerLayout;

        // 确定按钮
        this.btnOk.label = "确定";
        this.btnOk.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            if (this.onOk) {
                this.onOk();
            }
        }, this);
        footer.addChild(this.btnOk);

        // 取消按钮
        this.btnCancel.label = "取消";
        this.btnCancel.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            if (this.onCancel) {
                this.onCancel();
            }
            this.visible = false;
        }, this);
        footer.addChild(this.btnCancel);

        this.addChild(footer);
        
        this.addEventListener(egret.Event.ADDED_TO_STAGE, () => {
            this.width = this.stage.stageWidth;
            this.height = this.stage.stageHeight;
            footer.width = this.width - 32;

            this.background.graphics.clear();
            this.background.graphics.beginFill(0x555555, 0.7);
            this.background.graphics.drawRect(0, 0, this.width, this.height);
        }, this);
    }

    get title() {
        return this._title;
    }

    set title(value: string) {
        this._title = value;
        this.txtTitle.text = this._title;
    }

    show() {
        this.visible = true;
    }
}
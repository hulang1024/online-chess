import Overlay from "../../overlay/Overlay";

export default class ConfirmDialog extends Overlay {
    private lblTitle = new eui.Label();
    onOkClick: Function;
    onNoClick: Function;

    constructor() {
        super(true);

        this.visible = false;
        
        this.visible = false;
        this.width = 250;
        this.height = 260;

        let layout = new eui.VerticalLayout();
        layout.paddingTop = 32;
        layout.paddingRight = 32;
        layout.paddingBottom = 32;
        layout.paddingLeft = 32;
        this.layout = layout;
        let { lblTitle } = this;
        this.addChild(lblTitle);

        // 按钮组
        let group = new eui.Group();
        {
            group.width = this.width - 64;
            let layout = new eui.VerticalLayout();
            layout.horizontalAlign = egret.HorizontalAlign.CONTENT_JUSTIFY;
            layout.paddingTop = 32;
            layout.gap = 24;
            group.layout = layout;
            this.addChild(group);
        }

        let btnOk = new eui.Button();
        btnOk.width = 130;
        btnOk.label = "同意";
        btnOk.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            this.onOkClick(); 
            this.visible = false;
        }, this);
        group.addChild(btnOk);

        let btnNo = new eui.Button();
        btnNo.width = 130;
        btnNo.label = "不同意";
        btnNo.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            this.onNoClick();
            this.visible = false;
        }, this);
        group.addChild(btnNo);
    }

    open(subject: string) {
        this.parent.setChildIndex(this, 1000);
        this.lblTitle.text = `对方想要${subject}`;
        this.visible = true;
    }
}
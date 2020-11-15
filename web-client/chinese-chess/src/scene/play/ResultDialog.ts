import Dialog from "../../component/Dialog";
import Overlay from "../../component/Overlay";

export default class ResultDialog extends Overlay {
    private lblResult = new eui.Label();
    onOk: Function;

    constructor() {
        super(true);

        this.visible = false;
        this.width = 200;
        this.height = 200;

        let layout = new eui.VerticalLayout();
        layout.paddingTop = 32;
        layout.paddingRight = 32;
        layout.paddingBottom = 32;
        layout.paddingLeft = 32;
        this.layout = layout;

        this.lblResult.size = 24;
        this.lblResult.width = this.width - 64;
        this.lblResult.textAlign = egret.HorizontalAlign.CENTER;
        this.addChild(this.lblResult);

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
        btnOk.label = "确定";
        btnOk.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            this.onOk();
            this.visible = false;
        }, this);
        group.addChild(btnOk);
    }

    show(isWin: boolean) {
        this.parent.setChildIndex(this, 10000);
        this.visible = true;
        this.lblResult.text = isWin == null ? '平局' : isWin ? '你赢了!' : '你输了';
    }
}
import Overlay from "../../component/Overlay";

export default class PlayingRoundButtonsOverlay extends Overlay {
    btnWhiteFlag = new eui.Button();
    btnChessDraw = new eui.Button();
    btnWithdraw = new eui.Button();

    constructor() {
        super(true);

        this.visible = false;
        this.width = 200;
        this.height = 260;

        // 对局中按钮组
        let group = new eui.Group();
        group.width = this.width;
        let layout = new eui.VerticalLayout();
        layout.horizontalAlign = egret.HorizontalAlign.CONTENT_JUSTIFY;
        layout.paddingTop = 32;
        layout.paddingRight = 32;
        layout.paddingBottom = 32;
        layout.paddingLeft = 32;
        layout.gap = 24;
        group.layout = layout;
        this.addChild(group);

        // 悔棋按钮
        let { btnWithdraw } = this;
        btnWithdraw.enabled = false;
        btnWithdraw.width = 130;
        btnWithdraw.label = "悔棋";
        btnWithdraw.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            this.visible = false;
            this.btnWithdraw.enabled = false;
        }, this);
        group.addChild(btnWithdraw);
        
        // 认输按钮
        let { btnWhiteFlag } = this;
        btnWhiteFlag.enabled = false;
        btnWhiteFlag.width = 130;
        btnWhiteFlag.label = "认输";
        btnWhiteFlag.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            this.visible = false;
        }, this);
        group.addChild(btnWhiteFlag);

        // 和棋按钮
        let { btnChessDraw } = this;
        btnChessDraw.enabled = false;
        btnChessDraw.width = 130;
        btnChessDraw.label = "和棋";
        btnChessDraw.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            this.visible = false;
        }, this);
        group.addChild(btnChessDraw);
    }

    toggle() {
        this.parent.setChildIndex(this, this.visible ? 1 : 10000);
        this.visible = !this.visible;
    }

    onPlaying(playing: boolean) {
        this.btnWhiteFlag.enabled = playing;
        this.btnChessDraw.enabled = playing;
        this.btnWithdraw.enabled = false;
    }

    setCanWithdraw(enabled: boolean) {
        this.btnWithdraw.enabled = enabled;
    }
}
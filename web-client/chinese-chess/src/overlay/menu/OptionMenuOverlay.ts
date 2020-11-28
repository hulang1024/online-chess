import Overlay from "../Overlay";
import MenuOption from "./MenuOption";

export default class OptionMenuOverlay extends Overlay {
    private group = new eui.Group();

    constructor(options?: MenuOption[]) {
        super(true);

        this.visible = false;
        this.width = 200;

        this.group.width = this.width;
        let layout = new eui.VerticalLayout();
        layout.horizontalAlign = egret.HorizontalAlign.CONTENT_JUSTIFY;
        layout.paddingTop = 32;
        layout.paddingRight = 32;
        layout.paddingBottom = 32;
        layout.paddingLeft = 32;
        layout.gap = 24;
        this.group.layout = layout;
        this.addChild(this.group);

        if (options) {
            this.showOptions(options);
        }
    }

    public showOptions(options: MenuOption[]) {
        super.show();

        this.height = 110 + 24 * options.length + options.length * 50;
        this.setSize(this.width, this.height);
        this.setCenter();

        this.group.removeChildren();

        options.forEach(option => {
            let btnOption = new eui.Button();
            btnOption.width = 130;
            btnOption.label = option.label;
            btnOption.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
                option.onTap();
                this.hide();
            }, this);
            this.group.addChild(btnOption);
        });
        
        let btnCloseOption = new eui.Button();
        btnCloseOption.width = 130;
        btnCloseOption.label = '关闭';
        btnCloseOption.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            this.hide();
        }, this);
        this.group.addChild(btnCloseOption);
    }
}
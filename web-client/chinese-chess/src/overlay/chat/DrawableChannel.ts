import Channel from "./Channel";
import ChatLine from "./ChatLine";
import Message from "./Message";

export default class DrawableChannel extends eui.Group {
    private _channel: Channel;
    private container: eui.Group;
    private scroller = new eui.Scroller();

    constructor(channel: Channel, scrollerHeight: number) {
        super();
        this._channel = channel;

        this.name = channel.name;

        this.container = new eui.Group();
        let layout = new eui.VerticalLayout();
        layout.paddingLeft = 8;
        this.container.layout = layout;

        let { scroller } = this;
        scroller.viewport = this.container;
        scroller.height = scrollerHeight;

        this.addEventListener(egret.Event.ADDED_TO_STAGE, () => {
            scroller.width = this.stage.stageWidth;
            this.addChild(scroller);

            scroller.verticalScrollBar.autoVisibility = false;
            scroller.verticalScrollBar.visible = true;     
        }, this);
    }

    get channel() {
        return this._channel;
    }

    addNewMessage(msg: Message) {
        this.container.addChild(new ChatLine(msg));
        if (this.scroller.viewport.contentHeight >= this.scroller.height) {
            this.scroller.viewport.scrollV += 20;
        }
    }
}
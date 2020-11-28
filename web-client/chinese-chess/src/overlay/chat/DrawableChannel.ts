import Channel from "../../online/chat/Channel";
import ChatLine from "./ChatLine";
import Message from "../../online/chat/Message";

export default class DrawableChannel extends eui.Group {
    public channel: Channel;
    private container: eui.Group;
    private scroller = new eui.Scroller();

    constructor(channel: Channel, scrollerHeight: number) {
        super();
        this.channel = channel;

        this.name = channel.name;

        this.container = new eui.Group();
        let layout = new eui.VerticalLayout();
        layout.gap = 8;
        layout.paddingTop = 8;
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

        channel.newMessagesArrived.add(this.onNewMessagesArrive, this);
        channel.messageRemoved.add(this.onMessageRemove, this);

        this.onNewMessagesArrive(this.channel.messages);
    }

    public onOpen() {
        this.scroller.validateNow();
    }

    private onNewMessagesArrive(msgs: Message[]) {
        msgs.forEach(msg => {
            let chatLine = new ChatLine(msg);
            if (msg.id) {
                chatLine.name = msg.id + '';
            }
            this.container.addChild(chatLine);
        });
        this.scroller.validateNow();
        let contentHeight = this.scroller.viewport.contentHeight;
        if (contentHeight >= this.scroller.height) {
            this.scroller.viewport.scrollV = contentHeight - this.scroller.height;
        }
    }

    private onMessageRemove(messageId: number) {
        let chatLine = this.container.getChildByName(messageId + '');
        if (chatLine) {
            this.container.removeChild(chatLine);
        }
    }
}
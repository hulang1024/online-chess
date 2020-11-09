import formatTime from "../../utils/time";
import ChatChannel from "./ChatChannel";
import Message from "./Message";

export default class ChannelMessagePane extends eui.Group {
    private _channel: ChatChannel;
    private container: eui.Group;
    private scroller = new eui.Scroller();

    constructor(channel: ChatChannel, scrollerHeight: number) {
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
            scroller.viewport.scrollV     
        }, this);
    }

    get channel() {
        return this._channel;
    }

    addMessage(msg: Message) {
        this.container.addChild(this.createMessageRow(msg));
        if (this.scroller.viewport.contentHeight >= this.scroller.height) {
            this.scroller.viewport.scrollV += 36;
        }
    }

    createMessageRow(msg: Message) {
        let layout = new eui.HorizontalLayout();
        layout.gap = 16;
        let container = new eui.Group();
        container.layout = layout;

        let headLayout = new eui.HorizontalLayout();
        headLayout.horizontalAlign = egret.HorizontalAlign.CENTER;
        let group = new eui.Group();
        group.layout = headLayout;

        // 时间
        let txtTime = new eui.Label();
        txtTime.text = formatTime(new Date());
        txtTime.size = 18;
        group.addChild(txtTime);

        // 昵称
        let txtNickname = new eui.Label();
        txtNickname.width = 130;
        txtNickname.textColor = msg.isFromMe ? 0xcc2200 : 0xffffff;
        txtNickname.text = msg.fromUserNickname + ':';
        txtNickname.size = 20;
        txtNickname.textAlign = egret.HorizontalAlign.RIGHT;
        group.addChild(txtNickname);

        container.addChild(group);

        // 内容
        let txtContent = new eui.Label();
        txtContent.text = msg.content;
        txtContent.size = 20;
        container.addChild(txtContent);

        return container;
    }

}
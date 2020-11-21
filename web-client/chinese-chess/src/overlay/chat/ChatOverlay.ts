import Overlay from "../Overlay";
import DrawableChannel from "./DrawableChannel";
import Channel from "../../online/chat/Channel";
import MessageInput from "./MessageInput";
import ChannelManager from "../../online/chat/ChannelManager";
import messager from "../../component/messager";

export default class ChatOverlay extends Overlay {
    private tabBar = new eui.TabBar();
    private viewStack = new eui.ViewStack();
    private manager: ChannelManager;
    private messageInput = new MessageInput();
    private maxY: number;
    private minY: number;
    private popIned: boolean;

    constructor(manager: ChannelManager) {
        super(false, false);
        this.manager = manager;

        this.visible = true;
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);

        let lblTitle = new eui.Label();
        lblTitle.top = 16;
        lblTitle.left = 8;
        lblTitle.size = 20;
        lblTitle.text = '聊天';
        lblTitle.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            this.popIn();
        }, this);
        this.addChild(lblTitle);

        this.tabBar.x = 60;
        this.tabBar.dataProvider = this.viewStack;
        this.tabBar.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onTabSelected, this);
        this.addChild(this.tabBar);
        this.viewStack.y = 60;
        this.addChild(this.viewStack);
    }

    async onAddToStage() {
        this.width = this.stage.stageWidth;
        this.height = this.stage.stageHeight / 2.3;
        this.setSize(this.stage.stageWidth, this.height);
        this.minY = this.stage.stageHeight;
        this.maxY = this.stage.stageHeight - this.height;
        this.y = this.minY;

        let { messageInput } = this;
        messageInput.x = this.width - messageInput.width - 8;
        messageInput.y = this.height - messageInput.height - 8;
        messageInput.onSend = (text: string) => {
            if (text.length > 100) {
                messager.fail('消息过长',this);
                return false;
            }
            this.manager.postMessage(text);
            return true;
        }
        this.addChild(messageInput);

        this.manager.onJoinChannel = (channel: Channel) => {
            let drawableChannel = new DrawableChannel(
                channel,
                this.height - this.messageInput.height - 80);
            drawableChannel.name = channel.name;
            this.viewStack.addChild(drawableChannel);
            
            this.viewStack.selectedIndex++;
        };

        this.manager.onLeaveChannel = (channel: Channel) => {
            let drawableChannel = this.viewStack.getChildByName(channel.name);
            this.viewStack.removeChild(drawableChannel);
            // 暂时默认1
            this.manager.openChannel(1);
        };

        this.manager.onOpenChannel = (channel: Channel) => {
            let drawableChannel = this.viewStack.getChildByName(channel.name);
            this.viewStack.selectedChild = drawableChannel;
        };
    }

    private onTabSelected(event: eui.ItemTapEvent) {
        this.manager.openChannel(this.manager.joinedChannels[event.itemIndex].id);
    }

    toggle() {
        if (this.popIned) {
            this.popOut();
        } else {
            this.popIn();
        }
    }

    popIn() {
        const duration = 200;
        egret.Tween.get(this).to({alpha: 1}, duration, egret.Ease.quintOut);
        egret.Tween.get(this).to({y: this.maxY}, duration, egret.Ease.quintOut).call(() => {
            this.popIned = true;
        });
    }

    popOut() {
        const duration = 200;
        this.parent.setChildIndex(this, 10000);
        egret.Tween.get(this).to({alpha: 0}, duration, egret.Ease.sineIn);
        egret.Tween.get(this).to({y: this.minY}, duration, egret.Ease.sineIn).call(() => {
            this.popIned = false;
        });
    }
}
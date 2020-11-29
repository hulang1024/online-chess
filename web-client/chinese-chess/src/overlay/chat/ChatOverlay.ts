import Overlay from "../Overlay";
import DrawableChannel from "./DrawableChannel";
import Channel from "../../online/chat/Channel";
import MessageInput from "./MessageInput";
import ChannelManager from "../../online/chat/ChannelManager";
import messager from "../../component/messager";
import ChatLine from "./ChatLine";
import Message from "../../online/chat/Message";
import ChannelType from "../../online/chat/ChannelType";

export default class ChatOverlay extends Overlay {
    private tabBar = new eui.TabBar();
    private viewStack = new eui.ViewStack();
    private manager: ChannelManager;
    private messageInput;
    private maxY: number;
    private minY: number;
    private popIned: boolean;

    constructor(manager: ChannelManager) {
        super(false, false, 0.6);
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
        this.height = this.stage.stageHeight / 2 - 140;
        this.setSize(this.stage.stageWidth, this.height);
        this.minY = this.stage.stageHeight;
        this.maxY = this.stage.stageHeight - this.height;
        this.y = this.minY;

        let messageInput = new MessageInput(this.stage.stageWidth - ChatLine.NICKNAME_PADDING - 8);
        this.messageInput = messageInput;
        messageInput.x = ChatLine.NICKNAME_PADDING;
        messageInput.y = this.height - messageInput.height - 8;
        messageInput.onSend = (text: string) => {
            if (text.length > 100) {
                messager.fail('消息过长',this);
                return false;
            }

            if (text[0] == '/' && text.length > 1) {
                this.manager.postCommand(text);
            } else {
                this.manager.postMessage(text);
            }
            return true;
        }
        this.addChild(messageInput);

        this.manager.joinedChannels.added.add((channel: Channel) => {
            channel.newMessagesArrived.add((messages: Message[]) => {
                let last = messages[messages.length - 1];
                if (last.sender.id > 0) {
                    if (channel.type == ChannelType.PM) {
                        if (!this.popIned) {
                            this.popIn();
                        }
                        this.manager.openPrivateChannel(last.sender);
                    }
                    if (channel.type == ChannelType.ROOM) {
                        if (!this.popIned) {
                            this.popIn();
                        }
                        this.manager.openChannel(channel.id);
                    }
                }
            });
            if (!this.popIned) {
                this.popIn();
            }
        });

        this.manager.joinedChannels.removed.add((channel: Channel) => {
            this.removeChannel(channel);
        });

        this.manager.currentChannel.changed.add((channel: Channel) => {
            let drawableChannel = <DrawableChannel>this.viewStack.getChildByName(channel.name);
            if (drawableChannel == null) {
                drawableChannel = this.addChannel(channel);
            }

            if (!this.popIned) {
                this.popIn();
            }

            this.viewStack.selectedChild = drawableChannel;
            drawableChannel.onOpen();
        });

        this.manager.onHideChannel = (channel: Channel) => {
            let drawableChannel = this.viewStack.getChildByName(channel.name);
            this.viewStack.removeChild(drawableChannel);
            // 暂时默认1
            this.manager.openChannel(1);
        }
    }

    private onTabSelected(event: eui.ItemTapEvent) {
        let drawableChannel = <DrawableChannel>this.viewStack.getChildByName(event.item);
        this.manager.openChannel(drawableChannel.channel.id);
        drawableChannel.onOpen();
    }

    private addChannel(channel: Channel) {
        let drawableChannel = new DrawableChannel(
            channel,
            this.height - this.messageInput.height - 80);
        drawableChannel.name = channel.name;
        this.viewStack.addChild(drawableChannel);

        return drawableChannel;
    }

    private removeChannel(channel: Channel) {
        let drawableChannel = this.viewStack.getChildByName(channel.name);
        this.viewStack.removeChild(drawableChannel);
    }

    toggle() {
        if (this.popIned) {
            this.popOut();
        } else {
            this.popIn();
        }
    }

    popIn() {
        this.popIned = true;
        const duration = 200;
        egret.Tween.get(this).to({alpha: 1}, duration, egret.Ease.quintOut);
        egret.Tween.get(this).to({y: this.maxY}, duration, egret.Ease.quintOut);
    }

    popOut() {
        this.popIned = false;
        const duration = 200;
        this.parent.setChildIndex(this, 10000);
        egret.Tween.get(this).to({alpha: 0}, duration, egret.Ease.sineIn);
        egret.Tween.get(this).to({y: this.minY}, duration, egret.Ease.sineIn);
    }
}
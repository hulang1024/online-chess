import Overlay from "../../component/Overlay";
import socketClient from "../../online/socket";
import DrawableChannel from "./DrawableChannel";
import ChatChannel from "./Channel";
import MessageInput from "./MessageInput";
import platform from "../../Platform";
import User from "../../user/User";

export default class ChatOverlay extends Overlay {
    private tabBar = new eui.TabBar();
    private viewStack = new eui.ViewStack();
    private channels: Array<DrawableChannel> = [];
    private messageInput = new MessageInput();

    constructor() {
        super(false);

        this.visible = false;
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);

        this.viewStack.y = 60;
        this.tabBar.dataProvider = this.viewStack;
        this.addChild(this.viewStack);
        this.addChild(this.tabBar);
    }

    onAddToStage() {
        this.width = this.stage.stageWidth;
        this.height = this.stage.stageHeight / 2.8;
        this.setSize(this.stage.stageWidth, this.height);
        this.y = this.stage.stageHeight - this.height;
        this.visible = true;

        let { messageInput } = this;
        messageInput.x = this.width - messageInput.width - 8;
        messageInput.y = this.height - messageInput.height - 8;
        messageInput.onSend = (msg: string) => {
            socketClient.send('chat.message', {
                channelId: this.channels[this.tabBar.selectedIndex].channel.id,
                content: msg
            });
        }
        this.addChild(messageInput);

        this.loadChannels();
        this.channels[0].addNewMessage({
            fromUid: User.SYSTEM.id,
            fromUserNickname: User.SYSTEM.nickname,
            content: '欢迎来到中国象棋在线',
        });
        this.viewStack.selectedIndex = 0;

        socketClient.add('chat.message', (msg: any) => {
            let channelMessagePane = this.channels.filter(pane => pane.channel.id == msg.channelId)[0];
            msg.isFromMe = platform.getUserInfo().id == msg.fromUid;
            channelMessagePane.addNewMessage(msg);
        });
    }

    toggleVisible() {
        this.visible = !this.visible;
        this.stage.setChildIndex(this, 10000);
    }

    show() {
        if (this.visible) {
            return;
        }
        this.visible = true;
        this.stage.setChildIndex(this, 10000);
    }

    addChannel(channel: ChatChannel) {
        let drawableChannel = new DrawableChannel(channel,
            this.height - this.messageInput.height - 80);
        this.channels.push(drawableChannel);
        this.viewStack.addChild(drawableChannel);
        
        this.viewStack.selectedIndex++;
    }

    removeChannel(channelId: number) {
        let pane = this.channels.filter(pane => pane.channel.id == channelId)[0];
        this.viewStack.removeChild(pane);
        this.channels = this.channels.filter(pane => pane.channel.id != channelId);
    }

    private loadChannels() {
        let channel = new ChatChannel();
        channel.id = 1;
        channel.name = '中国象棋';
        this.addChannel(channel);
    }
}
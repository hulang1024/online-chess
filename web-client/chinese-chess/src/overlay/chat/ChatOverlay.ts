import Overlay from "../../component/Overlay";
import socketClient from "../../online/socket";
import ChannelMessagePane from "./ChannelMessagePane";
import ChatChannel from "./ChatChannel";
import messager from "../../component/messager";
import MessageInput from "./MessageInput";
import platform from "../../Platform";

export default class ChatOverlay extends Overlay {
    private tabBar = new eui.TabBar();
    private viewStack = new eui.ViewStack();
    private channelMessagePanes: Array<ChannelMessagePane> = [];
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
        this.height = this.stage.stageHeight / 3;
        this.setSize(this.stage.stageWidth, this.height);
        this.y = this.stage.stageHeight - this.height;
        this.visible = true;

        let { messageInput } = this;
        messageInput.x = this.width - messageInput.width - 8;
        messageInput.y = this.height - messageInput.height - 8;
        messageInput.onSend = (msg: string) => {
            socketClient.send('chat.message', {
                channelId: this.channelMessagePanes[this.tabBar.selectedIndex].channel.id,
                content: msg
            });
        }
        this.addChild(messageInput);

        this.loadChannels();
        this.channelMessagePanes[0].addMessage({
            fromUid: 1,
            fromUserNickname: 'problue',
            content: '欢迎来到在线中国象棋',
            isFromMe: false
        });
        this.viewStack.selectedIndex = 0;

        socketClient.add('chat.message', (msg: any) => {
            let channelMessagePane = this.channelMessagePanes.filter(pane => pane.channel.id == msg.channelId)[0];
            msg.isFromMe = platform.getUserInfo().id == msg.fromUid;
            channelMessagePane.addMessage(msg);
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
        let pane = new ChannelMessagePane(channel,
            this.height - this.messageInput.height - 80);
        this.channelMessagePanes.push(pane);
        this.viewStack.addChild(pane);
    }

    removeChannel(channelId: number) {
        let pane = this.channelMessagePanes.filter(pane => pane.channel.id == channelId)[0];
        this.viewStack.removeChild(pane);
        this.channelMessagePanes = this.channelMessagePanes.filter(pane => pane.channel.id != channelId);
    }

    private loadChannels() {
        let channel = new ChatChannel();
        channel.id = 1;
        channel.name = '中国象棋';
        this.addChannel(channel);
    }
}
import APIAccess from "../api/APIAccess";
import SocketClient from "../socket";
import Channel from "./Channel";
import ChannelType from "./ChannelType";
import ErrorMessage from "./ErrorMessage";
import GetMessagesRequest from "./GetMessagesRequest";
import InfoMessage from "./InfoMessage";
import LocalEchoMessage from "./LocalEchoMessage";
import Message from "./Message";
import PostMessageRequest from "./PostMessageRequest";

export default class ChannelManager {
    private _joinedChannels: Channel[] = [];
    private currentChannel: Channel;
    private api: APIAccess;
    private socketClient: SocketClient;
    public onOpenChannel: Function;
    public onJoinChannel: Function;
    public onLeaveChannel: Function;

    constructor(api: APIAccess, socketClient: SocketClient) {
        this.api = api;
        this.socketClient = socketClient;

        this.initSocketListeners();
    }

    get joinedChannels() {
        return this._joinedChannels;
    }

    public getChannel(channelId: number) {
        return this._joinedChannels.filter(c => c.id == channelId)[0];
    }

    public openChannel(channelId: number) {
        this.currentChannel = this._joinedChannels.filter(c => c.id == channelId)[0];
        this.onOpenChannel(this.currentChannel);
    }

    public joinChannel(channel: Channel, fetchInitalMessages: boolean = true) {
        if (!channel.joined) {
            channel.joined = true;
            this._joinedChannels.push(channel);
            this.onJoinChannel(channel);
            switch (channel.type) {
                case ChannelType.ROOM:
                    // 进入房间后已经加入
                    break;
                case ChannelType.PM:
                    //TODO
                    break;
                case ChannelType.PUBLIC:
                    break;
            }
        }
        if (fetchInitalMessages) {
            this.fetchInitalMessages(channel);
        }
        this.currentChannel = channel;
    }

    public leaveChannel(channelId: number) {
        let channel: Channel;
        let channels = this._joinedChannels;
        for (let i = 0; i < channels.length; i++) {
            if (channelId == channels[i].id) {
                channel = channels[i];
                channels.splice(i, 1);
                break;
            }
        }
        if (this.currentChannel == channel) {
            this.currentChannel = null;
        }
        
        if (channel.joined) {
            if (channel.type !== ChannelType.ROOM) { // 房间聊天频道离开已隐式（服务端）随着对局结束
                this.socketClient.send('chat.channel.leave', {channelId: channel.id});
            }
            channel.joined = false;
        }

        this.onLeaveChannel(channel);
    }

    public postMessage(text: string, isAction: boolean = false) {
        if (!this.api.isLoggedIn) {
            this.currentChannel.addNewMessages(new ErrorMessage('请先登录以参与聊天'));
            return;
        }

        if (this.currentChannel == null) {
            return;
        }

        let message = new LocalEchoMessage();
        message.channelId = this.currentChannel.id;
        message.timestamp = new Date().getTime();
        message.sender = this.api.localUser;
        message.content = text;
        message.isAction = isAction;

        //this.currentChannel.addLocalEcho(message);

        let postMessagesRequest = new PostMessageRequest(message);
        postMessagesRequest.success = (msgs) => {
            
        }
        postMessagesRequest.failure = (msgs) => {
            this.currentChannel.addNewMessages(new ErrorMessage('消息发送失败'));
        }

        this.api.queue(postMessagesRequest);
    }

    public postCommand(text: string) {
        if (this.currentChannel == null) {
            return;
        }

        const tokens = text.substring(1).split(' ');
        const command = tokens[0];

        switch (command) {
            case 'words':
            case 'recall':
            case 'roll':
                this.postMessage(text, true);
                break;
            case 'help':
                let helpText = '可用命令：摇骰子：/roll [最大点]'
                this.currentChannel.addNewMessages(new InfoMessage(helpText));
                break;
            default:
                this.postMessage(text);
        }
    }

    public loadDefaultChannels() {
        let channel = new Channel();
        channel.id = 1;
        channel.type = ChannelType.PUBLIC;
        channel.name = '中国象棋';

        this.joinChannel(channel);
    }

    private async initSocketListeners() {
        this.socketClient.add('chat.message', (msg: any) => {
            let channel = this.getChannel(msg.channelId);
            channel.addNewMessages(msg);
        });
        this.socketClient.add('chat.recall_message', (msg: any) => {
            let channel = this.getChannel(msg.channelId);
            channel.removeMessage(msg.messageId);
        });
        this.socketClient.reconnectedSignal.add(() => {
            if (!this.currentChannel) {
                return;
            }
            this.fetchInitalMessages(this.currentChannel);
        });
    }

    private fetchInitalMessages(channel: Channel) {
        let getMessagesRequest = new GetMessagesRequest(channel);
        getMessagesRequest.success = (msgs) => {
            this.handleChannelMessages(msgs);
        }
        this.api.queue(getMessagesRequest);
    }

    private handleChannelMessages(messages: Message[]) {
        let channels = this._joinedChannels;
        let channelMap = channels.reduce((map, c) => (map[c.id] = c, map), {});
        messages.forEach(msg => {
            channelMap[msg.channelId].addNewMessages(msg);
        });
    }
}
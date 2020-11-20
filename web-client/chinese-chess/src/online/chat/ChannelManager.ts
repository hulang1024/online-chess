import APIAccess from "../api/APIAccess";
import socketClient from "../socket";
import Channel from "./Channel";
import ChannelType from "./ChannelType";
import GetMessagesRequest from "./GetMessagesRequest";
import InfoMessage from "./InfoMessage";
import LocalEchoMessage from "./LocalEchoMessage";
import Message from "./Message";
import PostMessageRequest from "./PostMessageRequest";

export default class ChannelManager {
    private _joinedChannels: Channel[] = [];
    private currentChannel: Channel;

    onOpenChannel: Function;
    onJoinChannel: Function;
    onLeaveChannel: Function;

    constructor() {
        this.initSocketListeners();
    }

    get joinedChannels() {
        return this._joinedChannels;
    }

    openChannel(channelId: number) {
        this.currentChannel = this._joinedChannels.filter(c => c.id == channelId)[0];
        this.onOpenChannel(this.currentChannel);
    }

    joinChannel(channel: Channel, fetchInitalMessages: boolean = true) {
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

    leaveChannel(channelId: number) {
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
                socketClient.send('chat.channel.leave', {channelId: channel.id});
            }
            channel.joined = false;
        }

        this.onLeaveChannel(channel);
    }

    postMessage(text: string) {
        let message = new LocalEchoMessage();
        message.channelId = this.currentChannel.id;
        message.timestamp = new Date().getTime();
        message.sender = APIAccess.localUser;
        message.content = text;
        /*
        this.currentChannel.addLocalEcho(message);*/
        let postMessagesRequest = new PostMessageRequest(message);
        postMessagesRequest.success = (msgs) => {
        }
        postMessagesRequest.failure = (msgs) => {
        }
        postMessagesRequest.perform();
    }

    loadDefaultChannels() {
        let channel = new Channel();
        channel.id = 1;
        channel.type = ChannelType.PUBLIC;
        channel.name = '中国象棋';

        this.joinChannel(channel);
        
        let welcome = new InfoMessage();
        welcome.channelId = 1;
        welcome.content = '欢迎来到在线中国象棋';
        channel.addNewMessages([welcome]);
    }

    private async initSocketListeners() {
        socketClient.add('chat.message', (msg: any) => {
            let channel = this._joinedChannels.filter(c => c.id == msg.channelId)[0];
            msg.isFromMe = APIAccess.localUser.id == msg.sender.id;
            channel.addNewMessages([msg]);
        });

        socketClient.reconnectedSignal.add(() => {
            if (!this.currentChannel) {
                return;
            }
            this.fetchInitalMessages(this.currentChannel);
        });
    }

    private async fetchInitalMessages(channel: Channel) {
        await socketClient.connect();
        let getMessagesRequest = new GetMessagesRequest(channel);
        getMessagesRequest.success = (msgs) => {
            this.handleChannelMessages(msgs);
        }
        getMessagesRequest.perform();
    }

    private handleChannelMessages(messages: Message[]) {
        let channels = this._joinedChannels;
        let channelMap = channels.reduce((map, c) => (map[c.id] = c, map), {});
        messages.forEach(msg => {
            channelMap[msg.channelId].addNewMessages([msg]);
        });
    }
}
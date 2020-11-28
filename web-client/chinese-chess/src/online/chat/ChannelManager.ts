import User from "../../user/User";
import Bindable from "../../utils/bindables/Bindable";
import BindableList from "../../utils/bindables/BindableList";
import APIAccess from "../api/APIAccess";
import SocketClient from "../ws/socket";
import Channel from "./Channel";
import ChannelType from "./ChannelType";
import CreateChannelRequest from "./CreateChannelRequest";
import CreateNewPrivateMessageRequest from "./CreateNewPrivateMessageRequest";
import ErrorMessage from "./ErrorMessage";
import GetMessagesRequest from "./GetMessagesRequest";
import InfoMessage from "./InfoMessage";
import ListChannelsRequest from "./ListChannelsRequest";
import LocalEchoMessage from "./LocalEchoMessage";
import Message from "./Message";
import PostMessageRequest from "./PostMessageRequest";

export default class ChannelManager {
    public readonly currentChannel: Bindable<Channel> = new Bindable<Channel>();

    public readonly availableChannels: BindableList<Channel> = new BindableList<Channel>();
    public readonly joinedChannels: BindableList<Channel> = new BindableList<Channel>();
    private api: APIAccess;
    private socketClient: SocketClient;
    private channelsInitialised: boolean;

    public onHideChannel: Function;

    constructor(api: APIAccess, socketClient: SocketClient) {
        this.api = api;
        this.socketClient = socketClient;
        this.initSocketListeners();
    }

    public openChannel(channelId: number) {
        this.currentChannel.value = this.getChannel(channelId);
    }

    private readonly closeTipMessage = new ErrorMessage('使用命令/close关闭当前频道');
    public openPrivateChannel(user: User) {
        if (user.id == this.api.localUser.id) {
            return;
        }

        this.currentChannel.value = this.joinedChannels
            .filter((c: Channel) => c.type == ChannelType.PM
                && c.users.length == 1
                && c.users[0].id == user.id)[0]
            || this.joinChannel(new Channel(user), false);

        if (this.currentChannel.value.messages
            .filter(m => m.id == this.closeTipMessage.id).length == 0) {
            this.currentChannel.value.addNewMessages(this.closeTipMessage);
        }
    }

    public joinChannel(channel: Channel, fetchInitalMessages: boolean = true): Channel {
        channel = this.getChannel(channel, false, true);

        if (!channel.joined.value) {
            channel.joined.value = true;
            switch (channel.type) {
                case ChannelType.ROOM:
                    // 进入房间后已经加入
                    break;
                case ChannelType.PM:
                    let request = new CreateChannelRequest(channel);
                    request.success = (resChannel) => {
                        if (resChannel.channelId) {
                            channel.id = resChannel.channelId;
                        }
                        if (resChannel.recentMessages) {
                            this.handleChannelMessages(resChannel.recentMessages.map(Message.from));
                        }
                    };
                    this.api.queue(request);
                    break;
                case ChannelType.PUBLIC:
                    break;
            }
        }

        if (fetchInitalMessages) {
            this.fetchInitalMessages(channel);
        }

        this.currentChannel.value = channel;

        return channel;
    }

    private getChannel(channelId: number | Channel, addToAvailable: boolean = false, addToJoined: boolean = false): Channel {
        let lookup: Channel;
        if (typeof channelId == 'number') {
            lookup = new Channel();
            lookup.id = <number>channelId;
        } else {
            lookup = <Channel>channelId;
        }

        let found: Channel;

        let available = this.availableChannels.filter(c => c.id == lookup.id)[0];
        if (available) {
            found = available;
        }
        let joined = this.joinedChannels.filter(c => c.id == lookup.id)[0];
        if (found == null && joined != null) {
            found = joined;
        }
        if (found == null) {
            found = lookup;

            found.users = found.users.filter(u => u.id != this.api.localUser.id);
        }

        if (joined == null && addToJoined) {
            this.joinedChannels.add(found);
        }
        if (available == null && addToAvailable) {
            this.availableChannels.add(found);
        }

        return found;
    }

    public leaveChannel(channelId: number) {
        let channel: Channel = this.getChannel(channelId);
        if (channel.joined.value) {
             // 房间聊天频道离开已隐式（服务端）随着对局结束
            if (channel.type !== ChannelType.ROOM) {
                //todo: leave
            }
            channel.joined.value = false;
        }

        this.joinedChannels.removeIf((ch: Channel) => ch.id == channelId);

        if (this.currentChannel.value == channel) {
            //TODO: 默认一个
            this.currentChannel.value = this.getChannel(1);
        }
    }

    public postMessage(text: string, isAction: boolean = false) {
        let target = this.currentChannel.value;

        if (!this.api.isLoggedIn.value) {
            target.addNewMessages(new ErrorMessage('请先登录以参与聊天'));
            return;
        }

        if (target == null) {
            return;
        }

        let message = new LocalEchoMessage();
        message.channelId = target.id;
        message.timestamp = new Date().getTime();
        message.sender = this.api.localUser;
        message.content = text;
        message.isAction = isAction;

        //this.currentChannel.addLocalEcho(message);

        // 如果这是一个私聊频道并且是第一条消息，需要一个特殊请求创建频道
        if (target.type == ChannelType.PM/* && target.id == 0*//*todo:暂时全部临时消息 */) {
            let request = new CreateNewPrivateMessageRequest(target.users[0], message);
            request.success = (res) => {
                target.id = res.channelId;
            };
            request.failure = () => {
                target.addNewMessages(new ErrorMessage('消息发送失败，对方可能不在线'));
            };
            this.api.queue(request);
            return;
        }

        let postMessagesRequest = new PostMessageRequest(message);
        postMessagesRequest.success = (msgs) => {
            
        }
        postMessagesRequest.failure = (msgs) => {
            let errorText = '消息发送失败';
            if (target.type == ChannelType.PM) {
                errorText += '，对方可能不在线';
                target.id = 0;
            }
            target.addNewMessages(new ErrorMessage(errorText));
        }

        this.api.queue(postMessagesRequest);
    }

    public postCommand(text: string) {
        let target = this.currentChannel.value;

        if (target == null) {
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
                target.addNewMessages(new InfoMessage(helpText));
                break;
            case 'close':
                if (target.type == ChannelType.PM) {
                    this.onHideChannel(target);
                }
                break;
            default:
                this.postMessage(text);
        }
    }

    public initializeChannels() {
        if (this.channelsInitialised) {
            return;
        }

        this.channelsInitialised = true;

        [[1,'#象棋']].forEach(([id, name]) => {
            let channel = new Channel();
            channel.id = <number>id;
            channel.type = ChannelType.PUBLIC;
            channel.name = <string>name;
            this.joinChannel(channel);
        });

        let listChannels = () => {
            let req = new ListChannelsRequest();
            req.success = (channels) => {
                channels.forEach((ch: any) => {
                    let channel = Channel.from(ch);

                    this.getChannel(channel, true);
                });
            };
            this.api.queue(req);
        }

        this.api.isLoggedIn.changed.add((isLoggedIn: boolean) => {
            if (!isLoggedIn) {
                return;
            }

            listChannels();
        });

        if (this.api.isLoggedIn.value) {
            listChannels();
        }
    }

    private async initSocketListeners() {
        this.socketClient.add('chat.message', (msg: any) => {
            let channel = this.getChannel(msg.channelId);
            channel.addNewMessages(Message.from(msg));
        });

        this.socketClient.add('chat.presence', (msg: any) => {
            let channel = Channel.from(msg.channel);
            channel.joined.value = true; // 从服务器接收到的频道应该都是已经加入的
            if (channel.type == ChannelType.PM) {                    
                channel.name = msg.sender.nickname;
                this.joinChannel(channel, false);
                this.openPrivateChannel(msg.sender);
            }
        });

        this.socketClient.add('chat.user_left', (msg: any) => {
            let channel = this.getChannel(msg.channelId);
            if (channel.type == ChannelType.PM) {
                // 该私聊频道中的对话用户已经离开
                channel.addNewMessages(new InfoMessage('对方已下线'));
            }
        });

        this.socketClient.add('chat.recall_message', (msg: any) => {
            let channel = this.getChannel(msg.channelId);
            channel.removeMessage(msg.messageId);
        });

        this.socketClient.reconnectedSignal.add(() => {
            if (!this.currentChannel.value) {
                return;
            }
            this.fetchInitalMessages(this.currentChannel.value);
        });
    }

    private fetchInitalMessages(channel: Channel) {
        if (channel.messagesLoaded) return;
        let getMessagesRequest = new GetMessagesRequest(channel);
        getMessagesRequest.success = (msgs) => {
            this.handleChannelMessages(msgs.map(Message.from));
            channel.messagesLoaded = true;
        }
        this.api.queue(getMessagesRequest);
    }

    private handleChannelMessages(messages: Message[]) {
        let channels = this.joinedChannels;
        let channelMap = channels.reduce((map, c) => (map[c.id] = c, map), {});
        messages.forEach(msg => {
            channelMap[msg.channelId].addNewMessages(msg);
        });
    }
}
import { api, socketService } from "src/boot/main";
import Signal from "src/utils/signals/Signal";
import User from "../../user/User";
import Bindable from "../../utils/bindables/Bindable";
import BindableList from "../../utils/bindables/BindableList";
import APIAccess from "../api/APIAccess";
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
import SocketService from "../ws/SocketService";
import * as ChatServerMsgs from './chat_server_messages';
import APICreatedChannel from "./APICreatedChannel";

export default class ChannelManager {
  public readonly currentChannel: Bindable<Channel> = new Bindable<Channel>();

  public readonly availableChannels: BindableList<Channel> = new BindableList<Channel>();

  public readonly joinedChannels: BindableList<Channel> = new BindableList<Channel>();

  public readonly wordsEnableSignal = new Signal();

  private api: APIAccess = api;

  private socketService: SocketService = socketService;

  private channelsInitialised: boolean;

  public onHideChannel: (channel: Channel) => void;

  constructor() {
    this.initSocketListeners();
  }

  public openChannel(channelId: number) {
    this.currentChannel.value = this.getChannel(channelId);
  }

  private readonly closeTipMessage = new InfoMessage('使用命令/close关闭当前频道');

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
      .filter((m) => m.id == this.closeTipMessage.id).length == 0) {
      this.currentChannel.value.addNewMessages(this.closeTipMessage);
    }
  }

  public joinChannel(channel: Channel, fetchInitalMessages = true): Channel {
    channel = this.getChannel(channel, false, true);

    if (!channel.joined.value) {
      channel.joined.value = true;
      switch (channel.type) {
        case ChannelType.ROOM:
          // 进入房间后已经加入
          break;
        case ChannelType.PM: {
          const request = new CreateChannelRequest(channel);
          request.success = (resChannel: APICreatedChannel) => {
            if (resChannel.channelId) {
              channel.id = resChannel.channelId;
            }
            if (resChannel.recentMessages) {
              this.handleChannelMessages(resChannel.recentMessages.map((m) => Message.from(m)));
            }
          };
          this.api.queue(request);
        }
          break;
        case ChannelType.PUBLIC:
          break;
        default:
          break;
      }
    }

    if (fetchInitalMessages) {
      this.fetchInitalMessages(channel);
    }

    this.currentChannel.value = channel;

    return channel;
  }

  private getChannel(
    channelId: number | Channel, addToAvailable = false, addToJoined = false,
  ) : Channel {
    let lookup: Channel;
    if (typeof channelId == 'number') {
      lookup = new Channel();
      lookup.id = channelId;
    } else {
      lookup = channelId;
    }

    let found: Channel | null = null;

    const available = this.availableChannels.filter((c) => c.id == lookup.id)[0];
    if (available) {
      found = available;
    }
    const joined = (lookup.type == ChannelType.PM && lookup.id == 0)
      ? null
      : this.joinedChannels.filter((c) => c.id == lookup.id)[0];
    if (found == null && joined != null) {
      found = joined;
    }
    if (found == null) {
      found = lookup;

      found.users = found.users.filter((u) => u.id != this.api.localUser.id);
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
    const channel: Channel = this.getChannel(channelId);
    if (channel.joined.value) {
      // 房间聊天频道离开已隐式（服务端）随着对局结束
      if (channel.type !== ChannelType.ROOM) {
        // todo: leave
      }
      channel.joined.value = false;
    }

    this.joinedChannels.removeIf((ch: Channel) => ch.id == channelId);

    if (this.currentChannel.value == channel) {
      // TODO: 默认一个
      this.currentChannel.value = this.getChannel(1);
    }
  }

  public postMessage(text: string, isAction = false, channel?: Channel) {
    const target = channel || this.currentChannel.value;

    if (!this.api.isLoggedIn) {
      target.addNewMessages(new ErrorMessage('请先登录以参与聊天'));
      return;
    }

    if (target == null) {
      return;
    }

    const message = new LocalEchoMessage();
    message.channelId = target.id;
    message.timestamp = new Date().getTime();
    message.sender = this.api.localUser;
    message.content = text;
    message.isAction = isAction;

    // this.currentChannel.addLocalEcho(message);

    // 如果这是一个私聊频道并且是第一条消息，需要一个特殊请求创建频道
    if (target.type == ChannelType.PM) {
      const request = new CreateNewPrivateMessageRequest(target.users[0], message);
      request.success = (res) => {
        target.id = res.channelId;
      };
      request.failure = () => {
        target.addNewMessages(new ErrorMessage('消息发送失败，对方可能不在线'));
      };
      this.api.queue(request);
      return;
    }

    const postMessagesRequest = new PostMessageRequest(message);
    postMessagesRequest.failure = () => {
      let errorText = '消息发送失败';
      if (target.type == ChannelType.PM) {
        errorText += '，对方可能不在线';
        target.id = 0;
      }
      target.addNewMessages(new ErrorMessage(errorText));
    };
    this.api.queue(postMessagesRequest);
  }

  public postCommand(text: string, channel?: Channel) {
    const target = channel || this.currentChannel.value;

    if (target == null) {
      return;
    }

    const tokens = text.substring(1).split(' ');
    const command = tokens[0];

    switch (command) {
      case 'words':
      case 'ban':
      case 'cancel-ban':
      case 'logout':
      case 'recall':
      case 'roll':
        this.postMessage(text, true, channel);
        break;
      case 'help': {
        const helpText = '可用命令：摇骰子：/roll [最大点]';
        target.addNewMessages(new InfoMessage(helpText));
        break;
      }
      case 'close':
        if (target.type == ChannelType.PM) {
          this.onHideChannel(target);
        }
        break;
      default:
        this.postMessage(text, false, channel);
    }
  }

  public initializeChannels(): boolean {
    if (this.channelsInitialised) {
      return false;
    }

    this.channelsInitialised = true;

    [[1, '#世界']].forEach(([id, name]) => {
      const channel = new Channel();
      channel.id = <number>id;
      channel.type = ChannelType.PUBLIC;
      channel.name = <string>name;
      this.getChannel(channel, true);
      this.joinChannel(channel);
    });

    const listChannels = () => {
      const req = new ListChannelsRequest();
      req.success = (channels: Channel[]) => {
        channels.forEach((ch) => {
          this.getChannel(Channel.from(ch), true);
        });
      };
      this.api.queue(req);
    };

    this.api.state.changed.add(() => {
      if (this.api.isLoggedIn) {
        listChannels();
      }
    });

    if (this.api.isLoggedIn) {
      listChannels();
    }

    return true;
  }

  public addInfoMessage(channelId: number, msg: Message) {
    const channel = this.getChannel(channelId);
    if (channel) {
      channel.addNewMessages(msg);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  public markChannelAsRead(channel: Channel) {
    if (channel.lastMessageId == channel.lastReadId) {
      return;
    }
    channel.lastReadId = channel.lastMessageId;
  }

  private initSocketListeners() {
    this.socketService.on('chat.message', (msg: ChatServerMsgs.ChatMessageMsg) => {
      const channel = this.getChannel(msg.channelId);
      channel.addNewMessages(Message.from(msg));

      if (msg.sender.id == this.api.localUser.id) {
        this.markChannelAsRead(this.getChannel(msg.channelId, false, false));
      }
    });

    this.socketService.on('chat.presence', (msg: ChatServerMsgs.ChatPresenceMsg) => {
      const channel = Channel.from(msg.channel);
      // 从服务器接收到的频道应该都是已经加入的
      channel.joined.value = true;

      if (channel.type == ChannelType.PM) {
        channel.name = msg.sender.nickname;
        this.joinChannel(channel, false);
        this.openPrivateChannel(msg.sender);
      } else if (channel.type == ChannelType.ROOM) {
        this.joinChannel(channel, false);
      }
      if (msg.recentMessages) {
        this.handleChannelMessages(msg.recentMessages.map((m) => Message.from(m)));
      }
    });

    this.socketService.on('chat.user_left', (msg: ChatServerMsgs.ChatChannelUserLeftMsg) => {
      const channel = this.getChannel(msg.channelId);
      if (channel.type == ChannelType.PM) {
        // 该私聊频道中的对话用户已经离开
        channel.addNewMessages(new InfoMessage('对方已下线'));
      }
    });

    this.socketService.on('chat.recall_message', (msg: ChatServerMsgs.ChatRecallMessageMsg) => {
      const channel = this.getChannel(msg.channelId);
      channel.removeMessage(msg.messageId);
    });

    this.socketService.on('chat.words_enable', (msg: ChatServerMsgs.WordsEnableMsg) => {
      this.wordsEnableSignal.dispatch(msg.enabled);
    });

    this.socketService.reconnected.add(() => {
      if (!this.api.isLoggedIn) {
        return;
      }
      this.joinedChannels.value.forEach((ch) => {
        const req = new GetMessagesRequest(ch);
        ch.loading.value = true;
        req.success = (msgs) => {
          this.handleChannelMessages(msgs.map((mg) => Message.from(mg)));
          ch.loading.value = false;
        };
        this.api.queue(req);
      });
    });
  }

  private fetchInitalMessages(channel: Channel) {
    if (channel.messagesLoaded) return;
    const req = new GetMessagesRequest(channel);
    channel.loading.value = true;
    req.success = (msgs) => {
      this.handleChannelMessages(msgs.map((mg) => Message.from(mg)));
      channel.messagesLoaded = true;
      channel.loading.value = false;
    };
    this.api.queue(req);
  }

  private handleChannelMessages(messages: Message[]) {
    const channelMap: { [channelId: string]: Channel } = this.joinedChannels.value.reduce(
      (map: { [channelId: string]: Channel }, c) => {
        map[c.id.toString()] = c;
        return map;
      }, {},
    );
    messages.forEach((msg) => {
      channelMap[msg.channelId].addNewMessages(msg);
    });
  }
}

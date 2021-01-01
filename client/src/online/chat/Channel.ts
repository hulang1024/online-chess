import Signal from "src/utils/signals/Signal";
import User from "../../user/User";
import BindableBool from "../../utils/bindables/BindableBool";
import ChannelType from "./ChannelType";
import Message from "./Message";

export default class Channel {
  public id = 0;

  public name: string;

  public type: ChannelType;

  public messages: Message[] = [];

  public users: User[] = [];

  public messagesLoaded = false;

  public newMessagesArrived: Signal = new Signal();

  public messageRemoved: Signal = new Signal();

  public lastMessageId: number;

  public readonly joined: BindableBool = new BindableBool(false);

  constructor(user?: User) {
    if (user) {
      // 创建一个私信频道, user 是与之私聊的用户
      this.type = ChannelType.PM;
      this.name = user.nickname;
      this.users.push(user);
    }
  }

  addLocalEcho(message: Message) {
    this.addNewMessages(message);
  }

  addNewMessages(messages: Message[] | Message) {
    messages = messages instanceof Array ? messages : [messages];
    // 排除重复
    messages = messages.filter((newMsg: Message) => this.messages
      .filter((m) => m.equals(newMsg)).length == 0);

    if (messages.length == 0) {
      return;
    }
    const maxMessageId = messages.reduce((max, m) => Math.max(m.id, max), 0);
    if (maxMessageId > this.lastMessageId) {
      this.lastMessageId = maxMessageId;
    }
    this.messages = this.messages.concat(messages);

    this.newMessagesArrived.dispatch(messages);
  }

  removeMessage(messageId: number) {
    this.messages = this.messages.filter((msg) => msg.id == messageId);
    this.messageRemoved.dispatch(messageId);
  }

  public static from(ch: Channel) {
    const channel = new Channel();
    channel.id = ch.id;
    channel.name = ch.name;
    channel.type = ch.type;
    // eslint-disable-next-line
    channel.users = (ch.users as unknown as number[]).map((userId: number) => new User(userId));
    return channel;
  }
}

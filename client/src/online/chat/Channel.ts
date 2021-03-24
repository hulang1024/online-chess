import Signal from "src/utils/signals/Signal";
import User, { isSystemUser } from "../../user/User";
import BindableBool from "../../utils/bindables/BindableBool";
import ChannelType from "./ChannelType";
import LocalEchoMessage from "./LocalEchoMessage";
import Message from "./Message";

export default class Channel {
  public id = 0;

  public name: string;

  public type: ChannelType;

  public messages: Message[] = [];

  public users: User[] = [];

  public loading = new BindableBool(false);

  public messagesLoaded = false;

  public newMessagesArrived = new Signal();

  public messageRemoved = new Signal();

  public pendingMessageResolved = new Signal();

  public lastMessageId: number | null = null;

  public lastReadId: number | null = null;

  public readonly joined = new BindableBool(false);

  constructor(user?: User) {
    if (user) {
      // 创建一个私信频道, user 是与之私聊的用户
      this.type = ChannelType.PM;
      this.name = user.nickname;
      this.users.push(user);
    }
  }

  public addLocalEcho(message: Message) {
    this.addNewMessages(message);
  }

  public addNewMessages(messages: Message[] | Message) {
    messages = messages instanceof Array ? messages : [messages];
    // 排除重复
    messages = messages.filter((newMsg: Message) => this.messages
      .filter((m) => m.equals(newMsg)).length == 0);

    if (messages.length == 0) {
      return;
    }

    const lastMessage = messages[messages.length - 1];
    // 当为EchoMessage时，可能为null
    this.lastMessageId = lastMessage.id;

    this.messages = this.messages.concat(messages);

    this.newMessagesArrived.dispatch(messages);
  }

  public removeMessage(messageId: number) {
    const message = this.messages.find((msg) => msg.id == messageId);
    if (!message) {
      return;
    }
    this.messages = this.messages.filter((msg) => msg != message);
    this.messageRemoved.dispatch(message);
  }

  public resolveMessage(echo: LocalEchoMessage, final: Message | null) {
    if (final == null) {
      this.messages = this.messages.filter((msg) => msg != echo);
      this.messageRemoved.dispatch(echo);
      return;
    }

    const index = this.messages.findIndex((msg) => msg == echo);
    this.messages[index] = final;

    if (!this.lastMessageId) {
      this.lastMessageId = final.id;
    }

    this.pendingMessageResolved.dispatch(echo, final);
  }

  public countUnreadMessage(): number {
    if (this.lastReadId == null) {
      return this.messages.length;
    }
    const lastReadIndex = this.messages.findIndex((m) => this.lastReadId == m.id);
    return this.messages.filter((m, i) => i > lastReadIndex && !isSystemUser(m.sender)).length;
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

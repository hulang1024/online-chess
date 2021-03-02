import User from "../../user/User";

export default class Message {
  id: number;

  channelId: number;

  timestamp: number;

  sender: User;

  content: string;

  isAction: boolean;

  constructor(id?: number | null) {
    if (id) {
      this.id = id;
    }
  }

  public equals(other: Message): boolean {
    if (this.id != other.id) {
      return false;
    }
    return this.timestamp == other.timestamp;
  }

  public static from(msg: any) {
    /* eslint-disable */
    const message = new Message(msg.id);
    message.channelId = msg.channelId;
    message.timestamp = msg.timestamp;
    message.sender = msg.sender;
    message.content = msg.content;
    message.isAction = msg.isAction;
    /* eslint-disable */
    return message;
  }
}

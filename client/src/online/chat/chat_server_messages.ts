import Channel from "src/online/chat/Channel";
import Message from "src/online/chat/Message";
import User from "src/user/User";
import ServerMsg from "../ws/ServerMsg";

export interface ChatMessageMsg extends ServerMsg {
  id: number;

  channelId: number;

  timestamp: number;

  sender: User;

  content: string;

  isAction: boolean;
}

export interface ChatPresenceMsg extends ServerMsg {
  channel: Channel;
  recentMessages: Message[];
  sender: User;
}

export interface ChatChannelUserLeftMsg extends ServerMsg {
  channelId: number;
  userId: number;
}

export interface ChatRecallMessageMsg extends ServerMsg {
  channelId: number;
  messageId: number;
}

export interface WordsEnableMsg extends ServerMsg {
  enabled: boolean;
}

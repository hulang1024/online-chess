import Channel from "src/online/chat/Channel";
import Message from "src/online/chat/Message";
import User from "src/online/user/User";
import Signal from "src/utils/signals/Signal";
import ServerMsg from "../ServerMsg";

export const message = new Signal();
export const presence = new Signal();
export const channelUserLeft = new Signal();
export const messageRecalled = new Signal();

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

import Channel from "src/online/chat/Channel";
import Message from "src/online/chat/Message";
import User from "src/online/user/User";
import Signal from "src/utils/signals/Signal";
import ServerMsg from "../ServerMsg";

export let message = new Signal();
export let presence = new Signal();
export let channelUserLeft = new Signal();
export let messageRecalled = new Signal();

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
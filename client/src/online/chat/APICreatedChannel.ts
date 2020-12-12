import Message from "./Message";

export default interface APICreatedChannel {
  channelId: number;

  recentMessages: Message[];
}

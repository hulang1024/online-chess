import User from "src/user/User";
import Message from "./Message";

export default interface APICreatedChannel {
  channelId: number;
  targetUser: User;
  recentMessages: Message[];
}

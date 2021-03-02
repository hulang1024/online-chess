import Message from "./Message";

export default interface APICreatedNewPM {
  channelId: number;
  message: Message;
}

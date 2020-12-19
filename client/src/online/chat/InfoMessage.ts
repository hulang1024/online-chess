import User from "../../user/User";
import Message from "./Message";

export default class InfoMessage extends Message {
  private static infoID = -1;

  constructor(message: string) {
    super(InfoMessage.infoID--);
    this.timestamp = new Date().getTime();
    this.sender = User.SYSTEM;
    this.content = message;
  }
}

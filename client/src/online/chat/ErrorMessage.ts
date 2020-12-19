import User from "../../user/User";
import InfoMessage from "./InfoMessage";

export default class ErrorMessage extends InfoMessage {
  constructor(message: string) {
    super(message);
    this.sender = User.SYSTEM;
    this.timestamp = new Date().getTime();
  }
}

import User from "../../user/User";
import InfoMessage from "./InfoMessage";
import Message from "./Message";

export default class ErrorMessage extends InfoMessage {
    constructor(message: string) {
        super(message);
        this.sender = User.SYSTEM;
        this.timestamp = new Date().getTime();
    }
}
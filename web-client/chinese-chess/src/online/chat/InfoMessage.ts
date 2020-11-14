import User from "../../user/User";
import Message from "./Message";

export default class InfoMessage extends Message {
    static infoID: number = -1;
    constructor() {
        super(InfoMessage.infoID--);
        this.sender = User.SYSTEM;
        this.timestamp = new Date().getTime();
    }
}
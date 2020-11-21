import User from "../../user/User";

export default class Message {
    id: number;
    channelId: number;
    timestamp: number;
    sender: User;
    content: string;

    constructor(id: number) {
        this.id = id;
    }
}
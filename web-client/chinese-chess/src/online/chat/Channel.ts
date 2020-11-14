import ChannelType from "./ChannelType";
import Message from "./Message";

export default class Channel {
    id: number;
    name: string;
    type: ChannelType;
    messages: Message[] = [];

    joined: boolean = false;

    onNewMessages: Function;

    addLocalEcho(message: Message) {
        this.messages.push(message);

        this.addNewMessages([message]);
    }

    addNewMessages(messages: Message[]) {
        // 排除重复
        messages = messages.filter(newMsg =>
            this.messages.filter(m => m.id == newMsg.id).length == 0);

        this.messages = this.messages.concat(messages);

        this.onNewMessages(messages);
    }
}
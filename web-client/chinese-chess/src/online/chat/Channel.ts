import ChannelType from "./ChannelType";
import Message from "./Message";

export default class Channel {
    id: number;
    name: string;
    type: ChannelType;
    messages: Message[] = [];

    joined: boolean = false;

    onNewMessages: Function;
    onRemoveMessage: Function;

    addLocalEcho(message: Message) {
        this.addNewMessages(message);
    }

    addNewMessages(messages: Message[] | Message) {
        messages = messages instanceof Array ? messages : [messages];
        // 排除重复
        messages = messages.filter(newMsg =>
            this.messages.filter(m => m.id == newMsg.id).length == 0);

        this.messages = this.messages.concat(messages);

        this.onNewMessages(messages);
    }

    removeMessage(messageId: number) {
        this.messages = this.messages.filter(msg => msg.id == messageId);
        this.onRemoveMessage(messageId);
    }
}
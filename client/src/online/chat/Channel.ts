import User from "../user/User";
import BindableBool from "../../utils/bindables/BindableBool";
import ChannelType from "./ChannelType";
import Message from "./Message";
import Signal from "src/utils/signals/Signal";

export default class Channel {
    public id: number = 0;
    public name: string;
    public type: ChannelType;
    public messages: Message[] = [];
    public users: User[] = [];

    public messagesLoaded: boolean = false;

    public newMessagesArrived: Signal = new Signal();
    public messageRemoved: Signal = new Signal();

    public readonly joined: BindableBool = new BindableBool(false);

    constructor(user?: User) {
        if (user) {
            // 创建一个私信频道, user 是与之私聊的用户
            this.type = ChannelType.PM;
            this.name = user.nickname;
            this.users.push(user);
        }
    }

    addLocalEcho(message: Message) {
        this.addNewMessages(message);
    }

    addNewMessages(messages: Message[] | Message) {
        messages = messages instanceof Array ? messages : [messages];
        // 排除重复
        messages = messages.filter(newMsg =>
            this.messages.filter(m => m.equals(newMsg)).length == 0);

        if (messages.length == 0) {
            return;
        }
        
        this.messages = this.messages.concat(messages);

        this.newMessagesArrived.dispatch(messages);
    }

    removeMessage(messageId: number) {
        this.messages = this.messages.filter(msg => msg.id == messageId);
        this.messageRemoved.dispatch(messageId);
    }

    public static from(obj: any) {
        let channel = new Channel();
        channel.id = obj.id;
        channel.name = obj.name;
        channel.type = obj.type;
        channel.users = obj.users.map((userId: number) => {
            let user = new User();
            user.id = userId;
            return user;
        });
        return channel;
    }
}
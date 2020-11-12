import User from "../../user/User";

export default interface Message {
    sender: Sender | User;
    content: string;
    isFromMe?: boolean;
}

interface Sender {
    uid: number;
    nickname: string;
}
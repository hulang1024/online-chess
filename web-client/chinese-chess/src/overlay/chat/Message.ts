export default interface Message {
    fromUid;
    fromUserNickname: string;
    content: string;
    isFromMe?: boolean;
}
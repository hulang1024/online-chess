import TextInput from "../../component/TextInput";

export default class MessageInput extends TextInput {
    onSend: Function;

    constructor(width: number) {
        super({
            width,
            height: 56,
            prompt: '键入你的消息'
        });

        this.onEnter = (text: string) => {
            text = text.trim();
            if (!text) {
                return;
            }
            
            return this.onSend(text);
        };
    }
}
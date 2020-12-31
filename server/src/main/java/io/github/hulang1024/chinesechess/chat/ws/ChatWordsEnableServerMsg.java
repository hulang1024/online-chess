package io.github.hulang1024.chinesechess.chat.ws;

import io.github.hulang1024.chinesechess.ws.ServerMessage;
import lombok.Data;

@Data
public class ChatWordsOnOffServerMsg extends ServerMessage {
    private boolean isOn;
    public ChatWordsOnOffServerMsg(boolean isOn) {
        super("chat.words_off");
        this.isOn = isOn;
    }
}
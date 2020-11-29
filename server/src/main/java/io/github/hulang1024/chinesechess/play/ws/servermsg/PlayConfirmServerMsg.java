package io.github.hulang1024.chinesechess.play.ws.servermsg;

import io.github.hulang1024.chinesechess.ws.ServerMessage;
import lombok.Data;

@Data
public class PlayConfirmServerMsg extends ServerMessage {
    private int reqType;
    private int chessHost;
    
    public PlayConfirmServerMsg() {
        super("play.confirm_request");
    }
}

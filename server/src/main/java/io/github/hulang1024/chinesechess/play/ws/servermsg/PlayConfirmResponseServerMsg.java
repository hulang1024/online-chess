package io.github.hulang1024.chinesechess.play.ws.servermsg;

import io.github.hulang1024.chinesechess.ws.ServerMessage;
import lombok.Data;

@Data
public class PlayConfirmResponseServerMsg extends ServerMessage {
    private int reqType;
    private int chessHost;
    private boolean ok;

    public PlayConfirmResponseServerMsg() {
        super("play.confirm_response");
    }
}

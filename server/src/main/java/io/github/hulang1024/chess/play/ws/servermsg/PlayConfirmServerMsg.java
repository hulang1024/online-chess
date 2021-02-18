package io.github.hulang1024.chess.play.ws.servermsg;

import io.github.hulang1024.chess.ws.ServerMessage;
import lombok.Data;

@Data
public class PlayConfirmServerMsg extends ServerMessage {
    private int reqType;
    private int chessHost;

    public PlayConfirmServerMsg() {
        super("play.confirm_request");
    }
}
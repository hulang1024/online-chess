package io.github.hulang1024.chess.play.ws.servermsg;

import io.github.hulang1024.chess.ws.ServerMessage;
import lombok.Data;

@Data
public class ReadyServerMsg extends ServerMessage {
    private long uid;
    private boolean ready;

    public ReadyServerMsg() {
      super("play.ready");
    }
}
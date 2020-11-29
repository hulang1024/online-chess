package io.github.hulang1024.chinesechess.play.ws.servermsg;

import io.github.hulang1024.chinesechess.ws.ServerMessage;
import lombok.Data;

@Data
public class ReadyServerMsg extends ServerMessage {
    private long uid;
    private boolean readied;
    
    public ReadyServerMsg() {
      super("play.ready");
    }
}

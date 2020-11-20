package io.github.hulang1024.chinesechess.message.server.play;

import io.github.hulang1024.chinesechess.message.ServerMessage;
import lombok.Data;

@Data
public class ReadyServerMsg extends ServerMessage {
    private long uid;
    private boolean readied;
    
    public ReadyServerMsg() {
      super("play.ready");
    }
}

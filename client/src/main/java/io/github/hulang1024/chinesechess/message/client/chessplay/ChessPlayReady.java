package io.github.hulang1024.chinesechess.message.client.chessplay;

import io.github.hulang1024.chinesechess.message.ClientMessage;
import lombok.Data;

@Data
public class ChessPlayReady extends ClientMessage {
    public ChessPlayReady() {
        super("chessplay.ready");
    }
}

package io.github.hulang1024.chinesechess.message.client.chessplay;

import io.github.hulang1024.chinesechess.message.ClientMessage;

public class ChessPlayReady extends ClientMessage {
    public ChessPlayReady() {
        super("chessplay.ready");
    }
}

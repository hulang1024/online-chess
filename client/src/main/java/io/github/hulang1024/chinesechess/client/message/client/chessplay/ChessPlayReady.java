package io.github.hulang1024.chinesechess.client.message.client.chessplay;

import io.github.hulang1024.chinesechess.client.message.ClientMessage;

public class ChessPlayReady extends ClientMessage {
    public ChessPlayReady() {
        super("chessplay.ready");
    }
}

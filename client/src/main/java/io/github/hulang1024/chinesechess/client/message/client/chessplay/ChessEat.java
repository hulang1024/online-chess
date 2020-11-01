package io.github.hulang1024.chinesechess.client.message.client.chessplay;

import io.github.hulang1024.chinesechess.client.message.ClientMessage;
import lombok.Data;

@Data
public class ChessEat extends ClientMessage {
    private int host;
    private int sourceChessRow;
    private int sourceChessCol;
    private int targetChessRow;
    private int targetChessCol;

    public ChessEat() {
        super("chessplay.chess_eat");
    }
}

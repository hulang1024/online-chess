package io.github.hulang1024.chinesechess.play.ws.servermsg;

import io.github.hulang1024.chinesechess.ws.ServerMessage;
import lombok.Data;

@Data
public class ChessWithdrawServerMsg extends ServerMessage {

    public ChessWithdrawServerMsg() {
        super("play.chess_withdraw");
    }
}
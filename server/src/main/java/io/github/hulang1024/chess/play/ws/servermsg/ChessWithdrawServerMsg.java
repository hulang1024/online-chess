package io.github.hulang1024.chess.play.ws.servermsg;

import io.github.hulang1024.chess.ws.ServerMessage;
import lombok.Data;

@Data
public class ChessWithdrawServerMsg extends ServerMessage {

    public ChessWithdrawServerMsg() {
        super("play.chess_withdraw");
    }
}
package io.github.hulang1024.chess.play.ws;

import io.github.hulang1024.chess.ws.ClientMessage;
import io.github.hulang1024.chess.ws.ClientMsgType;
import lombok.Data;


@Data
@ClientMsgType("play.game_over")
public class GameOverMsg extends ClientMessage {
    /**
     * 为空表示平局
     */
    private Long winUserId;

    private boolean isTimeout;

    private boolean isNormal;
}
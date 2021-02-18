package io.github.hulang1024.chess.play.ws.servermsg;

import io.github.hulang1024.chess.ws.ServerMessage;

public class GamePauseServerMsg extends ServerMessage {
    public GamePauseServerMsg() {
        super("play.game_pause");
    }
}
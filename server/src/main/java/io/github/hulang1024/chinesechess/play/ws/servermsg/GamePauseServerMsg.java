package io.github.hulang1024.chinesechess.play.ws.servermsg;

import io.github.hulang1024.chinesechess.ws.ServerMessage;

public class GamePauseServerMsg extends ServerMessage {
    public GamePauseServerMsg() {
        super("play.game_pause");
    }
}
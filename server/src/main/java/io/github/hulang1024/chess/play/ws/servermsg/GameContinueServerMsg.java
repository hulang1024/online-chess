package io.github.hulang1024.chess.play.ws.servermsg;

import io.github.hulang1024.chess.ws.ServerMessage;

public class GameContinueServerMsg extends ServerMessage {
    public GameContinueServerMsg() {
        super("play.game_continue");
    }
}
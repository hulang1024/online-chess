package io.github.hulang1024.chess.play.ws.servermsg;

import io.github.hulang1024.chess.ws.ServerMessage;

public class GameResumeServerMsg extends ServerMessage {
    public GameResumeServerMsg() {
        super("play.game_resume");
    }
}
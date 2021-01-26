package io.github.hulang1024.chinesechess.play.ws.servermsg;

import io.github.hulang1024.chinesechess.ws.ServerMessage;

public class GameResumeServerMsg extends ServerMessage {
    public GameResumeServerMsg() {
        super("play.game_resume");
    }
}
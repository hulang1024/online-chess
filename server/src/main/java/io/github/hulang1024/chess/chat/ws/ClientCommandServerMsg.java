package io.github.hulang1024.chess.chat.ws;

import io.github.hulang1024.chess.ws.ServerMessage;
import lombok.Data;

@Data
public class ClientCommandServerMsg extends ServerMessage {
    private String command;

    public ClientCommandServerMsg(String command) {
        super("client_command");

        this.command = command;
    }
}
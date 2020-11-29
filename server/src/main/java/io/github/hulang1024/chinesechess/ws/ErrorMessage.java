package io.github.hulang1024.chinesechess.ws;

import lombok.Data;

@Data
public class ErrorMessage extends ServerMessage {
    public ErrorMessage(String msg) {
        super("error");
        this.msg = msg;
    }
}

package io.github.hulang1024.chinesechess.message;

import lombok.Getter;

/**
 * 服务端消息
 */
public class ServerMessage {
    @Getter
    private int code;
    @Getter
    private String msg;
    @Getter
    private String type;
}

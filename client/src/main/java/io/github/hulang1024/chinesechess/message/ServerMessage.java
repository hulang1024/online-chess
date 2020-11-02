package io.github.hulang1024.chinesechess.message;

import lombok.Data;

/**
 * 服务端消息
 */
@Data
public class ServerMessage {
    private int code;
    private String msg;
    private String type;
}

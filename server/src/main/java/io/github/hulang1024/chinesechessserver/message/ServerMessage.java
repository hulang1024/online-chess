package io.github.hulang1024.chinesechessserver.message;

import lombok.Data;

/**
 * 服务端消息结构
 * @author Hu Lang
 */
@Data
public class ServerMessage {
    protected int code;
    protected String msg;
    protected String type;

    public ServerMessage(String type) {
        this.type = type;
    }
}


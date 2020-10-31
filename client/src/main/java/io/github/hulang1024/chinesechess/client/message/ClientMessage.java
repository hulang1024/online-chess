package io.github.hulang1024.chinesechess.client.message;

import lombok.Data;

/**
 * 客户端消息
 */
@Data
public class ClientMessage {
    protected String type;

    public ClientMessage(String type) {
        this.type = type;
    }
}
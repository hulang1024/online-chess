package io.github.hulang1024.chinesechess.message;

import lombok.Getter;

/**
 * 客户端消息
 */
public class ClientMessage {
    @Getter
    private String type;

    public ClientMessage(String type) {
        this.type = type;
    }
}
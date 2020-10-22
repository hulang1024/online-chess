package io.github.hulang1024.chinesechessserver.message.client;

import lombok.Data;

/**
 * 消息结构
 * @author Hu Lang
 */
@Data
public class ClientMessage<T> {
    private String type;
    private T payload;
}


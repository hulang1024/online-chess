package io.github.hulang1024.chinesechess.message;

import org.yeauty.pojo.Session;

import lombok.Getter;
import lombok.Setter;

/**
 * 客户端消息
 * @author Hu Lang
 */
public class ClientMessage {
    @Setter
    @Getter
    private Session session;
}


package io.github.hulang1024.chinesechessserver.message;

import org.yeauty.pojo.Session;

import lombok.Data;

/**
 * 客户端消息
 * @author Hu Lang
 */
@Data
public class ClientMessage {
    private Session session;
    private String type;
}


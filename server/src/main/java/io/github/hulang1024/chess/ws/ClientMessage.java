package io.github.hulang1024.chess.ws;

import io.github.hulang1024.chess.user.User;
import lombok.Data;

/**
 * 客户端消息
 */
@Data
public class ClientMessage {
    private User user;
}
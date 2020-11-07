package io.github.hulang1024.chinesechessserver.message.client.chessplay;

import io.github.hulang1024.chinesechessserver.message.ClientMessage;
import io.github.hulang1024.chinesechessserver.message.client.MessageType;
import lombok.Data;

/**
 * 新棋局
 * @author HuLang
 */
@Data
@MessageType("chessplay.round_new")
public class ChessPlayRoundNew extends ClientMessage {
}

package io.github.hulang1024.chinesechess.play.message;

import io.github.hulang1024.chinesechess.message.ClientMessage;
import io.github.hulang1024.chinesechess.message.ClientMsgType;
import lombok.Data;


@Data
@ClientMsgType("play.game_over")
public class GameOverMsg extends ClientMessage {
}

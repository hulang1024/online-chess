package io.github.hulang1024.chinesechess.message.server.chessplay;

import io.github.hulang1024.chinesechess.message.ServerMessage;
import io.github.hulang1024.chinesechess.message.server.MessageType;
import io.github.hulang1024.chinesechess.message.server.lobby.LobbyRoom.LobbyRoomPlayerInfo;
import lombok.Data;

@Data
@MessageType("chessplay.ready")
public class ChessPlayReadyResult extends ServerMessage {
    private LobbyRoomPlayerInfo player;
}

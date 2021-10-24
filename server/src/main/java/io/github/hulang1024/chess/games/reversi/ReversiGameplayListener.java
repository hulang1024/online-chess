package io.github.hulang1024.chess.games.reversi;

import io.github.hulang1024.chess.games.GameUtils;
import io.github.hulang1024.chess.games.reversi.ws.ChessPutMsg;
import io.github.hulang1024.chess.games.reversi.ws.ChessPutServerMsg;
import io.github.hulang1024.chess.room.Room;
import io.github.hulang1024.chess.room.RoomManager;
import io.github.hulang1024.chess.user.User;
import io.github.hulang1024.chess.ws.AbstractMessageListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ReversiGameplayListener extends AbstractMessageListener {
    @Autowired
    private RoomManager roomManager;

    @Override
    public void init() {
        addMessageHandler(ChessPutMsg.class, this::onPutChess);
    }

    private void onPutChess(ChessPutMsg chessPutMsg) {
        User user = chessPutMsg.getUser();
        Room room = roomManager.getJoinedRoom(user);

        if (!GameUtils.isPlaying(room)) {
            return;
        }

        ChessAction action = new ChessAction();
        action.setChess(chessPutMsg.getChess());
        action.setPos(chessPutMsg.getPos());
        ((ReversiGame)room.getGame()).putChess(action);

        ChessPutServerMsg result = new ChessPutServerMsg();
        result.setChess(action.getChess());
        result.setPos(action.getPos());
        roomManager.broadcast(room, result, user);
    }
}
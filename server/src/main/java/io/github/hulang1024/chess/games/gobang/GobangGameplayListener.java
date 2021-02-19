package io.github.hulang1024.chess.games.gobang;

import io.github.hulang1024.chess.games.chess.ChessHost;
import io.github.hulang1024.chess.games.gobang.ws.ChessPutMsg;
import io.github.hulang1024.chess.games.gobang.ws.ChessPutServerMsg;
import io.github.hulang1024.chess.games.GameState;
import io.github.hulang1024.chess.room.Room;
import io.github.hulang1024.chess.room.RoomManager;
import io.github.hulang1024.chess.user.User;
import io.github.hulang1024.chess.ws.AbstractMessageListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class GobangGameplayListener extends AbstractMessageListener {
    @Autowired
    private RoomManager roomManager;

    @Override
    public void init() {
        addMessageHandler(ChessPutMsg.class, this::onPutChess);
    }

    private void onPutChess(ChessPutMsg chessPutMsg) {
        User user = chessPutMsg.getUser();
        Room room = roomManager.getJoinedRoom(user);

        if (!requirePlaying(room)) {
            return;
        }

        ChessAction action = new ChessAction();
        action.setChess(ChessHost.from(chessPutMsg.getChess()));
        action.setPos(chessPutMsg.getPos());
        ((GobangGame)room.getGame()).putChess(action);

        ChessPutServerMsg result = new ChessPutServerMsg();
        result.setChess(action.getChess().code());
        result.setPos(action.getPos());
        roomManager.broadcast(room, result, user);
    }

    private boolean requirePlaying(Room room) {
        if (room.getGame() == null || room.getGame().getState() != GameState.PLAYING) {
            return false;
        }
        return true;
    }
}
package io.github.hulang1024.chess.games.gobang;

import io.github.hulang1024.chess.games.GameUtils;
import io.github.hulang1024.chess.games.gobang.ws.ChessPutMsg;
import io.github.hulang1024.chess.games.gobang.ws.ChessPutServerMsg;
import io.github.hulang1024.chess.games.gobang.ws.ChessTargetPosMsg;
import io.github.hulang1024.chess.games.gobang.ws.ChessTargetPosServerMsg;
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
        addMessageHandler(ChessTargetPosMsg.class, this::onChessTargetPos);
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
        ((GobangGame)room.getGame()).putChess(action);

        ChessPutServerMsg result = new ChessPutServerMsg();
        result.setChess(action.getChess());
        result.setPos(action.getPos());
        roomManager.broadcast(room, result, user);
    }

    private void onChessTargetPos(ChessTargetPosMsg msg) {
        User user = msg.getUser();
        Room room = roomManager.getJoinedRoom(user);

        if (!GameUtils.isPlaying(room)) {
            return;
        }

        ChessTargetPosServerMsg result = new ChessTargetPosServerMsg();
        result.setChess(msg.getChess());
        result.setPos(msg.getPos());
        roomManager.broadcast(room, result, user);
    }
}
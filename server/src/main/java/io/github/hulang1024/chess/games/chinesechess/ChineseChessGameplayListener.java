package io.github.hulang1024.chess.games.chinesechess;

import io.github.hulang1024.chess.games.GameUser;
import io.github.hulang1024.chess.games.GameUtils;
import io.github.hulang1024.chess.games.chinesechess.rule.Chess;
import io.github.hulang1024.chess.games.chinesechess.ws.ChessMoveMsg;
import io.github.hulang1024.chess.games.chinesechess.ws.ChessMoveServerMsg;
import io.github.hulang1024.chess.games.chinesechess.ws.ChessPickMsg;
import io.github.hulang1024.chess.games.chinesechess.ws.ChessPickServerMsg;
import io.github.hulang1024.chess.room.Room;
import io.github.hulang1024.chess.room.RoomManager;
import io.github.hulang1024.chess.user.User;
import io.github.hulang1024.chess.ws.AbstractMessageListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ChineseChessGameplayListener extends AbstractMessageListener {
    @Autowired
    private RoomManager roomManager;

    @Override
    public void init() {
        addMessageHandler(ChessPickMsg.class, this::onPickChess);
        addMessageHandler(ChessMoveMsg.class, this::onMoveChess);
    }

    private void onPickChess(ChessPickMsg chessPickMsg) {
        User user = chessPickMsg.getUser();
        Room room = roomManager.getJoinedRoom(user);

        if (!GameUtils.isPlaying(room)) {
            return;
        }

        ChessPickServerMsg chessPickServerMsg = new ChessPickServerMsg();
        chessPickServerMsg.setChessHost(room.getGameUser(user).get().getChess());
        chessPickServerMsg.setPos(chessPickMsg.getPos());
        chessPickServerMsg.setPickup(chessPickMsg.isPickup());

        roomManager.broadcast(room, chessPickServerMsg, user);
    }

    private void onMoveChess(ChessMoveMsg chessMoveMsg) {
        User user = chessMoveMsg.getUser();
        Room room = roomManager.getJoinedRoom(user);

        if (!GameUtils.isPlaying(room)) {
            return;
        }

        GameUser gameUser = room.getGameUser(user).get();

        ChessAction action = new ChessAction();
        action.setChess(new Chess(gameUser.getChess(), null));
        action.setFromPos(chessMoveMsg.getFromPos());
        action.setToPos(chessMoveMsg.getToPos());
        ((BaseChineseChessGame)room.getGame()).moveChess(action);

        ChessMoveServerMsg result = new ChessMoveServerMsg();
        result.setChessHost(gameUser.getChess());
        result.setFromPos(chessMoveMsg.getFromPos());
        result.setToPos(chessMoveMsg.getToPos());
        roomManager.broadcast(room, result, user);
    }
}
package io.github.hulang1024.chess.games;

import io.github.hulang1024.chess.games.chess.P2Play;
import io.github.hulang1024.chess.room.Room;

public class P2GameRuleset implements GameRuleset {
    @Override
    public int getFullPlayerNumber() { return 2; }

    @Override
    public void onJoin(Room room, GameUser gameUser) {
        if (room.getUserCount() == 0) {
            gameUser.setChess(1);
        } else if (room.getUserCount() == 1) {
            gameUser.setChess(P2Play.reverse(room.getGameUsers().get(0).getChess()));
        }
    }

    @Override
    public void onNewRound(Room room) {
        GameUser gameUser1 = room.getGameUsers().get(0);
        GameUser gameUser2 = room.getGameUsers().get(1);
        gameUser1.setChess(P2Play.reverse(gameUser1.getChess()));
        gameUser2.setChess(P2Play.reverse(gameUser2.getChess()));
    }
}
package io.github.hulang1024.chess.games;

import io.github.hulang1024.chess.room.Room;

public interface GameRuleset {
    int getFullPlayerNumber();
    void onJoin(Room room, GameUser gameUser);
    void onNewRound(Room room);
}
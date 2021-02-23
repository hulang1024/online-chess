package io.github.hulang1024.chess.games;

import io.github.hulang1024.chess.room.Room;

public class GameUtils {
    public static boolean isPlaying(Room room) {
        if (room.getGame() == null || room.getGame().getState() != GameState.PLAYING) {
            return false;
        }
        return true;
    }
}
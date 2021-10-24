package io.github.hulang1024.chess.games.chess;

public class P2Play {
    public static int reverse(int host) {
        assert 0 <= host && host <= 2;
        return host == 0 ? 0 : host == 1 ? 2 : 1;
    }
}
package io.github.hulang1024.chess.games.chinesechessdark;

import io.github.hulang1024.chess.games.chess.ChessHost;
import io.github.hulang1024.chess.games.chess.ChessPos;
import io.github.hulang1024.chess.games.chinesechess.rule.Chess;
import io.github.hulang1024.chess.games.chinesechess.rule.ChessEnum;
import io.github.hulang1024.chess.games.chinesechess.rule.ChessboardState;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/* package */ class ChessboardStateRandomGenerator {
    private static final int[][] ORIGIN_POS_ARRAY = {
        {
            0, 0, 0, 1, 0, 2, 0, 3,
            0, 5, 0, 6, 0, 7, 0, 8,
            2, 1, 2, 7,
            3, 0, 3, 2, 3, 4, 3, 6, 3, 8
        },
        {
            9, 0, 9, 1, 9, 2, 9, 3,
            9, 5, 9, 6, 9, 7, 9, 8,
            7, 1, 7, 7,
            6, 0, 6, 2, 6, 4, 6, 6, 6, 8
        }
    };

    private static final ChessEnum[] chessTypeArray = {
        ChessEnum.R, ChessEnum.N, ChessEnum.M, ChessEnum.G,
        ChessEnum.G, ChessEnum.M, ChessEnum.N, ChessEnum.R,
        ChessEnum.C, ChessEnum.C,
        ChessEnum.S, ChessEnum.S, ChessEnum.S, ChessEnum.S, ChessEnum.S
    };

    public static void generate(ChessboardState chessboardState) {
        ChessHost[] hosts = {ChessHost.SECOND, ChessHost.FIRST};
        ChessPos[] kingPosArray = {new ChessPos(0, 4), new ChessPos(9, 4)};
        for (int h = 0; h < 2; h++) {
            List<ChessEnum> chessTypes = Arrays.asList(chessTypeArray.clone());
            Collections.shuffle(chessTypes);
            for (int index = 0; index < chessTypes.size(); index++) {
                Chess chess = new Chess(hosts[h], chessTypes.get(index));
                chess.isFront = false;
                int row = ORIGIN_POS_ARRAY[h][index * 2];
                int col = ORIGIN_POS_ARRAY[h][index * 2 + 1];
                chessboardState.setChess(new ChessPos(row, col), chess);
            }
            chessboardState.setChess(kingPosArray[h], new Chess(hosts[h], ChessEnum.K));
        }
    }
}
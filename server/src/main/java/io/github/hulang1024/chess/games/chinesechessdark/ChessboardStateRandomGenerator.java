package io.github.hulang1024.chess.games.chinesechessdark;

import io.github.hulang1024.chess.games.chess.ChessPos;
import io.github.hulang1024.chess.games.chinesechess.rule.Chess;
import io.github.hulang1024.chess.games.chinesechess.rule.ChessEnum;
import io.github.hulang1024.chess.games.chinesechess.rule.ChessboardState;

import java.util.*;

public class ChessboardStateRandomGenerator {
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
        // 将帅位置
        ChessPos[] kingPosArray = {new ChessPos(0, 4), new ChessPos(9, 4)};
        // 两个棋方分别设置
        for (int h = 0; h < 2; h++) {
            // 将全部棋子放进一个列表中，随机位置
            List<ChessEnum> chessTypes = Arrays.asList(chessTypeArray.clone());
            for (int t = 0; t < chessTypeArray.length * 10; t++) {
                Collections.shuffle(chessTypes);
            }
            // 遍历打乱过的棋子类型，依次加到棋盘中
            for (int index = 0; index < chessTypes.size(); index++) {
                // 创建一个棋子表示
                Chess chess = new Chess(2 - h, chessTypes.get(index));
                chess.isFront = false;
                // 取一个棋子位置
                int row = ORIGIN_POS_ARRAY[h][index * 2];
                int col = ORIGIN_POS_ARRAY[h][index * 2 + 1];
                // 加到棋盘中
                chessboardState.setChess(new ChessPos(row, col), chess);
            }
            // 将王加到棋盘
            chessboardState.setChess(kingPosArray[h], new Chess(2 - h, ChessEnum.K));
        }
    }

    /**
     * 全盘打乱
     * @param chessboardState
     */
    public static void generateFull(ChessboardState chessboardState) {
        // 创建所有的棋子表示，放进列表中
        List<Chess> allChesses = new ArrayList<>();
        for (int h = 0; h < 2; h++) {
            for (int index = 0; index < chessTypeArray.length; index++) {
                // 创建一个棋子表示
                Chess chess = new Chess(2 - h, chessTypeArray[index]);
                chess.isFront = false;
                allChesses.add(chess);
            }
            // 创建将军的棋子表示
            allChesses.add(new Chess(2 - h, ChessEnum.K));
        }

        // 随机列表元素位置
        for (int t = 0; t < chessTypeArray.length * 2 * 10; t++) {
            Collections.shuffle(allChesses);
        }

        Iterator<Chess> chessIterator = allChesses.iterator();
        // 遍历打乱过的棋子类型，依次加到棋盘中
        // 将帅位置
        ChessPos[] kingPosArray = {new ChessPos(0, 4), new ChessPos(9, 4)};
        for (int h = 0; h < 2; h++) {
            for (int index = 0; index < chessTypeArray.length; index++) {
                // 取一个棋子位置
                int row = ORIGIN_POS_ARRAY[h][index * 2];
                int col = ORIGIN_POS_ARRAY[h][index * 2 + 1];
                // 加到棋盘中
                chessboardState.setChess(new ChessPos(row, col), chessIterator.next());
            }
            chessboardState.setChess(kingPosArray[h], chessIterator.next());
        }
    }
}
package io.github.hulang1024.chess.games.chinesechessdark;

import io.github.hulang1024.chess.games.GameInitialStates;
import io.github.hulang1024.chess.games.chinesechess.ChineseChessGameStatesResponse;
import lombok.Data;

import java.util.List;

@Data
public class ChineseChessDarkGameInitialStates extends GameInitialStates {
    private List<ChineseChessGameStatesResponse.Chess> chesses;
}
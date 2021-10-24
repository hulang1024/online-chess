package io.github.hulang1024.chess.games;

import lombok.Data;

import java.util.List;

@Data
public class GameContext {
    private GameRuleset gameRuleset;
    private GameSettings gameSettings;
    private List<GameUser> gameUsers;
}
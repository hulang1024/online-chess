package io.github.hulang1024.chess.games.gobang;

import io.github.hulang1024.chess.games.GameSettings;
import lombok.Data;

@Data
public class GobangGameSettings extends GameSettings {
  private int chessboardSize = 15;
}
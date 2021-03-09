package io.github.hulang1024.chess.room;

import io.github.hulang1024.chess.games.GameFactory;
import io.github.hulang1024.chess.games.GameSettings;
import io.github.hulang1024.chess.games.GameType;
import io.github.hulang1024.chess.games.gobang.GobangGameSettings;
import lombok.Data;

@Data
public class CreateRoomParam {
    private String name;
    private String password;

    private int gameType;

    private boolean canWithdraw;

    private Integer chessboardSize;

    /**
     * 局时（分钟）
     */
    private float gameDuration;
    /**
     * 步时（秒）
     */
    private int stepDuration;
    /**
     * 读秒
     */
    private int secondsCountdown;

    public RoomSettings getRoomSettings() {
        GameSettings gameSettings = GameFactory.createGameSettings(GameType.from(gameType));
        // 转换为秒
        GameSettings.TimerSettings timerSettings = new GameSettings.TimerSettings();
        timerSettings.setGameDuration((int)(gameDuration * 60));
        timerSettings.setStepDuration(stepDuration);
        timerSettings.setSecondsCountdown(secondsCountdown);
        gameSettings.setTimer(timerSettings);
        gameSettings.setCanWithdraw(canWithdraw);

        RoomSettings roomSettings = new RoomSettings();
        roomSettings.setGameSettings(gameSettings);

        // todo: 消除硬编码
        if (gameType == GameType.gobang.getCode()) {
            if (chessboardSize != null) {
                ((GobangGameSettings)gameSettings).setChessboardSize(chessboardSize);
            }
        }
        return roomSettings;
    }
}
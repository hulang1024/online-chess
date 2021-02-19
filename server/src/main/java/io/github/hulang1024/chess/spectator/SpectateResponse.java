package io.github.hulang1024.chess.spectator;

import io.github.hulang1024.chess.games.GameStatesResponse;
import io.github.hulang1024.chess.http.results.Result;
import io.github.hulang1024.chess.room.Room;
import lombok.Data;

@Data
public class SpectateResponse extends Result {
    private Room room;

    private GameStatesResponse states;

    /**
     * 观看目标用户（为空时是围观房间）
     */
    private Long targetUserId;

    private boolean isFollowedOtherSpectator;

    /**
     * @param code 1=观众用户未登录
     *             2=观看目标用户未在线
     *             3=未找到房间/观看目标用户未加入游戏房间
     *             4=该房间不满足观看条件
     *             5=不能观看因为在游戏中
     *             6=不能观看自己
     */
    public SpectateResponse(int code) {
        super(code);
    }

    public static SpectateResponse fail(int code) {
        return new SpectateResponse(code);
    }
}
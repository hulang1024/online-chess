package io.github.hulang1024.chinesechess.spectator;

import io.github.hulang1024.chinesechess.play.GamePlayStatesResponse;
import lombok.Data;

@Data
public class SpectateResponse {
    /**
     * 1=观众用户未登录，2=观看目标用户未在线，3=未找到房间/观看目标用户未加入游戏房间，4=该房间不满足观看条件，5=不能观看因为在游戏中
     */
    private int code;

    private GamePlayStatesResponse states;

    /**
     * 观看目标用户（为空时是围观房间）
     */
    private Long targetUserId;
}

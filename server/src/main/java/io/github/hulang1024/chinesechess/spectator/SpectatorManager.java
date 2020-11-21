package io.github.hulang1024.chinesechess.spectator;

import io.github.hulang1024.chinesechess.chat.ChannelManager;
import io.github.hulang1024.chinesechess.chat.Message;
import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.websocket.message.server.spectator.SpectatorJoinServerMsg;
import io.github.hulang1024.chinesechess.websocket.message.server.spectator.SpectatorLeaveServerMsg;
import io.github.hulang1024.chinesechess.play.GamePlayStatesResponse;
import io.github.hulang1024.chinesechess.play.rule.Chess;
import io.github.hulang1024.chinesechess.play.rule.ChessHost;
import io.github.hulang1024.chinesechess.play.rule.ChessboardState;
import io.github.hulang1024.chinesechess.room.Room;
import io.github.hulang1024.chinesechess.room.RoomManager;
import io.github.hulang1024.chinesechess.user.UserManager;
import io.github.hulang1024.chinesechess.utils.TimeUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SpectatorManager {
    private static Map<Long, Room> spectatorRoomMap = new ConcurrentHashMap<>();

    @Autowired
    private UserManager userManager;
    @Autowired
    private RoomManager roomManager;
    @Autowired
    private ChannelManager channelManager;

    public Room getSpectatingRoom(User user) {
        return spectatorRoomMap.get(user.getId());
    }

    public SpectateResponseData spectate(long userId, SpectateParam param) {
        User user = userManager.getOnlineUser(userId);
        SpectateResponseData responseData = new SpectateResponseData();
        Room room = roomManager.getRoom(param.getRoomId());
        responseData.setRoom(room);

        if (room == null) {
            responseData.setCode(2);
            return responseData;
        }

        if (room.getUserCount() < 2) {
            responseData.setCode(3);
            return responseData;
        }

        room.getSpectators().add(user);
        room.getChannel().joinUser(user);

        spectatorRoomMap.put(user.getId(), room);

        GamePlayStatesResponse gamePlayStates = new GamePlayStatesResponse();
        if (room.getGame() != null) {
            if (room.getGame().getActiveChessHost() != null) {
                gamePlayStates.setActiveChessHost(room.getGame().getActiveChessHost().code());
            }
            gamePlayStates.setChesses(toStateChesses(room.getGame().getChessboardState()));
            gamePlayStates.setActionStack(room.getGame().getActionStack());
        }
        responseData.setStates(gamePlayStates);

        // 发送给房间玩家用户观众信息
        SpectatorJoinServerMsg joinMsg = new SpectatorJoinServerMsg();
        joinMsg.setUser(user);
        joinMsg.setSpectatorCount(room.getSpectators().size());
        roomManager.broadcast(room, joinMsg, user);

        // 发送消息
        Message chatMessage = new Message();
        chatMessage.setChannelId(room.getChannel().getId());
        chatMessage.setTimestamp(TimeUtils.nowTimestamp());
        chatMessage.setSender(User.SYSTEM_USER);
        chatMessage.setContent(user.getNickname() + " 加入观看");
        channelManager.broadcast(room.getChannel(), chatMessage, user);

        return responseData;
    }

    public void leave(long userId) {
        User user = userManager.getOnlineUser(userId);
        Room room = spectatorRoomMap.get(user.getId());
        leave(user, room);
    }

    public void leave(User spectator, Room room) {

        room.getSpectators().remove(spectator);
        room.getChannel().removeUser(spectator);
        spectatorRoomMap.remove(spectator.getId());

        SpectatorLeaveServerMsg leaveMsg = new SpectatorLeaveServerMsg();
        leaveMsg.setUser(spectator);
        leaveMsg.setSpectatorCount(room.getSpectators().size());
        roomManager.broadcast(room, leaveMsg);

        // 发送消息
        Message chatMessage = new Message();
        chatMessage.setChannelId(room.getChannel().getId());
        chatMessage.setTimestamp(TimeUtils.nowTimestamp());
        chatMessage.setSender(User.SYSTEM_USER);
        chatMessage.setContent(spectator.getNickname() + " 离开观看");
        channelManager.broadcast(room.getChannel(), chatMessage);
    }

    private List<GamePlayStatesResponse.Chess> toStateChesses(ChessboardState chessboardState) {
        List<GamePlayStatesResponse.Chess> chesses = new ArrayList<>();
        for (int r = 0; r < 10; r++) {
            for (int c = 0; c < 9; c++) {
                Chess chess = chessboardState.chessAt(r, c);
                if (chess != null) {
                    GamePlayStatesResponse.Chess sChess = new GamePlayStatesResponse.Chess();
                    sChess.setHost(chess.chessHost == ChessHost.RED ? 1 : 2);
                    sChess.setType(chess.type.name().charAt(0));
                    sChess.setRow(r);
                    sChess.setCol(c);
                    chesses.add(sChess);
                }
            }
        }
        return chesses;
    }

}

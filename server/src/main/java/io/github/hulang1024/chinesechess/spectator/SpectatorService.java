package io.github.hulang1024.chinesechess.spectator;

import io.github.hulang1024.chinesechess.chat.Message;
import io.github.hulang1024.chinesechess.play.GamePlayStatesResponse;
import io.github.hulang1024.chinesechess.message.server.spectator.SpectatorJoinServerMsg;
import io.github.hulang1024.chinesechess.message.server.spectator.SpectatorLeaveServerMsg;
import io.github.hulang1024.chinesechess.play.rule.Chess;
import io.github.hulang1024.chinesechess.play.rule.ChessHost;
import io.github.hulang1024.chinesechess.play.rule.ChessboardState;
import io.github.hulang1024.chinesechess.room.Room;
import io.github.hulang1024.chinesechess.room.RoomManager;
import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.utils.TimeUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SpectatorService {
    @Autowired
    private RoomManager roomManager;

    public SpectateResponseData spectate(User user, SpectateParam param) {
        SpectateResponseData responseData = new SpectateResponseData();
        Room room = roomManager.getRoom(param.getRoomId());

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
        user.setSpectatingRoom(room);

        GamePlayStatesResponse gamePlayStates = new GamePlayStatesResponse();
        gamePlayStates.setRoom(room);
        if (room.getRound() != null) {
            if (room.getRound().getActiveChessHost() != null) {
                gamePlayStates.setActiveChessHost(room.getRound().getActiveChessHost().code());
            }
            gamePlayStates.setChesses(toStateChesses(room.getRound().getChessboardState()));
            gamePlayStates.setActionStack(room.getRound().getActionStack());
        }
        responseData.setStates(gamePlayStates);

        // 发送给房间玩家用户观众信息
        SpectatorJoinServerMsg joinMsg = new SpectatorJoinServerMsg();
        joinMsg.setUser(user);
        joinMsg.setSpectatorCount(room.getSpectators().size());
        room.broadcast(joinMsg);

        // 发送消息
        Message chatMessage = new Message();
        chatMessage.setChannelId(room.getChannel().getId());
        chatMessage.setTimestamp(TimeUtils.nowTimestamp());
        chatMessage.setSender(User.SYSTEM_USER);
        chatMessage.setContent(user.getNickname() + " 加入观看");
        room.getChannel().addNewAndSendMessage(chatMessage);

        return responseData;
    }

    public void leave(User spectator) {
        Room room = spectator.getSpectatingRoom();

        room.getSpectators().remove(spectator);
        room.getChannel().removeUser(spectator);
        spectator.setSpectatingRoom(null);

        SpectatorLeaveServerMsg leaveMsg = new SpectatorLeaveServerMsg();
        leaveMsg.setUser(spectator);
        leaveMsg.setSpectatorCount(room.getSpectators().size());
        room.broadcast(leaveMsg);

        // 发送消息
        Message chatMessage = new Message();
        chatMessage.setChannelId(room.getChannel().getId());
        chatMessage.setTimestamp(TimeUtils.nowTimestamp());
        chatMessage.setSender(User.SYSTEM_USER);
        chatMessage.setContent(spectator.getNickname() + " 离开观看");
        room.getChannel().addNewAndSendMessage(chatMessage);
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

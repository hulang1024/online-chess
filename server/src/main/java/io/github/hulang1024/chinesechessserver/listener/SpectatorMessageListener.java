package io.github.hulang1024.chinesechessserver.listener;

import java.util.ArrayList;
import java.util.List;

import io.github.hulang1024.chinesechessserver.convert.RoomConvert;
import io.github.hulang1024.chinesechessserver.convert.UserConvert;
import io.github.hulang1024.chinesechessserver.domain.Room;
import io.github.hulang1024.chinesechessserver.domain.SessionUser;
import io.github.hulang1024.chinesechessserver.domain.chinesechess.rule.Chess;
import io.github.hulang1024.chinesechessserver.domain.chinesechess.rule.ChessHost;
import io.github.hulang1024.chinesechessserver.domain.chinesechess.rule.ChessboardState;
import io.github.hulang1024.chinesechessserver.message.client.spectator.JoinWatchMsg;
import io.github.hulang1024.chinesechessserver.message.client.spectator.LeaveMsg;
import io.github.hulang1024.chinesechessserver.message.server.spectator.RoomRoundStateMsg;
import io.github.hulang1024.chinesechessserver.message.server.spectator.SpectatorJoinMsg;
import io.github.hulang1024.chinesechessserver.message.server.spectator.SpectatorLeaveMsg;
import io.github.hulang1024.chinesechessserver.service.RoomService;
import io.github.hulang1024.chinesechessserver.service.UserSessionService;

public class SpectatorMessageListener extends MessageListener {
    private RoomService roomService = new RoomService();
    private UserSessionService userSessionService = new UserSessionService();

    @Override
    public void init() {
        addMessageHandler(JoinWatchMsg.class, this::onJoinWatch);
        addMessageHandler(LeaveMsg.class, this::onLeave);

    }

    private void onJoinWatch(JoinWatchMsg msg) {
        Room room = roomService.getById(msg.getRoomId());
        RoomRoundStateMsg stateMsg = new RoomRoundStateMsg();

        if (room == null) {
            stateMsg.setCode(2);
            send(stateMsg, msg.getSession());
            return;
        }

        if (room.getUserCount() < 2) {
            stateMsg.setCode(3);
            send(stateMsg, msg.getSession());
            return;
        }

        SessionUser spectator = userSessionService.getUserBySession(msg.getSession());

        room.getSpectators().add(spectator);

        // 发送观众当前房间信息和棋局状态
        stateMsg.setRoom(new RoomConvert().toRoomInfo(room));
        if (room.getRound() != null) {
            if (room.getRound().getActiveChessHost() != null) {
                stateMsg.setActiveChessHost(room.getRound().getActiveChessHost().code());
            }
            stateMsg.setChesses(toStateChesses(room.getRound().getChessboardState()));
        }
        send(stateMsg, msg.getSession());

        room.getChatChannel().joinUser(spectator);

        // 发送给房间玩家用户观众信息
        SpectatorJoinMsg joinMsg = new SpectatorJoinMsg();
        joinMsg.setUser(new UserConvert().toRoomUserInfo(spectator));
        room.getUsers().forEach(user -> {
            send(joinMsg, user.getSession());
        });
    }

    private void onLeave(LeaveMsg msg) {
        Room room = roomService.getById(msg.getRoomId());
        SessionUser spectator = userSessionService.getUserBySession(msg.getSession());
        
        room.getChatChannel().removeUser(spectator);

        SpectatorLeaveMsg leaveMsg = new SpectatorLeaveMsg();
        leaveMsg.setUser(new UserConvert().toRoomUserInfo(spectator));
        room.getUsers().forEach(user -> {
            send(leaveMsg, user.getSession());
        });
    }

    private List<RoomRoundStateMsg.Chess> toStateChesses(ChessboardState chessboardState) {
        List<RoomRoundStateMsg.Chess> chesses = new ArrayList<>();
        for (int r = 0; r < 10; r++) {
            for (int c = 0; c < 9; c++) {
                Chess chess = chessboardState.chessAt(r, c);
                if (chess != null) {
                    RoomRoundStateMsg.Chess sChess = new RoomRoundStateMsg.Chess();
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
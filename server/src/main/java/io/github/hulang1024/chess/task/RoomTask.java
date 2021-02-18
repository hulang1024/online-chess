package io.github.hulang1024.chess.task;

import io.github.hulang1024.chess.room.RoomManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Component
public class RoomTask {
    @Autowired
    private RoomManager roomManager;

    /**
     * 每1小时处理存在的离线房间
     */
    @Scheduled(cron = "0 0 0/1 * * ?")
    public void handleOfflineTimeoutRooms() {
        // 离线房间可至少存活小时
        final int TIMEOUT_HOURS = 3;

        LocalDateTime now = LocalDateTime.now();
        roomManager.searchRooms(null).stream()
            .filter(room -> {
                if (room.getOfflineAt() == null) {
                    return false;
                }
                return ChronoUnit.HOURS.between(room.getOfflineAt(), now) >= TIMEOUT_HOURS;
            })
            .forEach(room -> {
                roomManager.dismissRoom(room);
            });
    }
}
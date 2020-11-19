package io.github.hulang1024.chinesechessserver.http.controller;

import io.github.hulang1024.chinesechessserver.http.params.RoomJoinParam;
import io.github.hulang1024.chinesechessserver.room.Room;
import io.github.hulang1024.chinesechessserver.room.RoomUpdateParam;
import io.github.hulang1024.chinesechessserver.message.server.room.RoomLeaveResult;
import io.github.hulang1024.chinesechessserver.room.RoomManager;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/rooms")
@Validated
public class RoomController {
    @Autowired
    private RoomManager roomManager;


    /**
     * 查询房间
     * @return
     */
    @GetMapping
    public ResponseEntity<List<Room>> getRooms() {
        return ResponseEntity.ok(roomManager.getRooms());
    }

    /**
     * 查询指定房间
     * @param id
     * @return
     */
    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoom(@NotNull @PathVariable("id") Long id) {
        return ResponseEntity.ok(roomManager.getRoom(id));
    }

    @PostMapping
    public ResponseEntity<Room> create(@Validated @RequestBody Room room) {
        // 房间名，如果没有指定，就生成一个
        if (StringUtils.isNotEmpty(room.getName())) {
            room.setName(room.getName());
        } else {
            room.setName(UUID.randomUUID().toString().substring(0, 5));
        }

        // 密码，如果有值则设置
        if (StringUtils.isNotEmpty(room.getPassword())) {
            room.setPassword(room.getPassword());
        }

        Room createdRoom = roomManager.create(room);
        if (createdRoom == null) {
            return new ResponseEntity(HttpStatus.EXPECTATION_FAILED);
        }

        return new ResponseEntity(createdRoom, HttpStatus.CREATED);
    }



    @PutMapping("/{id}")
    public ResponseEntity<Void> update(
        @NotNull @PathVariable("id") Long roomId,
        @Validated @RequestBody RoomUpdateParam param) {
        boolean ok = roomManager.update(roomId, param);
        return new ResponseEntity(ok ? HttpStatus.OK : HttpStatus.EXPECTATION_FAILED);
    }

    @PutMapping("/{room_id}/users/{user_id}")
    public ResponseEntity<Void> join(
        @NotNull @PathVariable("room_id") Long roomId,
        @NotNull @PathVariable("user_id") Long userId,
        @RequestBody RoomJoinParam param) {
        return ResponseEntity.<Void>ok().build();
    }

    @DeleteMapping("/{room_id}/users/{user_id}")
    public ResponseEntity<RoomLeaveResult> part(
        @NotNull @PathVariable("room_id") Long roomId,
        @NotNull @PathVariable("user_id") Long userId) {
        return ResponseEntity.<Void>ok().build();
    }
}

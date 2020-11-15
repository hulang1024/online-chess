package io.github.hulang1024.chinesechessserver.http.params.room;

import lombok.Data;

@Data
public class RoomCreateParam {
    @Not
    private String name;
    private boolean locked;
    private String password;
}

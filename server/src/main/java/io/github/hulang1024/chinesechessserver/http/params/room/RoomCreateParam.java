package io.github.hulang1024.chinesechessserver.http.req.room;

import lombok.Data;

@Data
public class Room {
    private String name;
    private boolean locked;
    private String password;
}

package io.github.hulang1024.chinesechessserver.room;

import lombok.Data;

import javax.validation.constraints.NotNull;


@Data
public class RoomUpdateParam {
    private String name;
    private String password;
}

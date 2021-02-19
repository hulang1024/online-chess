package io.github.hulang1024.chess.room;


import lombok.Data;

@Data
public class SearchRoomParam {
    private Integer gameType;
    private Integer status;
    private Boolean requirePassword;
}
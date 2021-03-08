package io.github.hulang1024.chess.user;

import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class SearchUserParam {
    @NotNull
    private Boolean onlyFriends;

    private Integer status;

    private Boolean online;
}
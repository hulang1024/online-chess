package io.github.hulang1024.chinesechess.user;

import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class SearchUserParam {
    @NotNull
    private Boolean onlyFriends;
}

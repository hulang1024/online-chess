package io.github.hulang1024.chinesechessserver.api.results.room;

import lombok.Data;

@Data
public class UserInfo {
    private long id;
    private String nickname;
    private boolean readied;
}

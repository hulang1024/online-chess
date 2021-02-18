package io.github.hulang1024.chess.user.thirdparty.github.api.responses;

import com.alibaba.fastjson.annotation.JSONField;
import lombok.Data;

@Data
public class GitHubUser {
    private Long id;
    private String login;
    private String email;
    @JSONField(name="avatar_url")
    private String avatarUrl;
}
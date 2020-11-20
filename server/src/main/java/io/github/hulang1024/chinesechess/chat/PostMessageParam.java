package io.github.hulang1024.chinesechess.chat;

import lombok.Data;

import javax.validation.constraints.NotEmpty;

@Data
public class PostMessageParam {
    private boolean isAction;
    @NotEmpty
    private String content;
}

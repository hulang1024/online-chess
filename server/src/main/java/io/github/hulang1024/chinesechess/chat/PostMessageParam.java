package io.github.hulang1024.chinesechess.chat;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class PostMessageParam {
    private boolean isAction;
    @NotBlank
    private String content;
}

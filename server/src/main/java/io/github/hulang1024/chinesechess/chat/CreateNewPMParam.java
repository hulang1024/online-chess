package io.github.hulang1024.chinesechess.chat;

import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class CreateNewPMParam extends PostMessageParam {
    @NotNull
    private Long targetId;
}
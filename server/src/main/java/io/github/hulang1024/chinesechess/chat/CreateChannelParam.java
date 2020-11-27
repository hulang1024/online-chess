package io.github.hulang1024.chinesechess.chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateChannelParam {
    @NotNull
    private Integer type;

    @NotNull
    private Long targetId;
}

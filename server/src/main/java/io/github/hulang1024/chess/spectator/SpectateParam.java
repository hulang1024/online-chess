package io.github.hulang1024.chess.spectator;

import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class SpectateParam {
    @NotNull
    private Long roomId;
}
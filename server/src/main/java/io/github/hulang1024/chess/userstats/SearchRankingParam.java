package io.github.hulang1024.chess.userstats;

import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class SearchRankingParam {
    @NotNull
    private Integer gameType;

    /**
     * 1=根据综合表现
     * 2=根据局数
     */
    @NotNull
    private Integer rankingBy;
}
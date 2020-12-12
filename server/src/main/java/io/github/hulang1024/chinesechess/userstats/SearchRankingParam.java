package io.github.hulang1024.chinesechess.userstats;

import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class SearchRankingParam {
    /**
     * 1=根据综合表现
     * 2=根据局数
     */
    @NotNull
    private Integer rankingBy;
}

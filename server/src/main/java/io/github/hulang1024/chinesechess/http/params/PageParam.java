package io.github.hulang1024.chinesechess.http.params;


import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

@Data
public class PageParam {
    /**
     * 第几页
     */
    @NotNull
    @Min(1)
    private Integer page;

    /**
     * 每页大小
     */
    @NotNull
    @Min(1)
    private Integer size;
}

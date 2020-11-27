package io.github.hulang1024.chinesechess.database;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import io.github.hulang1024.chinesechess.http.params.PageParam;

public class DaoPageParam extends Page {

    public DaoPageParam(PageParam pageParam) {
        super(pageParam.getPage(), pageParam.getSize());
    }
}

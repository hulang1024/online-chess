package io.github.hulang1024.chinesechess.http.results;

import com.baomidou.mybatisplus.core.metadata.IPage;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
public class PageRet<T> {
    /**
     * 总数
     */
    @Getter
    private long total;

    /**
     * 记录
     */
    @Getter
    private List<T> records;

    public PageRet(IPage<T> page) {
        if (page == null) {
            records = new ArrayList<>();
            return;
        }
        this.total = page.getTotal();
        this.records = page.getRecords();
    }
}

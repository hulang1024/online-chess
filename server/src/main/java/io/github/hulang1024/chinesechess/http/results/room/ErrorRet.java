package io.github.hulang1024.chinesechess.http.results.room;

import lombok.Data;

@Data
public class ErrorRet {
    private String msg;

    public ErrorRet(String msg) {
        this.msg = msg;
    }
}

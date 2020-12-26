package io.github.hulang1024.chinesechess.http.results;

import lombok.Data;

@Data
public class Result {
    protected int code;

    protected Result(int code) {
        this.code = code;
    }

    public boolean isOk() {
        return code == 0;
    }

    public static Result ok() {
        return new Result(0);
    }

    public static Result fail(int code) {
        assert code != 0;
        return new Result(code);
    }
}

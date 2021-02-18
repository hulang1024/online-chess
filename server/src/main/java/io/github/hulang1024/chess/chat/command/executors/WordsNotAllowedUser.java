package io.github.hulang1024.chess.chat.command.executors;

import io.github.hulang1024.chess.user.User;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class WordsNotAllowedUser {
    private User user;
    private LocalDateTime startTime;
    private Integer minutes;
}
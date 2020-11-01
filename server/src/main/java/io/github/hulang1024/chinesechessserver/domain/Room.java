package io.github.hulang1024.chinesechessserver.domain;

import java.util.ArrayList;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

/**
 * 房间
 * @author HuLang
 */
public class Room {
    @Setter
    @Getter
    private long id;

    @Setter
    @Getter
    private String name;

    @Setter
    @Getter
    private ChessPlayRound round;

    @Setter
    @Getter
    private Player creator;

    private List<Player> players = new ArrayList<>();

    public void onJoin(Player player) {
        players.add(player);
    }

    public void onLeave(Player player) {
        players.remove(player);
    }

    public int getPlayerCount() {
        return players.size();
    }

    public List<Player> getPlayers() {
        return players;
    }
}

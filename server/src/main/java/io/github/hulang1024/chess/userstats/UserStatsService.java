package io.github.hulang1024.chess.userstats;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import io.github.hulang1024.chess.database.DaoPageParam;
import io.github.hulang1024.chess.http.params.PageParam;
import io.github.hulang1024.chess.http.results.PageRet;
import io.github.hulang1024.chess.play.GameResult;
import io.github.hulang1024.chess.user.GuestUser;
import io.github.hulang1024.chess.user.SearchUserInfo;
import io.github.hulang1024.chess.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserStatsService {
    @Autowired
    private UserStatsDao userStatsDao;

    public void updateUser(User user, GameResult result) {
        if (user instanceof GuestUser) {
            return;
        }
        String updateField = new String[]{"draw_count", "win_count", "lose_count"}[result.getCode()];
        int rows = userStatsDao.update(null,
            new UpdateWrapper<UserStats>()
                .setSql("play_count = play_count + 1")
                .setSql(updateField + "=" + updateField + "+1")
                .eq("user_id", user.getId()));
        if (rows == 0) {
            initializeUser(user);
            updateUser(user, result);
        }
    }

    public PageRet<SearchUserInfo> searchRanking(SearchRankingParam searchRankingParam, PageParam pageParam) {
        QueryWrapper query = new QueryWrapper<User>();
        if (searchRankingParam.getRankingBy() == 1) {
            query.orderByDesc("win_count - lose_count");
        } else if (searchRankingParam.getRankingBy() == 2) {
            query.orderByDesc("play_count");
        }

        IPage<SearchUserInfo> userPage = userStatsDao.searchRankingUsers(new DaoPageParam(pageParam), query);
        return new PageRet<>(userPage);
    }

    private void initializeUser(User user) {
        UserStats userStats = new UserStats();
        userStats.setUserId(user.getId());
        userStatsDao.insert(userStats);
    }
}
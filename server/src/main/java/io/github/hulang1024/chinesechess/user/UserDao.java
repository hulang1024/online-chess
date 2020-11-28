package io.github.hulang1024.chinesechess.user;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Constants;
import io.github.hulang1024.chinesechess.database.DaoPageParam;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

public interface UserDao extends BaseMapper<User> {
    @Select("" +
        " select" +
        "     users.*," +
        "     user_stats.play_count 'userStats.playCount'," +
        "     user_stats.win_count 'userStats.winCount'," +
        "     user_stats.lose_count 'userStats.loseCount'," +
        "     user_stats.draw_count 'userStats.drawCount'" +
        " from users" +
        " left join user_stats on(users.id=user_stats.user_id)" +
        " ${ew.customSqlSegment}")
    IPage<SearchUserInfo> searchUsers(DaoPageParam pageParam, @Param(Constants.WRAPPER) QueryWrapper wrapper);
}

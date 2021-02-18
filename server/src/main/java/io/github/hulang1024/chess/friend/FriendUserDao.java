package io.github.hulang1024.chess.friend;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Constants;
import io.github.hulang1024.chess.database.DaoPageParam;
import io.github.hulang1024.chess.user.SearchUserInfo;
import io.github.hulang1024.chess.user.User;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

public interface FriendUserDao extends BaseMapper<User> {
    @Select("" +
        " select" +
        "     users.*, friends.is_mutual" +
        " from users inner join friends on(users.id=friends.friend_user_id)" +
        " ${ew.customSqlSegment}")
    IPage<SearchUserInfo> searchFriends(DaoPageParam pageParam, @Param(Constants.WRAPPER) QueryWrapper wrapper);
}
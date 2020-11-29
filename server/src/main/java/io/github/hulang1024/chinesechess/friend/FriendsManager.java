package io.github.hulang1024.chinesechess.friend;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import io.github.hulang1024.chinesechess.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class FriendsManager {
    @Autowired
    private FriendRelationDao friendRelationDao;

    public List<Long> getBelongFriendIds(User user) {
        return friendRelationDao.selectList(
            new QueryWrapper<FriendRelation>()
                .select("user_id")
                .eq("friend_user_id", user.getId())).stream()
            .map(FriendRelation::getUserId)
            .collect(Collectors.toList());
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean addFriend(long userId, long friendUserId) {
        if (userId == friendUserId) {
            return false;
        }

        FriendRelation reverse = friendRelationDao.selectOne(
            new QueryWrapper<FriendRelation>()
                .eq("user_id", friendUserId)
                .eq("friend_user_id", userId));

        FriendRelation relation = new FriendRelation();
        relation.setUserId(userId);
        relation.setFriendUserId(friendUserId);
        relation.setIsMutual(reverse != null);

        try {
            friendRelationDao.insert(relation);
            if (reverse != null) {
                reverse.setIsMutual(true);
                return friendRelationDao.updateById(reverse) > 0;
            }
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean deleteFriend(long userId, long friendUserId) {
        if (userId == friendUserId) {
            return false;
        }

        FriendRelation reverse = friendRelationDao.selectOne(
            new QueryWrapper<FriendRelation>()
                .eq("user_id", friendUserId)
                .eq("friend_user_id", userId));

        try {
            friendRelationDao.delete(
                new QueryWrapper<FriendRelation>()
                    .eq("user_id", userId)
                    .eq("friend_user_id", friendUserId));
            if (reverse != null) {
                reverse.setIsMutual(false);
                return friendRelationDao.updateById(reverse) > 0;
            }
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}

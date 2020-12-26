package io.github.hulang1024.chinesechess.friend;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import io.github.hulang1024.chinesechess.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class FriendsManager {
    @Autowired
    private FriendRelationDao friendRelationDao;

    // 用户朋友关系缓存
    private static Map<Long, List<FriendRelation>> userFriendRelationsCache = new ConcurrentHashMap();

    public List<FriendRelation> findBelongFriendRelations(User user) {
        return friendRelationDao.selectList(
            new QueryWrapper<FriendRelation>()
                .select("user_id, is_mutual")
                .eq("friend_user_id", user.getId())).stream()
            .collect(Collectors.toList());
    }


    public Optional<FriendRelation> findUserFriendRelation(User user, User lookup) {
        return getUserAllFriendRelations(user.getId()).stream()
            .filter(r -> r.getFriendUserId().equals(lookup.getId()))
            .findAny();
    }

    public List<FriendRelation> getUserAllFriendRelations(long userId) {
        return userFriendRelationsCache.computeIfAbsent(userId, (k) -> findFriends(userId));
    }

    public List<FriendRelation> findFriends(long userId) {
        return friendRelationDao.selectList(
            new QueryWrapper<FriendRelation>()
                .select("friend_user_id, is_mutual")
                .eq("user_id", userId)).stream()
            .collect(Collectors.toList());
    }

    @Transactional(rollbackFor = Exception.class)
    public AddFriendResult addFriend(long userId, long friendUserId) {
        if (userId == friendUserId) {
            return AddFriendResult.fail();
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
            boolean ok = friendRelationDao.insert(relation) > 0;
            if (!ok) {
                return AddFriendResult.fail();
            }

            if (userFriendRelationsCache.containsKey(userId)) {
                userFriendRelationsCache.get(userId).add(relation);
            }

            if (reverse != null) {
                reverse.setIsMutual(true);
                friendRelationDao.updateById(reverse);
                updateCacheMutual(true, userId, friendUserId);
            }

            return AddFriendResult.ok(relation.getIsMutual());
        } catch (Exception e) {
            return AddFriendResult.fail();
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
            boolean ok = friendRelationDao.delete(
                new QueryWrapper<FriendRelation>()
                    .eq("user_id", userId)
                    .eq("friend_user_id", friendUserId)) > 0;
            if (!ok) {
                return true;
            }
            if (userFriendRelationsCache.containsKey(userId)) {
                userFriendRelationsCache.get(userId).removeIf(r -> r.getFriendUserId().equals(friendUserId));
            }


            if (reverse != null) {
                reverse.setIsMutual(false);
                friendRelationDao.updateById(reverse);
                updateCacheMutual(false, userId, friendUserId);
            }

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private void updateCacheMutual(boolean isMutual, long userId, long friendUserId) {
        if (userFriendRelationsCache.containsKey(friendUserId)) {
            userFriendRelationsCache.get(friendUserId).stream()
                .filter(r -> r.getFriendUserId().equals(userId))
                .findAny().ifPresent(r -> {
                r.setIsMutual(isMutual);
            });
        }
    }
}

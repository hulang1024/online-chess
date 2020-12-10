<template>
  <q-card class="list-user-card text-white" :style="{backgroundColor}">
    <div class="row items-center">
      <user-avatar :user="user" size="60px" />
      <q-icon
        v-if="isFriend"
        name="favorite"
        class="absolute-bottom-right"
        :color="isMutual ? 'pink-5' : 'pink-1'"
      >
        <q-tooltip content-class="bg-black">{{isMutual ? '互为好友' : '好友'}}</q-tooltip>
      </q-icon>
      <div v-show="user" class="q-ml-xs">
        <div class="nickname ellipsis">{{nickname}}</div>
        <div class="stats-item">
          <span>胜率: </span>
          <span>{{winRate}}%</span>
          <span class="q-ml-sm">[{{userStatusText}}]</span>
        </div>
        <div class="stats-item">
          <span>局数: </span>
          <span>{{playCount}}</span>
          <span>&nbsp;({{winCount}}胜/{{loseCount}}负/{{drawCount}}和)</span>
        </div>
      </div>
    </div>
    <slot></slot>

  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, watch, ref } from "@vue/composition-api";
import { boot } from "quasar/wrappers";
import UserAvatar from "src/components/UserAvatar.vue";
import User from "src/online/user/User";
import UserStatus from "src/online/user/UserStatus";
import SearchUserInfo, { UserStats } from 'src/online/user/SearchUserInfo';

export default defineComponent({
  components: { UserAvatar },
  props: {
    user: Object as PropType<SearchUserInfo>,
  },
  setup(props) {
    const userStatus = ref<UserStatus>(props.user?.status as UserStatus);
    const USER_STATUS_COLOR_MAP = {
      [UserStatus.OFFLINE]: '#000',
      [UserStatus.ONLINE]: '#8bc34a',
      [UserStatus.IN_ROOM]: '#af52c6',
      [UserStatus.PLAYING]: '#ff9800',
      [UserStatus.SPECTATING]: 'grey'
    };
    const USER_STATUS_TEXT_MAP = {
      [UserStatus.OFFLINE]: '离线',
      [UserStatus.ONLINE]: '空闲',
      [UserStatus.IN_ROOM]: '游戏中',
      [UserStatus.PLAYING]: '对局中',
      [UserStatus.SPECTATING]: '旁观中'
    };
    const backgroundColor = computed(() => USER_STATUS_COLOR_MAP[userStatus.value]);
    const userStatusText = computed(() => USER_STATUS_TEXT_MAP[userStatus.value]);

    const { nickname, avatarUrl } = props.user as SearchUserInfo;
    const { playCount, winCount } = props.user?.userStats as UserStats;
    const winRate = (playCount ? winCount / playCount * 100 : 100).toFixed(2);

    watch(props, () => {
      userStatus.value = props.user?.status as UserStatus;
    });

    return {
      ...props.user,
      userStatusText,
      backgroundColor,
      ...(props.user?.userStats as UserStats),
      winRate
    }
  }
});
</script>

<style lang="sass" scoped>
.list-user-card
  width: 230px
  user-select: none
  cursor: pointer
  transition: all 0.2s ease-out

.nickname
  width: 110px
  font-size: 1.1em
  font-weight: 500

.stats-item
  font-size: 0.85em
</style>
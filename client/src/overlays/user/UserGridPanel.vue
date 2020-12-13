<template>
  <q-card
    class="list-user-card text-white"
    :style="{backgroundColor}"
  >
    <div class="row">
      <user-avatar
        :user="user"
        :size="$q.screen.xs ? '50px': '60px'"
      />
      <q-icon
        v-if="isFriend"
        name="favorite"
        class="absolute-bottom-right"
        :color="isMutual ? 'pink-5' : 'pink-1'"
      >
        <q-tooltip content-class="bg-black">
          {{ isMutual ? '互为好友' : '好友' }}
        </q-tooltip>
      </q-icon>
      <div
        v-show="user"
        class="q-ml-xs"
      >
        <div class="nickname ellipsis">
          {{ nickname }}
        </div>
        <div class="status-desc">
          ({{ userStatusText }})
        </div>
      </div>
    </div>
    <slot />
  </q-card>
</template>

<script lang="ts">
import {
  computed, defineComponent, PropType, watch, ref,
} from "@vue/composition-api";
import UserAvatar from "src/components/UserAvatar.vue";
import UserStatus from "src/online/user/UserStatus";
import SearchUserInfo from 'src/online/user/SearchUserInfo';

export default defineComponent({
  components: { UserAvatar },
  props: {
    user: Object as PropType<SearchUserInfo>,
  },
  setup(props) {
    const userStatus = ref<UserStatus>(props.user?.status as UserStatus);
    const isFriend = ref(props.user?.isFriend);

    const USER_STATUS_COLOR_MAP = {
      [UserStatus.OFFLINE]: '#1f1f1f',
      [UserStatus.ONLINE]: '#8bc34a',
      [UserStatus.IN_ROOM]: '#af52c6',
      [UserStatus.PLAYING]: '#ff9800',
      [UserStatus.SPECTATING]: 'grey',
    };
    const USER_STATUS_TEXT_MAP = {
      [UserStatus.OFFLINE]: '离线',
      [UserStatus.ONLINE]: '空闲',
      [UserStatus.IN_ROOM]: '准备游戏',
      [UserStatus.PLAYING]: '正在游戏',
      [UserStatus.SPECTATING]: '正在旁观',
    };
    const backgroundColor = computed(() => USER_STATUS_COLOR_MAP[userStatus.value]);
    const userStatusText = computed(() => USER_STATUS_TEXT_MAP[userStatus.value]);

    watch(props, () => {
      userStatus.value = props.user?.status as UserStatus;
      isFriend.value = props.user?.isFriend;
    });

    return {
      ...props.user,
      isFriend,
      userStatus,
      userStatusText,
      backgroundColor,
    };
  },
});
</script>

<style lang="sass" scoped>
.list-user-card
  width: 230px
  user-select: none
  cursor: pointer
  transition: all 0.2s ease-out

.nickname
  width: 160px
  font-size: 1.1em
  font-weight: 500

.status-desc
  color: #fafafa
  font-size: 0.85em
</style>

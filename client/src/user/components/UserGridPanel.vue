<template>
  <q-card
    class="list-user-card text-white"
    :style="{backgroundColor}"
    flat
    v-ripple
  >
    <div class="row items-center">
      <user-avatar
        :user="user"
        :online="userStatus != UserStatus.OFFLINE"
        rounded
        :size="$q.screen.xs ? '48px' : '56px'"
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
        class="q-ml-sm"
        :class="`text-${userStatus != UserStatus.OFFLINE || $q.dark.isActive ? 'white' : 'dark'}`"
      >
        <div class="nickname ellipsis">
          {{ nickname }}
        </div>
        <div class="status-desc">
          [{{ userStatusText }}]
        </div>
      </div>
    </div>
    <slot />
  </q-card>
</template>

<script lang="ts">
import {
  computed, defineComponent, PropType, watch, ref, getCurrentInstance,
} from "@vue/composition-api";
import UserAvatar from "src/user/components/UserAvatar.vue";
import UserStatus from "src/user/UserStatus";
import SearchUserInfo from 'src/online/user/SearchUserInfo';

export default defineComponent({
  components: { UserAvatar },
  props: {
    user: Object as PropType<SearchUserInfo>,
  },
  setup(props) {
    const ctx = getCurrentInstance() as Vue;
    const userStatus = ref<UserStatus>(props.user?.status as UserStatus);
    const isFriend = ref(props.user?.isFriend);

    const USER_STATUS_MAP = {
      [UserStatus.OFFLINE]: {
        text: '离线',
        color: ctx.$q.dark.isActive ? '#1f1f1f' : '#eee',
      },
      [UserStatus.ONLINE]: {
        text: '在线空闲',
        color: '#8bc34a',
      },
      [UserStatus.AFK]: {
        text: '暂时离开',
        color: 'grey',
      },
      [UserStatus.IN_LOBBY]: {
        text: '正在大厅',
        color: '#8bc34a',
      },
      [UserStatus.IN_ROOM]: {
        text: '准备游戏',
        color: '#af52c6',
      },
      [UserStatus.PLAYING]: {
        text: '正在游戏',
        color: '#ff9800',
      },
      [UserStatus.SPECTATING]: {
        text: '正在旁观',
        color: '#3f51b5',
      },
    };

    const backgroundColor = computed(() => USER_STATUS_MAP[userStatus.value].color);
    const userStatusText = computed(() => USER_STATUS_MAP[userStatus.value].text);

    watch(props, () => {
      userStatus.value = props.user?.status as UserStatus;
      isFriend.value = props.user?.isFriend;
    });

    return {
      UserStatus,
      ...props.user,
      userStatus,
      isFriend,
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

.list-user-card:hover
  opacity: 1

.nickname
  width: 156px
  font-size: 1.2em
  font-weight: 500

.status-desc
  font-size: 0.85em
</style>

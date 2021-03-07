<template>
  <q-card
    class="list-user-card text-white"
    :style="{backgroundColor: statusStates.color}"
    flat
    v-ripple
  >
    <div class="row items-center">
      <user-avatar
        :user="user"
        :online="userStatus != UserStatus.OFFLINE"
        rounded
        :size="$q.screen.xs ? '48px' : '58px'"
        @click="$emit('user-avatar-click')"
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
          <span
            v-if="userStatus != UserStatus.OFFLINE"
            class="q-mr-xs"
          >[{{ (deviceInfo && deviceInfo.deviceOS != 'unknown')
            ? translateDeviceOS(deviceInfo.deviceOS)
            : '' }}在线]</span>
          <span>[{{ statusStates.text }}]</span>
        </div>
      </div>
    </div>
    <slot />
  </q-card>
</template>

<script lang="ts">
import {
  computed, defineComponent, PropType, watch, getCurrentInstance, reactive, toRefs,
} from "@vue/composition-api";
import UserAvatar from "src/user/components/UserAvatar.vue";
import UserStatus from "src/user/UserStatus";
import SearchUserInfo from 'src/online/user/SearchUserInfo';
import { translateDeviceOS } from "src/user/device";

export default defineComponent({
  components: { UserAvatar },
  props: {
    user: Object as PropType<SearchUserInfo>,
  },
  setup(props) {
    const ctx = getCurrentInstance() as Vue;
    const states = reactive({
      userStatus: props.user?.status as UserStatus,
      isFriend: props.user?.isFriend,
      isMutual: props.user?.isMutual,
      deviceInfo: props.user?.deviceInfo,
    });

    const USER_STATUS_MAP = {
      [UserStatus.OFFLINE]: {
        text: '离线',
        color: ctx.$q.dark.isActive ? '#1f1f1f' : '#f5f5f5',
      },
      [UserStatus.ONLINE]: {
        text: '现在空闲',
        color: '#e1f5fe',
      },
      [UserStatus.AFK]: {
        text: '暂时离开',
        color: '#757575',
      },
      [UserStatus.IN_LOBBY]: {
        text: '正在大厅',
        color: '#3f51b5',
      },
      [UserStatus.IN_ROOM]: {
        text: '准备游戏',
        color: '#ff9800',
      },
      [UserStatus.PLAYING]: {
        text: '正在游戏',
        color: '#fdd835',
      },
      [UserStatus.SPECTATING]: {
        text: '正在观战',
        color: '#7870c2',
      },
    };

    const statusStates = computed(() => USER_STATUS_MAP[states.userStatus]);

    watch(props, () => {
      states.userStatus = props.user?.status as UserStatus;
      if (props.user?.isFriend != null) {
        states.isFriend = props.user?.isFriend;
      }
      if (props.user?.isMutual != null) {
        states.isMutual = props.user?.isMutual;
      }
      if (props.user?.deviceInfo) {
        states.deviceInfo = props.user?.deviceInfo;
      }
    });

    return {
      UserStatus,
      ...props.user,
      ...toRefs(states),
      statusStates,
      translateDeviceOS,
    };
  },
});
</script>

<style lang="sass" scoped>
.list-user-card
  width: 250px
  user-select: none
  cursor: pointer
  transition: all 0.2s ease-out

.list-user-card:hover
  opacity: 1

.nickname
  width: 176px
  font-size: 1.22em
  font-weight: 500

.status-desc
  font-size: 0.85em
</style>

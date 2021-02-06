<template>
  <q-dialog
    v-model="isOpen"
    transition-show="slide-up"
    transition-hide="slide-down"
    maximized
    seamless
    flat
    content-class="social-browser-overlay z-top"
  >
    <q-card
      flat
      class="content-card q-px-sm"
    >
      <span class="text-subtitle1">在线用户数<span class="count">{{ onlineCount }}</span></span>
      <span class="q-ml-lg text-subtitle1">游客<span class="count">{{ guestCount }}</span></span>
      <q-tabs
        v-model="activeTab"
        align="left"
        dense
        inline-label
        :breakpoint="0"
        indicator-color="primary"
        class="col"
      >
        <q-tab
          key="friends"
          name="friends"
          label="好友"
        />
        <q-tab
          key="all"
          name="all"
          label="全部"
        />
        <q-tab
          key="in_room"
          name="in_room"
          label="准备游戏"
        />
        <q-tab
          key="playing"
          name="playing"
          label="正在游戏"
        />
      </q-tabs>
      <div
        class="flex items-start justify-center content-start q-pt-sm q-gutter-sm scroll users"
      >
        <q-inner-loading
          :showing="loading"
          color="orange"
          class="bg-transparent"
          size="3em"
        />
        <template v-if="users.length > 0">
          <template
            v-for="user in users"
          >
            <user-grid-panel
              v-if="isShowInTab(user)"
              :key="user.id"
              :user="user"
              @user-avatar-click="onUserAvatarClick(user)"
            >
              <q-menu
                v-if="isLoggedIn && !isMe(user)"
                content-class="bg-primary text-white z-top"
                touch-position
              >
                <q-list>
                  <q-item
                    key="details"
                    v-close-popup
                    clickable
                    @click="onUserDetailsClick(user)"
                  >
                    <q-item-section>查看详情</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item
                    key="chat"
                    v-close-popup
                    clickable
                    @click="onChatClick(user)"
                  >
                    <q-item-section>聊天</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item
                    key="spectate"
                    v-close-popup
                    clickable
                    @click="onSpectateClick(user)"
                  >
                    <q-item-section>观看游戏</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item
                    key="invite-play"
                    v-close-popup
                    clickable
                    @click="onInviteClick(user, 1)"
                  >
                    <q-item-section>邀请加入游戏</q-item-section>
                  </q-item>
                  <q-item
                    key="invite-spectate"
                    v-close-popup
                    clickable
                    @click="onInviteClick(user, 2)"
                  >
                    <q-item-section>邀请观看游戏</q-item-section>
                  </q-item>
                  <template v-if="user.isFriend">
                    <q-separator />
                    <q-item
                      key="deleteFriend"
                      v-close-popup
                      clickable
                      @click="onDeleteFriendClick(user)"
                    >
                      <q-item-section>删除好友</q-item-section>
                    </q-item>
                  </template>
                </q-list>
              </q-menu>
            </user-grid-panel>
          </template>
        </template>
        <span
          v-else-if="!loading"
          class="absolute-center"
        >未查询到用户:(</span>
      </div>
    </q-card>

  </q-dialog>
</template>

<script lang="ts">
import {
  defineComponent, getCurrentInstance, ref, watch,
} from '@vue/composition-api';
import DeleteFriendRequest from 'src/online/friend/DeleteFriendRequest';
import SpectateUserRequest from 'src/online/spectator/SpectateUserRequest';
import GetUsersRequest from 'src/online/user/GetUsersRequest';
import InviteRequest from 'src/online/invitation/InviteRequest';
import SearchUserInfo from 'src/online/user/SearchUserInfo';
import * as UserEvents from "src/online/ws/events/user";
import * as StatEvents from "src/online/ws/events/stat";
import { api, channelManager, socketService } from 'src/boot/main';
import SearchUserParams from 'src/online/user/SearchUserParams';
import UserStatus from 'src/user/UserStatus';
import APIPageResponse from 'src/online/api/APIPageResponse';
import SpectateResponse from 'src/online/spectator/APISpectateResponse';
import UserGridPanel from 'src/user/components/UserGridPanel.vue';

export default defineComponent({
  components: { UserGridPanel },
  inject: ['showUserDetails'],
  setup(props, { emit }) {
    const context = getCurrentInstance() as Vue;
    const { $router, $q } = context;

    const isOpen = ref(false);
    const activeTab = ref('all');
    const loading = ref(true);
    const users = ref<SearchUserInfo[]>([]);
    const onlineCount = ref<number>(0);
    const guestCount = ref<number>(0);

    watch(isOpen, () => {
      emit('active', isOpen.value, props);
    });

    const queryUsers = () => {
      users.value = [];
      const searchParams = new SearchUserParams();
      searchParams.onlyFriends = activeTab.value == 'friends';
      if (searchParams.onlyFriends && api.localUser.id < 0) {
        return;
      }
      if (activeTab.value == 'playing') {
        searchParams.status = UserStatus.PLAYING;
      } else if (activeTab.value == 'in_room') {
        searchParams.status = UserStatus.IN_ROOM;
      }
      const req = new GetUsersRequest(searchParams);
      req.loading = loading;
      req.success = (userPage: APIPageResponse<SearchUserInfo>) => {
        users.value = userPage.records;
      };
      api.queue(req);
    };

    watch(activeTab, () => {
      queryUsers();
    });

    const show = () => {
      isOpen.value = true;
      users.value = [];
      setTimeout(() => {
        queryUsers();
      }, 300);
      socketService.queue((send) => {
        send('user_activity.enter', { code: 2 });
      });
    };

    const hide = () => {
      isOpen.value = false;
      socketService.queue((send) => {
        send('user_activity.exit', { code: 2 });
      });
    };

    const toggle = () => {
      if (isOpen.value) {
        show();
      } else {
        hide();
      }
    };

    const isLoggedIn = ref<boolean>(api.isLoggedIn); // todo:全局加入响应式
    api.state.changed.add(() => {
      isLoggedIn.value = api.isLoggedIn;
    });

    UserEvents.statusChanged.add((msg: UserEvents.UserStatusChangedMsg) => {
      const found = users.value.find((u) => u.id == msg.uid);
      let isToAdd = false;
      switch (activeTab.value) {
        case 'all':
          if (!found) {
            isToAdd = true;
          }
          break;
        case 'in_room':
        case 'playing': {
          if (found) {
            if (found.status != msg.status) {
              users.value = users.value.filter((u) => u.id != msg.uid);
            }
          } else if ((msg.status == UserStatus.IN_ROOM || msg.status == UserStatus.PLAYING)) {
            isToAdd = true;
          }
          break;
        }
        default:
          break;
      }

      if (isToAdd) {
        users.value = users.value.concat([msg.user]);
      }
      if (found) {
        found.status = msg.status;
        found.isOnline = msg.status != UserStatus.OFFLINE;
        found.loginDeviceOS = msg.user?.loginDeviceOS;
      }

      users.value = users.value.sort((a, b) => (a.isOnline ? (b.isOnline ? 0 : -1) : +1));
    });

    StatEvents.online.add((msg: StatEvents.StatOnlineCountMsg) => {
      onlineCount.value = msg.online;
      guestCount.value = msg.guest;
    });

    const isShowInTab = (user: SearchUserInfo) => {
      if (activeTab.value == 'friends') {
        return user.isFriend;
      }
      if (activeTab.value == 'in_room') {
        return user.status == UserStatus.IN_ROOM;
      }
      if (activeTab.value == 'playing') {
        return user.status == UserStatus.PLAYING;
      }
      return true;
    };

    const onUserAvatarClick = (user: SearchUserInfo) => {
      // eslint-disable-next-line
      (context as any).showUserDetails(user);
    };

    const onUserDetailsClick = (user: SearchUserInfo) => {
      // eslint-disable-next-line
      (context as any).showUserDetails(user);
    };

    const onChatClick = (user: SearchUserInfo) => {
      isOpen.value = false;
      // eslint-disable-next-line
      (context.$vnode.context?.$refs.toolbar as any).excludeToggle('chat', true);
      channelManager.openPrivateChannel(user);
    };

    const onSpectateClick = (user: SearchUserInfo) => {
      const req = new SpectateUserRequest(user);
      $q.loading.show();
      req.success = async (spectateResponse: SpectateResponse) => {
        isOpen.value = false;
        if (spectateResponse.isFollowedOtherSpectator) {
          $q.loading.show({ message: `正在跟随${user.nickname}观看` });
        }
        await $router.push({
          name: 'spectate',
          replace: true,
          query: { id: spectateResponse.room.id as unknown as string },
          params: { spectateResponse: spectateResponse as unknown as string },
        });
        $q.loading.hide();
      };
      req.failure = (res) => {
        $q.loading.hide();
        const codeMsgMap: {[code: number]: string} = {
          2: '该用户未在线',
          3: '该用户未加入游戏',
          4: '不满足观看条件',
          5: '你在游戏中不能观看其它游戏',
        };
        $q.notify({
          type: 'warning',
          message: codeMsgMap[res.code] || '原因未知',
        });
      };
      api.perform(req);
    };

    const onInviteClick = (user: SearchUserInfo, subject: number) => {
      const req = new InviteRequest(user, subject);
      req.success = () => {
        $q.notify({
          type: 'positive',
          message: `已发送邀请给${user.nickname}`,
        });
      };
      req.failure = (res) => {
        const codeMsgMap: {[code: number]: string} = {
          1: '邀请失败',
          2: '该用户未在线',
          3: '请先加入游戏',
          4: '请先加入或观看游戏',
        };
        $q.notify({
          type: 'warning',
          message: codeMsgMap[res.code],
        });
      };
      api.perform(req);
    };

    const onDeleteFriendClick = (user: SearchUserInfo) => {
      const req = new DeleteFriendRequest(user);
      req.success = () => {
        user.isFriend = false;
        user.isMutual = false;
        $q.notify({ type: 'positive', message: `已删除好友${user.nickname}` });
      };
      api.perform(req);
    };

    socketService.reconnected.add(() => {
      if (!isOpen.value) {
        return;
      }
      queryUsers();
      socketService.send('user_activity.enter', { code: 2 });
    });

    return {
      isOpen,
      toggle,
      show,
      hide,

      activeTab,
      loading,

      isShowInTab,
      users,
      onlineCount,
      guestCount,
      isLoggedIn,
      isMe: (user: SearchUserInfo) => user.id == api.localUser.id,

      onUserAvatarClick,
      onUserDetailsClick,
      onChatClick,
      onSpectateClick,
      onInviteClick,
      onDeleteFriendClick,
    };
  },
});
</script>

<style lang="scss" scoped>
.social-browser-overlay {
  & .content-card {
    top: 40px;

    & .q-tab-panels {
      height: 180px;
      background: transparent;

      .q-tab-panel {
        padding: 4px 4px;
      }
    }

    .users {
      position: relative;
      min-height: calc(100% - 112px);
      padding-bottom: 50px;
    }
  }

  .count {
    padding-left: 4px;
    font-weight: 1.1em;
    font-weight: bold;
  }
}
</style>

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
      <span class="text-white text-subtitle1">在线人数: {{ onlineCount }}</span>
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
                  <template v-if="!user.isFriend">
                    <q-separator />
                    <q-item
                      key="addFriend"
                      v-close-popup
                      clickable
                      @click="onAddFriendClick(user)"
                    >
                      <q-item-section>加为好友</q-item-section>
                    </q-item>
                  </template>
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
          class="text-white absolute-center"
        >未查询到用户:(</span>
      </div>
    </q-card>

    <user-details-overlay ref="userDetailsOverlay" />
  </q-dialog>
</template>

<script lang="ts">
import {
  defineComponent, getCurrentInstance, ref, watch,
} from '@vue/composition-api';
import AddAsFriendRequest from 'src/online/friend/AddAsFriendRequest';
import DeleteFriendRequest from 'src/online/friend/DeleteFriendRequest';
import SpectateUserRequest from 'src/online/spectator/SpectateUserRequest';
import GetUsersRequest from 'src/online/user/GetUsersRequest';
import SearchUserInfo from 'src/online/user/SearchUserInfo';
import * as UserEvents from "src/online/ws/events/user";
import * as StatEvents from "src/online/ws/events/stat";
import { api, channelManager, socketService } from 'src/boot/main';
import SearchUserParams from 'src/online/user/SearchUserParams';
import UserStatus from 'src/online/user/UserStatus';
import APIPageResponse from 'src/online/api/APIPageResponse';
import SpectateResponse from 'src/online/spectator/APISpectateResponse';
import UserDetailsOverlay from '../user/UserDetailsOverlay.vue';
import UserGridPanel from '../user/UserGridPanel.vue';

export default defineComponent({
  components: { UserGridPanel, UserDetailsOverlay },
  setup() {
    const { $refs, $router, $q } = getCurrentInstance() as Vue;

    const isOpen = ref(false);
    const activeTab = ref('all');
    const loading = ref(true);
    const users = ref<SearchUserInfo[]>([]);
    const onlineCount = ref<number>(0);

    const queryUsers = () => {
      users.value = [];
      const searchParams = new SearchUserParams();
      searchParams.onlyFriends = activeTab.value == 'friends';
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

    const show = () => {
      isOpen.value = true;
      users.value = [];
      setTimeout(() => {
        queryUsers();
      }, 300);
      socketService.queue((send) => {
        send('activity.enter', { code: 2 });
      });
    };

    const hide = () => {
      isOpen.value = false;
      socketService.queue((send) => {
        send('activity.exit', { code: 2 });
      });
    };

    const toggle = () => {
      if (isOpen.value) {
        show();
      } else {
        hide();
      }
    };

    const isLoggedIn = ref<boolean>(api.isLoggedIn.value); // todo:全局加入响应式
    api.isLoggedIn.changed.add((state: boolean) => {
      isLoggedIn.value = state;
    });

    UserEvents.statusChanged.add((msg: UserEvents.UserStatusChangedMsg) => {
      const found = users.value.find((u) => u.id == msg.uid);
      let isToAdd = false;
      switch (activeTab.value) {
        case 'all':
          if (found) {
            found.status = msg.status;
          } else {
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
    });

    StatEvents.online.add((msg: StatEvents.StatOnlineCountMsg) => {
      onlineCount.value = msg.online;
    });

    watch(activeTab, () => {
      queryUsers();
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

    const onUserDetailsClick = (user: SearchUserInfo) => {
      // eslint-disable-next-line
      (<any>$refs.userDetailsOverlay).show(user);
    };

    const onChatClick = (user: SearchUserInfo) => {
      channelManager.openPrivateChannel(user);
    };

    const onSpectateClick = (user: SearchUserInfo) => {
      const req = new SpectateUserRequest(user);
      req.success = (spectateResponse: SpectateResponse) => {
        isOpen.value = false;
        $router.push({name: 'spectate', params: { spectateResponse }});
      };
      req.failure = (res) => {
        const codeMsgMap: {[code: number]: string} = {
          2: '该用户未在线',
          3: '该用户未加入游戏',
          4: '不满足观看条件',
          5: '你在游戏中不能观看其它游戏',
        };
        $q.notify({
          type: 'warning',
          message: `观看请求失败，${codeMsgMap[res.code] || '原因未知'}`,
        });
      };
      api.perform(req);
    };

    const onAddFriendClick = (user: SearchUserInfo) => {
      const req = new AddAsFriendRequest(user);
      req.success = () => {
        user.isFriend = true;
        $q.notify({ type: 'positive', message: `已将${user.nickname}加为好友` });
      };
      api.perform(req);
    };

    const onDeleteFriendClick = (user: SearchUserInfo) => {
      const req = new DeleteFriendRequest(user);
      req.success = () => {
        user.isFriend = false;
        $q.notify({ type: 'positive', message: `已删除好友${user.nickname}` });
      };
      api.perform(req);
    };

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
      isLoggedIn,
      isMe: (user: SearchUserInfo) => user.id == api.localUser.id,

      onUserDetailsClick,
      onChatClick,
      onSpectateClick,
      onAddFriendClick,
      onDeleteFriendClick,
    };
  },
});
</script>

<style lang="scss" scoped>
.social-browser-overlay {
  & .content-card {
    top: 40px;
    background: rgba(0, 0, 0, 0.7);

    & .q-tabs {
      color: white;
    }

    & .q-tab-panels {
      height: 180px;
      background: transparent;
      color: white;

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
}
</style>

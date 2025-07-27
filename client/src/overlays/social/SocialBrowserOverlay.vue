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
      <user-online-count-panel />
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
              <user-menu :user="user" />
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
} from 'vue';
import device from "current-device";
import {
  api, socketService, userActivityClient, userManager,
} from 'src/boot/main';
import SearchUserParams from 'src/online/user/SearchUserParams';
import UserStatus from 'src/user/UserStatus';
import APIPageResponse from 'src/online/api/APIPageResponse';
import UserGridPanel from 'src/user/components/UserGridPanel.vue';
import GetUsersRequest from 'src/online/user/GetUsersRequest';
import SearchUserInfo from 'src/online/user/SearchUserInfo';
import UserMenu from '../user/UserMenu.vue';
import UserOnlineCountPanel from '../user/UserOnlineCountPanel.vue';

export default defineComponent({
  components: { UserGridPanel, UserMenu, UserOnlineCountPanel },
  inject: ['showUserDetails'],
  setup(props, { emit }) {
    const context = getCurrentInstance()!.proxy as unknown as Vue;

    const isOpen = ref(false);
    const activeTab = ref('all');
    const loading = ref(true);
    const users = ref<SearchUserInfo[]>([]);

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
      // eslint-disable-next-line
      if (device.mobile()) {
        userActivityClient.enter(2);
      }
    };

    const hide = () => {
      isOpen.value = false;
      // eslint-disable-next-line
      if (device.mobile()) {
        userActivityClient.exit(2);
      }
    };

    const toggle = () => {
      if (isOpen.value) {
        show();
      } else {
        hide();
      }
    };

    userManager.userStatusChanged.add((user: SearchUserInfo, status: UserStatus) => {
      const found = users.value.find((u) => u.id == user.id);
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
            if (found.status != status) {
              users.value = users.value.filter((u) => u.id != user.id);
            }
          } else if ((status == UserStatus.IN_ROOM || status == UserStatus.PLAYING)) {
            isToAdd = true;
          }
          break;
        }
        default:
          break;
      }

      if (isToAdd) {
        users.value = users.value.concat([user]);
      }
      if (found) {
        found.status = status;
        found.isOnline = status != UserStatus.OFFLINE;
        if (user?.deviceInfo) {
          found.deviceInfo = user?.deviceInfo;
        }
      }

      users.value = users.value.sort((a, b) => (a.isOnline ? (b.isOnline ? 0 : -1) : +1));
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

    socketService.reLoggedIn.add(() => {
      if (!isOpen.value) {
        return;
      }
      queryUsers();
      userActivityClient.enter(2);
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
      onUserAvatarClick,
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

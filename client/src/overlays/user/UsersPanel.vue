<template>
  <q-card
    class="users-panel"
    flat
  >
    <user-online-count-panel class="q-pl-xs" />
    <q-tabs
      v-model="activeTab"
      align="left"
      dense
      narrow-indicator
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
    <q-table
      v-show="!loading && users.length"
      :data="users"
      :columns="columns"
      row-key="id"
      dense
      bordered
      flat
      hide-pagination
      hide-no-data
      separator="none"
      :pagination="{
        page: 1,
        rowsPerPage: 50,
      }"
      class="table"
    >
      <template v-slot:body="props">
        <q-tr>
          <q-td
            key="device"
            style="width: 14px"
          >
            <q-icon
              v-if="props.row.isOnline && props.row.deviceInfo"
              :name="deviceToIcon(props.row.deviceInfo.device)"
            />
          </q-td>
          <q-td
            key="nickname"
            class="nickname ellipsis"
            :title="props.row.nickname"
          >
            {{ props.row.nickname }}
          </q-td>

          <q-td
            key="status"
            :style="{
              'text-align': 'right',
              color: USER_STATUS_MAP[props.row.status].color
            }"
          >
            {{ USER_STATUS_MAP[props.row.status].text }}
          </q-td>
          <user-menu :user="props.row" />
        </q-tr>
      </template>
    </q-table>
  </q-card>
</template>

<script lang="ts">
import {
  defineComponent, getCurrentInstance, onBeforeUnmount, onMounted, ref, watch,
} from '@vue/composition-api';
import GetUsersRequest from 'src/online/user/GetUsersRequest';
import SearchUserInfo from 'src/online/user/SearchUserInfo';
import {
  api, socketService, userActivityClient, userManager,
} from 'src/boot/main';
import SearchUserParams from 'src/online/user/SearchUserParams';
import UserStatus from 'src/user/UserStatus';
import APIPageResponse from 'src/online/api/APIPageResponse';
import UserGridPanel from 'src/user/components/UserGridPanel.vue';
import UserMenu from './UserMenu.vue';
import UserOnlineCountPanel from './UserOnlineCountPanel.vue';

export default defineComponent({
  components: { UserGridPanel, UserMenu, UserOnlineCountPanel },
  setup() {
    const context = getCurrentInstance() as Vue;

    const activeTab = ref('all');
    const loading = ref(true);
    const users = ref<SearchUserInfo[]>([]);

    const USER_STATUS_MAP = {
      [UserStatus.OFFLINE]: {
        text: '离线',
        color: context.$q.dark.isActive ? '#616161' : '#bdbdbd',
      },
      [UserStatus.ONLINE]: {
        text: '空闲',
        color: '#4caf50',
      },
      [UserStatus.AFK]: {
        text: '暂时离开',
        color: '#757575',
      },
      [UserStatus.IN_LOBBY]: {
        text: '空闲',
        color: '#4caf50',
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

    const columns = [
      { name: 'device', align: 'left' },
      { name: 'nickname', label: '用户名/昵称', align: 'left' },
      { name: 'status', label: '状态' },
    ];

    const queryUsers = () => {
      users.value = [];
      const searchParams = new SearchUserParams();
      searchParams.online = true;
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

    const onLoggedIn = () => {
      queryUsers();
      userActivityClient.enter(2);
    };
    socketService.reLoggedIn.add(onLoggedIn);

    onMounted(() => {
      onLoggedIn();
    });

    onBeforeUnmount(() => {
      socketService.reLoggedIn.remove(onLoggedIn);
      userActivityClient.exit(2);
    });

    watch(activeTab, () => {
      queryUsers();
    });

    userManager.userStatusChanged.add((user: SearchUserInfo, status: UserStatus) => {
      const found = users.value.find((u) => u.id == user.id);
      if (found) {
        if (status == UserStatus.OFFLINE) {
          users.value = users.value.filter((u) => u.id != found.id);
          return;
        }
        found.isOnline = true;
      }

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

    return {
      columns,
      USER_STATUS_MAP,
      deviceToIcon(device: number) {
        return ['desktop_windows', 'phone_iphone'][device - 1];
      },

      activeTab,
      loading,

      isShowInTab,
      users,

      queryUsers,
    };
  },
});
</script>

<style lang="scss" scoped>
.users-panel {
  & .q-tab-panels {
    background: transparent;

    .q-tab-panel {
      padding: 4px 4px;
    }
  }

  .table {
    height: calc(100% - 82px);

    tr {
      user-select: none;

      &:active {
        opacity: 0.5;
      }
    }

    &.q-dark {
      tr:nth-child(odd) {
        background: $grey-10;
      }
    }
    &:not(.q-dark) {
      tr:nth-child(odd) {
        background: $grey-1;
      }
    }
  }
}
</style>
<style scoped>
.table >>> thead tr th {
  position: sticky;
  z-index: 1;
  font-size: 13px;
}
.table:not(.q-dark) >>> thead tr:first-child th {
  background-color: #fff;
}
.table.q-dark >>> thead tr:first-child th {
  background-color: #1d1d1d;
}
.table >>> thead tr:first-child th {
  top: 0;
}
</style>

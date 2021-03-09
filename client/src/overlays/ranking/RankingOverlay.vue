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
      <q-tabs
        v-model="gameTypeActiveTab"
        align="left"
        dense
        inline-label
        :breakpoint="0"
        indicator-color="primary"
        class="col"
      >
        <q-tab
          :name="2"
          label="五子棋"
        />
        <q-tab
          :name="1"
          label="象棋"
        />
        <q-tab
          :name="3"
          label="揭棋"
        />
      </q-tabs>
      <q-tabs
        v-model="rankingByActiveTab"
        align="left"
        dense
        inline-label
        :breakpoint="0"
        indicator-color="orange"
        class="col"
      >
        <q-tab
          key="performance"
          :name="1"
          label="表现"
        />
        <q-tab
          key="playCount"
          :name="2"
          label="局数"
        />
      </q-tabs>
      <q-table
        v-show="!loading && users.length"
        :data="users"
        :columns="columns"
        row-key="id"
        dense
        :bordered="false"
        flat
        hide-pagination
        hide-no-data
        virtual-scroll
        :pagination="{
          page: 1,
          rowsPerPage: 50,
        }"
        class="q-mt-sm bg-transparent"
      >
        <template v-slot:body="props">
          <q-tr :props="props" class="user-row">
            <q-td key="rank" :props="props" class="rank-no">
              #{{ props.row.rank }}
            </q-td>
            <q-td key="avatarUrl" :props="props" class="avatar">
              <user-avatar
                :user="props.row"
                size="30px"
                @click="onUserClick(props.row)"
              />
            </q-td>
            <q-td
              key="nickname" :props="props"
              class="nickname ellipsis"
              :title="props.row.nickname"
              @click="onUserClick(props.row)"
            >
              {{ props.row.nickname }}
            </q-td>
            <q-td key="winRate" :props="props" class="count win-rate">
              {{ props.row.userStats.winRate.toFixed(2) }}%
            </q-td>
            <q-td key="playCount" :props="props" class="count">
              {{ props.row.userStats.playCount }}
            </q-td>
            <q-td key="winCount" :props="props" class="count">
              {{ props.row.userStats.winCount }}
            </q-td>
            <q-td key="loseCount" :props="props" class="count">
              {{ props.row.userStats.loseCount }}
            </q-td>
            <q-td key="drawCount" :props="props" class="count">
              {{ props.row.userStats.drawCount }}
            </q-td>
          </q-tr>
        </template>
      </q-table>
      <q-inner-loading
        :showing="loading"
        color="orange"
        class="bg-transparent"
        size="3em"
      />
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import {
  defineComponent, getCurrentInstance, ref, watch,
} from '@vue/composition-api';
import GetRankingRequest from 'src/online/ranking/GetRankingRequest';
import SearchUserInfo from 'src/online/user/SearchUserInfo';
import { api } from 'src/boot/main';
import SearchRankingParams from 'src/online/ranking/SearchRankingParams';
import APIPageResponse from 'src/online/api/APIPageResponse';
import UserAvatar from 'src/user/components/UserAvatar.vue';
import User from 'src/user/User';

export default defineComponent({
  components: { UserAvatar },
  inject: ['showUserDetails'],
  setup() {
    const context = getCurrentInstance() as Vue;
    const isOpen = ref(false);
    const gameTypeActiveTab = ref(0);
    const rankingByActiveTab = ref(1);
    const loading = ref(true);

    const columns = [
      { name: 'rank', align: 'left' },
      { name: 'avatarUrl', align: 'left' },
      { name: 'nickname', field: 'nickname', align: 'left' },
      { name: 'winRate', label: '胜率', align: 'center' },
      { name: 'playCount', label: '局数', align: 'center' },
      { name: 'winCount', label: '胜', align: 'center' },
      { name: 'loseCount', label: '负', align: 'center' },
      { name: 'drawCount', label: '和', align: 'center' },
    ];

    const users = ref<SearchUserInfo[]>([]);

    const queryRankingUsers = () => {
      users.value = [];
      const searchParams = new SearchRankingParams();
      searchParams.size = 50;
      searchParams.page = 1;
      searchParams.gameType = gameTypeActiveTab.value;
      searchParams.rankingBy = rankingByActiveTab.value;
      const req = new GetRankingRequest(searchParams);
      req.loading = loading;
      req.success = (userPage: APIPageResponse<SearchUserInfo>) => {
        users.value = userPage.records.map((user, index) => {
          // eslint-disable-next-line
          (<any>user).rank = index + 1;
          return user;
        });
      };
      api.queue(req);
    };

    const show = () => {
      users.value = [];
      setTimeout(() => {
        queryRankingUsers();
      }, 300);
      gameTypeActiveTab.value = api.localUser.playGameType || 2;
      isOpen.value = true;
    };

    const hide = () => {
      isOpen.value = false;
    };

    const toggle = () => {
      isOpen.value = !isOpen.value;

      if (isOpen.value) {
        show();
      }
    };

    watch([gameTypeActiveTab, rankingByActiveTab], queryRankingUsers);

    const onUserClick = (u: User) => {
      // eslint-disable-next-line
      (context as any).showUserDetails(u);
    };

    return {
      isOpen,
      toggle,
      show,
      hide,

      gameTypeActiveTab,
      rankingByActiveTab,
      loading,
      columns,
      users,

      onUserClick,
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

    .q-table {
      .user-row {

        .rank-no {
          padding-left: 8px;
          padding-right: 4px;
          width: 10px;
          font-weight: bold;
        }

        .avatar {
          padding-left: 0px;
          width: 30px;
        }

        .nickname {
          padding-left: 0px;
          max-width: 90px;
          color: $primary;
          user-select: none;
          cursor: pointer;
        }

        .count {
          width: 40px;
        }

        .win-rate {
          padding: 0;
        }
      }
    }
  }
}
</style>

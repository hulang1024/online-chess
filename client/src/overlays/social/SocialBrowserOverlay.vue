<template>
  <q-dialog
    v-model="isOpen"
    transition-show="slide-up"
    transition-hide="slide-down"
    maximized
    seamless
    flat
    content-class="social-browser-overlay"
  >
    <q-card flat class="content-card q-px-sm">
      <span class="text-white text-subtitle1">在线人数: {{onlineCount}}</span>
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
      </q-tabs>
      <div
        class="row items-start q-pt-sm q-gutter-sm scroll"
        style="max-height: calc(100% - 84px)">
        <list-user-card
          v-for="user in users"
          :key="user.id"
          :user="user"
        >
          <q-menu v-if="isLoggedIn && !isMe(user)" content-class="bg-primary text-white" touch-position>
            <q-list>
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
        </list-user-card>
      </div>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, reactive, ref, watch } from '@vue/composition-api'
import APIAccess from 'src/online/api/APIAccess';
import ChannelManager from 'src/online/chat/ChannelManager';
import AddAsFriendRequest from 'src/online/friend/AddAsFriendRequest';
import DeleteFriendRequest from 'src/online/friend/DeleteFriendRequest';
import SpectateUserRequest from 'src/online/spectator/SpectateUserRequest';
import GetUsersRequest from 'src/online/user/GetUsersRequest';
import User from 'src/online/user/User';
import ListUserCard from './ListUserCard.vue';
import SearchUserInfo from 'src/online/user/SearchUserInfo';
import * as user_events from "src/online/ws/events/user";
import * as stat_events from "src/online/ws/events/stat";
import SocketService from 'src/online/ws/SocketService';
import UserStatus from 'src/online/user/UserStatus';

export default defineComponent({
  components: { ListUserCard },
  setup() {
    const ctx = getCurrentInstance();
    const api: APIAccess = (<any>ctx).api;
    const socketService: SocketService = (<any>ctx).socketService;
    const notify = (<any>ctx).$q.notify;

    const isOpen = ref(false);
    const activeTab = ref('all');
    const users = ref<SearchUserInfo[]>([]);
    const onlineCount = ref<number>(0);

    const toggle = () => { 
      isOpen.value = !isOpen.value;

      if (isOpen.value) {
        queryUsers();
      }
      socketService.queue((send: Function) => {
        send(`activity.${isOpen.value ? 'enter' : 'exit'}`, {code: 2})
      });
    };

    const hide = () => { 
      isOpen.value = false;
    };

    const isLoggedIn = ref<boolean>(api.isLoggedIn.value);//todo:全局加入响应式
    api.isLoggedIn.changed.add((state: boolean) => {
      isLoggedIn.value = state;
    });

    user_events.statusChanged.add((msg: user_events.UserStatusChangedMsg) => {
      let i = users.value.findIndex(u => u.id == msg.uid);
      if (i > -1) {
        users.value[i].status = msg.status;
      }
    });

    stat_events.online.add((msg: stat_events.StatOnlineCountMsg) => {
      onlineCount.value = msg.online;
    });

    const queryUsers = () => {
      let searchParams = {page: 1, size: 100, onlyFriends: false};
      searchParams.onlyFriends = activeTab.value == 'friends';
      let req = new GetUsersRequest(searchParams);
      req.success = (userPage: any) => {
        users.value = userPage.records;
      };
      api.queue(req);
    };

    queryUsers();

    watch(activeTab, () => {
      queryUsers();
    });

    const onChatClick = (user: SearchUserInfo) => {
      let channelManager = (<any>ctx).channelManager as ChannelManager;
      channelManager.openPrivateChannel(user);
    };

    const onSpectateClick = (user: SearchUserInfo) => {
      let req = new SpectateUserRequest(user);
      req.success = (res) => {
        hide();
        
        alert('todo');
        //todo
      };
      req.failure = (res) => {
        let codeMsgMap: any = {
          2: '该用户未在线',
          3: '该用户未加入游戏',
          4: '不满足观看条件',
          5: '你在游戏中不能观看其它游戏'
        };
        notify({
          type: 'warning',
          message: `观看请求失败，${codeMsgMap[res.code] || '原因未知'}`
        });
      };
      api.perform(req);
    };

    const onAddFriendClick = (user: SearchUserInfo) => {
        let req = new AddAsFriendRequest(user);
        req.success = () => {
          notify({type: 'positive', message: `已将${user.nickname}加为好友`});
        };
        api.perform(req);
    };

    const onDeleteFriendClick = (user: SearchUserInfo) => {
      let req = new DeleteFriendRequest(user);
      req.success = () => {
        notify({type: 'positive', message: `已删除好友${user.nickname}`});
        users.value = users.value.filter(u => u.id != user.id);
      }
      api.perform(req);
    };

    return {
      isOpen,
      toggle,
      hide,

      activeTab,
      users,
      onlineCount,
      isLoggedIn,
      isMe: (user: SearchUserInfo) => user.id == api.localUser.id,
      onChatClick,
      onSpectateClick,
      onAddFriendClick,
      onDeleteFriendClick
    };
  }
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
  }
}
</style>
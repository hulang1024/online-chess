<template>
  <q-menu
    v-if="isLoggedIn"
    content-class="bg-primary text-white z-top"
    touch-position
    v-bind="$attrs"
  >
    <q-list>
      <q-item
        key="details"
        v-close-popup
        clickable
        @click="onUserDetailsClick()"
      >
        <q-item-section>查看详情</q-item-section>
      </q-item>
      <template v-if="!isMe()">
        <q-separator />
        <q-item
          key="chat"
          v-close-popup
          clickable
          @click="onChatClick()"
        >
          <q-item-section>聊天</q-item-section>
        </q-item>
        <q-separator />
        <q-item
          key="spectate"
          v-close-popup
          clickable
          @click="onSpectateClick()"
        >
          <q-item-section>观战</q-item-section>
        </q-item>
        <q-separator />
        <q-item
          key="invite-play"
          v-close-popup
          clickable
          @click="onInviteClick(1)"
        >
          <q-item-section>邀请加入游戏</q-item-section>
        </q-item>
        <q-item
          key="invite-spectate"
          v-close-popup
          clickable
          @click="onInviteClick(2)"
        >
          <q-item-section>邀请观战游戏</q-item-section>
        </q-item>
        <template v-if="user.isFriend">
          <q-separator />
          <q-item
            key="deleteFriend"
            v-close-popup
            clickable
            @click="onDeleteFriendClick()"
          >
            <q-item-section>删除好友</q-item-section>
          </q-item>
        </template>
      </template>
    </q-list>
  </q-menu>
</template>

<script lang="ts">
import {
  defineComponent, getCurrentInstance, PropType, ref,
} from "@vue/composition-api";
import DeleteFriendRequest from 'src/online/friend/DeleteFriendRequest';
import SpectateUserRequest from 'src/online/spectator/SpectateUserRequest';
import SpectateResponse from 'src/online/spectator/APISpectateResponse';
import InviteRequest from 'src/online/invitation/InviteRequest';
import SearchUserInfo from "src/online/user/SearchUserInfo";
import { api, channelManager } from "src/boot/main";

export default defineComponent({
  inheritAttrs: false,
  props: {
    user: Object as PropType<SearchUserInfo>,
  },
  inject: ['showUserDetails', 'excludeToggle'],
  setup(props) {
    const context = getCurrentInstance() as Vue;
    const { $router, $q } = context;
    const user = props.user as SearchUserInfo;

    const isLoggedIn = ref<boolean>(api.isLoggedIn); // todo:全局加入响应式
    api.state.changed.add(() => {
      isLoggedIn.value = api.isLoggedIn;
    });

    const onUserDetailsClick = () => {
      // eslint-disable-next-line
      (context as any).showUserDetails(user);
    };

    const onChatClick = () => {
      // eslint-disable-next-line
      (context as any).excludeToggle('chat', true);
      channelManager.openPrivateChannel(user);
    };

    const onSpectateClick = () => {
      const req = new SpectateUserRequest(user);
      $q.loading.show();
      req.success = async (spectateResponse: SpectateResponse) => {
        if (spectateResponse.isFollowedOtherSpectator) {
          $q.loading.show({ message: `正在跟随${user.nickname}观战` });
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
          4: '不满足观战条件',
          5: '你在游戏中不能观战其它游戏',
        };
        $q.notify({
          type: 'warning',
          message: codeMsgMap[res.code] || '原因未知',
        });
      };
      api.perform(req);
    };

    const onInviteClick = (subject: number) => {
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
          4: '请先加入或观战游戏',
        };
        $q.notify({
          type: 'warning',
          message: codeMsgMap[res.code],
        });
      };
      api.perform(req);
    };

    const onDeleteFriendClick = () => {
      const req = new DeleteFriendRequest(user);
      req.success = () => {
        user.isFriend = false;
        user.isMutual = false;
        $q.notify({ type: 'positive', message: `已删除好友${user.nickname}` });
      };
      api.perform(req);
    };

    return {
      isLoggedIn,
      isMe: () => user.id == api.localUser.id,

      onUserDetailsClick,
      onChatClick,
      onSpectateClick,
      onInviteClick,
      onDeleteFriendClick,
    };
  },
});
</script>

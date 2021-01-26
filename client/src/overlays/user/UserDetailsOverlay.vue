<template>
  <q-dialog
    v-model="isOpen"
    transition-show="slide-up"
    transition-hide="slide-down"
    flat
    content-class="user-details-overlay z-top"
  >
    <q-card
      flat
      class="q-px-md q-py-md full-width"
      style="max-width: 340px;"
    >
      <div v-if="user">
        <div class="column items-center">
          <user-avatar
            :user="user"
            :size="$q.screen.xs ? '80px' : '100px'"
            class="shadow-5"
          />
          <div class="nickname text-h5">{{ user.nickname }}</div>
        </div>
        <div
          v-if="user.id > 0 && user.userStats"
          class="column items-center q-mt-sm"
        >
          <q-separator />
          <div class="text-h6">表现</div>
          <div class="count-row">
            <label>胜率</label>
            <div class="count">{{ user.userStats.winRate.toFixed(2) }}%</div>
          </div>
          <div class="count-row">
            <label>局数</label>
            <div class="count">{{ user.userStats.playCount }}</div>
          </div>
          <div class="count-row">
            <label>胜</label>
            <div class="count">{{ user.userStats.winCount }}</div>
          </div>
          <div class="count-row">
            <label>负</label>
            <div class="count">{{ user.userStats.loseCount }}</div>
          </div>
          <div class="count-row">
            <label>和</label>
            <div class="count">{{ user.userStats.drawCount }}</div>
          </div>
        </div>
        <q-separator class="q-my-sm" />
        <div class="other-info">
          <div v-if="user.loginDeviceOS">
            <label>登录设备: </label>
            <span>{{ translateDeviceOS(user.loginDeviceOS) }}</span>
          </div>
          <div>
            <label>最后活动时间: </label>
            <span>{{ lastActiveTimeDesc }}</span>
          </div>
          <div v-if="user.id > 0">
            <label>用户注册时间: </label>
            <span>{{ user.registerTime }}</span>
          </div>
          <div>
            <label>用户ID: </label>
            <span>{{ user.id }}</span>
          </div>
          <div v-if="localUser.isAdmin">
            <label>用户IP: </label>
            <span>{{ user.userIp }}</span>
          </div>
        </div>
        <template v-if="localUser.id != user.id">
          <q-separator class="q-my-sm" />
          <div class="row justify-evenly q-mt-md">
            <u-button
              dense
              outline
              icon="message"
              class="q-px-sm"
              @click="onChatClick"
              label="发送私信"
            />
            <u-button
              v-if="user.id > 0 && !user.isFriend"
              dense
              outline
              icon="favorite"
              class="q-ml-sm q-px-sm"
              label="加为好友"
              @click="onAddFriendClick"
            />
          </div>
        </template>
      </div>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import {
  computed, defineComponent, getCurrentInstance, ref,
} from '@vue/composition-api';
import { api, channelManager } from 'src/boot/main';
import GetUserRequest from 'src/online/user/GetUserRequest';
import SearchUserInfo from 'src/online/user/SearchUserInfo';
import User from 'src/user/User';
import { translateDeviceOS } from "src/user/device.ts";
import UserAvatar from 'src/user/components/UserAvatar.vue';
import AddFriendRequest from 'src/online/friend/AddFriendRequest';

export default defineComponent({
  components: { UserAvatar },
  setup() {
    const context = getCurrentInstance() as Vue;
    const { $q } = context;
    const _user = ref<SearchUserInfo>();
    const isOpen = ref(false);

    const lastActiveTimeDesc = computed(() => {
      const u = _user.value as User;
      const dateObj = new Date(u.lastActiveTime || u.lastLoginTime);
      const durationS = (new Date().getTime() - dateObj.getTime()) / 1000;
      const agoM = Math.floor(durationS / 60);
      const agoS = Math.ceil(durationS % 60);
      if (agoM > 10) {
        return u.lastActiveTime || u.lastLoginTime;
      }
      if (agoM > 0) {
        return `${agoM}分${agoS}秒前`;
      }
      return agoS > 1 ? `${agoS}秒前` : '刚才';
    });

    const hide = () => {
      isOpen.value = false;
    };

    const show = (user: SearchUserInfo) => {
      _user.value = user;

      const req = new GetUserRequest(user.id);
      req.success = (resUser) => {
        _user.value = resUser;
      };
      api.queue(req);

      isOpen.value = true;
    };

    const onChatClick = () => {
      hide();
      // eslint-disable-next-line
      (context.$vnode.context?.$refs.toolbar as any).excludeToggle('chat', true);
      channelManager.openPrivateChannel(_user.value as User);
    };

    const onAddFriendClick = () => {
      if (api.localUser.id < 0) {
        $q.notify({ type: 'warning', message: '你现在是游客，无法添加其他人为好友' });
        return;
      }
      const user = _user.value as SearchUserInfo;
      const req = new AddFriendRequest(user);
      req.success = (ret) => {
        user.isFriend = true;
        user.isMutual = ret.isMutual;
        $q.notify({ type: 'positive', message: `已将${user.nickname}加为好友` });
      };
      api.perform(req);
    };

    return {
      show,
      hide,
      isOpen,

      localUser: api.localUser,
      user: _user,

      lastActiveTimeDesc,

      translateDeviceOS,

      onChatClick,
      onAddFriendClick,
    };
  },
});
</script>

<style lang="sass" scoped>
.nickname
  padding-top: 8px

.other-info
  label
    display: inline-block
    width: 100px

.count-row
  display: flex
  label
    display: inline-block
    width: 40px
    text-align: left
  .count
    width: 50px
    font-weight: bold
    text-align: right
</style>

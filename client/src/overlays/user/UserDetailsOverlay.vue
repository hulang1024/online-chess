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
      <q-card-section v-if="$q.screen.xs" class="absolute-top-right q-pb-none">
        <q-btn icon="close" class="text-grey-6" flat round dense v-close-popup />
      </q-card-section>
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
          v-if="user.id > 0"
          class="column items-center q-mt-sm"
        >
          <q-separator />
          <div class="text-h6">表现</div>
          <q-tabs
            v-model="gameTypeActiveTab"
            align="center"
            dense
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
          <div
            v-if="userStats"
            class="stat-rows"
          >
            <div class="count-row">
              <label>胜率</label>
              <div class="count">{{ userStats.winRate ? userStats.winRate.toFixed(2) : 0 }}%</div>
            </div>
            <div class="count-row">
              <label>局数</label>
              <div class="count">{{ userStats.playCount }}</div>
            </div>
            <div class="count-row">
              <label>胜</label>
              <div class="count">{{ userStats.winCount }}</div>
            </div>
            <div class="count-row">
              <label>负</label>
              <div class="count">{{ userStats.loseCount }}</div>
            </div>
            <div class="count-row">
              <label>和</label>
              <div class="count">{{ userStats.drawCount }}</div>
            </div>
          </div>
          <div
            v-else
            class="stat-rows justify-center"
          >无记录</div>
        </div>
        <q-separator class="q-my-sm" />
        <div class="other-info">
          <div v-if="user.deviceInfo">
            <label>登录设备: </label>
            <span>{{ translateDeviceOS(user.deviceInfo.deviceOS) }}</span>
          </div>
          <div>
            <label>最后活动时间: </label>
            <span>{{ lastActiveTimeDesc }}</span>
          </div>
          <div>
            <label>最后登录时间: </label>
            <span>{{ user.lastLoginTime }}</span>
          </div>
          <div v-if="user.id > 0">
            <label>用户注册时间: </label>
            <span>{{ user.registerTime }}</span>
          </div>
          <div>
            <label>用户ID: </label>
            <span>{{ user.id }}</span>
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
  computed, defineComponent, getCurrentInstance, ref, watch,
} from 'vue';
import { api, channelManager } from 'src/boot/main';
import GetUserRequest from 'src/online/user/GetUserRequest';
import UserDetails from 'src/online/user/UserDetails';
import User from 'src/user/User';
import { translateDeviceOS } from "src/user/device";
import UserAvatar from 'src/user/components/UserAvatar.vue';
import AddFriendRequest from 'src/online/friend/AddFriendRequest';
import UserStats from 'src/user/UserStats';

export default defineComponent({
  components: { UserAvatar },
  setup() {
    const context = getCurrentInstance()!.proxy as unknown as Vue;
    const { $q } = context;
    const _user = ref<UserDetails>();
    const userStats = ref<UserStats | null>(null);
    const gameTypeActiveTab = ref(0);
    const isOpen = ref(false);

    watch([gameTypeActiveTab, _user], () => {
      userStats.value = _user?.value?.scoreStats
        ?.find((item) => item.gameType == gameTypeActiveTab.value) as UserStats;
    });

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

    const show = (user: UserDetails) => {
      _user.value = user;

      const req = new GetUserRequest(user.id);
      req.success = (resUser) => {
        _user.value = resUser;

        let playGameType: number | undefined;
        if (api.localUser.playGameType) {
          playGameType = resUser.scoreStats
            .find((item) => item.gameType == api.localUser.playGameType)?.gameType;
        }
        if (!playGameType) {
          playGameType = resUser.scoreStats
            .find((item) => item.gameType == resUser.playGameType)?.gameType;
        }
        if (!playGameType) {
          playGameType = resUser.scoreStats.length ? resUser.scoreStats[0].gameType : 2;
        }
        gameTypeActiveTab.value = playGameType;
      };
      req.failure = () => {
        _user.value = { ..._user.value as UserDetails, lastActiveTime: '' };
        gameTypeActiveTab.value = 2;
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
      const user = _user.value as UserDetails;
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
      gameTypeActiveTab,
      isOpen,

      localUser: api.localUser,
      user: _user,
      userStats,

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

.stat-rows
  margin-top: 8px
  display: flex
  flex-direction: column
  min-height: 105px

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
      font-family: Monaco,"Lucida Console",monospace
</style>

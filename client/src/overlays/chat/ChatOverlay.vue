<template>
  <q-dialog
    v-model="isOpen"
    position="bottom"
    full-width
    maximized
    :seamless="seamless"
    class="z-top"
    content-class="chat-overlay"
  >
    <q-card flat>
      <q-tabs
        v-model="activeChannelTab"
        align="left"
        dense
        inline-label
        :breakpoint="0"
        indicator-color="transparent"
        class="col"
      >
        <q-tab
          v-for="(channel, index) in channels"
          :key="channel.name"
          :name="getChannelTabName(channel)"
          no-caps
          :class="[$q.platform.is.mobile && 'mobile']"
        >
          <user-avatar
            v-if="channel.type == 3"
            :user="channel.users[0]"
            size="24px"
          />
          <span class="nickname q-pl-xs">{{ channel.name }}</span>
          <q-icon
            v-if="channel.id != 1 && channel.type != 2"
            name="close"
            class="close-tab-btn q-pl-sm"
            :class="$q.platform.is.mobile && 'mobile'"
            @click.stop="onCloseClick(channel)"
          />
          <q-badge
            v-show="channelUnreadCounts[index] > 0"
            color="red"
            floating
            align="top"
          >{{ channelUnreadCounts[index] }}</q-badge>
        </q-tab>
      </q-tabs>

      <q-tab-panels
        v-model="activeChannelTab"
        animated
      >
        <q-tab-panel
          v-for="channel in channels"
          :key="channel.name"
          :name="getChannelTabName(channel)"
        >
          <drawable-channel :channel="channel" />
        </q-tab-panel>
      </q-tab-panels>
      <chat-input-box ref="chatInput" />
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import device from "current-device";
import {
  defineComponent, getCurrentInstance, provide, ref, watch,
} from '@vue/composition-api';
import { existsEmoji } from 'src/assets/emoji';
import { api, channelManager } from 'src/boot/main';
import Channel from 'src/online/chat/Channel';
import ChannelType from 'src/online/chat/ChannelType';
import InfoMessage from 'src/online/chat/InfoMessage';
import Message from 'src/online/chat/Message';
import desktopNotify from "src/components/notify";
import UserAvatar from "src/user/components/UserAvatar.vue";
import User, { isSystemUser } from 'src/user/User';
import ChatInputBox from './ChatInputBox.vue';
import DrawableChannel from './DrawableChannel.vue';

export default defineComponent({
  components: { DrawableChannel, ChatInputBox, UserAvatar },
  setup(props, { emit }) {
    const ctx = getCurrentInstance() as Vue;
    const isOpen = ref(false);
    const activeChannelTab = ref('#世界');
    const channels = ref<Channel[]>([]);
    const channelUnreadCounts = ref<number[]>([]);
    const seamless = ref(true);

    const getChannelTabName = (channel: Channel) => (
      channel.type == ChannelType.PM
        ? `pm_${channel.users[0].id}`
        : channel.id.toString());

    const updateUnreadCounts = () => {
      const currentChannel = channelManager.currentChannel.value;
      channelManager.markChannelAsRead(currentChannel);
      channels.value.forEach((ch, index) => {
        ctx.$set(channelUnreadCounts.value, index, ch.countUnreadMessage());
      });
    };

    watch(isOpen, () => {
      emit('active', isOpen.value, props);
    });

    watch(activeChannelTab, () => {
      if (activeChannelTab.value.startsWith('pm_')) {
        channelManager.openPrivateChannel(new User(+activeChannelTab.value.substring(3)));
      } else {
        channelManager.openChannel(+activeChannelTab.value);
      }

      if (isOpen.value) {
        updateUnreadCounts();
        // eslint-disable-next-line
        if (!device.mobile()) {
          ctx.$nextTick(() => {
            // eslint-disable-next-line
            (ctx.$refs as any).chatInput.focus();
          });
        }
      }
    });

    provide('chatAtUser', (user: User) => {
      // eslint-disable-next-line
      (ctx.$refs as any).chatInput.atUser(user);
    });

    const atReg = new RegExp('@(.+)');

    channelManager.joinedChannels.added.add((channel: Channel) => {
      channels.value.push(channel);
      channel.newMessagesArrived.add((messages: Message[]) => {
        if (isOpen.value && (messages.length > 1 || messages[0].id)) {
          updateUnreadCounts();
        }

        const last = messages[messages.length - 1];

        // 系统用户发送的消息
        if (isSystemUser(last.sender)) {
          return;
        }

        const matched = atReg.exec(last.content);
        if ((matched && matched.length > 1)
          && matched[1].startsWith(api.localUser.nickname)
          && (new Date().getTime() - last.timestamp) < 5000) {
          const notifyText = `用户[${last.sender.nickname}]在频道[${channel.name}]@了你`;
          // eslint-disable-next-line
          desktopNotify(notifyText);
          ctx.$q.notify(notifyText);
        }

        // 解决当弹出窗口之后，当棋盘已有选中棋子点击棋盘误触移动的问题
        const isSpectating = ctx.$router.currentRoute.name as string == 'spectate';
        const isPlaying = ctx.$router.currentRoute.name as string == 'play';
        if (isPlaying || isSpectating) {
          // 使用遮罩
          seamless.value = false;
        }

        if (channel.type == ChannelType.PM) {
          // todo: 暂时不支持回显，而是绕一圈，这里判断不是自己
          if (last.sender.id != api.localUser.id) {
            if (isPlaying && !isOpen.value) {
              ctx.$q.notify('你有一条私信');
            } else if (isSpectating && !isOpen.value) {
              isOpen.value = true;
              channelManager.openPrivateChannel(last.sender);
            }
          }
        }
      });

      channel.pendingMessageResolved.add((echo: Message, final: Message) => {
        updateUnreadCounts();
        if (channel.type == ChannelType.ROOM
          // eslint-disable-next-line
          && ctx.$q.platform.is.mobile
          && ctx.$router.currentRoute.name == 'play'
          && (final.content.length <= 4 && existsEmoji(final.content))
          && (new Date().getTime() - final.timestamp) < 5000) {
          isOpen.value = false;
        }
      });

      if (channel.type == ChannelType.PM) {
        ctx.$nextTick(() => {
          // eslint-disable-next-line
          (ctx.$refs as any).chatInput.focus();
        });
      }
    });

    channelManager.joinedChannels.removed.add((channel: Channel) => {
      channels.value = channels.value.filter((ch: Channel) => ch.id != channel.id);
    });

    channelManager.currentChannel.changed.add((channel: Channel) => {
      ctx.$nextTick(() => {
        activeChannelTab.value = getChannelTabName(channel);
      });
    });

    channelManager.initializeChannels();
    channelManager.openChannel(1);
    channelManager.addInfoMessage(1, new InfoMessage('🎉欢迎。棋友QQ群:89536775'));

    const onCloseClick = (channel: Channel) => {
      channelManager.leaveChannel(channel.id);
      channel = channelManager.joinedChannels.value[
        channelManager.joinedChannels.value.length - 1];
      channelManager.openChannel(channel.id);
    };

    const toggle = () => {
      if (!isOpen.value) {
        seamless.value = !['play', 'spectate'].includes(ctx.$router.currentRoute.name as string);
      }
      isOpen.value = !isOpen.value;
    };

    const show = () => {
      updateUnreadCounts();
      seamless.value = !['play', 'spectate'].includes(ctx.$router.currentRoute.name as string);
      isOpen.value = true;
    };

    const hide = () => {
      isOpen.value = false;
    };

    return {
      isOpen,
      toggle,
      onCloseClick,
      show,
      hide,
      channelUnreadCounts,
      activeChannelTab,
      getChannelTabName,
      channels,
      seamless,
    };
  },
});
</script>

<style lang="scss" scoped>
.chat-overlay {
  & .q-card {
    display: flex;
    flex-direction: column;
    height: 284px;
    background: transparent;

    .q-tabs {
      background-color: rgba(0, 0, 0, 0.4);

      .q-tab {
        justify-content: flex-start;
        min-width: 140px;
        padding-left: 4px;
        padding-right: 8px;
        color: #f6f6f6;
        background: $grey-14;
        transition: all 0.1s ease-out;
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.4);
        border-bottom: 1px solid black;
        transform: skew(-4deg);
        border-radius: 2px;

        &.mobile {
          min-width: 98px;
        }

        .nickname {
          flex-grow: 1;
          text-align: left;
        }

        .close-tab-btn {
          opacity: 0;

          &:hover {
            color: $pink;
          }
        }

        &.q-tab--active {
          color: #000;
          background: #fff;
          font-weight: bold;

          .close-tab-btn {
            opacity: 1;
          }
        }
      }
    }

    .q-tab-panels {
      height: 200px;
      background: #fff;
      .q-tab-panel {
        padding: 4px 4px;
      }
    }
  }

  .chat-input-box {
    flex-grow: 1;
    background: #fff;
  }

  & .q-card.q-dark {
    .q-tab-panels,
    .chat-input-box {
      background: #191919;
    }

    .q-tabs {
      .q-tab {
        background: $grey-10;

        &.q-tab--active {
          color: #fff;
          background: #191919;
        }
      }
    }
  }
}
</style>
<style scoped>
.chat-input-box >>> .message-input {
  float: right;
  margin-right: 8px;
  margin-bottom: 8px;
  width: calc(100% - 131px);/*减宽度等于标签宽度 */
  font-size: 15px;
}

.mobile .chat-input-box >>> .message-input {
  float: left;
  margin-left: 8px;
  width: calc(100% - 16px);
}

.q-tabs >>> .q-tabs__content {
  padding-left: 3px;
}

.q-tab >>> .q-tab__content {
  display: flex;
  justify-content: flex-start;
  width: 100%;
  transform: skew(4deg);
}
</style>

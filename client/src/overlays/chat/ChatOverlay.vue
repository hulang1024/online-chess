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
        indicator-color="primary"
        class="col"
      >
        <q-tab
          v-for="channel in channels"
          :key="channel.name"
          :name="getChannelTabName(channel)"
          :label="channel.name"
          no-caps
        />
      </q-tabs>

      <q-tab-panels
        v-model="activeChannelTab"
        keep-alive
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
      <chat-input-box />
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import {
  defineComponent, getCurrentInstance, ref, watch,
} from '@vue/composition-api';
import { api, channelManager } from 'src/boot/main';
import Channel from 'src/online/chat/Channel';
import ChannelType from 'src/online/chat/ChannelType';
import InfoMessage from 'src/online/chat/InfoMessage';
import Message from 'src/online/chat/Message';
import User, { isSystemUser } from 'src/user/User';
import ChatInputBox from './ChatInputBox.vue';
import DrawableChannel from './DrawableChannel.vue';

export default defineComponent({
  components: { DrawableChannel, ChatInputBox },
  setup(props, { emit }) {
    const ctx = getCurrentInstance() as Vue;
    const isOpen = ref(false);
    const activeChannelTab = ref('#世界');
    const channels = ref<Channel[]>([]);
    const seamless = ref(true);

    const getChannelTabName = (channel: Channel) => (
      channel.type == ChannelType.PM
        ? `pm_${channel.users[0].id}`
        : channel.id.toString());

    watch(isOpen, () => {
      emit('active', isOpen.value, props);
    });

    watch(activeChannelTab, () => {
      if (activeChannelTab.value.startsWith('pm_')) {
        channelManager.openPrivateChannel(new User(+activeChannelTab.value.substring(3)));
      } else {
        channelManager.openChannel(+activeChannelTab.value);
      }
    });

    channelManager.joinedChannels.added.add((channel: Channel) => {
      channels.value.push(channel);
      channel.newMessagesArrived.add((messages: Message[]) => {
        const last = messages[messages.length - 1];
        // 系统用户发送的消息
        if (isSystemUser(last.sender)) {
          return;
        }

        // 解决当弹出窗口之后，当棋盘已有选中棋子点击棋盘误触移动的问题
        const isPlayActicity = ['play', 'spectate'].includes(
          ctx.$router.currentRoute.name as string,
        );
        if (isPlayActicity) {
          // 使用遮罩
          seamless.value = false;
        }

        if (channel.type == ChannelType.PM) {
          // todo: 暂时不支持回显，而是绕一圈，这里判断不是自己
          if (last.sender.id != api.localUser.id) {
            isOpen.value = !isPlayActicity;
            channelManager.openPrivateChannel(last.sender);
          }
        }
      });
    });

    channelManager.joinedChannels.removed.add((channel: Channel) => {
      channels.value = channels.value.filter((ch: Channel) => ch.id != channel.id);
    });

    channelManager.currentChannel.changed.add((channel: Channel) => {
      if (channel.type == ChannelType.PM && !isOpen.value) {
        isOpen.value = true;
      }
      ctx.$nextTick(() => {
        activeChannelTab.value = getChannelTabName(channel);
      });
    });

    channelManager.onHideChannel = (channel: Channel) => {
      channels.value = channels.value.filter((ch: Channel) => ch.id != channel.id);
      channelManager.openChannel(1);
    };

    channelManager.initializeChannels();
    channelManager.openChannel(1);
    channelManager.addInfoMessage(1, new InfoMessage('欢迎'));

    const toggle = () => {
      if (!isOpen.value) {
        seamless.value = !['play', 'spectate'].includes(ctx.$router.currentRoute.name as string);
      }
      isOpen.value = !isOpen.value;
    };

    const show = () => {
      seamless.value = !['play', 'spectate'].includes(ctx.$router.currentRoute.name as string);
      isOpen.value = true;

      channelManager.markChannelAsRead(channelManager.currentChannel.value);
    };

    const hide = () => {
      isOpen.value = false;
    };

    return {
      isOpen,
      toggle,
      show,
      hide,
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
    height: 284px;
    background-color: #fff;

    & .q-tab-panels {
      height: 200px;
      background: transparent;
      .q-tab-panel {
        padding: 4px 4px;
      }
    }
  }
  & .q-card.q-dark {
    background-color: #191919;
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
</style>

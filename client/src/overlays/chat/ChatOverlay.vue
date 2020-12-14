<template>
  <q-dialog
    v-model="isOpen"
    position="bottom"
    full-width
    maximized
    seamless
    class="z-top"
    content-class="chat-overlay"
  >
    <q-card>
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
        animated
        class="q-pb-xs"
      >
        <q-tab-panel
          v-for="channel in channels"
          :key="channel.name"
          :name="getChannelTabName(channel)"
        >
          <drawable-channel :channel="channel" />
        </q-tab-panel>
      </q-tab-panels>

      <div class="full-width">
        <q-input
          v-model="messageText"
          standout
          dense
          shadow-text
          :dark="$q.dark.isActive"
          placeholder="键入你的消息"
          class="message-input"
          @keydown.enter="onSend"
        />
        <q-btn
          class="btn-send"
          color="primary"
          rounded
          padding="sm"
          label="发送"
          @click="onSend"
        />
      </div>
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
import User from 'src/online/user/User';
import DrawableChannel from './DrawableChannel.vue';

export default defineComponent({
  components: { DrawableChannel },
  setup(props, { emit }) {
    const ctx = getCurrentInstance() as Vue;
    // eslint-disable-next-line
    const notify = ctx.$q.notify;

    const isOpen = ref(false);
    const activeChannelTab = ref('#象棋');
    const channels = ref<Channel[]>([]);
    const messageText = ref('');

    const getChannelTabName = (channel: Channel) => {
      return channel.type == ChannelType.PM
        ? `pm_${channel.users[0].id}`
        : channel.id + '';
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
    });

    channelManager.joinedChannels.added.add((channel: Channel) => {
      channels.value.push(channel);
      if (channel.id == 1) {
        channel.addNewMessages(new InfoMessage('欢迎来到在线象棋'));
      }
      channel.newMessagesArrived.add((messages: Message[]) => {
        const last = messages[messages.length - 1];
        if (last.sender.id > 0) {
          if (channel.type == ChannelType.PM) {
            // todo: 暂时不支持回显，而是绕一圈，这里判断不是自己
            if (last.sender != api.localUser.id) {
              isOpen.value = true;
              channelManager.openPrivateChannel(last.sender);
            }
          } else if (channel.type == ChannelType.ROOM) {
            isOpen.value = true;
            channelManager.openChannel(channel.id);
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
        setTimeout(() => {
          activeChannelTab.value = getChannelTabName(channel);
        }, 100);
      });
    });

    channelManager.onHideChannel = (channel: Channel) => {
      channels.value = channels.value.filter((ch: Channel) => ch.id != channel.id);
      channelManager.openChannel(1);
    };

    channelManager.initializeChannels();
    channelManager.openChannel(1);

    const toggle = () => {
      isOpen.value = !isOpen.value;
    };

    const show = () => {
      isOpen.value = true;
    };

    const hide = () => {
      isOpen.value = false;
    };

    const onSend = () => {
      const text = messageText.value.trim();
      if (!text) {
        return;
      }
      if (text.length > 100) {
        notify({ type: 'warning', message: '消息过长' });
        return;
      }

      if (text[0] == '/' && text.length > 1) {
        channelManager.postCommand(text);
      } else {
        channelManager.postMessage(text);
      }

      messageText.value = '';

      // todo: 记录输入历史，通过上下键查看
    };

    return {
      isOpen,
      toggle,
      show,
      hide,
      activeChannelTab,
      getChannelTabName,
      channels,
      messageText,
      onSend,
    };
  },
});
</script>

<style lang="scss" scoped>
.chat-overlay {
  & .q-card {
    background: rgba(40,40,40,0.8);

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

  .message-input {
    float: right;
    margin-right: 8px;
    margin-bottom: 8px;
    width: calc(100% - 180px);/*减宽度等于标签宽度 */
    font-size: 15px;

    input {/*todo */
      caret-color: orange;
    }
  }
  .btn-send {
    display: none;
  }

  @media (max-width: $breakpoint-xs-max) {
    .message-input {
      float: left;
      margin-left: 8px;
      width: calc(100% - 16px - 60px - 8px);
    }

    .btn-send {
      margin-right: 8px;
      display: block;
      width: 60px;
    }
  }
}
</style>

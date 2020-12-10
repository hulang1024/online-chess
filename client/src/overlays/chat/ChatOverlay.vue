<template>
  <q-dialog
    v-model="isOpen"
    position="bottom"
    full-width
    maximized
    seamless
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
          :key="channel.id"
          :name="channel.id"
          :label="channel.name"
        />
      </q-tabs>

      <q-tab-panels v-model="activeChannelTab" animated class="q-pb-xs">
        <q-tab-panel
          v-for="channel in channels"
          :key="channel.id"
          :name="channel.id"
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
          bg-color="black"
          standout="black text-white"
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
import { defineComponent, getCurrentInstance, reactive, ref, watch } from '@vue/composition-api'
import Channel from 'src/online/chat/Channel';
import ChannelManager from 'src/online/chat/ChannelManager';
import ChannelType from 'src/online/chat/ChannelType';
import InfoMessage from 'src/online/chat/InfoMessage';
import Message from 'src/online/chat/Message';
import DrawableChannel from './DrawableChannel.vue';

export default defineComponent({
  components: { DrawableChannel },
  setup() {
    const ctx = getCurrentInstance();
    const notify = (<any>ctx).$q.notify;
    const channelManager: ChannelManager = (<any>ctx).channelManager;

    const isOpen = ref(false);
    const activeChannelTab = ref(1);
    const channels = ref<Channel[]>([]);
    const messageText = ref('');

    channelManager.joinedChannels.added.add((channel: Channel) => {
      channels.value.push(channel);
      if (channel.id == 1) {
        channel.addNewMessages(new InfoMessage('欢迎来到在线象棋'));
      }
      channel.newMessagesArrived.add((messages: Message[]) => {
        let last = messages[messages.length - 1];
        if (last.sender.id > 0) {
          if (channel.type == ChannelType.PM) {
            isOpen.value = true;
            channelManager.openPrivateChannel(last.sender);
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
      setTimeout(() => {
        activeChannelTab.value = channel.id;
        if (channel.type == ChannelType.PM && !isOpen.value) {
          isOpen.value = true;
        }
      }, 100);
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

    const hide = () => { 
      isOpen.value = false;
    };

    const onSend = () => {
      let text = messageText.value.trim();
      if (!text) {
        return;
      }
      if (text.length > 100) {
        notify({type: 'warning', message: '消息过长'});
        return false;
      }
      
      if (text[0] == '/' && text.length > 1) {
        channelManager.postCommand(text);
      } else {
        channelManager.postMessage(text);
      }

      messageText.value = '';

      //todo: 记录输入历史，通过上下键查看
    };

    return {
      isOpen,
      toggle,
      hide,
      activeChannelTab,
      channels,
      messageText,
      onSend
    };
  }
});
</script>

<style lang="scss" scoped>
.chat-overlay {
  & .q-card {
    background: rgba(40,40,40,0.8);
    box-shadow: 0 -1px 1px rgba(0,0,0,0.2),
      0 -1px 1px rgba(0,0,0,0.14),
      0 -2px 1px -1px rgba(0,0,0,0.12);
    
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
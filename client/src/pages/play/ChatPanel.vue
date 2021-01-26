<template>
  <q-card
    flat
    class="chat-panel q-px-sm q-py-sm"
  >
    <div class="text-subtitle1">聊天</div>
    <drawable-channel
      v-if="channel"
      :channel="channel"
      :loading="loading"
      :chat-line-props="{
        rightAlign: false,
        small: true
      }"
      :style="{height: `${channelHeight}px`}"
    />
    <div class="full-width">
      <q-input
        v-model="messageText"
        :outlined="!$q.dark.isActive"
        :standout="$q.dark.isActive"
        dense
        placeholder="键入你的消息"
        :disable="!inputEnabled"
        class="message-input q-mt-sm"
        @keydown.enter="onSend"
      />
    </div>
  </q-card>
</template>

<script lang="ts">
import {
  defineComponent, getCurrentInstance, onMounted, ref,
} from '@vue/composition-api'
import { channelManager } from 'src/boot/main';
import Channel from 'src/online/chat/Channel';
import * as ChatEvents from 'src/online/ws/events/chat';
import DrawableChannel from 'src/overlays/chat/DrawableChannel.vue';

export default defineComponent({
  components: { DrawableChannel },
  setup() {
    const context = getCurrentInstance() as Vue;
    // eslint-disable-next-line
    const notify = context.$q.notify;
    const messageText = ref('');
    const inputEnabled = ref(true);
    const channel = ref<Channel | null>(null);
    const channelHeight = ref<number>(0);
    const loading = ref(true);

    onMounted(() => {
      channelHeight.value = context.$el.scrollHeight - 92;
    });

    ChatEvents.wordsEnabled.add((msg: ChatEvents.WordsEnableMsg) => {
      inputEnabled.value = msg.enabled;
    });

    const loadChannel = (ch: Channel) => {
      channel.value = ch;
      loading.value = false;
    };

    const onSend = () => {
      if (!channel.value) {
        return;
      }
      const text = messageText.value.trim();
      if (!text) {
        return;
      }
      if (text.length > 100) {
        notify({ type: 'warning', message: '消息过长' });
        return;
      }

      if (text[0] == '/' && text.length > 1) {
        channelManager.postCommand(text, channel.value as Channel);
      } else {
        channelManager.postMessage(text, false, channel.value as Channel);
      }

      messageText.value = '';
    };

    return {
      channel,
      loading,

      messageText,
      inputEnabled,
      channelHeight,

      loadChannel,

      onSend,
    };
  },
});
</script>

<template>
  <q-card
    flat
    class="chat-panel q-px-sm q-py-sm"
  >
    <div class="title text-subtitle1" >聊天</div>
    <drawable-channel
      v-if="channel"
      :channel="channel"
      :loading="channel.loading"
      :chat-line-props="{
        rightAlign: false,
        small: true
      }"
      :style="{height: `${channelHeight}px`}"
    />
    <div class="full-width">
      <q-input
        ref="messageInput"
        v-model="messageText"
        :outlined="!$q.dark.isActive"
        :standout="$q.dark.isActive"
        dense
        placeholder="键入你的消息"
        :disable="!inputEnabled"
        class="message-input q-mt-sm"
        @keydown.enter="onSend"
      >
        <template v-slot:append>
          <q-icon
            name="mood"
            class="cursor-pointer"
          >
            <q-popup-proxy
              ref="emojiPanelProxy"
              :offset="[11, 10]"
            >
              <emoji-panel @emoji-select="onEmojiSelect" />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>
  </q-card>
</template>

<script lang="ts">
import {
  defineComponent, getCurrentInstance, onMounted, ref,
} from '@vue/composition-api'
import { channelManager } from 'src/boot/main';
import Channel from 'src/online/chat/Channel';
import DrawableChannel from 'src/overlays/chat/DrawableChannel.vue';
import EmojiPanel from 'src/overlays/chat/EmojiPanel.vue';

export default defineComponent({
  components: { DrawableChannel, EmojiPanel },
  setup() {
    const context = getCurrentInstance() as Vue;
    // eslint-disable-next-line
    const notify = context.$q.notify;
    const messageText = ref('');
    const inputEnabled = ref(true);
    const channel = ref<Channel | null>(null);
    const channelHeight = ref<number>(0);

    onMounted(() => {
      channelHeight.value = context.$el.scrollHeight - 92;
    });

    channelManager.wordsEnableSignal.add((enabled: boolean) => {
      inputEnabled.value = enabled;
    });

    const loadChannel = (ch: Channel) => {
      ch.loading.value = false;
      channel.value = ch;
    };

    const onSend = () => {
      if (!channel.value) {
        return;
      }
      const text = messageText.value.trim();
      if (!text) {
        return;
      }
      if (text.length > 200) {
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

    const onEmojiSelect = (emoji: string) => {
      messageText.value += emoji;
      if (!context.$q.screen.xs) {
        context.$nextTick(() => {
          // eslint-disable-next-line
          (context.$refs.messageInput as any).focus();
        });
      }
      // eslint-disable-next-line
      (context.$refs.emojiPanelProxy as any).hide();
    };

    return {
      channel,

      messageText,
      inputEnabled,
      channelHeight,

      loadChannel,

      onEmojiSelect,
      onSend,
    };
  },
});
</script>

<style lang="sass" scoped>
.title
  user-select: none
</style>

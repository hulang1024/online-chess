<template>
  <q-card
    flat
    class="chat-panel q-px-sm q-py-sm"
  >
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
    <chat-input-box
      ref="chatInput"
      :channel="channel"
    />
  </q-card>
</template>

<script lang="ts">
import {
  defineComponent, getCurrentInstance, onMounted, provide, ref,
} from '@vue/composition-api'
import Channel from 'src/online/chat/Channel';
import ChatInputBox from 'src/overlays/chat/ChatInputBox.vue';
import DrawableChannel from 'src/overlays/chat/DrawableChannel.vue';
import User from 'src/user/User';

export default defineComponent({
  components: { DrawableChannel, ChatInputBox },
  setup() {
    const context = getCurrentInstance() as Vue;
    const channel = ref<Channel | null>(null);
    const channelHeight = ref<number>(0);

    onMounted(() => {
      channelHeight.value = context.$el.scrollHeight - 56;
    });

    provide('chatAtUser', (user: User) => {
      // eslint-disable-next-line
      (context.$refs as any).chatInput.atUser(user);
    });

    const loadChannel = (ch: Channel) => {
      ch.loading.value = false;
      channel.value = ch;
    };

    return {
      channel,
      channelHeight,
      loadChannel,
    };
  },
});
</script>

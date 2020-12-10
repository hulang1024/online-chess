<template>
  <q-scroll-area
    ref="scrollArea"
    visible
    :delay="200"
    :thumb-style="{
      right: '0px',
      borderRadius: '6px',
      backgroundColor: '#eee',
      width: '6px',
      opacity: 0.6
    }"
    style="height: 100%; width: 100%;"
  >
    <chat-line
      v-for="msg in messages"
      :key="msg.id"
      :message="msg"
    />
  </q-scroll-area>
</template>
<script lang="ts">
import { defineComponent, getCurrentInstance, PropType, ref } from '@vue/composition-api'
import Channel from 'src/online/chat/Channel';
import Message from 'src/online/chat/Message';
import ChatLine from './ChatLine.vue';
import { scroll } from 'quasar'

export default defineComponent({
  components: { ChatLine },
  props: {
    channel: {
      type: Object as PropType<Channel>,
      require: true
    }
  },
  setup(props) {
    const ctx = getCurrentInstance();
    const { channel } = props;
    const messages = ref<Message[] | undefined>(channel?.messages);

    const updateScroll = () => {
      ctx?.$nextTick(() => {
        let scrollArea = ctx?.$refs.scrollArea;
        let pos = scroll.getScrollHeight(scrollArea.$el.firstChild.firstChild);
        scrollArea.setScrollPosition(pos, 100);
      });
    };

    channel?.newMessagesArrived.add((newMsgs: Message[]) => {
      messages.value = messages.value?.concat(newMsgs);
      updateScroll();
    }, this);

    channel?.messageRemoved.add((msgId: number) => {
      messages.value = messages.value?.filter(m => m.id != msgId);
      updateScroll();
    }, this);

    updateScroll();

    return {
      messages
    };
  }
});
</script>
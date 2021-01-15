<template>
  <div class="row">
    <div class="time">
      {{ timeText }}
    </div>
    <div
      class="nickname ellipsis"
      :style="{color: nicknameColor}"
      @click="onNicknameClick"
    >
      {{ nickname }}
    </div>
    <div
      class="colon"
      :style="{color: nicknameColor}"
    >
      <span>:</span>
    </div>
    <div class="content">
      <span :style="{color}">{{ content }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, getCurrentInstance, PropType, ref,
} from "@vue/composition-api";
import ErrorMessage from "src/online/chat/ErrorMessage";
import Message from "src/online/chat/Message";
import { USERNAME_COLORS } from 'src/user/components/colors';

export default defineComponent({
  props: {
    message: {
      type: Object as PropType<Message>,
      require: true,
    },
  },
  inject: ['showUserDetails'],
  setup(props) {
    const context = getCurrentInstance() as Vue;
    const message = props.message as Message;
    const sender = message?.sender;

    const timeText = ((timestamp: number) => {
      const time = new Date(timestamp);
      const pad = (n: number) => (n > 9 ? n : `0${n}`);
      return `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;
    })(message?.timestamp);

    const nicknameColor = message.id > 0
      ? USERNAME_COLORS[Math.abs(sender.id) % USERNAME_COLORS.length]
      : '';

    const color = ref<string>('');
    if (message instanceof ErrorMessage) {
      color.value = 'pink';
    }

    const onNicknameClick = () => {
      if (sender.id == 0) {
        return;
      }
      // eslint-disable-next-line
      (context as any).showUserDetails(sender);
    };

    return {
      timeText,
      nickname: sender.nickname,
      nicknameColor: `#${(nicknameColor).toString(16)}`,
      content: message.content,
      color,

      onNicknameClick,
    };
  },
});
</script>

<style lang="scss" scoped>
.row > div {
  line-height: 20px;
  font-size: 1.1em;
}

@media (max-width: $breakpoint-xs-max) {
  .row > div {
    font-size: 1em;
  }
  .nickname {
    width: 94px !important;
  }
  .content {
    padding-left: 4px !important;
  }
}

.row > .time {
  width: 54px;
  font-size: 0.9em;
  user-select: none;
}

.row > .nickname {
  width: 110px;
  text-align: right;
  font-weight: 600;
  user-select: none;
}
.row > .nickname:hover {
  opacity: 0.6;
}

.row > .colon {
  font-weight: 600;
}

.row > .content {
  padding-left: 12px;
}
</style>

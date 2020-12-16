<template>
  <div class="row">
    <div class="time">
      {{ timeText }}
    </div>
    <div
      class="nickname ellipsis"
      :style="{color: nicknameColor}"
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
import { defineComponent, PropType, ref } from "@vue/composition-api";
import ErrorMessage from "src/online/chat/ErrorMessage";
import Message from "src/online/chat/Message";

const USERNAME_COLORS = [
  0x588c7e,
  0xb2a367,
  0xc98f65,
  0xbc5151,
  0x5c8bd6,
  0x7f6ab7,
  0xa368ad,
  0xaa6880,

  0x6fad9b,
  0xf2e394,
  0xf2ae72,
  0xf98f8a,
  0x7daef4,
  0xa691f2,
  0xc894d3,
  0xd895b0,

  0x53c4a1,
  0xeace5c,
  0xea8c47,
  0xfc4f4f,
  0x3d94ea,
  0x7760ea,
  0xaf52c6,
  0xe25696,

  0x677c66,
  0x9b8732,
  0x8c5129,
  0x8c3030,
  0x1f5d91,
  0x4335a5,
  0x812a96,
  0x992861,
];

export default defineComponent({
  props: {
    message: {
      type: Object as PropType<Message>,
      require: true,
    },
  },
  setup(props) {
    const message = props.message as Message;
    const sender = message?.sender;

    const timeText = ((timestamp: number) => {
      const time = new Date(timestamp);
      const pad = (n: number) => (n > 9 ? n : `0${n}`);
      return `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;
    })(message?.timestamp);

    const nicknameColor = message.id > 0
      ? USERNAME_COLORS[sender.id % USERNAME_COLORS.length]
      : 0xdddddd;

    const color = ref<string>('');
    if (message instanceof ErrorMessage) {
      color.value = 'pink';
    }

    return {
      timeText,
      nickname: sender.nickname,
      nicknameColor: `#${(nicknameColor).toString(16)}`,
      content: message.content,
      color,
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
    width: 90px !important;
  }
  .content {
    padding-left: 8px !important;
  }
}

.time {
  width: 54px;
  font-size: 0.9em !important;
  user-select: none;
}

.nickname {
  width: 110px;
  text-align: right;
  font-weight: 600;
}

.colon {
  font-weight: 600;
}

.content {
  padding-left: 12px;
}
</style>

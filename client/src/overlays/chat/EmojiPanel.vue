<template>
  <q-card class="emoji-panel">
    <q-scroll-area
      :thumb-style="{
        width: '6px',
        borderRadius: '2px',
      }"
    >
      <div class="emoji-grid">
        <div
          v-for="(emoji, i) in emojiArray"
          :key="i"
          class="emoji-cell"
          @click="onEmojiClick(emoji)"
        >
          <span>{{ emoji }}</span>
        </div>
      </div>
    </q-scroll-area>
  </q-card>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import emojiMap from 'src/assets/emoji';

export default defineComponent({
  setup(props, { emit }) {
    let emojiArray: string[] = [];

    Object.values(emojiMap).forEach((array) => {
      emojiArray = emojiArray.concat(array);
    });

    const onEmojiClick = (emoji: string) => {
      emit('emoji-select', emoji);
    };

    return {
      emojiArray,
      onEmojiClick,
    };
  },
});

</script>

<style lang="sass" scoped>
.emoji-panel
  display: flex
  justify-content: center
  box-sizing: content-box

  .q-scrollarea
    width: 280px !important
    height: 320px
    padding: 8px

    .emoji-grid
      display: flex
      flex-wrap: wrap

      .emoji-cell
        display: flex
        justify-content: center
        align-items: center
        width: 40px
        height: 40px
        box-sizing: border-box
        user-select: none
        font-size: 21px
        cursor: pointer
        text-align: center
        border-radius: 4px
        transition: transform, background 0.1s ease-in

        &:hover
          background: rgba(0, 0, 0, 0.1)
          > span
            transform: scale(1.2)

.emoji-panel.q-dark .emoji-grid .emoji-cell:hover
  background: rgba(255, 255, 255, 0.2)
</style>

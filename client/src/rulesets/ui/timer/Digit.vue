<template>
  <div class="digit">{{digit}}</div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
// 保证不等宽字体每个数字都等宽
export default defineComponent({
  props: {
    digit: {
      type: Number,
      required: true,
    },
  },
});
</script>
<style lang="sass" scoped>
.digit
  display: inline-block
  width: 9px
  text-align: right
</style>

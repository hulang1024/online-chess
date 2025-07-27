<template>
  <q-dialog ref="dialog">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h5">象棋</div>
        <q-btn
          v-if="$q.screen.xs"
          icon="close"
          class="text-grey-8 absolute-top-right q-pr-sm q-mt-sm"
          flat round v-close-popup
        />
      </q-card-section>
      <q-card-section>
        <p class="text-h6">规则</p>
        <p><a target="_blank" href="https://baike.baidu.com/item/%E4%B8%AD%E5%9B%BD%E8%B1%A1%E6%A3%8B/278314">百度百科</a></p>
        <function-tip />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script lang="ts">
import { defineComponent, getCurrentInstance } from "vue";
import FunctionTip from "./FunctionTip.vue";

export default defineComponent({
  components: { FunctionTip },
  setup() {
    const context = getCurrentInstance()!.proxy as unknown as Vue;
    return {
      show() {
        // eslint-disable-next-line
        (context.$refs.dialog as any).show();
      },
      hide() {
        // eslint-disable-next-line
        (context.$refs.dialog as any).hide();
      },
    };
  },
});
</script>

<style scoped>
p {
  margin-bottom: 8px;
}
</style>

<template>
  <q-dialog ref="dialog">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h5">揭棋</div>
        <q-btn
          v-if="$q.screen.xs"
          icon="close"
          class="text-grey-8 absolute-top-right q-pr-sm q-mt-sm"
          flat round v-close-popup
        />
      </q-card-section>
      <q-card-section>
        <p class="text-h6">规则</p>
        <p>1、反转背面看不见字体的棋子叫“暗子”。揭开后显示字体的棋子叫“明子”。</p>
        <p>2、红、黑双方各棋子反转背面随机地摆放好在自己一边的棋盘上，帅、将明摆放于原点。</p>
        <p>3、对弈时，双方轮流走子，先走方首先揭开自己的任何一个棋子，按其所在位置照中国象棋（明棋）规则走出一步。如在其攻击范围内也可以吃掉对方的棋子。</p>
        <p>4、揭开后的象、士均可以过河攻杀。</p>
        <p>5、其它规则与经典象棋相同。</p>

        <function-tip />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script lang="ts">
import { defineComponent, getCurrentInstance } from "vue";
import FunctionTip from "../chinesechess/FunctionTip.vue";

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

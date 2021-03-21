<template>
  <q-dialog ref="dialog">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">揭棋 规则</div>
      </q-card-section>
      <q-card-section>
        <p>1、反转背面看不见字体的棋子叫“暗子”。揭开后显示字体的棋子叫“明子”。</p>
        <p>2、红、黑双方各棋子反转背面随机地摆放好在自己一边的棋盘上，帅、将明摆放于原点。</p>
        <p>3、对弈时，双方轮流走子，先走方首先揭开自己的任何一个棋子，按其所在位置照中国象棋（明棋）规则走出一步。如在其攻击范围内也可以吃掉对方的棋子。</p>
        <p>4、揭开后的象、士均可以过河攻杀。</p>
        <p>5、其它规则与经典象棋相同。</p>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script lang="ts">
import { defineComponent, getCurrentInstance } from "@vue/composition-api";

export default defineComponent({
  setup() {
    const context = getCurrentInstance() as Vue;
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

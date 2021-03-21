<template>
  <q-dialog ref="dialog">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">设置</div>
      </q-card-section>

      <q-card-section>
        <div>
          <label>棋子状态提示</label>
          <q-toggle
            v-model="chessStatus"
            color="orange"
          />
        </div>
        <div>
          <label>可走位置提示</label>
          <q-toggle
            v-model="goDisplay"
            color="orange"
          />
        </div>
        <div v-if="!$q.screen.xs">
          <label>棋子可拖拽移动</label>
          <q-toggle
            v-model="chessDraggable"
            color="orange"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { configManager } from "src/boot/main";
import { ConfigItem } from "src/config/ConfigManager";
import {
  defineComponent, getCurrentInstance, reactive, watch, toRefs,
} from "@vue/composition-api";

export default defineComponent({
  setup() {
    const context = getCurrentInstance() as Vue;
    const values = reactive({
      chessStatus: configManager.get(ConfigItem.chinesechessChessStatus),
      goDisplay: configManager.get(ConfigItem.chinesechessGoDisplay),
      chessDraggable: configManager.get(ConfigItem.chinesechessChessDraggable),
    });

    watch(values, () => {
      context.$emit('ok', values);
    });

    return {
      ...toRefs(values),
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

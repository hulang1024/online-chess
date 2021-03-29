<template>
  <q-dialog ref="dialog" :maximized="$q.screen.xs" >
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">设置</div>
        <q-btn
          v-if="$q.screen.xs"
          icon="close"
          class="text-grey-8 absolute-top-right q-pr-sm q-mt-md"
          flat round v-close-popup
        />
      </q-card-section>
      <q-card-section>
        <q-tabs
          v-model="activeTab"
          dense
          inline-label
          narrow-indicator
          class="bg-grey-4 text-black"
        >
          <q-tab
            name="chess_board"
            label="棋盘棋子"
          />
          <q-tab
            name="functions"
            label="功能"
          />
        </q-tabs>
        <q-tab-panels
          v-model="activeTab"
          animated
          keep-alive
        >
          <q-tab-panel
            key="chess_board"
            name="chess_board"
          >
            <div class="row items-center">
              <label class="q-mr-sm">棋盘</label>
              <q-btn-toggle
                v-model="chessboardTheme"
                :options="chessboardThemeOptions"
                toggle-color="primary"
              />
            </div>
            <div class="row items-center q-mt-sm">
              <label class="q-mr-sm">棋子</label>
              <q-btn-toggle
                v-model="chessTheme"
                :options="chessThemeOptions"
                toggle-color="primary"
              />
            </div>
            <div
              ref="chessboardPanel"
              class="chessboard-panel row justify-center"
            />
          </q-tab-panel>
          <q-tab-panel
            key="functions"
            name="functions"
          >
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
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { configManager } from "src/boot/main";
import { ConfigItem } from "src/config/ConfigManager";
import {
  defineComponent, getCurrentInstance, reactive, watch, ref, toRefs, onBeforeUnmount,
} from "@vue/composition-api";
import ChessHost from "src/rulesets/chess_host";
import ChineseChessDrawableChessboard from "./ChineseChessDrawableChessboard";
import { createIntialLayoutChessList } from "../rule/chess_map";
import DrawableChess from "./DrawableChess";

let chessboard: ChineseChessDrawableChessboard | null = null;

export default defineComponent({
  setup() {
    const context = getCurrentInstance() as Vue;
    const chessboardThemeOptions = [
      { label: '默认', value: 'default' },
      { label: '棕色', value: 'brown' },
      { label: '黑色', value: 'black' },
    ];
    const chessThemeOptions = [
      { label: '默认', value: 'default' },
      { label: '黑紫', value: 'black-purple' },
      { label: '玛瑙', value: 'agate' },
      { label: '玻璃', value: 'glass' },
    ];
    const values = reactive({
      chessboardTheme: configManager.get(ConfigItem.chinesechessChessboardTheme),
      chessTheme: configManager.get(ConfigItem.chinesechessChessTheme),
      chessStatus: configManager.get(ConfigItem.chinesechessChessStatus),
      goDisplay: configManager.get(ConfigItem.chinesechessGoDisplay),
      chessDraggable: configManager.get(ConfigItem.chinesechessChessDraggable),
    });

    const activeTab = ref('chess_board');

    watch(values, () => {
      configManager.set(ConfigItem.chinesechessChessboardTheme, values.chessboardTheme);
      configManager.set(ConfigItem.chinesechessChessTheme, values.chessTheme);
      configManager.set(ConfigItem.chinesechessChessStatus, values.chessStatus);
      configManager.set(ConfigItem.chinesechessGoDisplay, values.goDisplay);
      configManager.set(ConfigItem.chinesechessChessDraggable, values.chessDraggable);
      configManager.save();
      context.$emit('ok', values);
    });

    onBeforeUnmount(() => {
      if (chessboard) {
        chessboard.destroy();
      }
    });

    return {
      chessboardThemeOptions,
      chessThemeOptions,
      activeTab,
      ...toRefs(values),
      show() {
        // eslint-disable-next-line
        (context.$refs.dialog as any).show();

        context.$nextTick(() => {
          const chessboardPanel = context.$refs.chessboardPanel as HTMLDivElement;
          if (chessboardPanel == null) {
            return;
          }
          const stage = {
            width: chessboardPanel.offsetWidth,
            height: chessboardPanel.offsetHeight,
          };
          if (chessboard == null) {
            chessboard = new ChineseChessDrawableChessboard(stage, context.$q.screen);
            createIntialLayoutChessList(ChessHost.SECOND, ChessHost.FIRST).forEach((chess) => {
              if (chessboard) {
                chessboard.addChess(new DrawableChess(chess, chessboard.bounds.chessRadius));
              }
            });
          }
          chessboardPanel.appendChild(chessboard.el);
        });
      },
      hide() {
        // eslint-disable-next-line
        (context.$refs.dialog as any).hide();
        if (chessboard) {
          chessboard.destroy();
        }
      },
    };
  },
});
</script>

<style lang="sass" scoped>
.q-tab-panel
  padding: 16px 8px
  height: 480px

.chessboard-panel
  width: 100%
  height: 360px
  padding: 16px 0px
</style>

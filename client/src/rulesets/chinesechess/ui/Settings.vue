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
          class="text-brown"
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
            <q-btn-toggle
              v-model="chessboardSubTab"
              :options="[
                {label: '棋盘', value: 'chessboard'},
                {label: '棋子', value: 'chess'},
              ]"
              toggle-color="brown"
            />
            <div
              ref="chessboardPanel"
              class="chessboard-panel row justify-center"
            />
            <div class="p-pt-lg">
              <q-btn-toggle
                v-if="chessboardSubTab == 'chessboard'"
                v-model="chessboardTheme"
                :options="chessboardThemeOptions"
                toggle-color="brown"
              />
              <q-btn-toggle
                v-if="chessboardSubTab == 'chess'"
                v-model="chessTheme"
                dense
                :options="chessThemeOptions"
                toggle-color="brown"
              />
            </div>
          </q-tab-panel>
          <q-tab-panel
            key="functions"
            name="functions"
          >
            <div class="rows">
              <div class="row">
                <label>背景音乐</label>
                <q-toggle
                  v-model="bgmEnabled"
                  color="orange"
                />
              </div>
              <div class="row">
                <label>下棋声音</label>
                <q-toggle
                  v-model="gameplayAudioEnabled"
                  color="orange"
                />
              </div>
              <div class="row">
                <label>棋子状态提示</label>
                <q-toggle
                  v-model="chessStatus"
                  color="orange"
                />
              </div>
              <div class="row">
                <label>可走位置提示</label>
                <q-toggle
                  v-model="goDisplay"
                  color="orange"
                />
              </div>
              <div v-if="!$q.screen.xs" class="row">
                <label>棋子可拖拽移动</label>
                <q-toggle
                  v-model="chessDraggable"
                  color="orange"
                />
              </div>
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
import chessboardThemes from './themes/chessboard/index';
import chessThemes from './themes/chess/index';

let chessboard: ChineseChessDrawableChessboard | null = null;

export default defineComponent({
  setup() {
    const context = getCurrentInstance() as Vue;
    const chessboardThemeOptions: { label: string, value: string }[] = [];
    Object.keys(chessboardThemes).forEach((theme) => {
      chessboardThemeOptions.push({ label: chessboardThemes[theme].name, value: theme });
    });

    const chessThemeOptions: { label: string, value: string }[] = [];
    Object.keys(chessThemes).forEach((theme) => {
      chessThemeOptions.push({ label: chessThemes[theme].name, value: theme });
    });

    const values = reactive({
      bgmEnabled: configManager.get(ConfigItem.bgmEnabled),
      gameplayAudioEnabled: configManager.get(ConfigItem.chinesechessGameplayAudioEnabled),
      chessboardTheme: configManager.get(ConfigItem.chinesechessChessboardTheme),
      chessTheme: configManager.get(ConfigItem.chinesechessChessTheme),
      chessStatus: configManager.get(ConfigItem.chinesechessChessStatus),
      goDisplay: configManager.get(ConfigItem.chinesechessGoDisplay),
      chessDraggable: configManager.get(ConfigItem.chinesechessChessDraggable),
    });

    const activeTab = ref('chess_board');
    const chessboardSubTab = ref('chessboard');

    watch(values, () => {
      configManager.set(ConfigItem.bgmEnabled, values.bgmEnabled);
      configManager.set(ConfigItem.chinesechessGameplayAudioEnabled, values.gameplayAudioEnabled);
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
      chessboardSubTab,
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
  display: flex
  flex-direction: column
  align-items: center
  padding: 16px 4px
  height: 480px

.chessboard-panel
  width: 100%
  height: 320px
  margin: 16px 0px

.rows
  width: 100%
  > .row
    padding: 8px 0px
    width: 100%
    justify-content: space-between
    align-items: center
</style>
<style scoped>
>>> .q-btn--dense .q-btn__wrapper {
  padding: 6px 8px;
}
</style>

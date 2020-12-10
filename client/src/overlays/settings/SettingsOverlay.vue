<template>
  <q-drawer
    v-model="isOpen"
    bordered
    overlay
    behavior="desktop"
    elevated
    class="settings-drawer"
    content-class="row"
  >
    <q-tabs
      v-model="activeTab"
      vertical
      class="col text-white"
    >
      <q-tab name="display" label="显示" />
      <q-tab name="audio" label="声音" />
    </q-tabs>
    <div class="col content">
      <q-toggle
        v-model="configState.darkEnabled"
        label="深色模式"
      />
      <q-toggle
        v-model="configState.fullscreen"
        label="全屏"
      />
    </div>
  </q-drawer>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, reactive, ref, watch } from '@vue/composition-api'

export default defineComponent({
  setup() {
    const isOpen = ref(false);
  
    const toggle = () => { 
      isOpen.value = !isOpen.value;
    };

    const hide = () => { 
      isOpen.value = false;
    };

    const activeTab = ref('display');

    const configState = reactive({
      darkEnabled: false,
      fullscreen: false
    });

    const ctx: any = getCurrentInstance();
    watch(configState, () => {
      ctx.$q.dark.set(configState.darkEnabled);

      setTimeout(() => {
        if (configState.fullscreen) {
          ctx.$q.fullscreen.request();
        } else {
          ctx.$q.fullscreen.exit();
        }
      }, 100);

    });

    return {
      isOpen,
      toggle,
      hide,
      activeTab,
      configState,
    };
  }
});
</script>

<style>
.settings-drawer > .q-drawer {
  width: 70% !important;
  max-width: 300px;
  background-color: transparent;
  color: white;
}
</style>
<style lang="scss" scoped>
.q-tabs {
  max-width: 60px !important;
  background-color: black;
  opacity: 0.8;
}

.content {
  background-color: black;
  opacity: 0.7;
  color: white;
}
</style>
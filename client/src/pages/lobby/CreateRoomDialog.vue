<template>
  <q-dialog
    v-model="isOpen"
  >
    <q-card class="q-px-lg q-py-lg" style="width: 400px">
      <q-form
        ref="form"
        class="q-gutter-md"
      >
        <q-input
          v-model="name"
          standout
          dense
          label="房间名称"
          hint="可不填"
        />

        <q-input
          v-model.number="gameDuration"
          type="number"
          standout
          dense
          label="局时"
          suffix="分钟"
          hit="棋局可用总时间"
          lazy-rules
          :rules="[ val => val || '' ]"
        />
        <q-input
          v-model.number="stepDuration"
          type="number"
          standout
          dense
          label="步时"
          suffix="分钟"
          hint="局时内每步时间"
          lazy-rules
          :rules="[ val => val || '' ]"
        />
        <q-input
          v-model.number="secondsCountdown"
          type="number"
          standout
          dense
          label="读秒"
          suffix="秒"
          hint="局时用完后每步时间"
          lazy-rules
          :rules="[ val => val || '' ]"
        />
        
        <q-toggle v-model="requirePassword" label="需要密码" />

        <q-input
          v-show="requirePassword"
          v-model="password"
          type="password"
          standout
          dense
          label="房间密码"
        />

        <div class="q-gutter-y-md">
          <q-btn
            label="创建"
            color="primary"
            class="full-width"
            :loading="createLoading"
            @click="onSubmit"
          />
          <q-btn
            label="取消"
            class="full-width"
            @click="isOpen = false"
          />
        </div>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, reactive, ref, toRefs } from '@vue/composition-api';
import { boot } from 'quasar/wrappers';

export default defineComponent({
  setup() {
    const ctx = getCurrentInstance();
    let { $refs } = <any>ctx;

    const INIT_VALUES = {
      name: '',
      gameDuration: 10,
      stepDuration: 1,
      secondsCountdown: 10,
      requirePassword: false,
      password: ''
    };
    let room = reactive({...INIT_VALUES});

    const isOpen = ref(false);
  
    const createLoading = ref(false);

    let action: Function;
    const show = (options: any) => {
      action = options.action;
      Object.assign(room, INIT_VALUES);
      createLoading.value = false;
      isOpen.value = true;
    };

    const onSubmit = () => {
      $refs.form.validate().then((valid: boolean) => {
        if (!valid) return;
        if (!room.requirePassword) {
          room.password = '';
        }
        createLoading.value = true;
        room.roomSettings = {};
        room.roomSettings.gameDuration = room.gameDuration;
        room.roomSettings.stepDuration = room.stepDuration;
        room.roomSettings.secondsCountdown = room.secondsCountdown;
        action(room, (success: boolean) => {
          createLoading.value = false;
          if (success) {
            isOpen.value = false;
          }
        });
      });
    };

    return {
      isOpen,
      show,

      ...toRefs(room),
      createLoading,
      onSubmit
    };
  }
});
</script>
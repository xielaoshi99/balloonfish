<script setup>
  import { h, ref } from 'vue'
  import { SettingsOutline } from '@vicons/ionicons5'
  const settingsForm = ref({
    name: '',
  })
  const showForm = ref(false)
</script>
<template>
  <n-button type="primary" ghost @click="showForm = true">
    <n-icon :size="18" :component="SettingsOutline" />
  </n-button>
  <n-modal
    v-model:show="showForm"
    preset="card"
    :style="{
      width: '500px',
    }"
    title="设置"
    :bordered="false"
    :segmented="{ content: 'soft', footer: 'soft' }"
    :on-after-leave="formClose"
  >
    <n-form ref="formRef" :model="settingsForm" label-placement="left" label-width="auto" require-mark-placement="right-hanging" size="medium">
      <n-form-item label="主题" path="name">
        <n-input v-model:value="settingsForm.name" placeholder="" />
      </n-form-item>
      <n-form-item label="语言" path="name">
        <n-input v-model:value="settingsForm.name" placeholder="" />
      </n-form-item>
    </n-form>
  </n-modal>
</template>


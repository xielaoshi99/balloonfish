<script setup>
  import LinkAside from './components/LinkAside.vue'
</script>
<template>
  <n-layout has-sider id="total">
    <n-layout-sider bordered :width="300">
      <n-message-provider>
        <link-aside></link-aside>
      </n-message-provider>
    </n-layout-sider>
    <n-layout>
      <span>内容</span>
    </n-layout>
  </n-layout>
</template>
<style lang="scss">
  #total {
    height: 100%;
  }
</style>

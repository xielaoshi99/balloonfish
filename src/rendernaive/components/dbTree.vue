<script setup>
  import { h, ref, onMounted } from 'vue'
  import { Database } from '@vicons/tabler'
  import { showDatabases, createDatabase, dropDatabase, showSuperTables, showTables, dropTable } from '../utils/taosrestful'
  import stableTree from './stableTree.vue'
  import tableTree from './tableTree.vue'
  const inPara = defineProps({
    link: Object, //是否显示
  })
  const emit = defineEmits(['dataSel'])
  const dbList = ref([])
  onMounted(() => {
    showDatabases(inPara.link).then((data) => {
      if (data.res) {
        dbList.value = data.data
      }
    })
  })
  function handleTableSel(table) {
    emit('dataSel', 'table', { link: inPara.link, name: table.table_name, uid: `${inPara.link.id}-${table.uid}`, table: table })
  }
  function handleSTableSel(table) {
    emit('dataSel', 'stable', { link: inPara.link, name: table.name, uid: `${inPara.link.id}-${table.name}`, table: table })
  }
</script>
<template>
  <n-collapse>
    <template #arrow>
      <n-icon :size="18" :component="Database" />
    </template>
    <n-collapse-item v-for="(item, index) in dbList" :key="index" :title="item.name">
      <stable-tree :dbname="item.name" :link="inPara.link" @stableSel="handleSTableSel"></stable-tree>
      <table-tree :dbname="item.name" :link="inPara.link" @tableSel="handleTableSel"></table-tree>
    </n-collapse-item>
  </n-collapse>
</template>


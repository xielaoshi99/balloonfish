<script setup>
  import { h, ref, onMounted } from 'vue'
  import { showTables } from '../utils/taosrestful'
  const inPara = defineProps({
    dbname: Object, //是否显示
    link: Object, //是否显示
  })
  const emit = defineEmits(['tableSel'])
  const tableList = ref([
    {
      table_name: '表',
      uid: 'root',
      children: [],
    },
  ])
  const allTable = ref([])
  onMounted(() => {
    showTables(inPara.dbname, inPara.link).then((data) => {
      allTable.value = data.data
      tableList.value[0].children = data.data.splice(0, 10)
    })
  })
  function nodeProps({ option }) {
    return {
      onClick() {
        if (option.uid != 'root') {
          emit('tableSel', option)
        }
      },
      onContextmenu(e) {
        optionsRef.value = [option]
        showDropdownRef.value = true
        xRef.value = e.clientX
        yRef.value = e.clientY
        console.log(e.clientX, e.clientY)
        e.preventDefault()
      },
    }
  }
</script>
<template>
  <n-tree block-line :data="tableList" label-field="table_name" key-field="uid" expand-on-click :node-props="nodeProps" />
</template>

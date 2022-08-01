<script setup>
  import { h, ref, onMounted } from 'vue'
  import { showSuperTables } from '../utils/taosrestful'
  const inPara = defineProps({
    dbname: Object, //是否显示
    link: Object, //是否显示
  })
  const emit = defineEmits(['stableSel'])
  const stableList = ref([
    {
      name: '超级表',
      uid: 'root',
      children: [],
    },
  ])
  onMounted(() => {
    showSuperTables(inPara.dbname, inPara.link).then((data) => {
      stableList.value[0].children = data.data.splice(0, 10)
    })
  })
  function nodeProps({ option }) {
    return {
      onClick() {
        if (option.uid != 'root') {
          let data = option
          data.dbname = inPara.dbname
          emit('stableSel', option)
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
  <n-tree block-line :data="stableList" label-field="name" key-field="name" expand-on-click :node-props="nodeProps" />
</template>

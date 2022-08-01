<script setup>
  import { h, ref, onMounted } from 'vue'
  import { NIcon } from 'naive-ui'
  import { showTables } from '../utils/taosrestful'
  import { Search, AddCircleOutline } from '@vicons/ionicons5'
  import { Delete, Edit } from '@vicons/carbon'
  import { repeat } from 'seemly'
  const inPara = defineProps({
    dbname: Object, //是否显示
    link: Object, //是否显示
  })
  const emit = defineEmits(['tableSel'])
  const showDropdown = ref(false)
  const x = ref(0)
  const y = ref(0)
  const options = ref([])
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
  function renderIcon(icon) {
    return () => {
      return h(NIcon, null, {
        default: () => h(icon),
      })
    }
  }
  function nodeProps({ option }) {
    return {
      onClick() {
        if (option.uid != 'root') {
          let data = option
          data.dbname = inPara.dbname
          emit('tableSel', option)
        }
      },
      onContextmenu(e) {
        if (option.uid == 'root') {
          options.value = [
            {
              label: '添加表',
              key: 'add',
              icon: renderIcon(AddCircleOutline),
            },
            {
              label: '搜索表',
              key: 'search',
              icon: renderIcon(Search),
            },
          ]
        } else {
          options.value = [
            {
              label: '添加表',
              key: 'add',
              icon: renderIcon(AddCircleOutline),
            },
            {
              label: '搜索表',
              key: 'search',
              icon: renderIcon(Search),
            },
            {
              label: '编辑表',
              key: 'edit',
              icon: renderIcon(Edit),
            },
            {
              label: '删除表',
              key: 'delete',
              icon: renderIcon(Delete),
            },
          ]
        }
        x.value = e.clientX
        y.value = e.clientY
        showDropdown.value = true
        e.preventDefault()
      },
    }
  }
  function handleClickoutside() {
    showDropdown.value = false
  }
  function handleSelect(params) {
    showDropdown.value = false
  }
</script>
<template>
  <n-tree block-line :data="tableList" label-field="table_name" key-field="uid" expand-on-click :node-props="nodeProps" />
  <n-dropdown trigger="manual" placement="bottom-start" :show="showDropdown" :options="options" :x="x" :y="y" @select="handleSelect" @clickoutside="handleClickoutside" />
</template>

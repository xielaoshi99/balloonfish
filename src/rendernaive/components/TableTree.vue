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
  const emit = defineEmits(['tableSel', 'tableAdd'])
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
  const showForm = ref(false)
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
  function handleSelect(key) {
    switch (key) {
      case 'add':
        showForm.value = true
        //emit('tableAdd', inPara.link, inPara.dbname, 'add', false)
        break
      case 'edit':
        emit('tableAdd', inPara.link, inPara.dbname, 'edit', false)
        break
      default:
        break
    }
    showDropdown.value = false
  }
  function formClose() {}
  const songs = ref([
    {
      value: 'stable',
      label: '以超级表作为模板',
    },
    {
      value: '直接创建',
      label: '直接创建',
    },
  ])
  const value = ref(null)
</script>
<template>
  <n-tree block-line :data="tableList" label-field="table_name" key-field="uid" expand-on-click :node-props="nodeProps" />
  <n-dropdown trigger="manual" placement="bottom-start" :show="showDropdown" :options="options" :x="x" :y="y" @select="handleSelect" @clickoutside="handleClickoutside" />

  <n-modal
    v-model:show="showForm"
    preset="card"
    :style="{
      width: '400px',
    }"
    title="请选择创建表的方式"
    :bordered="false"
    :segmented="{ content: 'soft', footer: 'soft' }"
    :on-after-leave="formClose"
  >
    <n-radio-group v-model:value="value" name="radiogroup">
      <n-space vertical>
        <n-radio v-for="song in songs" :key="song.value" :value="song.value">
          <n-space>
            <span>{{ song.label }}</span>
            <n-select v-if="song.value == 'stable'" v-model:value="value" :options="options" />
          </n-space>
        </n-radio>
      </n-space>
    </n-radio-group>
    <template #footer>
      <n-space justify="right">
        <n-button type="primary">确认</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

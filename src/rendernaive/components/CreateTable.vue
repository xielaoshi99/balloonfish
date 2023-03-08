<script setup>
  import { h, ref, onMounted } from 'vue'
  import { NButton, NInput, NInputNumber, NSelect, useMessage } from 'naive-ui'
  import { dataTypeOption } from '../utils/funCommon'
  const message = useMessage()
  const inPara = defineProps({
    link: Object, //是否显示
    dbname: String,
  })
  const columns = ref([
    {
      title: '字段名称',
      key: 'name',
      width: '35%',
      render(row, index) {
        if (row.name !== 'ts' && index != 0) {
          return h(NInput, {
            value: row.name,
            onUpdateValue(v) {
              data.value[index].name = v
            },
          })
        } else {
          return row.name
        }
      },
    },
    {
      title: '数据类型',
      key: 'type',
      width: '15%',
      render(row, index) {
        if (row.name !== 'ts' && index != 0) {
          return h(NSelect, {
            value: row.type,
            options: dataTypeOption,
            onUpdateValue(v) {
              data.value[index].type = v
            },
          })
        } else {
          return row.type
        }
      },
    },
    {
      title: '长度',
      key: 'length',
      width: '25%',
      render(row, index) {
        if (row.name !== 'ts' && index != 0) {
          return h(NInputNumber, {
            value: row.length,
            onUpdateValue(v) {
              data.value[index].length = v
            },
          })
        } else {
          return row.length
        }
      },
    },
    {
      title: '操作',
      key: 'actions',
      render(row, index) {
        if (row.name !== 'ts' && index != 0) {
          return h(
            NButton,
            {
              strong: true,
              ghost: true,
              size: 'small',
              type: 'error',
              onClick: () => delCol(row, index),
            },
            { default: () => '删除' }
          )
        }
      },
    },
  ])
  const data = ref([
    {
      name: 'ts',
      type: 'timestamp',
      isEdit: true,
    },
  ])
  function addColumn() {
    data.value.push({
      name: '',
      type: '',
      length: '',
      isEdit: true,
    })
  }
  function delCol(row, index) {
    data.value.splice(index, 1)
  }
  function saveColumn() {
    if (checkColumnData()) {
      console.log(data.value)
    }
  }
  function checkColumnData() {
    if (data.value.length == 1) {
      message.warning('请添加除时间戳之外的字段！', {
        duration: 1500,
      })
      return false
    }
    for (let i = 0; i < data.value.length; i++) {
      if (data.value[i].name == '') {
        message.warning('不能有空字段名！', {
          duration: 1500,
        })
        return false
      }
    }
    return true
  }
</script>
<template>
  <n-card
    :segmented="{
      content: true,
      footer: 'soft',
    }"
  >
    <template #header>数据库：{{ inPara.dbname }}</template>
    <n-space style="margin-bottom: 15px">
      <n-button type="primary" @click="addColumn">添加字段</n-button>
      <n-button type="primary" @click="saveColumn">保存</n-button>
    </n-space>
    <n-data-table :columns="columns" :data="data" />
  </n-card>
</template>
<style></style>

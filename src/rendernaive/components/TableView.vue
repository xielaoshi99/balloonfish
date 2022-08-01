<script setup>
  import { h, ref, onMounted } from 'vue'
  import { selectData, getTableTag } from '../utils/taosrestful'
  import { useMessage } from 'naive-ui'
  import { EditFilter } from '@vicons/carbon'
  import { RefreshSharp } from '@vicons/ionicons5'
  const message = useMessage()
  const inPara = defineProps({
    table: Object,
    dbname: String,
    link: Object,
  })
  const tableFilter = ref({
    fields: [],
    dateRange: null,
    superTSearchText: '',
    superTSearchColumn: '',
  })
  const tableFilterCopy = ref({
    fields: [],
    dateRange: null,
    superTSearchText: '',
    superTSearchColumn: '',
  })
  const pageNum = ref(1)
  const pageSize = ref(10)
  const superWhere = ref('')
  const tableOrder = ref('DESC')
  const tableLabelItems = ref([])
  const tableLabel = ref([])
  const tableData = ref([])
  const totalTable = ref(0)
  const tableTags = ref({})
  const loading = ref(true)
  const filterShow = ref(false)
  const railStyle = ({ focused, checked }) => {
    const style = {}
    if (checked) {
      style.background = '#d03050'
      if (focused) {
        style.boxShadow = '0 0 0 2px #d0305040'
      }
    } else {
      style.background = '#2080f0'
      if (focused) {
        style.boxShadow = '0 0 0 2px #2080f040'
      }
    }
    return style
  }
  onMounted(() => {
    getTableData(true, true)
  })
  function getTableData(isFirst, isResetPage) {
    loading.value = true
    let startTime = null
    let endTime = null
    if (tableFilter.value.dateRange) {
      startTime = tableFilter.value.dateRange[0]
      endTime = tableFilter.value.dateRange[1]
    }
    //是否需要重置分页
    if (isResetPage) {
      pageNum.value = 1
    }
    let offsetVal = (pageNum.value - 1) * pageSize.value
    if (inPara.table.table_name) {
      selectData(inPara.table.table_name, inPara.dbname, inPara.link, tableFilter.value.fields, superWhere.value, pageSize.value, offsetVal, tableOrder.value, startTime, endTime).then((data) => {
        if (data.res) {
          let tableDescribe = data.describe
          let tableTagName = []
          for (let i = 0; i < tableDescribe.length; i++) {
            if (tableDescribe[i].Note == 'TAG') {
              tableTagName.push(tableDescribe[i].Field)
            }
          }
          if (tableTagName.length != 0) {
            getTableTag(inPara.table.table_name, inPara.dbname, inPara.link, tableTagName).then((data) => {
              tableTags.value = data.data[0]
            })
          }
          if (data.data.length != 0) {
            //有数据
            if (isFirst) {
              tableLabelItems.value = Object.keys(data.data[0])
            }
            tableLabel.value = Object.keys(data.data[0]).map((i) => {
              if (i === 'ts') {
                return {
                  title: i,
                  key: i,
                  fixed: 'left',
                  minWidth: '250',
                }
              }
              return {
                title: i,
                key: i,
                minWidth: '150',
              }
            })
            tableFilter.value.fields = Object.keys(data.data[0])
            tableFilterCopy.value.fields = Object.keys(data.data[0])
            tableData.value = data.data
            totalTable.value = data.count
            loading.value = false
          } else {
            tableData.value = []
            totalTable.value = 0
            message.warning('数据为空', {
              duration: 1500,
            })
            loading.value = false
          }
        } else {
        }
      })
    }
  }
  function pageChange(page) {
    pageNum.value = page
    getTableData(false)
  }
  function sizeChange(page) {
    pageSize.value = page
    getTableData(false, true)
  }
  function checkUpdate(checked) {}
  function filterSubmit() {
    getTableData(false, true)
    filterShow.value = false
  }
  function cancelTableFilter() {
    tableFilter.value = tableFilterCopy.value
    filterShow.value = false
  }
  function dateConfirm() {
    setTimeout(() => {
      getTableData(false, true)
    }, 1)
  }
</script>
<template>
  <n-modal
    v-model:show="filterShow"
    preset="card"
    :style="{
      width: '600px',
    }"
    title="筛选条件"
    :bordered="false"
    :segmented="{ content: 'soft', footer: 'soft' }"
    :on-after-leave="formClose"
  >
    <n-form ref="formRef" :model="tableFilter" label-placement="left" label-width="auto" require-mark-placement="right-hanging" size="medium" :show-feedback="false">
      <n-form-item label="数据项：" path="fields">
        <n-checkbox-group v-model:value="tableFilter.fields" @update:value="checkUpdate">
          <n-space item-style="display: flex;">
            <n-checkbox v-for="label in tableLabelItems" :key="label" :value="label" :label="label" />
          </n-space>
        </n-checkbox-group>
      </n-form-item>
      <n-form-item label="排序规则：" style="margin-top: 15px" checked-value="DESC" unchecked-value="ASC">
        <n-switch v-model:value="tableOrder" :rail-style="railStyle">
          <template #checked>时间倒序</template>
          <template #unchecked>时间正序</template>
        </n-switch>
      </n-form-item>
    </n-form>
    <template #footer>
      <n-space justify="right">
        <n-button type="primary" @click="cancelTableFilter" ghost>取消</n-button>
        <n-button type="primary" @click="filterSubmit">确认</n-button>
      </n-space>
    </template>
  </n-modal>
  <n-form ref="formRef" :model="tableFilter" label-placement="left" label-width="auto" require-mark-placement="right-hanging" size="medium" :show-feedback="false">
    <n-grid :cols="24" :x-gap="15" :y-gap="15">
      <n-form-item-gi :span="24" label="时间范围：" path="dateRange">
        <n-date-picker v-model:value="tableFilter.dateRange" type="daterange" clearable :disabled="tableData.length == 0" :on-confirm="dateConfirm" :on-clear="dateConfirm" style="width: 100%" />
        <n-button style="margin: 0 20px" :disabled="tableData.length == 0" @click="filterShow = true">
          <n-icon :size="18" :component="EditFilter" style="margin-right: 5px" />
          筛选条件
        </n-button>
        <n-button @click="getTableData(true, false)">
          <n-icon :size="18" :component="RefreshSharp" style="margin-right: 5px" />
          数据刷新
        </n-button>
      </n-form-item-gi>
      <n-form-item-gi :span="5" label="超级表：">{{ inPara.table.stable_name }}</n-form-item-gi>
      <n-form-item-gi :span="19" label="标签信息：">
        <n-space>
          <n-tag v-for="(item, index) in tableTags" :key="index" round>{{ index }}：{{ item }}</n-tag>
        </n-space>
      </n-form-item-gi>
    </n-grid>
  </n-form>
  <n-data-table :loading="loading" :columns="tableLabel" :data="tableData" :bordered="false" style="margin: 20px 0" />
  <n-pagination v-model:page="pageNum" v-model:page-size="pageSize" :item-count="totalTable" :on-update:page="pageChange" :on-update:page-size="sizeChange" show-size-picker :page-sizes="[10, 20, 30, 40]" />
</template>

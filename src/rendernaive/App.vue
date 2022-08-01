<script setup>
  import { h, ref, onMounted } from 'vue'
  import LinkAside from './components/LinkAside.vue'
  import TableView from './components/TableView.vue'
  import STableView from './components/STableView.vue'
  import { DataClass, DataTable } from '@vicons/carbon'
  import { NConfigProvider } from 'naive-ui'
  import { zhCN, dateZhCN } from 'naive-ui'
  const tabList = ref([])
  const activeTab = ref('')
  const showDropdown = ref(false)
  const x = ref(0)
  const y = ref(0)
  const options = ref([
    {
      label: '关闭其他',
      key: 'other',
      // icon: renderIcon(Delete),
    },
    {
      label: '关闭所有',
      key: 'all',
      //  icon: renderIcon(Edit),
    },
  ])
  function handleClose(uid) {
    const index = tabList.value.findIndex((v) => {
      return uid === v.uid
    })
    tabList.value.splice(index, 1)
    if (activeTab.value === uid) {
      activeTab.value = tabList[index]
    }
  }
  function handleDataSel(type, data) {
    switch (type) {
      case 'tableadd':
        activeTab.value = data.id + '-addtable'
        tabList.value.push({
          type: type, //类型
          uid: data.id + '-addtable', //key
          name: '添加表@' + data.name, //显示名称
          link: data,
        })
        break
      default:
        activeTab.value = data.uid
        for (let i = 0; i < tabList.value.length; i++) {
          if (tabList.value[i].type == type && tabList.value[i].uid == data.uid) {
            activeTab.value = tabList.value[i].uid
            return false
          }
        }
        tabList.value.push({
          type: type, //类型
          uid: data.uid, //key
          name: makeTabName(type, data), //显示名称
          link: data.link,
          table: data.table,
        })
    }
  }
  function makeTabName(type, data) {
    if (type == 'stable') {
      return `超级表${data.name}@${data.link.name}`
    } else {
      return `表${data.name}@${data.link.name}`
    }
  }
  const tabProps = ref({
    onContextmenu(e) {
      x.value = e.clientX
      y.value = e.clientY
      showDropdown.value = true
      e.preventDefault()
    },
  })

  function handleSelect(params) {
    showDropdown.value = false
  }
</script>
<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
    <n-layout has-sider id="total">
      <n-layout-sider bordered :width="300">
        <n-message-provider>
          <link-aside @dataSel="handleDataSel"></link-aside>
        </n-message-provider>
      </n-layout-sider>

      <n-layout style="padding: 10px">
        <n-tabs v-model:value="activeTab" type="card" closable tab-style="min-width: 100px;" @close="handleClose">
          <n-tab-pane v-for="panel in tabList" :key="panel.uid" :name="panel.uid" :tab-props="tabProps">
            <template #tab>
              <n-icon :size="18" v-if="panel.type == 'stable'" :component="DataClass" style="margin-right: 5px" />
              <n-icon :size="18" v-if="panel.type == 'table'" :component="DataTable" style="margin-right: 5px" />
              {{ panel.name }}
            </template>
            <div style="padding: 0 10px">
              <n-message-provider>
                <table-view v-if="panel.type == 'table'" :table="panel.table" :dbname="panel.table.dbname" :link="panel.link"></table-view>
                <s-table-view v-if="panel.type == 'stable'" :table="panel.table" :dbname="panel.table.dbname" :link="panel.link"></s-table-view>
              </n-message-provider>
            </div>
          </n-tab-pane>
        </n-tabs>
      </n-layout>
    </n-layout>
    <n-dropdown trigger="manual" placement="bottom-start" :show="showDropdown" :options="options" :x="x" :y="y" @select="handleSelect" @clickoutside="showDropdown.value = false" />
  </n-config-provider>
</template>
<style lang="scss">
  #total {
    height: 100vh;
  }
</style>

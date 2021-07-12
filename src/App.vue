<template>
  <el-container class="main">
    <el-container class="mainContent">
      <el-aside class="linksMenu">
        <LinkAside @tableChanged="tableChangedListener" @addTab="addTab"></LinkAside>
      </el-aside>
      <el-main>
        <el-tabs v-model="activeTab" type="card" closable @tab-remove="removeTab">
          <el-tab-pane :key="item.name" v-for="item in mainTabs" :label="item.title" :name="item.name">
            <component :is="item.content" />
          </el-tab-pane>
        </el-tabs>
      </el-main>
      <el-aside class="linksMenu">
        <InfoAside :tabledata="selectedTable" :type="selectedType" :dbdata="selectedDB"></InfoAside>
      </el-aside>
    </el-container>
  </el-container>
</template>

<script>
  import HelloWorld from './components/HelloWorld.vue'
  import LinkAside from './components/LinkAside.vue'
  import InfoAside from './components/InfoAside.vue'
  export default {
    name: 'App',
    components: {
      HelloWorld,
      LinkAside,
      InfoAside,
    },

    data() {
      return {
        //标签页部分
        activeTab: 1,
        mainTabs: [
          {
            title: 'Tab 1',
            name: 1,
            content: 'HelloWorld',
          },
          {
            title: 'Tab 2',
            name: 2,
            content: 'HelloWorld',
          },
        ],
        tabIndex: 2,
        selectedTable: {},
        selectedType: '',
        selectedDB: {},
        superTableData: [],
        links: [],
        theLink: {}, //当前连接
        loadingLinks: false,
        addLinkDialog: false,
        linkForm: {
          name: '',
          host: '',
          port: '',
          user: '',
          password: '',
        },
      }
    },
    methods: {
      tableChangedListener(table, type, db) {
        this.selectedTable = table
        this.selectedDB = db
        this.selectedType = type
      },
      removeTab(targetName) {
        let tabs = this.mainTabs
        let activeName = this.activeTab
        if (activeName === targetName) {
          tabs.forEach((tab, index) => {
            if (tab.name === targetName) {
              let nextTab = tabs[index + 1] || tabs[index - 1]
              if (nextTab) {
                activeName = nextTab.name
              }
            }
          })
        }
        this.activeTab = activeName
        this.mainTabs = tabs.filter((tab) => tab.name !== targetName)
      },
      addTab(newTabTitle) {
        let newTabName = ++this.tabIndex + ''
        this.mainTabs.push({
          title: newTabTitle,
          name: newTabName,
          content: 'HelloWorld',
        })
        this.activeTab = newTabName
      },
    },
  }
</script>

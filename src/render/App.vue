<template>
  <el-container>
    <el-aside class="linksMenu">
      <LinkAside @tableChanged="tableChanged" @addTab="addTab" @linkChanged="linkChanged"></LinkAside>
    </el-aside>
    <el-main class="main">
      <el-tabs v-model="activeTab" type="card" closable @tab-remove="removeTab">
        <el-tab-pane :key="item.name" v-for="item in mainTabs" :name="item.name">
          <template #label>
            <i :class="item.icon"></i>
            <span>{{ item.title }}</span>
          </template>
          <component :is="item.content" :tablename="item.table" :dbname="selectedDB.name" :link="theLink" />
        </el-tab-pane>
      </el-tabs>
    </el-main>
    <!-- <el-aside class="infoMenu">
      <InfoAside :tabledata="selectedTable" :type="selectedType" :dbdata="selectedDB"></InfoAside>
    </el-aside> -->
  </el-container>
</template>

<script>
  import STableView from './components/STableView.vue'
  import TableView from './components/TableView.vue'
  import LinkAside from './components/LinkAside.vue'
  import InfoAside from './components/InfoAside.vue'
  import Welcome from './components/Welcome.vue'
  export default {
    name: 'App',
    components: {
      STableView,
      TableView,
      LinkAside,
      InfoAside,
      Welcome,
    },

    data() {
      return {
        //标签页部分
        activeTab: '1',
        mainTabs: [
          {
            title: ' 欢迎',
            name: '1',
            icon: 'fa fa-home',
            content: 'Welcome',
          },
        ],
        tabIndex: 1,
        selectedTable: {},
        selectedType: '',
        selectedDB: {},
        theLink: {}, //当前连接
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
      tableChanged(table, type, db) {
        console.log(table)
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
      addTab(newTabTitle, table, type, icon) {
        for (let i = 0; i < this.mainTabs.length; i++) {
          if (newTabTitle == this.mainTabs[i].title) {
            this.activeTab = this.mainTabs[i].name
            return false
          }
        }
        let newTabName = ++this.tabIndex + ''
        this.mainTabs.push({
          title: newTabTitle,
          name: newTabName,
          table: table,
          content: type,
          icon: icon,
        })
        this.activeTab = newTabName
      },
      linkChanged(link) {
        this.theLink = link
      },
    },
  }
</script>

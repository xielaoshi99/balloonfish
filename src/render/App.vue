<template>
  <el-container>
    <el-aside class="linksMenu">
      <LinkAside ref="linkAside" @tableChanged="tableChanged" @addTabMain="addTabMain" @linkChanged="linkChanged" @postMessage="receiveMessage"></LinkAside>
    </el-aside>
    <el-main class="main">
      <el-tabs v-model="activeTab" type="card" closable @tab-remove="removeTab">
        <el-tab-pane :key="item.name" v-for="item in mainTabs" :name="item.name">
          <template #label>
            <i :class="item.icon"></i>
            <span>{{ item.title }}</span>
          </template>
          <component :is="item.content" :table="item.table" :dbname="selectedDB.name" :link="item.link" @postMessage="receiveMessage"></component>
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
  import CreateSTable from './components/CreateSTable.vue'
  import CreateTable from './components/CreateTable.vue'
  import CreateTableWithTemp from './components/CreateTableWithTemp.vue'
  import QuerySQL from './components/QuerySQL.vue'
  import UserManage from './components/UserManage.vue'
  import LinkAside from './components/LinkAside.vue'
  import InfoAside from './components/InfoAside.vue'
  import Welcome from './components/Welcome.vue'
  export default {
    name: 'App',
    components: {
      STableView,
      TableView,
      CreateSTable,
      CreateTable,
      CreateTableWithTemp,
      QuerySQL,
      UserManage,
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
      addTabMain(newTabTitle, table, type, icon, link) {
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
          link: link,
        })
        this.activeTab = newTabName
      },
      linkChanged(link) {
        this.theLink = link
      },
      receiveMessage(mesType, mes) {
        switch (mesType) {
          case 'tablecreated':
            if (this.$refs.linkAside.$refs[this.$refs.linkAside.dbInfo.name + '-table'].tableList.length > 10) {
              this.$refs.linkAside.$refs[this.$refs.linkAside.dbInfo.name + '-table'].tableList.push(mes)
            }
            this.$refs.linkAside.$refs[this.$refs.linkAside.dbInfo.name + '-table'].TableData[0].children.push(mes)

            break
          case 'stablecreated':
            this.$refs.linkAside.$refs[this.$refs.linkAside.dbInfo.name + '-stable'].superTableData[0].children.push(mes)
            break
          case 'tabledeleted':
            let beforeDelTableAll = this.$refs.linkAside.$refs[this.$refs.linkAside.dbInfo.name + '-table'].tableList
            if (beforeDelTableAll.length > 10) {
              let beforeDelTable = this.$refs.linkAside.$refs[this.$refs.linkAside.dbInfo.name + '-table'].TableData[0].children
              for (let i = 0; i < beforeDelTable.length; i++) {
                if (beforeDelTable[i].table_name == mes) {
                  this.$refs.linkAside.$refs[this.$refs.linkAside.dbInfo.name + '-table'].TableData[0].children.splice(i, 1)
                  break
                }
              }
              for (let i = 0; i < beforeDelTableAll.length; i++) {
                if (beforeDelTableAll[i].table_name == mes) {
                  this.$refs.linkAside.$refs[this.$refs.linkAside.dbInfo.name + '-table'].tableList.splice(i, 1)
                  break
                }
              }
            } else {
              let beforeDelTable = this.$refs.linkAside.$refs[this.$refs.linkAside.dbInfo.name + '-table'].TableData[0].children
              for (let i = 0; i < beforeDelTable.length; i++) {
                if (beforeDelTable[i].table_name == mes) {
                  this.$refs.linkAside.$refs[this.$refs.linkAside.dbInfo.name + '-table'].TableData[0].children.splice(i, 1)
                  break
                }
              }
            }
          case 'stabledeleted':
            let beforeDelSTable = this.$refs.linkAside.$refs[this.$refs.linkAside.dbInfo.name + '-stable'].superTableData[0].children
            for (let i = 0; i < beforeDelSTable.length; i++) {
              if (beforeDelSTable[i].name == mes) {
                this.$refs.linkAside.$refs[this.$refs.linkAside.dbInfo.name + '-stable'].superTableData[0].children.splice(i, 1)
                break
              }
            }
        }
      },
    },
  }
</script>
<style>
  .el-tabs__nav .el-tabs__item:nth-child(1) .el-icon-close {
    display: none;
  }
</style>

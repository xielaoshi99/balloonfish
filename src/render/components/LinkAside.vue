<template>
  <!-- 新建连接的弹窗 -->
  <el-dialog v-model="linkDialog" :title="linkDialogTitle" @close="cancelAddLink">
    <el-form :model="linkForm" class="linkformstyle" label-width="80px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="linkForm.name"></el-input>
      </el-form-item>
      <el-form-item label="主机" prop="host">
        <el-input v-model="linkForm.host"></el-input>
      </el-form-item>
      <el-form-item label="端口" prop="port">
        <el-input v-model="linkForm.port"></el-input>
      </el-form-item>
      <el-form-item label="用户名" prop="user">
        <el-input v-model="linkForm.user"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="linkForm.password"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="testLink" size="medium">测 试</el-button>
        <el-button @click="cancelAddLink" size="medium">取 消</el-button>
        <el-button type="primary" @click="confirmAddLink" size="medium">确 定</el-button>
      </span>
    </template>
  </el-dialog>

  <el-row>
    <el-button class="linkBtn" @click="linkDialog = true" size="small" type="primary" plain style="font-size: 14px">新建连接</el-button>
  </el-row>

  <!-- 右键菜单 -->
  <ContextMenu :menuVisible="menuVisible" :type="rightPanelType" :db="rightPanelDB" :links="links" :linkKey="linkKey" @addTab="addTab" @tableChanged="tableChanged" :table="rightTable"></ContextMenu>
  <div v-loading="loadingLinks">
    <el-menu @open="freshDB($event, false)" :unique-opened="false" class="menus">
      <el-submenu :index="String(index)" :key="index" v-for="(link, index) in links">
        <template #title>
          <span>{{ link.name }}</span>
          <el-tag type="success" size="mini" v-if="link.version">
            {{ link.version }}
          </el-tag>
          <div class="connection-opt-icons">
            <i title="用户管理" class="connection-right-icon fa fa-user-o font-weight-bold" @click.stop.prevent="editUser(index)"></i>
            <i title="刷新" class="connection-right-icon fa fa-refresh font-weight-bold" @click.stop.prevent="freshDB(index, true)"></i>
            <i title="编辑连接" class="connection-right-icon fa fa-edit font-weight-bold" @click.stop.prevent="editLink(index)"></i>
            <i title="删除连接" class="connection-right-icon fa fa-trash-o font-weight-bold" @click.stop.prevent="deleteLink(index)"></i>
          </div>
        </template>
        <el-table
          class="customer-no-border-table"
          :data="link.dbs"
          style="width: 100%"
          @expand-change="
            (row, expandedRows) => {
              dbTableExpand(row, expandedRows, link)
            }
          "
          :cell-class-name="rowClass"
          :show-header="false"
          @row-contextmenu="
            (row, column, event) => {
              rightClick(row, column, event, 'db', index)
            }
          "
        >
          <el-table-column type="expand" width="40" style="max-height: 300px">
            <template #default="props">
              <div>
                <STableTree
                  :db="props.row"
                  :ref="props.row.name + '-stable'"
                  :link="link"
                  @addTab="addTab"
                  @tableChanged="tableChanged"
                  @node-contextmenu="
                    (event, nodedata, node) => {
                      rightClick(node, nodedata, event, 'stable', index, props.row)
                    }
                  "
                ></STableTree>
                <TableTree
                  :db="props.row"
                  :ref="props.row.name + '-table'"
                  :link="link"
                  @addTab="addTab"
                  @tableChanged="tableChanged"
                  @node-contextmenu="
                    (event, nodedata, node) => {
                      rightClick(node, nodedata, event, 'table', index, props.row)
                    }
                  "
                ></TableTree>
              </div>
            </template>
          </el-table-column>
          <el-table-column>
            <template #default="props">
              <i class="fa fa-database"></i>
              {{ props.row.name }}
            </template>
          </el-table-column>
        </el-table>
      </el-submenu>
    </el-menu>
  </div>
</template>
<script>
  import { getVersion, showDatabases, createDatabase, dropDatabase, showSuperTables, showTables, dropTable } from '../utils/taosrestful'
  import { getLinks, AddALink, deleteALink } from '../utils/localDataStore'
  import { guid } from '../utils/funCommon'
  import STableTree from '../components/STableTree.vue'
  import TableTree from '../components/TableTree.vue'
  import ContextMenu from '../components/ContextMenu.vue'
  export default {
    name: 'LinkAside',
    components: {
      STableTree,
      TableTree,
      ContextMenu,
    },
    props: {},
    // 定义抛出的事件名称
    emits: ['tableChanged', 'addTabMain', 'linkChanged', 'postMessage'],

    data() {
      return {
        links: [],
        linkKey: 0,
        theLink: {}, //当前连接
        loadingLinks: false,
        linkDialog: false,
        linkDialogTitle: '新建连接',
        linkForm: {
          name: '',
          host: '',
          port: '6041',
          user: '',
          password: '',
        },
        menuVisible: false,
        rightPanelType: '',
        rightTable: {},
        rightPanelDB: {},
      }
    },
    mounted: function () {
      let links = getLinks()
      for (let i = 0, len = links.length; i < len; i++) {
        let payload = {
          host: links[i].host,
          port: links[i].port,
          user: links[i].user,
          password: links[i].password,
        }
        getVersion(payload).then((data) => {
          links[i].version = data
          this.$data.links = links
        })
      }
    },
    methods: {
      cancelAddLink() {
        this.linkForm = {
          name: '',
          host: '',
          port: '6041',
          user: '',
          password: '',
        }
        this.linkDialog = false
        this.linkDialogTitle = '新建连接'
      },
      editLink(index) {
        this.linkDialogTitle = '编辑连接'
        this.linkKey = index
        this.linkForm = {
          name: this.links[index].name,
          host: this.links[index].host,
          port: this.links[index].port,
          user: this.links[index].user,
          password: this.links[index].password,
        }
        this.linkDialog = true
      },
      testLink() {
        let payload = {
          host: this.linkForm.host,
          port: this.linkForm.port,
          user: this.linkForm.user,
          password: this.linkForm.password,
        }
        showDatabases(payload).then((data) => {
          if (data.res) {
            this.$message({
              message: '连接成功',
              type: 'success',
              duration: 1000,
            })
          } else {
            this.$message({
              message: '连接失败',
              type: 'error',
              duration: 1000,
            })
          }
        })
      },
      confirmAddLink() {
        let linkGuid = ''
        if (this.linkDialogTitle == '新建连接') {
          linkGuid = guid()
        } else {
          linkGuid = this.links[this.linkKey].id
        }
        let payload = {
          host: this.linkForm.host,
          port: this.linkForm.port,
          user: this.linkForm.user,
          password: this.linkForm.password,
        }
        showDatabases(payload).then((data) => {
          if (data.res) {
            getVersion(payload).then((_data) => {
              AddALink({
                id: linkGuid,
                name: this.linkForm.name || this.linkForm.host,
                host: this.linkForm.host,
                port: this.linkForm.port,
                user: this.linkForm.user,
                password: this.linkForm.password,
                version: _data,
              })
              this.linkDialog = false
              this.linkForm = {
                name: '',
                host: '',
                port: '',
                user: '',
                password: '',
              }
              if (this.linkDialogTitle != '新建连接') {
                for (let i = 0; i < this.links.length; i++) {
                  this.freshDB(i, false)
                }
              }
              this.$message({
                message: '连接成功',
                type: 'success',
                duration: 1000,
              })
              this.links = getLinks()
            })
          } else {
            //连接失败
            this.$message({
              message: '连接失败',
              type: 'error',
              duration: 1000,
            })
          }
        })
      },
      deleteLink(index) {
        this.$confirm('确定删除该连接？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(() => {
            deleteALink(index)
            this.$message({
              message: '删除成功',
              type: 'success',
              duration: 1000,
            })
            this.links = getLinks()
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除',
            })
          })
      },
      freshDB(key, mes) {
        let theLink = this.links[key]
        let payload = {
          host: theLink.host,
          port: theLink.port,
          user: theLink.user,
          password: theLink.password,
        }
        this.$emit('linkChanged', payload)
        this.loadingLinks = true
        showDatabases(payload).then((data) => {
          this.loadingLinks = false
          if (data.res) {
            if (mes) {
              this.$message({
                message: '刷新成功',
                type: 'success',
                duration: 1000,
              })
            }
            this.links[key].dbs = data.data
          } else {
            //连接失败，1.提示 2.删除当前连接 3.重新连接
            //1
            this.$message({
              message: data.msg,
              type: 'error',
              duration: 1000,
            })
            //2
            deleteALink(key)
            this.links = getLinks()
            //3
            this.$message({
              message: '尝试重新连接',
              type: 'warning',
              duration: 1000,
            })
            this.linkForm = {
              name: theLink.name,
              host: theLink.host,
              port: theLink.port,
              user: theLink.user,
              password: theLink.password,
            }
            this.linkDialog = true
          }
        })
      },
      alartDB(link, dbName) {
        //切换数据库前先清空表
        this.dbInfo = this.makeDbInfo(link.dbs, dbName)
        //记录进入的数据库
        this.theLink = link
        this.theDB = dbName
        this.$emit('tableChanged', {}, '', this.dbInfo)
      },
      makeDbInfo(dbs, dbName) {
        let info = {}
        dbs.forEach((item) => {
          if (item['name'] == dbName) {
            info = item
          }
        })
        return info
      },
      dbTableExpand(row, expandedRows, link) {
        this.alartDB(link, row.name)
      },
      //addTab方法中转站，承上启下
      addTab(newTabTitle, table, type, link) {
        let icon
        if (type == 'STableView') {
          icon = 'fa fa-sitemap'
        } else if (type == 'TableView') {
          icon = 'fa fa-table'
        } else if (type == 'QuerySQL') {
          icon = 'fa fa-terminal'
        } else if (type == 'CreateSTable' || type == 'CreateTable') {
          icon = 'fa fa-plus-circle'
        }
        this.$emit('addTabMain', newTabTitle, table, type, icon, link)
      },
      tableChanged(table, type, db) {
        this.$emit('tableChanged', table, type, db)
      },
      editUser(index) {
        if (this.links[index].user != 'root') {
          this.$message.warning('请使用root用户登录')
        } else {
          this.$emit('addTabMain', '用户管理', '', 'UserManage', 'fa fa-user', this.links[index])
        }
      },
      rowClass() {
        return 'dbCol'
      },
      postMessageToMain(mesType, mes) {
        this.$emit('postMessage', mesType, mes) //传出添加表成功的数据
      },
      rightClick(row, column, event, type, linkKey, father) {
        this.linkKey = linkKey
        //this.alartDB(link, row.name)
        this.theLink = this.links[linkKey]
        if (type != 'db') {
          if (column.children) {
            this.rightPanelDB = father
            this.rightPanelType = 'root' + type
          } else {
            this.rightTable = row.data
            this.rightPanelDB = father
            this.rightPanelType = type
          }
        } else {
          this.rightPanelType = type
          this.rightPanelDB = JSON.parse(JSON.stringify(row))
        }
        this.menuVisible = false // 先把模态框关死，目的是 第二次或者第n次右键鼠标的时候 它默认的是true
        this.menuVisible = true // 显示模态窗口，跳出自定义菜单栏
        event.preventDefault() //关闭浏览器右键默认事件
        var menu = document.querySelector('.menu1')
        this.styleMenu(menu)
      },
      foo() {
        // 取消鼠标监听事件 菜单栏
        this.menuVisible = false
        document.removeEventListener('click', this.foo) // 关掉监听，
      },
      styleMenu(menu) {
        if (event.clientX > 1800) {
          menu.style.left = event.clientX - 100 + 'px'
        } else {
          menu.style.left = event.clientX + 1 + 'px'
        }
        document.addEventListener('click', this.foo) // 给整个document新增监听鼠标事件，点击任何位置执行foo方法
        if (event.clientY > 700) {
          menu.style.top = event.clientY - 30 + 'px'
        } else {
          menu.style.top = event.clientY - 10 + 'px'
        }
      },
    },
  }
</script>
<style>
  .dbCol .cell {
    padding: 0px !important;
  }
  .dbCol {
    padding: 3px !important;
  }
  .menus {
    margin-top: 20px;
    overflow: auto;
    height: 600px;
  }
  .dbButtonGroup {
    font-size: 15px;
    height: 29px;
    line-height: 29px;
    padding-bottom: 5px;
  }
  .font-weight-bold {
    font-weight: bold;
  }
  .connection-right-icon {
    display: inline-block;
    font-size: 16px;
    /*font-weight: bold;*/
    padding: 3px;
    margin-right: 0px;
    transition: background 0.2s;
  }
  .connection-right-icon:hover {
    background: #dcdee0;
    border-radius: 3px;
  }
  .connection-opt-icons {
    position: absolute;
    right: 25px;
    top: -2px;
  }
  .el-submenu__icon-arrow {
    right: 10px !important;
  }
</style>

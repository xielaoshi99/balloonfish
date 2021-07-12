<template>
  <!-- 新建连接的弹窗 -->
  <el-dialog v-model="addLinkDialog" title="新建连接">
    <el-form :model="linkForm" :ref="linkForm" class="linkformstyle" label-width="80px">
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
  <div v-loading="loadingLinks">
    <el-row>
      <el-button class="linkBtn" @click="addLinkDialog = true" size="small" type="primary" plain>新建连接</el-button>
    </el-row>
    <el-menu @open="freshDB" :unique-opened="false">
      <el-submenu :index="String(index)" :key="index" v-for="(link, index) in links">
        <template #title>
          <span>{{ link.name }}</span>
          <el-tag type="success" size="mini" v-if="link.version">
            {{ link.version }}
          </el-tag>
        </template>
        <!-- 数据库层级 -->
        <!-- <el-form size="mini">
          <el-row>
            <el-col :span="24">
              <el-form-item label="请选择数据库：">
                <el-select style="width: 98%" v-model="selectedDbName" @change="alartDB(link, selectedDbName)" filterable default-first-option>
                  <el-option v-for="db in link.dbs" :key="db.name" :label="db.name" :value="db.name"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form> -->
        <el-table
          :data="link.dbs"
          style="width: 100%"
          size="mini"
          @expand-change="
            (row, expandedRows) => {
              dbTableExpand(row, expandedRows, link)
            }
          "
        >
          <el-table-column type="expand">
            <template>
              <el-tree :data="superTableData" :props="superTableTreeProps" @node-click="superTableNodeClick"></el-tree>
              <el-tree :data="TableData" :props="tableTreeProps" @node-click="tableNodeClick"></el-tree>
            </template>
          </el-table-column>
          <el-table-column prop="name"></el-table-column>
        </el-table>
      </el-submenu>
    </el-menu>
  </div>
</template>
<script>
  import { getVersion, showDatabases, createDatabase, dropDatabase, showSuperTables, showTables, dropTable } from '../utils/taosrestful'
  import { getLinks, AddALink, deleteALink } from '../utils/localDataStore'
  export default {
    name: 'LinkAside',
    props: {
      msg: String,
    },
    data() {
      return {
        superTableData: [
          {
            name: '',
            children: [],
          },
        ],
        TableData: [
          {
            table_name: '',
            children: [],
          },
        ],
        superTableTreeProps: {
          children: 'children',
          label: 'name',
        },
        tableTreeProps: {
          children: 'children',
          label: 'table_name',
        },

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
    mounted: function () {
      let links = getLinks()
      for (let i = 0, len = links.length; i < len; i++) {
        let payload = {
          ip: links[i].host,
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
        this.addLinkDialog = false
      },
      testLink() {
        let payload = {
          ip: this.linkForm.host,
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
            //连接失败
            this.$message({
              message: '连接失败',
              type: 'error',
              duration: 1000,
            })
          }
        })
      },
      confirmAddLink() {
        //新建连接，先连接，如果成功，将payload+name记入本地
        let payload = {
          ip: this.linkForm.host,
          port: this.linkForm.port,
          user: this.linkForm.user,
          password: this.linkForm.password,
        }
        showDatabases(payload).then((data) => {
          //处理返回的数据库数据
          if (data.res) {
            getVersion(payload).then((_data) => {
              //连接成功，保存到本地
              AddALink({
                name: this.linkForm.name || this.linkForm.host,
                host: this.linkForm.host,
                port: this.linkForm.port,
                user: this.linkForm.user,
                password: this.linkForm.password,
                version: _data,
              })
              //关闭新建连接的弹窗
              this.addLinkDialog = false
              //清空表单
              this.linkForm = {
                name: '',
                host: '',
                port: '',
                user: '',
                password: '',
              }
              //更新连接列表
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
      freshDB(key) {
        let theLink = this.links[key]
        let payload = {
          ip: theLink.host,
          port: theLink.port,
          user: theLink.user,
          password: theLink.password,
        }
        this.$emit('linkChanged', payload)
        this.loadingLinks = true
        showDatabases(payload).then((data) => {
          this.loadingLinks = false
          if (data.res) {
            this.$message({
              message: '刷新成功',
              type: 'success',
              duration: 1000,
            })
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
            this.addLinkDialog = true
          }
        })
      },
      alartDB(link, dbName) {
        //切换数据库前先清空表
        this.dbInfo = this.makeDbInfo(link.dbs, dbName)
        this.surperTables = []
        this.tables = []
        //记录进入的数据库
        this.theLink = link
        this.theDB = dbName
        //更新超级表页
        this.freshSurperTables()
        this.freshTables()
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
      freshSurperTables() {
        //清理超级表列表
        this.surperTables = []
        //清理选中的超级表和具体数据
        let payload = {
          ip: this.theLink.host,
          port: this.theLink.port,
          user: this.theLink.user,
          password: this.theLink.password,
        }
        this.loadingSurperList = true
        showSuperTables(this.theDB, payload).then((data) => {
          if (data.res) {
            this.surperTables = data.data
            this.superTableData[0].name = '超级表'
            this.superTableData[0].children = this.surperTables
          } else {
            this.$message({
              message: data.msg,
              type: 'error',
              duration: 1000,
            })
          }
          this.loadingSurperList = false
        })
      },
      freshTables() {
        //清理表列表
        this.tables = []
        let payload = {
          ip: this.theLink.host,
          port: this.theLink.port,
          user: this.theLink.user,
          password: this.theLink.password,
        }
        this.loadingTableList = true
        showTables(this.theDB, payload).then((data) => {
          if (data.res) {
            this.tables = data.data
            this.TableData[0].table_name = '表'
            this.TableData[0].children = this.tables
          } else {
            this.$message({
              message: data.msg,
              type: 'error',
              duration: 1000,
            })
          }
          this.loadingTableList = false
        })
      },
      superTableNodeClick(data) {
        if (data.created_time) {
          this.$emit('addTab', '超级表' + data.name + '@' + this.theDB + ' | ' + this.theLink.host + ':' + this.theLink.port, data.name, 'STableView')
        }
        this.$emit('tableChanged', data, 'super', this.dbInfo)
      },
      tableNodeClick(data) {
        if (data.uid) {
          this.$emit('addTab', '表' + data.table_name + '@' + this.theDB + ' | ' + this.theLink.host + ':' + this.theLink.port, data.table_name, 'TableView')
        }
        this.$emit('tableChanged', data, 'table', this.dbInfo)
      },
      dbTableExpand(row, expandedRows, link) {
        this.alartDB(this.link, row.name)
      },
    },
  }
</script>

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
            <template #default="props">
              <STableTree :db="props.row.name" :link="link" @addTab="addTab"></STableTree>
              <TableTree :db="props.row.name" :link="link" @addTab="addTab"></TableTree>
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
  import STableTree from '../components/STableTree.vue'
  import TableTree from '../components/TableTree.vue'
  export default {
    name: 'LinkAside',
    components: {
      STableTree,
      TableTree,
    },
    props: {
      msg: String,
    },
    data() {
      return {
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
      addTab(newTabTitle, table, type) {
        this.$emit('addTab', newTabTitle, table, type)
      },
    },
  }
</script>

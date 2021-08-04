<template>
  <div id="contextmenu" v-show="menuVisible" class="menu1">
    <!-- 数据库菜单部分 -->
    <div class="contextmenu__item" @click="addDB(db)" v-if="type == 'db'">
      <i class="fa fa-plus-circle"></i>
      新建数据库
    </div>
    <div class="contextmenu__item" @click="editDb(db)" v-if="type == 'db'">
      <i class="fa fa-edit"></i>
      编辑数据库
    </div>
    <div class="contextmenu__item" @click="runSQL(db)" v-if="type == 'db'">
      <i class="fa fa-terminal"></i>
      自定义SQL
    </div>
    <div class="contextmenu__item" @click="delDb(db)" v-if="type == 'db'">
      <i class="fa fa-trash-o"></i>
      删除数据库
    </div>
    <!-- 表菜单部分 -->
    <div class="contextmenu__item" @click="addTable(db)" v-if="type == 'table' || type == 'roottable'">
      <i class="fa fa-plus-circle"></i>
      添加表
    </div>
    <div class="contextmenu__item" @click="searchTable(db)" v-if="type == 'table' || type == 'roottable'">
      <i class="fa fa-search"></i>
      搜索表
    </div>
    <div class="contextmenu__item" @click="editTable(db)" v-if="type == 'table'">
      <i class="fa fa-edit"></i>
      编辑表
    </div>
    <div class="contextmenu__item" @click="delTable(db)" v-if="type == 'table'">
      <i class="fa fa-trash-o"></i>
      删除表
    </div>
    <!-- 超级表菜单部分 -->
    <div class="contextmenu__item" @click="addSTable(db)" v-if="type == 'rootstable' || type == 'stable'">
      <i class="fa fa-plus-circle"></i>
      添加超级表
    </div>
    <div class="contextmenu__item" @click="editSTable(db)" v-if="type == 'stable'">
      <i class="fa fa-edit"></i>
      编辑超级表
    </div>
    <div class="contextmenu__item" @click="delSTable(db)" v-if="type == 'stable'">
      <i class="fa fa-trash-o"></i>
      删除超级表
    </div>
  </div>
  <el-dialog v-model="dBDialog" :title="dBDialogTitle" @close="closeDBDialog" width="40%">
    <el-form label-width="150px" size="small">
      <el-form-item label="数据库名称" :rules="[{ required: true, message: '名称不能为空' }]">
        <el-input v-model="dBFrom.dBname" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="文件压缩度(comp)">
        <el-select v-model="dBFrom.dBcomp" placeholder="请选择" style="width: 100%">
          <el-option label="0" value="0"></el-option>
          <el-option label="1" value="1"></el-option>
          <el-option label="2" value="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="数据库副本数(replica)">
        <el-select v-model="dBFrom.dBreplica" placeholder="请选择" style="width: 100%">
          <el-option label="1" value="1"></el-option>
          <el-option label="2" value="2"></el-option>
          <el-option label="3" value="3"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="数据保留天数(keep)">
        <el-input-number v-model="dBFrom.dBkeep" :max="365000" controls-position="right" style="width: 100%"></el-input-number>
      </el-form-item>
      <el-form-item label="是否可更新">
        <el-switch class="dBswitchStyle" size="small" v-model="dBFrom.dBupdate"></el-switch>
      </el-form-item>
      <el-form-item label="写入确认数(quorum)">
        <el-select v-model="dBFrom.dBquorum" placeholder="请选择" style="width: 100%">
          <el-option label="1" value="1"></el-option>
          <el-option label="2" value="2"></el-option>
          <el-option label="3" value="3"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="blocks">
        <el-input-number v-model="dBFrom.dBblocks" :min="3" :max="1000" controls-position="right" style="width: 100%"></el-input-number>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDBDialog" size="medium">取 消</el-button>
        <el-button type="primary" @click="postDB" size="medium">确 定</el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog v-model="tableFormDialog" title="请选择创建表的方式" width="35%" @close="closeTableDialog">
    <el-radio-group v-model="addTableMethod">
      <p>
        <el-radio label="stable">以超级表作为模板</el-radio>
        <el-select v-model="templateStable" placeholder="请选择超级表" size="mini" style="width: 50%" :disabled="stableSelectDisabled">
          <el-option v-for="item in stableOptions" :key="item.name" :label="item.name" :value="item.name"></el-option>
        </el-select>
      </p>
      <p style="margin-top: 15px">
        <el-radio label="table">直接创建</el-radio>
      </p>
    </el-radio-group>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="realAddTable" size="mini">下一步</el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog v-model="searchFormDialog" title="搜索表" @close="closeSearchDialog" width="30%" :close-on-click-modal="false" top="30%">
    <el-select-v2 v-model="searchingTableName" filterable :options="tableOptions" placeholder="请输入表名" size="mini" />
    &nbsp;
    <el-button type="primary" @click="getSearchedTable(searchingTableName)" size="mini">确定</el-button>
  </el-dialog>
</template>
<script>
  import { createDatabase, dropDatabase, showTables, showSuperTables, disTable, dropTable } from '../utils/taosrestful'
  export default {
    name: 'ContextMenu',
    props: {
      menuVisible: Boolean,
      type: String,
      db: Object,
      links: Array,
      linkKey: Number,
      table: Object,
    },
    emits: ['addTab', 'tableChanged'],
    data() {
      return {
        dBDialog: false,
        dBDialogTitle: '',
        dBFrom: {
          dBname: '',
          dBcomp: '',
          dBreplica: '',
          dBkeep: 0,
          dBupdate: false,
          dBquorum: '',
          dBblocks: 0,
        },
        tableFormDialog: false,
        searchFormDialog: false,
        searchingTableName: '',
        tableOptions: [],
        stableOptions: [],
        addTableMethod: 'stable',
        stableSelectDisabled: false,
        templateStable: '',
      }
    },
    watch: {
      addTableMethod(val, oldVal) {
        if (val == 'table') {
          this.stableSelectDisabled = true
          this.templateStable = ''
        } else {
          this.stableSelectDisabled = false
        }
      },
    },
    methods: {
      addDB() {
        this.dBDialog = true
        this.dBDialogTitle = '添加数据库'
      },
      editDb(dbInfo) {
        this.dBDialog = true
        this.dBDialogTitle = '编辑数据库'
        this.dBFrom = {
          dBname: dbInfo.name,
          dBcomp: dbInfo.comp,
          dBreplica: dbInfo.replica,
          dBkeep: parseInt(dbInfo['keep0,keep1,keep(D)'].split(',')[0]),
          dBupdate: dbInfo.update,
          dBquorum: dbInfo.quorum,
          dBblocks: parseInt(dbInfo.blocks),
        }
      },
      delDb(dbInfo) {
        let payload = {
          host: this.links[this.linkKey].host,
          port: this.links[this.linkKey].port,
          user: this.links[this.linkKey].user,
          password: this.links[this.linkKey].password,
        }
        this.$confirm('此操作将永久删除数据库' + dbInfo.name + ', 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(() => {
            dropDatabase(dbInfo.name, payload).then((data) => {
              if (data.res) {
                //成功
                this.$message({
                  message: '删除成功',
                  type: 'success',
                  duration: 1000,
                })
                this.$parent.freshDB(this.linkKey)
              } else {
                this.$message({
                  message: data.msg,
                  type: 'error',
                  duration: 1000,
                })
              }
              this.loadingLinks = false
              this.freshDB(key)
            })
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除',
            })
          })
      },
      closeDBDialog() {
        this.dBDialog = false
        this.dBFrom = {
          dBname: '',
          dBcomp: '',
          dBreplica: '',
          dBkeep: 0,
          dBupdate: false,
          dBquorum: '',
          dBblocks: 0,
        }
      },
      postDB() {
        let payload = {
          host: this.links[this.linkKey].host,
          port: this.links[this.linkKey].port,
          user: this.links[this.linkKey].user,
          password: this.links[this.linkKey].password,
        }
        if (this.dBDialogTitle == '添加数据库') {
          createDatabase(this.dBFrom.dBname, payload, true, this.dBFrom.dBkeep, this.dBFrom.dBupdate, this.dBFrom.dBcomp, this.dBFrom.dBreplica, this.dBFrom.dBquorum, this.dBFrom.dBblocks).then((data) => {
            if (data.res) {
              this.$message({
                message: '添加成功',
                type: 'success',
                duration: 1000,
              })
              this.$parent.freshDB(this.linkKey)
              this.closeDBDialog()
            } else {
              this.$message({
                message: data.msg,
                type: 'error',
                duration: 1000,
              })
            }
          })
        } else if (this.dBDialogTitle == '编辑数据库') {
          alert('编辑模式待开发！')
        }
      },
      addTable(dbInfo) {
        this.tableFormDialog = true
        let payload = {
          host: this.links[this.linkKey].host,
          port: this.links[this.linkKey].port,
          user: this.links[this.linkKey].user,
          password: this.links[this.linkKey].password,
        }
        showSuperTables(dbInfo.name, payload).then((data) => {
          if (data.res) {
            let stableCollect = data.data
            this.stableOptions = stableCollect
          } else {
            this.$message({
              message: data.msg,
              type: 'error',
              duration: 1000,
            })
          }
        })
      },
      realAddTable() {
        if (this.addTableMethod === 'stable') {
          let payload = {
            host: this.links[this.linkKey].host,
            port: this.links[this.linkKey].port,
            user: this.links[this.linkKey].user,
            password: this.links[this.linkKey].password,
          }
          let stAndTagName = {
            stname: this.templateStable,
            tableTagName: [],
          }
          disTable(this.templateStable, this.db.name, payload).then((data) => {
            if (data.res) {
              let stableDescribe = data.data
              for (let i = 0; i < stableDescribe.length; i++) {
                if (stableDescribe[i].Note == 'TAG') {
                  stAndTagName.tableTagName.push({
                    name: stableDescribe[i].Field,
                    type: stableDescribe[i].Type,
                  })
                }
              }
              this.tableFormDialog = false
              this.$emit('addTab', ' 创建表-根据模板', stAndTagName, 'CreateTableWithTemp', this.links[this.linkKey])
            } else {
              this.$message({
                message: data.msg,
                type: 'error',
                duration: 1000,
              })
            }
          })
        } else {
          this.tableFormDialog = false
          this.$emit('addTab', ' 创建表-直接创建', this.db, 'CreateTable', this.links[this.linkKey])
        }
      },
      addSTable(dbInfo) {
        this.$emit('addTab', ' 创建超级表', dbInfo, 'CreateSTable', this.links[this.linkKey])
      },
      searchTable(dbInfo) {
        let payload = {
          host: this.links[this.linkKey].host,
          port: this.links[this.linkKey].port,
          user: this.links[this.linkKey].user,
          password: this.links[this.linkKey].password,
        }
        showTables(dbInfo.name, payload).then((data) => {
          if (data.res) {
            let tableCollect = data.data
            for (let i = 0; i < tableCollect.length; i++) {
              tableCollect[i].label = tableCollect[i].value = tableCollect[i].table_name
            }
            this.tableOptions = tableCollect
            this.searchFormDialog = true
          } else {
            this.$message({
              message: data.msg,
              type: 'error',
              duration: 1000,
            })
          }
        })
      },
      getSearchedTable(name) {
        let data = {}
        for (let i = 0; i < this.tableOptions.length; i++) {
          if (name == this.tableOptions[i].table_name) {
            data = this.tableOptions[i]
            this.searchFormDialog = false
            this.$emit('addTab', ' 表 ' + data.table_name + '@' + this.db.name + ' | ' + this.links[this.linkKey].host + ':' + this.links[this.linkKey].port, data, 'TableView', this.links[this.linkKey])
            break
          }
        }
      },
      editSTable(dbInfo) {
        alert('编辑功能待开发！')
      },
      delSTable(dbInfo) {
        this.$confirm('此操作将永久删除超级表' + this.table.name + '，所属表及所有数据也将会一并删除！是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(() => {
            let payload = {
              host: this.links[this.linkKey].host,
              port: this.links[this.linkKey].port,
              user: this.links[this.linkKey].user,
              password: this.links[this.linkKey].password,
            }
            dropTable(this.table.name, dbInfo.name, payload).then((data) => {
              if (data.res) {
                this.$message({
                  type: 'success',
                  message: '删除成功!',
                })
              } else {
                this.$message({
                  message: data.msg,
                  type: 'error',
                  duration: 1000,
                })
              }
            })
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除',
            })
          })
      },
      editTable(dbInfo) {
        alert('编辑功能待开发！')
      },
      delTable(dbInfo) {
        this.$confirm('此操作将永久删除表' + this.table.table_name + '及其所有数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(() => {
            let payload = {
              host: this.links[this.linkKey].host,
              port: this.links[this.linkKey].port,
              user: this.links[this.linkKey].user,
              password: this.links[this.linkKey].password,
            }
            dropTable(this.table.table_name, dbInfo.name, payload).then((data) => {
              if (data.res) {
                this.$message({
                  type: 'success',
                  message: '删除成功!',
                })
              } else {
                this.$message({
                  message: data.msg,
                  type: 'error',
                  duration: 1000,
                })
              }
            })
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除',
            })
          })
      },
      closeSearchDialog() {
        this.searchFormDialog = false
        this.searchingTableName = ''
      },
      closeTableDialog() {
        this.tableFormDialog = false
        this.templateStable = ''
        this.addTableMethod = 'stable'
      },
      runSQL(dbInfo) {
        this.$emit('addTab', ' 自定义SQL@' + dbInfo.name, dbInfo, 'QuerySQL', this.links[this.linkKey])
      },
    },
  }
</script>
<style scoped>
  .contextmenu__item {
    display: block;
    line-height: 30px;
    text-align: center;
  }
  .contextmenu__item:not(:last-child) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
  .menu1 {
    position: absolute;
    background-color: #fff;
    width: 100px;
    /*height: 106px;*/
    font-size: 13px;
    color: #444040;
    border-radius: 4px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    border-radius: 3px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
    white-space: nowrap;
    z-index: 1000;
  }
  .contextmenu__item:hover {
    cursor: pointer;
    background: #66b1ff;
    border-color: #66b1ff;
    color: #fff;
  }
</style>

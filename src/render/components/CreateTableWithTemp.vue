<template>
  <el-card class="box-card" style="margin-bottom: 20px">
    <template #header>
      <div class="card-header">
        <i class="fa fa-database"></i>
        <span>{{ ' 数据库：' + table.dbname }}</span>
        <i class="fa fa-sitemap" style="margin-left: 20px"></i>
        <span>{{ ' 超级表：' + table.stname }}</span>
      </div>
    </template>
    <el-button type="success" @click="saveColumnData()" size="mini">保存</el-button>
    <el-table size="mini" :data="columnData" border height="400" style="width: 100%; margin-top: 10px" @cell-click="editColumnData">
      <el-table-column prop="tagName" label="TAG名称"></el-table-column>
      <el-table-column prop="tagType" label="TAG类型"></el-table-column>
      <el-table-column prop="tagValue" label="TAG值">
        <template v-slot="scope">
          <span v-if="scope.row.isEdit">
            <el-input v-model="scope.row.tagValue" size="mini"></el-input>
          </span>
          <span v-else>{{ scope.row.tagValue }}</span>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>
<script>
  import { createTablesWithTemp, showSingleTable } from '../utils/taosrestful'
  export default {
    name: 'CreateTableWithTemp',
    props: {
      table: Object, //这里的table，实际上是数据库名、超级表名和tag组成的对象
      dbname: String, //无用
      link: Object,
    },
    emits: ['postMessage'],
    data() {
      return {
        columnData: [],
      }
    },
    created() {
      for (let i = 0; i < this.table.tableTagName.length; i++) {
        this.columnData.push({
          tagName: this.table.tableTagName[i].name,
          tagType: this.table.tableTagName[i].type,
          tagValue: '',
        })
      }
    },
    methods: {
      editColumnData(row, column, cell, event) {
        for (let i = 0; i < this.columnData.length; i++) {
          this.columnData[i].isEdit = false
        }
        if (!row.isEdit) {
          row.isEdit = true
        }
      },
      saveColumnData() {
        if (this.checkColumnData()) {
          this.$prompt('请输入表名', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            // inputPattern: /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
            // inputErrorMessage: '表名格式不正确',
          }).then(({ value }) => {
            for (let i = 0; i < this.columnData.length; i++) {
              this.columnData[i].isEdit = false
            }
            let payload = {
              host: this.link.host,
              port: this.link.port,
              user: this.link.user,
              password: this.link.password,
            }
            createTablesWithTemp(this.table.dbname, payload, this.columnData, value, this.table.stname).then((data) => {
              if (data.res == true) {
                showSingleTable(this.table.dbname, value, payload).then((singleTable) => {
                  this.$emit('postMessage', 'tablecreated', singleTable.data[0]) //传出添加表成功的数据
                  this.$message({
                    type: 'success',
                    message: '表' + value + '创建成功！',
                  })
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
        }
      },
      checkColumnData() {
        for (let i = 0; i < this.columnData.length; i++) {
          if (this.columnData[i].tagValue == '') {
            this.$message('不能有空tag值！')
            return false
          }
        }
        return true
      },
    },
  }
</script>

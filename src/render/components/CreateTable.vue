<template>
  <el-card class="box-card" style="margin-bottom: 20px">
    <template #header>
      <div class="card-header">
        <i class="fa fa-database"></i>
        <span>{{ ' 数据库：' + table.name }}</span>
      </div>
    </template>
    <el-button type="success" @click="saveColumnData()" size="mini">保存</el-button>
    <el-button type="success" @click="AddColumnData()" size="mini">添加字段</el-button>
    <el-table size="mini" :data="columnData" border height="400" style="width: 100%; margin-top: 10px" @cell-click="editColumnData">
      <el-table-column prop="name" label="字段名称">
        <template v-slot="scope">
          <span v-if="scope.row.isEdit">
            <el-input v-model="scope.row.name" size="mini"></el-input>
          </span>
          <span v-else>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="数据类型">
        <template v-slot="scope">
          <span v-if="scope.row.isEdit && scope.row.type != 'timestamp'">
            <el-select v-model="scope.row.type" size="mini" placeholder="请选择数据类型">
              <el-option v-for="item in dataTypeO" :key="item" :label="item" :value="item"></el-option>
            </el-select>
          </span>
          <span v-else>{{ scope.row.type }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="length" label="长度">
        <template v-slot="scope">
          <span v-if="scope.row.isEdit && scope.row.type != 'timestamp'">
            <el-input v-model="scope.row.length" size="mini"></el-input>
          </span>
          <span v-else>{{ scope.row.length }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template v-slot="scope">
          <el-button v-if="scope.row.type != 'timestamp'" type="text" size="mini" @click="delColumnData(scope.$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>
<script>
  import { dataTypeOption } from '../utils/options'
  import { createTables } from '../utils/taosrestful'
  export default {
    name: 'CreateTable',
    props: {
      table: Object, //这里的table，实际上是数据库
      dbname: String, //数据库名,无用
      link: Object,
    },
    data() {
      return {
        columnData: [
          {
            name: 'ts',
            type: 'timestamp',
            isEdit: true,
          },
        ],
        dataTypeO: [],
      }
    },
    created() {
      this.dataTypeO = dataTypeOption
    },
    methods: {
      AddColumnData() {
        for (let i = 0; i < this.columnData.length; i++) {
          this.columnData[i].isEdit = false
        }
        this.columnData.push({
          name: '',
          type: '',
          isEdit: true,
        })
      },
      editColumnData(row, column, cell, event) {
        if (column.label != '操作') {
          for (let i = 0; i < this.columnData.length; i++) {
            this.columnData[i].isEdit = false
          }
          if (!row.isEdit) {
            row.isEdit = true
          }
        }
      },
      delColumnData(index) {
        this.columnData.splice(index, 1)
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
            createTables(this.table.name, payload, this.columnData, value).then((data) => {
              if (data.res == true) {
                this.$message({
                  type: 'success',
                  message: '表' + value + '创建成功！',
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
        if (this.columnData.length == 1) {
          this.$message('请添加除时间戳之外的字段！')
          return false
        }
        for (let i = 0; i < this.columnData.length; i++) {
          if (this.columnData[i].name == '') {
            this.$message('不能有空字段名！')
            return false
          }
        }
        return true
      },
    },
  }
</script>

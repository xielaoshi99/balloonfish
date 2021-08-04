<template>
  <el-tree :data="TableData" @node-click="tableNodeClick">
    <template v-slot="{ data }">
      <span>
        <i :class="data.icon"></i>
        {{ data.table_name }}
      </span>
    </template>
  </el-tree>
</template>
<script>
  import { showTables } from '../utils/taosrestful'
  export default {
    name: 'TableTree',
    props: {
      db: Object,
      link: Object,
    },
    data() {
      return {
        TableData: [
          {
            table_name: '',
            children: [],
          },
        ],
        tableList: [],
        lastNum: 10,
      }
    },
    created() {},
    mounted: function (e) {
      this.freshTables()
    },
    methods: {
      freshTables() {
        let payload = {
          host: this.link.host,
          port: this.link.port,
          user: this.link.user,
          password: this.link.password,
        }
        if (this.db.name) {
          showTables(this.db.name, payload).then((data) => {
            if (data.res) {
              this.TableData[0].table_name = '表'
              this.tableList = data.data
              this.lastNum = 10
              if (data.data.length > 10) {
                this.TableData[0].children = this.tableList.slice(0, 10)
                this.TableData[0].children.push({ table_name: '更多...' })
              } else {
                this.TableData[0].children = this.tableList
              }
              this.TableData[0].icon = 'fa fa-table'
            } else {
              this.$message({
                message: data.msg,
                type: 'error',
                duration: 1000,
              })
            }
          })
        }
      },
      tableNodeClick(data) {
        if (data.uid) {
          this.$emit('addTab', ' 表 ' + data.table_name + '@' + this.db.name + ' | ' + this.link.host + ':' + this.link.port, data, 'TableView', this.link)
        }
        if (data.table_name == '更多...') {
          this.TableData[0].children.pop()
          this.lastNum += 10
          this.TableData[0].children = this.tableList.slice(0, this.lastNum)
          this.TableData[0].children.push({ table_name: '更多...' })
        }
        this.$emit('tableChanged', data, 'table', this.db)
      },
    },
  }
</script>
<style>
  .el-tree-node__children {
    max-height: 350px;
    overflow-y: auto !important;
    overflow-x: hidden;
  }
</style>

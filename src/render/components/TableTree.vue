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
      }
    },
    mounted: function () {
      this.freshTables()
    },
    methods: {
      freshTables() {
        let payload = {
          ip: this.link.host,
          port: this.link.port,
          user: this.link.user,
          password: this.link.password,
        }
        if (this.db.name) {
          showTables(this.db.name, payload).then((data) => {
            if (data.res) {
              this.tables = data.data
              this.TableData[0].table_name = '表'
              this.TableData[0].children = this.tables
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
          this.$emit('addTab', ' 表 ' + data.table_name + '@' + this.db.name + ' | ' + this.link.host + ':' + this.link.port, data.table_name, 'TableView')
        }
        this.$emit('tableChanged', data, 'table', this.db)
      },
    },
  }
</script>

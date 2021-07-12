<template>
  <el-tree :data="superTableData" :props="superTableTreeProps" @node-click="superTableNodeClick"></el-tree>
</template>
<script>
  import { showSuperTables } from '../utils/taosrestful'
  export default {
    name: 'STableTree',
    props: {
      db: String,
      link: Object,
    },
    data() {
      return {
        superTableTreeProps: {
          children: 'children',
          label: 'name',
        },
        superTableData: [
          {
            name: '',
            children: [],
          },
        ],
      }
    },
    mounted: function () {
      this.freshSurperTables()
    },
    methods: {
      superTableNodeClick(data) {
        console.log(data)
      },
      freshSurperTables() {
        //清理选中的超级表和具体数据
        let payload = {
          ip: this.link.host,
          port: this.link.port,
          user: this.link.user,
          password: this.link.password,
        }
        if (this.db) {
          showSuperTables(this.db, payload).then((data) => {
            if (data.res) {
              this.superTableData[0].name = '超级表'
              this.superTableData[0].children = data.data
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
      superTableNodeClick(data) {
        if (data.created_time) {
          this.$emit('addTab', '超级表' + data.name + '@' + this.db + ' | ' + this.link.host + ':' + this.link.port, data.name, 'STableView')
        }
        this.$emit('tableChanged', data, 'super', this.dbInfo)
      },
    },
  }
</script>

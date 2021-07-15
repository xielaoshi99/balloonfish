<template>
  <el-tree
    :data="superTableData"
    @node-click="superTableNodeClick"
    @node-contextmenu="
      (event, nodedata, node) => {
        rightClick(node, nodedata, event, 'stable')
      }
    "
  >
    <template v-slot="{ data }">
      <span>
        <i :class="data.icon"></i>
        {{ data.name }}
      </span>
    </template>
  </el-tree>
</template>
<script>
  import { showSuperTables } from '../utils/taosrestful'
  export default {
    name: 'STableTree',
    props: {
      db: Object,
      link: Object,
    },
    data() {
      return {
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
      freshSurperTables() {
        //清理选中的超级表和具体数据
        let payload = {
          ip: this.link.host,
          port: this.link.port,
          user: this.link.user,
          password: this.link.password,
        }
        if (this.db.name) {
          showSuperTables(this.db.name, payload).then((data) => {
            if (data.res) {
              this.superTableData[0].name = '超级表'
              this.superTableData[0].children = data.data
              this.superTableData[0].icon = 'fa fa-sitemap'
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
          this.$emit('addTab', ' 超级表 ' + data.name + '@' + this.db.name + ' | ' + this.link.host + ':' + this.link.port, data, 'STableView')
        }
        this.$emit('tableChanged', data, 'super', this.db)
      },
      rightClick(row, column, event, type) {},
    },
  }
</script>

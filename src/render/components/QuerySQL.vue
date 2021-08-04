<template>
  <div class="in-coder-panel">
    <!-- <span>
      <i class="fa fa-database"></i>
      {{ '当前数据库： ' + table.name }}
    </span> -->
    <span>
      <el-button size="medium" @click="runSQL">运行</el-button>
      <el-button size="medium">美化</el-button>
      <el-button size="medium">保存</el-button>
    </span>
    <textarea class="sqlEditor" ref="textarea"></textarea>
    <vxe-table :data="sqlResult" size="mini" border height="300" style="width: 100%; margin-top: 20px">
      <vxe-table-column fixed="left" v-if="consoleResultLabel[0]" :field="consoleResultLabel[0]" :title="consoleResultLabel[0]" width="200"></vxe-table-column>
      <vxe-table-column v-for="(data, index) in consoleResultLabel.slice(1)" :key="index" :field="data" :title="data" width="180"></vxe-table-column>
    </vxe-table>
  </div>
</template>

<script>
  import { rawSqlWithDB } from '../utils/taosrestful'
  import _CodeMirror from 'codemirror'
  import 'codemirror/lib/codemirror.css'
  import 'codemirror/theme/dracula.css'
  import 'codemirror/mode/sql/sql.js'
  const CodeMirror = window.CodeMirror || _CodeMirror
  export default {
    name: 'QuerySQL',
    props: {
      table: Object,
      dbname: String,
      link: Object,
    },

    data() {
      return {
        coder: null,
        options: {
          tabSize: 2,
          theme: 'dracula',
          lineNumbers: true,
          line: true,
          mode: 'text/x-sql',
        },
        sqlResult: [],
        consoleResultLabel: [],
      }
    },
    mounted() {
      this.coder = CodeMirror.fromTextArea(this.$refs.textarea, this.options)
      this.coder.on('change', (coder) => {
        this.code = coder.getValue()
        if (this.$emit) {
          this.$emit('input', this.code)
        }
      })
    },
    methods: {
      handelLoadmore(currentStartIndex, currentEndIndex) {
        this.currentStartIndex = currentStartIndex
        this.currentEndIndex = currentEndIndex
      },
      runSQL() {
        let payload = {
          host: this.link.host,
          port: this.link.port,
          user: this.link.user,
          password: this.link.password,
        }
        console.log(this.code)
        rawSqlWithDB(this.code, this.table.name, payload).then((data) => {
          if (data.res == true) {
            console.log(data.data)
            this.sqlResult = data.data
            this.consoleResultLabel = Object.keys(data.data[0])
          } else {
            this.$message({
              message: data.msg,
              type: 'error',
              duration: 1000,
            })
          }
        })
      },
    },
  }
</script>

<style>
  .CodeMirror {
    margin-top: 10px;
    height: 200px;
  }
</style>

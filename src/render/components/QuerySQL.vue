<template>
  <div class="in-coder-panel">
    <!-- <span>
      <i class="fa fa-database"></i>
      {{ '当前数据库： ' + table.name }}
    </span> -->
    <span>
      <el-button size="medium">运行</el-button>
      <el-button size="medium">美化</el-button>
      <el-button size="medium">保存</el-button>
    </span>
    <textarea class="sqlEditor" ref="textarea"></textarea>
  </div>
</template>

<script>
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
  }
</script>

<style>
  .CodeMirror {
    margin-top: 10px;
  }
</style>

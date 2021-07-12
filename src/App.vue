<template>
  <!-- 添加数据库的弹窗 -->

  <el-container class="main">
    <el-container class="mainContent">
      <el-aside class="linksMenu">
        <Aside></Aside>
      </el-aside>
    </el-container>
  </el-container>
</template>

<script>
  import HelloWorld from './components/HelloWorld.vue'
  import Aside from './components/Aside.vue'
  export default {
    name: 'App',
    components: {
      HelloWorld,
      Aside,
    },

    data() {
      return {
        selectedDbName: '',
        superTableData: [],
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
    methods: {},
  }
</script>

<template>
  <div>
    <el-row :gutter="12" class="el-row" style="margin-bottom: 20px">
      <el-col :span="18">
        <el-card shadow="hover" style="height: 100%">
          <p>{{ yiYan }}</p>
          <p style="text-align: right">{{ yiYanAuthor }}</p>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" style="height: 100%">
          <p style="text-align: center">{{ date }}</p>
          <p style="text-align: center">{{ time }}</p>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="12" class="el-row">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <span style="font-size: 15px">关于软件</span>
          </template>
          <div class="softInfo">
            <img src="../assets/icon.png" width="200" />
            <p>BalloonFish（河豚）版本：1.0</p>
            <p>一款基于electron+vue3+vite2.0的TDengine时序库可视化管理工具</p>
            <p>By xielaoshi</p>
            <el-button type="text" @click="viewLib">查看组件版本</el-button>
            <el-button type="text" @click="gobaidu">项目源码</el-button>
            <el-button type="text" @click="gobaidu">检查更新</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import axios from 'axios'
  import electron from 'electron'
  export default {
    name: 'Welcome',
    props: {
      tabledata: Object,
      type: String,
      dbdata: Object,
    },
    data() {
      return {
        yiYan: '',
        date: '',
        time: '',
      }
    },
    created() {
      this.getYiYan()
      this.getTime()
    },
    methods: {
      async getYiYan() {
        let res = await axios.get(`https://v1.hitokoto.cn/`)
        console.log(res.data)
        this.yiYan = res.data.hitokoto
        this.yiYanAuthor = '——' + (res.data.from_who || '') + '《' + res.data.from + '》'
      },
      getTime() {
        var weekday = new Array(7)
        weekday[0] = '星期日'
        weekday[1] = '星期一'
        weekday[2] = '星期二'
        weekday[3] = '星期三'
        weekday[4] = '星期四'
        weekday[5] = '星期五'
        weekday[6] = '星期六'
        setInterval(() => {
          let nowDate = new Date()
          let monthStr = '0' + (nowDate.getMonth() * 1 + 1)
          let dayStr = '0' + nowDate.getDate()
          let wd = weekday[nowDate.getDay()]
          let hh = '0' + nowDate.getHours()
          let mm = '0' + nowDate.getMinutes()
          let ss = '0' + nowDate.getSeconds()
          this.date = nowDate.getFullYear() + '年' + this.shorter(monthStr) + '月' + this.shorter(dayStr) + '日 ' + wd
          this.time = this.shorter(hh) + ':' + this.shorter(mm) + ':' + this.shorter(ss)
        }, 1000)
      },
      shorter(inStr) {
        return inStr.substring(inStr.length - 2)
      },
      viewLib() {
        this.$notify.info({
          title: '依赖版本',
          dangerouslyUseHTMLString: true,
          message: '<div>' + '<p>vue：3.1.2</p>' + '<p>element-plus：1.0.2</p>' + '<p>electron：13.1.6</p>' + '<p>Chromium：91.0.2</p>' + '<p>Node.js：14.16.0</p>' + '</div>',
          position: 'bottom-right',
        })
      },
      gobaidu() {
        const shell = electron.shell
        shell.openExternal('http://www.baidu.com')
      },
    },
  }
</script>
<style>
  .el-row {
    display: flex;
    flex-wrap: wrap;
  }
  .softInfo {
    text-align: center;
  }
  .softInfo p {
    font-size: 16px;
    line-height: 18px;
  }
</style>

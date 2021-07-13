<template>
  <div v-if="type == 'table' && tabledata.uid">
    <p>-----表属性-----</p>
    <p>uid：{{ tabledata.uid }}</p>
    <p>当前表名：{{ tabledata.table_name }}</p>
    <p>创建时间：{{ tabledata.created_time }}</p>
    <p>所属超级表：{{ tabledata.stable_name }}</p>
  </div>
  <div v-else-if="type == 'super' && tabledata.created_time">
    <p>-----超级表属性-----</p>
    <p>超级表名：{{ tabledata.name }}</p>
    <p>创建时间：{{ tabledata.created_time }}</p>
    <p>表个数：{{ tabledata.tables }}</p>
  </div>
  <div>
    <p>-----数据库属性-----</p>
    <p>数据库名：{{ dbdata.name }}</p>
    <p>创建时间：{{ dbdata.created_time }}</p>
    <p>表个数：{{ dbdata.ntables }}</p>
    <p>文件压缩度：{{ dbdata.comp }}</p>
    <p>数据库副本数：{{ dbdata.replica }}</p>
    <p>写入确认数：{{ dbdata.quorum }}</p>
  </div>
</template>

<script>
  export default {
    name: 'InfoAside',
    props: {
      tabledata: Object,
      type: String,
      dbdata: Object,
    },
    data() {
      return {
        name: 0,
      }
    },
  }
</script>

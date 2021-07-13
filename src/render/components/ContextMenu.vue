<template>
  <div id="contextmenu" v-show="menuVisible" class="menu1">
    <!-- 数据库菜单部分 -->
    <div class="contextmenu__item" @click="addDb(db)" v-if="type == 'db'">
      <i class="fa fa-plus-circle"></i>
      新建数据库
    </div>
    <div class="contextmenu__item" @click="editDb(db)" v-if="type == 'db'">
      <i class="fa fa-edit"></i>
      编辑数据库
    </div>
    <div class="contextmenu__item" @click="runSQL(db)" v-if="type == 'db'">
      <i class="fa fa-terminal"></i>
      自定义SQL
    </div>
    <div class="contextmenu__item" @click="delDb(db)" v-if="type == 'db'">
      <i class="fa fa-trash-o"></i>
      删除数据库
    </div>
    <!-- 表菜单部分 -->
    <div
      class="contextmenu__item"
      @click="addTable(CurrentRow)"
      v-if="type == 'table'"
    >
      <i class="fa fa-plus-circle"></i>
      添加表
    </div>
    <div
      class="contextmenu__item"
      @click="delTable(CurrentRow)"
      v-if="type == 'table'"
    >
      <i class="fa fa-trash-o"></i>
      删除表
    </div>
    <!-- 超级表菜单部分 -->
    <div
      class="contextmenu__item"
      @click="delTable(CurrentRow)"
      v-if="type == 'stable'"
    >
      <i class="fa fa-plus-circle"></i>
      添加超级表
    </div>
    <div
      class="contextmenu__item"
      @click="delSTable(CurrentRow)"
      v-if="type == 'stable'"
    >
      <i class="fa fa-trash-o"></i>
      删除超级表
    </div>
  </div>
</template>
<script>
import {
  getVersion,
  showDatabases,
  createDatabase,
  dropDatabase,
  showSuperTables,
  showTables,
  dropTable,
} from "../utils/taosrestful";
export default {
  name: "ContextMenu",
  props: {
    menuVisible: Boolean,
    type: String,
    db: Object,
  },
};
</script>
<style scoped>
.contextmenu__item {
  display: block;
  line-height: 30px;
  text-align: center;
}
.contextmenu__item:not(:last-child) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
.menu1 {
  position: absolute;
  background-color: #fff;
  width: 100px;
  /*height: 106px;*/
  font-size: 13px;
  color: #444040;
  border-radius: 4px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
  white-space: nowrap;
  z-index: 1000;
}
.contextmenu__item:hover {
  cursor: pointer;
  background: #66b1ff;
  border-color: #66b1ff;
  color: #fff;
}
</style>

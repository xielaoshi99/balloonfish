<template>
  <div id="contextmenu" v-show="menuVisible" class="menu1">
    <!-- 数据库菜单部分 -->
    <div class="contextmenu__item" @click="addDB(db)" v-if="type == 'db'">
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
    <div class="contextmenu__item" @click="addTable(CurrentRow)" v-if="type == 'table'">
      <i class="fa fa-plus-circle"></i>
      添加表
    </div>
    <div class="contextmenu__item" @click="delTable(CurrentRow)" v-if="type == 'table'">
      <i class="fa fa-trash-o"></i>
      删除表
    </div>
    <!-- 超级表菜单部分 -->
    <div class="contextmenu__item" @click="delTable(CurrentRow)" v-if="type == 'stable'">
      <i class="fa fa-plus-circle"></i>
      添加超级表
    </div>
    <div class="contextmenu__item" @click="delSTable(CurrentRow)" v-if="type == 'stable'">
      <i class="fa fa-trash-o"></i>
      删除超级表
    </div>
  </div>
  <el-dialog v-model="dBDialog" :title="dBDialogTitle" @close="closeDBDialog">
    <el-form label-width="150px" size="small">
      <el-form-item label="数据库名称" :rules="[{ required: true, message: '名称不能为空' }]">
        <el-input v-model="dBFrom.dBname" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="文件压缩度(comp)">
        <el-select v-model="dBFrom.dBcomp" placeholder="请选择">
          <el-option label="0" value="0"></el-option>
          <el-option label="1" value="1"></el-option>
          <el-option label="2" value="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="数据库副本数(replica)">
        <el-select v-model="dBFrom.dBreplica" placeholder="请选择">
          <el-option label="1" value="1"></el-option>
          <el-option label="2" value="2"></el-option>
          <el-option label="3" value="3"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="数据保留天数(keep)">
        <el-input-number v-model="dBFrom.dBkeep" :max="365000" controls-position="right"></el-input-number>
      </el-form-item>
      <el-form-item label="是否可更新">
        <el-switch class="dBswitchStyle" size="small" v-model="dBFrom.dBupdate"></el-switch>
      </el-form-item>
      <el-form-item label="写入确认数(quorum)">
        <el-select v-model="dBFrom.dBquorum" placeholder="请选择">
          <el-option label="1" value="1"></el-option>
          <el-option label="2" value="2"></el-option>
          <el-option label="3" value="3"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="blocks">
        <el-input-number v-model="dBFrom.dBblocks" :min="3" :max="1000" controls-position="right"></el-input-number>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDBDialog" size="medium">取 消</el-button>
        <el-button type="primary" @click="postdB" size="medium">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script>
  import { getVersion, showDatabases, createDatabase, dropDatabase, showSuperTables, showTables, dropTable } from '../utils/taosrestful'
  export default {
    name: 'ContextMenu',
    props: {
      menuVisible: Boolean,
      type: String,
      db: Object,
    },
    data() {
      return {
        dBDialog: false,
        dBDialogTitle: '',
        dBFrom: {
          dBname: '',
          dBcomp: '',
          dBreplica: '',
          dBkeep: 0,
          dBupdate: false,
          dBquorum: '',
          dBblocks: '',
        },
      }
    },
    methods: {
      addDB() {
        this.dBDialog = true
        this.dBDialogTitle = '添加数据库'
      },
      editDb(dbInfo) {
        this.dBDialog = true
        this.dBDialogTitle = '编辑数据库'
        // console.log(dBFrom)
        this.dBFrom = {
          dBname: dbInfo.name,
          dBcomp: dbInfo.comp,
          dBreplica: dbInfo.replica,
          dBkeep: parseInt(dbInfo['keep0,keep1,keep(D)'].split(',')[0]),
          dBupdate: dbInfo.update,
          dBquorum: dbInfo.quorum,
          dBblocks: dbInfo.blocks,
        }
        console.log(this.dBFrom)
      },
      closeDBDialog() {
        this.dBDialog = false
        this.dBFrom = {
          dBname: '',
          dBcomp: '',
          dBreplica: '',
          dBkeep: '',
          dBupdate: false,
          dBquorum: '',
          dBblocks: '',
        }
      },
    },
  }
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

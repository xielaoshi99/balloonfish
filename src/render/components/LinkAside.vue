<template>
  <!-- 新建连接的弹窗 -->
  <el-dialog v-model="addLinkDialog" title="新建连接">
    <el-form :model="linkForm" class="linkformstyle" label-width="80px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="linkForm.name"></el-input>
      </el-form-item>
      <el-form-item label="主机" prop="host">
        <el-input v-model="linkForm.host"></el-input>
      </el-form-item>
      <el-form-item label="端口" prop="port">
        <el-input v-model="linkForm.port"></el-input>
      </el-form-item>
      <el-form-item label="用户名" prop="user">
        <el-input v-model="linkForm.user"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="linkForm.password"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="testLink" size="medium">测 试</el-button>
        <el-button @click="cancelAddLink" size="medium">取 消</el-button>
        <el-button type="primary" @click="confirmAddLink" size="medium"
          >确 定</el-button
        >
      </span>
    </template>
  </el-dialog>
  <!-- 右键菜单 -->
  <ContextMenu :menuVisible="menuVisible" :type="rightPanelType"></ContextMenu>
  <div v-loading="loadingLinks">
    <el-row>
      <el-button
        class="linkBtn"
        @click="addLinkDialog = true"
        size="small"
        type="primary"
        plain
        style="font-size: 14px"
        >新建连接</el-button
      >
    </el-row>
    <el-menu @open="freshDB" :unique-opened="false">
      <el-submenu
        :index="String(index)"
        :key="index"
        v-for="(link, index) in links"
      >
        <template #title>
          <span>{{ link.name }}</span>
          <el-tag type="success" size="mini" v-if="link.version">
            {{ link.version }}
          </el-tag>
          <div class="connection-opt-icons">
            <i
              title="刷新"
              class="connection-right-icon fa fa-refresh font-weight-bold"
              @click.stop.prevent="freshDB(index)"
            ></i>
            <i
              title="编辑连接"
              class="connection-right-icon fa fa-edit font-weight-bold"
              @click.stop.prevent="editLink(index)"
            ></i>
            <i
              title="删除连接"
              class="connection-right-icon fa fa-trash-o font-weight-bold"
              @click.stop.prevent="deleteLink()"
            ></i>
          </div>
        </template>
        <el-table
          class="customer-no-border-table"
          :data="link.dbs"
          style="width: 100%"
          @expand-change="
            (row, expandedRows) => {
              dbTableExpand(row, expandedRows, link);
            }
          "
          :cell-class-name="rowClass"
          :show-header="false"
          @row-contextmenu="
            (row, column, event) => {
              rightClick(row, column, event, 'db');
            }
          "
        >
          <el-table-column type="expand" width="40">
            <template #default="props">
              <STableTree
                :db="props.row"
                :link="link"
                @addTab="addTab"
                @tableChanged="tableChanged"
                @node-contextmenu="
                  (event, nodedata, node) => {
                    rightClick(node, nodedata, event, 'stable');
                  }
                "
              ></STableTree>
              <TableTree
                :db="props.row"
                :link="link"
                @addTab="addTab"
                @tableChanged="tableChanged"
                @node-contextmenu="
                  (event, nodedata, node) => {
                    rightClick(node, nodedata, event, 'table');
                  }
                "
              ></TableTree>
            </template>
          </el-table-column>
          <el-table-column>
            <template #default="props">
              <i class="fa fa-database"></i>
              {{ props.row.name }}
            </template>
          </el-table-column>
        </el-table>
      </el-submenu>
    </el-menu>
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
import { getLinks, AddALink, deleteALink } from "../utils/localDataStore";
import STableTree from "../components/STableTree.vue";
import TableTree from "../components/TableTree.vue";
import ContextMenu from "../components/ContextMenu.vue";
export default {
  name: "LinkAside",
  components: {
    STableTree,
    TableTree,
    ContextMenu,
  },
  props: {},
  // 定义抛出的事件名称
  emits: ["tableChanged", "addTab", "linkChanged"],

  data() {
    return {
      links: [],
      theLink: {}, //当前连接
      loadingLinks: false,
      addLinkDialog: false,
      linkForm: {
        name: "",
        host: "",
        port: "6041",
        user: "",
        password: "",
      },
      menuVisible: false,
      rightPanelType: "",
    };
  },
  mounted: function () {
    let links = getLinks();
    for (let i = 0, len = links.length; i < len; i++) {
      let payload = {
        ip: links[i].host,
        port: links[i].port,
        user: links[i].user,
        password: links[i].password,
      };
      getVersion(payload).then((data) => {
        links[i].version = data;
        this.$data.links = links;
      });
    }
  },
  methods: {
    cancelAddLink() {
      this.linkForm = {
        name: "",
        host: "",
        port: "6041",
        user: "",
        password: "",
      };
      this.addLinkDialog = false;
    },
    editLink(index) {
      this.linkForm = {
        name: this.links[index].name,
        host: this.links[index].host,
        port: this.links[index].port,
        user: this.links[index].user,
        password: this.links[index].password,
      };
      this.addLinkDialog = true;
    },
    testLink() {
      let payload = {
        ip: this.linkForm.host,
        port: this.linkForm.port,
        user: this.linkForm.user,
        password: this.linkForm.password,
      };
      showDatabases(payload).then((data) => {
        if (data.res) {
          this.$message({
            message: "连接成功",
            type: "success",
            duration: 1000,
          });
        } else {
          //连接失败
          this.$message({
            message: "连接失败",
            type: "error",
            duration: 1000,
          });
        }
      });
    },
    confirmAddLink() {
      //新建连接，先连接，如果成功，将payload+name记入本地
      let payload = {
        ip: this.linkForm.host,
        port: this.linkForm.port,
        user: this.linkForm.user,
        password: this.linkForm.password,
      };
      showDatabases(payload).then((data) => {
        //处理返回的数据库数据
        if (data.res) {
          getVersion(payload).then((_data) => {
            //连接成功，保存到本地
            AddALink({
              name: this.linkForm.name || this.linkForm.host,
              host: this.linkForm.host,
              port: this.linkForm.port,
              user: this.linkForm.user,
              password: this.linkForm.password,
              version: _data,
            });
            //关闭新建连接的弹窗
            this.addLinkDialog = false;
            //清空表单
            this.linkForm = {
              name: "",
              host: "",
              port: "",
              user: "",
              password: "",
            };
            //更新连接列表
            this.links = getLinks();
          });
        } else {
          //连接失败
          this.$message({
            message: "连接失败",
            type: "error",
            duration: 1000,
          });
        }
      });
    },
    freshDB(key) {
      let theLink = this.links[key];
      let payload = {
        ip: theLink.host,
        port: theLink.port,
        user: theLink.user,
        password: theLink.password,
      };
      this.$emit("linkChanged", payload);
      this.loadingLinks = true;
      showDatabases(payload).then((data) => {
        this.loadingLinks = false;
        if (data.res) {
          this.$message({
            message: "刷新成功",
            type: "success",
            duration: 1000,
          });
          this.links[key].dbs = data.data;
        } else {
          //连接失败，1.提示 2.删除当前连接 3.重新连接
          //1
          this.$message({
            message: data.msg,
            type: "error",
            duration: 1000,
          });
          //2
          deleteALink(key);
          this.links = getLinks();
          //3
          this.$message({
            message: "尝试重新连接",
            type: "warning",
            duration: 1000,
          });
          this.linkForm = {
            name: theLink.name,
            host: theLink.host,
            port: theLink.port,
            user: theLink.user,
            password: theLink.password,
          };
          this.addLinkDialog = true;
        }
      });
    },
    alartDB(link, dbName) {
      //切换数据库前先清空表
      this.dbInfo = this.makeDbInfo(link.dbs, dbName);
      this.surperTables = [];
      this.tables = [];
      //记录进入的数据库
      this.theLink = link;
      this.theDB = dbName;
      this.$emit("tableChanged", {}, "", this.dbInfo);
    },
    makeDbInfo(dbs, dbName) {
      let info = {};
      dbs.forEach((item) => {
        if (item["name"] == dbName) {
          info = item;
        }
      });
      return info;
    },
    dbTableExpand(row, expandedRows, link) {
      this.alartDB(link, row.name);
    },
    addTab(newTabTitle, table, type) {
      let icon;
      if (type == "STableView") {
        icon = "fa fa-sitemap";
      } else if (type == "TableView") {
        icon = "fa fa-table";
      }
      this.$emit("addTab", newTabTitle, table, type, icon);
    },
    tableChanged(table, type, db) {
      this.$emit("tableChanged", table, type, db);
    },
    deleteLink() {
      alert(111);
    },
    rowClass() {
      return "dbCol";
    },
    rightClick(row, column, event, type) {
      if (type != "db") {
        if (column.children) {
          return false;
        }
      }
      this.menuVisible = false; // 先把模态框关死，目的是 第二次或者第n次右键鼠标的时候 它默认的是true
      this.menuVisible = true; // 显示模态窗口，跳出自定义菜单栏
      event.preventDefault(); //关闭浏览器右键默认事件
      this.rightPanelType = type;
      var menu = document.querySelector(".menu1");
      this.styleMenu(menu);
    },
    foo() {
      // 取消鼠标监听事件 菜单栏
      this.menuVisible = false;
      document.removeEventListener("click", this.foo); // 关掉监听，
    },
    styleMenu(menu) {
      if (event.clientX > 1800) {
        menu.style.left = event.clientX - 100 + "px";
      } else {
        menu.style.left = event.clientX + 1 + "px";
      }
      document.addEventListener("click", this.foo); // 给整个document新增监听鼠标事件，点击任何位置执行foo方法
      if (event.clientY > 700) {
        menu.style.top = event.clientY - 30 + "px";
      } else {
        menu.style.top = event.clientY - 10 + "px";
      }
    },
  },
};
</script>
<style>
.dbCol .cell {
  padding: 0px !important;
}
.dbCol {
  padding: 3px !important;
}
.dbButtonGroup {
  font-size: 15px;
  height: 29px;
  line-height: 29px;
  padding-bottom: 5px;
}
.font-weight-bold {
  font-weight: bold;
}
.connection-right-icon {
  display: inline-block;
  font-size: 16px;
  /*font-weight: bold;*/
  padding: 3px;
  margin-right: 0px;
  transition: background 0.2s;
}
.connection-right-icon:hover {
  background: #dcdee0;
  border-radius: 3px;
}
.connection-opt-icons {
  position: absolute;
  right: 25px;
  top: -2px;
}
.el-submenu__icon-arrow {
  right: 10px !important;
}
</style>

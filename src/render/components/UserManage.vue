<template>
  <el-card class="box-card" style="margin-bottom: 20px">
    <template #header>
      <div class="card-header">
        <i class="fa fa-database"></i>
        <span>{{ ' 当前连接：' + link.name }}</span>
        <i class="fa fa-sitemap" style="margin-left: 20px"></i>
        <span>{{ ' 主机：' + link.host }}</span>
      </div>
    </template>
    <el-button type="success" size="mini" @click="addUser()">创建用户</el-button>
    <el-button type="danger" size="mini" @click="delUser()">删除用户</el-button>
    <el-table size="mini" :data="userData" border height="400" style="width: 100%; margin-top: 10px" @cell-click="editColumnData" @selection-change="handleSelectionChange">
      <el-table-column type="selection" :selectable="checkSelectable" width="55"></el-table-column>
      <el-table-column prop="name" label="登录名称"></el-table-column>
      <el-table-column prop="account" label="账户"></el-table-column>
      <el-table-column prop="privilege" label="权限"></el-table-column>
      <el-table-column prop="create_time" label="创建时间" width="180"></el-table-column>
      <el-table-column label="操作">
        <template v-slot="scope">
          <el-button type="text" size="mini" @click="editUser(scope.$index)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
  <el-dialog v-model="userDialog" :title="userDialogTitle" @close="closeUserDialog" width="35%">
    <el-form :model="userForm" class="userFormstyle" label-width="80px">
      <el-form-item label="登录名称" prop="account" size="mini">
        <el-input v-model="userForm.account"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password" size="mini">
        <el-input v-model="userForm.password"></el-input>
      </el-form-item>
      <el-form-item label="权限" prop="privilege" size="mini">
        <el-select v-model="userForm.privilege" placeholder="请选择权限" size="mini" style="width: 100%">
          <el-option v-for="item in privilegeO" :key="item" :label="item" :value="item"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelAddUser" size="medium">取 消</el-button>
        <el-button type="primary" @click="saveUser" size="medium">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
  import { getUsers, createUsers, alterUsers, delUsers } from '../utils/taosrestful'
  import { privilegeOption } from '../utils/funCommon'
  export default {
    name: 'UserManage',
    props: {
      table: Object, //这里的table，没啥卵用
      dbname: String, //数据库名，没啥卵用
      link: Object,
    },
    data() {
      return {
        userDialog: false,
        userDialogTitle: '创建用户',
        userForm: {
          account: '',
          password: '',
          privilege: '',
        },
        userData: [],
        privilegeO: [],
        selectedUsers: [],
      }
    },
    created() {
      this.privilegeO = privilegeOption
      getUsers(this.link).then((data) => {
        this.userData = data.data
      })
    },
    methods: {
      addUser() {
        this.userDialog = true
      },
      editUser(index) {
        if (this.userData[index].name == 'root' || this.userData[index].name == '_root' || this.userData[index].name == 'monitor') {
          this.$message('数据库自带用户不能编辑')
        } else {
          this.userDialogTitle = '编辑用户'
          this.userDialog = true
          this.userForm = {
            account: this.userData[index].name,
            password: '',
            privilege: this.userData[index].privilege,
          }
        }
      },
      delUser() {
        this.$confirm('此操作将永久删除所选用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(() => {
            for (let i = 0; i < this.selectedUsers.length; i++) {
              delUsers(this.selectedUsers[i].name, this.link).then((res) => {
                this.$message.success('所选用户删除成功！')
                getUsers(this.link).then((data) => {
                  this.userData = data.data
                })
              })
            }
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除',
            })
          })
      },
      handleSelectionChange(val) {
        this.selectedUsers = val
      },
      saveUser() {
        if (this.userDialogTitle == '创建用户') {
          if (this.userForm.account && this.userForm.password && this.userForm.privilege) {
            createUsers(this.userForm.account, this.userForm.password, this.userForm.privilege, this.link).then((res) => {
              if (res.res) {
                this.$message.success('用户添加成功！')
                this.userDialog = false
                getUsers(this.link).then((data) => {
                  this.userData = data.data
                })
              } else {
                this.$message({
                  message: res.msg,
                  type: 'error',
                  duration: 1000,
                })
              }
            })
          } else {
            this.$message.warning('请输入用户信息')
          }
        } else {
          if (this.userForm.account && this.userForm.password && this.userForm.privilege) {
            alterUsers(this.userForm.account, this.userForm.password, this.userForm.privilege, this.link).then((res) => {
              if (res.res) {
                this.$message.success('用户修改成功！')
                this.userDialog = false
                getUsers(this.link).then((data) => {
                  this.userData = data.data
                })
              } else {
                this.$message({
                  message: res.msg,
                  type: 'error',
                  duration: 1000,
                })
              }
            })
          } else {
            this.$message.warning('请输入用户信息')
          }
        }
      },
      cancelAddUser() {
        this.userDialog = false
        this.userDialogTitle == '创建用户'
      },
      closeUserDialog() {
        this.userForm = {
          account: '',
          password: '',
          privilege: '',
        }
      },
      checkSelectable(row, index) {
        if (row.name == 'root' || row.name == '_root' || row.name == 'monitor') {
          return false
        } else {
          return true
        }
      },
    },
  }
</script>

<style></style>

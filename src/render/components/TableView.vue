<template>
  <div>
    <!-- 超级表筛选 -->
    <el-dialog :close-on-click-modal="false" :before-close="cancelTableFilter" title="筛选条件" v-model="tableFilterDialog">
      <el-form :model="tableFilter" label-width="80px">
        <el-form-item label="数据项">
          <el-checkbox-group v-model="tableFilter.fields">
            <el-row class="checkboxGroup">
              <el-col v-for="label in tableLabelItems" :key="label" :span="8">
                <el-checkbox class="checkbox" :label="label">{{ label }}</el-checkbox>
              </el-col>
            </el-row>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="每页数目">
          <el-radio-group v-model="eachPageTable">
            <el-row class="checkboxGroup2">
              <el-radio :label="10">10</el-radio>
              <el-radio :label="15">15</el-radio>
              <el-radio :label="20">20</el-radio>
            </el-row>
          </el-radio-group>
        </el-form-item>
        <el-switch class="switchStyle" v-model="superTorder" active-value="ASC" inactive-value="DESC" active-text="时间正序" inactive-text="时间倒序"></el-switch>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelTableFilter" size="small">取消</el-button>
          <el-button @click="postTableFilter" size="small">设置</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 超级表数据 -->
    <el-row class="superTSearchRow">
      <el-col :span="2" class="dataPackerLabel">时间范围:</el-col>
      <el-col :span="10">
        <div class="datePickerWrapper">
          <el-date-picker
            @change="getTableData(false, true)"
            style="width: 100%"
            size="small"
            v-model="tableFilter.superDateRange"
            value-format="YYYY-MM-DD HH:mm:ss"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          ></el-date-picker>
        </div>
      </el-col>
      <el-col :span="4" class="freshDataBtn">
        <el-button @click="openTableFilterD" size="small" style="width: 100%" icon="el-icon-setting">筛选条件</el-button>
      </el-col>
      <el-col :span="4" class="freshDataBtn">
        <el-button @click="getTableData(false, false)" size="small" style="width: 100%" icon="el-icon-refresh">数据刷新</el-button>
      </el-col>
    </el-row>
    <el-row class="superTSearchRow">
      <el-col :span="5" class="dataPackerLabel">所属超级表：{{ table.stable_name }}</el-col>
      <el-col :span="2" class="dataPackerLabel">标签信息:</el-col>
      <el-col :span="17">
        <div class="card-panel" v-for="(item, index) in tableTags" :key="index">
          <label class="card-panel-key">
            <i class="el-icon-paperclip"></i>
            {{ index }}
          </label>
          <div class="card-panel-value">
            {{ item }}
          </div>
        </div>
      </el-col>
    </el-row>
    <el-table size="mini" :data="tableData" border max-height="400" style="width: 100%">
      <el-table-column fixed v-if="tableLabel[0]" :prop="tableLabel[0]" :label="tableLabel[0]" width="250"></el-table-column>
      <el-table-column v-for="(data, index) in tableLabel.slice(1)" :key="index" :prop="data" :label="data" width="180"></el-table-column>
    </el-table>
    <!-- 超级表分页 -->
    <div class="paginationWrapper">
      <el-pagination :hide-on-single-page="true" :current-page="currentPageTable" @current-change="paginationChange" :page-size="eachPageTable" layout="prev, pager, next" :total="totalTable"></el-pagination>
    </div>
  </div>
</template>

<script>
  import { selectData, getTableTag } from '../utils/taosrestful'
  export default {
    name: 'TableView',
    props: {
      table: Object,
      dbname: String,
      link: Object,
    },
    data() {
      return {
        tableData: [],
        tableLabel: [],
        tableLabelItems: [],
        tableTags: {},
        tableFilter: {
          fields: [],
          superDateRange: [],
          superTSearchText: '',
          superTSearchColumn: '',
        },
        superTorder: 'DESC',
        tableFilterDialog: false,
        superWhere: '',
        //分页相关
        eachPageTable: 10,
        currentPageTable: 1,
        totalTable: 0,
      }
    },
    emits: ['postMessage'],
    created() {
      this.getTableData(true)
      this.$emit('postMessage', '11111')
    },
    methods: {
      openTableFilterD() {
        this.tableFilterDialog = true
        this.superTableFilterCopy = JSON.parse(JSON.stringify(this.tableFilter))
      },
      cancelTableFilter() {
        this.$message({
          message: '取消操作',
          type: 'warning',
          duration: 1000,
        })
        this.tableFilterDialog = false
        this.tableFilter = this.superTableFilterCopy
      },
      paginationChange(page) {
        this.currentPageTable = page
        this.getTableData(false)
      },
      postTableFilter() {
        this.tableFilterDialog = false
        this.getTableData(false, true)
      },
      getTableData(isFirst, isResetPage) {
        //处理时间范围
        let startTime = null
        let endTime = null
        if (this.tableFilter.superDateRange) {
          startTime = this.tableFilter.superDateRange[0]
          endTime = this.tableFilter.superDateRange[1]
        }
        //是否需要重置分页
        if (isResetPage) {
          this.currentPageTable = 1
        }
        let offsetVal = (this.currentPageTable - 1) * this.eachPageTable
        if (this.table.table_name) {
          selectData(this.table.table_name, this.dbname, this.link, this.tableFilter.fields, this.superWhere, this.eachPageTable, offsetVal, this.superTorder, startTime, endTime).then((data) => {
            if (data.res) {
              let tableDescribe = data.describe
              let tableTagName = []
              for (let i = 0; i < tableDescribe.length; i++) {
                if (tableDescribe[i].Note == 'TAG') {
                  tableTagName.push(tableDescribe[i].Field)
                }
              }
              if (tableTagName.length != 0) {
                getTableTag(this.table.table_name, this.dbname, this.link, tableTagName).then((data) => {
                  this.tableTags = data.data[0]
                })
              }
              if (data.data.length != 0) {
                //有数据
                if (isFirst) {
                  this.tableLabelItems = Object.keys(data.data[0])
                  this.$message({
                    message: '获取成功',
                    type: 'success',
                    duration: 1000,
                  })
                }
                this.tableLabel = Object.keys(data.data[0])
                this.tableFilter.fields = Object.keys(data.data[0])
                this.tableData = data.data
                this.totalTable = data.count
              } else {
                this.$message({
                  message: '无数据',
                  type: 'warning',
                  duration: 1000,
                })
              }
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
    },
  }
</script>
<style scoped>
  .card-panel {
    color: #fff;
    text-align: center;
    height: 29px;
    display: inline-block;
    font-size: 14px;
    border: 1px solid #66b1ff;
    border-radius: 3px;
    margin-right: 10px;
  }
  .card-panel-key {
    display: inline-block;
    background: #66b1ff;
    height: 29px;
    line-height: 29px;
    padding-left: 10px;
    padding-right: 10px;
  }
  .card-panel-value {
    color: #606266;
    display: inline-block;
    height: 29px;
    line-height: 29px;
    padding-left: 10px;
    padding-right: 10px;
  }
</style>

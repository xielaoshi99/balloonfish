<template>
  <div>
    <!-- 超级表筛选 -->
    <el-dialog :close-on-click-modal="false" :before-close="cancelsuperTableFilter" title="筛选条件" v-model="superTableFilterDialog">
      <el-form :model="superTableFilter" label-width="80px">
        <el-form-item label="数据项">
          <el-checkbox-group v-model="superTableFilter.fields">
            <el-row class="checkboxGroup">
              <el-col v-for="label in this.superTableLabelItems" :key="label" :span="8">
                <el-checkbox class="checkbox" :label="label">{{ label }}</el-checkbox>
              </el-col>
            </el-row>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="每页数目">
          <el-radio-group v-model="eachPagesuperTable">
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
          <el-button @click="cancelsuperTableFilter" size="small">取消</el-button>
          <el-button @click="postsuperTableFilter" size="small">设置</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 超级表数据 -->
    <el-row class="superTSearchRow">
      <el-col :span="3" class="dataPackerLabel">时间范围:</el-col>
      <el-col :span="13">
        <div class="datePickerWrapper">
          <el-date-picker
            @change="getSTableData(false, true)"
            style="width: 100%"
            size="small"
            v-model="superTableFilter.superDateRange"
            value-format="YYYY-MM-DD HH:mm:ss"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          ></el-date-picker>
        </div>
      </el-col>
      <el-col :span="4" class="freshDataBtn">
        <el-button @click="opensuperTableFilterD" size="small" style="width: 100%" icon="el-icon-setting">筛选条件</el-button>
      </el-col>
      <el-col :span="4" class="freshDataBtn">
        <el-button @click="getSTableData(false, false)" size="small" style="width: 100%" icon="el-icon-refresh">数据刷新</el-button>
      </el-col>
    </el-row>
    <el-table size="mini" :data="superTableData" border max-height="585" style="width: 100%">
      <el-table-column fixed v-if="superTableLabel[0]" :prop="superTableLabel[0]" :label="superTableLabel[0]" width="200"></el-table-column>
      <el-table-column v-for="(data, index) in superTableLabel.slice(1)" :key="index" :prop="data" :label="data" width="180" :render-header="renderHeader"></el-table-column>
    </el-table>
    <!-- 超级表分页 -->
    <div class="paginationWrapper">
      <el-pagination :hide-on-single-page="true" :current-page="currentPagesuperTable" @current-change="paginationsuperChange" :page-size="eachPagesuperTable" layout="prev, pager, next" :total="totalsuperTable"></el-pagination>
    </div>
  </div>
</template>

<script>
  import { selectData } from '../utils/taosrestful'
  export default {
    name: 'STableView',
    props: {
      table: Object,
      dbname: String,
      link: Object,
    },
    data() {
      return {
        superTableData: [],
        tableTagName: [],
        superTableLabel: [],
        superTableLabelItems: [],
        superTableFilter: {
          fields: [],
          superDateRange: [],
          superTSearchText: '',
          superTSearchColumn: '',
        },
        superTorder: 'DESC',
        superTableFilterDialog: false,
        superWhere: '',
        //分页相关
        eachPagesuperTable: 10,
        currentPagesuperTable: 1,
        totalsuperTable: 0,
      }
    },
    created() {
      this.getSTableData(true, true)
    },
    methods: {
      opensuperTableFilterD() {
        this.superTableFilterDialog = true
        this.superTableFilterCopy = JSON.parse(JSON.stringify(this.superTableFilter))
      },
      cancelsuperTableFilter() {
        this.$message({
          message: '取消操作',
          type: 'warning',
          duration: 1000,
        })
        this.superTableFilterDialog = false
        this.superTableFilter = this.superTableFilterCopy
      },
      paginationsuperChange(page) {
        this.currentPagesuperTable = page
        this.getSTableData(false)
      },
      postsuperTableFilter() {
        this.superTableFilterDialog = false
        this.getSTableData(false, true)
      },
      getSTableData(isFirst, isResetPage) {
        //处理时间范围
        let startTime = null
        let endTime = null
        if (this.superTableFilter.superDateRange) {
          startTime = this.superTableFilter.superDateRange[0]
          endTime = this.superTableFilter.superDateRange[1]
        }
        //是否需要重置分页
        if (isResetPage) {
          this.currentPagesuperTable = 1
        }
        let offsetVal = (this.currentPagesuperTable - 1) * this.eachPagesuperTable
        if (this.table) {
          selectData(this.table.name, this.dbname, this.link, this.superTableFilter.fields, this.superWhere, this.eachPagesuperTable, offsetVal, this.superTorder, startTime, endTime).then((data) => {
            if (data.res) {
              let tableDescribe = data.describe
              for (let i = 0; i < tableDescribe.length; i++) {
                if (tableDescribe[i].Note == 'TAG') {
                  this.tableTagName.push(tableDescribe[i].Field)
                }
              }
              //成功
              if (data.data.length != 0) {
                //有数据
                if (isFirst) {
                  this.superTableLabelItems = Object.keys(data.data[0])
                  this.$message({
                    message: '获取成功',
                    type: 'success',
                    duration: 1000,
                  })
                }
                this.superTableLabel = Object.keys(data.data[0])
                this.superTableFilter.fields = Object.keys(data.data[0])
                this.superTableData = data.data
                this.totalsuperTable = data.count
              } else {
                this.$message({
                  message: '无数据',
                  type: 'warning',
                  duration: 1000,
                })
              }
            } else {
              if (data.msg == 'Result set too large to be sorted') {
                this.$confirm('数据量过大，由于TDengine限制只能进行时间正向排序，是否切换为时间正向排序？', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning',
                })
                  .then(() => {
                    this.superTorder = 'ASC'
                    this.getSTableData(false, true)
                  })
                  .catch(() => {})
              } else {
                this.$message({
                  message: data.msg,
                  type: 'error',
                  duration: 1000,
                })
              }
            }
          })
        }
      },
      renderHeader(h) {
        if (this.tableTagName.includes(h.column.label)) {
          return '(TAG) ' + h.column.label
        } else {
          return h.column.label
        }
      },
    },
  }
</script>

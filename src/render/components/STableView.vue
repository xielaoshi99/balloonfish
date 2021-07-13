<template>
  <div>
    <!-- 超级表筛选 -->
    <el-dialog
      :close-on-click-modal="false"
      :before-close="cancelSurperTableFilter"
      title="筛选条件"
      v-model="surperTableFilterDialog"
    >
      <el-form :model="surperTableFilter" label-width="80px">
        <el-form-item label="数据项">
          <el-checkbox-group v-model="surperTableFilter.fields">
            <el-row class="checkboxGroup">
              <el-col
                v-for="label in this.surperTableLabelItems"
                :key="label"
                :span="8"
              >
                <el-checkbox class="checkbox" :label="label">{{
                  label
                }}</el-checkbox>
              </el-col>
            </el-row>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="每页数目">
          <el-radio-group v-model="eachPageSurperTable">
            <el-row class="checkboxGroup2">
              <el-radio :label="10">10</el-radio>
              <el-radio :label="15">15</el-radio>
              <el-radio :label="20">20</el-radio>
            </el-row>
          </el-radio-group>
        </el-form-item>
        <el-switch
          class="switchStyle"
          v-model="surperTorder"
          active-value="ASC"
          inactive-value="DESC"
          active-text="时间正序"
          inactive-text="时间倒序"
        ></el-switch>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelSurperTableFilter" size="small"
            >取消</el-button
          >
          <el-button @click="postSurperTableFilter" size="small"
            >设置</el-button
          >
        </span>
      </template>
    </el-dialog>
    <!-- 超级表数据 -->
    <el-row class="surperTSearchRow">
      <el-col :span="3" class="dataPackerLabel">时间范围:</el-col>
      <el-col :span="13">
        <div class="datePickerWrapper">
          <el-date-picker
            @change="getSTableData(false, true)"
            style="width: 100%"
            size="small"
            v-model="surperTableFilter.surperDateRange"
            value-format="YYYY-MM-DD HH:mm:ss"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            align="right"
          ></el-date-picker>
        </div>
      </el-col>
      <el-col :span="4" class="freshDataBtn">
        <el-button
          @click="openSurperTableFilterD"
          size="small"
          style="width: 100%"
          icon="el-icon-setting"
          >筛选条件</el-button
        >
      </el-col>
      <el-col :span="4" class="freshDataBtn">
        <el-button
          @click="getSTableData(false, false)"
          size="small"
          style="width: 100%"
          icon="el-icon-refresh"
          >数据刷新</el-button
        >
      </el-col>
    </el-row>
    <el-table
      size="mini"
      :data="surperTableData"
      border
      max-height="585"
      style="width: 100%"
    >
      <el-table-column
        fixed
        v-if="surperTableLabel[0]"
        :prop="surperTableLabel[0]"
        :label="surperTableLabel[0]"
        width="250"
      ></el-table-column>
      <el-table-column
        v-for="(data, index) in surperTableLabel.slice(1)"
        :key="index"
        :prop="data"
        :label="data"
        width="180"
      ></el-table-column>
    </el-table>
    <!-- 超级表分页 -->
    <div class="paginationWrapper">
      <el-pagination
        :hide-on-single-page="true"
        :current-page="currentPageSurperTable"
        @current-change="paginationSurperChange"
        :page-size="eachPageSurperTable"
        layout="prev, pager, next"
        :total="totalSurperTable"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
import { selectData } from "../utils/taosrestful";
import { getLinks, AddALink, deleteALink } from "../utils/localDataStore";
export default {
  name: "STableView",
  props: {
    tablename: String,
    dbname: String,
    link: Object,
  },
  data() {
    return {
      surperTableData: [],
      surperTableLabel: [],
      surperTableLabelItems: [],
      surperTableFilter: {
        fields: [],
        surperDateRange: [],
        surperTSearchText: "",
        surperTSearchColumn: "",
      },
      surperTorder: "DESC",
      surperTableFilterDialog: false,
      surperWhere: "",
      //分页相关
      eachPageSurperTable: 10,
      currentPageSurperTable: 1,
      totalSurperTable: 0,
    };
  },
  created() {
    this.getSTableData(true);
  },
  methods: {
    openSurperTableFilterD() {
      this.surperTableFilterDialog = true;
      this.surperTableFilterCopy = JSON.parse(
        JSON.stringify(this.surperTableFilter)
      );
    },
    cancelSurperTableFilter() {
      this.$message({
        message: "取消操作",
        type: "warning",
        duration: 1000,
      });
      this.surperTableFilterDialog = false;
      this.surperTableFilter = this.surperTableFilterCopy;
    },
    paginationSurperChange(page) {
      this.currentPageSurperTable = page;
      this.getSTableData(false);
    },
    postSurperTableFilter() {
      this.surperTableFilterDialog = false;
      this.getSTableData(false, true);
    },
    getSTableData(isFirst, isResetPage) {
      //处理时间范围
      let startTime = null;
      let endTime = null;
      if (this.surperTableFilter.surperDateRange) {
        startTime = this.surperTableFilter.surperDateRange[0];
        endTime = this.surperTableFilter.surperDateRange[1];
      }
      //是否需要重置分页
      if (isResetPage) {
        this.currentPageSurperTable = 1;
      }
      let offsetVal =
        (this.currentPageSurperTable - 1) * this.eachPageSurperTable;
      if (this.tablename) {
        selectData(
          this.tablename,
          this.dbname,
          this.link,
          this.surperTableFilter.fields,
          this.surperWhere,
          this.eachPageSurperTable,
          offsetVal,
          this.surperTorder,
          startTime,
          endTime
        ).then((data) => {
          if (data.res) {
            //成功
            if (data.data.length != 0) {
              //有数据
              if (isFirst) {
                this.surperTableLabelItems = Object.keys(data.data[0]);
                this.$message({
                  message: "获取成功",
                  type: "success",
                  duration: 1000,
                });
              }
              this.surperTableLabel = Object.keys(data.data[0]);
              this.surperTableFilter.fields = Object.keys(data.data[0]);
              this.surperTableData = data.data;
              this.totalSurperTable = data.count;
            } else {
              this.$message({
                message: "无数据",
                type: "warning",
                duration: 1000,
              });
            }
          } else {
            this.$message({
              message: data.msg,
              type: "error",
              duration: 1000,
            });
          }
        });
      }
    },
  },
};
</script>

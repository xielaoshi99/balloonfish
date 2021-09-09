import { createApp } from "vue";
import App from "./App.vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./index.css";
import "font-awesome/css/font-awesome.css";
import "xe-utils";
import VXETable from "vxe-table";
import "vxe-table/lib/style.css";
import zhCn from "element-plus/es/locale/lang/zh-cn";

const app = createApp(App);
app.use(VXETable).use(ElementPlus, {
  locale: zhCn,
});
app.mount("#app").$nextTick(window.removeLoading);
console.log("fs", window.fs);
console.log("ipcRenderer", window.ipcRenderer);

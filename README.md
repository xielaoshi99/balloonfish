# balloonfish(河豚)

<div align="center">
<img src="https://www.hualigs.cn/image/60eff6950916d.jpg"/>
</div>
<br/>
<div align="center">
🚀一款基于electron+vue3+vite2.0的TDengine时序库可视化管理工具🚀
</div>
<br/>

从2019年年底接触[TDengine](https://github.com/taosdata/TDengine)，就产生了为其开发一款可视化管理工具的想法，可惜要么工作忙要么发懒，一直没有着手去做，直到今年3月份看到了一个名为[TDengineGUI](https://github.com/skye0207/TDengineGUI)的项目，深受启发，并打算使用vue3重构一版，然后就又碰上了公司里大项目、建党100周年活动等等..... 总之又鸽了几个月。现在终于写出个模样来了。

## 感谢

首先感谢[@skye0207](https://github.com/skye0207)的[TDengineGUI](https://github.com/skye0207/TDengineGUI)项目！本项目的灵感来源就是他！并且采用了其封装的工具类和数据分页展示的代码

然后要感谢[@qishibo](https://github.com/qishibo)的[AnotherRedisDesktopManager](https://github.com/qishibo/AnotherRedisDesktopManager)项目，为本项目提供了UI的思路

最后要感谢[@caoxiemeihao](https://github.com/caoxiemeihao)的[electron-vue-vite](https://github.com/caoxiemeihao/electron-vue-vite)项目，可以方便的把vite打包到electron中

## how to run and build

### 安装依赖

```
npm install
```

### 运行

```
npm start
```

### 编译打包

```
npm run build:vue  //编译网页版
npm run build:ele  //编译桌面版
npm run build  //同时编译网页版和桌面版
```

网页版编译后位于 `dist` 文件夹，需要挂服务才能运行，桌面版编译后位于 `release` 文件夹

注意：编译桌面版时，第一次需要FQ下载依赖！

## 当前版本功能

* 通过restful接口连接到数据库，基本不受服务端版本升级影响
* 数据库添加、删除操作
* 超级表和表的分页查询，把表的TAG和超级表的TAG列标识出来，可以按时间段检索、字段过滤、排序
* 采用多标签页形式，并把超级表和表分别整理成树（超级表-表的树形结构不打算做了，因为有的表不是以超级表为模板创建的）
* 充分利用vue组件化的特点，把不同模块封装成不同组件，易于维护

## 运行截图

![](https://www.hualigs.cn/image/60eff5e0df554.jpg)
![](https://www.hualigs.cn/image/60eff5e140e76.jpg)
![](https://www.hualigs.cn/image/60eff5e15aa97.jpg)
![](https://www.hualigs.cn/image/60f2963363461.jpg)

## TODO List

* 数据库编辑（如果官方支持）
* 用户管理
* 超级表的新建、编辑和删除、标签字段管理
* 表的新建、编辑和删除（两种方式）、标签管理
* 数据库、表、超级表的信息展示
* 服务端状态检测，例如CPU、内存、硬盘占用等等（依据log库）
* 自定义SQL查询（数据量过大时报警并增加limit）
* 图表展示数据趋势，并显示数据统计量（求和，平均，方差等）
* 修改连接配置信息功能
* 连接配置信息导出导入功能
* 基础属性配置功能（连接超时时间、默认每页大小等）

## BUG

数据量大的情况下，时间倒序会报错（TDengine的锅！！）
当表的量很大时会卡顿，而且eltree的高度会变得很长，日后将优化

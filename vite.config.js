const path = require('path')

module.exports = {
  alias: {
    '/@/': path.resolve(__dirname, './src'),
  },
  hostname: 'localhost', // 默认是 localhost
  port: '1999', // 默认是 3000 端口
  open: true, // 浏览器自动打开
  https: false, // 是否开启 https
  ssr: false, // 服务端渲染
  base: './', // 生产环境下的公共路径
  outDir: 'dist', // 打包构建输出路径，默认 dist ，如果路径存在，构建之前会被删除
}

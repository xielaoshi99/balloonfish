/**
 * electron 主文件
 */
import { join } from 'path'
import { app, BrowserWindow, shell, Menu } from 'electron'
import dotenv from 'dotenv'

dotenv.config({ path: join(__dirname, '../../.env') })

let win: BrowserWindow

function createWin() {
  // 创建浏览器窗口
  win = new BrowserWindow({
    width: 1200,
    height: 735,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: join(__dirname, '../preload/index.js'),
    },
  })
  win.webContents.openDevTools()
  //Menu.setApplicationMenu(null) //隐藏菜单栏
  const URL = app.isPackaged
    ? `file://${join(__dirname, '../render/index.html')}` // vite 构建后的静态文件地址
    : `http://localhost:${process.env.PORT}` // vite 启动的服务器地址

  win?.loadURL(URL)
}

app.whenReady().then(createWin)

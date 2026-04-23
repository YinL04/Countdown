# Beautiful Countdown App

A modern, elegant, multi-record countdown desktop application built with Electron.

> [**中文说明 (Chinese Documentation)**](#-中文说明)

## ✨ Features

- **Dashboard Layout:** Beautifully arranged grid to track multiple events simultaneously.
- **Glassmorphism UI:** Stunning frosted glass card effects with dynamic gradient starfield backgrounds.
- **Persistent Data:** Active countdowns are securely saved locally so you never lose track of your critical dates.
- **Seamless Desktop Experience:** Deployed as a standalone `.exe` utilizing Electron.
- **Real-Time Accuracy:** Calculates precisely down to the second with smooth transition animations.

## 🚀 How to Run Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Quick Start
1. Clone the repository:
   ```bash
   git clone https://github.com/YinL04/Countdown.git
   ```
2. Navigate into the application directory:
   ```bash
   cd Countdown
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Launch the app in development mode:
   ```bash
   npm start
   ```

### 📦 Building the Executable (Windows)

To generate a standalone `.exe` file tailored for Windows, ensure your terminal has Administrator privileges (to allow `electron-builder` to link files), then run:
```bash
npm run build
```
The compiled executable will be located inside the `dist/win-unpacked/` folder.

## 🛠️ Technology Stack
- **Electron**: Desktop Framework Wrapper
- **HTML / CSS / JavaScript**: Core UI & Logic

---

# 🇨🇳 中文说明

一个基于 Electron 架构的现代化、优雅的多记录桌面倒计时程序。

## 🌟 v2.1 新版特性 (最新)
- **历史时间追踪引擎**：应用现在不仅是一个倒数器，同时也是一个强悍的时间记录仪！全面放开了对未来时间的限制，您可以自由输入任何过去的日期（例如您的生日或入职纪念日）。一旦时间越过终点，系统将全自动转换为“正向秒表”，在满格进度条的加持下精确记录该事件已经过去了多少天、多少小时。
- **致敬经典的 Win98 皮肤**：多重主题引擎再度扩张，新增纯手工代码复原的 `🪟 Windows 98` 主题。经典的 #c0c0c0 灰色硬背景、深蓝色拖拽标题栏与复古凹凸立体边框，为您带来极其硬核的年代操作体验。

## ✨ v2.0 历史特性
- **自定义多主题引擎**：引入了全新的主题选择！您可以在“🌌现代科幻(默认)”、“🏢商务纯白(正式)”、“📱拟物复古(iOS 6 经典)”三种视觉风格中一键无缝切换，彻底打破视觉疲劳。
- **独立智能日历系统**：在顶部菜单栏新增了“📅日历”入口，打开后将显示完整的当月日历。倒计时事件会自动化作“小红点”标记在日历网格上，点击任意日期即可直接查看当天的事件时刻表！
- **事件无缝编辑功能**：卡片除了删除，现在全面支持“二次编辑 (✏️)”了！您可以直接在旧任务上修改名称和时间，修改后倒计时会自动平滑接管，不丢失任何信息。

## ✨ 基础功能亮点

- **控制面板布局**：以美观的网格方式同时追踪您的多项事件进程。
- **毛玻璃 (Glassmorphism) UI**：令人惊艳的玻璃拟物化卡片，搭配动态星空渐变背景特效。
- **本地数据持久化**：进行中的倒计时将安全地保存在本地缓存中，重启不丢失。
- **完美桌面体验**：借助 Electron 封装为独立的 `.exe` 应用。
- **毫秒级精准追踪**：精确运算倒数至每分每秒，配合丝滑流畅的跳动动画效果。

## 🚀 如何在本地运行

### 前置准备
请确保您的电脑已安装 [Node.js](https://nodejs.org/)。

### 快速启动
1. 克隆代码库：
   ```bash
   git clone https://github.com/YinL04/Countdown.git
   ```
2. 进入应用目录：
   ```bash
   cd Countdown
   ```
3. 安装依赖包：
   ```bash
   npm install
   ```
4. 启动应用开发模式：
   ```bash
   npm start
   ```

### 📦 构建可执行文件 (Windows)

若要生成 Windows 独立 `.exe` 文件，请确保使用**管理员身份**运行终端（让 `electron-builder` 拥有创建软链接的权限），然后执行：
```bash
npm run build
```
编译完成的可执行文件将位于 `dist/win-unpacked/` 目录。

## 🛠️ 技术栈
- **Electron**: 桌面框架封装底座
- **HTML / CSS / JavaScript**: UI 层构建

## 📄 License / 开源协议

This project is licensed under the [MIT License](LICENSE).

本项目基于 MIT 协议开源，**您可以自由地学习、修改，并允许进行任何形式的免费或商业使用。**

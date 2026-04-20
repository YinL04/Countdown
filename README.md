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

## ✨ 功能亮点

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
